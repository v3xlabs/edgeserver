import { createFileRoute } from '@tanstack/react-router'

import { DeploymentList } from '@/gui/deployments/DeploymentList'
import { SCPage } from '@/layouts'

export const Route = createFileRoute('/_authed/site/$siteId/_site/deployments')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { siteId } = Route.useParams()

  return (
    <SCPage title="Deployments">
      <DeploymentList siteId={siteId} showHeader={false} />
    </SCPage>
  )
}
