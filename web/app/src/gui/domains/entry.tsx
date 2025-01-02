import { Domain } from '@edgelabs/types';
import { FC } from 'react';

export const DomainEntry: FC<{ domain: Domain }> = ({ domain }) => {
    return (
        <div>
            <div>
                <div>{domain.domain}</div>
            </div>
        </div>
    );
};
