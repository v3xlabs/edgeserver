import { format, formatDistance } from 'date-fns';

import { useBuildInfo } from '@/api';

import { Tooltip } from '../tooltip';

export const BuildInfo = () => {
    const { data: buildInfo } = useBuildInfo();

    const branch =
        !buildInfo?.git_branch || buildInfo.git_branch === 'master' ? (
            <></>
        ) : (
            <>{buildInfo.git_branch}</>
        );

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                {buildInfo?.version && (
                    <span>
                        <Tooltip
                            trigger={
                                <span className="bg-accent rounded-md px-2 py-0.5 text-sm text-white">
                                    {buildInfo.version}
                                </span>
                            }
                        >
                            <p>
                                {format(
                                    new Date(buildInfo.build_time),
                                    'yyyy-MM-dd HH:mm:ss'
                                )}
                            </p>
                            <p>
                                {formatDistance(
                                    new Date(buildInfo.build_time),
                                    new Date(),
                                    {
                                        addSuffix: true,
                                    }
                                )}
                            </p>
                        </Tooltip>
                    </span>
                )}
                {buildInfo?.git_commit && (
                    <span>
                        <a
                            href={`https://github.com/v3xlabs/edgeserver/commit/${buildInfo.git_commit}`}
                            target="_blank"
                            className="link"
                            rel="noreferrer"
                        >
                            #{buildInfo.git_commit.slice(0, 7)}
                        </a>
                    </span>
                )}
                {branch}
                {buildInfo?.git_dirty && (
                    <span className="text-red-500">*</span>
                )}
            </div>
        </div>
    );
};
