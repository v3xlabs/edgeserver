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
        <div className="flex h-full items-center">
            {(
                [
                    ['light', <FiSun key="light" />],
                    ['dark', <FiMoon key="dark" />],
                    ['system', <FiMonitor key="system" />],
                ] as const
            ).map(([theme, icon]) => (
                <button
                    key={theme}
                    onClick={() => setTheme(theme)}
                    className={cn(
                        currentTheme === theme && 'bg-hover',
                        'h-full flex items-center px-1'
                    )}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};
