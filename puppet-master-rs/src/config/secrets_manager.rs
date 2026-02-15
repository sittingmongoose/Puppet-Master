//! Secrets Manager
//!
//! Manages optional credential overrides for CLI-based auth flows:
//! - Runtime-only secrets map
//! - Optional compatibility lookup for legacy env vars
//! - Never log or persist secrets

use std::collections::HashMap;
use std::env;
use std::sync::{Arc, Mutex};

// DRY:DATA:SecretsManager
/// Thread-safe secrets manager
#[derive(Clone)]
pub struct SecretsManager {
    inner: Arc<Mutex<SecretsManagerInner>>,
}

struct SecretsManagerInner {
    secrets: HashMap<String, String>,
}

impl SecretsManager {
    // DRY:FN:new
    /// Create a new secrets manager.
    ///
    /// Subscription/browser auth is the default policy, so we do not preload
    /// API-key-style environment variables into runtime state.
    pub fn new() -> Self {
        let secrets = HashMap::new();
        log::debug!(
            "Initialized secrets manager with {} runtime secrets",
            secrets.len()
        );

        Self {
            inner: Arc::new(Mutex::new(SecretsManagerInner { secrets })),
        }
    }

    /// Load a secret from environment variable
    #[cfg(test)]
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
    /// Uses runtime secrets first, then falls back to legacy environment
    /// variables for backward compatibility with older CI/headless setups.
    pub fn get_platform_key(&self, platform: &str) -> Option<String> {
        let env_keys = match platform.to_lowercase().as_str() {
            "claude" | "anthropic" => &["ANTHROPIC_API_KEY"][..],
            "codex" | "openai" | "gpt" => &["CODEX_API_KEY", "OPENAI_API_KEY"][..],
            "cursor" => &["CURSOR_API_KEY"][..],
            "gemini" | "google" => &["GEMINI_API_KEY", "GOOGLE_API_KEY"][..],
            "copilot" | "github" => &["GH_TOKEN", "GITHUB_TOKEN"][..],
            _ => return None,
        };

        for env_key in env_keys {
            if let Some(value) = self.get_key(env_key) {
                return Some(value);
            }
            if let Ok(value) = env::var(env_key) {
                if !value.is_empty() {
                    return Some(value);
                }
            }
        }
        None
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
        crate::platforms::platform_specs::PLATFORM_ID_STRS
            .iter()
            .filter_map(|platform| {
                if self.get_platform_key(platform).is_some() {
                    Some((*platform).to_string())
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

    /// Reload runtime secrets (keeps subscription-auth default, no env preload).
    pub fn reload(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.secrets.clear();
        log::debug!("Reloaded runtime secrets (count: {})", inner.secrets.len());
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

        assert_eq!(
            secrets.get("TEST_SECRET_KEY"),
            Some(&"test_value".to_string())
        );

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
        manager.set_key("CODEX_API_KEY".to_string(), "test2".to_string());

        assert_eq!(
            manager.get_platform_key("claude"),
            Some("test1".to_string())
        );
        assert_eq!(manager.get_platform_key("codex"), Some("test2".to_string()));
        assert_eq!(manager.get_platform_key("unknown"), None);
    }

    #[test]
    fn test_available_platforms() {
        let manager = SecretsManager::new();

        manager.set_key("ANTHROPIC_API_KEY".to_string(), "test".to_string());
        manager.set_key("CODEX_API_KEY".to_string(), "test".to_string());

        let platforms = manager.available_platforms();
        assert!(platforms.contains(&"claude".to_string()));
        assert!(platforms.contains(&"codex".to_string()));
        assert!(!platforms.contains(&"unknown".to_string()));
    }

    #[test]
    fn test_platform_mapping_env_fallback() {
        unsafe {
            env::set_var("OPENAI_API_KEY", "legacy-openai-key");
        }

        let manager = SecretsManager::new();
        assert_eq!(
            manager.get_platform_key("openai"),
            Some("legacy-openai-key".to_string())
        );

        unsafe {
            env::remove_var("OPENAI_API_KEY");
        }
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
