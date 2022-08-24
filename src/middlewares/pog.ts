import { Context, Next } from "koa";

export default async(ctx: Context, next: Next) => {
    console.log("ciao!");
    await next();
}