/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ChangeEvent, FC, useState } from 'react';

import { Team } from '@/api';
import { Button } from '@/components';

const handleDrag = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
};

export const TeamAvatarUpload: FC<{ team: Team }> = ({ team }) => {
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [preview, setPreview] = useState<string | undefined>(team.avatar_url);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPreview, setDragPreview] = useState<string | undefined>();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);

            setPreview(previewUrl);
        }
    };

    const handleDragIn = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);

        // Create preview for dragged file
        const file = event.dataTransfer?.items?.[0]?.getAsFile();

        if (file && file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);

            setDragPreview(previewUrl);
        }
    };

    const handleDragOut = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        // Clean up drag preview
        if (dragPreview) {
            URL.revokeObjectURL(dragPreview);
            setDragPreview(undefined);
        }
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const file = event.dataTransfer?.files?.[0];

        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);

            setPreview(previewUrl);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;
        // TODO: Implement avatar upload logic here
        // Example: await uploadTeamAvatar(team.id, selectedFile);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center">
                <div
                    className={`relative mb-4 size-32 overflow-hidden rounded-md
                        ${
                            isDragging
                                ? 'border border-blue-500'
                                : 'border border-gray-300'
                        }
                        flex cursor-pointer items-center justify-center`}
                    onDragEnter={handleDragIn as any}
                    onDragLeave={handleDragOut as any}
                    onDragOver={handleDrag as any}
                    onDrop={handleDrop as any}
                    onClick={() =>
                        // @ts-ignore
                        document.querySelector('#avatar-input')?.click()
                    }
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            // @ts-ignore
                            document.querySelector('#avatar-input')?.click();
                        }
                    }}
                >
                    {isDragging && dragPreview ? (
                        <img
                            src={dragPreview}
                            alt="Drag preview"
                            className="size-full object-cover opacity-50"
                        />
                    ) : preview ? (
                        <img
                            src={preview}
                            alt="Avatar preview"
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                            Drag avatar here
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Submit button */}
                <Button onClick={handleSubmit} disabled={!selectedFile}>
                    Upload Avatar
                </Button>
            </div>
        </div>
    );
};
