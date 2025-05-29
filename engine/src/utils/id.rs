use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Copy, Clone)]
pub struct IdType {
    prefix: &'static str,
    length: usize,
}

impl IdType {
    pub const USER: Self = Self {
        prefix: "u",
        length: 10,
    };
    pub const TEAM: Self = Self {
        prefix: "t",
        length: 10,
    };
    pub const TEAM_INVITE: Self = Self {
        prefix: "ti",
        length: 10,
    };
    pub const SITE: Self = Self {
        prefix: "s",
        length: 10,
    };
    pub const DEPLOYMENT: Self = Self {
        prefix: "d",
        length: 10,
    };
    pub const SESSION: Self = Self {
        prefix: "se",
        length: 64,
    };
    pub const KEY_USER: Self = Self {
        prefix: "k_user",
        length: 64,
    };
    pub const KEY_TEAM: Self = Self {
        prefix: "k_team",
        length: 64,
    };
    pub const KEY_SITE: Self = Self {
        prefix: "k_site",
        length: 64,
    };

    #[must_use]
    pub const fn prefix(&self) -> &'static str {
        self.prefix
    }

    #[must_use]
    pub const fn length(&self) -> usize {
        self.length
    }
}

#[must_use]
pub fn generate_id(id_type: IdType) -> String {
    let hash = (0..id_type.length())
        .map(|_| rand::rng().random_range(0..=9))
        .collect::<Vec<_>>()
        .iter()
        .map(std::string::ToString::to_string)
        .collect::<String>();

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
