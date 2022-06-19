export const getFirstMatchingPattern = (patterns: string[], target: string) =>
    patterns.findIndex((pattern) => target.match(pattern));
