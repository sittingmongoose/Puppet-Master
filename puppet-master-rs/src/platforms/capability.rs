//! Platform capability discovery and caching
//!
//! This module provides capability detection for AI platform CLIs:
//! - Binary existence checks
//! - Version detection
//! - Feature probing
//! - TTL-based caching (1 hour default)

use crate::types::Platform;
use anyhow::Result;
use chrono::{DateTime, Utc};
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use tokio::process::Command;

/// Capability information for a platform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityInfo {
    pub platform: Platform,
    pub command: String,
    pub available: bool,
    pub version: Option<String>,
    pub features: Vec<String>,
    pub discovered_at: DateTime<Utc>,
}

impl CapabilityInfo {
    /// Create a new capability info (unavailable)
    pub fn unavailable(platform: Platform, command: String) -> Self {
        Self {
            platform,
            command,
            available: false,
            version: None,
            features: vec![],
            discovered_at: Utc::now(),
        }
    }

    /// Create a new capability info (available)
    pub fn available(
        platform: Platform,
        command: String,
        version: Option<String>,
        features: Vec<String>,
    ) -> Self {
        Self {
            platform,
            command,
            available: true,
            version,
            features,
            discovered_at: Utc::now(),
        }
    }

    /// Check if this capability info is still valid (based on TTL)
    pub fn is_valid(&self, ttl_secs: u64) -> bool {
        let age = Utc::now()
            .signed_duration_since(self.discovered_at)
            .num_seconds();
        age >= 0 && age < ttl_secs as i64
    }
}

/// Cache for capability information
pub struct CapabilityCache {
    cache: Arc<Mutex<HashMap<Platform, CapabilityInfo>>>,
    ttl_secs: u64,
}

impl CapabilityCache {
    /// Create a new capability cache with 1-hour TTL
    pub fn new() -> Self {
        Self::with_ttl(3600)
    }

    /// Create a new capability cache with custom TTL
    pub fn with_ttl(ttl_secs: u64) -> Self {
        Self {
            cache: Arc::new(Mutex::new(HashMap::new())),
            ttl_secs,
        }
    }

    /// Get capability info from cache or discover it
    pub async fn get(&self, platform: Platform) -> Result<CapabilityInfo> {
        // Check cache first
        {
            let cache = self.cache.lock().unwrap();
            if let Some(info) = cache.get(&platform) {
                if info.is_valid(self.ttl_secs) {
                    debug!("Using cached capability info for {}", platform);
                    return Ok(info.clone());
                }
            }
        }

        // Discover capabilities
        info!("Discovering capabilities for {}", platform);
        let info = self.discover(platform).await?;

        // Cache the result
        {
            let mut cache = self.cache.lock().unwrap();
            cache.insert(platform, info.clone());
        }

        Ok(info)
    }

    /// Force refresh capability info for a platform
    pub async fn refresh(&self, platform: Platform) -> Result<CapabilityInfo> {
        let info = self.discover(platform).await?;

        {
            let mut cache = self.cache.lock().unwrap();
            cache.insert(platform, info.clone());
        }

        Ok(info)
    }

    /// Clear the cache
    pub fn clear(&self) {
        let mut cache = self.cache.lock().unwrap();
        cache.clear();
    }

    /// Discover capabilities for a platform
    async fn discover(&self, platform: Platform) -> Result<CapabilityInfo> {
        let command = platform.default_cli_name();

        // Check if command exists
        if which::which(command).is_err() {
            debug!("Command not found: {}", command);
            return Ok(CapabilityInfo::unavailable(platform, command.to_string()));
        }

        // Try to get version
        let version = self.get_version(command).await;

        // Probe for features
        let features = self.probe_features(platform, command).await;

        Ok(CapabilityInfo::available(
            platform,
            command.to_string(),
            version,
            features,
        ))
    }

    /// Get version string from a command
    async fn get_version(&self, command: &str) -> Option<String> {
        // Try common version flags
        for flag in &["--version", "-v", "version"] {
            if let Ok(output) = Command::new(command)
                .arg(flag)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .output()
                .await
            {
                if output.status.success() {
                    let version = String::from_utf8_lossy(&output.stdout)
                        .lines()
                        .next()
                        .unwrap_or("")
                        .to_string();
                    if !version.is_empty() {
                        return Some(version);
                    }
                }
            }
        }
        None
    }

    /// Build feature list using static platform_specs data.
    /// Only runtime-probed: CLI existence and version (done elsewhere).
    /// Static features from docs: image support, plan mode, effort, experimental, subagents.
    async fn probe_features(&self, platform: Platform, _command: &str) -> Vec<String> {
        use crate::platforms::platform_specs;

        let mut features = Vec::new();

        // All static features from platform_specs (no runtime probing needed)
        if platform_specs::supports_images(platform) {
            features.push("image_support".to_string());
        }
        if platform_specs::supports_plan_mode(platform) {
            features.push("plan_mode".to_string());
        }
        if platform_specs::supports_effort(platform) {
            features.push("reasoning_effort".to_string());
        }
        if platform_specs::supports_experimental(platform) {
            features.push("experimental".to_string());
        }
        if platform_specs::supports_subagents(platform) {
            features.push("subagents".to_string());
        }
        if platform_specs::has_sdk(platform) {
            features.push("sdk".to_string());
        }
        if platform_specs::reasoning_is_model_based(platform) {
            features.push("reasoning_model_based".to_string());
        }
        if platform_specs::has_auto_mode(platform) {
            features.push("auto_mode".to_string());
        }

        features
    }

}

impl Default for CapabilityCache {
    fn default() -> Self {
        Self::new()
    }
}

/// Global capability cache instance
static CAPABILITY_CACHE: once_cell::sync::Lazy<CapabilityCache> =
    once_cell::sync::Lazy::new(CapabilityCache::new);

/// Get the global capability cache
pub fn global_cache() -> &'static CapabilityCache {
    &CAPABILITY_CACHE
}

/// Check if a platform is available (convenience function)
pub async fn is_available(platform: Platform) -> bool {
    match global_cache().get(platform).await {
        Ok(info) => info.available,
        Err(_) => false,
    }
}

/// Get version for a platform (convenience function)
pub async fn get_version(platform: Platform) -> Option<String> {
    match global_cache().get(platform).await {
        Ok(info) => info.version,
        Err(_) => None,
    }
}

/// Get features for a platform (convenience function)
pub async fn get_features(platform: Platform) -> Vec<String> {
    match global_cache().get(platform).await {
        Ok(info) => info.features,
        Err(_) => vec![],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::platforms::platform_specs;

    #[tokio::test]
    async fn test_capability_cache() {
        let cache = CapabilityCache::new();

        // Test discovery for all platforms
        for platform in Platform::all() {
            let result = cache.get(*platform).await;
            assert!(result.is_ok());
        }
    }

    #[test]
    fn test_capability_info_validity() {
        let cursor_cli = platform_specs::cli_binary_names(Platform::Cursor)
            .first()
            .copied()
            .unwrap_or("agent")
            .to_string();
        let info = CapabilityInfo::available(
            Platform::Cursor,
            cursor_cli,
            Some("1.0.0".to_string()),
            vec!["json_output".to_string()],
        );

        // Should be valid immediately
        assert!(info.is_valid(3600));

        // Create an old capability info
        let mut old_info = info.clone();
        old_info.discovered_at = Utc::now() - chrono::Duration::hours(2);

        // Should be invalid after TTL
        assert!(!old_info.is_valid(3600));
    }

    #[tokio::test]
    async fn test_global_cache() {
        // Just ensure it doesn't panic
        let _cache = global_cache();
    }
}
