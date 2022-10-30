/* eslint-disable sonarjs/no-duplicate-string */
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
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
                            variant={
                                system.value == domainType
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() =>
                                setDomainType(system.value as 'ens' | 'dns')
                            }
                            key={system.value}
                            label={system.name}
                        >
                            <img src={system.logo} alt={system.name} />
                        </Button>
                    ))}
                </div>
                {domainType == 'ens' && (
                    <div>
                        {/* TODO: Use UI Library */}
                        Support for ENS names is still under development.
                        <br />
                        <br />
                        Feel free to follow our progress over{' '}
                        <a
                            href="https://github.com/v3xlabs/edgeserver/issues/155"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500"
                        >
                            here
                        </a>
                        .
                    </div>
                )}
                {domainType == 'dns' && <DNSAddModalSection />}
            </div>
        </Modal>
    );
};
