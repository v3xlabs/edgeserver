import { useIPFSStatus } from '@/api';

import { BuildInfo } from './build';

export const Footer = () => {
    const { data: ipfsStatus } = useIPFSStatus();

    return (
        <div className="flex grow items-end justify-between">
            <div className="w-container-dynamic flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <span>edgeserver</span>
                    <BuildInfo />
                </div>
                <ul className="flex items-center gap-4">
                    <li>
                        <a href="/docs" className="link" target="_blank">
                            API Docs
                        </a>
                    </li>
                    <li>
                        <a href="/" className="link">
                            Changelog
                        </a>
                    </li>
                    {ipfsStatus &&
                        typeof ipfsStatus === 'object' &&
                        ipfsStatus.public_cluster_url && (
                            <li>
                                <a
                                    href={ipfsStatus.public_cluster_url}
                                    className="link"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    IPFS
                                </a>
                            </li>
                        )}
                </ul>
            </div>
        </div>
    );
};
