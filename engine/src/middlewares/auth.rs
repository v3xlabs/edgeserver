use std::fmt::Debug;

use opentelemetry::Context;
use poem::{web::Data, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};
use tracing::{info, info_span, Instrument};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    models::{keys::Key, session::Session, team::Team},
    routes::error::HttpError,
    state::State,
    utils::hash::hash_session,
};

pub enum UserAuth {
    User(Session, State),
    Key(Key, State),
    None(State),
}

impl Debug for UserAuth {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "UserAuth {:?}", self.user_id())
    }
}

impl<'a> ApiExtractor<'a> for UserAuth {
    const TYPES: &'static [ApiExtractorType] = &[ApiExtractorType::SecurityScheme];
    type ParamType = ();
    type ParamRawType = ();

    async fn from_request(
        req: &'a Request,
        body: &mut RequestBody,
        _param_opts: ExtractParamOptions<Self::ParamType>,
    ) -> Result<Self> {
        // Get current OpenTelemetry context to propagate
        let parent_cx = Context::current();

        // Create auth span with proper parent context
        let auth_span = info_span!("auth");
        auth_span.set_parent(parent_cx);

        // Run the authentication logic within the auth span
        let auth_result = async move {
            let state = <Data<&State> as FromRequest>::from_request(req, body).await?;
            let state = state.0;

            // extract cookies from request
            let _cookies = req.headers().get("Cookie").and_then(|x| x.to_str().ok());

            // Extract token from header
            let token = req
                .headers()
                .get("Authorization")
                .and_then(|x| x.to_str().ok())
                .map(|x| x.replace("Bearer ", ""));

            // Token could either be a session token or a pat token
            let token = match token {
                Some(token) => token,
                None => return Ok(UserAuth::None(state.clone())),
            };

            // check the token
            if token.starts_with("se_") {
                let cache_key = format!("session:{}", token);

                let is_user = state
                    .cache
                    .raw
                    .get_with(cache_key, async {
                        // Use tracing events instead of spans to avoid Send issues
                        info!("Cache miss for session: {}", token);

                        // Hash the token
                        let hash = hash_session(&token);

                        // Check if active session exists with token
                        let session = Session::try_access(&state.database, &hash)
                            .await
                            .unwrap()
                            .ok_or(HttpError::Unauthorized)
                            .unwrap();

                        serde_json::to_value(session).unwrap()
                    })
                    .await;

                let session: Option<Session> = serde_json::from_value(is_user).ok();

                if let Some(session) = session {
                    return Ok(UserAuth::User(session, state.clone()));
                }
            } else if token.starts_with("k_") {
                let cache_key = format!("key:{}", token);

                let is_key = state.cache.raw.get_with(cache_key, async {
                    let hash = hash_session(&token);

                    let key = Key::get_by_id(&state.database, hash.as_ref())
                        .await
                        .unwrap()
                        .ok_or(HttpError::Unauthorized)
                        .unwrap();

                    serde_json::to_value(key).unwrap()
                }).await;

                let key: Option<Key> = serde_json::from_value(is_key).ok();

                if let Some(key) = key {
                    return Ok(UserAuth::Key(key, state.clone()));
                }
            }

            Err(HttpError::Unauthorized.into())
        }
        .instrument(auth_span)
        .await;

        auth_result
    }

    fn register(registry: &mut Registry) {
        registry.create_security_scheme(
            "AuthToken",
            MetaSecurityScheme {
                ty: "http",
                description: Some("Session token for authentication"),
                name: None,
                key_in: None,
                scheme: Some("bearer"),
                bearer_format: Some("Bearer"),
                flows: None,
                openid_connect_url: None,
            },
        );
    }
    fn security_schemes() -> Vec<&'static str> {
        vec!["AuthToken"]
    }
}

impl UserAuth {
    /// @deprecated
    pub fn ok_session(&self) -> Option<&Session> {
        match self {
            UserAuth::User(session, _) => Some(session),
            UserAuth::Key(_, _) => None,
            UserAuth::None(_) => None,
        }
    }

    /// @deprecated
    pub fn required_session(&self) -> Result<&Session> {
        match self {
            UserAuth::User(session, _) => Ok(session),
            UserAuth::Key(_, _) => Err(HttpError::Unauthorized.into()),
            UserAuth::None(_) => Err(HttpError::Unauthorized.into()),
        }
    }

    pub fn user_id(&self) -> Option<&str> {
        match self {
            UserAuth::User(session, _) => Some(&session.user_id),
            UserAuth::Key(_, __) => None,
            UserAuth::None(_) => None,
        }
    }

    pub async fn required_member_of(
        &self,
        team_id: impl AsRef<str> + Debug,
    ) -> Result<(), HttpError> {
        // Get current OpenTelemetry context to propagate
        let parent_cx = Context::current();

        // Create span with proper parent context
        let member_span = info_span!("required_member_of", team_id = ?team_id);
        member_span.set_parent(parent_cx);

        // Each request should have its own context path
        async move {
            match self {
                UserAuth::User(session, state) => {
                    if !Team::is_member(&state, &team_id, &session.user_id)
                        .await
                        .map_err(HttpError::from)?
                    {
                        return Err(HttpError::Forbidden);
                    }

                    Ok(())
                },
                UserAuth::Key(_key, _) => {
                    Err(HttpError::Forbidden)
                },
                UserAuth::None(_) => Err(HttpError::Unauthorized),
            }
        }
        .instrument(member_span)
        .await
    }

    pub async fn verify_access_to(
        &self,
        resource: &impl AccessibleResource,
    ) -> Result<(), HttpError> {
        // Get current OpenTelemetry context to propagate

        // Create span with proper parent context
        let access_span = info_span!("verify_access_to", resource = ?resource);
        access_span.set_parent(Context::current());

        // Each request should have its own context path
        async move {
            match self {
                UserAuth::User(session, state) => match resource
                    .has_access(state, "user", &session.user_id)
                    .await
                    .map_err(HttpError::from)
                {
                    Ok(true) => Ok(()),
                    Ok(false) => Err(HttpError::Forbidden),
                    Err(e) => Err(e),
                },
                UserAuth::Key(key, state) => match resource
                    .has_access(state, &key.key_type, &key.key_resource)
                    .await
                    .map_err(HttpError::from)
                {
                    Ok(true) => Ok(()),
                    Ok(false) => Err(HttpError::Forbidden),
                    Err(e) => Err(e),
                },
                UserAuth::None(_) => Err(HttpError::Unauthorized),
            }
        }
        .instrument(access_span)
        .await
    }
}

pub trait AccessibleResource: Debug {
    fn has_access(
        &self,
        state: &State,
        // 'user' | 'site' | 'team'
        resource: &str,
        resource_id: &str,
    ) -> impl std::future::Future<Output = Result<bool, HttpError>> + Send;
}
