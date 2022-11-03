import { TextField } from '@edgelabs/components';
import { Domain } from '@edgelabs/types';
import { useDomains } from '@utils/queries/useDomains';
import { FC, useState } from 'react';
import { Check } from 'react-feather';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

const DomainCard: FC<{
    domain: Domain;
}> = ({ domain }) => {
    return (
        <Link to={'/domain/' + domain.domain_id} key={domain.domain}>
            <div className="flex hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md justify-between p-4 gap-4 w-full items-center">
                <div className="h-full">
                    <h2 className="text-lg font-bold">{domain.domain}</h2>
                    <p className="text-sm opacity-50">
                        {domain.domain_id.toString()}
                    </p>
                </div>
                <div className="bg-neutral-400 dark:bg-neutral-800 w-fit h-fit px-2 py-2 rounded-full text-white">
                    <Check size={'1rem'} />
                </div>
            </div>
        </Link>
    );
};

const searchMatch = (domain: Domain, search: string) => {
    return domain.domain.startsWith(search);
};

const FilteredDomains: FC<{ domains: Domain[]; search: string }> = ({
    domains,
    search,
}) => {
    return (
        <div>
            {domains
                .filter((domain) => searchMatch(domain, search))
                .map((project) => (
                    <DomainCard
                        key={project.domain_id.toString()}
                        domain={project}
                    />
                ))}
        </div>
    );
};

export const VerifiedDomainList: FC = () => {
    const { data, isLoading, isSuccess } = useDomains();
    const [search, setSearch] = useState('');
    const [memoSearch] = useDebounce(search, 400);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl p-4 pb-0">Domains</h2>
            <div className="flex w-full gap-4">
                <TextField
                    className="text-lg p-4 flex-grow w-full"
                    placeholder="Search..."
                    value={search}
                    onChange={(value) => setSearch(value)}
                />
            </div>
            <div className="card p-4">
                {data && isSuccess && (
                    <FilteredDomains domains={data} search={memoSearch} />
                )}
                {!data &&
                    isLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index}>d</div>
                    ))}
            </div>
        </div>
    );
};
