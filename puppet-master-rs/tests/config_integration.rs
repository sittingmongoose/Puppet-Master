//! Configuration integration tests
//!
//! Tests for loading, validating, and managing configuration files.

use puppet_master::config::ConfigManager;
use std::fs;
use tempfile::TempDir;

#[test]
fn test_load_valid_yaml_config() {
    let temp_dir = TempDir::new().unwrap();
    let config_path = temp_dir.path().join("pm-config.yaml");

    // Write a valid config with platforms enabled
    let config_content = r#"
project:
  name: "test-project"
  workingDirectory: "/tmp/test-project"
tiers:
  phase:
    platform: cursor
    model: "gpt-4"
    maxIterations: 3
  task:
    platform: claude
    model: "claude-sonnet-4"
    maxIterations: 5
  subtask:
    platform: codex
    model: "gpt-4-codex"
    maxIterations: 10
  iteration:
    platform: gemini
    model: "gemini-2.0-pro"
    maxIterations: 1
platforms:
  cursor:
    platform: cursor
    model: "gpt-4"
    name: "Cursor"
    executable: "agent"
    enabled: true
"#;
    fs::write(&config_path, config_content).unwrap();

    // Load the config
    let result = ConfigManager::load(&config_path);
    assert!(result.is_ok(), "Failed to load valid config: {:?}", result.err());

    let config_mgr = result.unwrap();
    let config = config_mgr.get_config();
    assert_eq!(config.project.name, "test-project");
    assert_eq!(config.project.working_directory.to_str().unwrap(), "/tmp/test-project");
    assert_eq!(config.tiers.phase.max_iterations, 3);
    assert_eq!(config.tiers.task.max_iterations, 5);
}

#[test]
fn test_default_config_works() {
    // Create a default config manager
    let config_mgr = ConfigManager::new();
    let config = config_mgr.get_config();
    
    // Verify defaults are reasonable
    assert!(!config.project.name.is_empty(), "Project name should not be empty");
    assert!(config.tiers.phase.max_iterations > 0, "Phase max_iterations should be > 0");
    assert!(config.tiers.task.max_iterations > 0, "Task max_iterations should be > 0");
}

#[test]
fn test_config_validation_invalid_platform() {
    let temp_dir = TempDir::new().unwrap();
    let config_path = temp_dir.path().join("pm-config.yaml");

    // Write a config with invalid platform
    let config_content = r#"
project:
  name: "test-project"
  workingDirectory: "/tmp/test-project"
tiers:
  phase:
    platform: invalid_platform
    model: "gpt-4"
    maxIterations: 3
  task:
    platform: claude
    model: "claude-sonnet-4"
    maxIterations: 5
  subtask:
    platform: codex
    model: "gpt-4-codex"
    maxIterations: 10
  iteration:
    platform: gemini
    model: "gemini-2.0-pro"
    maxIterations: 1
"#;
    fs::write(&config_path, config_content).unwrap();

    // This should fail to parse
    let result = ConfigManager::load(&config_path);
    assert!(result.is_err(), "Should fail with invalid platform");
}

#[test]
fn test_config_save_and_reload() {
    let temp_dir = TempDir::new().unwrap();
    let config_path = temp_dir.path().join("pm-config.yaml");

    // Create a config manager, modify, and save
    let config_mgr = ConfigManager::new();
    let mut config = config_mgr.get_config();
    config.project.name = "modified-project".to_string();
    
    config_mgr.set_config(config.clone()).unwrap();
    config_mgr.save_to(&config_path).unwrap();
    
    // Load it back
    let config_mgr2 = ConfigManager::load(&config_path).unwrap();
    let config2 = config_mgr2.get_config();
    
    assert_eq!(config2.project.name, "modified-project");
}
