// Disabled since this is the only place where use of process.env
// isn't prohibited

/* eslint-disable node/no-process-env */

/**
 * All enviroment variables should be accessed using this
 *
 * Example usage:
 * ```
 * import { enviroment } from "@/utils/enviroment.js"
 * enviroment.API_URL
 * ```
 */
export const environment = {
    // @ts-ignore
    API_URL: import.meta.env.VITE_API_URL,
};
