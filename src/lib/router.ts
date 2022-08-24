import Koa from 'koa'
import Router from '@koa/router'
import body from 'koa-bodyparser'
import { readdirSync, readFileSync } from 'fs-extra';
import yaml from 'yaml'
import { validConf } from './types/HookConfig';
import { AppContext } from './types/AppContext';
import Executor from './executor';
import { buildRoute } from './utils';
import { resolve } from 'path';

const app = new Koa<Koa.DefaultState, AppContext>();
const router = new Router();
const hooks = readdirSync(`${__dirname}/../../hooks`);

Executor.init(Number.parseInt(process.env.WORKERS!));
app.use(body());
app.context["executor"] = Executor.getInstance();
console.log(`executor registered with ${process.env.WORKERS} workers`);

hooks.forEach(async hook => {
    
    const file = readFileSync(resolve(__dirname, `../../hooks/${hook}/config.yml`), 'binary');
    const parsed_yaml = yaml.parse(file);
    if(!validConf(parsed_yaml)) throw new Error(`invalid config for hook "${hook}"`);

    const route = parsed_yaml.route || `/${hook}`;
    const name = parsed_yaml.name || route;
    console.log(`- registering hook: ${parsed_yaml.method.toUpperCase()} - ${route} ${ parsed_yaml.name ? `(${parsed_yaml.name})` : '' }`)

    await buildRoute(router, parsed_yaml.method, route, {
        name,
        scripts: parsed_yaml.task.map(task => resolve(__dirname, `../../hooks/${hook}/${task}`))
    }, parsed_yaml.middlewares);

})

app
    .use(router.routes())
    .use(router.allowedMethods())


export default app;