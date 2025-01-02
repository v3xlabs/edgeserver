import { FC, PropsWithChildren } from 'react';

export const SettingsSection: FC<PropsWithChildren & { title: string }> = ({
    title,
    children,
}) => (
    <div className="card mb-4 p-4">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <div className="p-4">{children}</div>
    </div>
);
