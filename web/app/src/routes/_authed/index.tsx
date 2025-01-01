import { useSites } from '@/api/site'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: sites } = useSites();

    return <div>Hello "/_authed/"! {JSON.stringify(sites)}</div>;
}
