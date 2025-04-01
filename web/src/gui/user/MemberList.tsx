import { FC } from 'react';

import { useTeamMembers } from '@/api/team';

import { UserPreview } from './UserPreview';

export const MemberList: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: members } = useTeamMembers(team_id);

    return (
        <>
            {members && (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                        <li key={member.user_id}>
                            <UserPreview user={member} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};
