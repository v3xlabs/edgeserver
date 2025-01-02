import { useParams } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';

import { Site, useSite } from '@/api';

const SiteEntry: FC<{ site: Site }> = ({
    site: { site_id, name, team_id },
}) => {
    return (
        <motion.div
            className="group h-full overflow-hidden rounded-md py-1"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '0', opacity: 1 }}
            exit={{ x: '-100%' }}
        >
            <div className="flex h-full items-center rounded-md p-1 hover:bg-neutral-900/10">
                <p className="text-sm font-semibold">{name}</p>
            </div>
        </motion.div>
    );
};

export const SiteIndicator: FC = () => {
    const { siteId } = useParams({ strict: false });
    const { data } = useSite(siteId);

    return (
        <div className="h-12 w-fit overflow-hidden pr-6 transition-all">
            <AnimatePresence>
                {siteId && data && <SiteEntry site={data} />}
            </AnimatePresence>
        </div>
    );
};
