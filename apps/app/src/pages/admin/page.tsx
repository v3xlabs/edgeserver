import { Button } from '@components/Button';
import { UsersModal } from '@components/UsersModal/UsersModal';
import { User, useUsers } from '@utils/queries/useUsers';
import { FC, useState } from 'react';
import { Shield } from 'react-feather';
import { useEnsAvatar, useEnsName } from 'wagmi';

// -----------------
// Stats
// -----------------

const Information: FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl flex-grow block">Information</h2>

            <div className="flex flex-wrap gap-8">
                <div className="card overflow-hidden flex-grow">
                    <h3
                        className="text-lg col-span-2 card-bg
                            block p-2 px-4
                            border-b border-neutral-300 dark:border-neutral-700"
                    >
                        Stats
                    </h3>
                    <div className="grid grid-cols-2 bg-neutral-300 dark:bg-neutral-700  gap-[1px]">
                        {[
                            ['Applications', '-'],
                            ['Users', '-'],
                            ['Domains', '-'],
                            ['Requests/Min', '-'],
                        ].map((a, index) => (
                            <div
                                key={index}
                                className="card-bg p-2 px-4 flex flex-col"
                            >
                                <p className="text-neutral-500 flex-grow truncate">
                                    {a.at(0)}
                                </p>
                                <span>{a.at(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card overflow-hidden flex-grow">
                    <h3
                        className="text-lg col-span-2 card-bg
                            block p-2 px-4
                            border-b border-neutral-300 dark:border-neutral-700"
                    >
                        Instance Info
                    </h3>
                    <div className="grid grid-cols-2 auto-rows-fr bg-neutral-300 dark:bg-neutral-700 gap-[1px]">
                        {[
                            ['Name', '-'],
                            ['URL', '-'],
                            ['-', '-'],
                            ['-', '-'],
                        ].map((a, index) => (
                            <div key={index} className="card-bg p-2 px-4">
                                <p className="text-neutral-500 flex-grow truncate">
                                    {a.at(0)}
                                </p>
                                <span>{a.at(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// -----------------
// Users
// -----------------

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
                    <th className="p-2">Address</th>
                    <th className="p-2">User ID</th>
                    <th className="p-2">Actions</th>
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
            <div className="flex flex-col pt-4">
                <h2 className="text-2xl flex-grow block">Users</h2>
                <div className="card p-4 mt-4 mb-4 flex">
                    <div className="flex-1">
                        <h3 className="text-xl">Manage Users</h3>
                        <p>
                            This page has all the current registered users and
                            their ID&apos;s. You can add new users using the
                            button to the right.
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
            </div>
        </>
    );
};

export const AdminPage: FC = () => {
    return (
        <div className="containerd pt-8">
            <div className="containerc gap-8 flex flex-col">
                <Information />
                <Users />
            </div>
        </div>
    );
};
