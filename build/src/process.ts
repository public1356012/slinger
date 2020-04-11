import { ChildProcess } from "child_process";

export function promisifyProcessExit(process: ChildProcess, successCodes = [0]) {
    return new Promise<number>((resolve, reject) => {
        process.on('exit', (code) => {
            if (code !== null && successCodes.indexOf(code) !== -1)
                resolve(0);
            else
                reject(code);
        });
    });
}
