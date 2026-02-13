//! Usage tracking subsystem for platform operations
//!
//! This module tracks usage statistics across all platforms:
//! - Request counts and success rates
//! - Token consumption (input/output)
//! - Error rates and types
//! - Rate limit hits
//! - Quota remaining estimation
//!
//! Usage events are persisted to `.puppet-master/usage/usage.jsonl` for analysis.
//!
//! # Plan Detection
//!
//! Parses platform-specific error messages to detect subscription plans:
//! - Codex: "You've reached your 5-hour message limit. Try again in 3h 42m."
//! - Gemini: "Your quota will reset after 8h44m7s."

use crate::types::Platform;
use anyhow::{Context, Result};
use chrono::{DateTime, Duration, Utc};
use log::{debug, info, warn};
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Mutex;

/// Usage event record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageEvent {
    /// Unique event ID
    pub id: String,
    /// Timestamp
    pub timestamp: DateTime<Utc>,
    /// Platform
    pub platform: Platform,
    /// Model used
    pub model: Option<String>,
    /// Input tokens consumed
    pub input_tokens: u64,
    /// Output tokens consumed
    pub output_tokens: u64,
    /// Total tokens
    pub total_tokens: u64,
    /// Duration in milliseconds
    pub duration_ms: u64,
    /// Whether the request succeeded
    pub success: bool,
    /// Error message (if failed)
    pub error_message: Option<String>,
    /// Rate limited
    pub rate_limited: bool,
    /// Session ID
    pub session_id: Option<String>,
}

impl UsageEvent {
    /// Create a new usage event
    pub fn new(platform: Platform) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            platform,
            model: None,
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0,
            duration_ms: 0,
            success: false,
            error_message: None,
            rate_limited: false,
            session_id: None,
        }
    }

    /// Set model
    pub fn with_model(mut self, model: impl Into<String>) -> Self {
        self.model = Some(model.into());
        self
    }

    /// Set tokens
    pub fn with_tokens(mut self, input: u64, output: u64) -> Self {
        self.input_tokens = input;
        self.output_tokens = output;
        self.total_tokens = input + output;
        self
    }

    /// Set duration
    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = duration_ms;
        self
    }

    /// Set success
    pub fn with_success(mut self, success: bool) -> Self {
        self.success = success;
        self
    }

    /// Set error
    pub fn with_error(mut self, error: impl Into<String>) -> Self {
        self.error_message = Some(error.into());
        self.success = false;
        self
    }

    /// Set rate limited
    pub fn with_rate_limited(mut self, rate_limited: bool) -> Self {
        self.rate_limited = rate_limited;
        self
    }

    /// Set session ID
    pub fn with_session_id(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }
}

/// Usage summary for a platform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageSummary {
    pub platform: Platform,
    pub total_requests: usize,
    pub successful_requests: usize,
    pub failed_requests: usize,
    pub rate_limited_requests: usize,
    pub total_tokens: u64,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub avg_duration_ms: f64,
    pub success_rate: f64,
}

/// Quota information parsed from errors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaInfo {
    pub platform: Platform,
    pub limit_hours: Option<u32>,
    pub reset_hours: Option<u32>,
    pub reset_minutes: Option<u32>,
    pub reset_seconds: Option<u32>,
    pub resets_at: DateTime<Utc>,
    pub exhausted: bool,
}

/// Detected plan/tier information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanInfo {
    pub platform: Platform,
    pub tier: String,
    pub detected_from: PlanDetectionSource,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum PlanDetectionSource {
    QuotaLimits,
    ErrorMessage,
    Api,
    ManualConfig,
}

/// Usage tracker
pub struct UsageTracker {
    /// Path to usage log file
    log_path: PathBuf,
    /// File handle (mutex protected)
    file_handle: Arc<Mutex<Option<File>>>,
}

