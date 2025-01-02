import clsx from 'clsx';
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
            className={clsx(
                className,
                'block max-w-full rounded-md border px-4 py-2 outline-offset-2 outline-black/80'
            )}
            ref={_ref}
        />
    );
};
