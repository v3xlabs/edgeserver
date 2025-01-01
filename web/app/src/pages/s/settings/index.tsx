import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { useActiveSite } from 'src/hooks/useSite';
import { useActiveTeam } from 'src/hooks/useTeam';

import { DomainManager } from '@/components/domains/DomainManager';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { TokenManager } from '@/components/token/manager';

export const SiteSettingsPage: FC = () => {
    const { team_id } = useActiveTeam();
    const { activeSite } = useActiveSite();

    return (
        <div className="w-container">
            <SettingsSection title="General"></SettingsSection>
            <SettingsSection title="Domains">
                <DomainManager site_id={activeSite} />
            </SettingsSection>
            <SettingsSection title="API Keys">
                <TokenManager team_id={team_id} site_id={activeSite} />
            </SettingsSection>
            <SettingsSection title="Organization-wide Settings">
                <p>
                    To view Organization-wide settings, check{' '}
                    <Link to={`/t/${team_id}`} className="link">
                        here
                    </Link>
                    .
                </p>
            </SettingsSection>
        </div>
    );
};
