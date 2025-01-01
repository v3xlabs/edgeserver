export const getInstanceName = () => {
    return location.hostname;
};

export const getTitle = (pageTitle: string) =>
    `${pageTitle} | ${getInstanceName()}`;
