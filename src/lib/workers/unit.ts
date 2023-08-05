import { spawn, spawnSync } from "child_process";
import { randomBytes } from "crypto";
import { createWriteStream, rmdirSync } from "fs";
import { emptyDirSync, ensureDirSync } from "fs-extra";
import { parentPort } from "worker_threads";
import { ExecutorMessage } from "../types/ExecutorMessage";

const sleep = (seconds: number) => {
    return new Promise(
        (r, _) => {
            setTimeout(r, seconds * 1000);
        }
    )
}
const executeJob = (path: string, env: { [key: string]: any }, err_task?: string) => {
    return new Promise(
        (resolve, _) => {
            const stdout_stream = createWriteStream(`${path}.stdout.log`);
            const stderr_stream = createWriteStream(`${path}.stderr.log`);
            const cwd = `/tmp/poglis/${randomBytes(12).toString('hex')}`;

            ensureDirSync(cwd);

            const p = spawn(path, {
                env,
                cwd
            });

            p.stdout?.on('data', data => {
                stdout_stream.write(data);
            });
            p.stderr?.on('data', data => {
                stderr_stream.write(data);
            });
            p.on('close', code => {
                stdout_stream.write(`[poglis] process ended with code: ${code}`);
                stdout_stream.end();
                stderr_stream.end();
                if (err_task) {
                    if (code !== 0) {
                        spawnSync(err_task, {
                            env: {
                                ...env,
                                code: code?.toString(),
                            },
                            cwd,
                        });
                    }
                }

                emptyDirSync(cwd);
                rmdirSync(cwd);
                return resolve(code);
            });

        }
    )
}

(async () => {

    if (parentPort) {

        parentPort.postMessage({ type: 'ping' }); // ping
        parentPort.on('message', async (m: ExecutorMessage) => { // pong

            // this is the "ping pong" poll method
            // dedicated to https://github.com/dirtybloom 

            if (m.type === 'task') {
                const job = m.value;
                if (!job)
                    await sleep(.5);
                else {
                    parentPort!.postMessage({
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

                    for (const i in job.task.scripts) {
                        const code = await executeJob(job.task.scripts[i], env, job.onError?.scripts[0]);
                        if (code !== 0) throw new Error(`job pipeline for task ${job.task.name} failed with code ${code} on script ${job.task.scripts[i]}`);
                    }
                }
                parentPort!.postMessage({ type: 'ping' }) // ping
            }

        })
    }
})();
