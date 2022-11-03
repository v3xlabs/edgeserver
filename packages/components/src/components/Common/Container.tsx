import { cx } from '@utils/cx';
import { FC, ReactNode } from 'react';

const Container: FC<{
    topPadding?: boolean;
    horizontalPadding?: boolean;
    children: ReactNode;
    size?: 'normal' | 'small';
}> = (properties) => {
    return (
        <div
            className={cx(
                'mx-auto w-full',
                properties.size == 'small' ? 'max-w-3xl' : 'max-w-5xl',
                properties.horizontalPadding != undefined &&
                    properties.horizontalPadding &&
                    'px-3',

                properties.topPadding != undefined &&
                    properties.horizontalPadding &&
                    'pt-8'
            )}
        >
            {properties.children}
        </div>
    );
};

export default Container;
