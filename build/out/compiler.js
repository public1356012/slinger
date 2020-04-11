"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path = require("path");
const diagnosticsHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
};
function findTsconfig(searchPath) {
    return ts.findConfigFile(searchPath, ts.sys.fileExists);
}
exports.findTsconfig = findTsconfig;
function loadTsconfig(tsconfigPath) {
    return ts.getParsedCommandLineOfConfigFile(tsconfigPath, {}, {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
            console.log(ts.formatDiagnostic(diagnostic, diagnosticsHost));
        },
    });
}
exports.loadTsconfig = loadTsconfig;
function compile(rootNames, options, compilerHost) {
    options = {
        ...options,
        noEmit: false,
    };
    const program = ts.createProgram(rootNames, options, compilerHost);
    let diagnostics = program.getSyntacticDiagnostics();
    if (!diagnostics.length)
        diagnostics = program.getSemanticDiagnostics();
    if (diagnostics.length) {
        console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticsHost));
    }
    else {
        program.emit();
    }
}
exports.compile = compile;
function watchCompile(tsconfigDir, overwriteHost) {
    const tsconfigPath = findTsconfig(tsconfigDir);
    if (!tsconfigPath)
        throw new Error('Could not find a tsconfig.json file');
    const watchHost = ts.createWatchCompilerHost(tsconfigPath, undefined, ts.sys, ts.createEmitAndSemanticDiagnosticsBuilderProgram);
    {
        const createProgram = watchHost.createProgram;
        let overwrittenHostProperties;
        watchHost.createProgram = (rootNames, options, host, ...args) => {
            if (overwriteHost) {
                if (overwrittenHostProperties)
                    Object.assign(host, overwrittenHostProperties);
                overwrittenHostProperties = overwriteHost(host, options);
            }
            return createProgram(rootNames, options, host, ...args);
        };
    }
    ts.createWatchProgram(watchHost);
}
exports.watchCompile = watchCompile;
function getOutRootDirs(baseUrl, outDir, rootDirs) {
    let distanceToCommonDirectory = 0;
    for (const rootDir of rootDirs) {
        const baseUrlToRootDirSegments = path.relative(baseUrl, rootDir).split('/');
        const distance = baseUrlToRootDirSegments.lastIndexOf('..') + 1;
        if (distance > distanceToCommonDirectory)
            distanceToCommonDirectory = distance;
    }
    const commonDirectory = path.resolve(baseUrl, ...new Array(distanceToCommonDirectory).fill('..'));
    const outRootDirs = [];
    for (const rootDir of rootDirs) {
        const relativeRootDir = path.relative(commonDirectory, rootDir);
        outRootDirs.push(path.join(outDir, relativeRootDir));
    }
    return outRootDirs;
}
exports.getOutRootDirs = getOutRootDirs;
function mergeRootDirsOnWrite(host, options) {
    if (!options.baseUrl)
        throw new Error('baseUrl is not specified');
    if (!options.outDir)
        throw new Error('outDir is not specified');
    if (!options.rootDirs)
        throw new Error('rootDirs is not specified');
    const outRootDirs = getOutRootDirs(options.baseUrl, options.outDir, options.rootDirs);
    const originalWriteFile = host.writeFile;
    host.writeFile = (filePath, ...args) => {
        let newFilePath;
        outRootDirs.some((outRootDir) => {
            if (filePath.indexOf(outRootDir) === 0) {
                newFilePath = options.outDir + filePath.slice(outRootDir.length);
                return true;
            }
        });
        if (newFilePath)
            originalWriteFile(newFilePath, ...args);
        else
            throw new Error(`${filePath} doesn't match any out rootDirs`);
    };
    return {
        writeFile: originalWriteFile,
    };
}
exports.mergeRootDirsOnWrite = mergeRootDirsOnWrite;
//# sourceMappingURL=compiler.js.map