import { FC } from 'react';

import { useTeamMembers } from '@/api/team';

import { UserPreview } from './UserPreview';

export const MemberList: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: members } = useTeamMembers(team_id);

    return (
        <div className="space-y-2">
            {members && (
                <ul className="divide-y">
                    {members.map((member) => (
                        <li key={member.user_id}>
                            <UserPreview user={member} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
