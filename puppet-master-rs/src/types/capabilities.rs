//! Platform capability types for feature detection and quota management.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::platform::Platform;

/// Feature flags representing platform capabilities.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FeatureFlag {
    /// Platform supports JSON output mode
    JsonOutput,
    /// Platform supports streaming JSON responses
    StreamJson,
    /// Platform supports plan/preview mode
    PlanMode,
    /// Platform requires tool approval
    ToolApproval,
    /// Platform supports model selection
    ModelSelection,
    /// Platform supports MCP (Model Context Protocol)
    McpSupport,
    /// Platform supports web search
    WebSearch,
    /// Platform supports reasoning effort control
    ReasoningEffort,
    /// Platform supports context file inclusion
    ContextFiles,
    /// Platform supports custom instructions
    CustomInstructions,
}

impl FeatureFlag {
    /// Returns a human-readable name for this feature.
    pub fn name(&self) -> &'static str {
        match self {
            Self::JsonOutput => "JSON Output",
            Self::StreamJson => "Streaming JSON",
            Self::PlanMode => "Plan Mode",
            Self::ToolApproval => "Tool Approval",
            Self::ModelSelection => "Model Selection",
            Self::McpSupport => "MCP Support",
            Self::WebSearch => "Web Search",
            Self::ReasoningEffort => "Reasoning Effort",
            Self::ContextFiles => "Context Files",
            Self::CustomInstructions => "Custom Instructions",
        }
    }

    /// Returns a description of this feature.
    pub fn description(&self) -> &'static str {
        match self {
            Self::JsonOutput => "Outputs responses in JSON format",
            Self::StreamJson => "Streams JSON responses in real-time",
            Self::PlanMode => "Generates execution plans before running",
            Self::ToolApproval => "Requires explicit approval for tool usage",
            Self::ModelSelection => "Allows selecting specific models",
            Self::McpSupport => "Supports Model Context Protocol",
            Self::WebSearch => "Can perform web searches",
            Self::ReasoningEffort => "Supports adjustable reasoning depth",
            Self::ContextFiles => "Supports including context files",
            Self::CustomInstructions => "Supports custom system instructions",
        }
    }
}

/// Quota information for API usage limits.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuotaInfo {
    /// Total quota limit (tokens, requests, etc.)
    pub limit: u64,

    /// Amount currently used
    pub used: u64,

    /// Amount remaining
    pub remaining: u64,

    /// When the quota resets
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reset_time: Option<DateTime<Utc>>,

    /// Unit of measurement (e.g., "tokens", "requests")
    #[serde(default = "default_quota_unit")]
    pub unit: String,
}

fn default_quota_unit() -> String {
    "tokens".to_string()
}

impl QuotaInfo {
    /// Creates a new quota info.
    pub fn new(limit: u64, used: u64) -> Self {
        let remaining = limit.saturating_sub(used);
        Self {
            limit,
            used,
            remaining,
            reset_time: None,
            unit: default_quota_unit(),
        }
    }

    /// Returns the usage percentage.
    pub fn usage_percent(&self) -> f32 {
        if self.limit == 0 {
            return 0.0;
        }
        (self.used as f32 / self.limit as f32) * 100.0
    }

    /// Checks if the quota is exhausted.
    pub fn is_exhausted(&self) -> bool {
        self.remaining == 0
    }

    /// Checks if usage is above the given threshold percentage.
    pub fn above_threshold(&self, threshold_percent: f32) -> bool {
        self.usage_percent() >= threshold_percent
    }
}

/// Cooldown status for rate limiting.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CooldownInfo {
    /// Whether a cooldown is currently active
    pub active: bool,

    /// Seconds remaining in cooldown
    pub remaining_seconds: u64,

    /// Reason for cooldown
    pub reason: String,

    /// When the cooldown expires
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<DateTime<Utc>>,
}

impl CooldownInfo {
    /// Creates a new inactive cooldown.
    pub fn inactive() -> Self {
        Self {
            active: false,
            remaining_seconds: 0,
            reason: String::new(),
            expires_at: None,
        }
    }

    /// Creates a new active cooldown.
    pub fn active(remaining_seconds: u64, reason: impl Into<String>) -> Self {
        let expires_at = Utc::now() + chrono::Duration::seconds(remaining_seconds as i64);
        Self {
            active: true,
            remaining_seconds,
            reason: reason.into(),
            expires_at: Some(expires_at),
        }
    }
}

/// Authentication status for a platform.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AuthStatus {
    /// Authenticated and ready
    Authenticated,
    /// Not authenticated
    Unauthenticated,
    /// Authentication expired
    Expired,
    /// Authentication error
    Error,
}

