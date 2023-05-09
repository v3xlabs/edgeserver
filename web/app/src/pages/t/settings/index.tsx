import { SettingsSection } from '@components/settings/SettingsSection';
import { TokenManager } from '@components/token/manager';
import { FC } from 'react';
import { useActiveTeam } from 'src/hooks/useTeam';

export const TeamSettingsPage: FC = () => {
    const { team_id } = useActiveTeam();

    return (
        <div className="w-container">
            <SettingsSection title="General"></SettingsSection>
            <SettingsSection title="General"></SettingsSection>
            <SettingsSection title="API Keys">
                <TokenManager team_id={team_id} />
            </SettingsSection>
        </div>
    );
};
