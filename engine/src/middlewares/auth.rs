use std::fmt::Debug;

use poem::{web::Data, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};

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

        let is_user = async {
            // Hash the token
            let hash = hash_session(&token);

            // Check if active session exists with token
            let session = Session::try_access(&state.database, &hash)
                .await
                .unwrap()
                .ok_or(HttpError::Unauthorized)?;

            Ok(UserAuth::User(session, state.clone())) as Result<UserAuth>
        }
        .await;

        // let is_pat = async {
        //     let pat = UserApiKey::find_by_token(&state.database, &token)
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

        is_user
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

    pub async fn required_member_of(&self, team_id: impl AsRef<str>) -> Result<(), HttpError> {
        match self {
            UserAuth::User(session, state) => {
                if !Team::is_member(&state.database, &team_id, &session.user_id)
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

    pub async fn verify_access_to(&self, resource: &impl AccessibleResource) -> Result<(), HttpError> {
        match self {
            UserAuth::User(session, state) => match resource.has_access_to(state, &session.user_id).await.map_err(HttpError::from) {
                Ok(true) => Ok(()),
                Ok(false) => Err(HttpError::Forbidden),
                Err(e) => Err(e),
            },
            UserAuth::None(_) => Err(HttpError::Unauthorized),
        }
    }
}

pub trait AccessibleResource {
    async fn has_access_to(&self, state: &State, user_id: &str) -> Result<bool, HttpError>;
}
