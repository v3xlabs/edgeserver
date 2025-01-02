import { createFileRoute } from '@tanstack/react-router';

import { Avatar, Button } from '@/components';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/debug')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Debug">
            <div className="card space-y-4">
                <div className="flex gap-2">
                    {[
                        ['https://luc.computer/1_by_1.png', 'luc.computer'],
                        ['https://github.com/svemat01.png', 'helgesson'],
                    ].map(([source, s]) => (
                        <div
                            className="size-16 overflow-hidden rounded-md"
                            key={s}
                        >
                            <Avatar src={source} s={s} />
                        </div>
                    ))}
                </div>
                <Button className="tmpbtn">Test</Button>
            </div>
        </SCPage>
    );
}
