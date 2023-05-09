import { FC, useEffect } from 'react';
import { Outlet, useParams } from 'react-router';
import { useActiveSite, useSite } from 'src/hooks/useSite';
import { useActiveTeam } from 'src/hooks/useTeam';

export const SiteContainer: FC = () => {
    const { site_id } = useParams<{ site_id: string }>();
    const { data: siteData } = useSite(site_id);
    const { setActiveTeam } = useActiveTeam();
    const { setActiveSite } = useActiveSite();

    useEffect(() => {
        setActiveTeam(siteData?.team_id || '');
        setActiveSite(site_id || '');

        return () => {
            setActiveTeam('');
            setActiveSite('');
        };
    }, [siteData]);

    return (
        <div className="pt-14">
            <Outlet context={{}} />
        </div>
    );
};
