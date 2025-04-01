import { createFileRoute, Outlet } from '@tanstack/react-router';
import { FC, useEffect } from 'react';

import { useDeploymentPreviews, useSiteDeployments } from '@/api';

export const Route = createFileRoute('/_authed/site/$siteId/_site')({
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId } = Route.useParams();

    return (
        <>
            <LatestDeploymentFavicon siteId={siteId} />
            <Outlet />
        </>
    );
}

const LatestDeploymentFavicon: FC<{ siteId: string }> = ({ siteId }) => {
    const { data: deployments } = useSiteDeployments(siteId);

    const latestDeployment = deployments?.[0];

    const { data: previews } = useDeploymentPreviews(
        siteId,
        latestDeployment?.deployment_id ?? ''
    );

    const favicon = previews?.[0]?.favicon_path;

    useEffect(() => {
        if (favicon) {
            const link = document.querySelector(
                'link[rel="icon"]#site-favicon'
            );

            if (link) {
                // @ts-ignore
                link.href = favicon;
            } else {
                const link = document.createElement('link');

                link.setAttribute('rel', 'icon');
                link.setAttribute('href', favicon);
                // link.setAttribute('id', 'site-favicon');
                link.id = 'site-favicon';

                document.head.append(link);
            }

            // change all other favicons to rel="_icon"
            const otherFavicons = document.querySelectorAll('link[rel="icon"]');

            for (const icon of otherFavicons) {
                if (icon.id !== 'site-favicon') {
                    icon.setAttribute('rel', '_icon');
                }
            }

            return () => {
                if (link) {
                    link.remove();
                }

                const otherFavicons2 =
                    document.querySelectorAll('link[rel="_icon"]');

                // restore all favicons to rel="icon"
                for (const icon of otherFavicons2) {
                    if (icon.id !== 'site-favicon') {
                        icon.setAttribute('rel', 'icon');
                    }
                }
            };
        }
    }, [favicon]);

    return <></>;
};
