export class SafeError extends Error {
    constructor(
        public status: number,
        public reply: string,
        public _marker?: string,
        public _context?: unknown
    ) {
        super(`---${status}-${reply}`);
    }
}
