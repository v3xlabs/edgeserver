import type { ClassValue } from 'clsx';
import { FC, PropsWithChildren, ReactNode, useEffect } from 'react';

import { cn } from '@/util/style';
import { getTitle } from '@/util/title';

export type SCPageProperties = PropsWithChildren<{
    title: string;
    subtext?: ReactNode;
    width?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    suffix?: ReactNode;
    className?: ClassValue;
}>;

export const SCPage: FC<SCPageProperties> = ({
    children,
    title,
    subtext,
    width = '4xl',
    suffix,
    className,
}) => {
    useEffect(() => {
        document.title = getTitle(title);
    }, [title]);

    return (
        <div
            className={cn(
                'p-4 mt-8 mx-auto w-full space-y-4 pb-64',
                width === 'xl' && 'max-w-xl',
                width === '2xl' && 'max-w-2xl',
                width === '3xl' && 'max-w-3xl',
                width === '4xl' && 'max-w-4xl',
                width === '5xl' && 'max-w-5xl 2xl:max-w-7xl',
                className
            )}
        >
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="h1 pl-4">{title}</h1>
                    {subtext && (
                        <div className="flex items-center gap-2 pl-4 text-sm">
                            {subtext}
                        </div>
                    )}
                </div>
                {suffix}
            </div>
            {children}
        </div>
    );
};
