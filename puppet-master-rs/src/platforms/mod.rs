//! Platform runner modules for RWM Puppet Master
//!
//! This module provides the infrastructure for executing tasks on various AI platforms,
//! including Cursor, Codex, Claude Code, Gemini, and GitHub Copilot.
//!
//! # Architecture
//!
//! - `PlatformRunner` trait: Common interface for all platform runners
//! - `BaseRunner`: Shared logic for process spawning, timeout handling, and output capture
//! - Platform-specific runners: Implement `PlatformRunner` for each AI platform
//! - Quota/rate limiting: Budget management and rate limiting across platforms
//! - Capability discovery: Detect and cache platform capabilities

use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::Result;
use async_trait::async_trait;

// Module declarations
pub mod auth_actions;
pub mod auth_status;
pub mod capability;
pub mod circuit_breaker;
pub mod claude;
pub mod codex;
pub mod copilot;
pub mod cursor;
pub mod gemini;
pub mod health_monitor;
pub mod model_catalog;
pub mod output_parser;
pub mod permission_audit;
pub mod permission_detector;
pub mod platform_detector;
pub mod quota_manager;
pub mod rate_limiter;
pub mod registry;
pub mod runner;
pub mod usage_tracker;

// Re-exports
pub use auth_actions::{AuthTarget, spawn_login, spawn_logout};
pub use auth_status::{AuthCheckResult, AuthStatusChecker};
pub use capability::CapabilityInfo;
pub use circuit_breaker::{
    CircuitBreaker, CircuitBreakerConfig, CircuitBreakerInfo, CircuitBreakerManager, CircuitState,
};
pub use claude::ClaudeRunner;
pub use codex::CodexRunner;
pub use copilot::CopilotRunner;
pub use cursor::CursorRunner;
pub use gemini::GeminiRunner;
pub use health_monitor::{HealthConfig, HealthMonitor, PlatformHealth};
pub use model_catalog::{
    ModelCatalog, ModelCatalogManager, ModelInfo, ModelProvider, get_default_model, get_model,
    get_models,
};
pub use output_parser::{
    CompletionSignal, ErrorCategory, OutputParser, ParsedOutput, PlatformError, TokenUsage,
    create_parser,
};
pub use permission_audit::{
    ApprovalStats, AuditQuery, PermissionAction, PermissionAudit, PermissionEvent,
};
pub use permission_detector::{
    AutoResponsePolicy, PermissionDetector, PermissionPrompt, PermissionType,
};
pub use platform_detector::{DetectedPlatform, InstallationStatus, PlatformDetector};
pub use quota_manager::{QuotaConfig, QuotaManager};
pub use rate_limiter::{RateLimiter, RateLimiterConfig};
pub use registry::{
    PlatformInfo, PlatformRegistry, get_runner, global_registry, list_available_platforms,
};
pub use runner::BaseRunner;
pub use usage_tracker::{PlanInfo, QuotaInfo, UsageEvent, UsageSummary, UsageTracker};

/// Trait for platform-specific AI execution
///
/// All platform runners must implement this trait to provide consistent
/// execution, model discovery, and availability checking.
#[async_trait]
pub trait PlatformRunner: Send + Sync {
    /// Get the platform this runner handles
    fn platform(&self) -> Platform;

    /// Execute a request on this platform
    ///
    /// # Arguments
    ///
    /// * `request` - The execution request containing prompt, model, and options
    ///
    /// # Returns
    ///
    /// Returns the execution result containing output, status, and metadata
    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult>;

    /// Check if this platform is available (CLI installed and accessible)
    ///
    /// # Returns
    ///
    /// Returns true if the platform CLI is available on the system
    async fn is_available(&self) -> bool;

    /// Discover available models for this platform
    ///
    /// # Returns
    ///
    /// Returns a list of model identifiers supported by this platform
    async fn discover_models(&self) -> Result<Vec<String>>;

    /// Build command-line arguments for this platform
    ///
    /// # Arguments
    ///
    /// * `request` - The execution request to build args from
    ///
    /// # Returns
    ///
    /// Returns a vector of command-line arguments
    fn build_args(&self, request: &ExecutionRequest) -> Vec<String>;
}

/// Factory function to create a platform runner
///
/// # Arguments
///
/// * `platform` - The platform to create a runner for
///
/// # Returns
///
/// Returns a boxed platform runner implementation
pub fn create_runner(platform: Platform) -> Box<dyn PlatformRunner> {
    match platform {
        Platform::Cursor => Box::new(CursorRunner::new()),
        Platform::Codex => Box::new(CodexRunner::new()),
        Platform::Claude => Box::new(ClaudeRunner::new()),
        Platform::Gemini => Box::new(GeminiRunner::new()),
        Platform::Copilot => Box::new(CopilotRunner::new()),
    }
}

/// Check if a platform is available
///
/// # Arguments
///
/// * `platform` - The platform to check
///
/// # Returns
///
/// Returns true if the platform CLI is available
pub async fn is_platform_available(platform: Platform) -> bool {
    let runner = create_runner(platform);
    runner.is_available().await
}

/// Discover models for a platform
///
/// # Arguments
///
/// * `platform` - The platform to discover models for
///
/// # Returns
///
/// Returns a list of available models
pub async fn discover_platform_models(platform: Platform) -> Result<Vec<String>> {
    let runner = create_runner(platform);
    runner.discover_models().await
}

/// Detect all installed platforms on the system
///
/// # Returns
///
/// Returns a list of detected platform information
pub async fn detect_installed_platforms() -> Vec<DetectedPlatform> {
    PlatformDetector::detect_installed().await
}

/// Detect a specific platform
///
/// # Arguments
///
/// * `platform` - The platform to detect
///
/// # Returns
///
/// Returns platform detection information if found
pub async fn detect_platform(platform: Platform) -> Option<DetectedPlatform> {
    PlatformDetector::detect_platform(platform).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_runner() {
        for platform in Platform::all() {
            let runner = create_runner(*platform);
            assert_eq!(runner.platform(), *platform);
        }
    }

    #[tokio::test]
    async fn test_platform_availability() {
        // This test will vary based on what's installed
        // Just ensure it doesn't panic
        for platform in Platform::all() {
            let _available = is_platform_available(*platform).await;
        }
    }
}
