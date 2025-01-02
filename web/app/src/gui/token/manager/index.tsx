import { FC } from 'react';
import { useSiteTokens, useTeamTokens } from 'src/hooks/useTokens';

import { CreateTokenModal } from './create';
import { TokenEntry } from './entry';

export const TokenManager: FC<{ team_id: string; site_id?: string }> = ({
    team_id,
    site_id,
}) => {
    const { data } = site_id ? useSiteTokens(site_id) : useTeamTokens(team_id);

    if (!data) return <div>Loading...</div>;

    return (
        <div className="flex">
            <div className="grow">
                {data.map((token) => (
                    <TokenEntry key={token.token_id} token={token} />
                ))}
                {data.length === 0 && (
                    <div className="text-center">No tokens found.</div>
                )}
            </div>
            <CreateTokenModal team_id={team_id} site_id={undefined} />
        </div>
    );
};
