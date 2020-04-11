const { fork } = require('child_process');
const del = require('del');
const gulp = require('gulp');

const tests = require('./build/out/tests');
const { promisifyProcessExit } = require('./build/out/process');


/**
 *
 * @param {string[]} args
 */
function eslint(...args) {
    return function eslint() {
        return promisifyProcessExit(fork('node_modules/eslint/bin/eslint.js', args), [0, 1]);
    };
}


/**
 *
 * @param {string[]} args
 */
function tsc(...args) {
    return function tsc() {
        return promisifyProcessExit(fork('node_modules/typescript/lib/tsc.js', args));
    };
}


/**
 *
 * @param  {string[]} globs
 */
function clean(...globs) {
    return function clean() {
        return del(globs);
    };
}


const lintSrc = eslint('--fix', 'src/**');
const lintTests = eslint('--fix', 'test/**');
const lintBuild = eslint('--fix', 'build/src/**');

const lintAll = gulp.parallel(lintSrc, lintTests, lintBuild);


const build = gulp.series(
    lintSrc,
    clean('dist/'),
    tsc('-p', 'src/'),
);


const buildBuild = gulp.series(
    lintBuild,
    clean('build/out/'),
    tsc('-p', 'build/'),
);


async function buildTests() {
    await del('dist/');

    tests.buildTests('test/');
}


function devTests(cb) {
    cb();

    tests.watchTests('test/');
}


module.exports = {
    lintSrc,
    lintTests,
    lintBuild,
    lintAll,
    build,
    buildBuild,
    buildTests,
    devTests,
};
