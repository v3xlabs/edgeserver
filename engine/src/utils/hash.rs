use sha2::{Digest, Sha256};

pub fn hash_password(password: impl AsRef<str>) -> String {
    let password = password.as_ref();
    let salt = b"edgeserver";
    let mut hasher = Sha256::new();
    hasher.update(password);
    hasher.update(salt);
    let hash = hasher.finalize();
    hex::encode(hash)
}
