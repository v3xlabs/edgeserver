import { Link as NavLink } from '@tanstack/react-router';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FC, useEffect, useRef } from 'react';

const SiteMap = [
    ['Overview', ''],
    ['Analytics', '/analytics'],
    ['Deployments', '/deployments'],
    // ['Members', '/members'],
    ['Settings', '/settings'],
];

const TeamMap = [
    ['Overview', ''],
    ['Sites', '/sites'],
    ['Settings', '/settings'],
];

export const Subbar: FC<{ type: 'site' | 'team'; entry_id: string }> = ({
    type,
    entry_id,
}) => {
    const map = type === 'site' ? SiteMap : TeamMap;
    const prefix = type === 'site' ? 'site/$siteId' : 'team/$teamId';

    const reference = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reference.current) {
            const component = reference.current.offsetTop;

            const eventListener = () => {
                if (document.body.scrollTop > component) {
                    reference.current?.classList.add('fixed', 'top-0');
                } else {
                    reference.current?.classList.remove('fixed', 'top-0');
                }
            };

            document.body.addEventListener('scroll', eventListener);

            return () => {
                document.body.removeEventListener('scroll', eventListener);
            };
        }
    }, [reference]);

    return (
        <div className="z-20 w-full" ref={reference}>
            <motion.div
                initial={{ y: '0%', opacity: 0 }}
                animate={{ y: '0', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ bounce: 0 }}
                className="w-full"
            >
                <div className="text-default bg-default border-b px-4 py-1.5 shadow-sm backdrop-blur-lg backdrop-saturate-150">
                    <div className="w-container-dynamic flex h-full items-center justify-between px-4">
                        <div className="flex gap-2">
                            {map.map(([label, link], index) => (
                                <motion.div
                                    key={label}
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                >
                                    <NavLink
                                        to={`/${prefix}/${link}` as any}
                                        params={
                                            {
                                                siteId: entry_id,
                                                teamId: entry_id,
                                            } as any
                                        }
                                        className={clsx(
                                            'hover:bg-hover block rounded-lg px-2 py-1 text-sm font-medium'
                                        )}
                                        activeProps={{
                                            className: 'bg-neutral-800/5',
                                        }}
                                        activeOptions={{ exact: index === 0 }}
                                    >
                                        {label}
                                    </NavLink>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
