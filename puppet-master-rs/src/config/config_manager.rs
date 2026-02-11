//! Configuration Manager
//!
//! Load, save, and manage configuration files:
//! - YAML config file discovery
//! - Merge with default values
//! - Save configuration back to file

use crate::config::default_config::default_config;
use crate::config::config_schema::validate_config;
use crate::config::config_override::{ConfigOverride, apply_overrides};
use crate::types::PuppetMasterConfig;
use anyhow::{Context, Result};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

/// Thread-safe configuration manager
#[derive(Clone)]
pub struct ConfigManager {
    inner: Arc<Mutex<ConfigManagerInner>>,
}

struct ConfigManagerInner {
    config: PuppetMasterConfig,
    config_path: Option<PathBuf>,
}

impl ConfigManager {
    /// Create a new config manager with default configuration
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(ConfigManagerInner {
                config: default_config(),
                config_path: None,
            })),
        }
    }

    /// Load configuration from a file
    pub fn load(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref();
        let content = std::fs::read_to_string(path)
            .with_context(|| format!("Failed to read config from {}", path.display()))?;

        let config: PuppetMasterConfig = serde_yaml::from_str(&content)
            .with_context(|| format!("Failed to parse YAML config from {}", path.display()))?;

        // Validate configuration
        let errors = validate_config(&config);
        if !errors.is_empty() {
            let error_msg = errors
                .iter()
                .map(|e| e.to_string())
                .collect::<Vec<_>>()
                .join("\n");
            anyhow::bail!("Configuration validation failed:\n{}", error_msg);
        }

        log::info!("Loaded configuration from {}", path.display());

        Ok(Self {
            inner: Arc::new(Mutex::new(ConfigManagerInner {
                config,
                config_path: Some(path.to_path_buf()),
            })),
        })
    }

    /// Discover and load configuration file
    ///
    /// Searches in order:
    /// 1. Current directory
    /// 2. Parent directories (up to 3 levels)
    /// 3. Home directory
    pub fn discover() -> Result<Self> {
        let config_names = ["pm-config.yaml", "puppet-master.yaml", ".puppet-master.yaml"];

        // Try current directory
        for name in &config_names {
            let path = PathBuf::from(name);
            if path.exists() {
                log::info!("Found config file: {}", path.display());
                return Self::load(path);
            }
        }

        // Try parent directories
        if let Ok(mut current_dir) = std::env::current_dir() {
            for _ in 0..3 {
                if !current_dir.pop() {
                    break;
                }

                for name in &config_names {
                    let path = current_dir.join(name);
                    if path.exists() {
                        log::info!("Found config file: {}", path.display());
                        return Self::load(path);
                    }
                }
            }
        }

        // Try home directory
        if let Some(home_dir) = directories::UserDirs::new() {
            let home = home_dir.home_dir();
            for name in &config_names {
                let path = home.join(name);
                if path.exists() {
                    log::info!("Found config file: {}", path.display());
                    return Self::load(path);
                }
            }
        }

        log::info!("No config file found, using defaults");
        Ok(Self::new())
    }

    /// Save configuration to file
    pub fn save(&self) -> Result<()> {
        let inner = self.inner.lock().unwrap();

        let config_path = inner
            .config_path
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("No config file path set"))?;

        let yaml = serde_yaml::to_string(&inner.config)
            .context("Failed to serialize config to YAML")?;

        std::fs::write(config_path, yaml).with_context(|| {
            format!(
                "Failed to write config to {}",
                config_path.display()
            )
        })?;

        log::info!("Saved configuration to {}", config_path.display());
        Ok(())
    }

    /// Save configuration to a specific path
    pub fn save_to(&self, path: impl AsRef<Path>) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();
        let path = path.as_ref();

        let yaml = serde_yaml::to_string(&inner.config)
            .context("Failed to serialize config to YAML")?;

        std::fs::write(path, yaml)
            .with_context(|| format!("Failed to write config to {}", path.display()))?;

        inner.config_path = Some(path.to_path_buf());

        log::info!("Saved configuration to {}", path.display());
        Ok(())
    }

    /// Get a clone of the configuration
    pub fn get_config(&self) -> PuppetMasterConfig {
        let inner = self.inner.lock().unwrap();
        inner.config.clone()
    }

    /// Update the configuration
    pub fn set_config(&self, config: PuppetMasterConfig) -> Result<()> {
        // Validate before setting
        let errors = validate_config(&config);
        if !errors.is_empty() {
            let error_msg = errors
                .iter()
                .map(|e| e.to_string())
                .collect::<Vec<_>>()
                .join("\n");
            anyhow::bail!("Configuration validation failed:\n{}", error_msg);
        }

        let mut inner = self.inner.lock().unwrap();
        inner.config = config;

        log::debug!("Configuration updated");
        Ok(())
    }

    /// Get the config file path
    pub fn config_path(&self) -> Option<PathBuf> {
        let inner = self.inner.lock().unwrap();
        inner.config_path.clone()
    }

    /// Merge with another configuration (other takes precedence)
    pub fn merge(&self, other: PuppetMasterConfig) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();

        // Simple merge: other overwrites self
        // In a more sophisticated version, we'd merge nested structures
        inner.config = other;

        log::debug!("Configuration merged");
        Ok(())
    }
    
    /// Apply configuration overrides to the current configuration
    ///
    /// This modifies the configuration in-place with the specified overrides.
    /// Overrides allow runtime modifications without changing the base config file.
    pub fn apply_overrides(&self, overrides: &ConfigOverride) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();
        
        // Apply overrides to the configuration
        apply_overrides(&mut inner.config, overrides);
        
        log::info!("Applied configuration overrides");
        Ok(())
    }
}

impl Default for ConfigManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_save_and_load() {
        let temp_dir = TempDir::new().unwrap();
        let config_path = temp_dir.path().join("config.yaml");

        let manager = ConfigManager::new();
        manager.save_to(&config_path).unwrap();

        let loaded = ConfigManager::load(&config_path).unwrap();
        let config = loaded.get_config();

        assert_eq!(
            config.orchestrator.session_prefix,
            "PM"
        );
    }

    #[test]
    fn test_default_config() {
        let manager = ConfigManager::new();
        let config = manager.get_config();

        assert!(config.tiers.phase.max_iterations > 0);
        assert!(config.tiers.task.max_iterations > 0);
        assert!(config.tiers.subtask.max_iterations > 0);
    }
}
