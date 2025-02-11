import { useParams } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';

import { useSite, useTeam } from '@/api';
import { ModalContent } from '@/components';
import { ModalRoot } from '@/components/modal';

import {
    CommandEntityGroup,
    main_commands,
    site_commands,
    team_commands,
} from './command';

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
            <ModalContent noPadding noCloseButton>
                <CommandPaletteInternal />
            </ModalContent>
        </ModalRoot>
    );
};

const CommandPaletteInternal = () => {
    const routeParameters = useParams({ from: undefined as any });
    const { data: site } = useSite(routeParameters['siteId']);
    const { data: team } = useTeam(routeParameters['teamId'] || site?.team_id);

    return (
        <Command label="Global Command Palette">
            <div className="border-b p-2">
                <div className="flex items-center gap-2">
                    <FiChevronRight className="size-4" />
                    <Command.Input
                        className="w-full bg-transparent"
                        placeholder="Search or navigate to a site or team..."
                    />
                </div>
                <ul className="flex items-center gap-2 text-xs">
                    {site?.site_id && (
                        <li key={site.site_id}>
                            <button className="rounded-md border px-1.5 py-0.5">
                                {site.name}
                            </button>
                        </li>
                    )}
                    {team?.team_id && (
                        <li key={team.team_id}>
                            <button className="rounded-md border px-1.5 py-0.5">
                                {team.name}
                            </button>
                        </li>
                    )}
                </ul>
            </div>
            <Command.List className="p-2">
                <Command.Empty>No results found.</Command.Empty>

                {/* <Command.Group heading="Letters">
                    {main_commands.map((command) => (
                        <Command.Item key={command.slug}>
                            <command.icon className="size-4" />
                            {command.title}
                        </Command.Item>
                    ))}
                </Command.Group> */}

                {(
                    [
                        {
                            title: '',
                            commands: main_commands,
                        },
                        site
                            ? {
                                  title: 'Site ' + site.name,
                                  commands: site_commands,
                              }
                            : undefined,
                        team
                            ? {
                                  title: 'Team ' + team.name,
                                  commands: team_commands,
                              }
                            : undefined,
                    ] as CommandEntityGroup[]
                )
                    .filter(Boolean)
                    .map(({ title, commands }) => (
                        <Command.Group key={title} heading={title}>
                            {commands.map((command) => (
                                <Command.Item key={command.slug}>
                                    <span className="flex w-full items-center gap-2">
                                        <command.icon className="size-4" />
                                        {command.title}
                                    </span>
                                    {command.style === 'navigate' && (
                                        <FiArrowRight className="size-4 opacity-50" />
                                    )}
                                </Command.Item>
                            ))}
                        </Command.Group>
                    ))}
            </Command.List>
        </Command>
    );
};
