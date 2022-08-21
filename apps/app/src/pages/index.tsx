import { Button } from '@components/Button';
import { CreateAppModal } from '@components/CreateAppModal/CreateAppModal';
import { environment } from '@utils/enviroment';
import { ApplicationListData, useApps } from '@utils/queries/useApps';
import { formatDistance, isValid } from 'date-fns';
import { FC, useMemo, useState } from 'react';
import { GitHub } from 'react-feather';
import { Link } from 'react-router-dom';
import { decode } from 'sunflake';

const ApplicationShadowCard: FC = () => {
    return <div className="card p-2 h-64 skeleton shadow-lg" />;
};

const InlineTimeDistance: FC<{ snowflake: string }> = ({ snowflake }) => {
    const time_distance = useMemo(() => {
        const decoded = decode(snowflake);
        const date_s = Number.parseInt(decoded.time.toString());

        if (!isValid(new Date(date_s))) return 'Unknown';

        if (!decoded.time) return 'Error';

        return formatDistance(new Date(), date_s) + ' ago';
    }, []);

    return <>{time_distance}</>;
};

const ApplicationCard: FC<{
    application: ApplicationListData;
}> = ({ application }) => {
    const [previewImage, setPreviewImage] = useState(true);

    return (
        <Link
            className="card overflow-hidden bg-neutral-50 dark:bg-black-800 border border-neutral-300 dark:border-neutral-700 shadow-lg hover:shadow-xl relative"
            to={'/app/' + application.app_id}
        >
            {(application['preview_url'] && previewImage && (
                <div className="">
                    <img
                        src={
                            environment.API_URL +
                            application['preview_url'] +
                            '/root'
                        }
                        alt="website preview"
                        className="w-full aspect-video object-cover left-0 right-0 top-0 bottom-0 z-10 border-b border-neutral-300 dark:border-neutral-700"
                        onError={() => {
                            setPreviewImage(false);
                        }}
                    />
                </div>
            )) || (
                <div className="w-full aspect-video">
                    <div className="font-bold flex flex-col items-center justify-center border-b border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 w-full h-full">
                        <span className="to-pink-800 from-blue-700 brightness-200 bg-gradient-to-tl bg-clip-text text-transparent">
                            No Render
                        </span>
                        <span>Preview</span>
                    </div>
                </div>
            )}
            <div className="p-2 pl-4 flex">
                {application.favicon_url && (
                    <div className="h-full pr-2 pt-2 flex items-center justify-center">
                        <img
                            src={application.favicon_url}
                            alt=""
                            className="w-8 aspect-square"
                        />
                    </div>
                )}
                <div className="h-fit flex-1">
                    <div className="flex items-center gap-4">
                        <div className="h-full">
                            <h2 className="text-lg font-bold">
                                {application.name}
                            </h2>
                            <p className="text-sm opacity-50">
                                {application.domain_id || 'No Domain Assigned'}
                            </p>
                        </div>
                    </div>

                    {application.last_deploy && (
                        <div className="flex items-center pt-2 px-1 justify-end gap-2">
                            <p className="opacity-50 w-fit">
                                <InlineTimeDistance
                                    snowflake={application.last_deploy}
                                />
                            </p>
                            <GitHub size={'1em'} opacity={0.5} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

const AppsList: FC = () => {
    const { data, isLoading, isSuccess } = useApps();
    const [isCreatingApp, setCreatingApp] = useState(false);

    return (
        <div className="gap-4 flex flex-col w-full">
            <div className="flex">
                <h2 className="text-2xl block flex-grow">
                    Apps {data && data.length > 0 ? `(${data.length})` : ''}
                </h2>
                <Button
                    label={'Create an App!'}
                    onClick={() => {
                        console.log('click');
                        setCreatingApp(true);
                    }}
                />
                {isCreatingApp && (
                    <CreateAppModal
                        onClose={() => {
                            setCreatingApp(false);
                        }}
                    />
                )}
            </div>
            <div className="gap-4 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {data &&
                    isSuccess &&
                    data.map((project) => (
                        <ApplicationCard
                            key={project.app_id}
                            application={project}
                        />
                    ))}
                {!data &&
                    isLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                        <ApplicationShadowCard key={index} />
                    ))}
            </div>
        </div>
    );
};

export const Home: FC = () => {
    document
        .querySelector('#favicon')
        // @ts-ignore
        ?.setAttribute('href', window.OG_FAVICON || '');

    return (
        <div className="containerd pt-8">
            <AppsList />
        </div>
    );
};
