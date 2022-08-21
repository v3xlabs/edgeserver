import { Application } from '@edgelabs/types';
import { createLogger } from '@lvksh/logger';

const f: Partial<Application> = {};

const log = createLogger({
    debug: 'DEBUG',
    info: 'INFO',
    raw: { label: '', newLine: '', newLineEnd: '' },
});

console.log(`
##############################################
#                                            #
#    @edgelabs/cli                           #
#                                            #
##############################################
`);
