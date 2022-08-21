export class UnauthorizedError extends Error {
    constructor(options?: ErrorOptions) {
        super('403 Unauthorized', options);
    }
}
