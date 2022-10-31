import { environment } from '@utils/enviroment';
import { useApp } from '@utils/queries/useApp';
import { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

export const DeploymentPage: FC = () => {
    const { app_id, deploy_id } = useParams<{
        app_id: string;
        deploy_id: string;
    }>();
    const app = useApp();

    // const timeDistance = useMemo(
    //     () =>
    //         formatDistance(new Date(), new Date(deployment.timestamp)) + ' ago',
    //     [deployment.timestamp]
    // );

    return (
        <div className="containerd">
            <div className="containerc pt-8">
                <Helmet>
                    <title>{app.name} / Deployment</title>
                </Helmet>
                <h2 className="text-xl font-bold">Deployment / {deploy_id}</h2>
                <p>App / {app_id}</p>
                <div className="card p-4 mt-4">
                    <img
                        src={
                            environment.API_URL +
                            '/api/image/deploy/' +
                            deploy_id +
                            '/root'
                        }
                        className="w-full rounded-lg"
                        alt="Deployment Preview Render"
                    />
                </div>
                <div className="card p-4 mt-4">
                    <p>Heya!</p>
                    <p>
                        This is the page of an individual deployment made{' '}
                        <code>{'insert time here'}</code> ago.
                    </p>
                    <p>To exit you can go back to the:</p>
                    <ul>
                        <li>
                            <Link to={'/app/' + app_id} className="link">
                                - Application
                            </Link>{' '}
                            (or by clicking the tab)
                        </li>
                        <li>
                            <Link
                                to={'/app/' + app_id + '/deployments'}
                                className="link"
                            >
                                - Deployments
                            </Link>{' '}
                            (or by clicking the tab)
                        </li>
                        <li>
                            <Link to={'/'} className="link">
                                - Dashboard
                            </Link>{' '}
                            (or by clicking the logo)
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