impl UsageTracker {
    /// Create a new usage tracker
    pub fn new(base_dir: impl AsRef<Path>) -> Result<Self> {
        let usage_dir = base_dir.as_ref().join(".puppet-master").join("usage");
        fs::create_dir_all(&usage_dir).context("Failed to create usage directory")?;

        let log_path = usage_dir.join("usage.jsonl");

        Ok(Self {
            log_path,
            file_handle: Arc::new(Mutex::new(None)),
        })
    }

    /// Get default usage tracker (in home directory)
    pub fn default_location() -> Result<Self> {
        let home = directories::BaseDirs::new()
            .context("Failed to get home directory")?
            .home_dir()
            .to_path_buf();
        Self::new(home)
    }

    /// Open the log file
    async fn open_file(&self) -> Result<()> {
        let mut handle = self.file_handle.lock().await;
        if handle.is_none() {
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&self.log_path)
                .context("Failed to open usage log file")?;
            *handle = Some(file);
            debug!("Opened usage log: {:?}", self.log_path);
        }
        Ok(())
    }

    /// Track a usage event
    pub async fn track(&self, event: UsageEvent) -> Result<()> {
        self.open_file().await?;

        let json = serde_json::to_string(&event).context("Failed to serialize usage event")?;

        let mut handle = self.file_handle.lock().await;
        if let Some(file) = handle.as_mut() {
            writeln!(file, "{}", json).context("Failed to write to usage log")?;
            file.flush().context("Failed to flush usage log")?;

            debug!(
                "Tracked usage: {} - {} tokens - {}ms - {}",
                event.platform,
                event.total_tokens,
                event.duration_ms,
                if event.success { "SUCCESS" } else { "FAILED" }
            );
        }

        Ok(())
    }

    /// Get usage summary for a platform
    pub async fn get_usage_summary(
        &self,
        platform: Platform,
        time_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    ) -> Result<UsageSummary> {
        let events = self.get_events(Some(platform), time_range).await?;

        let total_requests = events.len();
        let successful_requests = events.iter().filter(|e| e.success).count();
        let failed_requests = total_requests - successful_requests;
        let rate_limited_requests = events.iter().filter(|e| e.rate_limited).count();

        let total_tokens: u64 = events.iter().map(|e| e.total_tokens).sum();
        let input_tokens: u64 = events.iter().map(|e| e.input_tokens).sum();
        let output_tokens: u64 = events.iter().map(|e| e.output_tokens).sum();

        let total_duration: u64 = events.iter().map(|e| e.duration_ms).sum();
        let avg_duration_ms = if total_requests > 0 {
            total_duration as f64 / total_requests as f64
        } else {
            0.0
        };

        let success_rate = if total_requests > 0 {
            successful_requests as f64 / total_requests as f64
        } else {
            0.0
        };

        Ok(UsageSummary {
            platform,
            total_requests,
            successful_requests,
            failed_requests,
            rate_limited_requests,
            total_tokens,
            input_tokens,
            output_tokens,
            avg_duration_ms,
            success_rate,
        })
    }

    /// Get total tokens for a platform
    pub async fn get_total_tokens(&self, platform: Platform) -> Result<u64> {
        let events = self.get_events(Some(platform), None).await?;
        Ok(events.iter().map(|e| e.total_tokens).sum())
    }

    /// Get events
    async fn get_events(
        &self,
        platform: Option<Platform>,
        time_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    ) -> Result<Vec<UsageEvent>> {
        if !self.log_path.exists() {
            return Ok(Vec::new());
        }

        let file = File::open(&self.log_path).context("Failed to open usage log for reading")?;
        let reader = BufReader::new(file);

        let mut events = Vec::new();

        for line in reader.lines() {
            let line = line.context("Failed to read usage log line")?;
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<UsageEvent>(&line) {
                Ok(event) => {
                    // Filter by platform
                    if let Some(p) = platform {
                        if event.platform != p {
                            continue;
                        }
                    }

                    // Filter by time range
                    if let Some((start, end)) = time_range {
                        if event.timestamp < start || event.timestamp > end {
                            continue;
                        }
                    }

                    events.push(event);
                }
                Err(e) => {
                    warn!("Failed to parse usage log entry: {}", e);
                }
            }
        }

        Ok(events)
    }

    /// Parse Codex error for quota info
    pub fn parse_codex_error(&self, error: &str) -> Option<QuotaInfo> {
        let limit_pattern = Regex::new(r"reached your (\d+)-hour message limit").ok()?;
        let reset_pattern = Regex::new(r"Try again in (\d+)h(?: (\d+)m)?").ok()?;

        let limit_match = limit_pattern.captures(error)?;
        let reset_match = reset_pattern.captures(error)?;

        let limit_hours = limit_match.get(1)?.as_str().parse::<u32>().ok()?;
        let reset_hours = reset_match.get(1)?.as_str().parse::<u32>().ok()?;
        let reset_minutes = reset_match
            .get(2)
            .and_then(|m| m.as_str().parse::<u32>().ok())
            .unwrap_or(0);

        let reset_duration =
            Duration::hours(reset_hours as i64) + Duration::minutes(reset_minutes as i64);
        let resets_at = Utc::now() + reset_duration;

        Some(QuotaInfo {
            platform: Platform::Codex,
            limit_hours: Some(limit_hours),
            reset_hours: Some(reset_hours),
            reset_minutes: Some(reset_minutes),
            reset_seconds: None,
            resets_at,
            exhausted: true,
        })
    }

    /// Parse Gemini error for quota info
    pub fn parse_gemini_error(&self, error: &str) -> Option<QuotaInfo> {
        let reset_pattern = Regex::new(r"quota will reset after (\d+)h(\d+)m(\d+)s").ok()?;
        let exhausted_pattern = Regex::new(r"exhausted your capacity").ok()?;

        let reset_match = reset_pattern.captures(error)?;
        exhausted_pattern.is_match(error).then_some(())?;

        let reset_hours = reset_match.get(1)?.as_str().parse::<u32>().ok()?;
        let reset_minutes = reset_match.get(2)?.as_str().parse::<u32>().ok()?;
        let reset_seconds = reset_match.get(3)?.as_str().parse::<u32>().ok()?;

        let reset_duration = Duration::hours(reset_hours as i64)
            + Duration::minutes(reset_minutes as i64)
            + Duration::seconds(reset_seconds as i64);
        let resets_at = Utc::now() + reset_duration;

        Some(QuotaInfo {
            platform: Platform::Gemini,
            limit_hours: None,
            reset_hours: Some(reset_hours),
            reset_minutes: Some(reset_minutes),
            reset_seconds: Some(reset_seconds),
            resets_at,
            exhausted: true,
        })
    }

    /// Detect plan from quota info
    pub fn detect_plan_from_quota(&self, quota: &QuotaInfo) -> Option<PlanInfo> {
        match quota.platform {
            Platform::Codex => {
                let tier = match quota.limit_hours {
                    Some(5) => "Free",
                    Some(10..=20) => "Plus",
                    Some(21..) => "Team/Enterprise",
                    _ => return None,
                };

                Some(PlanInfo {
                    platform: Platform::Codex,
                    tier: tier.to_string(),
                    detected_from: PlanDetectionSource::QuotaLimits,
                })
            }
            Platform::Gemini => {
                // Gemini plan detection would require API quota info
                // Error messages don't contain enough info
                None
            }
            _ => None,
        }
    }

    /// Check quota remaining
    pub async fn check_quota_remaining(&self, platform: Platform) -> Result<Option<u64>> {
        // Look at recent errors for quota information
        let events = self.get_events(Some(platform), None).await?;

        // Find most recent error with quota info
        for event in events.iter().rev() {
            if let Some(ref error) = event.error_message {
                if let Some(quota) = match platform {
                    Platform::Codex => self.parse_codex_error(error),
                    Platform::Gemini => self.parse_gemini_error(error),
                    _ => None,
                } {
                    if quota.exhausted {
                        // Check if quota has reset
                        if Utc::now() >= quota.resets_at {
                            // Quota has reset, we don't know remaining
                            return Ok(None);
                        } else {
                            // Still exhausted
                            return Ok(Some(0));
                        }
                    }
                }
            }
        }

        // No quota info found
        Ok(None)
    }

    /// Clear old usage logs
    pub async fn clear_old_logs(&self, older_than: Duration) -> Result<usize> {
        let cutoff = Utc::now() - older_than;

        if !self.log_path.exists() {
            return Ok(0);
        }

        let file = File::open(&self.log_path).context("Failed to open usage log for reading")?;
        let reader = BufReader::new(file);

        let mut kept_events = Vec::new();
        let mut removed_count = 0;

        for line in reader.lines() {
            let line = line.context("Failed to read usage log line")?;
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<UsageEvent>(&line) {
                Ok(event) => {
                    if event.timestamp >= cutoff {
                        kept_events.push(line);
                    } else {
                        removed_count += 1;
                    }
                }
                Err(_) => {
                    // Keep malformed lines
                    kept_events.push(line);
                }
            }
        }

        // Rewrite log file
        let temp_path = self.log_path.with_extension("jsonl.tmp");
        let mut temp_file =
            File::create(&temp_path).context("Failed to create temporary usage log")?;

        for line in kept_events {
            writeln!(temp_file, "{}", line).context("Failed to write to temporary usage log")?;
        }

        temp_file
            .flush()
            .context("Failed to flush temporary usage log")?;
        drop(temp_file);

        fs::rename(&temp_path, &self.log_path).context("Failed to replace usage log")?;

        // Close file handle
        let mut handle = self.file_handle.lock().await;
        *handle = None;

        info!("Cleared {} old usage log entries", removed_count);
        Ok(removed_count)
    }

    /// Get usage stats for all platforms
    pub async fn get_all_summaries(
        &self,
        time_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    ) -> Result<HashMap<Platform, UsageSummary>> {
        let mut summaries = HashMap::new();

        for platform in Platform::all() {
            let summary = self.get_usage_summary(*platform, time_range).await?;
            summaries.insert(*platform, summary);
        }

        Ok(summaries)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_usage_tracker_creation() {
        let temp_dir = TempDir::new().unwrap();
        let tracker = UsageTracker::new(temp_dir.path()).unwrap();

        let event = UsageEvent::new(Platform::Cursor)
            .with_model("claude-sonnet-4-5")
            .with_tokens(100, 200)
            .with_duration(1500)
            .with_success(true);

        tracker.track(event).await.unwrap();

        assert!(
            temp_dir
                .path()
                .join(".puppet-master/usage/usage.jsonl")
                .exists()
        );
    }

    #[tokio::test]
    async fn test_usage_summary() {
        let temp_dir = TempDir::new().unwrap();
        let tracker = UsageTracker::new(temp_dir.path()).unwrap();

        // Track several events
        for i in 0..5 {
            let event = UsageEvent::new(Platform::Cursor)
                .with_tokens(100, 200)
                .with_duration(1000)
                .with_success(i < 4); // 4 success, 1 failure

            tracker.track(event).await.unwrap();
        }

        let summary = tracker
            .get_usage_summary(Platform::Cursor, None)
            .await
            .unwrap();

        assert_eq!(summary.total_requests, 5);
        assert_eq!(summary.successful_requests, 4);
        assert_eq!(summary.failed_requests, 1);
        assert_eq!(summary.total_tokens, 300 * 5);
        assert_eq!(summary.success_rate, 0.8);
    }

    #[tokio::test]
    async fn test_get_total_tokens() {
        let temp_dir = TempDir::new().unwrap();
        let tracker = UsageTracker::new(temp_dir.path()).unwrap();

        tracker
            .track(
                UsageEvent::new(Platform::Cursor)
                    .with_tokens(100, 200)
                    .with_success(true),
            )
            .await
            .unwrap();

        tracker
            .track(
                UsageEvent::new(Platform::Cursor)
                    .with_tokens(150, 250)
                    .with_success(true),
            )
            .await
            .unwrap();

        let total = tracker.get_total_tokens(Platform::Cursor).await.unwrap();
        assert_eq!(total, 700); // (100+200) + (150+250)
    }

    #[test]
    fn test_parse_codex_error() {
        let tracker = UsageTracker::new(std::env::temp_dir()).unwrap();
        let error = "You've reached your 5-hour message limit. Try again in 3h 42m.";

        let quota = tracker.parse_codex_error(error).unwrap();

        assert_eq!(quota.platform, Platform::Codex);
        assert_eq!(quota.limit_hours, Some(5));
        assert_eq!(quota.reset_hours, Some(3));
        assert_eq!(quota.reset_minutes, Some(42));
        assert!(quota.exhausted);
    }

    #[test]
    fn test_parse_gemini_error() {
        let tracker = UsageTracker::new(std::env::temp_dir()).unwrap();
        let error =
            "You have exhausted your capacity on this model. Your quota will reset after 8h44m7s.";

        let quota = tracker.parse_gemini_error(error).unwrap();

        assert_eq!(quota.platform, Platform::Gemini);
        assert_eq!(quota.reset_hours, Some(8));
        assert_eq!(quota.reset_minutes, Some(44));
        assert_eq!(quota.reset_seconds, Some(7));
        assert!(quota.exhausted);
    }

    #[test]
    fn test_detect_plan_from_quota() {
        let tracker = UsageTracker::new(std::env::temp_dir()).unwrap();

        // Test Codex free tier
        let quota = QuotaInfo {
            platform: Platform::Codex,
            limit_hours: Some(5),
            reset_hours: Some(3),
            reset_minutes: Some(42),
            reset_seconds: None,
            resets_at: Utc::now() + Duration::hours(3),
            exhausted: true,
        };

        let plan = tracker.detect_plan_from_quota(&quota).unwrap();
        assert_eq!(plan.tier, "Free");
        assert_eq!(plan.platform, Platform::Codex);
    }

    #[tokio::test]
    async fn test_time_range_filtering() {
        let temp_dir = TempDir::new().unwrap();
        let tracker = UsageTracker::new(temp_dir.path()).unwrap();

        let hour_ago = Utc::now() - Duration::hours(1);

        // Track events with different timestamps (would need to manually set timestamps in real impl)
        tracker
            .track(UsageEvent::new(Platform::Cursor).with_success(true))
            .await
            .unwrap();

        // Capture 'now' after tracking to ensure event timestamp is within range
        let now = Utc::now();

        let summary = tracker
            .get_usage_summary(Platform::Cursor, Some((hour_ago, now)))
            .await
            .unwrap();

        // Should include the recent event
        assert!(summary.total_requests > 0);
    }

    #[tokio::test]
    async fn test_get_all_summaries() {
        let temp_dir = TempDir::new().unwrap();
        let tracker = UsageTracker::new(temp_dir.path()).unwrap();

        // Track events for different platforms
        tracker
            .track(UsageEvent::new(Platform::Cursor).with_success(true))
            .await
            .unwrap();
        tracker
            .track(UsageEvent::new(Platform::Codex).with_success(true))
            .await
            .unwrap();

        let summaries = tracker.get_all_summaries(None).await.unwrap();

        assert_eq!(summaries.len(), 5); // All platforms
        assert!(summaries.get(&Platform::Cursor).unwrap().total_requests > 0);
        assert!(summaries.get(&Platform::Codex).unwrap().total_requests > 0);
    }
}
