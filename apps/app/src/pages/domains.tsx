import { Button } from '@components/Button';
import { useDomains } from '@utils/queries/useDomains';
import { FC, useState } from 'react';
import { Domain, UnverifiedDomain } from '@edgelabs/types';
import { useUnverifiedDomains } from '@utils/queries/useUnverifiedDomains';
import { Link } from 'react-router-dom';
import { Check } from 'react-feather';

const DomainCard: FC<{
    domain: Domain;
}> = ({ domain }) => {
    return (
        <Link className="hover:bg-neutral-800" to={'/domain/' + domain.domain_id}>
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

    return (
        <div className="containerd">
            <div className="containerc gap-4 flex flex-col">
                <h1 className="text-2xl">Domains</h1>
                <div className="">
                    {dataUnverified &&
                        dataUnverified.map((project) => (
                            <UDomainCard domain={project} key={project.name} />
                        ))}
                </div>
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
    );
};

export const DomainsPage: FC = () => {
    return (
        <div className="containerd pt-8">
            <DomainList />
        </div>
    );
};
