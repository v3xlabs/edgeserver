import { useState } from 'react';
import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi';

import { cn } from '@/util/style';

export const updateTheme = () => {
    const theme = localStorage.getItem('theme') || 'system';

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
};

export const ThemeSwitcher = () => {
    const theme = localStorage.getItem('theme') || 'system';
    const [currentTheme, setCurrentTheme] = useState(theme);
    const setTheme = (theme: string) => {
        localStorage.setItem('theme', theme);
        setCurrentTheme(theme);

        updateTheme();
    };

    return (
        <div className="bg-muted mx-auto flex size-full gap-1 rounded-xl">
            {(
                [
                    ['light', <FiSun key="light" />],
                    ['dark', <FiMoon key="dark" />],
                    ['system', <FiMonitor key="system" />],
                ] as const
            ).map(([theme, icon]) => (
                <button
                    key={theme}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setTheme(theme);
                    }}
                    className={cn(
                        currentTheme === theme && 'bg-hover',
                        'h-full flex items-center px-1 aspect-square rounded-full'
                    )}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};
