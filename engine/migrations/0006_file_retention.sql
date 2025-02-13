-- First drop the existing foreign key constraint
ALTER TABLE deployment_files DROP CONSTRAINT deployment_files_file_id_fkey;

-- Then recreate it with NO ACTION
ALTER TABLE deployment_files 
    ADD CONSTRAINT deployment_files_file_id_fkey 
    FOREIGN KEY (file_id) 
    REFERENCES files(file_id) 
    ON DELETE CASCADE;

ALTER TABLE deployment_files DROP CONSTRAINT deployment_files_deployment_id_fkey;

ALTER TABLE deployment_files 
    ADD CONSTRAINT deployment_files_deployment_id_fkey 
    FOREIGN KEY (deployment_id) 
    REFERENCES deployments(deployment_id) 
    ON DELETE CASCADE;