/// Platform capabilities and feature detection.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformCapabilities {
    /// The platform these capabilities describe
    pub platform: Platform,

    /// Available feature flags
    pub features: Vec<FeatureFlag>,

    /// Available models
    pub models: Vec<String>,

    /// Authentication status
    pub auth_status: AuthStatus,

    /// Quota information
    #[serde(skip_serializing_if = "Option::is_none")]
    pub quota_info: Option<QuotaInfo>,

    /// Cooldown information
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cooldown_info: Option<CooldownInfo>,

    /// Additional metadata
    #[serde(default)]
    pub metadata: HashMap<String, String>,

    /// When capabilities were last checked
    #[serde(default = "Utc::now")]
    pub checked_at: DateTime<Utc>,
}

impl PlatformCapabilities {
    /// Creates a new capabilities record.
    pub fn new(platform: Platform, models: Vec<String>) -> Self {
        Self {
            platform,
            features: Vec::new(),
            models,
            auth_status: AuthStatus::Unauthenticated,
            quota_info: None,
            cooldown_info: None,
            metadata: HashMap::new(),
            checked_at: Utc::now(),
        }
    }

    /// Checks if a feature is supported.
    pub fn has_feature(&self, feature: FeatureFlag) -> bool {
        self.features.contains(&feature)
    }

    /// Checks if a model is available.
    pub fn has_model(&self, model: &str) -> bool {
        self.models.iter().any(|m| m == model)
    }

    /// Checks if the platform is ready for use.
    pub fn is_ready(&self) -> bool {
        self.auth_status == AuthStatus::Authenticated
            && self
                .cooldown_info
                .as_ref()
                .map_or(true, |c| !c.active)
            && self
                .quota_info
                .as_ref()
                .map_or(true, |q| !q.is_exhausted())
    }

    /// Returns a reason if the platform is not ready.
    pub fn ready_status(&self) -> Result<(), String> {
        if self.auth_status != AuthStatus::Authenticated {
            return Err(format!("Not authenticated: {:?}", self.auth_status));
        }
        if let Some(cooldown) = &self.cooldown_info {
            if cooldown.active {
                return Err(format!(
                    "Cooldown active: {} ({} seconds remaining)",
                    cooldown.reason, cooldown.remaining_seconds
                ));
            }
        }
        if let Some(quota) = &self.quota_info {
            if quota.is_exhausted() {
                return Err("Quota exhausted".to_string());
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_feature_flag_info() {
        let flag = FeatureFlag::JsonOutput;
        assert_eq!(flag.name(), "JSON Output");
        assert!(!flag.description().is_empty());
    }

    #[test]
    fn test_quota_info() {
        let quota = QuotaInfo::new(1000, 750);
        assert_eq!(quota.remaining, 250);
        assert_eq!(quota.usage_percent(), 75.0);
        assert!(!quota.is_exhausted());
        assert!(quota.above_threshold(50.0));
        assert!(!quota.above_threshold(80.0));

        let exhausted = QuotaInfo::new(1000, 1000);
        assert!(exhausted.is_exhausted());
    }

    #[test]
    fn test_cooldown_info() {
        let inactive = CooldownInfo::inactive();
        assert!(!inactive.active);

        let active = CooldownInfo::active(300, "Rate limit exceeded");
        assert!(active.active);
        assert_eq!(active.remaining_seconds, 300);
        assert!(active.expires_at.is_some());
    }

    #[test]
    fn test_platform_capabilities_features() {
        let mut caps = PlatformCapabilities::new(
            Platform::Claude,
            vec!["claude-3-opus".to_string()],
        );

        caps.features.push(FeatureFlag::JsonOutput);
        caps.features.push(FeatureFlag::PlanMode);

        assert!(caps.has_feature(FeatureFlag::JsonOutput));
        assert!(caps.has_feature(FeatureFlag::PlanMode));
        assert!(!caps.has_feature(FeatureFlag::WebSearch));
        assert!(caps.has_model("claude-3-opus"));
        assert!(!caps.has_model("gpt-4"));
    }

    #[test]
    fn test_platform_readiness() {
        let mut caps = PlatformCapabilities::new(
            Platform::Claude,
            vec!["claude-3-opus".to_string()],
        );

        // Not authenticated
        assert!(!caps.is_ready());
        assert!(caps.ready_status().is_err());

        // Authenticated but with cooldown
        caps.auth_status = AuthStatus::Authenticated;
        caps.cooldown_info = Some(CooldownInfo::active(60, "Rate limit"));
        assert!(!caps.is_ready());

        // Authenticated, no cooldown, but quota exhausted
        caps.cooldown_info = Some(CooldownInfo::inactive());
        caps.quota_info = Some(QuotaInfo::new(1000, 1000));
        assert!(!caps.is_ready());

        // Authenticated, no cooldown, quota available
        caps.quota_info = Some(QuotaInfo::new(1000, 500));
        assert!(caps.is_ready());
        assert!(caps.ready_status().is_ok());
    }
}
