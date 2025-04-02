import type { ClassValue } from 'clsx';
import { FC, PropsWithChildren, ReactNode, useEffect } from 'react';

import { cn } from '@/util/style';
import { getTitle } from '@/util/title';

export type SidePageProperties = PropsWithChildren<{
    title: string;
    subtitle?: string;
    suffix?: ReactNode;
    className?: ClassValue;
    sidebar?: ReactNode;
}>;

export const SidePage: FC<SidePageProperties> = ({
    children,
    title,
    subtitle,
    suffix,
    className,
    sidebar,
}) => {
    useEffect(() => {
        document.title = getTitle(title);
    }, [title]);

    return (
        <div
            className={cn(
                'p-4 mt-2 mx-auto w-container-dynamic pb-64 flex gap-8 justify-center md:flex-row flex-col',
                className
            )}
        >
            {sidebar && <div className="w-full md:w-96">{sidebar}</div>}
            <div className="mt-2 w-full space-y-4">
                <div className="flex w-full items-end justify-between">
                    <div>
                        <h1 className="h1 pl-4">{title}</h1>
                        {subtitle && (
                            <div className="text-muted pl-4 text-sm">
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {suffix}
                </div>
                {children}
            </div>
        </div>
    );
};
