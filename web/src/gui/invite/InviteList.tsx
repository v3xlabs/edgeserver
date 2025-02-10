import { Link } from '@tanstack/react-router';
import { FC } from 'react';

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
                <ul className="card divide-y">
                    {invites.map((invite) => (
                        <InviteListItem
                            key={invite.invite_id}
                            invite={invite}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

const InviteListItem: FC<{ invite: Invite }> = ({ invite }) => {
    return (
        <li className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
            <div>
                {invite.user_id ? (
                    <div className="flex items-center gap-2">
                        <UserPreview user_id={invite.user_id} />
                        <div>invited by</div>
                        <div>
                            <UserPreview user_id={invite.sender_id} />
                        </div>
                    </div>
                ) : (
                    <>Anonymous Invite Link</>
                )}
            </div>
            {invite.status === 'pending' && (
                <>
                    <Link
                        to={'/invite/$inviteId'}
                        params={{ inviteId: invite.invite_id }}
                    >
                        {invite.invite_id}
                    </Link>
                </>
            )}
        </li>
    );
};
