import { cx } from '@utils/cx';
import { ComponentProps, FC, ReactNode, useRef } from 'react';
import { AriaLinkOptions, FocusableOptions, useLink } from 'react-aria';
import { Link } from 'react-router-dom';

export interface HyperlinkProperties extends AriaLinkOptions, FocusableOptions {
    nodefaultstyle?: boolean;
    href: string;
    target?: ComponentProps<'a'>['target'];

    children: ReactNode;
    className?: string;
}

const Hyperlink: FC<HyperlinkProperties> = (properties) => {
    const reference = useRef<HTMLAnchorElement>(null);
    const { linkProps } = useLink(properties, reference);

    const properties_ = {
        ...linkProps,
        ref: reference,
        target: properties.target,
        className: cx(
            !properties.nodefaultstyle && 'text-blue-600 hover:underline',
            properties.className
        ),
    };

    return (
        <>
            {properties.href.indexOf('http:/') === 0 ||
                (properties.href.indexOf('https:/') === 0 ? (
                    <>
                        <a {...properties_} href={properties.href}>
                            {properties.children}
                        </a>
                    </>
                ) : (
                    <>
                        <Link {...properties_} to={properties.href}>
                            {properties.children}
                        </Link>
                    </>
                ))}
        </>
    );
};

export default Hyperlink;
