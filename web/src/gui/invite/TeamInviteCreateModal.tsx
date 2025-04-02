import { FC, PropsWithChildren, useState } from 'react';
import { FiLink, FiUserPlus } from 'react-icons/fi';
import { toast } from 'sonner';

import { useTeamInviteCreate } from '@/api/team';
import { Button } from '@/components/button';
import {
    ModalClose,
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
    const [userId, setUserId] = useState('');
    const { mutate: createInvite } = useTeamInviteCreate({
        teamId: team_id,
    });
    const isDisabled = !userId;

    const handleCreateInvite = (userId?: string) => {
        createInvite(
            { userId },
            {
                onSuccess: (data) => {
                    if (!userId) {
                        const inviteUrl = `${window.location.origin}/invite/${data.invite_id}`;

                        navigator.clipboard.writeText(inviteUrl);
                    }

                    toast.success(
                        userId
                            ? 'Invite sent successfully'
                            : 'Invite link copied to clipboard'
                    );
                    setUserId('');
                },
                onError: () =>
                    toast.error(
                        userId
                            ? 'Failed to send invite'
                            : 'Failed to create invite link'
                    ),
            }
        );
    };

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
                        value={userId}
                        teamId={team_id}
                        onChange={(user) => {
                            setUserId(user);

                            return true;
                        }}
                    />

                    <div className="flex flex-row gap-2">
                        <ModalClose asChild>
                            <Button
                                className="w-full"
                                onClick={() => handleCreateInvite()}
                            >
                                <FiLink /> Copy link
                            </Button>
                        </ModalClose>
                        <ModalClose asChild>
                            <Button
                                className="w-full"
                                variant="primary"
                                disabled={isDisabled}
                                onClick={() => {
                                    handleCreateInvite(userId);
                                }}
                            >
                                <FiUserPlus />
                                Send
                            </Button>
                        </ModalClose>
                    </div>
                </ModalContent>
            </ModalRoot>
        </>
    );
};
