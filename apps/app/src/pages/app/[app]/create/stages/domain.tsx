import { Button, TextField } from '@edgelabs/components';
import { DomainVerificationRequest } from '@edgelabs/types';
import { FC, useState } from 'react';
import { generateSunflake } from 'sunflake';
import { useAccount, useEnsAddress } from 'wagmi';

const gen = generateSunflake();

const ValidatedENS: FC<{ domain: DomainVerificationRequest }> = ({
    domain,
}) => {
    const { data } = useEnsAddress({ name: domain.name });
    const { data: addressData } = useAccount();

    return (
        <div>
            {data && addressData && addressData.address == data ? 'V' : 'X'}
        </div>
    );
};

const StagedDomain: FC<{
    update: (domain: DomainVerificationRequest) => void;
    domain: DomainVerificationRequest;
}> = ({ domain, update }) => {
    return (
        <div key={domain.id} className="flex gap-4">
            <select
                className="h-full"
                onChange={(event) => {
                    update({ ...domain, type: event.target.value as '' });
                }}
                value={domain.type}
            >
                <option value="ens">ENS</option>
                <option value="dns">DNS</option>
            </select>
            <div>
                <TextField
                    aria-label="Enter domain"
                    onChange={(value) => {
                        update({ ...domain, name: value });
                    }}
                />
            </div>
            {domain.type == 'ens' && <ValidatedENS domain={domain} />}
        </div>
    );
};

export const CreateStageDomain: FC<{
    next: (a: DomainVerificationRequest[]) => void;
    back: () => void;
}> = ({ next, back }) => {
    const [domains, setDomains] = useState([] as DomainVerificationRequest[]);

    return (
        <>
            <div>Add your domains</div>
            <div>
                {domains.length === 0 && (
                    <div className="flex gap-2">
                        <Button
                            onPress={() =>
                                setDomains([
                                    { type: 'ens', name: '', id: gen() },
                                ])
                            }
                        >
                            ENS
                        </Button>
                        <Button
                            onPress={() =>
                                setDomains([
                                    { type: 'dns', name: '', id: gen() },
                                ])
                            }
                        >
                            DNS
                        </Button>
                    </div>
                )}
                {domains.length > 0 && (
                    <div className="flex gap-5 flex-col">
                        <div className="w-full flex justify-between">
                            <h2 className="text-xl">Domains</h2>
                            <Button
                                className="w-fit"
                                onPress={() => {
                                    setDomains([
                                        ...domains,
                                        { type: 'dns', name: '', id: gen() },
                                    ]);
                                }}
                            >
                                +
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
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
            <div className="w-full flex justify-between gap-16">
                <Button onPress={back} variant="delete">
                    Back
                </Button>
                <Button
                    onPress={() => {
                        // Validate
                        console.log(domains);
                        // Proceed
                        next(domains);
                    }}
                >
                    Next
                </Button>
            </div>
        </>
    );
};
