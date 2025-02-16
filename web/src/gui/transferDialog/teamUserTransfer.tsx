import React, { useState } from 'react';

import { Button, Input } from '@/components';
import {
    AlertAction,
    AlertContent,
    AlertRoot,
    AlertTrigger,
} from '@/components/alert-dialog';

const TeamUserTransfer: React.FC<{
    prefillId?: string;
}> = ({ prefillId }) => {
    const [ownerId, setOwnerId] = useState(prefillId);

    return (
        <div className="flex gap-2">
            <Input
                value={ownerId}
                onChange={(event) => {
                    setOwnerId(event.target.value);
                }}
            />
            <AlertRoot>
                <AlertTrigger disabled={ownerId == prefillId} className="group">
                    <Button
                        className={
                            'group-disabled:cursor-not-allowed group-disabled:opacity-50'
                        }
                    >
                        Transfer
                    </Button>
                </AlertTrigger>
                <AlertContent>
                    <h1 className="h1">Change Team owner</h1>
                    <p>
                        Are you sure you want to transfer this team to{' '}
                        <span className="font-bold">{ownerId}</span>?
                    </p>
                    <AlertAction asChild>
                        <Button>Yes</Button>
                    </AlertAction>
                </AlertContent>
            </AlertRoot>
        </div>
    );
};

export default TeamUserTransfer;
