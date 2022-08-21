// Super small utility for combining class names
export const cx = (...classNames: string[]) =>
    classNames.filter((a) => !!a).join(' ');
