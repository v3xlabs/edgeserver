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
                'bg-default outline-default border-default block max-w-full rounded-md border px-4 py-2 outline-offset-2'
            )}
            ref={_ref}
        />
    );
};
