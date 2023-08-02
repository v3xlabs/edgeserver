import { GenericStorage } from '../../storage/GenericStorage';
import { log } from '../../util/logging';

export const resolveRoute = async (
    storage: GenericStorage,
    sid: string,
    path: string,
    fallback_sid: string | undefined
) => {
    log.debug({ path });

    const pathList = path.split('/'); // ['user', '12345', 'world']

    for (let index = pathList.length - 1; index > 0; index--) {
        const fileToCheck = pathList[index];
        // check exact match, if file extension, use that, if not, use html
        const prefix = pathList.slice(0, index).join('/');

        const pathsToCheck = (fileToCheck.length === 0 ? ['index.html'] : [
            prefix + '/' + fileToCheck + '.html',
            prefix + '/' + fileToCheck + '/index.html',
            prefix + '/' + fileToCheck,
            prefix + '/' + 'index.html',
        ]);

        log.debug({ pathsToCheck });

        for (const pathToCheck of pathsToCheck) {
            log.debug({ pathToCheck });

            // if total count of slashes in pathToCheck is 1, we should strip it
            const pathToCheck2 = pathToCheck.split('/').length === 1 ? pathToCheck.slice(1) : pathToCheck;

            const steve = await storage.exists(sid, pathToCheck2);

            log.debug({ pathExists: !!steve });

            if (steve)
                return await storage.get(sid, pathToCheck2);

        }
    }

    if (fallback_sid) {
        log.debug({ fallback_sid });
        const fallback_exists = await storage.exists(sid, fallback_sid);

        if (fallback_exists) {
            log.debug({ fallback_exists });

            return await storage.get(sid, fallback_sid);
        }
    }
    // const data = await storage.traverse(sid, path);

    // if (!data) return;

    // return data;
};

// example.com/test -> example.com/
// example.com/test.png -> example.com/test.png
