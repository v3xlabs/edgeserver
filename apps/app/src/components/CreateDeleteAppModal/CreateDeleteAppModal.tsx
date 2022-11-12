import { Modal } from '@components/Modal';
import { Button } from '@edgelabs/components';
import { environment } from '@utils/enviroment';
import { ApplicationListData } from '@utils/queries/useApps';
import { useJWT } from '@utils/useAuth';
import decode from 'jwt-decode';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useSignMessage } from 'wagmi';

type StatusStates = 'waiting' | 'signing' | 'canceled' | 'error';

const DeleteButton: FC<{
    app_id: string;
    setStatus: Dispatch<SetStateAction<StatusStates>>;
    loading: boolean;
}> = ({ app_id, loading, setStatus }) => {
    const { data: signedData, signMessageAsync } = useSignMessage();
    const { token } = useJWT();
    const navigate = useNavigate();

    const { data, mutate, isLoading, error } = useMutation(
        `/app/${app_id}/deploys/ls`,
        {
            mutationFn: async (body: string) => {
                if (!app_id) return;

                const response = await fetch(
                    environment.API_URL + '/api/apps/' + app_id + '/delete',
                    {
                        method: 'DELETE',
                        body,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );

                if (response.status === 200) {
                    return response.text();
                }

                throw new Error('Failed to delete app');
            },
            onSuccess: () => {
                navigate('/');
            },
            onError: () => {
                setStatus('error');
            },
        }
    );

    const deleteApp = async () => {
        setStatus('signing');

        const decodedToken = decode(token) as {
            exp?: number;
            iat: number;
            instance_id: string;
            key: string;
            owner_id: string;
        };

        const payload = {
            action: 'DELETE_APP',
            owner_id: decodedToken.owner_id,
            instance_id: decodedToken.instance_id,
            app_id,
        };
        const stringified_payload = JSON.stringify(payload, undefined, 2);
        const signed_key_request = await signMessageAsync({
            message: stringified_payload,
        }).catch(() => {});

        if (!signed_key_request) {
            setStatus('canceled');

            return;
        }

        const body = JSON.stringify({
            message: stringified_payload,
            payload,
            signature: signed_key_request,
        });

        mutate(body);
    };

    return (
        <Button
            onPress={() => deleteApp()}
            variant="delete"
            loading={loading}
            isDisabled={loading}
        >
            {loading ? 'Waiting for signed message' : 'Yes, delete my app'}
        </Button>
    );
};

export const CreateDeleteAppModal: FC<{
    app: ApplicationListData;
    onClose: () => void;
}> = ({ onClose, app }) => {
    const [status, setStatus] = useState<StatusStates>('waiting');

    return (
        <Modal label={'Caution!'} onClose={() => onClose()}>
            {(status === 'waiting' || status == 'signing') && (
                <>
                    Are you totally sure you want to delete{' '}
                    <span className="font-bold">{app.name}</span>?
                    <div className="w-full flex justify-end mt-4">
                        <DeleteButton
                            app_id={app.app_id}
                            setStatus={setStatus}
                            loading={status === 'signing'}
                        />
                    </div>
                </>
            )}
            {status === 'canceled' && (
                <>
                    <p className="text-red-500">
                        You canceled the deletion of your app.
                    </p>
                    <div className="w-full flex justify-end mt-4">
                        <Button
                            onPress={() => onClose()}
                            variant="primary"
                            loading={false}
                        >
                            Close
                        </Button>
                    </div>
                </>
            )}
            {status === 'error' && (
                <>
                    <p className="text-red-500">
                        Something went wrong while deleting your app.
                    </p>
                    <div className="w-full flex justify-end mt-4">
                        <Button
                            onPress={() => onClose()}
                            variant="primary"
                            loading={false}
                        >
                            Close
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};
