use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, query_scalar};

use crate::{
    database::Database, utils::id::{generate_id, IdType}
};

use super::team::Team;

#[derive(Debug, Serialize, Deserialize, Object, Clone)]
pub struct User {
    pub user_id: String,
    pub name: String,
    pub avatar_url: Option<String>,
    #[oai(skip)]
    pub password: String,
    pub created_at: DateTime<Utc>,
    pub admin: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Object, Clone)]
pub struct UserMinimal {
    pub user_id: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub admin: Option<bool>,
}

impl User {
    pub async fn new(
        db: &Database,
        name: impl AsRef<str>,
        password: impl AsRef<str>,
        admin: Option<bool>,
        default_team: Option<String>,
    ) -> Result<(Self, Team), sqlx::Error> {
        let user_id = generate_id(IdType::USER);
        let name = name.as_ref();
        let password = password.as_ref();

        // check if no user with this name already exists
        let exists = query_scalar!(
            "SELECT COUNT(*) FROM users WHERE name = $1",
            name
        )
        .fetch_one(&db.pool)
        .await?
        .unwrap_or(0)
        > 0;

        if exists {
            // TODO: nicer `Username taken` error
            return Err(sqlx::Error::RowNotFound);
        }

        let user = query_as!(
            User,
            "INSERT INTO users (user_id, name, password, admin) VALUES ($1, $2, $3, $4) RETURNING *",
            user_id,
            name,
            password,
            admin
        )
        .fetch_one(&db.pool)
        .await?;

        if let Some(default_team) = default_team {
            let team = Team::get_by_id(db, default_team).await?;
            Team::add_member(db, &team.team_id, &user_id).await?;
            Ok((user, team))
        } else {
            let team_name = format!("{}'s Team", name);
            let user_team = Team::new(db, team_name, user_id).await?;
            Ok((user, user_team))
        }
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

    pub async fn get_all_minimal(db: &Database) -> Result<Vec<UserMinimal>, sqlx::Error> {
        query_as!(UserMinimal, "SELECT user_id, name, avatar_url, admin FROM users")
            .fetch_all(&db.pool)
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
