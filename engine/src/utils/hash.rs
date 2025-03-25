use sha2::{Digest, Sha256};

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

// Instead of creating a new span every time, we'll just hash without instrumentation
// since this is called very frequently and is a simple function
pub fn hash_session(session: impl AsRef<str>) -> String {
    let session = session.as_ref();
    let salt = b"edgeserver";
    let mut hasher = Sha256::new();
    hasher.update(session);
    hasher.update(salt);
    let hash = hasher.finalize();
    hex::encode(hash)
}
