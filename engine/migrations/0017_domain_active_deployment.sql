ALTER TABLE domains ADD COLUMN active_deployment_id TEXT REFERENCES deployments(deployment_id);
