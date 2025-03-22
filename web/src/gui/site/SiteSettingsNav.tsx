import * as Accordion from '@radix-ui/react-accordion';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC, ReactNode, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import {
    LuCode,
    LuFileWarning,
    LuFilter,
    LuForward,
    LuGlobe,
    LuKey,
    LuSettings,
    LuWebhook,
} from 'react-icons/lu';

import { getSiteDomains } from '@/api';
import { queryClient } from '@/util/query';

export function isTruthy<T>(value?: T | undefined | null | false): value is T {
    return !!value;
}

const ExpandableItem = ({
    path,
    label,
    icon,
}: {
    path: [string, string][];
    label: string | ReactNode;
    icon: ReactNode;
}) => {
    const x = useRouterState({
        select: (state) => state.location,
    });
    const [state, setState] = useState(
        path
            .filter(isTruthy)
            .some(([path]) => x.pathname.startsWith(path as string))
    );

    return (
        <Accordion.Root
            type="single"
            collapsible
            defaultValue={state ? (label as string) : undefined}
            onValueChange={(value) => {
                setState(value === (label as string));
            }}
            className="w-full"
        >
            <Accordion.Item value={(label as string) ?? ''}>
                <div className="flex w-full flex-col">
                    <Accordion.Trigger>
                        <div
                            className={clsx(
                                'text-default relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-neutral-100'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {icon}
                                {label}
                            </div>
                            <div>
                                <FiChevronDown
                                    className={clsx(
                                        'duration-300 ease-in-out',
                                        state && '[transform:rotateX(180deg)]'
                                    )}
                                />
                            </div>
                        </div>
                    </Accordion.Trigger>
                    <Accordion.Content className={'overflow-hidden'}>
                        {path.map(([path, label]) => (
                            <Link
                                to={path as string}
                                activeOptions={{ exact: true }}
                                key={path as string}
                                className={clsx(
                                    'text-default relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 pl-8 text-sm hover:bg-neutral-100',
                                    '[&.active]:text-default [&.active]:bg-neutral-500/10',
                                    // eslint-disable-next-line quotes
                                    "[&.active]:before:content-['']",
                                    '[&.active]:before:absolute [&.active]:before:inset-y-[12%] [&.active]:before:-left-3 [&.active]:before:w-1 [&.active]:before:rounded-md [&.active]:before:bg-blue-500'
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </Accordion.Content>
                </div>
            </Accordion.Item>
        </Accordion.Root>
    );
};

export const SiteSettingsNav = () => {
    // const { ok: hasUsersPermissions } = useHasPolicy('user', '', 'write');
    const { siteId } = useParams({ strict: false });
    const prefix = '/site/$siteId';

    return (
        <ul className="flex flex-col divide-y">
            {(
                [
                    [
                        '',
                        [
                            {
                                path: '/settings',
                                label: 'General',
                                icon: <LuSettings key="general" />,
                            },
                        ],
                    ],
                    [
                        'Internet Exposure',
                        [
                            {
                                path: '/settings/domains',
                                label: 'Domains',
                                icon: <LuGlobe key="domains" />,
                                getHasNotification: async () => {
                                    const data =
                                        await queryClient.ensureQueryData(
                                            getSiteDomains(siteId)
                                        );

                                    if (!data) {
                                        console.error('No data');

                                        return;
                                    }

                                    console.log(data);

                                    if (
                                        data.some(
                                            (domain) =>
                                                'status' in domain &&
                                                domain.status === 'pending'
                                        )
                                    ) {
                                        return {
                                            type: 'pending',
                                            message: 'Pending DNS Updates',
                                        };
                                    }
                                },
                            },
                            {
                                path: '/settings/rules',
                                label: 'Routing Rules',
                                icon: <LuFilter key="rules" />,
                            },
                        ],
                    ],
                    [
                        'Deployment',
                        [
                            {
                                path: '/settings/ci',
                                label: 'CI/CD',
                                icon: <LuCode key="ci" />,
                            },
                            {
                                path: '/settings/webhooks',
                                label: 'Webhooks',
                                icon: <LuWebhook key="webhooks" />,
                            },
                            {
                                path: '/settings/keys',
                                label: 'Keys',
                                icon: <LuKey key="keys" />,
                            },
                        ],
                    ],
                    [
                        'Administrative',
                        [
                            {
                                path: '/settings/transfer',
                                label: 'Transfer',
                                icon: <LuForward key="transfer" />,
                            },
                            {
                                path: '/settings/actions',
                                label: 'Actions',
                                icon: <LuFileWarning key="delete" />,
                            },
                        ],
                    ],
                ] as [string, SideEntryType[]][]
            ).map(([group, items]) => (
                <div key={group}>
                    {group != '' && (
                        <h3 className="text-default px-2 pb-1 pl-4 pt-4 text-sm font-bold">
                            {group}
                        </h3>
                    )}
                    <ul className="flex flex-col pb-4 pl-2">
                        {items.filter(isTruthy).map((entry) => (
                            <SideEntry
                                key={entry.path as string}
                                entry={entry}
                                prefix={prefix}
                                siteId={siteId}
                            />
                        ))}
                    </ul>
                </div>
            ))}
        </ul>
    );
};

export type SideEntryType = {
    path: string;
    label: string;
    icon: ReactNode;
    getHasNotification?: () => Promise<
        { type: 'pending' | 'success' | 'error'; message: string } | undefined
    >;
};

export const SideEntry: FC<{
    entry: SideEntryType;
    prefix: string;
    siteId: string | undefined;
}> = ({ entry, prefix, siteId }) => {
    const [state, setState] = useState(false);
    const { data: notification } = useQuery({
        queryKey: [
            'side-entry',
            'notification',
            '{entry_prefix}',
            entry.path,
            siteId,
        ],
        queryFn: () => entry.getHasNotification?.(),
        enabled: !!entry.getHasNotification,
        staleTime: 0,
        refetchInterval: 3000,
    });

    const { icon, label, path } = entry;

    return (
        <li
            key={path as string}
            className={clsx('flex w-full items-center gap-1')}
        >
            {Array.isArray(path) ? (
                <ExpandableItem path={path} label={label} icon={icon} />
            ) : (
                <Link
                    to={(prefix + path) as string}
                    params={{ siteId }}
                    activeOptions={{ exact: true }}
                    className={clsx(
                        'text-default hover:bg-default relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1',
                        '[&.active]:text-default [&.active]:bg-default',
                        // eslint-disable-next-line quotes
                        "[&.active]:before:content-['']",
                        '[&.active]:before:absolute [&.active]:before:inset-y-[12%] [&.active]:before:-left-3 [&.active]:before:w-1 [&.active]:before:rounded-md [&.active]:before:bg-blue-500'
                    )}
                >
                    {icon}
                    <span className="relative">
                        {label}
                        {notification && (
                            <div
                                className={clsx(
                                    'absolute -right-3 top-1/2 size-1.5 -translate-y-1/2 animate-pulse rounded-full',
                                    notification.type === 'pending' &&
                                        'bg-accent',
                                    notification.type === 'success' &&
                                        'bg-green-500',
                                    notification.type === 'error' &&
                                        'bg-red-500'
                                )}
                            />
                        )}
                    </span>
                </Link>
            )}
        </li>
    );
};
