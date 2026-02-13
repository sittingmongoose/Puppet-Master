//! AI platform failover management.
//!
//! Monitors quota and switches to backup platforms when the current
//! one is exhausted.

use crate::platforms::output_parser::ErrorCategory;
use crate::types::Platform;
use log::{info, warn};
use serde::{Deserialize, Serialize};

/// A platform + model pair used in the failover chain.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformModelPair {
    pub platform: Platform,
    pub model: String,
}

impl PlatformModelPair {
    pub fn new(platform: Platform, model: impl Into<String>) -> Self {
        Self {
            platform,
            model: model.into(),
        }
    }
}

/// Manages an ordered list of platform/model pairs for failover.
#[derive(Clone)]
pub struct FailoverManager {
    platforms: Vec<PlatformModelPair>,
    current_index: usize,
}

impl FailoverManager {
    /// Creates a new manager with the primary platform first, followed by backups.
    pub fn new(primary: PlatformModelPair, backups: Vec<PlatformModelPair>) -> Self {
        let mut platforms = vec![primary];
        platforms.extend(backups);
        Self {
            platforms,
            current_index: 0,
        }
    }

    /// Returns the currently active platform/model pair.
    pub fn get_current_platform(&self) -> &PlatformModelPair {
        &self.platforms[self.current_index]
    }

    /// Returns `true` if the given remaining quota suggests a failover is needed.
    ///
    /// A simple heuristic: failover when remaining quota is zero or negative.
    pub fn should_failover(&self, quota_remaining: i64) -> bool {
        quota_remaining <= 0
    }

    /// Switches to the next platform in the failover chain.
    ///
    /// Returns the new platform if one is available, or `None` if all
    /// platforms have been exhausted.
    pub fn failover(&mut self) -> Option<&PlatformModelPair> {
        if self.current_index + 1 < self.platforms.len() {
            let from = &self.platforms[self.current_index];
            self.current_index += 1;
            let to = &self.platforms[self.current_index];
            info!(
                "Failover: {} ({}) -> {} ({})",
                from.platform, from.model, to.platform, to.model
            );
            Some(to)
        } else {
            warn!("All platforms exhausted, no more failover targets");
            None
        }
    }

    /// Returns `true` if all platforms in the chain have been tried.
    pub fn is_exhausted(&self) -> bool {
        self.current_index + 1 >= self.platforms.len()
    }

    /// Returns the current index in the platform chain.
    pub fn current_index(&self) -> usize {
        self.current_index
    }

    /// Returns the total number of platforms (primary + backups).
    pub fn total_platforms(&self) -> usize {
        self.platforms.len()
    }

    /// Resets to the primary platform.
    pub fn reset(&mut self) {
        self.current_index = 0;
    }

    /// Sets the current failover index (for syncing state after async operations).
    pub fn set_index(&mut self, index: usize) {
        if index < self.platforms.len() {
            self.current_index = index;
        }
    }

    /// Returns the previous platform pair before the current one.
    pub fn get_previous_platform(&self) -> Option<&PlatformModelPair> {
        if self.current_index > 0 {
            Some(&self.platforms[self.current_index - 1])
        } else {
            None
        }
    }
}

/// Checks if an error message indicates quota exhaustion or rate limiting.
pub fn is_quota_error(error: &str) -> bool {
    let category = ErrorCategory::detect(error);
    matches!(
        category,
        ErrorCategory::QuotaExceeded | ErrorCategory::RateLimit
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_manager() -> FailoverManager {
        FailoverManager::new(
            PlatformModelPair::new(Platform::Claude, "claude-3.5-sonnet"),
            vec![
                PlatformModelPair::new(Platform::Gemini, "gemini-2.0-flash"),
                PlatformModelPair::new(Platform::Cursor, "cursor-default"),
            ],
        )
    }

    #[test]
    fn test_current_platform() {
        let mgr = make_manager();
        assert_eq!(mgr.get_current_platform().platform, Platform::Claude);
        assert_eq!(mgr.total_platforms(), 3);
    }

    #[test]
    fn test_should_failover() {
        let mgr = make_manager();
        assert!(mgr.should_failover(0));
        assert!(mgr.should_failover(-5));
        assert!(!mgr.should_failover(100));
    }

    #[test]
    fn test_failover_chain() {
        let mut mgr = make_manager();
        assert!(!mgr.is_exhausted());

        let next = mgr.failover().unwrap();
        assert_eq!(next.platform, Platform::Gemini);
        assert!(!mgr.is_exhausted());

        let next = mgr.failover().unwrap();
        assert_eq!(next.platform, Platform::Cursor);
        assert!(mgr.is_exhausted());

        assert!(mgr.failover().is_none());
    }

    #[test]
    fn test_reset() {
        let mut mgr = make_manager();
        mgr.failover();
        mgr.failover();
        assert!(mgr.is_exhausted());
        mgr.reset();
        assert_eq!(mgr.current_index(), 0);
        assert!(!mgr.is_exhausted());
    }

    #[test]
    fn test_single_platform() {
        let mut mgr =
            FailoverManager::new(PlatformModelPair::new(Platform::Claude, "model"), vec![]);
        assert!(mgr.is_exhausted());
        assert!(mgr.failover().is_none());
    }

    #[test]
    fn test_get_previous_platform() {
        let mut mgr = make_manager();
        assert!(mgr.get_previous_platform().is_none());

        mgr.failover();
        assert_eq!(
            mgr.get_previous_platform().unwrap().platform,
            Platform::Claude
        );

        mgr.failover();
        assert_eq!(
            mgr.get_previous_platform().unwrap().platform,
            Platform::Gemini
        );
    }

    #[test]
    fn test_is_quota_error() {
        assert!(is_quota_error("quota exhausted"));
        assert!(is_quota_error("Quota Exceeded"));
        assert!(is_quota_error("rate limit exceeded"));
        assert!(is_quota_error("too many requests"));
        assert!(is_quota_error("insufficient quota"));
        assert!(!is_quota_error("network error"));
        assert!(!is_quota_error("invalid model"));
    }
}
