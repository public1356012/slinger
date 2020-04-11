import * as ts from 'typescript';
import * as path from 'path';


type hostOverwriter =
    (host: ts.CompilerHost, options: ts.CompilerOptions) => Partial<ts.CompilerHost>;


const diagnosticsHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory : ts.sys.getCurrentDirectory,
    getNewLine          : () => ts.sys.newLine,
};


export function findTsconfig(searchPath: string) {
    return ts.findConfigFile(searchPath, ts.sys.fileExists);
}


export function loadTsconfig(tsconfigPath: string) {
    return ts.getParsedCommandLineOfConfigFile(tsconfigPath, {}, {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
            console.log(ts.formatDiagnostic(diagnostic, diagnosticsHost));
        },
    });
}


export function compile(
    rootNames: string[],
    options: ts.CompilerOptions,
    compilerHost?: ts.CompilerHost,
) {
    options = {
        ...options,
        noEmit: false,
    };

    const program = ts.createProgram(rootNames, options, compilerHost);

    let diagnostics: readonly ts.Diagnostic[] = program.getSyntacticDiagnostics();

    if (!diagnostics.length)
        diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        console.log(
            ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticsHost));
    }
    else {
        program.emit();
    }
}


export function watchCompile(
    tsconfigDir: string,
    overwriteHost?: hostOverwriter,
) {
    const tsconfigPath = findTsconfig(tsconfigDir);

    if (!tsconfigPath)
        throw new Error('Could not find a tsconfig.json file');

    const watchHost = ts.createWatchCompilerHost(
        tsconfigPath,
        undefined,
        ts.sys,
        ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    );

    {
        const createProgram = watchHost.createProgram;

        let overwrittenHostProperties: Partial<ts.CompilerHost> | undefined;

        watchHost.createProgram = (rootNames, options, host, ...args) => {

            if (overwriteHost) {
                if (overwrittenHostProperties)
                    Object.assign(host, overwrittenHostProperties);

                overwrittenHostProperties = overwriteHost(host!, options!);
            }

            return createProgram(rootNames, options, host, ...args);
        };
    }

    ts.createWatchProgram(watchHost);
}


export function getOutRootDirs(baseUrl: string, outDir: string, rootDirs: string[]) {
    let distanceToCommonDirectory = 0;

    for (const rootDir of rootDirs) {
        const baseUrlToRootDirSegments = path.relative(baseUrl, rootDir).split('/');

        const distance = baseUrlToRootDirSegments.lastIndexOf('..') + 1;

        if (distance > distanceToCommonDirectory)
            distanceToCommonDirectory = distance;
    }

    const commonDirectory = path.resolve(
        baseUrl, ...new Array(distanceToCommonDirectory).fill('..'));

    const outRootDirs: string[] = [];

    for (const rootDir of rootDirs) {
        const relativeRootDir = path.relative(commonDirectory, rootDir);

        outRootDirs.push(path.join(outDir, relativeRootDir));
    }

    return outRootDirs;
}


export function mergeRootDirsOnWrite(host: ts.CompilerHost, options: ts.CompilerOptions) {
    if (!options.baseUrl)
        throw new Error('baseUrl is not specified');

    if (!options.outDir)
        throw new Error('outDir is not specified');

    if (!options.rootDirs)
        throw new Error('rootDirs is not specified');

    const outRootDirs = getOutRootDirs(
        options.baseUrl,
        options.outDir,
        options.rootDirs,
    );

    const originalWriteFile = host.writeFile;

    host.writeFile = (filePath, ...args) => {
        let newFilePath: string | undefined;

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
