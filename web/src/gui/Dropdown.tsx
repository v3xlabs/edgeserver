/* eslint-disable sonarjs/no-duplicate-string */
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
    ComponentPropsWithoutRef,
    ElementRef,
    forwardRef,
    HTMLAttributes,
} from 'react';
import { FaCheck, FaChevronRight, FaCircle } from 'react-icons/fa6';

import { cn } from '@/util/style';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
        inset?: boolean;
    }
>(({ className, inset, children, ...properties }, reference) => (
    <DropdownMenuPrimitive.SubTrigger
        ref={reference}
        className={cn(
            // Layout & Position
            'flex items-center',
            // Sizing & Spacing
            'gap-2 px-2 py-1.5',
            // Typography
            'text-sm select-none cursor-default',
            // Visual & Borders
            'rounded-sm outline-none',
            // States
            'focus:bg-accent data-[state=open]:bg-accent',
            // SVG styles
            '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
            // Conditional padding
            inset && 'pl-8',
            // Custom classes
            className
        )}
        {...properties}
    >
        {children}
        <FaChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
));

DropdownMenuSubTrigger.displayName =
    DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.SubContent>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...properties }, reference) => (
    <DropdownMenuPrimitive.SubContent
        ref={reference}
        className={cn(
            // Layout & Position
            'z-50',
            // Sizing & Spacing
            'min-w-[8rem] p-1',
            // Visual & Borders
            'overflow-hidden rounded-md border shadow-lg',
            // States
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            // Animations & Transitions
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            // Custom classes
            className
        )}
        {...properties}
    />
));

DropdownMenuSubContent.displayName =
    DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...properties }, reference) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={reference}
            sideOffset={sideOffset}
            className={cn(
                // Layout & Position
                'z-50',

                // Sizing & Spacing
                'min-w-[8rem] p-1',

                // Visual & Borders
                'overflow-hidden rounded-md border',

                // Colors & Background
                'bg-default text-primary',
                // Animation States
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                className
            )}
            {...properties}
        />
    </DropdownMenuPrimitive.Portal>
));

DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Item>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
        inset?: boolean;
    }
>(({ className, inset, ...properties }, reference) => (
    <DropdownMenuPrimitive.Item
        ref={reference}
        className={cn(
            // Layout & Position
            'relative flex items-center',

            // Sizing & Spacing
            'gap-2 px-2 py-1.5',

            // Typography
            'text-sm select-none cursor-default',

            // Visual & Borders
            'rounded-sm outline-none',

            // Colors & States
            'focus:bg-accent focus:text-accent-foreground',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',

            // SVG Styles
            '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',

            // Transitions
            'transition-colors',

            // Conditional Spacing
            inset && 'pl-8',

            className
        )}
        {...properties}
    />
));

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...properties }, reference) => (
    <DropdownMenuPrimitive.CheckboxItem
        ref={reference}
        className={cn(
            // Layout & Position
            'relative flex items-center',

            // Sizing & Spacing
            'py-1.5 pl-8 pr-2',

            // Typography
            'text-sm select-none cursor-default',

            // Visual & Borders
            'rounded-sm outline-none',

            // States & Transitions
            'transition-colors',
            'focus:bg-accent focus:text-accent-foreground',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',

            className
        )}
        checked={checked}
        {...properties}
    >
        <span
            className={cn(
                // Layout & Position
                'absolute left-2 flex items-center justify-center',

                // Sizing
                'h-3.5 w-3.5'
            )}
        >
            <DropdownMenuPrimitive.ItemIndicator>
                <FaCheck className="size-4" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
));

DropdownMenuCheckboxItem.displayName =
    DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...properties }, reference) => (
    <DropdownMenuPrimitive.RadioItem
        ref={reference}
        className={cn(
            // Layout & Position
            'relative flex items-center',

            // Sizing & Spacing
            'py-1.5 pl-8 pr-2',

            // Typography
            'text-sm select-none cursor-default',

            // Visual & Borders
            'rounded-sm outline-none',

            // States & Transitions
            'transition-colors',
            'focus:bg-accent focus:text-accent-foreground',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',

            className
        )}
        {...properties}
    >
        <span
            className={cn(
                // Layout & Position
                'absolute left-2 flex items-center justify-center',

                // Sizing
                'h-3.5 w-3.5'
            )}
        >
            <DropdownMenuPrimitive.ItemIndicator>
                <FaCircle className="size-2 fill-current" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
));

DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Label>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
        inset?: boolean;
    }
>(({ className, inset, ...properties }, reference) => (
    <DropdownMenuPrimitive.Label
        ref={reference}
        className={cn(
            'px-2 py-1.5 text-sm font-semibold',
            inset && 'pl-8',
            className
        )}
        {...properties}
    />
));

DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Separator>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...properties }, reference) => (
    <DropdownMenuPrimitive.Separator
        ref={reference}
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...properties}
    />
));

DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
    className,
    ...properties
}: HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn(
                'ml-auto text-xs tracking-widest opacity-60',
                className
            )}
            {...properties}
        />
    );
};

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export const Root = DropdownMenu;
export const CheckboxItem = DropdownMenuCheckboxItem;
export const Content = DropdownMenuContent;
export const Group = DropdownMenuGroup;
export const Item = DropdownMenuItem;
export const Label = DropdownMenuLabel;
export const RadioGroup = DropdownMenuRadioGroup;
export const RadioItem = DropdownMenuRadioItem;
export const Separator = DropdownMenuSeparator;
export const Shortcut = DropdownMenuShortcut;
export const Sub = DropdownMenuSub;
export const SubContent = DropdownMenuSubContent;
export const SubTrigger = DropdownMenuSubTrigger;
export const Trigger = DropdownMenuTrigger;

export {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
};
