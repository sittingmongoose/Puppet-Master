//! Quota and budget management for platform usage
//!
//! This module tracks usage across platforms and enforces limits:
//! - Per-platform call tracking (run/hour/day)
//! - Per-platform token tracking (run/hour/day)
//! - Soft limits (warning at 80%)
//! - Hard limits (block at 100%)
//! - Cursor auto-mode unlimited support

use crate::types::{Platform, QuotaStatus, UsageStats};
use anyhow::{anyhow, Result};
use chrono::{DateTime, Utc};
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Internal usage tracking for quota enforcement (different from types::UsageStats summary)
#[derive(Debug, Clone)]
struct QuotaUsageStats {
    calls_this_run: u32,
    calls_this_hour: u32,
    calls_this_day: u32,
    tokens_this_run: u64,
    tokens_this_hour: u64,
    tokens_this_day: u64,
    last_call: Option<DateTime<Utc>>,
}

impl QuotaUsageStats {
    fn new() -> Self {
        Self {
            calls_this_run: 0,
            calls_this_hour: 0,
            calls_this_day: 0,
            tokens_this_run: 0,
            tokens_this_hour: 0,
            tokens_this_day: 0,
            last_call: None,
        }
    }
}

/// Quota configuration for a platform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaConfig {
    /// Platform this config applies to
    pub platform: Platform,
    /// Max calls per run (None = unlimited)
    pub max_calls_per_run: Option<u32>,
    /// Max calls per hour (None = unlimited)
    pub max_calls_per_hour: Option<u32>,
    /// Max calls per day (None = unlimited)
    pub max_calls_per_day: Option<u32>,
    /// Max tokens per run (None = unlimited)
    pub max_tokens_per_run: Option<u64>,
    /// Max tokens per hour (None = unlimited)
    pub max_tokens_per_hour: Option<u64>,
    /// Max tokens per day (None = unlimited)
    pub max_tokens_per_day: Option<u64>,
    /// Soft limit percentage (0.0-1.0, default 0.8 = 80%)
    pub soft_limit_threshold: f64,
}

impl QuotaConfig {
    /// Create unlimited quota config
    pub fn unlimited(platform: Platform) -> Self {
        Self {
            platform,
            max_calls_per_run: None,
            max_calls_per_hour: None,
            max_calls_per_day: None,
            max_tokens_per_run: None,
            max_tokens_per_hour: None,
            max_tokens_per_day: None,
            soft_limit_threshold: 0.8,
        }
    }

    /// Create default quota config with reasonable limits
    pub fn default_for_platform(platform: Platform) -> Self {
        match platform {
            Platform::Cursor => {
                // Cursor auto-mode typically has higher limits
                Self {
                    platform,
                    max_calls_per_run: None, // Unlimited for Cursor auto
                    max_calls_per_hour: Some(100),
                    max_calls_per_day: Some(500),
                    max_tokens_per_run: None,
                    max_tokens_per_hour: Some(1_000_000),
                    max_tokens_per_day: Some(5_000_000),
                    soft_limit_threshold: 0.8,
                }
            }
            Platform::Codex => Self {
                platform,
                max_calls_per_run: Some(50),
                max_calls_per_hour: Some(100),
                max_calls_per_day: Some(500),
                max_tokens_per_run: Some(500_000),
                max_tokens_per_hour: Some(1_000_000),
                max_tokens_per_day: Some(5_000_000),
                soft_limit_threshold: 0.8,
            },
            Platform::Claude => Self {
                platform,
                max_calls_per_run: Some(50),
                max_calls_per_hour: Some(100),
                max_calls_per_day: Some(500),
                max_tokens_per_run: Some(500_000),
                max_tokens_per_hour: Some(1_000_000),
                max_tokens_per_day: Some(5_000_000),
                soft_limit_threshold: 0.8,
            },
            Platform::Gemini => Self {
                platform,
                max_calls_per_run: Some(50),
                max_calls_per_hour: Some(60),
                max_calls_per_day: Some(1000),
                max_tokens_per_run: Some(500_000),
                max_tokens_per_hour: Some(1_000_000),
                max_tokens_per_day: Some(10_000_000),
                soft_limit_threshold: 0.8,
            },
            Platform::Copilot => Self {
                platform,
                max_calls_per_run: Some(50),
                max_calls_per_hour: Some(100),
                max_calls_per_day: Some(500),
                max_tokens_per_run: Some(500_000),
                max_tokens_per_hour: Some(1_000_000),
                max_tokens_per_day: Some(5_000_000),
                soft_limit_threshold: 0.8,
            },
        }
    }
}

