import { FC } from 'react';
import { FiKey } from 'react-icons/fi';
import { LuFileKey, LuKey } from 'react-icons/lu';

import { components } from '@/api/schema.gen';
import { ConfirmModal } from '@/components/alert-dialog/ConfirmModal';
import { Button } from '@/components/button';

export type Key = components['schemas']['Key'];

export const KeyList: FC<{
    keys: Key[];
    onDelete?: (keyId: string, resourceId: string) => void;
}> = ({ keys, onDelete }) => {
    return (
        <ul className="divide-y">
            {keys?.length === 0 && (
                <li className="p-4">
                    <p>No keys found, try creating one!</p>
                </li>
            )}
            {keys?.map((key) => (
                <KeyPreview key={key.key_id} data={key} onDelete={onDelete} />
            ))}
        </ul>
    );
};

const KeyPreview: FC<{
    data: Key;
    onDelete?: (keyId: string, resourceId: string) => void;
}> = ({ data, onDelete }) => {
    return (
        <li key={data.key_id} className="flex gap-4 p-4">
            <div className="py-1.5">
                {data.key_type == 'site' ? (
                    <FiKey />
                ) : data.key_type == 'team' ? (
                    <LuKey />
                ) : (
                    <LuFileKey />
                )}
            </div>
            <div>
                <div className="font-mono">
                    <span>k_{data.key_type}_</span>
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
                    title="Are you sure you want to revoke this key?"
                    description="This action cannot be undone."
                    onConfirm={() => {
                        onDelete?.(data.key_id, data.key_resource);
                    }}
                >
                    <Button variant="destructive" size="sm">
                        Revoke
                    </Button>
                </ConfirmModal>
            </div>
        </li>
    );
};
