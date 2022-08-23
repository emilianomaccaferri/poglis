import { parentPort, threadId } from "worker_threads";
import { ExecutorMessage } from "../types/ExecutorMessage";
import { Task } from "../types/Task";

const waitReply = (): Promise<Task | undefined> => {
    return new Promise(
        (res, _) => {
            parentPort!.postMessage({ type: 'ping' });
            parentPort!.once('message', (m: ExecutorMessage) => {
                if(m.type === 'task'){
                    return res(m.value);
                }
            })
        } 
    )
}

const sleep = (seconds: number) => {
    return new Promise(
        (r, _) => {
            setTimeout(r, seconds * 1000);
        }
    )
}

(async() => {
    
    if(parentPort){

        while(true){

            // console.log("requesting task from executor...");
            
            const task = await waitReply();
            if(!task)
                // console.log("i got nothing :(, sleeping 2 secs...");
                await sleep(2);
            else{
                console.log(`task running on ${ threadId }`, task);
                await sleep(6);
            }

        }
    }
})();
