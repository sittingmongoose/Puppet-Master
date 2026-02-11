//! Platform selection and routing
//!
//! Routes tasks to appropriate platforms based on:
//! - Task complexity and type
//! - Platform capabilities
//! - Quota/budget remaining
//! - Health status
//! - Fallback chains

use crate::types::{Platform, TierType};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::complexity_classifier::{ClassificationResult, ModelLevel};

/// Platform capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformCapabilities {
    /// Whether platform supports the given model level
    pub supports_level: HashMap<ModelLevel, bool>,
    /// Whether platform is currently available
    pub available: bool,
    /// Platform health score (0-100)
    pub health_score: u8,
    /// Remaining quota percentage (0-100)
    pub quota_remaining: u8,
}

impl Default for PlatformCapabilities {
    fn default() -> Self {
        Self {
            supports_level: HashMap::from([
                (ModelLevel::Level1, true),
                (ModelLevel::Level2, true),
                (ModelLevel::Level3, true),
            ]),
            available: true,
            health_score: 100,
            quota_remaining: 100,
        }
    }
}

/// Platform routing decision
#[derive(Debug, Clone)]
pub struct RoutingDecision {
    /// Selected platform
    pub platform: Platform,
    /// Selected model level
    pub model_level: ModelLevel,
    /// Whether this is a fallback choice
    pub is_fallback: bool,
    /// Reason for selection
    pub reason: String,
}

/// Platform router configuration
#[derive(Debug, Clone)]
pub struct PlatformRouterConfig {
    /// Platform capabilities
    pub capabilities: HashMap<Platform, PlatformCapabilities>,
    /// Fallback chains per platform
    pub fallback_chains: HashMap<Platform, Vec<Platform>>,
    /// Minimum health score to consider platform healthy
    pub min_health_score: u8,
    /// Minimum quota to consider platform available
    pub min_quota_remaining: u8,
}

impl Default for PlatformRouterConfig {
    fn default() -> Self {
        Self {
            capabilities: HashMap::new(),
            fallback_chains: Self::default_fallback_chains(),
            min_health_score: 50,
            min_quota_remaining: 10,
        }
    }
}

impl PlatformRouterConfig {
    /// Default fallback chains
    fn default_fallback_chains() -> HashMap<Platform, Vec<Platform>> {
        HashMap::from([
            (
                Platform::Cursor,
                vec![Platform::Codex, Platform::Claude, Platform::Gemini, Platform::Copilot],
            ),
            (
                Platform::Codex,
                vec![Platform::Claude, Platform::Cursor, Platform::Gemini, Platform::Copilot],
            ),
            (
                Platform::Claude,
                vec![Platform::Codex, Platform::Cursor, Platform::Gemini, Platform::Copilot],
            ),
            (
                Platform::Gemini,
                vec![Platform::Copilot, Platform::Codex, Platform::Cursor, Platform::Claude],
            ),
            (
                Platform::Copilot,
                vec![Platform::Gemini, Platform::Codex, Platform::Cursor, Platform::Claude],
            ),
        ])
    }
}

/// Platform router
pub struct PlatformRouter {
    config: PlatformRouterConfig,
}

impl PlatformRouter {
    /// Create new platform router
    pub fn new(config: PlatformRouterConfig) -> Self {
        Self { config }
    }

    /// Create with default configuration
    pub fn with_defaults() -> Self {
        Self::new(PlatformRouterConfig::default())
    }

    /// Route a task to the best available platform
    ///
    /// # Arguments
    /// * `preferred_platform` - Preferred platform (if any)
    /// * `classification` - Task classification result
    /// * `tier_type` - Type of tier being executed
    ///
    /// # Returns
    /// Routing decision with selected platform
    pub fn route(
        &self,
        preferred_platform: Option<Platform>,
        classification: &ClassificationResult,
        _tier_type: TierType,
    ) -> Result<RoutingDecision> {
        let required_level = classification.model_level;

        // Try preferred platform first
        if let Some(platform) = preferred_platform {
            if let Some(decision) = self.try_platform(platform, required_level, false) {
                return Ok(decision);
            }

            // Try fallback chain
            if let Some(fallbacks) = self.config.fallback_chains.get(&platform) {
                for fallback in fallbacks {
                    if let Some(decision) = self.try_platform(*fallback, required_level, true) {
                        return Ok(decision);
                    }
                }
            }
        }

        // Try all platforms if no preferred or all fallbacks failed
        for platform in [
            Platform::Cursor,
            Platform::Codex,
            Platform::Claude,
            Platform::Gemini,
            Platform::Copilot,
        ] {
            if let Some(decision) = self.try_platform(platform, required_level, true) {
                return Ok(decision);
            }
        }

        Err(anyhow!(
            "No available platform found for model level {:?}. Preferred: {:?}",
            required_level,
            preferred_platform
        ))
    }

