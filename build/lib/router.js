"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const fs_extra_1 = require("fs-extra");
const yaml_1 = __importDefault(require("yaml"));
const hook_conf_1 = require("./types/hook_conf");
const app = new koa_1.default();
const router = new router_1.default();
const config_files = (0, fs_extra_1.readdirSync)(`${__dirname}/../../hooks/conf`);
app.use((0, koa_bodyparser_1.default)());
config_files.forEach(filename => {
    const file = (0, fs_extra_1.readFileSync)(`${__dirname}/../../hooks/conf/${filename}`, 'binary');
    const parsed_yaml = yaml_1.default.parse(file);
    if (!(0, hook_conf_1.validConf)(parsed_yaml))
        throw new Error(`invalid hook config: ${filename}`);
});
exports.default = app;
