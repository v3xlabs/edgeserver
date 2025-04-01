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