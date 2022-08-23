import Router from "@koa/router"
import app from './router'
import { Methods } from "./types/hook_conf"

export const buildRoute = (router: Router, method: Methods, path: string, name?: string) => {

    router.register(path, [method], async ctx => {

        app.context["counter"]++;

        app.context.executor.addJob({
            name: `panglerio-${app.context["counter"]}`
        });
        return ctx.body = {
            success: true,
            message: `task ${name ? `"${name}" `: ''}scheduled`
        }

    });

}