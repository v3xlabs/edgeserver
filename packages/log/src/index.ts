import { createLogger } from "@lvksh/logger";

export const log = createLogger({
    info: "INFO",
    debug: "DEBUG",
    warning: "WARNING",
    error: "ERROR",
    env: "env"
});
