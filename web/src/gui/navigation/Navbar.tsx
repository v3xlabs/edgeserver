import { Link } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from '@/api/auth/store';
import { Avatar } from '@/components';
import { useActiveTeam } from '@/hooks/useActiveTeam';

import { InteractiveNavigator } from './InteractiveNavigator';
import { Subbar } from './Subbar';

const UserProfile = () => {
    const { token } = useAuth();
    const name = 'John Doe';
    const avatar = '';

    return (
        <div className="group relative flex h-full items-end">
            <div className="flex h-full w-fit items-center px-2 group-hover:bg-black/10">
                <span>{name}</span>
                {/* <AvatarOrGradient
                    src={avatar}
                    hash={user || ''}
                    className="ml-2 size-8 overflow-hidden rounded-full bg-white"
                /> */}
            </div>
            <div className="absolute right-0 top-full hidden w-fit flex-col overflow-hidden whitespace-nowrap rounded-b-md bg-white group-hover:flex">
                <button
                    className="flex items-start px-4 py-2 hover:bg-black/10"
                    // onClick={signOut}
                >
                    Log out
                </button>
            </div>
        </div>
    );
};

export const Navbar = () => {
    // const { state, state_id } = useA();
    const state = 'team' as 'none' | 'team' | 'site';
    const team_id = useActiveTeam();

    return (
        <div className="w-full">
            <div className="relative z-10 h-14 w-full">
                <div className="z-10 h-14 w-full border-b bg-white px-4">
                    <div className="w-container-dynamic flex h-full items-center justify-between">
                        <div className="flex h-full">
                            <div className="relative h-full w-8">
                                <Link
                                    to="/"
                                    className="absolute left-1/2 top-1/2 flex h-full origin-center -translate-x-1/2 -translate-y-1/2 items-center hover:scale-105"
                                >
                                    <div
                                        className="size-8"
                                        style={{
                                            clipPath:
                                                'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                        }}
                                    >
                                        <Avatar src="" s="logo" />
                                    </div>
                                </Link>
                            </div>
                            <div className="ml-4 flex h-full items-center">
                                <InteractiveNavigator />
                            </div>
                        </div>

                        <UserProfile />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {state !== 'none' && (
                    <Subbar type={state} entry_id={team_id || ''} />
                )}
            </AnimatePresence>
        </div>
    );
};
