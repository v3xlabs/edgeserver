import { createLogger } from '@lvksh/logger';
import chalk from 'chalk';

export const log = createLogger({
    debug: {
        label: chalk.cyan.bold`[DEBUG]`,
        divider: chalk.cyan.bold` | `,
    },
    ok: {
        label: chalk.greenBright.bold`[OK]`,
        divider: chalk.greenBright.bold` | `,
    },
    warning: {
        label: chalk.yellow.bold`[WARN]`,
        divider: chalk.yellow.bold` | `,
    },
    error: {
        label: chalk.red.bold`[ERROR]`,
        divider: chalk.red.bold` | `,
    },
    lifecycle: {
        label: chalk.greenBright`[LIFE]`,
        divider: chalk.greenBright` | `,
    },
    network: {
        label: chalk.rgb(255, 0, 255)`[NET]`,
        divider: chalk.rgb(255, 0, 255)` | `,
    },
    database: {
        label: chalk.rgb(0, 255, 255)`[DB]`,
        divider: chalk.rgb(0, 255, 255)` | `,
    },
});
