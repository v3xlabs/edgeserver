import { Application } from '@edgelabs/types';
import { createLogger } from '@lvksh/logger';

import { version } from '../package.json';

const f: Partial<Application> = {};

const log = createLogger({
    debug: 'DEBUG',
    info: 'INFO',
    raw: { label: '', newLine: '', newLineEnd: '' },
});

const pad = (txt: string, space: number) =>
    txt + ' '.repeat(space - txt.length);

console.log(`
##############################################
#                                            #
#    @edgelabs/cli                           #
#    v${pad(version, 19)}                    #
#                                            #
##############################################
`);
