import { Button } from '@edgelabs/components';
import { FC, useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { useMutation } from 'react-query';
import { useAccount } from 'wagmi';

type DNSData = {
    Status: number;
    TC: boolean;
    RD: boolean;
    RA: boolean;
    AD: boolean;
    CD: boolean;
    Question: { name: string; type: number }[];
    Answer?: {
        name: string;
        type: number;
        TTL: number;
        data: string;
    }[];
};

export const DNSRecordTester: FC<{ domain: string }> = ({ domain }) => {
    const [results, setResults] = useState(false);
    const { data: account } = useAccount();
    const { data, mutate, isLoading, isSuccess } = useMutation('', async () => {
        const _ensRecord = await fetch(
            'https://1.1.1.1/dns-query?name=_ens.' + domain + '&type=TXT',
            {
                headers: { accept: 'application/dns-json' },
            }
        );
        const _edgeRecord = await fetch(
            'https://1.1.1.1/dns-query?name=_edge.' + domain + '&type=TXT',
            {
                headers: { accept: 'application/dns-json' },
            }
        );

        const [ensRecord, edgeRecord] = await Promise.all([
            _ensRecord.json() as Promise<DNSData>,
            _edgeRecord.json() as Promise<DNSData>,
        ]);

        const Answers = [
            ...(ensRecord.Answer || []),
            ...(edgeRecord.Answer || []),
        ];

        const user = Answers.find((steve) =>
            steve.data.match(/a=0x[\dA-Fa-f]{32}/)
        );

        if (!user) return;

        setResults(true);

        return [user];
    });

    useEffect(() => {
        setResults(false);
    }, [domain]);

    return (
        <div>
            <div className="flex justify-between">
                <div>{domain}</div>
                <Button type="button" onPress={() => mutate()}>
                    Reload
                </Button>
            </div>
            <div>
                {isSuccess && data ? (
                    <div>
                        {data.at(0)?.name} {data.at(0)?.data}
                    </div>
                ) : (
                    results
                )}
            </div>
            {results && (
                <div>
                    Verified to {data?.at(0)?.data.replace('a=', '')}
                    <span className="text-green-500">
                        <Check />
                    </span>
                </div>
            )}
            {!results && (
                <>
                    <div>
                        <p className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2">
                            And update your DNS records to include
                        </p>
                        <code className="p-2 bg-neutral-200 dark:bg-black-500 w-full block mt-2">
                            {domain + ' CNAME web.lvk.sh'}
                        </code>
                        <code className="p-2 bg-neutral-200 dark:bg-black-500 w-full block mt-2 break-all">
                            {'_edge.' + domain + ' TXT a=' + account?.address}
                        </code>
                    </div>
                    <div className="block text-sm font-medium text-neutral-900 dark:text-neutral-300 mb-2">
                        DNS Records may take up to 24 hours to update. Yes, the
                        system is archaic. I&apos;m impatient too
                    </div>
                </>
            )}
        </div>
    );
};
