export const cx = (...classNames: (string | undefined | false)[]) => {
    return classNames.filter(Boolean).join(' ');
};
