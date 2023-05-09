use scylla::IntoTypedRows;
use scylla::Session;
use tracing::warn;

use crate::{error, debug};

pub mod init;

pub async fn get_domain_lookup(session: &Session, base_url: &str) -> Option<(i64, i64)> {
    debug!("Looking up domain {}", base_url);

    let result = session
        .query(
            "SELECT deploy_id, app_id FROM signal.dlt WHERE base_url = ? LIMIT 1",
            (base_url,),
        )
        .await
        .unwrap();

    if let Some(rows) = result.rows {
        let row = rows.into_typed::<(i64, i64)>().next();

        let row = row.unwrap();

        if row.is_err() {
            error!("Detected malformed DLT row for input {}", base_url);

            return None;
        }

        let row = row.unwrap();

        return Some((row.0, row.1));
    }

    warn!("No rows found for domain lookup");

    None
}

pub async fn get_storage_id(session: &Session, app_id: i64, deploy_id: i64) -> Option<String> {
    let result = session
        .query(
            "SELECT sid FROM signal.deployments WHERE app_id=? AND deploy_id=? LIMIT 1",
            (app_id, deploy_id),
        )
        .await
        .unwrap();

    if let Some(rows) = result.rows {
        let row = rows.into_typed::<(String,)>().next();

        let row = row.unwrap();

        if let Err(err) = row {
            error!("Detected malformed deploy row for input {}, {}", deploy_id, err);

            return None;
        }

        let row = row.unwrap();

        return Some(row.0);
    }

    warn!("No rows found for storage ID lookup");

    None
}

// ssh -L 6379:10.43.70.46:6379 -L 8000:10.43.168.69:8000 -L 9042:10.43.20.36:9042 root@master.lvk.sh
