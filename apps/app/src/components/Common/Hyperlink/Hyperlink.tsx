import { cx } from '@utils/cx';
import { ComponentProps, FC, ReactNode, useRef } from 'react';
import { AriaLinkOptions, FocusableOptions, useLink } from 'react-aria';

export interface HyperlinkProperties extends AriaLinkOptions, FocusableOptions {
    nodefaultstyle?: boolean;
    href: string;
    target?: ComponentProps<'a'>['target'];

    children: ReactNode;
    className?: string;
}

export const Hyperlink: FC<HyperlinkProperties> = (properties) => {
    const reference = useRef<HTMLAnchorElement>(null);
    const { linkProps } = useLink(properties, reference);

    return (
        <a
            {...linkProps}
            href={properties.href}
            ref={reference}
            target={properties.target}
            className={cx(
                !properties.nodefaultstyle && 'text-blue-600 hover:underline',
                properties.className
            )}
        >
            {properties.children}
        </a>
    );
};
