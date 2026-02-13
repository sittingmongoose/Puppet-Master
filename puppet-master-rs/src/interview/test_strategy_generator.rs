//! Generates comprehensive autonomous test strategy from interview.
//!
//! Creates a detailed test plan that AI agents can execute without manual
//! intervention, with emphasis on Playwright for E2E testing.

use anyhow::{Context, Result};
use log::info;
use std::fs;
use std::path::Path;

use super::document_writer::CompletedPhase;

/// Test coverage levels.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CoverageLevel {
    /// Basic coverage of critical paths only.
    Basic,
    /// Standard coverage including error cases.
    Standard,
    /// Comprehensive coverage of all scenarios.
    Comprehensive,
}

impl std::fmt::Display for CoverageLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CoverageLevel::Basic => write!(f, "Basic"),
            CoverageLevel::Standard => write!(f, "Standard"),
            CoverageLevel::Comprehensive => write!(f, "Comprehensive"),
        }
    }
}

/// Configuration for test strategy generation.
#[derive(Debug, Clone)]
pub struct TestStrategyConfig {
    /// Desired coverage level.
    pub coverage_level: CoverageLevel,
    /// Whether to include Playwright E2E tests.
    pub include_playwright: bool,
    /// Whether to include performance tests.
    pub include_performance: bool,
    /// Whether to include security tests.
    pub include_security: bool,
}

impl Default for TestStrategyConfig {
    fn default() -> Self {
        Self {
            coverage_level: CoverageLevel::Standard,
            include_playwright: true,
            include_performance: false,
            include_security: true,
        }
    }
}

/// Generates a test strategy document from interview results.
pub fn generate_test_strategy(
    project_name: &str,
    completed_phases: &[CompletedPhase],
    config: &TestStrategyConfig,
) -> Result<String> {
    let mut content = String::new();

    // Header
    content.push_str(&format!(
        "# Test Strategy: {project_name}\n\n\
         **Generated on {}**\n\n\
         **Coverage Level:** {}\n\n",
        chrono::Utc::now().format("%Y-%m-%d"),
        config.coverage_level
    ));

    // Overview
    content.push_str(
        "## Overview\n\n\
         This document defines the comprehensive automated testing strategy for the project.\n\
         All tests are designed to be executed by AI agents without manual intervention.\n\n",
    );

    // Test types
    content.push_str("## Test Types\n\n");

    // Unit tests
    content.push_str(
        "### Unit Tests\n\n\
         - Test individual functions and modules in isolation\n\
         - Mock external dependencies\n\
         - Aim for fast execution (< 1s per test)\n\
         - Run on every commit\n\n",
    );

    // Integration tests
    content.push_str(
        "### Integration Tests\n\n\
         - Test interactions between modules\n\
         - Test database operations\n\
         - Test API endpoints\n\
         - Run before merge\n\n",
    );

    // E2E tests
    if config.include_playwright {
        content.push_str(
            "### End-to-End Tests (Playwright)\n\n\
             - Test complete user workflows\n\
             - Run in real browser environments\n\
             - Test across multiple browsers if applicable\n\
             - Include accessibility checks\n\
             - Run nightly or before release\n\n",
        );
    }

    // Performance tests
    if config.include_performance {
        content.push_str(
            "### Performance Tests\n\n\
             - Measure response times\n\
             - Test under load\n\
             - Check memory usage\n\
             - Run weekly or before release\n\n",
        );
    }

    // Security tests
    if config.include_security {
        content.push_str(
            "### Security Tests\n\n\
             - Test authentication and authorization\n\
             - Check for common vulnerabilities (SQL injection, XSS, etc.)\n\
             - Verify secrets are not exposed\n\
             - Run before merge\n\n",
        );
    }

    // Test scenarios by phase
    content.push_str("## Test Scenarios by Domain\n\n");
    for phase in completed_phases {
        content.push_str(&format!("### {}\n\n", phase.definition.name));

        // Generate test scenarios based on Q&A
        if !phase.qa_history.is_empty() {
            content.push_str("**Test scenarios derived from requirements:**\n\n");
            for (i, qa) in phase.qa_history.iter().enumerate().take(3) {
                content.push_str(&format!(
                    "{}. Test scenario related to: {}\n",
                    i + 1,
                    qa.question
                ));
            }
            content.push('\n');
        }

        content.push_str("(Detailed test cases to be generated during implementation)\n\n");
    }

    // Acceptance criteria
    content.push_str(
        "## Acceptance Criteria\n\n\
         The project is ready for release when:\n\
         - All unit tests pass (100%)\n\
         - All integration tests pass (100%)\n",
    );

    if config.include_playwright {
        content.push_str("- All E2E tests pass (100%)\n");
    }

    if config.include_performance {
        content.push_str("- Performance tests meet target thresholds\n");
    }

    if config.include_security {
        content.push_str("- Security tests show no critical vulnerabilities\n");
    }

    content.push_str(&format!(
        "- Code coverage is at least {}%\n\n",
        match config.coverage_level {
            CoverageLevel::Basic => 70,
            CoverageLevel::Standard => 80,
            CoverageLevel::Comprehensive => 90,
        }
    ));

    // CI/CD integration
    content.push_str(
        "## CI/CD Integration\n\n\
         - Run unit tests on every push\n\
         - Run integration tests on pull request\n\
         - Run full test suite nightly\n\
         - Block merge if tests fail\n\
         - Generate coverage reports\n\n",
    );

    Ok(content)
}

