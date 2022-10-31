import { AddDomainModal } from '@components/AddDomainModal/AddDomainModal';
import { Button } from '@components/Button';
import { Domain, UnverifiedDomain } from '@edgelabs/types';
import { useDomains } from '@utils/queries/useDomains';
import { useUnverifiedDomains } from '@utils/queries/useUnverifiedDomains';
import { FC, useState } from 'react';
import { Check } from 'react-feather';
import { Link } from 'react-router-dom';

const DomainCard: FC<{
    domain: Domain;
}> = ({ domain }) => {
    return (
        <Link
            className="hover:bg-neutral-800"
            to={'/domain/' + domain.domain_id}
        >
            <div className="flex justify-between p-4 gap-4 w-full items-center">
                <div className="h-full">
                    <h2 className="text-lg font-bold">{domain.domain}</h2>
                    <p className="text-sm opacity-50">
                        {domain.domain_id.toString()}
                    </p>
                </div>
                <div className="bg-neutral-800 w-fit h-fit px-2 py-2 rounded-full">
                    <Check size={'1rem'} />
                </div>
            </div>
        </Link>
    );
};

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

const DomainList: FC = () => {
    const { data, isLoading, isSuccess } = useDomains();
    const {
        data: dataUnverified,
        isLoading: isLoadingUnverified,
        isSuccess: isSuccessUnverified,
    } = useUnverifiedDomains();
    const [addDomainModalOpen, setAddDomainModalOpen] = useState(false);

    return (
        <div className="containerd">
            <div className="containerc gap-4 flex flex-col">
                <div className="card p-8">
                    <div className="flex space-between w-full">
                        <div className="flex-grow">
                            <h1 className="text-2xl">Domains</h1>
                            <div>Lorem ipsum dolor sit amet</div>
                        </div>
                        <div>
                            <Button
                                label="Add Domain"
                                onClick={() => setAddDomainModalOpen(true)}
                            />
                            {addDomainModalOpen && (
                                <AddDomainModal
                                    onClose={() => setAddDomainModalOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <h2 className="text-2xl p-4 pb-0">Pending Domains</h2>
                <div className="card p-4">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : dataUnverified ? (
                        dataUnverified.length === 0 ? (
                            <div>No Domains Pending Verification</div>
                        ) : (
                            dataUnverified.map((project) => (
                                <UDomainCard
                                    domain={project}
                                    key={project.name}
                                />
                            ))
                        )
                    ) : (
                        <div className="p-4">Error Loading Data</div>
                    )}
                </div>
                <h2 className="text-2xl p-4 pb-0">Domains</h2>
                <div className="card p-4">
                    {data &&
                        isSuccess &&
                        data.map((project) => (
                            <DomainCard
                                key={project.domain_id.toString()}
                                domain={project}
                            />
                        ))}
                    {!data &&
                        isLoading &&
                        Array.from({ length: 4 }).map((_, index) => <>d</>)}
                </div>
            </div>
        </div>
    );
};

export const DomainsPage: FC = () => {
    return (
        <div className="containerd pt-8">
            <DomainList />
        </div>
    );
};
