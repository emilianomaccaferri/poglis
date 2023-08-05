import Router from "@koa/router"
import { Context } from "koa";
import { resolve } from "path";
import Executor from "./executor";
import { Methods } from "./types/HookConfig"
import { Task } from "./types/Task";

export const checkEnv = () => {

    if (!process.env.PORT) throw new Error('port is not specified');
    if (!process.env.WORKERS) throw new Error('workers number is not specified');

}

export const buildRoute = async (
    router: Router,
    method: Methods,
    path: string,
    task: Task,
    middlewares_array?: string[],
    on_error_task?: Task
) => {

    const middlewares = (await Promise.all((middlewares_array || []).map(middleware => import(
        resolve(__dirname, `../middlewares/${middleware}`)
    )))).map(item => item.default);

    middlewares.forEach(middleware => {
        router.use(path, middleware);
    })

    router.register(path, [method], async (ctx: Context) => {

        (ctx.app.context.executor as Executor)
            .addJob({ task, body: ctx.request.body, query: ctx.request.query, state: ctx.state, onError: on_error_task });
        return ctx.body = {
            success: true,
            message: `task ${task.name} scheduled`
        }

    });

}