import * as cluster from 'cluster';
import * as path from 'path';

import options from './options';


if (!cluster.isMaster)
    throw new Error('The main module has to be run as master');


cluster.setupMaster({
    exec: path.resolve(path.dirname(process.argv[1]), 'worker.js'),
});

for (let i = 0; i < 1; ++i)
    cluster.fork();
