import { ParsedUrlQuery } from "querystring";
import { Task } from "./Task";
import { DefaultState, Request } from "koa";

export interface ExecutorScheduleUnit { 
    task: Task, 
    body: Request["body"], 
    query: ParsedUrlQuery,
    state: DefaultState 
}