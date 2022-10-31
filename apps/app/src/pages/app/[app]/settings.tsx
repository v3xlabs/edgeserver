import { FC } from 'react';
import { useParams } from 'react-router';

export const AppSettingsPage: FC = () => {
    const { app_id } = useParams<{ app_id: string }>();

    return <div className="containerd pt-8">App Settings {app_id}</div>;
};
