use poem::{web::Data, FromRequest, Request, RequestBody, Result};
use poem_openapi::{
    registry::{MetaSecurityScheme, Registry},
    ApiExtractor, ApiExtractorType, ExtractParamOptions,
};

use crate::{
    models::session::Session, routes::error::HttpError, state::State, utils::hash::hash_session,
};

#[derive(Debug)]
pub enum UserAuth {
    User(Session),
    None,
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
            return Ok(UserAuth::None);
        }

        let token = token.unwrap();

        let is_user = async {
            //     // Hash the token
            let hash = hash_session(&token);

            //     // Check if active session exists with token
            let session = Session::try_access(&state.database, &hash)
                .await
                .unwrap()
                .ok_or(HttpError::Unauthorized)?;

            Ok(UserAuth::User(session)) as Result<UserAuth>
        }.await;

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
            UserAuth::User(session) => Some(session),
            UserAuth::None => None,
        }
    }

    pub fn required(&self) -> Result<&Session> {
        match self {
            UserAuth::User(session) => Ok(session),
            UserAuth::None => Err(HttpError::Unauthorized.into()),
        }
    }

    pub fn user_id(&self) -> Option<&str> {
        match self {
            UserAuth::User(session) => Some(&session.user_id),
            UserAuth::None => None,
        }
    }
}
