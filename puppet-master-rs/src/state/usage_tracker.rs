//! Usage Tracker
//!
//! JSONL-based usage tracking for platform API calls:
//! - Append-only logging
//! - Thread-safe with file locking
//! - Query and aggregate statistics

use crate::types::UsageRecord;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde_json;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

/// Thread-safe usage tracker
#[derive(Clone)]
pub struct UsageTracker {
    inner: Arc<Mutex<UsageTrackerInner>>,
}

struct UsageTrackerInner {
    path: PathBuf,
}

impl UsageTracker {
    /// Create a new usage tracker
    pub fn new(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();

        // Create parent directory
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory {}", parent.display()))?;
        }

        // Create file if it doesn't exist
        if !path.exists() {
            File::create(&path)
                .with_context(|| format!("Failed to create usage file {}", path.display()))?;
        }

        log::info!("Usage tracker initialized at {}", path.display());

        Ok(Self {
            inner: Arc::new(Mutex::new(UsageTrackerInner { path })),
        })
    }

    /// Record a usage event
    pub fn record(&self, record: UsageRecord) -> Result<()> {
        let inner = self.inner.lock().unwrap();

        // Create parent directory if needed
        if let Some(parent) = inner.path.parent() {
            std::fs::create_dir_all(parent).with_context(|| {
                format!("Failed to create usage directory {}", parent.display())
            })?;
        }

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&inner.path)
            .with_context(|| format!("Failed to open usage file {}", inner.path.display()))?;

        let json = serde_json::to_string(&record).context("Failed to serialize usage record")?;
        writeln!(file, "{}", json)
            .with_context(|| format!("Failed to write to usage file {}", inner.path.display()))?;

        log::trace!(
            "Recorded usage: {:?} {} {:?}ms",
            record.platform,
            record.action,
            record.duration_ms
        );

        Ok(())
    }

    /// Read all usage records
    pub fn read_all(&self) -> Result<Vec<UsageRecord>> {
        let inner = self.inner.lock().unwrap();

        if !inner.path.exists() {
            return Ok(Vec::new());
        }

        let file = File::open(&inner.path)
            .with_context(|| format!("Failed to open usage file {}", inner.path.display()))?;

        let reader = BufReader::new(file);
        let mut records = Vec::new();

        for line in reader.lines() {
            let line = line?;
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<UsageRecord>(&line) {
                Ok(record) => records.push(record),
                Err(e) => {
                    log::warn!("Failed to parse usage record: {}", e);
                }
            }
        }

        Ok(records)
    }

    /// Query records by platform name
    pub fn query_by_platform(&self, platform: &str) -> Result<Vec<UsageRecord>> {
        let records = self.read_all()?;
        Ok(records
            .into_iter()
            .filter(|r| format!("{:?}", r.platform) == platform)
            .collect())
    }

    /// Query records within a time range
    pub fn query_by_time_range(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<UsageRecord>> {
        let records = self.read_all()?;
        Ok(records
            .into_iter()
            .filter(|r| r.timestamp >= start && r.timestamp <= end)
            .collect())
    }

    /// Get aggregate statistics
    pub fn get_stats(&self) -> Result<LocalUsageStats> {
        let records = self.read_all()?;

        let mut stats = LocalUsageStats::default();
        let mut by_platform: std::collections::HashMap<String, PlatformStats> =
            std::collections::HashMap::new();

        for record in records {
            stats.total_requests += 1;
            stats.total_duration_ms += record.duration_ms.unwrap_or(0);
            stats.total_tokens += record.tokens.unwrap_or(0) as usize;

            if record.success {
                stats.successful_requests += 1;
            } else {
                stats.failed_requests += 1;
            }

            let platform_key = format!("{:?}", record.platform);
            let platform_stats = by_platform
                .entry(platform_key)
                .or_insert_with(PlatformStats::default);

            platform_stats.requests += 1;
            platform_stats.duration_ms += record.duration_ms.unwrap_or(0);
            platform_stats.tokens += record.tokens.unwrap_or(0) as usize;

            if record.success {
                platform_stats.successes += 1;
            } else {
                platform_stats.failures += 1;
            }
        }

        stats.by_platform = by_platform;
        Ok(stats)
    }

    /// Get statistics for a specific platform
    pub fn get_platform_stats(&self, platform: &str) -> Result<PlatformStats> {
        let records = self.query_by_platform(platform)?;

        let mut stats = PlatformStats::default();

        for record in records {
            stats.requests += 1;
            stats.duration_ms += record.duration_ms.unwrap_or(0);
            stats.tokens += record.tokens.unwrap_or(0) as usize;

            if record.success {
                stats.successes += 1;
            } else {
                stats.failures += 1;
            }
        }

        Ok(stats)
    }
}

/// Aggregate usage statistics (local to this module, not the type-level UsageStats)
#[derive(Debug, Clone, Default)]
pub struct LocalUsageStats {
    pub total_requests: usize,
    pub successful_requests: usize,
    pub failed_requests: usize,
    pub total_duration_ms: u64,
    pub total_tokens: usize,
    pub by_platform: std::collections::HashMap<String, PlatformStats>,
}

impl LocalUsageStats {
    /// Calculate average duration in milliseconds
    pub fn avg_duration_ms(&self) -> f64 {
        if self.total_requests == 0 {
            0.0
        } else {
            self.total_duration_ms as f64 / self.total_requests as f64
        }
    }

    /// Calculate success rate (0.0 - 1.0)
    pub fn success_rate(&self) -> f64 {
        if self.total_requests == 0 {
            0.0
        } else {
            self.successful_requests as f64 / self.total_requests as f64
        }
    }
}

/// Platform-specific statistics
#[derive(Debug, Clone, Default)]
pub struct PlatformStats {
    pub requests: usize,
    pub successes: usize,
    pub failures: usize,
    pub duration_ms: u64,
    pub tokens: usize,
}

impl PlatformStats {
    /// Calculate average duration
    pub fn avg_duration_ms(&self) -> f64 {
        if self.requests == 0 {
            0.0
        } else {
            self.duration_ms as f64 / self.requests as f64
        }
    }

    /// Calculate success rate
    pub fn success_rate(&self) -> f64 {
        if self.requests == 0 {
            0.0
        } else {
            self.successes as f64 / self.requests as f64
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Platform;
    use tempfile::TempDir;

    #[test]
    fn test_record_and_read() {
        let temp_dir = TempDir::new().unwrap();
        let usage_path = temp_dir.path().join("usage.jsonl");

        let tracker = UsageTracker::new(&usage_path).unwrap();

        let record = UsageRecord::new(Platform::Claude, "execution", true)
            .with_duration_ms(1000)
            .with_tokens(500);

        tracker.record(record).unwrap();

        let records = tracker.read_all().unwrap();
        assert_eq!(records.len(), 1);
        assert_eq!(records[0].platform, Platform::Claude);
    }

    #[test]
    fn test_stats() {
        let temp_dir = TempDir::new().unwrap();
        let usage_path = temp_dir.path().join("usage.jsonl");

        let tracker = UsageTracker::new(&usage_path).unwrap();

        for i in 0..10 {
            let record = UsageRecord::new(Platform::Claude, "execution", i % 2 == 0)
                .with_duration_ms(1000)
                .with_tokens(100);
            tracker.record(record).unwrap();
        }

        let stats = tracker.get_stats().unwrap();
        assert_eq!(stats.total_requests, 10);
        assert_eq!(stats.successful_requests, 5);
        assert_eq!(stats.failed_requests, 5);
        assert_eq!(stats.total_tokens, 1000);
    }
}
