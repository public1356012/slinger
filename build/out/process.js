"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisifyProcessExit(process, successCodes = [0]) {
    return new Promise((resolve, reject) => {
        process.on('exit', (code) => {
            if (code !== null && successCodes.indexOf(code) !== -1)
                resolve(0);
            else
                reject(code);
        });
    });
}
exports.promisifyProcessExit = promisifyProcessExit;
//# sourceMappingURL=process.js.map