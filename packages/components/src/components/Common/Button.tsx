import { cx } from '@utils/cx';
import { registerOrEmpty } from '@utils/registerOrEmpty';
import { FC, useRef } from 'react';
import { AriaButtonProps, FocusableOptions, useButton } from 'react-aria';
import { Loader } from 'react-feather';
import { Link } from 'react-router-dom';

import { BaseFormComponent } from '../templates';

type Variants = 'primary' | 'delete' | 'add';

const styles: Record<Variants, string> = {
    primary:
        'text-white bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300 dark:focus:ring-blue-800',
    delete: 'bg-red-700 hover:bg-red-800 text-white focus:ring-red-300',
    add: 'bg-green-700 hover:bg-green-800 text-white focus:ring-green-300',
};

export interface ButtonProperties
    extends BaseFormComponent,
        AriaButtonProps,
        FocusableOptions {
    /**
     * @default primary
     */
    variant?: Variants;

    /**
     * @default false
     */
    loading?: boolean;
}

const Button: FC<ButtonProperties> = (properties) => {
    const reference = useRef<HTMLButtonElement>(null);
    const { buttonProps } = useButton(
        { ...properties, elementType: properties.href ? 'a' : 'button' },
        reference
    );

    const Element = properties.href ? Link : 'button';

    return (
        <Element
            to={properties.href || ''}
            {...buttonProps}
            ref={reference as any}
            className={cx(
                'w-full text-white flex items-center justify-center gap-2 text-sm font-bold rounded-md px-6 py-3 text-center focus:ring-2 focus:outline-none',
                properties.isDisabled &&
                    'cursor-not-allowed bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-500',
                !properties.isDisabled && properties.variant == undefined
                    ? styles.primary
                    : styles[properties.variant!],
                properties.className
            )}
            {...registerOrEmpty(properties.register, properties.id!)}
        >
            {properties.loading && (
                <Loader className="animate-spin -mt-2 -mb-2" height={'1.5em'} />
            )}
            {properties.children}
        </Element>
    );
};

export default Button;
