// Configuration interface
export interface Config {
    rabbitmq: {
        url: string;
        queue: string;
        result_queue: string;
        reject_queue: string;
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        endpoint?: string;
    };
}

export interface CarRequest {
    deployment_id: string;
    file_path: string;
}

export interface CarResponse {
    success: boolean;
    error?: string;
    deployment_id?: string;
    cid?: string;
    file_path?: string;
}

export interface BlobLike {
    /**
     * Returns a ReadableStream which yields the Blob data.
     */
    stream: () => ReadableStream
}

export interface FileLike extends BlobLike {
    /**
     * Name of the file. May include path information.
     */
    name: string
}
