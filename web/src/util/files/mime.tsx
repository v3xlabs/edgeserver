import { FC } from 'react';
import {
    LuFile,
    LuFileCode,
    LuFileCog,
    LuFileImage,
    LuFileJson,
    LuFileText,
    LuFileType,
} from 'react-icons/lu';

export const CustomFileIcon: FC<{ mime_type: string }> = ({ mime_type }) => {
    if (mime_type === 'text/html') {
        return <LuFileText />;
    }

    if (mime_type === 'text/xml') {
        return <LuFileText />;
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
        return <LuFileImage />;
    }

    if (
        [
            'application/font-woff',
            'application/font-woff2',
            'application/font-sfnt',
        ].includes(mime_type)
    ) {
        return <LuFileType />;
    }

    if (mime_type === 'text/css') {
        return <LuFileCog />;
    }

    if (mime_type === 'text/javascript') {
        return <LuFileCode />;
    }

    if (mime_type === 'application/json') {
        return <LuFileJson />;
    }

    return <LuFile />;
};

export const mimeTypeToColor = (mime_type: string) => {
    if (mime_type === 'text/html') {
        return 'text-yellow-500';
    }
};
