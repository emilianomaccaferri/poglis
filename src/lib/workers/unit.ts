import { exec } from "child_process";
import { randomBytes } from "crypto";
import { createWriteStream, mkdir, mkdirSync, rmdirSync } from "fs";
import { emptyDirSync, ensureDirSync } from "fs-extra";
import { parentPort, threadId } from "worker_threads";
import { ExecutorMessage } from "../types/ExecutorMessage";
import { ExecutorScheduleUnit } from "../types/ExecutorScheduleUnit";

const waitReply = (): Promise<ExecutorScheduleUnit | undefined> => {
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
const executeJob = (path: string, env: { [key: string]: any }) => {
    return new Promise(
        (resolve, _) => {
            const stdout_stream = createWriteStream(`${path}.stdout.log`);
            const stderr_stream = createWriteStream(`${path}.stderr.log`);
            const cwd = `/tmp/poglis/${randomBytes(12).toString('hex')}`;
            
            ensureDirSync(cwd);

            const p = exec(path, {
                env: {
                    ...env,
                    "HOME": cwd
                },
                cwd
            });

            p.stdout?.on('data', data => {
                stdout_stream.write(data);
            });
            p.stderr?.on('data', data => {
                stderr_stream.write(data);
            });
            p.on('close', code => {
                stdout_stream.write(`[poglis] process ended with code: ${ code }`);
                stdout_stream.end();
                stderr_stream.end();
                emptyDirSync(cwd);
                rmdirSync(cwd);
                return resolve(code);
            });

        }
    )
}

(async() => {
    
    if(parentPort){

        while(true){
            
            const job = await waitReply();
            if(!job)
                await sleep(.5);
            else{
               
                parentPort.postMessage({
                    type: 'log',
                    value: `${job.task.name} running`
                });

                let env: { [key: string]: any } = {};
                
                Object.keys(job.body).forEach(key => {
                    env[`body_${key}`] = job.body[key];
                });
                Object.keys(job.query).forEach(key => {
                    env[`query_${key}`] = job.query[key];
                });  
                Object.keys(job.state).forEach(key => {
                    env[`state_${key}`] = job.state[key];
                });             
                
                for(const i in job.task.scripts){
                    const code = await executeJob(job.task.scripts[i], env);
                    if(code !== 0) throw new Error(`job pipeline for task ${job.task.name} failed with code ${code} on script ${job.task.scripts[i]}`);
                }

            }

        }
    }
})();
