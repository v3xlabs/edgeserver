import { Link, useParams } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import { FiServer } from 'react-icons/fi';

import { useMe } from '@/api';
import { authStore } from '@/api/auth/store';
import { Avatar, Button } from '@/components';
import { AvatarGradient } from '@/components/avatar/gradient';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../Dropdown';
import { InteractiveNavigator } from './InteractiveNavigator';
import { Subbar } from './Subbar';
import { ThemeSwitcher } from './ThemeSwitcher';

const UserProfile = () => {
    const { data: me } = useMe();
    const firstLetter = me?.name?.[0]?.toUpperCase() || '?';

    return (
        <DropdownMenu>
            <div className="flex h-full items-end">
                <div className="flex h-full w-fit items-center px-2 group-hover:bg-black/10">
                    <DropdownMenuTrigger className="flex items-center gap-2">
                        <div className="relative size-8 overflow-hidden rounded-full">
                            <AvatarGradient s={me?.user_id || ''} />
                            <div className="absolute inset-0 flex items-center justify-center font-medium text-white">
                                {firstLetter}
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                </div>
                <DropdownMenuPortal>
                    <DropdownMenuContent>
                        <DropdownMenuItem className="flex items-center justify-between gap-6">
                            <div>Theme</div>
                            <ThemeSwitcher />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {me?.admin && (
                            <DropdownMenuItem asChild>
                                <Button
                                    className="w-full justify-start"
                                    variant="ghost"
                                    asChild
                                >
                                    <Link to="/admin">
                                        <FiServer />
                                        Administration
                                    </Link>
                                </Button>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button
                                className="flex w-full cursor-pointer justify-start py-2"
                                onClick={() => {
                                    authStore.send({
                                        type: 'clearAuthToken',
                                    });
                                }}
                                variant="ghost"
                            >
                                Log out
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </div>
        </DropdownMenu>
    );
};

export const Navbar = () => {
    const { teamId, siteId } = useParams({ strict: false });
    const state = siteId ? 'site' : teamId ? 'team' : 'none';

    return (
        <div className="w-full">
            <div className="relative z-30 h-14 w-full">
                <div className="z-10 h-14 w-full border-b bg-default px-4">
                    <div className="w-container-dynamic flex h-full items-center justify-between px-6">
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

                        <div className="flex h-full items-center">
                            <UserProfile />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-10">
                <AnimatePresence>
                    {state !== 'none' && (
                        <Subbar
                            type={state}
                            entry_id={teamId || siteId || ''}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
