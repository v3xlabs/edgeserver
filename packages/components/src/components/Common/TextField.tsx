import { cx } from '@utils/cx';
import { registerOrEmpty } from '@utils/registerOrEmpty';
import { FC, useRef } from 'react';
import {
    AriaTextFieldProps,
    chain,
    FocusableOptions,
    useTextField,
} from 'react-aria';

import { BaseRegisterComponent } from '../templates';

export interface TextFieldProperties
    extends AriaTextFieldProps,
        FocusableOptions,
        BaseRegisterComponent {
    className?: string;

    // onChange?: ChangeEventHandler<HTMLInputElement>;
    // 'aria-label': string;

    // Custom props
    errorMessage?: string;

    success?: boolean;

    /**
     * Alternative to `placeholder`
     */
    label?: string;
}

const TextField: FC<TextFieldProperties> = (properties) => {
    const reference = useRef<HTMLInputElement>(null);

    const { inputProps } = useTextField(properties as any, reference);

    return (
        <div className="flex flex-col gap-1">
            {properties.label != undefined && (
                <label
                    htmlFor={
                        reference != undefined
                            ? reference.current?.id
                            : undefined
                    }
                    className="text-lg mb-1"
                >
                    {properties.label}
                </label>
            )}
            <input
                {...inputProps}
                // onChange={properties.onChange}
                onChange={chain(inputProps.onChange)}
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
                {...registerOrEmpty(properties.register, properties.id!)}
            />
            <p className="text-sm text-red-500">{properties.errorMessage}</p>
        </div>
    );
};

export default TextField;
