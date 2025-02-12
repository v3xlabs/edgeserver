-- Create a table `files` to store file_id, file_hash.
-- Create a table `deployment_files` to store deployment_id, file_id
-- deployment_id is a text foreign key to the deployments table
-- file_id is an auto incrementing integer primary key

CREATE TABLE files (
    file_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_hash TEXT NOT NULL UNIQUE
);

CREATE TABLE deployment_files (
    deployment_id TEXT REFERENCES deployments(deployment_id),
    file_id BIGINT REFERENCES files(file_id),
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    PRIMARY KEY (deployment_id, file_id, file_path)
);

-- Delete column `hash` and `storage` from the deployments table
ALTER TABLE deployments DROP COLUMN hash;
ALTER TABLE deployments DROP COLUMN storage;
