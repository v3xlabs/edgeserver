import { motion } from 'framer-motion';
import { BsCopy } from 'react-icons/bs';
import { FiKey } from 'react-icons/fi';
import { GiHouseKeys } from 'react-icons/gi';
import TimeAgo from 'react-timeago-i18n';

import { useKeys } from '@/api';
import { Button } from '@/components';

export const KeyTable = ({ siteId }: { siteId?: string }) => {
    const { data: keys } = useKeys({});

    return (
        <>
            <ul className="card no-padding divide-y">
                {keys?.map((key) => (
                    <li key={key.token} className="flex gap-4 p-4">
                        <div className="py-1.5">
                            {key.siteId ? <FiKey /> : <GiHouseKeys />}
                        </div>
                        <div>
                            <div className="font-mono">
                                <span>{key.token}</span>
                                {!key.token.includes('*') && (
                                    <motion.button
                                        className="hover:bg-hover ml-1 rounded-md p-1.5 text-sm"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                key.token
                                            )
                                        }
                                    >
                                        <BsCopy />
                                    </motion.button>
                                )}
                            </div>
                            <div>
                                Created by{' '}
                                <span className="font-bold">
                                    {key.createdBy}
                                </span>
                            </div>
                            <div>
                                {key.lastUsed ? (
                                    <>
                                        Last used{' '}
                                        <span>
                                            <TimeAgo date={key.lastUsed} />
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
