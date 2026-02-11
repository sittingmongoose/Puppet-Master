//! Secrets Manager
//!
//! Manages API keys and credentials:
//! - Read from environment variables
//! - Load from .env file
//! - Never log or persist secrets

use std::collections::HashMap;
use std::env;
use std::sync::{Arc, Mutex};

/// Thread-safe secrets manager
#[derive(Clone)]
pub struct SecretsManager {
    inner: Arc<Mutex<SecretsManagerInner>>,
}

struct SecretsManagerInner {
    secrets: HashMap<String, String>,
}

impl SecretsManager {
    /// Create a new secrets manager and load from environment
    pub fn new() -> Self {
        let mut secrets = HashMap::new();

        // Load common API keys from environment
        Self::load_from_env(&mut secrets, "ANTHROPIC_API_KEY");
        Self::load_from_env(&mut secrets, "OPENAI_API_KEY");
        Self::load_from_env(&mut secrets, "CURSOR_API_KEY");
        Self::load_from_env(&mut secrets, "GEMINI_API_KEY");
        Self::load_from_env(&mut secrets, "GITHUB_TOKEN");

        log::debug!("Loaded {} secrets from environment", secrets.len());

        Self {
            inner: Arc::new(Mutex::new(SecretsManagerInner { secrets })),
        }
    }

    /// Load a secret from environment variable
    fn load_from_env(secrets: &mut HashMap<String, String>, key: &str) {
        if let Ok(value) = env::var(key) {
            if !value.is_empty() {
                secrets.insert(key.to_string(), value);
            }
        }
    }

    /// Check if a secret exists
    pub fn has_key(&self, key: &str) -> bool {
        let inner = self.inner.lock().unwrap();
        inner.secrets.contains_key(key)
    }

    /// Get a secret by key
    pub fn get_key(&self, key: &str) -> Option<String> {
        let inner = self.inner.lock().unwrap();
        inner.secrets.get(key).cloned()
    }

    /// Get a secret by platform name
    ///
    /// Maps platform names to their environment variable keys
    pub fn get_platform_key(&self, platform: &str) -> Option<String> {
        let env_key = match platform.to_lowercase().as_str() {
            "claude" | "anthropic" => "ANTHROPIC_API_KEY",
            "openai" | "gpt" => "OPENAI_API_KEY",
            "cursor" => "CURSOR_API_KEY",
            "gemini" | "google" => "GEMINI_API_KEY",
            "copilot" | "github" => "GITHUB_TOKEN",
            _ => return None,
        };

        self.get_key(env_key)
    }

    /// Set a secret (runtime only, not persisted)
    pub fn set_key(&self, key: String, value: String) {
        let mut inner = self.inner.lock().unwrap();
        inner.secrets.insert(key, value);
    }

    /// List available secret keys (not values)
    pub fn available_keys(&self) -> Vec<String> {
        let inner = self.inner.lock().unwrap();
        inner.secrets.keys().cloned().collect()
    }

    /// Check which platforms have credentials available
    pub fn available_platforms(&self) -> Vec<String> {
        let platforms = [
            ("claude", "ANTHROPIC_API_KEY"),
            ("openai", "OPENAI_API_KEY"),
            ("cursor", "CURSOR_API_KEY"),
            ("gemini", "GEMINI_API_KEY"),
            ("copilot", "GITHUB_TOKEN"),
        ];

        platforms
            .iter()
            .filter_map(|(platform, key)| {
                if self.has_key(key) {
                    Some(platform.to_string())
                } else {
                    None
                }
            })
            .collect()
    }

    /// Clear all secrets (for security)
    pub fn clear(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.secrets.clear();
        log::debug!("Cleared all secrets");
    }

    /// Reload secrets from environment
    pub fn reload(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.secrets.clear();

        Self::load_from_env(&mut inner.secrets, "ANTHROPIC_API_KEY");
        Self::load_from_env(&mut inner.secrets, "OPENAI_API_KEY");
        Self::load_from_env(&mut inner.secrets, "CURSOR_API_KEY");
        Self::load_from_env(&mut inner.secrets, "GEMINI_API_KEY");
        Self::load_from_env(&mut inner.secrets, "GITHUB_TOKEN");

        log::debug!("Reloaded {} secrets from environment", inner.secrets.len());
    }
}

impl Default for SecretsManager {
    fn default() -> Self {
        Self::new()
    }
}

// Implement Debug but never show secret values
impl std::fmt::Debug for SecretsManager {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let keys = self.available_keys();
        f.debug_struct("SecretsManager")
            .field("available_keys", &keys.len())
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_load_from_env() {
        // Set a test environment variable
        unsafe {
            env::set_var("TEST_SECRET_KEY", "test_value");
        }

        let mut secrets = HashMap::new();
        SecretsManager::load_from_env(&mut secrets, "TEST_SECRET_KEY");

        assert_eq!(secrets.get("TEST_SECRET_KEY"), Some(&"test_value".to_string()));

        // Clean up
        unsafe {
            env::remove_var("TEST_SECRET_KEY");
        }
    }

    #[test]
    fn test_has_key() {
        let manager = SecretsManager::new();

        // Set a test key
        manager.set_key("test_key".to_string(), "test_value".to_string());

        assert!(manager.has_key("test_key"));
        assert!(!manager.has_key("nonexistent_key"));
    }

    #[test]
    fn test_get_key() {
        let manager = SecretsManager::new();

        manager.set_key("test_key".to_string(), "test_value".to_string());

        assert_eq!(manager.get_key("test_key"), Some("test_value".to_string()));
        assert_eq!(manager.get_key("nonexistent_key"), None);
    }

    #[test]
    fn test_platform_mapping() {
        let manager = SecretsManager::new();

        // Set up test credentials
        manager.set_key("ANTHROPIC_API_KEY".to_string(), "test1".to_string());
        manager.set_key("OPENAI_API_KEY".to_string(), "test2".to_string());

        assert_eq!(
            manager.get_platform_key("claude"),
            Some("test1".to_string())
        );
        assert_eq!(
            manager.get_platform_key("openai"),
            Some("test2".to_string())
        );
        assert_eq!(manager.get_platform_key("unknown"), None);
    }

    #[test]
    fn test_available_platforms() {
        let manager = SecretsManager::new();

        manager.set_key("ANTHROPIC_API_KEY".to_string(), "test".to_string());
        manager.set_key("OPENAI_API_KEY".to_string(), "test".to_string());

        let platforms = manager.available_platforms();
        assert!(platforms.contains(&"claude".to_string()));
        assert!(platforms.contains(&"openai".to_string()));
        assert!(!platforms.contains(&"unknown".to_string()));
    }

    #[test]
    fn test_clear() {
        let manager = SecretsManager::new();

        manager.set_key("test_key".to_string(), "test_value".to_string());
        assert!(manager.has_key("test_key"));

        manager.clear();
        assert!(!manager.has_key("test_key"));
    }

    #[test]
    fn test_debug_no_secrets() {
        let manager = SecretsManager::new();
        manager.set_key("secret_key".to_string(), "secret_value".to_string());

        let debug_str = format!("{:?}", manager);

        // Should not contain the actual secret value
        assert!(!debug_str.contains("secret_value"));
        assert!(debug_str.contains("SecretsManager"));
    }
}
