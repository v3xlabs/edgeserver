-- Add avatar_url to users, teams, default null, optional
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE teams ADD COLUMN avatar_url TEXT;
