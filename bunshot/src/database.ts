import { Pool } from 'pg';
import config from './config';
import { DeploymentPreview } from './types';

// Create a connection pool
const pool = new Pool({
  connectionString: config.database.url,
});

// Initialize database connection and test it
export async function initDatabase() {
  try {
    // Test the database connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Connected to database:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Insert a new deployment preview
export async function insertDeploymentPreview(
  siteId: string,
  deploymentId: string,
  filePath: string,
  fullPreviewPath: string,
  mimeType: string = 'image/webp'
): Promise<DeploymentPreview> {
  try {
    const client = await pool.connect();
    
    // Check if the record already exists
    const checkResult = await client.query(
      'SELECT * FROM deployment_previews WHERE site_id = $1 AND deployment_id = $2 AND preview_path = $3',
      [siteId, deploymentId, filePath]
    );
    
    if (checkResult.rowCount && checkResult.rowCount > 0) {
      console.log('Deployment preview already exists, skipping insert');
      client.release();
      return checkResult.rows[0] as DeploymentPreview;
    }
    
    // Insert the new record
    const result = await client.query(
      'INSERT INTO deployment_previews (site_id, deployment_id, preview_path, full_preview_path, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [siteId, deploymentId, filePath, fullPreviewPath, mimeType]
    );
    
    client.release();
    
    console.log('Deployment preview saved to database:', result.rows[0]);
    return result.rows[0] as DeploymentPreview;
  } catch (error) {
    console.error('Error inserting deployment preview:', error);
    throw error;
  }
}

// Close database connection pool
export async function closeDatabase() {
  await pool.end();
  console.log('Database connection pool closed');
} 