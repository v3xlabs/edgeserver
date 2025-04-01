import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';
import { FiKey } from 'react-icons/fi';

import {
    SiteKey,
    useSiteKeyCreate,
    useSiteKeyDelete,
    useSiteKeys,
} from '@/api/site/keys';
import { Button } from '@/components';
import { ConfirmModal } from '@/components/alert-dialog/ConfirmModal';
import { CreateKeyModal } from '@/gui/key/CreateKeyModal';

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

    return (
        <div className="card no-padding">
            <ul className="divide-y">
                {siteKeys?.length === 0 && (
                    <li className="p-4">
                        <p>No keys found, try creating one!</p>
                    </li>
                )}
                {siteKeys?.map((key) => (
                    <SiteKeyPreview
                        key={key.key_id}
                        data={key}
                        siteId={siteId}
                    />
                ))}
            </ul>
        </div>
    );
}

const SiteKeyPreview: FC<{ data: SiteKey; siteId: string }> = ({
    data,
    siteId,
}) => {
    const { mutate: deleteSiteKey } = useSiteKeyDelete();

    return (
        <li key={data.key_id} className="flex gap-4 p-4">
            <div className="py-1.5">
                <FiKey />
            </div>
            <div>
                <div className="font-mono">
                    <span>k_site_</span>
                    <span>{data.vanity}</span>
                </div>
                <div>
                    Created by{' '}
                    <span className="font-bold">{data.created_by}</span>
                </div>
                <div>
                    Last used <span>1 hour ago</span>
                </div>
            </div>
            <div className="flex grow items-center justify-end">
                <ConfirmModal
                    title="Are you sure you want to delete this key?"
                    description="This action cannot be undone."
                    onConfirm={() => {
                        deleteSiteKey({ siteId, keyId: data.key_id });
                    }}
                >
                    <Button variant="destructive" size="sm">
                        Delete
                    </Button>
                </ConfirmModal>
            </div>
        </li>
    );
};

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
