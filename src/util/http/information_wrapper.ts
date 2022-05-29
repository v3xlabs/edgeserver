import chalk from 'chalk';

import { log } from '../logging';

export type InformationData = Partial<{
    domain: string;
    endpoint: string;
    success: boolean;
    cid: string;
    resolved_path: string;
    info_source: 'cached' | 'live';
    data_source: 'cached' | 'live';
}>;

export const informationWrap: <T extends H[], G, H>(
    handler: (data: InformationData, ...passthrough: T) => Promise<G>
) => (...passthrough: T) => Promise<G> = (handler) => {
    return async (...trans) => {
        const data: InformationData = {};

        try {
            return await handler(data, ...trans);
        } finally {
            const addressData = data.domain + data.endpoint;

            if (data.success) {
                log.network(
                    `${chalk.green(' ✓')} ${addressData} ${chalk.gray(
                        data.cid
                    )} ${
                        data.info_source == 'cached'
                            ? chalk.green('CACHED')
                            : ''
                    }` +
                        (data.resolved_path !== data.endpoint
                            ? `\n   ${data.endpoint} ⮕ ${data.resolved_path} ${
                                  data.data_source == 'cached'
                                      ? chalk.green('CACHED')
                                      : ''
                              }`
                            : '')
                );
            } else {
                log.network(`❌ ${addressData}`);
                log.network(data);
            }
        }
    };
};
