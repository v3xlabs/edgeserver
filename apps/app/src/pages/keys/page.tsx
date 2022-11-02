// import { Button } from '@components/Button';
import { CreateKeyModal } from '@components/CreateKeyModal/CreateKeyModal';
import { KeyModal } from '@components/KeyModal/KeyModal';
import { Container } from '@edgelabs/components';
import { Button } from '@edgelabs/components';
import { useKeys } from '@utils/queries/useKeys';
import { formatDistance } from 'date-fns';
import { FC, useMemo, useReducer, useState } from 'react';
import { AuthKey } from 'src/types/AuthKey';

const KeysTableRow: FC<{
    auth_key: AuthKey;
    onDelete: (_id: string) => void;
}> = ({ auth_key, onDelete }) => {
    const [hasDeleteOpen, setDeleteOpen] = useState(false);
    const [hasModalOpen, setModalOpen] = useState(false);
    const lastUsed = useMemo(
        () =>
            auth_key.last_use != 0 && auth_key.last_use
                ? formatDistance(new Date(auth_key.last_use), new Date()) +
                  ' ago'
                : '',
        [auth_key]
    );

    return (
        <>
            <tr
                key={auth_key.key}
                className="border border-neutral-600 h-12 cursor-pointer"
                onClick={() => setModalOpen(true)}
            >
                <td className="pl-4">{auth_key.name ?? 'No Name'}</td>
                {/* <td className="text-center">{auth_key.permissions}</td> */}
                <td className="pl-4">{auth_key.last_use && lastUsed}</td>
                {/* <td className={auth_key.exp ? '' : 'text-neutral-500'}>
                {expiresIn}
            </td> */}
                <td className="pl-4">
                    {auth_key.state == 0 ? (
                        <span>Deactivated</span>
                    ) : (
                        <div className={auth_key.exp ? 'text-purple-500' : ''}>
                            {auth_key.exp ? 'Volatile' : 'Active'}
                        </div>
                    )}
                </td>
                {/* <td className="text-center">
                <button
                    onClick={() => setDeleteOpen(true)}
                    className="hover:scale-110 hover:text-red-600 focus:text-red-600 active:text-red-600 text-red-800"
                >
                    <Trash2 size={18} />
                </button>
            </td>
            {hasDeleteOpen && (
                <DeleteKeyModal
                    key_id={auth_key.key}
                    onClose={() => setDeleteOpen(false)}
                    onDelete={onDelete}
                />
            )} */}
            </tr>

            {hasModalOpen && (
                <KeyModal
                    auth_key={auth_key}
                    onClose={() => setModalOpen(false)}
                    lastUsed={lastUsed}
                    onDelete={onDelete}
                />
            )}
        </>
    );
};

const KeysTable: FC = () => {
    const { data, isLoading } = useKeys();
    const [optimisticDeletes, addOptimisticDelete] = useReducer(
        (state: string[], deleted_key: string) => [...state, deleted_key],
        [] as string[]
    );
    const keys = useMemo(
        // eslint-disable-next-line sonarjs/cognitive-complexity
        () => {
            if (!data) return { volatile: [], active: [] };

            const base_keys = data.keys
                .filter((v) => !optimisticDeletes.includes(v.key))
                .sort((a, b) => {
                    if (a.exp && b.exp) return a.key > b.key ? -1 : 1;

                    if (a.exp) return -1;

                    if (b.exp) return 1;

                    return a.last_use > b.last_use ? -1 : 1;
                });

            return {
                volatile: base_keys.filter((v) => v.exp),
                active: base_keys.filter((v) => !v.exp),
            };
        },
        [data, optimisticDeletes]
    );

    return (
        <>
            <div className="card mt-4 p-8">
                <h3 className="text-xl w-fit px-2 border-b-black-500 border-b-2 border-spacing-2 mb-2">
                    Active Keys
                </h3>
                {/* <hr className="border-t-black-500 border-t-2" /> */}
                <table className="w-full">
                    <tbody>
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Last Used</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                        {keys.active.map((value) => (
                            <KeysTableRow
                                key={value.key}
                                auth_key={value}
                                onDelete={addOptimisticDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card mt-4 p-8">
                <h3 className="text-xl w-fit px-2 border-b-black-500 border-b-2 mb-2">
                    Volatile Keys
                </h3>
                <table className="w-full">
                    <tbody>
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Last Used</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>

                        {/* eslint-disable-next-line sonarjs/no-identical-functions */}
                        {keys.volatile.map((value) => (
                            <KeysTableRow
                                key={value.key}
                                auth_key={value}
                                onDelete={addOptimisticDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export const KeysPage: FC = () => {
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

    return (
        <Container topPadding horizontalPadding>
            <div className="flex">
                <h2 className="text-2xl flex-grow block">Keys</h2>
            </div>
            <div className="card p-4 mt-4 mb-4 flex">
                <div className="flex-1">
                    <h3 className="text-xl">Manage your keys</h3>
                    <p>
                        This page has all the keys that you have created,
                        browser keys, cli keys, and deployment keys. Use the
                        button on the right to create your own keys!
                    </p>
                </div>
                <div>
                    <Button onPress={() => setIsModalCreateOpen(true)}>
                        Create Key ➜
                    </Button>
                    {isModalCreateOpen && (
                        <CreateKeyModal
                            onClose={() => setIsModalCreateOpen(false)}
                        />
                    )}
                </div>
            </div>
            <KeysTable />
        </Container>
    );
};
