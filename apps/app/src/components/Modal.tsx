import { cx } from '@utils/cx';
import { FC, PropsWithChildren } from 'react';

type ModalComponent = {
    label: string;
    onClose: () => void;
    className?: string;
} & PropsWithChildren;

export const Modal: FC<ModalComponent> = ({
    label,
    onClose,
    children,
    className = '',
}) => {
    return (
        <div>
            <div
                id="authentication-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal h-full justify-center items-center bg-neutral-900 bg-opacity-80"
            >
                <div
                    className={cx(
                        'relative p-4 w-full max-w-md h-fit',
                        className
                    )}
                >
                    <div className="relative bg-white rounded-lg shadow dark:bg-neutral-800 border-white border">
                        <button
                            type="button"
                            className="absolute top-3 right-2.5 text-neutral-400 bg-transparent hover:bg-neutral-200 hover:text-neutral-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-neutral-800 dark:hover:text-white"
                            data-modal-toggle="authentication-modal"
                            onClick={onClose}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                        <div className="py-6 px-6 lg:px-8">
                            <h3 className="mb-4 text-xl font-medium text-neutral-900 dark:text-white">
                                {label}
                            </h3>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
