import { FC } from 'react';

import { useDeploymentPreviews } from '@/api';

export const DeploymentPreviewCover: FC<{
    siteId: string;
    deploymentId: string;
}> = ({ siteId, deploymentId }) => {
    const { data: previews } = useDeploymentPreviews(siteId, deploymentId);

    if (!previews || previews.length === 0) {
        return <></>;
    }

    return (
        <div className="flex">
            <div className="aspect-video h-fit w-full max-w-sm overflow-hidden rounded-md bg-gray-100">
                {previews && previews.length > 0 && (
                    <img
                        alt="Deployment Preview"
                        src={previews[0].preview_path}
                        className="size-full object-cover"
                    />
                )}
            </div>
            {/* {previews &&
                previews.length > 0 &&
                previews[0].full_preview_path && (
                    <div className="w-full max-w-sm overflow-hidden rounded-md bg-gray-100">
                        <img
                            alt="Deployment Preview"
                            src={previews[0].full_preview_path}
                            className="size-full object-cover"
                        />
                    </div>
                )} */}
        </div>
    );
};
