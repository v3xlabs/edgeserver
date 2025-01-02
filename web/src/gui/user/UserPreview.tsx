import { FC } from 'react';

import { User, useUser } from '@/api/user';
import { AvatarGradient } from '@/components/avatar/gradient';

export const UserPreview: FC<{ user_id?: string; user?: User }> = ({
    user_id: queryUser_id,
    user: queryUser,
}) => {
    const { data } = useUser(queryUser_id || queryUser?.user_id);
    const user = data || queryUser;
    const userId = queryUser_id || user?.user_id;

    if (!userId) return;

    return (
        <div className="flex items-center gap-2">
            <div className="size-8 overflow-hidden rounded-md">
                <AvatarGradient s={userId} />
            </div>
            <p>{user?.name}</p>
        </div>
    );
};
