import { AvatarOrGradient } from '@components/avatar/AvatarOrGradient';
import { Team } from '@edgelabs/types';
import { buffercnvrt } from '@utils/buffercnvrt';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useActiveTeam } from 'src/hooks/useTeam';

const TeamEntry: FC<{ team: Team }> = ({
    team: { icon, name, owner, team_id },
}) => {
    return (
        <motion.div
            className="group h-full overflow-hidden rounded-md py-1"
            initial={{ x: '-70%', opacity: 0 }}
            animate={{ x: '0', opacity: 1 }}
            exit={{ x: '-70%', opacity: 0 }}
            transition={{ bounce: 0.2, duration: 0.15 }}
        >
            <Link
                to={`/t/${team_id}`}
                className="flex h-full items-center rounded-md p-1 hover:bg-neutral-900/10"
            >
                <div className="h-8 w-8 rounded-full bg-white">
                    <AvatarOrGradient
                        src={buffercnvrt(icon as any)}
                        hash={team_id}
                    />
                </div>
                <div className="ml-2 flex flex-col justify-center">
                    <p className="text-sm font-semibold">{name}</p>
                </div>
            </Link>
        </motion.div>
    );
};

const EmptyTeamEntry: FC = () => {
    return (
        <div className="flex h-full items-center text-black/20">
            Select a team or site...
        </div>
    );
};

export const TeamIndicator: FC = () => {
    const { team_id, team } = useActiveTeam();

    return (
        <div className="h-12 w-fit overflow-hidden transition-all">
            <AnimatePresence>
                {!team && !team_id && <EmptyTeamEntry />}
                {team && team_id && <TeamEntry team={team} />}
            </AnimatePresence>
        </div>
    );
};
