import { UnverifiedDomain } from '@edgelabs/types';
import { useUnverifiedDomains } from '@utils/queries/useUnverifiedDomains';
import { FC } from 'react';

const UDomainCard: FC<{
    domain: UnverifiedDomain;
}> = ({ domain }) => {
    return (
        <div className="flex justifify-start gap-4 w-full items-center">
            <div className="bg-neutral-800 px-2 rounded-md">Unverified</div>
            <h2 className="text-lg font-bold">{domain.name}</h2>
        </div>
    );
};

export const UnverifiedDomainList: FC = () => {
    const {
        data: dataUnverified,
        isLoading: isLoadingUnverified,
        isSuccess: isSuccessUnverified,
    } = useUnverifiedDomains();

    return (
        <div className="card p-4">
            {isLoadingUnverified ? (
                <div>Loading...</div>
            ) : dataUnverified ? (
                dataUnverified.length === 0 ? (
                    <div>No Domains Pending Verification</div>
                ) : (
                    dataUnverified.map((project) => (
                        <UDomainCard domain={project} key={project.name} />
                    ))
                )
            ) : (
                <div className="p-4">Error Loading Data</div>
            )}
        </div>
    );
};
