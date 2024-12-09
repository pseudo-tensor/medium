// prisma imports (client and accelerate)
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// hono
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// jwt
import { jwt, sign } from "hono/jwt";

// router declaration with type setting for jwt and env variables
const userRouter = new Hono<{
  Bindings: {
    JWT_SECRET: string;
    DATABASE_URL: string;
  };
}>();

/**
 * /signup (post)
 */
userRouter.post("/signup", async (c) => {
  try {
    // database connection using prisma accelerate
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log("db connection was successfully established");

    const users = await c.req.json();
    console.log(users);
    const searchResult = await prisma.user.findUnique({
      where: {
        email: users.email,
      },
    });

    // check userAlreadyExists of returned body first before processing jwt
    if (searchResult != null) {
      return c.json({
        userAlreadyExists: true,
      });
    } else {
      // user creation in db
      const dbResult = await prisma.user.create({
        data: {
          email: users.email,
          password: users.password,
        },
      });

      console.log(dbResult);
      console.log("user data was pushed to db");

      const payload = {
        id: dbResult.id,
      };

      // jwt token creation
      const token = await sign(payload, c.env.JWT_SECRET);
      console.log("token was generated successfully");

      // returning jwt here
      return c.json({
        userAlreadyExists: false,
        jwt: token,
      });
    }
  } catch (e) {
    throw new HTTPException(500, {
      message: "Internal Error in Signup Route",
      cause: e,
    });
  }
});

/**
 * /signin (post)
 */
userRouter.post("/signin", async (c) => {
  try {
    // database connection using prisma accelerate
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log("db connection was successfully established");

    // user search in db
    const users = await c.req.json();
    console.log(users);
    const searchResult = await prisma.user.findUnique({
      where: {
        email: users.email,
        password: users.password,
      },
    });

    // check userAlreadyExists of returned body first before processing jwt
    if (searchResult == null) {
      return c.json({
        userAlreadyExists: false,
      });
    } else {
      // user creation in db

      const payload = {
        id: searchResult.id,
      };

      // jwt token creation
      const token = await sign(payload, c.env.JWT_SECRET);
      console.log("token was generated successfully");

      // returning jwt here
      return c.json({
        userAlreadyExists: true,
        jwt: token,
      });
    }
  } catch (e) {
    throw new HTTPException(500, {
      message: "Internal Error in Signin Route",
      cause: e,
    });
  }
});

// jwt verification only for making changes to account
userRouter.use("/profile", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

/**
 * insert logic for changing account name here
 */
userRouter.put("/profile", (c) => {
  return c.json({
    msg: "kys from account update section",
  });
});

export default userRouter;
