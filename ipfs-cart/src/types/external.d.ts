declare module 'files-from-path' {
    export interface FileLike {
        name: string;
        stream(): Promise<ReadableStream>;
        cid(): Promise<import('multiformats').CID>;
    }

    export function filesFromPaths(paths: string[], options?: { hidden: boolean }): Promise<FileLike[]>;
}

declare module '@ipld/car/writer' {
    import { CID } from 'multiformats/cid';

    export interface Block {
        bytes: Uint8Array | Buffer;
        cid: CID;
    }

    export class CarWriter {
        static create(roots: CID[]): Promise<{ writer: CarWriter; out: ReadableStream }>;
        static updateRootsInFile(fd: ArrayBuffer, roots: CID[]): Promise<void>;
        put(block: Block): Promise<void>;
        close(): Promise<void>;
    }
}

declare module 'multiformats/cid' {
    export class CID {
        static parse(str: string): CID;
        toString(): string;
    }
} 