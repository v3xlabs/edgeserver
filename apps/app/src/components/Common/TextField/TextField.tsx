import { cx } from '@utils/cx';
import { FC, useRef } from 'react';
import { AriaTextFieldProps, FocusableOptions, useTextField } from 'react-aria';

export interface TextFieldProperties
    extends AriaTextFieldProps,
        FocusableOptions {
    className?: string;

    // 'aria-label': string;

    // Custom props
    errorMessage?: string;

    success?: boolean;

    /**
     * Alternative to `placeholder`
     */
    label?: string;
}

export const TextField: FC<TextFieldProperties> = (properties) => {
    const reference = useRef<HTMLInputElement>(null);
    const { inputProps } = useTextField(properties, reference);

    return (
        <div className="flex flex-col gap-1">
            {/*eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            {properties.label != undefined && (
                <label htmlFor={reference.current?.id} className="text-lg mb-1">
                    {properties.label}
                </label>
            )}
            <input
                {...inputProps}
                className={cx(
                    'text-sm rounded-md block w-full py-2.5 px-4 border outline-none focus:ring-1',
                    'bg-neutral-100 dark:bg-neutral-800',

                    properties.errorMessage != undefined &&
                        'focus:ring-red-500 border-red-500 focus-visible:outine-red-500',

                    properties.errorMessage == undefined &&
                        'focus:ring-blue-500 focus:border-blue-500 dark:placeholder-neutral-400 dark:text-white',
                    properties.errorMessage == undefined &&
                        !properties.success &&
                        'border-neutral-300 dark:border-neutral-600',
                    properties.success && 'border-blue-500'
                )}
            />
            <p className="text-sm text-red-500">{properties.errorMessage}</p>
        </div>
    );
};
