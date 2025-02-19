/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Team } from '@/api';
import { Button } from '@/components';

export const TeamAvatarUpload: FC<{ team: Team }> = ({ team }) => {
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [preview, setPreview] = useState<string | undefined>(team.avatar_url);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    const handleSubmit = async () => {
        if (!selectedFile) return;
        // TODO: Implement avatar upload logic here
        // For example: await uploadTeamAvatar(team.id, selectedFile);
    };

    // When a new file is selected, create an object URL for preview,
    // and clean it up when the component unmounts or the file changes.
    useEffect(() => {
        if (!selectedFile) return;

        const objectUrl = URL.createObjectURL(selectedFile);

        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    return (
        <div className="flex w-full justify-start space-y-4">
            <div className="flex flex-col items-center">
                <div
                    {...getRootProps({
                        className: `relative mb-4 size-32 overflow-hidden rounded-md flex cursor-pointer items-center justify-center ${
                            isDragActive
                                ? 'border border-blue-500'
                                : 'border border-gray-300'
                        }`,
                    })}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                            Drop the avatar here...
                        </div>
                    ) : preview ? (
                        <img
                            src={preview}
                            alt="Avatar preview"
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                            Drag &amp; drop an avatar here, or click to select
                            one
                        </div>
                    )}
                </div>
                <Button onClick={handleSubmit} disabled={!selectedFile}>
                    Upload Avatar
                </Button>
            </div>
        </div>
    );
};
