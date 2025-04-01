import { createFileRoute } from '@tanstack/react-router'
import { LuHammer } from 'react-icons/lu'

export const Route = createFileRoute(
  '/_authed/site/$siteId/_site/settings/_s/actions',
)({
  component: RouteComponent,
  context: () => ({
    title: 'Actions',
    subtitle: 'Administrative (and destructive) actions',
  }),
})

function RouteComponent() {
  return (
    <div className="card flex flex-row items-center justify-center gap-2">
      <LuHammer className="text-4xl" />
      <div className="flex flex-col justify-center gap-1">
        <div className="text-base font-bold">Coming soon</div>
        <div className="text-sm text-gray-500">We&apos;re working on it!</div>
      </div>
    </div>
  )
}
