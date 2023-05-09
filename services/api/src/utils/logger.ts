import { createLogger } from '@lvksh/logger';

export const log = createLogger({
    info: 'INFO',
    error: 'ERROR',
    debug: 'DEBUG',
    empty: '',
    settings: 'SETTINGS',
});
