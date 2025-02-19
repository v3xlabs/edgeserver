import { useUsers } from '@/api';

import { UserPreview } from './UserPreview';

export const UserList = () => {
    const { data: users } = useUsers();

    return (
        <div className="card no-padding">
            <h3 className="border-b p-4 font-bold">Users</h3>
            <ul>
                {users?.map((user) => (
                    <li
                        key={user.user_id}
                        className="flex items-center justify-between p-4"
                    >
                        <div>
                            <div>{user.user_id}</div>
                            <div>{user.name}</div>
                        </div>
                        <UserPreview user_id={user.user_id} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
