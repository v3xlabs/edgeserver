'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import cx from 'classnames';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = forwardRef<
    ElementRef<typeof CollapsiblePrimitive.Trigger>,
    ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...properties }, reference) => (
    <CollapsiblePrimitive.Trigger
        ref={reference}
        className={cx('flex w-full', className)}
        {...properties}
    />
));

CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = forwardRef<
    ElementRef<typeof CollapsiblePrimitive.Content>,
    ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...properties }, reference) => (
    <CollapsiblePrimitive.Content
        ref={reference}
        className={cx(
            'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden',
            className
        )}
        {...properties}
    />
));

CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
