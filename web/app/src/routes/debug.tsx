import { createFileRoute } from '@tanstack/react-router';

import {
    Avatar,
    Button,
    ModalClose,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalRoot,
    ModalTitle,
    ModalTrigger,
} from '@/components';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/debug')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Debug">
            <div className="card space-y-4">
                <div className="flex gap-2">
                    {[
                        ['https://luc.computer/1_by_1.png', 'luc.computer'],
                        ['https://github.com/svemat01.png', 'helgesson'],
                    ].map(([source, s]) => (
                        <div
                            className="size-16 overflow-hidden rounded-md"
                            key={s}
                        >
                            <Avatar src={source} s={s} />
                        </div>
                    ))}
                </div>
                <Button variant="ghost">Test</Button>
            </div>
            <div className="card">
                <ModalRoot>
                    <ModalTrigger>
                        <Button>Test</Button>
                    </ModalTrigger>
                    <ModalContent>
                        <ModalTitle>Title of the Modal</ModalTitle>
                        <ModalDescription>
                            Description of the Modal
                        </ModalDescription>
                        <ModalFooter>
                            <ModalClose>
                                <Button>Close</Button>
                            </ModalClose>
                        </ModalFooter>
                    </ModalContent>
                </ModalRoot>
            </div>
        </SCPage>
    );
}
