import React, { useState } from 'react';

import { Button, TeamSelect } from '@/components';
import {
    AlertAction,
    AlertContent,
    AlertRoot,
    AlertTrigger,
} from '@/components/alert-dialog';

const SiteTeamTransfer: React.FC<{
    prefillId?: string;
}> = ({ prefillId }) => {
    const [teamId, setTeamId] = useState(prefillId);

    return (
        <div className="flex gap-2">
            <TeamSelect value={teamId} onChange={setTeamId} />
            <AlertRoot>
                <AlertTrigger disabled={teamId == prefillId} className="group">
                    <Button
                        className={
                            'group-disabled:cursor-not-allowed group-disabled:opacity-50'
                        }
                    >
                        Transfer
                    </Button>
                </AlertTrigger>
                <AlertContent>
                    <h1 className="h1">Transfer a site</h1>
                    <p>
                        Are you sure you want to transfer this site to{' '}
                        <span className="font-bold">{teamId}</span>?
                    </p>
                    <AlertAction asChild>
                        <Button>Yes</Button>
                    </AlertAction>
                </AlertContent>
            </AlertRoot>
        </div>
    );
};

export default SiteTeamTransfer;
