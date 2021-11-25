import chalk from 'chalk';
import { inspect } from 'node:util';

export type LogMessage = string | unknown | undefined;

export const log = {
    debug: (message: LogMessage): void => {
        if (!process.env.DEBUG) return;
        const color = chalk.cyan.bold`[DEBUG]\t| `;
        consoleLog(color, message);
    },
    ok: (message: LogMessage): void => {
        const color = chalk.greenBright.bold`[OK]\t| `;
        consoleLog(color, message);
    },
    warning: (message: LogMessage): void => {
        const color = chalk.yellow.bold`[WARN]\t| `;
        consoleLog(color, message);
    },
    error: (message: LogMessage): void => {
        const color = chalk.red.bold`[ERROR]\t| `;
        consoleLog(color, message);
    },
    lifecycle: (message: LogMessage): void => {
        const color = chalk.greenBright`[LIFE]\t| `;
        consoleLog(color, message);
    },
    network: (message: LogMessage): void => {
        const color = chalk.rgb(255,0,255)`[NET]\t| `;
        consoleLog(color, message);
    },
    database: (message: LogMessage): void => {
        const color = chalk.rgb(0,255,255)`[DB]\t| `;
        consoleLog(color, message);
    }
};

const consoleLog = (color: string, message: LogMessage) => {
    if (!message) return;
    color = color + chalk.reset('');
    let stringMessage: string;
    stringMessage = typeof message !== 'string' ? inspect(message, false, 3) : message;

    // eslint-disable-next-line no-console
    console.log(
        stringMessage
            .split('\n')
            .map(
                (v, index, a) =>
                    (a.length == 1
                        ? color
                        : (index == 0
                            ? color.replace('|', '┌')
                            : index == a.length - 1
                                ? color.replace('|', '└')
                                : color.replace('|', '├'))) + v
            )
            .join('\n')
    );
};