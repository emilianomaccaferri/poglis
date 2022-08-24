import { createWriteStream } from "fs";
import { Worker } from "worker_threads";
import { ExecutorScheduleUnit } from "./types/ExecutorScheduleUnit";
import { UnitMessage } from "./types/UnitMessage";

export default class Executor {

    private queue: Array<ExecutorScheduleUnit> = new Array<ExecutorScheduleUnit>();
    private logger = createWriteStream(`./logs/workers.log`, { flags: 'a' })
    private workers: Array<Worker> = new Array<Worker>();
    private max_workers: number = 2;
    private static enabled = false;
    private static instance: Executor;

    private constructor(max_workers: number){
        this.max_workers = max_workers;
        for(let i = 0; i < this.max_workers; i++){
            this.workers[i] = new Worker(`${__dirname}/workers/unit.js`, {
                execArgv: [...process.execArgv, '--unhandled-rejections=strict' ]
            });
            this.workers[i].on('message', (message: UnitMessage) => {
                
                switch(message.type){
                    case 'ping':
                        this.replyToPing(i);
                    break;
                    case 'log':
                        this.logger.write(`[worker #${i}] says: ${message.value}\n`)
                    break;
                }

            });
            this.workers[i].on('error', e => {                
                this.logger.write(`[worker #${i}] encountered an error: ${e}\n`)
            });
        }
        Executor.enabled = true;
    }

    private replyToPing(index: number){

        const task = this.queue.splice(0, 1);
        
        if(task.length === 0)
            this.workers[index].postMessage({
                type: 'task',
                value: null
            })
        else this.workers[index].postMessage({
            type: 'task',
            value: task[0]
        })

    }

    public static init(max_workers: number){
        if(Executor.enabled) return;
        Executor.instance = new Executor(max_workers);
    }

    public static getInstance(){
        if(Executor.enabled)
            return Executor.instance;

        throw new Error('no Executor instance initalized')
    }

    public addJob({ task, body, query, state }: ExecutorScheduleUnit){
        this.queue.push({ task, body, query, state });
    }

}