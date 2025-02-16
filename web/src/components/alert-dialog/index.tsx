import * as AlertDialog from '@radix-ui/react-alert-dialog';
import clsx from 'clsx';
import React from 'react';
import { FaX } from 'react-icons/fa6';

export const AlertRoot = AlertDialog.Root;
export const AlertTrigger = AlertDialog.Trigger;
export const AlertCancel = AlertDialog.Cancel;
export const AlertAction = AlertDialog.Action;

export const AlertOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialog.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialog.Overlay>
>(({ className, ...properties }, reference) => (
    <AlertDialog.Overlay
        ref={reference}
        className={clsx(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  fixed inset-0 z-50 bg-neutral-800/60 backdrop-blur-sm',
            className
        )}
        {...properties}
    />
));

AlertOverlay.displayName = AlertDialog.Overlay.displayName;

export const AlertContent = React.forwardRef<
    React.ElementRef<typeof AlertDialog.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialog.Content> & {
        noPadding?: boolean;
        noCloseButton?: boolean;
        noBg?: boolean;
    }
>(
    (
        { className, children, noPadding, noCloseButton, noBg, ...properties },
        reference
    ) => (
        <AlertDialog.Portal>
            <AlertOverlay />
            <AlertDialog.Content
                ref={reference}
                className={clsx(
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border shadow-lg duration-200 sm:rounded-lg',
                    noPadding ? '' : 'p-6',
                    noBg ? '' : 'bg-default',
                    className
                )}
                {...properties}
            >
                {children}
                {!noCloseButton && (
                    <AlertDialog.Cancel
                        className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
                        type="button"
                    >
                        <FaX className="size-4" />
                        <span className="sr-only">Cancel</span>
                    </AlertDialog.Cancel>
                )}
            </AlertDialog.Content>
        </AlertDialog.Portal>
    )
);

AlertContent.displayName = AlertDialog.Content.displayName;

export const AlertFooter = ({
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

AlertFooter.displayName = 'AlertFooter';

export const AlertTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialog.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialog.Title>
>(({ className, ...properties }, reference) => (
    <AlertDialog.Title
        ref={reference}
        className={clsx(
            'text-lg font-semibold leading-none tracking-tight',
            className
        )}
        {...properties}
    />
));

AlertTitle.displayName = AlertDialog.Title.displayName;

export const AlertDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialog.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialog.Description>
>(({ className, ...properties }, reference) => (
    <AlertDialog.Description
        ref={reference}
        className={clsx('text-muted-foreground text-sm', className)}
        {...properties}
    />
));

AlertDescription.displayName = AlertDialog.Description.displayName;
