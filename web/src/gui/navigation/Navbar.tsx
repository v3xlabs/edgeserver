import { Link } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import { useActiveFocus } from 'src/hooks/useActiveFocus';
import { useAuth } from 'src/hooks/useAuth';

import { AvatarOrGradient } from '@/gui/avatar/AvatarOrGradient';

import { InteractiveNavigator } from './InteractiveNavigator';
import { Subbar } from './Subbar';

const UserProfile = () => {
    const { user, signOut } = useAuth();
    const name = 'John Doe';
    const avatar = '';

    return (
        <div className="group relative flex h-full items-end">
            <div className="flex h-full w-fit items-center px-2 group-hover:bg-black/10">
                <span>{name}</span>
                <AvatarOrGradient
                    src={avatar}
                    hash={user || ''}
                    className="ml-2 size-8 overflow-hidden rounded-full bg-white"
                />
            </div>
            <div className="absolute right-0 top-full hidden w-fit flex-col overflow-hidden whitespace-nowrap rounded-b-md bg-white group-hover:flex">
                <button
                    className="flex items-start px-4 py-2 hover:bg-black/10"
                    onClick={signOut}
                >
                    Log out
                </button>
            </div>
        </div>
    );
};

export const Navbar = () => {
    const { state, state_id } = useActiveFocus();

    return (
        <div className="w-full">
            <div className="relative z-10 h-14 w-full">
                <div className="z-10 h-14 w-full border-b bg-white px-4">
                    <div className="w-container-dynamic flex h-full items-center justify-between">
                        <div className="flex h-full">
                            <Link
                                to="/"
                                className="flex h-full items-center hover:scale-105"
                            >
                                <div className="size-8">
                                    <AvatarOrGradient
                                        src=""
                                        hash="logo"
                                        className=""
                                        style={{
                                            clipPath:
                                                'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                        }}
                                    />
                                </div>
                            </Link>
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
                    <Subbar type={state} entry_id={state_id || ''} />
                )}
            </AnimatePresence>
        </div>
    );
};
