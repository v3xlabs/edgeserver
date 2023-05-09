import { cx } from '@utils/cx';
import { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react';

export const Input: FC<
    DetailedHTMLProps<
        InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > & { _ref?: any }
> = ({ className, _ref, ...properties }) => {
    return (
        <input
            {...properties}
            className={cx(
                className,
                'px-4 py-2 outline-offset-2 outline-black/80 max-w-full'
            )}
            ref={_ref}
        />
    );
};
