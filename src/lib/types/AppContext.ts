import Executor from "../executor";

export interface AppContext {
    executor: Executor,
    counter: number
}