import { DeploymentList } from '@/gui/deployments/list';
import { FC } from 'react';
import { useParams } from 'react-router';
import { useSite } from 'src/hooks/useSite';

export const IndividualSitePage: FC = () => {
    const { site_id } = useParams<{ site_id: string }>();
    const { data } = useSite(site_id || '');

    if (!site_id) return;

    return (
        <div className="w-container">
            Site {data?.name}
            <div className="card p-4">hello</div>
            <DeploymentList site={site_id} />
        </div>
    );
};
