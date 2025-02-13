-- Add a new column to the deployments table to store the deployment context
ALTER TABLE deployments ADD COLUMN context TEXT;
