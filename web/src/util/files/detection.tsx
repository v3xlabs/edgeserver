import { useMemo } from 'react';
import { SiAstro, SiMdbook, SiNextdotjs } from 'react-icons/si';

import { useDeploymentFiles } from '@/api';
import { components } from '@/api/schema.gen';

type DeploymentFileEntry = components['schemas']['DeploymentFileEntry'];

type Frameworks = 'nextjs' | 'svelte' | 'sveltekit' | 'astro' | 'mdbook';

const patternMatch: Record<string, Frameworks> = {
    '/_next/*': 'nextjs',
    '/book.js': 'mdbook',
    '/_astro/*': 'astro',
};

export const detectFramework = (
    files: DeploymentFileEntry[]
): Frameworks | undefined => {
    for (const file of files) {
        const path = '/' + file.deployment_file_file_path;

        for (const pattern in patternMatch) {
            if (new RegExp(pattern).test(path)) {
                return patternMatch[pattern];
            }
        }
    }

    return undefined;
};

export const useFramework = (siteId: string, deploymentId: string) => {
    const { data: files } = useDeploymentFiles(siteId, deploymentId);

    return useMemo(() => {
        if (!files) return 'mdbook';

        return detectFramework(files);
    }, [files]);
};

export const getFrameworkIcon = (framework?: Frameworks) => {
    switch (framework) {
        case 'nextjs':
            return <SiNextdotjs />;
        case 'astro':
            return <SiAstro />;
        case 'mdbook':
            return <SiMdbook />;
    }

    return <></>;
};

export const getFrameworkColor = (framework?: Frameworks) => {
    switch (framework) {
        case 'nextjs':
            return 'text-blue-500';
        case 'svelte':
            return 'text-purple-500';
        case 'sveltekit':
            return 'text-purple-500';
        case 'astro':
            return 'text-[#ff5c02]';
        case 'mdbook':
            return 'text-gray-500';
    }
};
