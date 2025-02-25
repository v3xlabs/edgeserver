import { createFileRoute } from '@tanstack/react-router';

import { useMe, useTokenCreate } from '@/api';
import { Button } from '@/components/button';
import { KeyTable } from '@/gui/keys';

const GenerateButton = ({ siteId }: { siteId?: string }) => {
    const { data: me } = useMe();
    const { mutate } = useTokenCreate();

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

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/keys')({
    component: RouteComponent,
    context() {
        return {
            title: 'Team Keys',
            suffix: (
                <>
                    <GenerateButton />
                </>
            ),
        };
    },
});

function RouteComponent() {
    return <KeyTable />;
}
