import { useNavigate, useParams } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { FC, useEffect, useState } from 'react';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';

import { useMe, useSite, useTeam } from '@/api';
import { ModalContent } from '@/components';
import { ModalRoot } from '@/components/modal';

import {
    admin_commands,
    CommandEntityGroup,
    main_commands,
    site_commands,
    team_commands,
} from './command';
import { SiteEntries } from './entries/SiteEntry';
import { TeamEntries } from './entries/TeamEntry';

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
            <ModalContent
                noPadding
                noCloseButton
                // frosted glass effect
                // noBg
                // className="dark:text-default bg-white/90 text-neutral-700 backdrop-blur-sm dark:bg-black/30"
                className=""
            >
                <CommandPaletteInternal requestClose={() => setOpen(false)} />
            </ModalContent>
        </ModalRoot>
    );
};

const CommandPaletteInternal: FC<{ requestClose: () => void }> = ({
    requestClose,
}) => {
    const routeParameters = useParams({ from: undefined as any });
    const { data: site } = useSite(routeParameters['siteId']);
    const { data: team } = useTeam(routeParameters['teamId'] || site?.team_id);
    const { data: user } = useMe();
    const navigate = useNavigate();

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
            <Command.List className="overflow-y-auto p-2">
                <Command.Empty className="text-sm">
                    No results found.
                </Command.Empty>

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
                        user?.admin
                            ? {
                                  title: 'Administration',
                                  commands: admin_commands,
                              }
                            : undefined,
                    ] as CommandEntityGroup[]
                )
                    .filter(Boolean)
                    .map(({ title, commands }) => (
                        <Command.Group key={title} heading={title}>
                            {commands.map((command) => (
                                <Command.Item
                                    key={command.slug}
                                    onSelect={() => {
                                        if (command.navigate_to) {
                                            console.log(command.navigate_to);
                                            navigate({
                                                to: command.navigate_to,
                                                params: {
                                                    siteId: site?.site_id,
                                                    teamId: team?.team_id,
                                                },
                                            });
                                            requestClose();
                                        }
                                    }}
                                    keywords={command.aliases}
                                >
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
                <TeamEntries />
                <SiteEntries />
            </Command.List>
        </Command>
    );
};