/// Writes the test strategy document to disk.
pub fn write_test_strategy(
    project_name: &str,
    completed_phases: &[CompletedPhase],
    config: &TestStrategyConfig,
    output_dir: &Path,
) -> Result<std::path::PathBuf> {
    let content = generate_test_strategy(project_name, completed_phases, config)?;

    fs::create_dir_all(output_dir)
        .with_context(|| format!("Failed to create output dir {}", output_dir.display()))?;

    let path = output_dir.join("TEST_STRATEGY.md");

    fs::write(&path, &content)
        .with_context(|| format!("Failed to write test strategy to {}", path.display()))?;

    info!("Wrote test strategy to {}", path.display());
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interview::phase_manager::InterviewPhaseDefinition;
    use crate::interview::state::{Decision, InterviewQA};
    use tempfile::TempDir;

    fn sample_phase() -> CompletedPhase {
        CompletedPhase {
            definition: InterviewPhaseDefinition {
                id: "testing_verification".to_string(),
                domain: "Testing & Verification".to_string(),
                name: "Testing & Verification".to_string(),
                description: "Test strategy".to_string(),
                min_questions: 3,
                max_questions: 8,
            },
            decisions: vec![],
            qa_history: vec![
                InterviewQA {
                    question: "What test types?".to_string(),
                    answer: "Unit, integration, E2E".to_string(),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                },
                InterviewQA {
                    question: "Use Playwright?".to_string(),
                    answer: "Yes".to_string(),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                },
            ],
            document_path: std::path::PathBuf::from("phase-08-testing-verification.md"),
        }
    }

    #[test]
    fn test_generate_test_strategy() {
        let phases = vec![sample_phase()];
        let config = TestStrategyConfig::default();
        let content = generate_test_strategy("TestProject", &phases, &config).unwrap();
        assert!(content.contains("TestProject"));
        assert!(content.contains("Test Strategy"));
        assert!(content.contains("Playwright"));
        assert!(content.contains("Unit Tests"));
    }

    #[test]
    fn test_coverage_levels() {
        assert_eq!(CoverageLevel::Basic.to_string(), "Basic");
        assert_eq!(CoverageLevel::Standard.to_string(), "Standard");
        assert_eq!(CoverageLevel::Comprehensive.to_string(), "Comprehensive");
    }

    #[test]
    fn test_write_test_strategy() {
        let dir = TempDir::new().unwrap();
        let phases = vec![sample_phase()];
        let config = TestStrategyConfig::default();
        let path = write_test_strategy("TestProject", &phases, &config, dir.path()).unwrap();
        assert!(path.exists());
        let content = fs::read_to_string(&path).unwrap();
        assert!(content.contains("Test Strategy"));
    }
}
