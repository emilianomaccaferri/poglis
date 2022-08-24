import Router from "@koa/router"
import { Methods } from "./types/HookConfig"
import { Task } from "./types/Task";

export const checkEnv = () => {

    if(!process.env.PORT) throw new Error('port is not specified');
    if(!process.env.WORKERS) throw new Error('workers number is not specified');

}

export const buildRoute = (router: Router, method: Methods, path: string, task: Task) => {

    router.register(path, [method], async ctx => {

        ctx.app.context.executor.addJob({ task, body: ctx.request.body, query: ctx.request.query });
        return ctx.body = {
            success: true,
            message: `task ${ task.name } scheduled`
        }

    });

}