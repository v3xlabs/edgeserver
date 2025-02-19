import { createFileRoute } from '@tanstack/react-router';

import { UserList } from '@/gui/user/UserList';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/_authed/admin/_a/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Administration">
            <div className="card">Hello Administrator!</div>
            <UserList />
        </SCPage>
    );
}
