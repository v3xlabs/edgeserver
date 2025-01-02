import { createFileRoute } from '@tanstack/react-router';

import { BootstrapNewUser } from '@/gui/bootstrap';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/bootstrap')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Setup your instance" width="md">
            <BootstrapNewUser />
        </SCPage>
    );
}
