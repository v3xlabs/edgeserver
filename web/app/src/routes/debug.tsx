import { SCPage } from '@/layouts/SimpleCenterPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/debug')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SCPage title="Debug">
        <div className="card">
            <button className="tmpbtn">Test</button>
        </div>
    </SCPage>
  )
}
