import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC } from 'react';

import { User, useUser } from '@/api/user';
import { AvatarGradient } from '@/components/avatar/gradient';

export const UserPreview: FC<{
    user_id?: string;
    user?: User;
    variant?: 'default' | 'small' | 'inline';
}> = ({ user_id: queryUser_id, user: queryUser, variant = 'default' }) => {
    const { data } = useUser(queryUser_id || queryUser?.user_id);
    const user = data || queryUser;
    const userId = queryUser_id || user?.user_id;

    if (!userId) return;

    return (
        <Link
            to="/"
            className={clsx(
                'card items-center gap-2',
                variant === 'small' && 'size-8',
                variant === 'inline'
                    ? 'no-padding mx-1 inline-flex gap-1 px-1.5 py-0.5'
                    : 'flex'
            )}
        >
            <div
                className={clsx(
                    'overflow-hidden rounded-md',
                    variant === 'small' && 'size-6',
                    variant === 'inline' && 'size-4',
                    variant === 'default' && 'size-8'
                )}
            >
                <AvatarGradient s={userId} />
            </div>
            <p>{user?.name}</p>
        </Link>
    );
};
