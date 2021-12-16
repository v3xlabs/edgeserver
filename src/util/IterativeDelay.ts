import { AwaitIterable, ImportCandidate, ImportCandidateStream } from 'ipfs-core-types/src/utils';
import { join } from 'node:path';

export async function* iterateDelay(
    path: string,
    globSource: AwaitIterable<any>
) {
    for await (const glob of globSource) {
        yield {
            path: join(path, glob.path),
            content: glob.content,
            mode: glob.mode,
            mtime: glob.mtime,
        };
    }
}