// src/middleware/before.ts
import { Context, Next } from "koa"
import { verify } from 'jsonwebtoken';

export default async (ctx: Context, next: Next) => {

    const token = ctx.request.header.authorization;
    if (!token) {
        ctx.status = 403;
        return ctx.body = {
            success: false,
            error: 'forbidden'
        };
    }
    try {
        await verifyJWT(token);
        return next();
    } catch (err) {
        ctx.status = 500;
        return ctx.body = {
            success: false,
            error: 'cannot verify jwt'
        };
    }

}

const verifyJWT = (token: string): Promise<any> => {

    return new Promise(
        (res, rej) => {
            verify(token, process.env.JWT_KEY!, (err, data) => {

                if (err) return rej(err);
                return res(data);

            })
        }
    )

}