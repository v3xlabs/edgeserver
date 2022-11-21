import { CreateDeleteAppModal } from '@components/CreateDeleteAppModal/CreateDeleteAppModal';
import { Button } from '@edgelabs/components';
import { useApp } from '@utils/queries/useApp';
import { ApplicationListData } from '@utils/queries/useApps';
import { useJWT } from '@utils/useAuth';
import { FC, useState } from 'react';

import { AppLayout } from './Layout';

const DeleteButton: FC<{ app: ApplicationListData }> = ({ app }) => {
    const { token } = useJWT();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    return (
        <div>
            <Button onPress={() => setDeleteModalOpen(true)} variant="delete">
                Delete this application
            </Button>
            {deleteModalOpen && (
                <CreateDeleteAppModal
                    app={app}
                    onClose={() => setDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export const AppSettingsPage: FC = () => {
    const app = useApp();

    return (
        <AppLayout page="settings">
            Welcome to the settings! <br />
            <h2 className="text-2xl mt-4">Danger Zone</h2>
            <div className="bg-red-500 outline outline-1 outline-red-400 rounded-md max-w-2xl mt-4 bg-opacity-10 text-black dark:text-white p-4">
                <div className="flex justify-between items-center">
                    <div className="flex-grow">
                        <h3 className="font-bold">Delete Application</h3>
                        <div>
                            Once you delete an application, there is no going
                            back.
                        </div>
                    </div>
                    <DeleteButton app={app} />
                </div>
            </div>
        </AppLayout>
    );
};
