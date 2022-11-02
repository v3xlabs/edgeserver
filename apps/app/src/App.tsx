import '@rainbow-me/rainbowkit/styles.css';

import { Container } from '@edgelabs/components';
import { AdminPage } from '@pages/admin/page';
import { AppContainer } from '@pages/app/[app]/_container';
import { CreateAppPage } from '@pages/app/[app]/create/create';
import { DeploymentPage } from '@pages/app/[app]/deploy/deployment';
import { AppDeploymentsPage } from '@pages/app/[app]/deployments';
import { AppPage } from '@pages/app/[app]/page';
import { AppSettingsPage } from '@pages/app/[app]/settings';
import { DomainContainer } from '@pages/domains/[domain]/_container';
import { DomainsPage } from '@pages/domains/page';
import { KeysPage } from '@pages/keys/page';
import { SettingsPage } from '@pages/settings/page';
import { FC } from 'react';
import { Route, Routes } from 'react-router';

import { Navbar } from './components/Navbar/Navbar';
import { Home } from './pages/page';

export const App: FC = () => {
    return (
        <div className="w-full max-w-full min-h-screen bg-neutral-50 dark:bg-black-900">
            <Navbar />

            <Container topPadding horizontalPadding>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="keys" element={<KeysPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="app/new" element={<CreateAppPage />} />
                    <Route path="app/:app_id" element={<AppContainer />}>
                        <Route path="" element={<AppPage />} />
                        <Route
                            path="deployments"
                            element={<AppDeploymentsPage />}
                        />
                        <Route
                            path="deployment/:deploy_id"
                            element={<DeploymentPage />}
                        />
                        <Route path="settings" element={<AppSettingsPage />} />
                    </Route>
                    <Route path="domains" element={<DomainsPage />} />
                    <Route path="domain/:app_id" element={<DomainContainer />}>
                        <Route path="" element={<AppPage />} />
                        <Route path="settings" element={<AppSettingsPage />} />
                    </Route>
                </Routes>
            </Container>
            <div className="w-full h-28 flex flex-end justify-center items-end pb-8 brightness-50">
                <p className="w-fit">EDGESERVER.IO - Signal</p>
            </div>
        </div>
    );
};
