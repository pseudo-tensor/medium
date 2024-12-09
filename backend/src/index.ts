import { Hono } from "hono";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";

const app = new Hono().basePath("/api/v1");

app.route("/", userRouter);
/**
 * /api/v1/signup (post)
 * /api/v1/signin (post)
 */

app.route("/", blogRouter);
/**
 * /api/v1/blog (post)
 * /api/v1/blog (put)
 * /api/v1/:id (get)
 */
export default app;
