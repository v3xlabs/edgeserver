use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, query_scalar};

use crate::{
    database::Database,
    utils::id::{generate_id, IdType},
};

use super::team::Team;

#[derive(Debug, Serialize, Deserialize, Object, Clone)]
pub struct User {
    pub user_id: String,
    pub name: String,
    #[oai(skip)]
    pub password: String,
    pub created_at: DateTime<Utc>,
}

impl User {
    pub async fn new(
        db: &Database,
        name: impl AsRef<str>,
        password: impl AsRef<str>,
    ) -> Result<(Self, Team), sqlx::Error> {
        let user_id = generate_id(IdType::USER);
        let name = name.as_ref();
        let password = password.as_ref();

        let user = query_as!(
            User,
            "INSERT INTO users (user_id, name, password) VALUES ($1, $2, $3) RETURNING *",
            user_id,
            name,
            password
        )
        .fetch_one(&db.pool)
        .await?;

        let team_name = format!("{}'s Team", name);
        let user_team = Team::new(db, team_name, user_id).await?;

        Ok((user, user_team))
    }

    pub async fn get_by_id(db: &Database, user_id: impl AsRef<str>) -> Result<Self, sqlx::Error> {
        query_as!(
            User,
            "SELECT * FROM users WHERE user_id = $1",
            user_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_name_and_password(
        db: &Database,
        name: impl AsRef<str>,
        password: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        query_as!(
            User,
            "SELECT * FROM users WHERE name = $1 AND password = $2",
            name.as_ref(),
            password.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn can_bootstrap(db: &Database) -> Result<bool, sqlx::Error> {
        Ok(query_scalar!("SELECT COUNT(*) FROM users")
            .fetch_one(&db.pool)
            .await?
            .unwrap_or(0)
            == 0)
    }
}
