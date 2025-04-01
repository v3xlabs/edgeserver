import { FC, PropsWithChildren, useState } from 'react';
import { FiKey } from 'react-icons/fi';

import { NewSiteKey } from '@/api/site/keys';
import { Button, Input, ModalClose, ModalContent } from '@/components';
import {
    ModalDescription,
    ModalRoot,
    ModalTitle,
    ModalTrigger,
} from '@/components';

export const CreateKeyModal: FC<
    PropsWithChildren<{
        resource: 'site' | 'team' | 'user';
        resourceId: string;
        onSubmit: (permissions: string) => void;
        newSiteKey?: NewSiteKey;
        onDismiss?: () => void;
    }>
> = ({ resource, resourceId, newSiteKey, onSubmit, children, onDismiss }) => {
    const [permissions, setPermissions] = useState('read');

    return (
        <ModalRoot
            onOpenChange={(open) => {
                if (!open) {
                    onDismiss?.();
                }
            }}
        >
            <ModalTrigger>{children}</ModalTrigger>
            {!newSiteKey && (
                <ModalContent>
                    <ModalTitle>Create new key for {resource}</ModalTitle>
                    <ModalDescription>
                        Create a new key for {resource} with default
                        permissions. More permissions can be added later.
                    </ModalDescription>

                    <div className="flex w-full flex-row justify-end gap-2">
                        <Button
                            className="w-full"
                            variant="primary"
                            onClick={() => {
                                onSubmit(permissions);
                            }}
                        >
                            <FiKey />
                            Create key
                        </Button>
                    </div>
                </ModalContent>
            )}
            {newSiteKey && (
                <ModalContent>
                    <ModalTitle>New key created</ModalTitle>
                    <ModalDescription>
                        You can only copy this once.
                    </ModalDescription>
                    <div className="flex w-full flex-row justify-end gap-2">
                        <Input value={newSiteKey.key} readOnly />
                        <Button
                            className="w-full"
                            variant="primary"
                            onClick={() => {
                                navigator.clipboard.writeText(newSiteKey.key);
                            }}
                        >
                            Copy key
                        </Button>
                    </div>
                    <ModalClose asChild>
                        <Button variant="default">
                            I have copied the key!
                        </Button>
                    </ModalClose>
                </ModalContent>
            )}
        </ModalRoot>
    );
};
