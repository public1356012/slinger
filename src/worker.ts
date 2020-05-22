import * as cluster from 'cluster';

import options from './options';


console.log(`Worker ${cluster.worker.id} listening on port ${options.p}`);
