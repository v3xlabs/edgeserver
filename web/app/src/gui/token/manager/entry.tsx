import { Token } from '@edgelabs/types';
import { FC, useMemo } from 'react';
import { decode } from 'sunflake';

export const TokenEntry: FC<{ token: Token }> = ({ token }) => {
    const normalized_time = useMemo(() => {
        const { time } = decode(token.token_id);

        return new Date(time.toString()).toString();
    }, [token.token_id]);

    return (
        <div className="flex items-center justify-between border px-3 py-2">
            <div>
                <div>{token.name}</div>
                <div>{token.token_id}</div>
            </div>
            <div>
                <div>{normalized_time}</div>
            </div>
        </div>
    );
};
