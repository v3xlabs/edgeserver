import { createFileRoute } from '@tanstack/react-router';

import { KeyTable } from '@/gui/keys';

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/keys')({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Team Keys',
            suffix: (
                <>
                    {/* <Button
                        onClick={() => {
                            mutate({
                                name: me?.name || 'Me',
                            });
                        }}
                    >
                        Generate new key
                    </Button> */}
                </>
            ),
        };
    },
});

function RouteComponent() {
    return <KeyTable />;
}
