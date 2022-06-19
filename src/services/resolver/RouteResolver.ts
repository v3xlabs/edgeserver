import { GenericStorage } from '../../storage/GenericStorage';
import { log } from '../../util/logging';

export const resolveRoute = async (
    storage: GenericStorage,
    sid: string,
    path: string
) => {
    log.debug({path});

    let pathList = path.split('/'); // ['user', '12345', 'world']

    for (let i = pathList.length - 1; i > 0; i--) {
        const fileToCheck = pathList[i];
        // check exact match, if file extension, use that, if not, use html
        const pathToCheck =
            pathList.slice(0, i).join('/') +
            '/' +
            (fileToCheck.length == 0 ? 'index.html' : fileToCheck.split('.').length > 1
                ? fileToCheck
                : fileToCheck + '.html');

        log.debug({pathToCheck});
        const steve = await storage.exists(sid, pathToCheck);
        if (steve) {
            return await storage.get(sid, pathToCheck);
        }
    }
    // const data = await storage.traverse(sid, path);

    // if (!data) return;

    // return data;
    return undefined;
};
const test = {
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/"
        }
    ],
}

// example.com/test -> example.com/
// example.com/test.png -> example.com/test.png