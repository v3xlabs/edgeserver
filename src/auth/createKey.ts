import { sign } from 'jsonwebtoken';

export const createKey = async (account: string) => {
    const random = Math.round(Math.random() * 1_000_000);
    const key = sign(
        {
            account,
            value: random,
        },
        process.env.SIGNAL_MASTER
    );

    return { key, random };
};
