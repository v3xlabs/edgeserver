import { FC, PropsWithChildren, useState } from 'react';
import { FiLink, FiUserPlus } from 'react-icons/fi';

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
    const isDisabled = !user;

    return (
        <>
            <ModalRoot>
                <ModalTrigger>{children}</ModalTrigger>
                <ModalContent>
                    <ModalTitle>Invite new member(s)</ModalTitle>
                    <ModalDescription>
                        Add an existing user to your team, or copy an invite
                        link to allow for registration. You can delete this link
                        at any time.
                    </ModalDescription>
                    <UserSelect
                        placeholder="Choose an individual"
                        value={user}
                        onChange={(user) => {
                            setUser(user);

                            return true;
                        }}
                    />

                    <div className="flex flex-row gap-2">
                        <Button
                            className="w-full"
                            onClick={() => createInvite()}
                        >
                            <FiLink /> Copy link
                        </Button>
                        <Button
                            className="w-full"
                            variant="primary"
                            disabled={isDisabled}
                        >
                            <FiUserPlus />
                            Send
                        </Button>
                    </div>
                </ModalContent>
            </ModalRoot>
        </>
    );
};
