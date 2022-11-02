import { Container } from '@edgelabs/components';
import { FC } from 'react';
import { useParams } from 'react-router';

export const AppSettingsPage: FC = () => {
    const { app_id } = useParams<{ app_id: string }>();

    return (
        <Container topPadding horizontalPadding>
            App Settings {app_id}
        </Container>
    );
};
