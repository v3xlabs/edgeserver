import { createLogger } from '@lvksh/logger';

export const logger = createLogger(
    {
        queue: 'QUEUE',
        system: 'SYSTEM',
        debug: 'DEBUG',
        error: 'ERROR',
    },
    { divider: ' | ' }
);
