use chrono::{DateTime, Utc};
use opentelemetry::{global::ObjectSafeSpan, trace::{SpanKind, Tracer}, KeyValue};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, query_scalar, Acquire, Connection, ConnectOptions};
use tracing::{info_span, instrument};

use crate::{
    database::Database,
    utils::id::{generate_id, IdType},
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
        let exists = query_scalar!("SELECT COUNT(*) FROM users WHERE name = $1", name)
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

    #[opentelemetry_auto_span::auto_span]
    pub async fn get_by_id(db: &Database, user_id: impl AsRef<str>) -> Result<Self, sqlx::Error> {
        let query = "SELECT * FROM users WHERE user_id = $1";

        let tracer = opentelemetry::global::tracer("sqlx");
        let attributes: Vec<KeyValue> = vec![
            KeyValue::new("db.system", "postgresql"),
            KeyValue::new("db.query.text", query),
            KeyValue::new("db.statement", query),
            KeyValue::new("db.system.name", "postgresql"),
            KeyValue::new("otel.kind", "client"),
            KeyValue::new("db.name", "edgeserver"),
            KeyValue::new("db.collection", "users"),
            KeyValue::new("db.operation", "SELECT"),
            //
            KeyValue::new("peer.service", "postgresql"),
            KeyValue::new("server.address", "localhost:5432"),
            // KeyValue::new("net.peer.name", "localhost"),
            // KeyValue::new("net.peer.port", 5432),
        ];
        let span = tracer.span_builder("SELECT * FROM users ...").with_kind(SpanKind::Client).with_attributes(attributes);
        let span = tracer.build(span);

        let span = info_span!(
            "SELECT * FROM users ...",
            otel.kind = "client",
            db.system = "postgresql",
            db.system.name = "postgresql",
            db.name = "edgeserver",
            db.collection.name = "users",
            db.collection = "users",
            db.operation.name = "SELECT",
            db.operation = "SELECT",
            db.query.text = %query,
            db.statement = %query,
            peer.service = "postgresql",
            server.address = "localhost:5432",
            net.peer.name = "localhost", // Database host
            net.peer.port = 5432, // Database port
            service.name = "postgres",
            otel.service.name = "postgres",
        );        

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
        query_as!(
            UserMinimal,
            "SELECT user_id, name, avatar_url, admin FROM users"
        )
        .fetch_all(&db.pool)
        .await
    }

    #[instrument(skip(db))]
    pub async fn can_bootstrap(db: &Database) -> Result<bool, sqlx::Error> {
        Ok(query_scalar!("SELECT COUNT(*) FROM users LIMIT 1")
            .fetch_one(&db.pool)
            .await?
            .unwrap_or(0)
            == 0)
    }
}
