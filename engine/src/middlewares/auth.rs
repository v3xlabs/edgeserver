use std::fmt::Debug;

use opentelemetry::{global, trace::Tracer, Context};
use poem::{web::Data, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};
use tracing::{info, info_span, Level};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    models::{session::Session, team::Team},
    routes::error::HttpError,
    state::State,
    utils::hash::hash_session,
};

pub enum UserAuth {
    User(Session, State),
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
        let span = global::tracer("edgeserver").start("auth");
        // let span = info_span!("auth");
        // span.set_parent(Context::current());

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
        if token.is_none() {
            return Ok(UserAuth::None(state.clone()));
        }

        let token = token.unwrap();

        let cache_key = format!("session:{}", token);

        let is_user = state
            .cache
            .raw
            .get_with(cache_key, async {
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
                // Ok(UserAuth::User(session, state.clone())) as Result<UserAuth>
            })
            .await;

        let session: Option<Session> = serde_json::from_value(is_user).ok();

        if let Some(session) = session {
            return Ok(UserAuth::User(session, state.clone()));
        }

        // let is_pat = async {
        //     let pat = UserApiKey::get_by_token(&state.database, &token)
        //         .await
        //         .unwrap();

        //     if pat.is_none() {
        //         return Ok(AuthUser::None(state.clone())) as Result<AuthUser>;
        //     }

        //     Ok(AuthUser::Pat(pat.unwrap(), state.clone())) as Result<AuthUser>
        // };

        // let (user, pat) = futures::join! { is_user, is_pat };

        // if let Ok(zuser) = user {
        //     if zuser.user_id().is_some() {
        //         return Ok(zuser);
        //     }
        // }

        // if let Ok(zpat) = pat {
        //     if zpat.user_id().is_some() {
        //         return Ok(zpat);
        //     }
        // }

        Err(HttpError::Unauthorized.into())
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
    pub fn ok(&self) -> Option<&Session> {
        match self {
            UserAuth::User(session, _) => Some(session),
            UserAuth::None(_) => None,
        }
    }

    pub fn required(&self) -> Result<&Session> {
        match self {
            UserAuth::User(session, _) => Ok(session),
            UserAuth::None(_) => Err(HttpError::Unauthorized.into()),
        }
    }

    pub fn user_id(&self) -> Option<&str> {
        match self {
            UserAuth::User(session, _) => Some(&session.user_id),
            UserAuth::None(_) => None,
        }
    }

    #[tracing::instrument(name = "required_member_of")]
    pub async fn required_member_of(
        &self,
        team_id: impl AsRef<str> + Debug,
    ) -> Result<(), HttpError> {
        match self {
            UserAuth::User(session, state) => {
                if !Team::is_member(&state, &team_id, &session.user_id)
                    .await
                    .map_err(HttpError::from)?
                {
                    return Err(HttpError::Forbidden);
                }

                Ok(())
            }
            UserAuth::None(_) => Err(HttpError::Unauthorized),
        }
    }

    #[tracing::instrument(name = "verify_access_to")]
    pub async fn verify_access_to(
        &self,
        resource: &impl AccessibleResource,
    ) -> Result<(), HttpError> {
        match self {
            UserAuth::User(session, state) => match resource
                .has_access_to(state, &session.user_id)
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
}

pub trait AccessibleResource: Debug {
    fn has_access_to(
        &self,
        state: &State,
        user_id: &str,
    ) -> impl std::future::Future<Output = Result<bool, HttpError>> + Send;
}
