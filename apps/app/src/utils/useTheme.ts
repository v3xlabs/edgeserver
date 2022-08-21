/* eslint-disable sonarjs/no-duplicate-string */
export const toggleTheme = () => {
    const isDark =
        localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    localStorage.setItem('color-theme', isDark ? 'white' : 'dark');
    document.body.classList.toggle('dark');
};

export const useTheme = () => {
    const isDark =
        localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    return { theme: isDark ? 'dark' : 'light' };
};
