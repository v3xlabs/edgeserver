import { FC } from 'react';

import { useTeamMembers } from '@/api/team';
import { Button } from '@/components/button';

import { UserPreview } from './UserPreview';

export const MemberList: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: members } = useTeamMembers(team_id);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="h2">Members</h2>
                <Button>Add Member</Button>
            </div>
            {members && (
                <ul>
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