/// Quota manager for tracking and enforcing limits
pub struct QuotaManager {
    configs: Arc<Mutex<HashMap<Platform, QuotaConfig>>>,
    stats: Arc<Mutex<HashMap<Platform, QuotaUsageStats>>>,
    run_start_time: DateTime<Utc>,
}

impl QuotaManager {
    /// Create a new quota manager
    pub fn new() -> Self {
        let mut configs = HashMap::new();
        let mut stats = HashMap::new();

        // Initialize with default configs
        for platform in Platform::all() {
            configs.insert(*platform, QuotaConfig::default_for_platform(*platform));
            stats.insert(*platform, QuotaUsageStats::new());
        }

        Self {
            configs: Arc::new(Mutex::new(configs)),
            stats: Arc::new(Mutex::new(stats)),
            run_start_time: Utc::now(),
        }
    }

    /// Set quota config for a platform
    pub fn set_config(&self, config: QuotaConfig) {
        let mut configs = self.configs.lock().unwrap();
        configs.insert(config.platform, config);
    }

    /// Get quota config for a platform
    pub fn get_config(&self, platform: Platform) -> QuotaConfig {
        let configs = self.configs.lock().unwrap();
        configs
            .get(&platform)
            .cloned()
            .unwrap_or_else(|| QuotaConfig::default_for_platform(platform))
    }

    /// Check quota status for a platform
    pub fn check_quota(&self, platform: Platform) -> QuotaStatus {
        let config = self.get_config(platform);
        let stats = self.get_internal_stats(platform);

        // Check calls
        if let Some(max_calls_run) = config.max_calls_per_run {
            let usage = stats.calls_this_run as f64 / max_calls_run as f64;
            if usage >= 1.0 {
                return QuotaStatus::Exhausted;
            }
            if usage >= config.soft_limit_threshold {
                return QuotaStatus::Warning;
            }
        }

        if let Some(max_calls_hour) = config.max_calls_per_hour {
            let usage = stats.calls_this_hour as f64 / max_calls_hour as f64;
            if usage >= 1.0 {
                return QuotaStatus::Exhausted;
            }
            if usage >= config.soft_limit_threshold {
                return QuotaStatus::Warning;
            }
        }

        if let Some(max_calls_day) = config.max_calls_per_day {
            let usage = stats.calls_this_day as f64 / max_calls_day as f64;
            if usage >= 1.0 {
                return QuotaStatus::Exhausted;
            }
            if usage >= config.soft_limit_threshold {
                return QuotaStatus::Warning;
            }
        }

        // Check tokens
        if let Some(max_tokens_run) = config.max_tokens_per_run {
            let usage = stats.tokens_this_run as f64 / max_tokens_run as f64;
            if usage >= 1.0 {
                return QuotaStatus::Exhausted;
            }
            if usage >= config.soft_limit_threshold {
                return QuotaStatus::Warning;
            }
        }

        if let Some(max_tokens_hour) = config.max_tokens_per_hour {
            let usage = stats.tokens_this_hour as f64 / max_tokens_hour as f64;
            if usage >= 1.0 {
                return QuotaStatus::Exhausted;
            }
            if usage >= config.soft_limit_threshold {
                return QuotaStatus::Warning;
            }
        }

        if let Some(max_tokens_day) = config.max_tokens_per_day {
            let usage = stats.tokens_this_day as f64 / max_tokens_day as f64;
            if usage >= 1.0 {
                return QuotaStatus::Exhausted;
            }
            if usage >= config.soft_limit_threshold {
                return QuotaStatus::Warning;
            }
        }

        QuotaStatus::Ok
    }

    /// Record usage for a platform
    pub fn record_usage(&self, platform: Platform, tokens: u64, duration_secs: f64) {
        let mut stats = self.stats.lock().unwrap();
        if let Some(platform_stats) = stats.get_mut(&platform) {
            platform_stats.calls_this_run += 1;
            platform_stats.calls_this_hour += 1;
            platform_stats.calls_this_day += 1;
            platform_stats.tokens_this_run += tokens;
            platform_stats.tokens_this_hour += tokens;
            platform_stats.tokens_this_day += tokens;
            platform_stats.last_call = Some(Utc::now());

            info!(
                "Recorded usage for {}: {} tokens, {:.2}s",
                platform, tokens, duration_secs
            );

            // Check quota after recording
            drop(stats); // Release lock before calling check_quota
            let status = self.check_quota(platform);
            match status {
                QuotaStatus::Warning => {
                    warn!("{} quota approaching limit", platform);
                }
                QuotaStatus::Exhausted => {
                    warn!("{} quota exhausted!", platform);
                }
                QuotaStatus::Ok => {}
            }
        }
    }

