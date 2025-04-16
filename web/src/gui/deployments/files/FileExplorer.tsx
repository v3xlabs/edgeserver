import * as Collapsible from '@radix-ui/react-collapsible';
import byteSize from 'byte-size';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import { LuChevronRight, LuFolderClosed, LuFolderOpen } from 'react-icons/lu';
import { VscCollapseAll } from 'react-icons/vsc';

import { useDeploymentFiles } from '@/api';
import { components } from '@/api/schema.gen';
import {
    getFrameworkColor,
    getFrameworkIcon,
    useFramework,
} from '@/util/files/detection';
import { mimeTypeToColor } from '@/util/files/mime';
import { CustomFileIcon } from '@/util/files/mime';

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
    const [allCollapsed, setAllCollapsed] = useState(false);

    if (!deploymentFiles) {
        return;
    }

    const collapseAllLabel = allCollapsed
        ? 'Expand all folders'
        : 'Collapse all folders';

    return (
        <div className="card space-y-3">
            <div className="flex justify-between">
                <div className="font-bold">File Explorer</div>
                <div className="flex items-center gap-2">
                    <FrameworkDetection
                        siteId={siteId}
                        deploymentId={deploymentId}
                    />
                    <button
                        title={collapseAllLabel}
                        className="hover:text-foreground cursor-pointer text-muted"
                        onClick={() => setAllCollapsed((previous) => !previous)}
                        aria-label={collapseAllLabel}
                    >
                        <VscCollapseAll className="size-5" />
                    </button>
                </div>
            </div>
            <div className="rounded-md border bg-secondary">
                <TreeEntry
                    node={tree}
                    name="/"
                    isRoot
                    hideRoot
                    allCollapsed={allCollapsed}
                />
            </div>
        </div>
    );
};

export const TreeEntry: FC<{
    node: TreeNode;
    name: string;
    isRoot?: boolean;
    hideRoot?: boolean;
    allCollapsed?: boolean;
}> = ({
    node,
    name,
    isRoot = false,
    hideRoot = false,
    allCollapsed = false,
}) => {
    if (node.type === 'file') {
        return <FileEntry file={node.file} name={name} />;
    }

    return (
        <FolderEntry
            node={node}
            name={name}
            isRoot={isRoot}
            hideRoot={hideRoot}
            allCollapsed={allCollapsed}
        />
    );
};

export const FolderEntry: FC<{
    node: FolderNode;
    name: string;
    isRoot?: boolean;
    hideRoot?: boolean;
    allCollapsed?: boolean;
}> = ({
    node,
    name,
    isRoot = false,
    hideRoot = false,
    allCollapsed = false,
}) => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        setIsOpen(!allCollapsed);
    }, [allCollapsed]);

    const { fileCount, directoryCount } = countFilesAndDirectories(node);

    if (isRoot && hideRoot) {
        return (
            <ul className="" role="group">
                <SubTree node={node} allCollapsed={allCollapsed} />
            </ul>
        );
    }

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
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1 hover:bg-muted"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="flex items-center gap-2">
                            <LuChevronRight
                                className={clsx(
                                    'transition-transform',
                                    isOpen && 'rotate-90'
                                )}
                            />
                            {isOpen ? (
                                <LuFolderOpen className="text-blue-500" />
                            ) : (
                                <LuFolderClosed className="text-blue-500" />
                            )}
                            <span>{name}</span>
                        </div>
                        <div className="flex justify-end gap-1.5 text-muted">
                            {[
                                fileCount &&
                                    `${fileCount} file${
                                        fileCount > 1 ? 's' : ''
                                    }`,
                                directoryCount &&
                                    `${directoryCount} director${
                                        directoryCount > 1 ? 'ies' : 'y'
                                    }`,
                            ]
                                .filter(Boolean)
                                .map((count) => (
                                    <div
                                        key={count}
                                        className="rounded-md border px-2 text-muted"
                                    >
                                        {count}
                                    </div>
                                ))}
                        </div>
                    </div>
                </Collapsible.Trigger>

                <Collapsible.Content>
                    <ul className="ml-4 border-l pl-2" role="group">
                        <SubTree node={node} allCollapsed={allCollapsed} />
                    </ul>
                </Collapsible.Content>
            </div>
        </Collapsible.Root>
    );
};

export const SubTree: FC<{ node: FolderNode; allCollapsed?: boolean }> = ({
    node,
    allCollapsed = false,
}) => {
    return (
        <>
            {Object.entries(node.files)
                .sort(([aName, a], [bName, b]) => {
                    if (a.type === 'directory' && b.type === 'file') {
                        return -1;
                    }

                    if (a.type === 'file' && b.type === 'directory') {
                        return 1;
                    }

                    return aName.localeCompare(bName);
                })
                .map(([key, value]) => (
                    <li key={key}>
                        <TreeEntry
                            node={value}
                            name={key}
                            allCollapsed={allCollapsed}
                        />
                    </li>
                ))}
        </>
    );
};

export const FileEntry: FC<{ file: DeploymentFile; name: string }> = ({
    file,
    name,
}) => {
    const file_size = file.file_size ? byteSize(file.file_size) : undefined;

    return (
        <div
            className="flex items-center justify-between gap-2 px-2 py-1 hover:bg-muted"
            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
            role="treeitem"
            aria-label={name}
        >
            <div className="flex items-center gap-2">
                <span
                    className={mimeTypeToColor(file.deployment_file_mime_type)}
                >
                    <CustomFileIcon
                        mime_type={file.deployment_file_mime_type}
                    />
                </span>
                <span>{name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
                <span>{file.deployment_file_mime_type}</span>
                {file_size && <span>{file_size.toString()}</span>}
            </div>
        </div>
    );
};

export const FrameworkDetection: FC<{
    siteId: string;
    deploymentId: string;
}> = ({ siteId, deploymentId }) => {
    const framework = useFramework(siteId, deploymentId);

    return (
        <div className="flex items-center gap-2 text-muted">
            {getFrameworkIcon(framework)}
            <span className={getFrameworkColor(framework)}>{framework}</span>
        </div>
    );
};

const countFilesAndDirectories = (
    node: TreeNode
): {
    fileCount: number;
    directoryCount: number;
} => {
    if (node.type !== 'directory') return { fileCount: 0, directoryCount: 0 };

    let fileCount = 0;
    let directoryCount = 0;

    for (const fileOrFolder of Object.values(node.files)) {
        if (fileOrFolder.type === 'file') {
            fileCount++;
        } else {
            const { fileCount: _fileCount, directoryCount: _directoryCount } =
                countFilesAndDirectories(fileOrFolder);

            fileCount += _fileCount;
            directoryCount += _directoryCount;
            directoryCount++;
        }
    }

    return { fileCount, directoryCount };
};
