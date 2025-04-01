import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';

import {
    useSiteKeyCreate,
    useSiteKeyDelete,
    useSiteKeys,
} from '@/api/site/keys';
import { Button } from '@/components';
import { CreateKeyModal } from '@/gui/key/CreateKeyModal';
import { KeyList } from '@/gui/key/KeyList';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/keys')({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Access Keys',
            suffix: <SiteCreateKeyModal siteId={context.params.siteId} />,
            subtitle: (
                <span>
                    <span className="text-yellow-400">⚠️ CAUTION</span> This
                    page is under construction
                </span>
            ),
        };
    },
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: siteKeys } = useSiteKeys(siteId);
    const { mutate: deleteSiteKey } = useSiteKeyDelete();

    return (
        <div className="card no-padding">
            <KeyList
                keys={siteKeys ?? []}
                onDelete={(keyId, siteId) => deleteSiteKey({ keyId, siteId })}
            />
        </div>
    );
}

const SiteCreateKeyModal: FC<{ siteId: string }> = ({ siteId }) => {
    const {
        mutate: createSiteKey,
        data: newSiteKey,
        reset,
    } = useSiteKeyCreate();

    return (
        <CreateKeyModal
            resource="site"
            resourceId={siteId}
            onSubmit={(permissions) => {
                createSiteKey({ siteId, permissions });
            }}
            onDismiss={() => {
                reset();
            }}
            newSiteKey={newSiteKey}
        >
            <Button>Generate new key</Button>
        </CreateKeyModal>
    );
};
