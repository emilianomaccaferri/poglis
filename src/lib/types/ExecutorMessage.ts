import { ExecutorScheduleUnit } from "./ExecutorScheduleUnit";
import { Task } from "./Task";

export interface ExecutorMessage {
    type: 'task',
    value?: ExecutorScheduleUnit
}