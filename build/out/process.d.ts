/// <reference types="node" />
import { ChildProcess } from "child_process";
export declare function promisifyProcessExit(process: ChildProcess, successCodes?: number[]): Promise<number>;
