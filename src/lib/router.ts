import Koa from 'koa'
import Router from '@koa/router'
import body from 'koa-bodyparser'
import { readdirSync, readFileSync } from 'fs-extra';
import yaml from 'yaml'
import { validConf } from './types/hook_conf';
import { AppContext } from './types/AppContext';
import Executor from './executor';
import { buildRoute } from './utils';

const app = new Koa<Koa.DefaultState, AppContext>();
const router = new Router();
const config_files = readdirSync(`${__dirname}/../../hooks/conf`);
Executor.init(2);

app.use(body());
app.context["executor"] = Executor.getInstance();
app.context["counter"] = 0;

config_files.forEach(filename => {

    const file = readFileSync(`${__dirname}/../../hooks/conf/${filename}`, 'binary');
    const parsed_yaml = yaml.parse(file);
    if(!validConf(parsed_yaml)) throw new Error(`invalid hook config: ${filename}`);

    buildRoute(router, parsed_yaml.method, parsed_yaml.route, parsed_yaml.name);

})

app
    .use(router.routes())
    .use(router.allowedMethods())


export default app;