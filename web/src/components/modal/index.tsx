import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import React from 'react';
import { FaX } from 'react-icons/fa6';

export const ModalRoot = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export const ModalOverlay = React.forwardRef<
    React.ElementRef<typeof Dialog.Overlay>,
    React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...properties }, reference) => (
    <Dialog.Overlay
        ref={reference}
        className={clsx(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  fixed inset-0 z-50 bg-neutral-800/60 backdrop-blur-sm',
            className
        )}
        {...properties}
    />
));

ModalOverlay.displayName = Dialog.Overlay.displayName;

export const ModalContent = React.forwardRef<
    React.ElementRef<typeof Dialog.Content>,
    React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
        noPadding?: boolean;
        noCloseButton?: boolean;
        noBg?: boolean;
        width?: 'full' | 'lg';
    }
>(
    (
        {
            className,
            children,
            noPadding,
            noCloseButton,
            noBg,
            width,
            ...properties
        },
        reference
    ) => (
        <Dialog.Portal>
            <ModalOverlay />
            <Dialog.Content
                ref={reference}
                className={clsx(
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-1/2 top-1/2 z-50 grid -translate-x-1/2 -translate-y-1/2 gap-4 border shadow-lg duration-200 sm:rounded-lg',
                    noPadding ? '' : 'p-6',
                    noBg ? '' : 'bg-default',
                    width === 'full'
                        ? 'w-full max-w-[90vw]'
                        : 'w-full max-w-lg',
                    className
                )}
                {...properties}
            >
                {children}
                {!noCloseButton && (
                    <Dialog.Close
                        className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
                        type="button"
                    >
                        <FaX className="size-4" />
                        <span className="sr-only">Close</span>
                    </Dialog.Close>
                )}
            </Dialog.Content>
        </Dialog.Portal>
    )
);

ModalContent.displayName = Dialog.Content.displayName;

export const ModalFooter = ({
    className,
    ...properties
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={clsx(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
            className
        )}
        {...properties}
    />
);

ModalFooter.displayName = 'ModalFooter';

export const ModalTitle = React.forwardRef<
    React.ElementRef<typeof Dialog.Title>,
    React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...properties }, reference) => (
    <Dialog.Title
        ref={reference}
        className={clsx(
            'text-lg font-semibold leading-none tracking-tight',
            className
        )}
        {...properties}
    />
));

ModalTitle.displayName = Dialog.Title.displayName;

export const ModalDescription = React.forwardRef<
    React.ElementRef<typeof Dialog.Description>,
    React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...properties }, reference) => (
    <Dialog.Description
        ref={reference}
        className={clsx('text-muted-foreground text-sm', className)}
        {...properties}
    />
));

ModalDescription.displayName = Dialog.Description.displayName;
