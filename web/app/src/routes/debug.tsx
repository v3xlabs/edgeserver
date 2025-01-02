import { Avatar } from '@/components'
import { SCPage } from '@/layouts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/debug')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <SCPage title="Debug">
            <div className="card space-y-4">
                <div className="flex gap-2">
                    {
                        [
                            ["https://luc.computer/1_by_1.png", "luc.computer"],
                            ["https://github.com/svemat01.png", "helgesson"],
                        ].map(([src, s]) => (
                            <div className="size-16 rounded-md overflow-hidden">
                                <Avatar src={src} s={s} />
                            </div>
                        ))
                    }
                </div>
                <button className="tmpbtn">Test</button>
            </div>
        </SCPage>
    )
}
