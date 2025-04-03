import { FiBell } from 'react-icons/fi';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '../../Dropdown';

const Notifications = () => {
    const notifications = [
        { id: 1, message: 'New deployment completed', time: '2 minutes ago' },
        { id: 2, message: 'Domain verification pending', time: '1 hour ago' },
        { id: 3, message: 'System update available', time: '2 hours ago' },
    ];

    return (
        <DropdownMenu>
            <div className="flex h-full items-center">
                <div className="flex h-full w-fit items-center px-2 group-hover:bg-black/10">
                    <DropdownMenuTrigger asChild>
                        <div className="relative size-8 cursor-pointer">
                            <FiBell className="mt-1.5 size-5" />
                            {notifications.length > 0 && (
                                <div className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {notifications.length}
                                </div>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                </div>
                <DropdownMenuPortal>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="p-2">
                            <h3 className="text-sm font-semibold">
                                Notifications
                            </h3>
                        </div>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex cursor-pointer flex-col items-start gap-1 p-2"
                            >
                                <span className="text-sm">
                                    {notification.message}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {notification.time}
                                </span>
                            </DropdownMenuItem>
                        ))}
                        {notifications.length === 0 && (
                            <DropdownMenuItem className="cursor-pointer p-2 text-sm text-gray-500">
                                No new notifications
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </div>
        </DropdownMenu>
    );
};

export { Notifications };
