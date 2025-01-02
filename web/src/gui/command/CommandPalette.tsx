import { Command } from 'cmdk';
import { useEffect, useState } from 'react';

import { ModalContent } from '@/components';
import { ModalRoot } from '@/components/modal';

export const CommandPalette = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (event: KeyboardEvent) => {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                event.stopPropagation();
                setOpen((open) => !open);
            }
        };

        window.addEventListener('keydown', down);

        return () => window.removeEventListener('keydown', down);
    }, []);

    return (
        <ModalRoot open={open} onOpenChange={setOpen}>
            <ModalContent>
                <Command label="Global Command Palette">
                    <Command.Input />
                    <Command.List>
                        <Command.Empty>No results found.</Command.Empty>

                        <Command.Group heading="Letters">
                            <Command.Item>a</Command.Item>
                            <Command.Item>b</Command.Item>
                            <Command.Separator />
                            <Command.Item>c</Command.Item>
                        </Command.Group>

                        <Command.Item>Apple</Command.Item>
                    </Command.List>
                </Command>
            </ModalContent>
        </ModalRoot>
    );
};
