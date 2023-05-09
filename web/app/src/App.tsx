import { IndividualSitePage } from '@pages/s';
import { SiteContainer } from '@pages/s/_container';
import { SiteAnalyticsPage } from '@pages/s/analytics';
import { SiteMembersPage } from '@pages/s/members';
import { SiteSettingsPage } from '@pages/s/settings';
import { TeamPage } from '@pages/t';
import { TeamContainer } from '@pages/t/_container';
import { TeamMembersPage } from '@pages/t/members';
import { TeamSettingsPage } from '@pages/t/settings';
import { FC } from 'react';
import { Route, Routes } from 'react-router';

import { Navbar } from './components/Navbar/Navbar';
import { Home } from './pages';

export const App: FC = () => {
    return (
        <div className="dark:bg-black-900 min-h-screen w-full max-w-full bg-neutral-50">
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="s/:site_id" element={<SiteContainer />}>
                    <Route path="" element={<IndividualSitePage />} />
                    <Route path="analytics" element={<SiteAnalyticsPage />} />
                    <Route path="members" element={<SiteMembersPage />} />
                    <Route path="settings" element={<SiteSettingsPage />} />
                </Route>
                <Route path="t/:team_id" element={<TeamContainer />}>
                    <Route path="" element={<TeamPage />} />
                    <Route path="members" element={<TeamMembersPage />} />
                    <Route path="settings" element={<TeamSettingsPage />} />
                </Route>
            </Routes>
            <div className="flex-end flex h-28 w-full items-end justify-center pb-8 brightness-50">
                <p className="w-fit">EDGESERVER.IO - Signal</p>
            </div>
        </div>
    );
};
