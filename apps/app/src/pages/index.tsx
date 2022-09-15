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
            className="card flex-col overflow-hidden relative"
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
        <div className="containerd">
            <div className="containerc gap-4 flex flex-col">
                <div className="flex">
                    <div className="card flex w-full overflow-hidden">
                        <div className="border-r border-neutral-300 dark:border-neutral-700">
                            <h1 className="text-2xl block flex-grow m-4 h-24">
                                Overview
                            </h1>
                            <div className="w-full flex border-t border-neutral-300 dark:border-neutral-700">
                                <div
                                    className="grid grid-cols-2 bg-neutral-300 dark:bg-neutral-700 max-w-sm"
                                    style={{ gap: '1px' }}
                                >
                                    {[
                                        [
                                            'Total Applications',
                                            data && data.length > 0
                                                ? data.length
                                                : '-',
                                        ],
                                        ['Deploys in last 30 days', '-'],
                                        ['Total Requests', '-'],
                                        [
                                            'Last Login',
                                            ((b = new Date()) =>
                                                `${b.getHours()}:${b.getMinutes()}, ${b.getDay()}-${b.getMonth()}`)(),
                                        ],
                                    ].map((a, index) => (
                                        <div
                                            key={index}
                                            className="card-bg p-2 px-4 flex flex-col"
                                        >
                                            <p className="text-neutral-500 flex-grow truncate">
                                                {a.at(0)}
                                            </p>
                                            <span>{a.at(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center flex-grow p-4 bg-white dark:bg-black-900">
                            <div className="card border-0 p-4 gap-2 flex flex-col items-center">
                                <p>This is the application menu</p>
                                <Button
                                    label={'New App'}
                                    className="px-2 py-1 text-xs"
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
                        </div>
                    </div>
                </div>
                <h2 className="text-xl">Applications</h2>
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
