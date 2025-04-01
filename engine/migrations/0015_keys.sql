-- CREATE TABLE keys
-- key_id -- `edgeserver_user_key_...` or `edgeserver_team_key_...` or `edgeserver_site_key_...`
-- key_type -- `user` or `team` or `site`
-- resource -- user_id or team_id or site_id
-- permissions -- text
-- created_at -- timestamp
-- last_used -- timestamp
-- expires_at -- timestamp

CREATE TABLE keys (
    key_id TEXT PRIMARY KEY,
    vanity TEXT NOT NULL,
    key_type TEXT NOT NULL,
    key_resource TEXT NOT NULL,
    permissions TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Add index for last_used
CREATE INDEX idx_last_used ON keys (last_used);
CREATE INDEX idx_key_resource ON keys (key_resource);
