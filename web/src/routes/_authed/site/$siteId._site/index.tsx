import { createFileRoute, Link } from '@tanstack/react-router'
import { FC } from 'react'

import { getSite, useSite, useSiteDomains } from '@/api'
import { Button } from '@/components'
import { DeploymentList } from '@/gui/deployments/DeploymentList'
import { SCPage } from '@/layouts'
import { queryClient } from '@/util/query'

import { MiniDomainPreview } from './settings/_s.domains'

export const Route = createFileRoute('/_authed/site/$siteId/_site/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { siteId } = params

    await queryClient.ensureQueryData(getSite(siteId))
  },
})

function RouteComponent() {
  const { siteId } = Route.useParams()
  const { data: site } = useSite(siteId)

  return (
    <SCPage title={site?.name ?? 'Site'}>
      <div className="flex w-full gap-4">
        <div className="card grow">This is the site page</div>
        <SiteDomainsListPreview siteId={siteId} />
      </div>
      <DeploymentList siteId={siteId} max={3} />
    </SCPage>
  )
}

export const SiteDomainsListPreview: FC<{
  siteId: string
}> = ({ siteId }) => {
  const { data: domains } = useSiteDomains(siteId)

  return (
    <div className="card">
      <div className="font-bold">Domains</div>
      <ul className="flex flex-col gap-2 md:min-w-60">
        {domains?.map((domain) => (
          <li key={domain.domain}>
            <MiniDomainPreview domain={domain} />
          </li>
        ))}
        {domains?.length === 0 && (
          <div className="space-y-2">
            <div className="text-muted">No domains found</div>
            <div className="flex justify-end">
              <Button asChild>
                <Link to="/site/$siteId/settings/domains" params={{ siteId }}>
                  Add a domain
                </Link>
              </Button>
            </div>
          </div>
        )}
      </ul>
    </div>
  )
}
