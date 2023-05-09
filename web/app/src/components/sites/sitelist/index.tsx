import { Site } from '@edgelabs/types';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

export const SiteList: FC<{
    team: string;
}> = ({ team }) => {
    const { data } = useSWR<Site[]>(`/t/${team}/sites`);

    return (
        <div
            className="grid gap-4"
            style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            }}
        >
            {data &&
                data?.map((site) => (
                    <Link
                        to={`/s/${site.site_id}`}
                        key={site.site_id}
                        className="card flex flex-col p-3 transition-shadow duration-1000 hover:shadow-md"
                    >
                        <div className="aspect-video w-full animate-pulse rounded-md border border-neutral-300 bg-neutral-200"></div>
                        <div className="flex flex-col p-2">
                            <h3 className="font-bold">{site.name}</h3>
                            <span className="leading-tight">
                                {site.site_id}
                            </span>
                        </div>
                    </Link>
                ))}
        </div>
    );
};
