use std::fmt;
use tracing::{Event, span, Subscriber};
use tracing_subscriber::{Layer, prelude::*};
use tracing_subscriber::registry::LookupSpan;

// Visitor to extract sqlx event fields.
pub struct SqlxEventVisitor {
    summary: Option<String>,
    db_statement: Option<String>,
    rows_affected: Option<String>,
    rows_returned: Option<String>,
    elapsed: Option<String>,
    elapsed_secs: Option<String>,
}

impl SqlxEventVisitor {
    fn new() -> Self {
        Self {
            summary: None,
            db_statement: None,
            rows_affected: None,
            rows_returned: None,
            elapsed: None,
            elapsed_secs: None,
        }
    }
}

impl tracing::field::Visit for SqlxEventVisitor {
    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn fmt::Debug) {
        match field.name() {
            "summary" => self.summary = Some(format!("{:?}", value)),
            "db.statement" => self.db_statement = Some(format!("{:?}", value)),
            "rows_affected" => self.rows_affected = Some(format!("{:?}", value)),
            "rows_returned" => self.rows_returned = Some(format!("{:?}", value)),
            "elapsed" => self.elapsed = Some(format!("{:?}", value)),
            "elapsed_secs" => self.elapsed_secs = Some(format!("{:?}", value)),
            _ => {}
        }
    }
}

// Custom layer that converts matching sqlx events into spans.
pub struct SqlxEventToSpanLayer;

impl<S> Layer<S> for SqlxEventToSpanLayer
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    fn on_event(&self, event: &Event<'_>, _ctx: tracing_subscriber::layer::Context<'_, S>) {
        let mut visitor = SqlxEventVisitor::new();
        event.record(&mut visitor);

        // Check for key sqlx fields (adjust condition as needed)
        if visitor.summary.is_some() && visitor.elapsed.is_some() {
            let name = event.metadata().name();
            let elapsed_secs_value_opt = if let Some(ref secs) = visitor.elapsed_secs {
                Some(secs.parse::<f64>().unwrap())
            } else if let Some(ref elapsed) = visitor.elapsed {
                if elapsed.ends_with("µs") {
                    let num_str = &elapsed[..elapsed.len()-3];
                    num_str.parse::<f64>().ok().map(|us| us / 1_000_000.0)
                } else {
                    elapsed.parse::<f64>().ok()
                }
            } else {
                None
            };
            if let Some(elapsed_secs_value) = elapsed_secs_value_opt {
                let duration = std::time::Duration::from_secs_f64(elapsed_secs_value);
                let span_end = std::time::SystemTime::now();
                let span_start = span_end.checked_sub(duration).unwrap_or(span_end);
                let synthetic_span = match *event.metadata().level() {
                    tracing::Level::ERROR => span!(target: "sqlxshim", tracing::Level::ERROR, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into()),
                        span_start = ?span_start,
                        span_end = ?span_end,
                        duration = ?duration
                    ),
                    tracing::Level::WARN => span!(target: "sqlxshim", tracing::Level::WARN, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into()),
                        span_start = ?span_start,
                        span_end = ?span_end,
                        duration = ?duration
                    ),
                    tracing::Level::INFO => span!(target: "sqlxshim", tracing::Level::INFO, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into()),
                        span_start = ?span_start,
                        span_end = ?span_end,
                        duration = ?duration
                    ),
                    tracing::Level::DEBUG => span!(target: "sqlxshim", tracing::Level::DEBUG, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into()),
                        span_start = ?span_start,
                        span_end = ?span_end,
                        duration = ?duration
                    ),
                    tracing::Level::TRACE => span!(target: "sqlxshim", tracing::Level::TRACE, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into()),
                        span_start = ?span_start,
                        span_end = ?span_end,
                        duration = ?duration
                    ),
                };
                let _enter = synthetic_span.enter();
                tracing::trace!(parent: &synthetic_span, "Converted sqlx event to span");
            } else {
                // Fallback if parsing elapsed fails
                let synthetic_span = match *event.metadata().level() {
                    tracing::Level::ERROR => span!(target: "sqlxshim", tracing::Level::ERROR, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into())
                    ),
                    tracing::Level::WARN => span!(target: "sqlxshim", tracing::Level::WARN, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into())
                    ),
                    tracing::Level::INFO => span!(target: "sqlxshim", tracing::Level::INFO, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into())
                    ),
                    tracing::Level::DEBUG => span!(target: "sqlxshim", tracing::Level::DEBUG, "sqlx::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into())
                    ),
                    tracing::Level::TRACE => span!(target: "sqlxshim", tracing::Level::TRACE, "sqlx::?::{}", name,
                        summary = %visitor.summary.unwrap(),
                        db_statement = %visitor.db_statement.unwrap_or_else(|| "N/A".into()),
                        rows_affected = %visitor.rows_affected.unwrap_or_else(|| "N/A".into()),
                        rows_returned = %visitor.rows_returned.unwrap_or_else(|| "N/A".into()),
                        elapsed = %visitor.elapsed.unwrap(),
                        elapsed_secs = %visitor.elapsed_secs.unwrap_or_else(|| "N/A".into())
                    ),
                };
                
                // let _enter = synthetic_span.enter();
                tracing::trace!(parent: &synthetic_span, "Converted sqlx event to span (without timing data)");
            }
        }
    }
}