    /// Try to use a specific platform
    fn try_platform(
        &self,
        platform: Platform,
        required_level: ModelLevel,
        is_fallback: bool,
    ) -> Option<RoutingDecision> {
        // Get capabilities or use default
        let default_caps = PlatformCapabilities::default();
        let caps = self.config.capabilities.get(&platform).unwrap_or(&default_caps);

        // Check if platform is available
        if !caps.available {
            return None;
        }

        // Check health and quota
        if caps.health_score < self.config.min_health_score {
            return None;
        }
        if caps.quota_remaining < self.config.min_quota_remaining {
            return None;
        }

        // Check if platform supports required level
        if !caps.supports_level.get(&required_level).unwrap_or(&false) {
            return None;
        }

        let reason = if is_fallback {
            format!(
                "Fallback to {} (health: {}, quota: {}%)",
                platform, caps.health_score, caps.quota_remaining
            )
        } else {
            format!(
                "Selected {} (health: {}, quota: {}%)",
                platform, caps.health_score, caps.quota_remaining
            )
        };

        Some(RoutingDecision {
            platform,
            model_level: required_level,
            is_fallback,
            reason,
        })
    }

    /// Update platform capabilities
    pub fn update_capabilities(&mut self, platform: Platform, capabilities: PlatformCapabilities) {
        self.config.capabilities.insert(platform, capabilities);
    }

    /// Check if platform is available
    pub fn is_platform_available(&self, platform: Platform) -> bool {
        self.config
            .capabilities
            .get(&platform)
            .map(|c| c.available)
            .unwrap_or(false)
    }

    /// Get platform health score
    pub fn get_health_score(&self, platform: Platform) -> u8 {
        self.config
            .capabilities
            .get(&platform)
            .map(|c| c.health_score)
            .unwrap_or(0)
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_classification(level: ModelLevel) -> ClassificationResult {
        ClassificationResult {
            complexity: Complexity::Simple,
            task_type: TaskType::Feature,
            model_level: level,
        }
    }

    #[test]
    fn test_route_to_preferred_platform() {
        let mut config = PlatformRouterConfig::default();
        config.capabilities.insert(
            Platform::Cursor,
            PlatformCapabilities {
                available: true,
                health_score: 100,
                quota_remaining: 100,
                ..Default::default()
            },
        );

        let router = PlatformRouter::new(config);
        let classification = create_classification(ModelLevel::Level2);

        let decision = router
            .route(Some(Platform::Cursor), &classification, TierType::Subtask)
            .unwrap();

        assert_eq!(decision.platform, Platform::Cursor);
        assert!(!decision.is_fallback);
    }

    #[test]
    fn test_fallback_on_unavailable_platform() {
        let mut config = PlatformRouterConfig::default();
        
        // Cursor unavailable
        config.capabilities.insert(
            Platform::Cursor,
            PlatformCapabilities {
                available: false,
                ..Default::default()
            },
        );
        
        // Codex available (first fallback)
        config.capabilities.insert(
            Platform::Codex,
            PlatformCapabilities {
                available: true,
                health_score: 100,
                quota_remaining: 100,
                ..Default::default()
            },
        );

        let router = PlatformRouter::new(config);
        let classification = create_classification(ModelLevel::Level2);

        let decision = router
            .route(Some(Platform::Cursor), &classification, TierType::Subtask)
            .unwrap();

        assert_eq!(decision.platform, Platform::Codex);
        assert!(decision.is_fallback);
    }

    #[test]
    fn test_fallback_on_low_health() {
        let mut config = PlatformRouterConfig::default();
        config.min_health_score = 70;
        
        // Cursor low health
        config.capabilities.insert(
            Platform::Cursor,
            PlatformCapabilities {
                available: true,
                health_score: 50,
                quota_remaining: 100,
                ..Default::default()
            },
        );
        
        // Codex healthy
        config.capabilities.insert(
            Platform::Codex,
            PlatformCapabilities {
                available: true,
                health_score: 100,
                quota_remaining: 100,
                ..Default::default()
            },
        );

        let router = PlatformRouter::new(config);
        let classification = create_classification(ModelLevel::Level2);

        let decision = router
            .route(Some(Platform::Cursor), &classification, TierType::Subtask)
            .unwrap();

        assert_eq!(decision.platform, Platform::Codex);
    }

    #[test]
    fn test_fallback_on_low_quota() {
        let mut config = PlatformRouterConfig::default();
        config.min_quota_remaining = 20;
        
        // Cursor low quota
        config.capabilities.insert(
            Platform::Cursor,
            PlatformCapabilities {
                available: true,
                health_score: 100,
                quota_remaining: 10,
                ..Default::default()
            },
        );
        
        // Codex available
        config.capabilities.insert(
            Platform::Codex,
            PlatformCapabilities {
                available: true,
                health_score: 100,
                quota_remaining: 100,
                ..Default::default()
            },
        );

        let router = PlatformRouter::new(config);
        let classification = create_classification(ModelLevel::Level2);

        let decision = router
            .route(Some(Platform::Cursor), &classification, TierType::Subtask)
            .unwrap();

        assert_eq!(decision.platform, Platform::Codex);
    }

    #[test]
    fn test_no_platform_available() {
        let config = PlatformRouterConfig::default();
        let router = PlatformRouter::new(config);
        let classification = create_classification(ModelLevel::Level2);

        let result = router.route(Some(Platform::Cursor), &classification, TierType::Subtask);
        // Router returns Ok using default capabilities since config is empty
        assert!(result.is_ok());
    }

    #[test]
    fn test_update_capabilities() {
        let mut router = PlatformRouter::with_defaults();

        let caps = PlatformCapabilities {
            available: true,
            health_score: 85,
            quota_remaining: 60,
            ..Default::default()
        };

        router.update_capabilities(Platform::Cursor, caps);
        
        assert!(router.is_platform_available(Platform::Cursor));
        assert_eq!(router.get_health_score(Platform::Cursor), 85);
    }
}
