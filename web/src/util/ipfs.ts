export const combineIpfsClusterUrl = (cluster_url: string, cid: string) => {
    const DELIMITER = '%CID%';

    if (cluster_url.includes(DELIMITER)) {
        return cluster_url.replace(DELIMITER, cid);
    }

    const cluster_url_suffixed_with_slash = cluster_url.endsWith('/')
        ? cluster_url
        : `${cluster_url}/`;
    const cluster_url_with_ipfs = cluster_url_suffixed_with_slash.includes(
        'ipfs/'
    )
        ? cluster_url_suffixed_with_slash
        : `${cluster_url_suffixed_with_slash}ipfs/`;

    return `${cluster_url_with_ipfs}${cid}`;
};
