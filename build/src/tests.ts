import * as ts from 'typescript';

import {
    compile,
    loadTsconfig,
    watchCompile,
    findTsconfig,
    mergeRootDirsOnWrite,
} from './compiler';


/* These solutions do not support source maps */

export function buildTests(testsPath: string) {
    const tsconfigPath = findTsconfig(testsPath);

    if (!tsconfigPath)
        throw new Error('tsconfig.json is missing');

    const tsconfig = loadTsconfig(tsconfigPath);

    if (!tsconfig)
        throw new Error(`Something went wrong while loading ${tsconfigPath}`);

    const options = tsconfig.options;
    options.noEmit = false;

    const compilerHost = ts.createCompilerHost(options);

    mergeRootDirsOnWrite(compilerHost, options);
    compile(tsconfig.fileNames, options, compilerHost);
}


export function watchTests(testsPath: string) {
    watchCompile(testsPath, mergeRootDirsOnWrite);
}
