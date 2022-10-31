import { CreateDeleteAppModal } from '@components/CreateDeleteAppModal/CreateDeleteAppModal';
import { NoDeployments } from '@components/NoDeployments/NoDeployments';
import { ReRender } from '@components/ReRender';
import { Tab, Tabs } from '@components/Tabs/Tabs';
import { Button } from '@edgelabs/components';
import { useApp } from '@utils/queries/useApp';
import { ApplicationListData } from '@utils/queries/useApps';
import { useDeployments } from '@utils/queries/useDeployments';
import { useJWT } from '@utils/useAuth';
import { FC, useEffect, useState } from 'react';
import { ChevronLeft } from 'react-feather';
import { Link } from 'react-router-dom';

import { DeploymentLink } from './deployments';

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

export const AppPage: FC = () => {
    const app = useApp();

    if (app.favicon_url)
        document
            .querySelector('#favicon')
            ?.setAttribute('href', app.favicon_url);

    useEffect(() => {
        return () => {
            document
                .querySelector('#favicon')
                // @ts-ignore
                ?.setAttribute('href', window.OG_FAVICON);
        };
    }, [0]);

    return (
        <div className="containerd">
            <div className="containerc pt-8 flex flex-col gap-4 relative">
                <link rel="shortcut icon" href={app.favicon_url} />
                <Link
                    to="/"
                    className="absolute -left-10 p-1 rounded-full hover:bg-black-700 transition-all hidden lg:block"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-2xl flex-grow block">{app.name}</h2>
                </div>
                <Tabs
                    labels={[
                        '🔧 Setup',
                        '🔎 Information',
                        '🐛 Debug',
                        '⚙️ Settings',
                    ]}
                    defaultTab={app.last_deploy ? 1 : 0}
                >
                    <Tab>
                        <NoDeployments app_id={app.app_id} />
                    </Tab>
                    <Tab>Welcome to your Application</Tab>
                    <Tab>
                        Please ignore the following debug information <br />
                        App ID: {app.app_id}
                        <br />
                        Owner: {app.owner_id}
                        <br />
                        Domain: {app.domain_id}
                        <br />
                        <div>
                            <ReRender app_id={app.app_id} />
                        </div>
                    </Tab>
                    <Tab>
                        Welcome to the settings! <br />
                        <h2 className="text-2xl mt-4">Danger Zone</h2>
                        <div className="bg-red-500 outline outline-1 outline-red-400 rounded-md max-w-2xl mt-4 bg-opacity-10 text-black dark:text-white p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex-grow">
                                    <h3 className="font-bold">
                                        Delete Application
                                    </h3>
                                    <div>
                                        Once you delete an application, there is
                                        no going back.
                                    </div>
                                </div>
                                <DeleteButton app={app} />
                            </div>
                        </div>
                    </Tab>
                </Tabs>

                {app.last_deploy && <AppDeploymentList app={app} />}
            </div>
        </div>
    );
};

const AppDeploymentList: FC<{ app: ApplicationListData }> = ({ app }) => {
    const { deployments, error, loading } = useDeployments(app.app_id, 3);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between">
                <h2 className="text-2xl">Recent Deployments</h2>
                <Link to={`/app/${app.app_id}/deployments`}>
                    <Button>Deployments ➜</Button>
                </Link>
            </div>
            {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                    <div className="p-4 skeleton card flex h-32" key={index} />
                ))}
            {!loading &&
                deployments &&
                deployments.length > 0 &&
                deployments.map((deployment, index) => (
                    <DeploymentLink
                        app_id={app.app_id}
                        deployment={deployment}
                        key={index}
                    />
                ))}
        </div>
    );
};
