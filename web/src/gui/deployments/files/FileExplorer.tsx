import * as Collapsible from '@radix-ui/react-collapsible';
import byteSize from 'byte-size';
import { FC, useState } from 'react';
import {
    BsFileEarmarkFont,
    BsFiletypeCss,
    BsFiletypeHtml,
    BsFiletypeJs,
    BsFiletypeJson,
    BsFiletypeXml,
} from 'react-icons/bs';
import { FiFile, FiFolderMinus, FiFolderPlus, FiImage } from 'react-icons/fi';

import { useDeploymentFiles } from '@/api';
import { components } from '@/api/schema.gen';

type DeploymentFile = components['schemas']['DeploymentFileEntry'];

type FolderNode = {
    type: 'directory';
    files: Record<string, TreeNode>;
};

type TreeNode = FolderNode | FileNode;
type FileNode = { type: 'file'; file: DeploymentFile };
const reorgFilesIntoTree = (files?: DeploymentFile[]): TreeNode => {
    const tree: FolderNode = {
        type: 'directory',
        files: {},
    };

    if (!files) {
        return tree;
    }

    for (const file of files) {
        // Split the path and remove any empty segments (from leading/trailing slashes)
        const segments = file.deployment_file_file_path
            .split('/')
            .filter(Boolean);

        if (segments.length === 0) {
            continue; // Skip if the path is empty
        }

        // The last segment is assumed to be the file name
        const fileName = segments.pop() as string;
        let currentFolder: FolderNode = tree;

        // Ensure that each directory in the path exists in the tree
        for (const segment of segments) {
            if (!currentFolder.files[segment]) {
                currentFolder.files[segment] = {
                    type: 'directory',
                    files: {},
                };
            }

            currentFolder = currentFolder.files[segment] as FolderNode;
        }

        // Insert the file node in the current folder
        currentFolder.files[fileName] = {
            type: 'file',
            file,
        };
    }

    return tree;
};

export const FileExplorer: FC<{ siteId: string; deploymentId: string }> = ({
    siteId,
    deploymentId,
}) => {
    const { data: deploymentFiles } = useDeploymentFiles(siteId, deploymentId);
    const tree = reorgFilesIntoTree(deploymentFiles);

    if (!deploymentFiles) {
        return;
    }

    return (
        <div className="space-y-4">
            <div className="card">
                <div className="bg-secondary rounded-md border p-4">
                    <TreeEntry node={tree} name="/" />
                </div>
            </div>
            {/* {deploymentFiles && (
                <div className="card text-wrap break-words">
                    <pre className="w-full whitespace-break-spaces">
                        {JSON.stringify(deploymentFiles, undefined, 2)}
                    </pre>
                </div>
            )} */}
        </div>
    );
};

export const TreeEntry: FC<{ node: TreeNode; name: string }> = ({
    node,
    name,
}) => {
    if (node.type === 'file') {
        return <FileEntry file={node.file} name={name} />;
    }

    return <FolderEntry node={node} name={name} />;
};

export const FolderEntry: FC<{ node: FolderNode; name: string }> = ({
    node,
    name,
}) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} asChild>
            <div
                role="treeitem"
                aria-expanded={isOpen}
                aria-label={name}
                aria-selected={false}
            >
                <Collapsible.Trigger asChild>
                    <div
                        className="flex cursor-pointer items-center gap-2"
                        role="button"
                        tabIndex={0}
                    >
                        {isOpen ? <FiFolderMinus /> : <FiFolderPlus />}
                        <span>{name}</span>
                    </div>
                </Collapsible.Trigger>

                <Collapsible.Content>
                    <ul className="pl-4" role="group">
                        {Object.entries(node.files)
                            .sort(([aName, a], [bName, b]) => {
                                if (
                                    a.type === 'directory' &&
                                    b.type === 'file'
                                ) {
                                    return -1;
                                }

                                if (
                                    a.type === 'file' &&
                                    b.type === 'directory'
                                ) {
                                    return 1;
                                }

                                return aName.localeCompare(bName);
                            })
                            .map(([key, value]) => (
                                <li key={key}>
                                    <TreeEntry node={value} name={key} />
                                </li>
                            ))}
                    </ul>
                </Collapsible.Content>
            </div>
        </Collapsible.Root>
    );
};

export const FileEntry: FC<{ file: DeploymentFile; name: string }> = ({
    file,
    name,
}) => {
    const file_size = file.file_size ? byteSize(file.file_size) : undefined;

    return (
        <div
            className="flex items-center justify-between gap-2"
            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
            role="treeitem"
            aria-label={name}
        >
            <div className="flex items-center gap-2">
                <CustomFileIcon mime_type={file.deployment_file_mime_type} />
                <span>{name}</span>
            </div>
            <div className="flex items-center gap-2">
                <span>{file.deployment_file_mime_type}</span>
                {file_size && <span>{file_size.toString()}</span>}
            </div>
        </div>
    );
};

export const CustomFileIcon: FC<{ mime_type: string }> = ({ mime_type }) => {
    if (mime_type === 'text/html') {
        return <BsFiletypeHtml />;
    }

    if (mime_type === 'text/xml') {
        return <BsFiletypeXml />;
    }

    if (
        [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/svg+xml',
            'image/webp',
        ].includes(mime_type)
    ) {
        return <FiImage />;
    }

    if (
        [
            'application/font-woff',
            'application/font-woff2',
            'application/font-sfnt',
        ].includes(mime_type)
    ) {
        return <BsFileEarmarkFont />;
    }

    if (mime_type === 'text/css') {
        return <BsFiletypeCss />;
    }

    if (mime_type === 'text/javascript') {
        return <BsFiletypeJs />;
    }

    if (mime_type === 'application/json') {
        return <BsFiletypeJson />;
    }

    return <FiFile />;
};
