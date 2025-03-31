ALTER TABLE deployment_previews
ADD COLUMN full_preview_path TEXT;

ALTER TABLE deployment_previews
RENAME COLUMN file_path TO preview_path;
