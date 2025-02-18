import { FC, PropsWithChildren, useState } from 'react';
import { FiLink } from 'react-icons/fi';

import { useTeamInviteCreate } from '@/api/team';
import { Button } from '@/components/button';
import {
    ModalContent,
    ModalDescription,
    ModalRoot,
    ModalTitle,
    ModalTrigger,
} from '@/components/modal';
import { UserSelect } from '@/components/select/UserSelect';

export const TeamInviteCreateModal: FC<
    PropsWithChildren<{ team_id: string }>
> = ({ team_id, children }) => {
    const { mutate: createInvite } = useTeamInviteCreate({ teamId: team_id });
    const [user, setUser] = useState('');

    return (
        <>
            <ModalRoot>
                <ModalTrigger>{children}</ModalTrigger>
                <ModalContent>
                    <ModalTitle>Invite new member(s)</ModalTitle>
                    <ModalDescription>
                        Invite new members to your team.
                    </ModalDescription>
                    <UserSelect
                        value={user}
                        onChange={(user) => {
                            setUser(user);

                            return true;
                        }}
                    />
                    <div>
                        <Button onClick={() => createInvite()}>
                            <FiLink /> Get a link
                        </Button>
                    </div>
                </ModalContent>
            </ModalRoot>
        </>
    );
};
