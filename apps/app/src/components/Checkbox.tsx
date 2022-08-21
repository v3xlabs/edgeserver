import { cx } from '@utils/cx';
import { useMemo } from 'react';
import { FC, InputHTMLAttributes } from 'react';
import { UseFormRegister } from 'react-hook-form';

type Variants = 'primary' | 'error' | 'disabled';

const styles: Record<Variants, string> = {
    primary: `
        cursor-pointer
        bg-black-600
        border-neutral-500
        checked:bg-accent-blue-normal checked:border-blue-400
    `,
    error: `
        cursor-pointer
        bg-red-600
        border-red-500
        checked:bg-red-500 checked:border-red-400
    `,
    // 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-white focus:ring-blue-300',
    disabled: `
        cursor-pointer
        bg-black-700
        border-black-500
        checked:bg-blue-700 checked:border-blue-800
    `,
};

export const Checkbox: FC<
    InputHTMLAttributes<HTMLInputElement> & {
        label?: string;
        id: string;
        variant?: Variants;
        disabled?: boolean;
        boxClasses?: string;
        register?: UseFormRegister<any>;
    }
> = ({
    className,
    label,
    id,
    disabled,
    variant = 'primary',
    boxClasses,
    register,
    ...properties
}) => {
    const css = useMemo(() => {
        const base_css = `
            appearance-none
            h-6 w-6
            border-2
            rounded-sm
            transition duration-150 align-top
            bg-no-repeat bg-center bg-contain
            float-left mr-2
        `;

        return cx(
            base_css,
            styles[disabled ? 'disabled' : variant],
            boxClasses ?? ''
        );
    }, [disabled, variant]);

    return (
        <div>
            <input
                id={id}
                type="checkbox"
                {...properties}
                className={cx(className || '', css)}
                disabled={disabled}
                {...(register ? register(id) : [])}
            />

            {label && (
                <label
                    className={`text-neutral-400 text-base ${
                        disabled ? 'opacity-50' : ''
                    }`}
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
        </div>
    );
    // return <></>
};
