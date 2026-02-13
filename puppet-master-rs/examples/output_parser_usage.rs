//! Example usage of the new output parsing system
//!
//! This file demonstrates how to use the output parser, health monitor,
//! auth checker, and platform detector in your code.

#![allow(dead_code, unused_imports)]

use puppet_master::platforms::{
    // Authentication
    AuthCheckResult,
    AuthStatusChecker,
    CompletionSignal,
    // Platform detection
    DetectedPlatform,
    ErrorCategory,
    // Health monitoring
    HealthConfig,
    HealthMonitor,
    InstallationStatus,
    OutputParser,
    ParsedOutput,
    PlatformDetector,
    PlatformError,
    PlatformHealth,
    TokenUsage,
    // Output parsing
    create_parser,
};
use puppet_master::types::Platform;

/// Example: Parse output from a platform CLI execution
async fn example_parse_output() {
    // Create a parser for Cursor
    let parser = create_parser(Platform::Cursor);

    // Simulate stdout from Cursor CLI with JSON output
    let stdout = r#"{
        "usage": {
            "input_tokens": 1500,
            "output_tokens": 750
        },
        "files_changed": ["src/main.rs", "src/lib.rs"]
    }"#;

    let stderr = "";

    // Parse the output
    let output = parser.parse(stdout, stderr);

    // Check for completion signals
    if let Some(signal) = output.completion_signal {
        match signal {
            CompletionSignal::Complete => println!("✓ Task completed successfully!"),
            CompletionSignal::Gutter => println!("⚠ Reached gutter - no more work"),
        }
    }

    // Check token usage
    if let Some(usage) = output.token_usage {
        println!(
            "Tokens used: {} input, {} output",
            usage.input_tokens.unwrap_or(0),
            usage.output_tokens.unwrap_or(0)
        );
    }

    // Check files changed
    println!("Files modified: {:?}", output.files_changed);

    // Check for errors
    for error in output.errors {
        println!(
            "Error ({:?}): {} [recoverable: {}]",
            error.category, error.message, error.recoverable
        );
    }
}

/// Example: Monitor platform health with circuit breaker
async fn example_health_monitoring() {
    // Create health monitor with custom configuration
    let config = HealthConfig::new(
        3,                            // Open circuit after 3 failures
        chrono::Duration::minutes(5), // 5 minute cooldown
        chrono::Duration::minutes(1), // Check every minute
    );

    let monitor = HealthMonitor::with_config(config);

    // Simulate execution results
    monitor.record_success(Platform::Cursor).await;
    monitor.record_success(Platform::Claude).await;

    // Record failures
    monitor
        .record_failure(Platform::Codex, "Rate limit exceeded".to_string())
        .await;
    monitor
        .record_failure(Platform::Codex, "Rate limit exceeded".to_string())
        .await;
    monitor
        .record_failure(Platform::Codex, "Rate limit exceeded".to_string())
        .await;

    // Check availability before executing
    if monitor.is_available(Platform::Cursor).await {
        println!("Cursor is available - executing task");
    }

    if !monitor.is_available(Platform::Codex).await {
        println!("Codex is unavailable - circuit breaker is open");
    }

    // Get health status
    if let Some(health) = monitor.get_health(Platform::Codex).await {
        println!(
            "Codex health: {} consecutive failures, circuit breaker: {}",
            health.consecutive_failures, health.circuit_breaker_open
        );
    }

    // Get all available platforms
    let available = monitor.get_available_platforms().await;
    println!("Available platforms: {:?}", available);

    // Get platforms with open circuit breakers
    let circuit_breaker = monitor.get_circuit_breaker_platforms().await;
    println!("Circuit breaker open for: {:?}", circuit_breaker);
}

/// Example: Check authentication status for all platforms
async fn example_check_authentication() {
    let checker = AuthStatusChecker::new();

    // Check all platforms
    let results = checker.check_all().await;

    println!("Authentication Status:");
    println!("=====================");

    for (platform, result) in &results {
        let status = if result.authenticated { "✓" } else { "✗" };
        println!("{} {}: {}", status, platform, result.message);

        if let Some(details) = &result.details {
            println!("  └─ {}", details);
        }
    }

    // Get only authenticated platforms
    let authenticated = checker.get_authenticated_platforms().await;
    println!("\nAuthenticated platforms: {:?}", authenticated);

    // Check specific platform
    let cursor_auth = checker.check_platform(Platform::Cursor).await;
    if cursor_auth.authenticated {
        println!("\n✓ Cursor is authenticated and ready to use");
    } else {
        println!(
            "\n✗ Cursor authentication required: {}",
            cursor_auth.message
        );
    }
}

