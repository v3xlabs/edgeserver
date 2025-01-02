use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Copy, Clone)]
#[repr(transparent)]
pub struct IdType(&'static str);

impl IdType {
    pub const USER: IdType = IdType("u");
    pub const TEAM: IdType = IdType("t");
    pub const TEAM_INVITE: IdType = IdType("ti");
    pub const SITE: IdType = IdType("s");
    pub const DEPLOYMENT: IdType = IdType("d");
    pub const SESSION: IdType = IdType("se");

    pub fn prefix(&self) -> &'static str {
        self.0
    }
}

pub fn generate_id(id_type: IdType) -> String {
    let hash = uuid::Uuid::new_v4().to_string().replace("-", "").chars().take(10).collect::<String>();

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
