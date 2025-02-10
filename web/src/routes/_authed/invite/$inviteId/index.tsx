import { createFileRoute, Navigate } from '@tanstack/react-router';

import { getInvite, useAcceptInvite, useInvite } from '@/api';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { SCPage } from '@/layouts';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/_authed/invite/$inviteId/')({
    component: RouteComponent,
    beforeLoad: async ({ params }) => {
        const invite = await queryClient.ensureQueryData(
            getInvite(params.inviteId)
        );

        return { invite };
    },
});

function RouteComponent() {
    const { inviteId } = Route.useParams();
    const { data } = useInvite(inviteId);
    const org_name = data?.team.name;
    const { mutate: acceptInvite, data: acceptedInvite } = useAcceptInvite(
        inviteId,
        data?.team.team_id
    );

    if (acceptedInvite && data?.team.team_id) {
        return (
            <Navigate
                to={'/team/$teamId'}
                params={{ teamId: data.team.team_id }}
            />
        );
    }

    return (
        <SCPage title={`Invite to ${org_name}`} hideTitle width="lg">
            <div className="card space-y-4">
                <div className="w-full">
                    <div className="bg-muted mx-auto aspect-square size-12 overflow-hidden rounded-full">
                        <Avatar s={data?.team.team_id} />
                    </div>
                </div>
                <div className="text-center">
                    <p>
                        You have been invited to join <b>{org_name}</b>
                    </p>
                </div>
                <div className="flex w-full justify-center gap-2">
                    <Button
                        className="w-full"
                        variant="primary"
                        onClick={() => acceptInvite()}
                    >
                        Accept
                    </Button>
                    <Button className="w-full">Decline</Button>
                </div>
            </div>
        </SCPage>
    );
}