/// Example: Detect installed platforms
async fn example_detect_platforms() {
    // Detect all installed platforms
    let detected = PlatformDetector::detect_installed().await;

    println!("Detected Platforms:");
    println!("==================");

    for platform_info in &detected {
        println!("\n{}", platform_info.platform);
        println!("  Path: {}", platform_info.executable_path());
        println!(
            "  Version: {}",
            platform_info.version.as_deref().unwrap_or("unknown")
        );
        println!("  Available: {}", platform_info.available);

        // Check version requirements
        if platform_info.meets_minimum_version("1.0.0") {
            println!("  ✓ Meets minimum version requirement (1.0.0)");
        }
    }

    // Create detection map
    let detection_map = PlatformDetector::create_detection_map().await;

    // Check if specific platform is installed
    if let Some(cursor_info) = detection_map.get(&Platform::Cursor) {
        println!(
            "\nCursor is installed at: {}",
            cursor_info.executable_path()
        );
    } else {
        println!("\nCursor is not installed");

        // Get installation recommendations
        let status = InstallationStatus::not_installed(Platform::Cursor);
        println!("Installation recommendations:");
        for rec in status.recommendations {
            println!("  - {}", rec);
        }
    }

    // Check if any platform is available
    if PlatformDetector::has_any_platform().await {
        println!("\n✓ At least one platform is available");
    } else {
        println!("\n✗ No platforms detected");
    }
}

/// Example: Complete workflow - detect, auth, monitor, parse
async fn example_complete_workflow() {
    println!("RWM Puppet Master - Platform Integration Workflow");
    println!("==================================================\n");

    // Step 1: Detect installed platforms
    println!("Step 1: Detecting platforms...");
    let detected = PlatformDetector::detect_installed().await;
    println!("Found {} platform(s)\n", detected.len());

    // Step 2: Check authentication
    println!("Step 2: Checking authentication...");
    let checker = AuthStatusChecker::new();
    let auth_platforms = checker.get_authenticated_platforms().await;
    println!("{} platform(s) authenticated\n", auth_platforms.len());

    // Step 3: Initialize health monitor
    println!("Step 3: Initializing health monitor...");
    let monitor = HealthMonitor::new();
    println!("Health monitor ready\n");

    // Step 4: Find best available platform
    println!("Step 4: Finding best available platform...");
    let available = monitor.get_available_platforms().await;

    if let Some(platform) = available.first() {
        println!("Selected platform: {}\n", platform);

        // Step 5: Execute (simulated)
        println!("Step 5: Executing on platform {}...", platform);

        // Simulate execution output
        let stdout = "<ralph>COMPLETE</ralph>\nModified: src/main.rs";
        let stderr = "";

        // Step 6: Parse output
        println!("Step 6: Parsing execution output...");
        let parser = create_parser(*platform);
        let output = parser.parse(stdout, stderr);

        if let Some(signal) = output.completion_signal {
            println!("✓ Completion signal: {:?}", signal);
        }

        // Step 7: Update health monitor
        println!("Step 7: Updating health status...");
        monitor.record_success(*platform).await;

        let health = monitor.get_health(*platform).await.unwrap();
        println!(
            "✓ Platform health: {} consecutive failures\n",
            health.consecutive_failures
        );

        println!("Workflow complete!");
    } else {
        println!("✗ No platforms available");
    }
}

/// Example: Error handling and recovery
async fn example_error_handling() {
    let monitor = HealthMonitor::new();

    // Simulate execution with error
    let stdout = "";
    let stderr = "Error: Rate limit exceeded. Please try again later.";

    let parser = create_parser(Platform::Claude);
    let output = parser.parse(stdout, stderr);

    // Check for errors
    for error in &output.errors {
        println!("Error detected: {}", error.message);
        println!("Category: {:?}", error.category);

        match error.category {
            ErrorCategory::RateLimit => {
                println!("→ Rate limit hit - recording failure");
                monitor
                    .record_failure(Platform::Claude, error.message.clone())
                    .await;

                // Check if circuit breaker is open
                if let Some(health) = monitor.get_health(Platform::Claude).await {
                    if health.circuit_breaker_open {
                        println!("→ Circuit breaker opened - switching to backup platform");

                        // Find alternative platform
                        let available = monitor.get_available_platforms().await;
                        if let Some(backup) = available.iter().find(|&&p| p != Platform::Claude) {
                            println!("→ Switching to {}", backup);
                        }
                    }
                }
            }
            ErrorCategory::AuthFailure => {
                println!("→ Authentication required - check credentials");
            }
            ErrorCategory::QuotaExceeded => {
                println!("→ Quota exceeded - consider upgrading plan");
            }
            _ => {
                if error.recoverable {
                    println!("→ Error is recoverable - will retry");
                } else {
                    println!("→ Fatal error - manual intervention required");
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_workflow_examples() {
        // These are example functions - they should compile
        // Actual execution depends on environment

        // Just verify they don't panic
        example_parse_output().await;
        example_health_monitoring().await;
        example_check_authentication().await;
        example_detect_platforms().await;
        example_complete_workflow().await;
        example_error_handling().await;
    }
}

// Main function for standalone testing
#[tokio::main]
async fn main() {
    // Run all examples
    example_parse_output().await;
    println!("\n{}\n", "=".repeat(60));

    example_health_monitoring().await;
    println!("\n{}\n", "=".repeat(60));

    example_check_authentication().await;
    println!("\n{}\n", "=".repeat(60));

    example_detect_platforms().await;
    println!("\n{}\n", "=".repeat(60));

    example_complete_workflow().await;
    println!("\n{}\n", "=".repeat(60));

    example_error_handling().await;
}
