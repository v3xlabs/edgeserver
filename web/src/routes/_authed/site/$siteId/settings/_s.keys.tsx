import { createFileRoute } from '@tanstack/react-router';

import { useKeyCreate, useMe } from '@/api';
import { Button } from '@/components/button';
import { KeyTable } from '@/gui/keys';

const GenerateButton = ({ siteId }: { siteId?: string }) => {
    const { data: me } = useMe();
    const { mutate } = useKeyCreate();

    return (
        <>
            <Button
                onClick={() => {
                    mutate({
                        name: me?.name || 'Me',
                        siteId,
                    });
                }}
            >
                Generate new key
            </Button>
        </>
    );
};

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/keys')({
    context: (context) => {
        return {
            title: 'Site keys',
            suffix: <GenerateButton siteId={context.params.siteId} />,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId } = Route.useParams();

    return <KeyTable siteId={siteId} />;
}
