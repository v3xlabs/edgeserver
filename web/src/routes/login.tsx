import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '@/gui/login';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/login')({
    component: RouteComponent,
    validateSearch: (search) => {
        if (search.redirect) {
            return { redirect: search.redirect };
        }
    },
});

function RouteComponent() {
    return (
        <SCPage title="Login" width="md">
            <LoginForm />
        </SCPage>
    );
}
