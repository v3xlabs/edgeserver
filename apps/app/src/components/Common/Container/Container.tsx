import { cx } from '@utils/cx';
import { FC, ReactNode } from 'react';

export const Container: FC<{
    padding?: boolean;
    children: ReactNode;
    size?: 'normal' | 'small';
}> = (properties) => {
    return (
        <div
            className={cx(
                'mx-auto w-full',
                properties.size == 'small' ? 'max-w-3xl' : 'max-w-6xl',
                properties.padding != undefined && properties.padding && 'px-3'
            )}
        >
            {properties.children}
        </div>
    );
};
