import { LoadingApp } from '@components/LoadingApp/LoadingApp';
import { Container } from '@edgelabs/components';
import { useAppByID } from '@utils/queries/useAppByID';
import { FC } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useParams } from 'react-router';

export const AppContainer: FC = () => {
    const { app_id } = useParams<{ app_id: string }>();
    const app = useAppByID(app_id);

    if (!app_id) return <></>;

    if (app?.isLoading) return <LoadingApp />;

    if (!app?.isSuccess) return <>No App</>;

    return (
        <Container topPadding horizontalPadding>
            <Helmet>
                <title>{app?.data?.name} / EdgeServer</title>
            </Helmet>
            <Outlet context={{ app: app.data }} />
        </Container>
    );
};
