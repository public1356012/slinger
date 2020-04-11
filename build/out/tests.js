"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const compiler_1 = require("./compiler");
/* These solutions do not support source maps */
function buildTests(testsPath) {
    const tsconfigPath = compiler_1.findTsconfig(testsPath);
    if (!tsconfigPath)
        throw new Error('tsconfig.json is missing');
    const tsconfig = compiler_1.loadTsconfig(tsconfigPath);
    if (!tsconfig)
        throw new Error(`Something went wrong while loading ${tsconfigPath}`);
    const options = tsconfig.options;
    options.noEmit = false;
    const compilerHost = ts.createCompilerHost(options);
    compiler_1.mergeRootDirsOnWrite(compilerHost, options);
    compiler_1.compile(tsconfig.fileNames, options, compilerHost);
}
exports.buildTests = buildTests;
function watchTests(testsPath) {
    compiler_1.watchCompile(testsPath, compiler_1.mergeRootDirsOnWrite);
}
exports.watchTests = watchTests;
//# sourceMappingURL=tests.js.map