import { cx } from '@utils/cx';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
    children: ReactNode;
    data: { label: string; page: string }[];
    indexPage: string;
    activePage: string;
}> = ({ data, children, indexPage, activePage }) => {
    return (
        <div>
            <div
                className="flex border-r border-b border-neutral-300 dark:border-neutral-700 w-fit"
                style={{ marginBottom: '-1px' }}
            >
                {data.map((item, index) => (
                    <Link
                        key={index}
                        to={(
                            indexPage +
                            '/' +
                            item.page
                                .replace(/([^:]\/)\/+/g, '$1')
                                .replace(/\/$/, '')
                        ).replace(/\/$/, '')}
                        className={cx(
                            'border border-neutral-300 dark:border-neutral-700 px-4 py-2 flex items-center border-r-0 border-b-0',
                            activePage == item.page
                                ? 'tab'
                                : 'dark:bg-black-800 dark:hover:bg-neutral-800 hover:bg-neutral-100 bg-neutral-50 cursor-pointer'
                        )}
                    >
                        <div className="tabtext pb-1">{item.label}</div>
                    </Link>
                ))}
            </div>
            <div className="w-full">{children}</div>
        </div>
    );
};
