import { ElementType } from 'react';
import {
    FiBarChart,
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

    // if we should navigate to a different route
    navigate_to?: string;
};

export type CommandEntityGroup = {
    title: string;
    commands: CommandEntry[];
};

export const main_commands: CommandEntry[] = [
    {
        icon: FiHome,
        title: 'Dashboard',
        aliases: ['home', 'dashboard', 'goto home'],
        slug: 'dashboard',
        navigate_to: '/',
    },
    {
        icon: FiPlus,
        title: 'Create new team',
        aliases: ['create team', 'new team'],
        slug: 'create-new-team',
        navigate_to: '/team/new',
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

export const admin_commands: CommandEntry[] = [
    {
        icon: FiUsers,
        title: 'Manage users',
        aliases: ['manage users', 'users', 'goto users', 'admin'],
        slug: 'admin-manage-users',
        navigate_to: '/admin',
    },
    {
        icon: FiUsers,
        title: 'Manage teams',
        aliases: ['manage teams', 'teams', 'goto teams', 'admin'],
        slug: 'admin-manage-teams',
        navigate_to: '/admin',
    },
    {
        icon: FiSettings,
        title: 'Manage settings',
        aliases: ['manage settings', 'settings', 'goto settings', 'admin'],
        slug: 'admin-manage-settings',
        navigate_to: '/admin',
    },
];

export const team_commands: CommandEntry[] = [
    {
        icon: FiPlus,
        title: 'Create new site',
        aliases: ['create site', 'new site', 'team'],
        slug: 'create-new-site',
        navigate_to: '/site/new',
    },
    {
        icon: FiGlobe,
        title: 'Show sites overview',
        aliases: ['show sites', 'list sites', 'goto sites', 'team'],
        slug: 'show-sites',
        navigate_to: '/team/:team_id/sites',
    },
    {
        icon: FiSettings,
        title: 'Team Settings',
        aliases: [
            'team settings',
            'team preferences',
            'goto team settings',
            'team',
        ],
        slug: 'team-settings',
    },
    {
        icon: FiZap,
        title: 'Webhooks',
        aliases: ['webhooks', 'webhook', 'goto webhooks'],
        slug: 'webhooks',
    },
];

export const site_commands: CommandEntry[] = [
    {
        icon: FiZap,
        title: 'Deployments',
        aliases: ['deployments', 'deployment'],
        slug: 'deployments',
        navigate_to: '/site/$siteId/deployments',
    },
    {
        icon: FiBarChart,
        title: 'Analytics',
        aliases: ['analytics'],
        slug: 'analytics',
        navigate_to: '/site/$siteId/analytics',
    },
    {
        icon: FiGlobe,
        title: 'Domains',
        aliases: ['domains', 'domain'],
        slug: 'domains',
        navigate_to: '/site/$siteId/domains',
    },
    {
        icon: FiSettings,
        title: 'Site Settings',
        aliases: ['site settings', 'site preferences'],
        slug: 'site-settings',
        navigate_to: '/site/$siteId/settings',
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
