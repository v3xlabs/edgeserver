import { Tab, Tabs } from '@components/Tabs/Tabs';
import { Button, Container } from '@edgelabs/components';
import { useApp } from '@utils/queries/useApp';
import { ApplicationListData } from '@utils/queries/useApps';
import { useDeployments } from '@utils/queries/useDeployments';
import { FC, ReactNode } from 'react';
import { ChevronLeft } from 'react-feather';
import { Link } from 'react-router-dom';

import { DeploymentLink } from './deployments';

type AppLayoutPages = '/' | 'information' | 'debug' | 'settings';

const TabsData: { label: string; page: AppLayoutPages }[] = [
    { label: '🔧 Setup', page: '/' },
    { label: '🔎 Information', page: 'information' },
    { label: '🐛 Debug', page: 'debug' },
    { label: '⚙️ Settings', page: 'settings' },
];

export const AppLayout: FC<{ children: ReactNode; page: AppLayoutPages }> = ({
    children,
    page,
}) => {
    const app = useApp();

    return (
        <Container topPadding horizontalPadding>
            <div className="flex flex-col gap-4 relative">
                <link rel="shortcut icon" href={app.favicon_url} />
                <Link
                    to="/"
                    className="absolute -left-10 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all hidden lg:block"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-2xl flex-grow block">{app.name}</h2>
                </div>
                <Tabs
                    indexPage={'/app/' + app.app_id}
                    data={TabsData}
                    activePage={page}
                >
                    <Tab>{children}</Tab>
                </Tabs>

                {app.last_deploy && <AppDeploymentList app={app} />}
            </div>
        </Container>
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
