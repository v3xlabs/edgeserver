import { Input } from '@/gui/input/Input'
import { SCPage } from '@/layouts/SimpleCenterPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/bootstrap')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SCPage title="Setup your instance" width='md'>
        <div className="card space-y-4">
            <p>
                Welcome to edgeserver! Get started by creating a user account below.
            </p>
            <div className="space-y-2 w-full">
                <div className="space-y-2 w-full">
                    <label htmlFor="username">Username</label>
                    <Input type="text" placeholder="Username" className='w-full' />
                </div>
                <div className="space-y-2 w-full">
                    <label htmlFor="password">Password</label>
                    <Input type="password" placeholder="Password" className='w-full' />
                </div>
                <div className="space-y-2 w-full">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <Input type="password" placeholder="Confirm Password" className='w-full' />
                </div>
            </div>
            <button className="tmpbtn w-full">Create Account</button>
        </div>
    </SCPage>
  )
}
