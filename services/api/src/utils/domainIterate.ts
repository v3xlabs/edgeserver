export const domainIterate = (domain: string) => {
    const domains = domain.split('.');

    return domains.map((_, index) => domains.slice(index).join('.'));
};
