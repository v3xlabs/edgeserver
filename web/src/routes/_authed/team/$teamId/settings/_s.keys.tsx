import { createFileRoute } from '@tanstack/react-router';
import { FC } from 'react';

import {
    useTeamKeyCreate,
    useTeamKeyDelete,
    useTeamKeys,
} from '@/api/team/keys';
import { Button } from '@/components';
import { CreateKeyModal } from '@/gui/key/CreateKeyModal';
import { KeyList } from '@/gui/key/KeyList';

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/keys')({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Access Keys',
            suffix: <TeamCreateKeyModal teamId={context.params.teamId} />,
            subtitle: (
                <span>
                    <span className="text-yellow-400">⚠️ CAUTION</span> This
                    page contains sample data
                </span>
            ),
        };
    },
});

function RouteComponent() {
    const { teamId } = Route.useParams();
    const { data: teamKeys } = useTeamKeys(teamId);
    const { mutate: deleteTeamKey } = useTeamKeyDelete();

    return (
        <div className="card no-padding">
            <KeyList
                keys={teamKeys ?? []}
                onDelete={(keyId, teamId) => deleteTeamKey({ keyId, teamId })}
            />
        </div>
    );
}

const TeamCreateKeyModal: FC<{ teamId: string }> = ({ teamId }) => {
    const {
        mutate: createTeamKey,
        data: newTeamKey,
        reset,
    } = useTeamKeyCreate();

    return (
        <CreateKeyModal
            resource="team"
            resourceId={teamId}
            onSubmit={(permissions) => {
                createTeamKey({ teamId, permissions });
            }}
            onDismiss={() => {
                reset();
            }}
            newSiteKey={newTeamKey}
        >
            <Button>Generate new key</Button>
        </CreateKeyModal>
    );
};
