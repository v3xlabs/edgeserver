use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Copy, Clone)]
pub struct IdType {
    prefix: &'static str,
    length: usize,
}

impl IdType {
    pub const USER: IdType = IdType { prefix: "u", length: 10 };
    pub const TEAM: IdType = IdType { prefix: "t", length: 10 };
    pub const TEAM_INVITE: IdType = IdType { prefix: "ti", length: 10 };
    pub const SITE: IdType = IdType { prefix: "s", length: 10 };
    pub const DEPLOYMENT: IdType = IdType { prefix: "d", length: 10 };
    pub const SESSION: IdType = IdType { prefix: "se", length: 64 };
    pub const KEY_USER: IdType = IdType { prefix: "k_user", length: 64 };
    pub const KEY_TEAM: IdType = IdType { prefix: "k_team", length: 64 };
    pub const KEY_SITE: IdType = IdType { prefix: "k_site", length: 64 };

    pub fn prefix(&self) -> &'static str {
        self.prefix
    }

    pub fn length(&self) -> usize {
        self.length
    }
}

pub fn generate_id(id_type: IdType) -> String {
    let hash = (0..id_type.length()).map(|_| rand::rng().gen_range(0..=9)).collect::<Vec<_>>().iter().map(|c| c.to_string()).collect::<String>();

    format!("{}_{}", id_type.prefix(), hash)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_id() {
        let id = generate_id(IdType::USER);
        assert!(id.starts_with("u_"));
    }
}
