-- Update user_team_invites to have user_id as optional
ALTER TABLE user_team_invites ALTER COLUMN user_id DROP NOT NULL;
-- Add column to indicate status of invite
ALTER TABLE user_team_invites ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'pending';
-- Add column to indicate time at which invite was accepted
ALTER TABLE user_team_invites ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
-- Add column to indicate which user sent the invite
ALTER TABLE user_team_invites ADD COLUMN sender_id VARCHAR(255) NOT NULL;
