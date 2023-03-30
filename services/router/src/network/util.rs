use http::Request;

#[derive(Debug)]
pub enum Error {
    NoHost,
}

pub fn extract_host<T>(req: Request<T>) -> Result<(Request<T>, String), Error> {
    let host = req.headers().get("Host");

    match host {
        Some(host) => {
            let host = host.to_str().unwrap().to_string();
            Ok((req, host))
        }
        None => Err(Error::NoHost),
    }
}
