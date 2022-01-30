import { LogMethodInput } from '@lvksh/logger';

export const RejectReasons = {
    NOT_FOUND: { status: 404 },
    MALFORMAT: { status: 400 },
    EXPLOIT: { status: 402 }, // I can has humor,
    EXISTS: { status: 404 },
    IS_FILE: { status: 500 }, // Parent Directory was a file
    FORBIDDEN: { status: 403 },
};

export class RejectReason extends Error {
    public serverError: LogMethodInput[];

    constructor(
        public reason: keyof typeof RejectReasons,
        ...serverError: LogMethodInput[]
    ) {
        super(serverError.join('\n'));
        this.serverError = serverError;
    }
}
