-- First drop the existing foreign key constraint
ALTER TABLE deployment_files DROP CONSTRAINT deployment_files_file_id_fkey;

-- Then recreate it with NO ACTION
ALTER TABLE deployment_files 
    ADD CONSTRAINT deployment_files_file_id_fkey 
    FOREIGN KEY (file_id) 
    REFERENCES files(file_id) 
    ON DELETE NO ACTION;
