import Koa from 'koa'
import Router from '@koa/router'
import body from 'koa-bodyparser'
import { readdirSync, readFileSync } from 'fs-extra';
import yaml from 'yaml'
import { validConf } from './types/hook_conf';

const app = new Koa();
const router = new Router();
const config_files = readdirSync(`${__dirname}/../../hooks/conf`);

app.use(body());
config_files.forEach(filename => {
    const file = readFileSync(`${__dirname}/../../hooks/conf/${filename}`, 'binary');
    const parsed_yaml = yaml.parse(file);
    if(!validConf(parsed_yaml)) throw new Error(`invalid hook config: ${filename}`);
})

export default app;