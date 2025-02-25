import { FiKey } from 'react-icons/fi';
import { GiHouseKeys } from 'react-icons/gi';
import TimeAgo from 'react-timeago-i18n';

import { useMe, useTokenCreate, useTokens } from '@/api';
import { Button } from '@/components';

export const KeyTable = ({ siteId }: { siteId?: string }) => {
    const { data: tokens } = useTokens({});
    const { data: me } = useMe();
    const { mutate } = useTokenCreate();

    return (
        <>
            <ul className="card no-padding divide-y">
                {tokens?.map((token) => (
                    <li key={token.token} className="flex gap-4 p-4">
                        <div className="py-1.5">
                            {token.siteId ? <FiKey /> : <GiHouseKeys />}
                        </div>
                        <div>
                            <div className="font-mono">
                                <span>{token.token}</span>
                            </div>
                            <div>
                                Created by{' '}
                                <span className="font-bold">
                                    {token.createdBy}
                                </span>
                            </div>
                            <div>
                                {token.lastUsed ? (
                                    <>
                                        Last used{' '}
                                        <span>
                                            <TimeAgo date={token.lastUsed} />
                                        </span>
                                    </>
                                ) : (
                                    <>Never used</>
                                )}
                            </div>
                        </div>
                        <div className="flex grow items-center justify-end">
                            <Button variant="destructive" size="sm">
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
};
