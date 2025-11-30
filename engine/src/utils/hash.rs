use sha2::{Digest, Sha256};
use tracing::info_span;

#[tracing::instrument(name = "hash_password", skip(password))]
pub fn hash_password(password: impl AsRef<str>) -> String {
    let password = password.as_ref();
    let salt = b"edgeserver";
    let mut hasher = Sha256::new();
    hasher.update(password);
    hasher.update(salt);
    let hash = hasher.finalize();
    hex::encode(hash)
}

pub fn hash_session(session: impl AsRef<str>) -> String {
    info_span!("hash_session", "session" = session.as_ref());
    let session = session.as_ref();
    let salt = b"edgeserver";
    let mut hasher = Sha256::new();
    hasher.update(session);
    hasher.update(salt);
    let hash = hasher.finalize();
    hex::encode(hash)
}
