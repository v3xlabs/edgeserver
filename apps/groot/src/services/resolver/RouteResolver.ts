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
        const prefix = pathList.slice(0, index).join('/') +
            '/';

        const pathsToCheck = [
            prefix + fileToCheck,
            prefix + fileToCheck + '.html',
            prefix + fileToCheck + '/index.html',
            prefix + 'index.html'
        ];

        for (const pathToCheck of pathsToCheck) {
            log.debug({ pathToCheck });
            const steve = await storage.exists(sid, pathToCheck);

            if (steve) {
                log.debug({ pathExists: true });

                return await storage.get(sid, pathToCheck);
            }
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
