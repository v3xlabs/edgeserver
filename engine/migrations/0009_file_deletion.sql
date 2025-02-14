-- Add file_deleted column to file table
ALTER TABLE files ADD COLUMN file_deleted BOOLEAN NOT NULL DEFAULT FALSE;
