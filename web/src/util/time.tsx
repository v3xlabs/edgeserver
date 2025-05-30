import { FC, useEffect, useState } from 'react';

export const secondsToDuration = (seconds: number) => {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds}s`);
    }

    return parts.join(' ');
};

export const LiveAgo: FC<{ date: Date }> = ({ date }) => {
    const [time, setTime] = useState(date);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const ago = secondsToDuration(
        Math.floor((Date.now() - date.getTime()) / 1000)
    );

    return <>{ago}</>;
};
