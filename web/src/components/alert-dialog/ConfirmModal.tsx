import { useMutation } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';

import { Button } from '../button';
import {
    AlertAction,
    AlertCancel,
    AlertContent,
    AlertDescription,
    AlertFooter,
    AlertRoot,
    AlertTitle,
    AlertTrigger,
} from './index';

interface ConfirmModalProperties {
    title: string;
    description: string;
    onConfirm?: () => Promise<void> | void;
}

export const ConfirmModal: FC<PropsWithChildren<ConfirmModalProperties>> = ({
    children,
    onConfirm,
    title,
    description,
}) => {
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            console.log('Triggering mutation');

            if (onConfirm) {
                await onConfirm();
            }
        },
    });

    return (
        <AlertRoot>
            <AlertTrigger asChild>{children}</AlertTrigger>
            <AlertContent>
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{description}</AlertDescription>
                <AlertFooter>
                    <AlertCancel asChild>
                        <Button variant="default">Cancel</Button>
                    </AlertCancel>
                    <AlertAction asChild>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => mutate()}
                        >
                            {isPending ? 'Confirming...' : 'Confirm'}
                        </Button>
                    </AlertAction>
                </AlertFooter>
            </AlertContent>
        </AlertRoot>
    );
};
