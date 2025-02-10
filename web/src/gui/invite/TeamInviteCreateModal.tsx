import { FC, PropsWithChildren } from 'react';

import { useTeamInviteCreate } from '@/api/team';
import { Button } from '@/components/button';
import {
    ModalContent,
    ModalDescription,
    ModalRoot,
    ModalTitle,
    ModalTrigger,
} from '@/components/modal';

export const TeamInviteCreateModal: FC<
    PropsWithChildren<{ team_id: string }>
> = ({ team_id, children }) => {
    const { mutate: createInvite } = useTeamInviteCreate({ teamId: team_id });

    return (
        <ModalRoot>
            <ModalTrigger>{children}</ModalTrigger>
            <ModalContent>
                <ModalTitle>Invite new member(s)</ModalTitle>
                <ModalDescription>
                    Invite new members to your team.
                </ModalDescription>
                <div>
                    <Button onClick={() => createInvite()}>
                        Create Invite
                    </Button>
                </div>
            </ModalContent>
        </ModalRoot>
    );
};
