import { Button } from '@components/Button';
import { FC, useState } from 'react';
import { generateSunflake } from 'sunflake';
import { useAccount, useEnsAddress } from 'wagmi';

const gen = generateSunflake();

export type CreateAppDomainState = {
    type: 'dns' | 'ens' | '';
    name: string;
    id: string;
};

const ValidatedENS: FC<{ domain: CreateAppDomainState }> = ({ domain }) => {
    const { data } = useEnsAddress({ name: domain.name });
    const { data: addressData } = useAccount();

    return (
        <div>
            {data && addressData && addressData.address == data ? 'V' : 'X'}
        </div>
    );
};

const StagedDomain: FC<{
    update: (domain: CreateAppDomainState) => void;
    domain: CreateAppDomainState;
}> = ({ domain, update }) => {
    return (
        <div key={domain.id} className="flex gap-2">
            <select
                onChange={(event) => {
                    update({ ...domain, type: event.target.value as '' });
                }}
                value={domain.type}
            >
                <option value="ens">ENS</option>
                <option value="dns">DNS</option>
            </select>
            <div>
                <input
                    onChange={(event) => {
                        update({ ...domain, name: event.target.value });
                    }}
                />
            </div>
            {domain.type == 'ens' && <ValidatedENS domain={domain} />}
        </div>
    );
};

export const CreateStageDomain: FC<{
    next: (a: CreateAppDomainState[]) => void;
    back: () => void;
}> = ({ next, back }) => {
    const [domains, setDomains] = useState([] as CreateAppDomainState[]);

    return (
        <>
            <div>Add your domains</div>
            <div>
                {domains.length === 0 && (
                    <div className="flex gap-2">
                        <Button
                            label="ENS"
                            onClick={() =>
                                setDomains([
                                    { type: 'ens', name: '', id: gen() },
                                ])
                            }
                        />
                        <Button
                            label="DNS"
                            onClick={() =>
                                setDomains([
                                    { type: 'dns', name: '', id: gen() },
                                ])
                            }
                        />
                    </div>
                )}
                {domains.length > 0 && (
                    <div>
                        <div className="w-full flex justify-between">
                            <h2>Domains</h2>
                            <Button
                                label="+"
                                onClick={() => {
                                    setDomains([
                                        ...domains,
                                        { type: 'dns', name: '', id: gen() },
                                    ]);
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            {domains.map((value, index) => (
                                <StagedDomain
                                    key={value.id}
                                    domain={value}
                                    update={(domain) => {
                                        setDomains([
                                            ...domains.slice(0, index),
                                            domain,
                                            ...domains.slice(index + 1),
                                        ]);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full flex justify-between">
                <Button label="Back" onClick={back} variant="secondary" />
                <Button
                    label="Next"
                    onClick={() => {
                        // Validate
                        console.log(domains);
                        // Proceed
                        next(domains);
                    }}
                />
            </div>
        </>
    );
};
