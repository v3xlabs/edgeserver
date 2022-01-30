import { Span } from '@sentry/types';

type StartChildParameters = Parameters<Span['startChild']>[0];

export const startAction: <T>(
    transaction: Span,
    options: StartChildParameters,
    executor: (action: Span) => Promise<T> | T
) => Promise<T> | T = async (transaction, options, executor) => {
    const child = transaction.startChild(options);

    const data = await executor(child);

    child.finish();

    return data;
};
