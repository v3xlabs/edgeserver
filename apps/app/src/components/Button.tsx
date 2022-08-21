import { cx } from '@utils/cx';
import { ButtonHTMLAttributes, FC, useMemo } from 'react';
import { Loader } from 'react-feather';

type Variants = 'primary' | 'delete' | 'disabled' | 'add';

const styles: Record<Variants, string> = {
    primary:
        'bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-white focus:ring-blue-300',
    disabled:
        'cursor-not-allowed bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:text-white',
    delete: 'bg-red-700 hover:bg-red-800 text-white focus:ring-red-300',
    add: 'bg-green-700 hover:bg-green-800 text-white focus:ring-green-300',
};

export const Button: FC<
    ButtonHTMLAttributes<HTMLButtonElement> & {
        label: string;
        pending?: boolean;
        variant?: string;
    }
> = ({
    className,
    children: _children,
    label,
    disabled,
    pending = false,
    variant = 'primary',
    ...properties
}) => {
    const css = useMemo(() => {
        const base_css =
            'flex items-center gap-2 text-sm font-bold rounded-lg px-5 py-2.5 text-center focus:ring-4 focus:outline-none';

        return cx(
            base_css,
            styles[disabled ? 'disabled' : (variant as Variants)]
        );
    }, [disabled, variant]);

    return (
        <button
            {...properties}
            className={cx(className || '', css)}
            disabled={disabled}
        >
            {pending && (
                <Loader className="animate-spin -mt-2 -mb-2" height={'1.5em'} />
            )}
            {label}
        </button>
    );
};
