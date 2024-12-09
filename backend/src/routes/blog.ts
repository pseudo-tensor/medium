// prisma imports (client and accelerate)
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { jwt } from "hono/jwt";

// router declaration with types
const blogRouter = new Hono<{
  Bindings: {
    JWT_SECRET: string;
    DATABASE_URL: string;
  };
}>();

blogRouter.use("/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

/**
 * /blog create(post)
 */
blogRouter.post("/blog", async (c) => {
  try {
    // database connection using prisma accelerate
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log("db connection was successfully established");

    const blogPost = await c.req.json();
    const dbResult = await prisma.post.create({
      data: {
        title: blogPost.title,
        content: blogPost.content,
        authorId: blogPost.userId,
      },
    });

    return c.json({
      id: dbResult.id,
    });
  } catch (e) {
    throw new HTTPException(500, {
      message: "Internal Error occured while creating new blog",
      cause: e,
    });
  }
});

/**
 * /blog update(put)
 */
blogRouter.put("/blog", async (c) => {
  try {
    // database connection using prisma accelerate
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log("db connection was successfully established");

    const blogPost = await c.req.json();
    const updateBlog = await prisma.post.update({
      where: {
        id: blogPost.id,
        authorId: blogPost.userId,
      },
      data: {
        title: blogPost.title,
        content: blogPost.content,
      },
    });

    return c.json({
      id: updateBlog.id,
    });
  } catch (e) {
    throw new HTTPException(500, {
      message: "Internal Error occurred while updating blog",
      cause: e,
    });
  }
});

/**
 * /:id fetch blog by id(get)
 *
 */
blogRouter.get("/:id", async (c) => {
  try {
    // database connection using prisma accelerate
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log("db connection was successfully established");

    const id = c.req.param("id");
    const findResult = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    return c.json({
      findResult,
    });
  } catch (e) {
    throw new HTTPException(500, {
      message: "Internal Error occured while searching for the blog",
      cause: e,
    });
  }
});

/**
 * add logic to set blog as published here
 */
blogRouter.put("/publish", (c) => {
  return c.json({
    msg: "blog was published",
  });
});

export default blogRouter;
