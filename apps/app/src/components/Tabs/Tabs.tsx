import { cx } from '@utils/cx';
import { FC, PropsWithChildren, ReactNode, useState } from 'react';

export const Tab: FC<PropsWithChildren & { className?: string }> = ({
    children,
    className,
}) => {
    return (
        <div
            className={cx(
                'border border-neutral-300 dark:border-neutral-700',
                className || 'p-4'
            )}
        >
            {children}
        </div>
    );
};

export const Tabs: FC<{
    children: ReactNode[];
    labels: string[];
    defaultTab?: number;
}> = ({ labels, children, defaultTab = 0 }) => {
    const [tab, setTab] = useState(defaultTab);

    return (
        <div className="">
            <div
                className="flex border-r border-b border-neutral-300 dark:border-neutral-700 w-fit"
                style={{ marginBottom: '-1px' }}
            >
                {labels.map((label, index) => (
                    <button
                        key={index}
                        className={cx(
                            'border border-neutral-300 dark:border-neutral-700 px-4 py-2 flex items-center border-r-0 border-b-0',
                            tab === index
                                ? 'tab'
                                : 'dark:bg-black-800 dark:hover:bg-neutral-800 hover:bg-neutral-100 bg-neutral-50 cursor-pointer'
                        )}
                        onClick={() => setTab(index)}
                    >
                        <div className="tabtext pb-1">{label}</div>
                    </button>
                ))}
            </div>
            <div className="w-full">{children[tab]}</div>
        </div>
    );
};
