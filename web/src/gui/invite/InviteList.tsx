import { FC } from 'react';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';

import { Invite } from '@/api/invite';
import { useTeamInvites } from '@/api/team/invite';

import { UserPreview } from '../user/UserPreview';

export const InviteList: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: invites } = useTeamInvites(team_id);

    if (!invites || invites.length === 0) {
        return <></>;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="h2">Invites</h2>
            </div>
            {invites && (
                <div className="card">
                    <div className="text-muted-foreground grid grid-cols-[1fr,1fr,1fr,32px] gap-4 border-b px-4 py-2 text-sm font-medium">
                        <div>Invited User</div>
                        <div className="text-center">Invited By</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Link</div>
                    </div>
                    <ul className="divide-y">
                        {invites.map((invite) => (
                            <InviteListItem
                                key={invite.invite_id}
                                invite={invite}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const InviteListItem: FC<{ invite: Invite }> = ({ invite }) => {
    const handleCopy = async () => {
        const inviteUrl = `${window.location.origin}/invite/${invite.invite_id}`;

        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Invite link copied to clipboard');
    };

    return (
        <li className="grid grid-cols-[1fr,1fr,1fr,32px] items-center gap-4 px-4 py-3">
            <div>
                {invite.user_id ? (
                    <UserPreview variant="inline" user_id={invite.user_id} />
                ) : (
                    <span className="pl-2 text-muted-foreground">
                        Anonymous Invite Link
                    </span>
                )}
            </div>
            <div className="text-center">
                <UserPreview variant="inline" user_id={invite.sender_id} />
            </div>
            <div className="text-center">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                    {invite.status}
                </span>
            </div>
            {invite.status === 'pending' && (
                <div>
                    <button
                        onClick={handleCopy}
                        className="text-primary hover:text-primary/80"
                    >
                        <FiCopy className="size-4" />
                    </button>
                </div>
            )}
        </li>
    );
};
