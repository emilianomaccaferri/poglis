import { Task } from "./Task";

export interface ExecutorMessage {
    type: 'task',
    value?: Task
}