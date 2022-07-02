type Snowflake = string;

export type DeploymentV1 = {
    app_id: Snowflake;
    deploy_id: Snowflake;
    created_on: string;
};

export type DeploymentV2 = Omit<DeploymentV1, 'created_on'> & {
    timestamp: string;
    cid: string;
    sid: string;
};

export type DeploymentV3 = DeploymentV2 & {
    comment: string;
    git_sha: string; // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    git_src: number; // 0 pull_request / 1 commit / 2 tag / 3 release
    git_type: number; // 0 unknown / 1 github / 2 gitlab / 3 gitea / 4 bitbucket
    git_actor: string; // lucemans
};

export type DeploymentV4 = Omit<DeploymentV3, 'timestamp'>;

export type DeploymentV5 = Omit<
    DeploymentV4,
    'git_sha' | 'git_src' | 'git_type' | 'git_actor' | 'comment'
> & {
    context: string; // CI/CD Context
};

export type Deployment = DeploymentV5;
