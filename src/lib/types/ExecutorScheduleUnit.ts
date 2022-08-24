import { ParsedUrlQuery } from "querystring";
import { Task } from "./Task";
import { Request } from "koa";

export interface ExecutorScheduleUnit { 
    task: Task, 
    body: Request["body"], 
    query: ParsedUrlQuery 
}