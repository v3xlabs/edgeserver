-- add admin flag to users table
ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT FALSE;
-- set admin flag for existing users max 1, the first user created
UPDATE users SET admin = TRUE WHERE created_at = (SELECT MIN(created_at) FROM users);
