import { createFileRoute } from '@tanstack/react-router';
import { FiKey } from 'react-icons/fi';

import { Button } from '@/components';

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/keys')({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Access Keys',
            suffix: <Button>Generate new key</Button>,
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
    return (
        <>
            <ul className="card no-padding divide-y">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => (
                    <li key={key} className="flex gap-4 p-4">
                        <div className="py-1.5">
                            <FiKey />
                        </div>
                        <div>
                            <div className="font-mono">
                                <span>*****</span>
                                <span>8a9faa19</span>
                            </div>
                            <div>
                                Created by{' '}
                                <span className="font-bold">John Doe</span>
                            </div>
                            <div>
                                Last used <span>1 hour ago</span>
                            </div>
                        </div>
                        <div className="flex grow items-center justify-end">
                            <Button variant="destructive" size="sm">
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
