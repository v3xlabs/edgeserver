import { AddDomainModal } from '@components/AddDomainModal/AddDomainModal';
import { Button } from '@components/Button';
import { FC, useState } from 'react';

import { UnverifiedDomainList } from './unverified_domain_list';
import { VerifiedDomainList } from './verified_domain_list';

export const DomainsPage: FC = () => {
    const [addDomainModalOpen, setAddDomainModalOpen] = useState(false);

    return (
        <div className="containerd pt-8">
            <div className="containerc gap-4 flex flex-col">
                <div className="card p-8">
                    <div className="flex space-between w-full">
                        <div className="flex-grow">
                            <h1 className="text-2xl">Domains</h1>
                            <div>
                                This is the page you use to manage your domains.
                            </div>
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
                <UnverifiedDomainList />
                <VerifiedDomainList />
            </div>
        </div>
    );
};
