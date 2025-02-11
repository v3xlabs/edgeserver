import { ElementType } from 'react';
import {
    FiGlobe,
    FiHome,
    FiPlus,
    FiSettings,
    FiUsers,
    FiZap,
} from 'react-icons/fi';

export type CommandEntry = {
    icon: ElementType;
    title: string;
    aliases: string[];
    style?: string;
    slug: string;
};

export type CommandEntityGroup = {
    title: string;
    commands: CommandEntry[];
};

export const main_commands: CommandEntry[] = [
    {
        icon: FiHome,
        title: 'Dashboard',
        aliases: ['home', 'dashboard'],
        slug: 'dashboard',
    },
    {
        icon: FiPlus,
        title: 'Create new team',
        aliases: ['create team', 'new team'],
        slug: 'create-new-team',
    },
    {
        icon: FiGlobe,
        title: 'Navigate to site',
        aliases: ['goto site'],
        style: 'navigate',
        slug: 'navigate-to-site',
    },
    {
        icon: FiUsers,
        title: 'Navigate to team',
        aliases: ['goto team'],
        style: 'navigate',
        slug: 'navigate-to-team',
    },
];

export const team_commands: CommandEntry[] = [
    {
        icon: FiPlus,
        title: 'Create new site',
        aliases: ['create site', 'new site'],
        slug: 'create-new-site',
    },
    {
        icon: FiGlobe,
        title: 'Show sites overview',
        aliases: ['show sites', 'list sites'],
        slug: 'show-sites',
    },
    {
        icon: FiSettings,
        title: 'Team Settings',
        aliases: ['team settings', 'team preferences'],
        slug: 'team-settings',
    },
    {
        icon: FiZap,
        title: 'Webhooks',
        aliases: ['webhooks', 'webhook'],
        slug: 'webhooks',
    },
];

export const site_commands: CommandEntry[] = [
    {
        icon: FiZap,
        title: 'Deployments',
        aliases: ['deployments', 'deployment'],
        slug: 'deployments',
    },
    {
        icon: FiGlobe,
        title: 'Domains',
        aliases: ['domains', 'domain'],
        slug: 'domains',
    },
    {
        icon: FiSettings,
        title: 'Site Settings',
        aliases: ['site settings', 'site preferences'],
        slug: 'site-settings',
    },
];

// reducer with "state" and "menu"
import { createStore } from '@xstate/store';

export const cmdkStore = createStore({
    // Initial context
    context: { menu: 'main', team_id: undefined },
    // Transitions
    on: {
        setMenu: (context, event: { menu: string }) => ({
            menu: event.menu,
        }),
    },
});
