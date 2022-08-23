import { Worker } from "worker_threads";
import { ExecutorMessage } from "./types/ExecutorMessage";
import { Task } from "./types/Task";
import { UnitMessage } from "./types/UnitMessage";

export default class Executor {

    private queue: Array<Task> = new Array<Task>();
    private workers: Array<Worker> = new Array<Worker>();
    private max_workers: number = 2;
    private static enabled = false;
    private static instance: Executor;

    private constructor(max_workers: number){
        this.max_workers = max_workers;
        for(let i = 0; i < this.max_workers; i++){
            this.workers[i] = new Worker(`${__dirname}/workers/unit.js`);
            this.workers[i].on('message', (request: UnitMessage) => {
                
                if(request.type === 'ping'){
                    this.replyToPing(i);
                }

            });
        }
        Executor.enabled = true;
    }

    private replyToPing(index: number){

        
        const task = this.queue.splice(0, 1);
        if(task.length === 0)
            this.workers[index].postMessage({
                type: 'task',
                value: null,
                delay: 1000
            })
        else this.workers[index].postMessage({
            type: 'task',
            value: task
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

    public addJob(task: Task){
        this.queue.push(task);
    }

}