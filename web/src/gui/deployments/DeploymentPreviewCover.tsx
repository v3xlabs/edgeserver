import { FC } from 'react';

import { useDeploymentPreviews, useLastPreviewDeployment } from '@/api';
import { ModalContent, ModalRoot, ModalTrigger } from '@/components';

export const DeploymentPreviewCover: FC<{
    siteId: string;
    deploymentId?: string;
}> = ({ siteId, deploymentId }) => {
    const { data: previews } = deploymentId
        ? useDeploymentPreviews(siteId, deploymentId)
        : useLastPreviewDeployment(siteId);

    if (!previews || previews.length === 0) {
        return <></>;
    }

    return (
        <div className="flex">
            <ModalRoot>
                <div className="aspect-video h-fit w-full max-w-sm overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                    <ModalTrigger>
                        {previews && previews.length > 0 && (
                            <img
                                alt="Deployment Preview"
                                src={previews[0].preview_path}
                                className="size-full object-cover"
                            />
                        )}
                    </ModalTrigger>
                </div>
                <ModalContent width="full" className="top-0 flex" noPadding>
                    <div className="size-full max-h-[90vh] overflow-hidden rounded-md">
                        <div className="h-full overflow-y-scroll">
                            <img
                                alt="Deployment Preview"
                                src={previews[0].full_preview_path}
                                className="h-auto w-full"
                            />
                        </div>
                    </div>
                </ModalContent>
            </ModalRoot>
        </div>
    );
};
