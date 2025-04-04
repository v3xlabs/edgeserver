import ColorHash from 'color-hash';
import { FC } from 'react';

const colorHash = new ColorHash({ saturation: 1 });

export const stringToColour = (s: string): string => colorHash.hex(s);

export const generateColours = (s: string): [string, string] => {
    const s1 = s.slice(0, Math.max(0, s.length / 2));
    const s2 = s.slice(Math.max(0, s.length / 2));
    const c1 = stringToColour(s1);
    const c2 = stringToColour(s2);

    return [c1, c2];
};

export const generateSVG = (s: string, size = 256): string => {
    const [c1, c2] = generateColours(s);

    return `
<svg className="w-full h-full" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="url(#gradient-${s})" />
  <defs>
    <linearGradient id="gradient-${s}" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
  </defs>
</svg>
  `.trim();
};

export const AvatarGradient: FC<{ s: string }> = ({ s }) => {
    return (
        <div
            className="avatar-gradient"
            dangerouslySetInnerHTML={{ __html: generateSVG(s) }}
        />
    );
};
