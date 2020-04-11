import * as ts from 'typescript';
declare type hostOverwriter = (host: ts.CompilerHost, options: ts.CompilerOptions) => Partial<ts.CompilerHost>;
export declare function findTsconfig(searchPath: string): string | undefined;
export declare function loadTsconfig(tsconfigPath: string): ts.ParsedCommandLine | undefined;
export declare function compile(rootNames: string[], options: ts.CompilerOptions, compilerHost?: ts.CompilerHost): void;
export declare function watchCompile(tsconfigDir: string, overwriteHost?: hostOverwriter): void;
export declare function getOutRootDirs(baseUrl: string, outDir: string, rootDirs: string[]): string[];
export declare function mergeRootDirsOnWrite(host: ts.CompilerHost, options: ts.CompilerOptions): {
    writeFile: ts.WriteFileCallback;
};
export {};
