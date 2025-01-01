import { Link as NavLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { FC, useEffect, useRef } from 'react';

import { cx } from '@/utils/cx';

const SiteMap = [
    ['Overview', ''],
    ['Analytics', '/analytics'],
    ['Members', '/members'],
    ['Settings', '/settings'],
];

const TeamMap = [
    ['Overview', ''],
    ['Members', '/members'],
    ['Settings', '/settings'],
];

export const Subbar: FC<{ type: 'site' | 'team'; entry_id: string }> = ({
    type,
    entry_id,
}) => {
    const map = type === 'site' ? SiteMap : TeamMap;
    const prefix = type === 'site' ? 's' : 't';

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
        <div className="w-full" ref={reference}>
            <motion.div
                initial={{ y: '0%', opacity: 0 }}
                animate={{ y: '0', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ bounce: 0 }}
                className="w-full"
            >
                <div className="bg-white/20 px-4 py-1.5 text-black shadow backdrop-blur-lg backdrop-saturate-150">
                    <div className="w-container-dynamic flex h-full items-center justify-between">
                        <div className="flex gap-2">
                            {map.map(([label, link], index) => (
                                <motion.div
                                    key={label}
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                >
                                    <NavLink
                                        to={link}
                                        // to={`/${prefix}/${entry_id}${link}`}
                                        className={cx(
                                            'block hover:bg-black/10 px-2 py-1 rounded-lg font-medium text-sm'
                                        )}
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
