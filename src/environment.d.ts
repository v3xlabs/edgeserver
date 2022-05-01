/* http://0.0.0.0:0000  */
export type IPString = string;

declare global {
    namespace NodeJS {
        interface ProcessEnvironment {
            DB_IP: string;
            DB_DATACENTER: 'datacenter1';
            GITHUB_ID: string;
            GITHUB_SECRET: IPString;
            IPFS_IP: IPString;
            IPFS_API: IPString;
            SIGNALFS_IP: IPString;
            SIGNAL_MASTER: string;
            SIGNAL_HOST: string;
            ADD_HEADER: boolean;
            DEBUG: boolean;
        }
    }
}

export {};
