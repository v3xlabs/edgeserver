import { cx } from '@utils/cx';
import { FC, ReactNode, useRef } from 'react';
import {
    AriaCheckboxProps,
    FocusableOptions,
    mergeProps,
    useCheckbox,
    useFocusRing,
    VisuallyHidden,
} from 'react-aria';
import { useToggleState } from 'react-stately';

type Variants = 'primary' | 'delete' | 'add';

const styles: Record<Variants, string> = {
    primary:
        'text-white bg-blue-700 hover:bg-blue-600  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800  focus:ring-blue-300',
    delete: 'bg-red-600 hover:bg-red-800 focus:ring-red-300',
    add: 'bg-green-700 hover:bg-green-800 focus:ring-green-300',
};

export interface CheckboxProperties
    extends AriaCheckboxProps,
        FocusableOptions {
    children: ReactNode;
    className?: string;

    /**
     * @default primary
     */
    variant?: Variants;

    /**
     * @default false
     */
    loading?: boolean;
}

const Checkbox: FC<CheckboxProperties> = (properties) => {
    const state = useToggleState(properties);
    const reference = useRef<HTMLInputElement>(null);
    const { inputProps } = useCheckbox(properties, state, reference);

    const { focusProps, isFocusVisible } = useFocusRing();

    return (
        <label className="flex items-center relative">
            <VisuallyHidden>
                <input
                    {...mergeProps(inputProps, focusProps)}
                    ref={reference}
                />
            </VisuallyHidden>
            <div
                className={cx(
                    'cursor-pointer',
                    state.isSelected
                        ? 'bg-blue-500 border-none'
                        : 'bg-neutral-100 dark:bg-neutral-800',
                    properties.isDisabled && 'opacity-50',
                    'border',
                    'rounded-sm',
                    'border-neutral-300 dark:border-neutral-600',
                    'text-white',
                    isFocusVisible && 'ring-neutral-200 ring-1',
                    'w-5 h-5 mr-3',
                    'flex flex-shrink-0 justify-center items-center',
                    'transition-colors ease-in-out duration-300'
                )}
                aria-hidden="true"
            >
                <svg className="stroke-current w-3 h-3" viewBox="0 0 18 18">
                    <polyline
                        points="1 9 7 14 15 4"
                        fill="none"
                        strokeWidth={3}
                        strokeDasharray={22}
                        strokeDashoffset={state.isSelected ? 44 : 66}
                        style={{
                            transition: 'all 400ms',
                        }}
                    />
                </svg>
            </div>
            <span
                className={cx(
                    properties.isDisabled ? 'text-gray-400' : 'text-gray-70'
                )}
            >
                {properties.children}
            </span>
        </label>
    );
};

export default Checkbox;
