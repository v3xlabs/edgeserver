import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/keys')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="card">Domains go here</div>
}
