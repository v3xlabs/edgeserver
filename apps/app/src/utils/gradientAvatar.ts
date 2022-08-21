import stringHash from 'string-hash';

const uniqueID = () => Math.floor(Math.random() * Date.now());

// From https://github.com/varld/hsl-triad
const hslTriad = (hue: number, saturation: number, lightness: number) => [
    [hue, saturation, lightness],
    [(hue + 120) % 360, saturation, lightness],
    [(hue + 240) % 360, saturation, lightness],
];

const getHue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;

    if (t > 1) t -= 1;

    if (t < 1 / 6) return p + (q - p) * 6 * t;

    if (t < 1 / 2) return q;

    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

    return p;
};

const hslRgb = (hue: number, saturation: number, lightness: number) => {
    let r, g, b;

    hue = hue / 360;

    if (saturation == 0) {
        r = g = b = lightness;
    } else {
        const q =
            lightness < 0.5
                ? lightness * (1 + saturation)
                : lightness + saturation - lightness * saturation;
        const p = 2 * lightness - q;

        r = getHue(p, q, hue + 1 / 3);
        g = getHue(p, q, hue);
        b = getHue(p, q, hue - 1 / 3);
    }

    return [
        Math.max(0, Math.min(Math.round(r * 255), 255)),
        Math.max(0, Math.min(Math.round(g * 255), 255)),
        Math.max(0, Math.min(Math.round(b * 255), 255)),
    ];
};

export const gradientAvatar = (string_: string, size?: number) => {
    const hash = stringHash(string_);
    const colors = hslTriad(hash % 360, 1, 0.5);
    const color1 = hslRgb(
        colors.at(0)!.at(0)!,
        colors.at(0)!.at(1)!,
        colors.at(0)!.at(2)!
    );

    const color2 = hslRgb(
        colors.at(1)!.at(0)!,
        colors.at(1)!.at(1)!,
        colors.at(1)!.at(2)!
    );

    const color1string = `rgb(${color1.at(0)}, ${color1.at(1)}, ${color1.at(
        2
    )})`;
    const color2string = `rgb(${color2.at(0)}, ${color2.at(1)}, ${color2.at(
        2
    )})`;

    const id = uniqueID();

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg ${
        size != undefined
            ? 'width="' + size + 'px" height="' + size + 'px"'
            : ''
    } viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="${id}">
      <stop stop-color="${color1string}" offset="0%"></stop>
      <stop stop-color="${color2string}" offset="100%"></stop>
    </linearGradient>
  </defs>
  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <rect id="Rectangle" fill="url(#${id})" x="0" y="0" width="80" height="80"></rect>
  </g>
</svg>`;
};
