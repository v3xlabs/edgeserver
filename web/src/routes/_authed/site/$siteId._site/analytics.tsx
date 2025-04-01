import { createFileRoute } from '@tanstack/react-router'
import { LuBarChart } from 'react-icons/lu'

import { SCPage } from '@/layouts'

export const Route = createFileRoute('/_authed/site/$siteId/_site/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SCPage title="Analytics">
      <div className="card flex flex-row items-center justify-center gap-2">
        <LuBarChart className="text-4xl" />
        <div className="flex flex-col justify-center gap-1">
          <div className="text-base font-bold">Coming soon</div>
          <div className="text-sm text-gray-500">We&apos;re working on it!</div>
        </div>
      </div>
    </SCPage>
  )
}
