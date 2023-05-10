export type DeploymentV1 = {
    // SHA of the commit or custom value
    deploy_id: string;
    // Snowflake ID
    site_id: string;
    // Timestamp
    created_at: string;
};

export type DeploymentV2 = DeploymentV1 & {
    /**
     * Method of path resolution (ie. 'nova' | 'straight' | 'nerf');
     * Nova: Custom mechanism written by Luc (wip)
     * Straight: Attempt accessing direct file, otherwise 404
     * Nerf: Only access /index.html, otherwise 404
     * More soon...
     */
    resolution: string;
    /**
     * Storage location of the deployment (ie. 's3' | 'ipfs' | 'signalfs');
     */
    storage: string;
    /**
     * Storage Identifier (location within the s3, ipfs, or signalfs system)
     */
    storage_id: string;
    /**
     * Location this PR was pushed from (ie. 'github' | 'gitlab' | 'remote');
     */
    source?: string;
    /**
     * Source Metadata
     */
    source_meta?: string;
};

// TODO: "should publish to ipfs, ipfs_hash, etc"

export type Deployment = DeploymentV2;
