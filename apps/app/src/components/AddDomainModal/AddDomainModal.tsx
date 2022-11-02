/* eslint-disable sonarjs/no-duplicate-string */
import { Modal } from '@components/Modal';
import { Button, Hyperlink } from '@edgelabs/components';
import { FC, useState } from 'react';

import { DNSAddModalSection } from './DNSAddModalSection';

export const AddDomainModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [domainType, setDomainType] = useState<'' | 'dns' | 'ens'>('');

    return (
        <Modal label="Add Domain" onClose={onClose}>
            <div>
                <div className="w-full flex gap-2 pb-2">
                    {[
                        { name: 'ENS', logo: '', value: 'ens' },
                        { name: 'DNS', logo: '', value: 'dns' },
                    ].map((system) => (
                        <Button
                            className="flex-grow"
                            onPress={() =>
                                setDomainType(system.value as 'ens' | 'dns')
                            }
                            key={system.value}
                        >
                            {/* <img src={system.logo} alt={system.name} /> */}
                            {system.name}
                        </Button>
                    ))}
                </div>
                {domainType == 'ens' && (
                    <div>
                        Support for ENS names is still under development.
                        <br />
                        <br />
                        Feel free to follow our progress over{' '}
                        <Hyperlink
                            href="https://github.com/v3xlabs/edgeserver/issues/155"
                            target="_blank"
                            className="text-blue-500"
                        >
                            here
                        </Hyperlink>
                        .
                    </div>
                )}
                {domainType == 'dns' && <DNSAddModalSection />}
            </div>
        </Modal>
    );
};
