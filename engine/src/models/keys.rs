use chrono::{DateTime, Duration, Utc};
use poem_openapi::{types::Example, Object};
use serde::{Deserialize, Serialize};

use crate::{
    database::Database,
    utils::{
        hash::hash_session,
        id::{generate_id, IdType},
    },
};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Object)]
#[oai(example)]
pub struct Key {
    pub key_id: String,
    pub vanity: String,
    pub key_type: String,
    pub key_resource: String,
    pub permissions: String,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
}

impl Example for Key {
    fn example() -> Self {
        Self {
            key_id: "k_site_12345678901234567890".to_string(),
            vanity: "4567890".to_string(),
            key_type: "site".to_string(),
            key_resource: "s_1234567890".to_string(),
            permissions: "TBD".to_string(),
            created_by: "u_1234567890".to_string(),
            created_at: Utc::now(),
            last_used: Some(Utc::now()),
            expires_at: Some(Utc::now() + Duration::days(30)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct NewKey {
    pub key: String,
    pub object: Key,
}

impl Key {
    pub async fn new(
        db: &Database,
        key_type: String,
        key_resource: String,
        permissions: String,
        created_by: String,
        created_at: DateTime<Utc>,
        last_used: Option<DateTime<Utc>>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<NewKey, sqlx::Error> {
        let id_type = match key_type.as_str() {
            "user" => IdType::KEY_USER,
            "team" => IdType::KEY_TEAM,
            "site" => IdType::KEY_SITE,
            _ => panic!("Invalid key type"),
        };

        let key_raw = generate_id(id_type);
        let key_id = hash_session(&key_raw);

        // trim the last 8 chars of the string
        let vanity = key_raw.split("_").last().unwrap();
        let vanity_pre = vanity[0..4].to_string();
        let vanity_post = vanity[vanity.len() - 4..].to_string();
        let vanity = format!("{}***{}", vanity_pre, vanity_post);

        let object = sqlx::query_as!(
            Key,
            "INSERT INTO keys (key_id, vanity, key_type, key_resource, permissions, created_by, created_at, last_used, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            key_id,
            vanity,
            key_type,
            key_resource,
            permissions,
            created_by,
            created_at,
            last_used,
            expires_at,
        )
        .fetch_one(&db.pool)
        .await?;

        Ok(NewKey {
            key: key_raw,
            object,
        })
    }

    pub async fn get_for_resource(
        database: &Database,
        key_type: &str,
        key_resource: &str,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let key = sqlx::query_as!(
            Self,
            "SELECT * FROM keys WHERE key_type = $1 AND key_resource = $2",
            key_type,
            key_resource,
        )
        .fetch_all(&database.pool)
        .await?;

        Ok(key)
    }

    pub async fn delete(
        database: &Database,
        key_id: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!("DELETE FROM keys WHERE key_id = $1", key_id)
            .execute(&database.pool)
            .await?;
        Ok(())
    }

    pub async fn get_by_id(
        database: &Database,
        key_id: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let key = sqlx::query_as!(Self, "SELECT * FROM keys WHERE key_id = $1", key_id)
            .fetch_optional(&database.pool)
            .await?;

        Ok(key)
    }
}