    /// Get internal usage stats for quota checking
    fn get_internal_stats(&self, platform: Platform) -> QuotaUsageStats {
        let stats = self.stats.lock().unwrap();
        stats
            .get(&platform)
            .cloned()
            .unwrap_or_else(QuotaUsageStats::new)
    }

    /// Get usage stats for a platform (returns types::UsageStats)
    pub fn get_stats(&self, platform: Platform) -> UsageStats {
        let internal = self.get_internal_stats(platform);
        let mut summary = UsageStats::new(platform);
        summary.total_executions = internal.calls_this_run;
        summary.total_tokens = internal.tokens_this_run;
        summary
    }

    /// Get all usage stats
    pub fn get_all_stats(&self) -> HashMap<Platform, UsageStats> {
        let mut result = HashMap::new();
        for platform in Platform::all() {
            result.insert(*platform, self.get_stats(*platform));
        }
        result
    }

    /// Reset usage stats (for testing or manual reset)
    pub fn reset_stats(&self, platform: Platform) {
        let mut stats = self.stats.lock().unwrap();
        stats.insert(platform, QuotaUsageStats::new());
        info!("Reset usage stats for {}", platform);
    }

    /// Reset all usage stats
    pub fn reset_all_stats(&self) {
        let mut stats = self.stats.lock().unwrap();
        for platform in Platform::all() {
            stats.insert(*platform, QuotaUsageStats::new());
        }
        info!("Reset all usage stats");
    }

    /// Enforce quota before execution
    pub fn enforce_quota(&self, platform: Platform) -> Result<()> {
        let status = self.check_quota(platform);
        match status {
            QuotaStatus::Ok => Ok(()),
            QuotaStatus::Warning => {
                warn!("{} quota approaching limit", platform);
                Ok(())
            }
            QuotaStatus::Exhausted => Err(anyhow!("{} quota exhausted", platform)),
        }
    }
}

impl Default for QuotaManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Global quota manager instance
static QUOTA_MANAGER: once_cell::sync::Lazy<QuotaManager> =
    once_cell::sync::Lazy::new(QuotaManager::new);

/// Get the global quota manager
pub fn global_quota_manager() -> &'static QuotaManager {
    &QUOTA_MANAGER
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quota_config_unlimited() {
        let config = QuotaConfig::unlimited(Platform::Cursor);
        assert!(config.max_calls_per_run.is_none());
        assert!(config.max_tokens_per_run.is_none());
    }

    #[test]
    fn test_quota_manager_creation() {
        let manager = QuotaManager::new();
        for platform in Platform::all() {
            let stats = manager.get_stats(*platform);
            assert_eq!(stats.total_executions, 0);
        }
    }

    #[test]
    fn test_record_usage() {
        let manager = QuotaManager::new();
        manager.record_usage(Platform::Cursor, 1000, 1.5);

        let stats = manager.get_stats(Platform::Cursor);
        assert_eq!(stats.total_executions, 1);
        assert_eq!(stats.total_tokens, 1000);
    }

    #[test]
    fn test_quota_enforcement() {
        let manager = QuotaManager::new();

        // Set a low limit
        manager.set_config(QuotaConfig {
            platform: Platform::Cursor,
            max_calls_per_run: Some(2),
            max_calls_per_hour: None,
            max_calls_per_day: None,
            max_tokens_per_run: None,
            max_tokens_per_hour: None,
            max_tokens_per_day: None,
            soft_limit_threshold: 0.8,
        });

        // Should be ok initially
        assert!(manager.enforce_quota(Platform::Cursor).is_ok());

        // Record usage
        manager.record_usage(Platform::Cursor, 1000, 1.0);
        assert_eq!(manager.check_quota(Platform::Cursor), QuotaStatus::Ok);

        // Record more usage (should hit limit)
        manager.record_usage(Platform::Cursor, 1000, 1.0);
        assert_eq!(manager.check_quota(Platform::Cursor), QuotaStatus::Exhausted);

        // Should fail enforcement
        assert!(manager.enforce_quota(Platform::Cursor).is_err());
    }

    #[test]
    fn test_reset_stats() {
        let manager = QuotaManager::new();
        manager.record_usage(Platform::Cursor, 1000, 1.0);

        let stats = manager.get_stats(Platform::Cursor);
        assert_eq!(stats.total_executions, 1);

        manager.reset_stats(Platform::Cursor);

        let stats = manager.get_stats(Platform::Cursor);
        assert_eq!(stats.total_executions, 0);
    }
}
