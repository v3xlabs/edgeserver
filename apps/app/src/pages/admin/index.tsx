import { Button } from '@components/Button';
import { UsersModal } from '@components/UsersModal/UsersModal';
import { User, useUsers } from '@utils/queries/useUsers';
import { FC, useState } from 'react';
import { Shield } from 'react-feather';
import { useEnsAvatar, useEnsName } from 'wagmi';

const UserRow: FC<{ value: User }> = ({ value }) => {
    const ensName = useEnsName({
        address: value.address,
    });
    const ensAvatar = useEnsAvatar({
        addressOrName: ensName.data || '',
        enabled: !!ensName.data,
    });

    return (
        <tr className="border border-neutral-600 h-12 text-left">
            <td className="p-4 flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    {ensAvatar.data && (
                        <img
                            src={ensAvatar.data}
                            className="w-full h-full"
                            alt={ensName.data || ''}
                        />
                    )}
                </div>
                <span>{ensName.data || value.address}</span>
                {value.admin && <Shield />}
            </td>
            <td className="p-4">{value.user_id}</td>
            <td className="p-4"></td>
        </tr>
    );
};

const UsersTable: FC = () => {
    const { data, isLoading } = useUsers();

    return (
        <table className="w-full">
            <thead>
                <tr className="text-left">
                    <th className="p-4">Address</th>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                {data?.map((value) => (
                    <UserRow key={value.user_id} value={value} />
                ))}
            </tbody>
        </table>
    );
};

const Users: FC = () => {
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

    return (
        <>
            <div className="flex">
                <h2 className="text-2xl flex-grow block">Users</h2>
            </div>
            <div className="card p-4 mt-4 mb-4 flex">
                <div className="flex-1">
                    <h3 className="text-xl">Manage Users</h3>
                    <p>
                        This page has all the current registred users and their
                        ID&apos;s. You can add new users using the button to the
                        right.
                    </p>
                </div>
                <div>
                    <Button
                        label={'Add User ➜'}
                        onClick={() => setIsModalCreateOpen(true)}
                    />
                    {isModalCreateOpen && (
                        <UsersModal
                            onClose={() => setIsModalCreateOpen(false)}
                        />
                    )}
                </div>
            </div>
            <div className="card mt-4 p-8">
                <UsersTable />
            </div>
        </>
    );
};

export const AdminPage: FC = () => {
    return (
        <div className="containerd">
            <div className="containerc gap-4 flex flex-col">
                <Users />
            </div>
        </div>
    );
};
