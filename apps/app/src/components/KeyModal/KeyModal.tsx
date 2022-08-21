/* eslint-disable sonarjs/no-duplicate-string */
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { formatDistance } from 'date-fns';
import { FC, useCallback, useMemo, useState } from 'react';
import { Trash2 } from 'react-feather';
import { AuthKey } from 'src/types/AuthKey';

export const KeyModal: FC<{
    onClose: () => void;
    auth_key: AuthKey;
    lastUsed: string;
    onDelete: (_id: string) => void;
}> = ({ onClose, auth_key, lastUsed, onDelete }) => {
    const { token } = useJWT();
    const [hasDeleteOpen, setDeleteOpen] = useState(false);

    const deleteKey = useCallback(async () => {
        const delete_response = await fetch(environment.API_URL + '/api/keys', {
            method: 'DELETE',
            body: JSON.stringify({
                key_id: auth_key.key,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });

        onClose();
        onDelete(auth_key.key);

        if (delete_response.status == 200) return true;

        return false;
    }, []);

    const expiresIn = useMemo(
        () =>
            auth_key.exp && auth_key.exp != 1
                ? 'in ' +
                  formatDistance(
                      new Date(Number.parseInt(auth_key.exp.toString())),
                      Date.now()
                  )
                : 'Never',
        [auth_key]
    );

    return (
        <Modal label={auth_key.name ?? 'No Name'} onClose={onClose}>
            <div className="flex flex-col gap-2">
                <p>📅&nbsp;&nbsp;Used {auth_key.last_use && lastUsed}</p>

                <p>⌛&nbsp;&nbsp;Expires {expiresIn}</p>

                <p>
                    🪧&nbsp;&nbsp;
                    {auth_key.state == 0 ? (
                        <span>Deactivated</span>
                    ) : (
                        <span className={auth_key.exp ? 'text-purple-500' : ''}>
                            {auth_key.exp ? 'Volatile' : 'Active'}
                        </span>
                    )}
                </p>

                <p>🔒&nbsp;&nbsp;{auth_key.permissions}</p>

                <p>🔑&nbsp;&nbsp;{auth_key.key}</p>

                {!hasDeleteOpen ? (
                    <button
                        onClick={() => setDeleteOpen(true)}
                        className="hover:text-red-600 focus:text-red-600 active:text-red-600 text-red-800 ml-auto"
                    >
                        <Trash2 size={20} />
                    </button>
                ) : (
                    <div className="flex justify-around gap-4">
                        <Button
                            label="Delete"
                            variant="delete"
                            className="w-full text-center"
                            onClick={() => {
                                deleteKey();
                            }}
                        />
                        <Button
                            label="Cancel"
                            variant="add"
                            className="w-full text-center"
                            onClick={() => setDeleteOpen(false)}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};
