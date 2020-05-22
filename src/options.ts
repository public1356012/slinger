import * as yargs from 'yargs';
import * as os from 'os';

export default yargs
    .option('p', {
        alias  : 'port',
        default: 4545,
        type   : 'number',
    })
    .option('w', {
        alias  : 'workers',
        default: os.cpus().length,
        type   : 'number',
    }).argv;
