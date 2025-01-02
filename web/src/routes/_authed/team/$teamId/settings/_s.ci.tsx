import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/ci')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="card">CI go here</div>
}
