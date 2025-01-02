import { FC } from 'react';
import { useDomains } from 'src/hooks/useDomains';

import { CreateDomainModal } from './create';
import { DomainEntry } from './entry';

export const DomainManager: FC<{ site_id: string }> = ({ site_id }) => {
    const { data, mutate } = useDomains(site_id);

    if (!data) return <div>Loading...</div>;

    return (
        <div className="flex">
            <div className="grow">
                {data.map((domain) => (
                    <DomainEntry key={domain.domain} domain={domain} />
                ))}
                {data.length === 0 && (
                    <div className="text-center">No tokens found.</div>
                )}
            </div>
            <CreateDomainModal site_id={site_id} onCreate={mutate} />
        </div>
    );
};
