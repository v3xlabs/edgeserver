import '@rainbow-me/rainbowkit/styles.css';

import { AdminPage } from '@pages/admin';
import { AppPage } from '@pages/app';
import { AppContainer } from '@pages/app/_container';
import { CreateAppPage } from '@pages/app/create/create';
import { DeploymentPage } from '@pages/app/deploy/deployment';
import { AppDeploymentsPage } from '@pages/app/deployments';
import { AppSettingsPage } from '@pages/app/settings';
import { KeysPage } from '@pages/keys';
import { SettingsPage } from '@pages/settings';
import { FC } from 'react';
import { Route, Routes } from 'react-router';

import { Navbar } from './components/Navbar/Navbar';
import { Home } from './pages';
import { DomainsPage } from '@pages/domains';
import { DomainContainer } from '@pages/domain/_container';

export const App: FC = () => {
    return (
        <div className="w-full max-w-full min-h-screen bg-neutral-50 dark:bg-black-900">
            <Navbar />
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
            <div className="w-full h-28 flex flex-end justify-center items-end pb-8 brightness-50">
                <p className="w-fit">EDGESERVER.IO - Signal</p>
            </div>
        </div>
    );
};
