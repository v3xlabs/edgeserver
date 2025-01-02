import * as BaseAvatar from '@radix-ui/react-avatar';
import { FC } from 'react';

import { AvatarGradient } from './gradient';

export const Avatar: FC<{
    src?: string;
    alt?: string;
    fallback?: string;
    s?: string;
}> = ({ src, alt, fallback, s }) => {
    return (
        <>
            <BaseAvatar.Root className="avatar-root">
                {src && (
                    <BaseAvatar.Image
                        className="avatar-image"
                        src={src}
                        alt={alt}
                    />
                )}
                <BaseAvatar.Fallback>
                    {fallback || <AvatarGradient s={s || src || ''} />}
                </BaseAvatar.Fallback>
            </BaseAvatar.Root>
        </>
    );
};
