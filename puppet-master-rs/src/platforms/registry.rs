//! Central platform runner registry
//!
//! This module provides a centralized registry for platform runners,
//! enabling runtime lookup, health checking, and availability queries.
//!
//! # Architecture
//!
//! - Singleton-like pattern using lazy_static initialization
//! - Thread-safe registration and lookup
//! - Integration with health monitoring and auth status
//! - Automatic filtering of unavailable platforms

use crate::platforms::{
    create_runner, AuthStatusChecker, HealthMonitor, PlatformRunner,
};
use crate::types::Platform;
use anyhow::{Context, Result};
use log::{debug, info, warn};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Platform runner registry entry
struct RegistryEntry {
    /// The platform runner (stored as Arc for cloning)
    runner: Arc<dyn PlatformRunner>,
    /// Whether this runner is enabled
    enabled: bool,
    /// Display name
    name: String,
}

/// Central registry for platform runners
pub struct PlatformRegistry {
    /// Registered runners
    runners: Arc<RwLock<HashMap<Platform, RegistryEntry>>>,
    /// Health monitor
    health_monitor: Arc<HealthMonitor>,
    /// Auth status checker
    auth_checker: Arc<AuthStatusChecker>,
}

impl PlatformRegistry {
    /// Create a new platform registry
    pub fn new() -> Self {
        Self {
            runners: Arc::new(RwLock::new(HashMap::new())),
            health_monitor: Arc::new(HealthMonitor::new()),
            auth_checker: Arc::new(AuthStatusChecker::new()),
        }
    }

    /// Initialize with default runners for all platforms
    pub async fn init_default(&self) -> Result<()> {
        info!("Initializing platform registry with default runners");

        for platform in Platform::all() {
            let runner = create_runner(*platform);
            let runner_arc: Arc<dyn PlatformRunner> = Arc::from(runner);
            let name = format!("{}", platform);

            self.register(*platform, runner_arc, name).await?;
        }

        info!("Platform registry initialized with {} runners", Platform::all().len());
        Ok(())
    }

    /// Register a platform runner
    pub async fn register(
        &self,
        platform: Platform,
        runner: Arc<dyn PlatformRunner>,
        name: impl Into<String>,
    ) -> Result<()> {
        let name = name.into();
        debug!("Registering platform runner: {} ({})", name, platform);

        let mut runners = self.runners.write().await;
        runners.insert(
            platform,
            RegistryEntry {
                runner,
                enabled: true,
                name,
            },
        );

        Ok(())
    }

    /// Unregister a platform runner
    pub async fn unregister(&self, platform: Platform) -> Result<()> {
        debug!("Unregistering platform runner: {}", platform);

        let mut runners = self.runners.write().await;
        runners
            .remove(&platform)
            .context(format!("Platform {} not registered", platform))?;

        Ok(())
    }

    /// Get a runner for a platform
    pub async fn get(&self, platform: Platform) -> Option<Arc<dyn PlatformRunner>> {
        let runners = self.runners.read().await;
        runners.get(&platform).map(|entry| Arc::clone(&entry.runner))
    }

    /// Check if a platform is registered
    pub async fn is_registered(&self, platform: Platform) -> bool {
        let runners = self.runners.read().await;
        runners.contains_key(&platform)
    }

    /// Enable a platform runner
    pub async fn enable(&self, platform: Platform) -> Result<()> {
        debug!("Enabling platform runner: {}", platform);

        let mut runners = self.runners.write().await;
        let entry = runners
            .get_mut(&platform)
            .context(format!("Platform {} not registered", platform))?;

        entry.enabled = true;
        Ok(())
    }

    /// Disable a platform runner
    pub async fn disable(&self, platform: Platform) -> Result<()> {
        debug!("Disabling platform runner: {}", platform);

        let mut runners = self.runners.write().await;
        let entry = runners
            .get_mut(&platform)
            .context(format!("Platform {} not registered", platform))?;

        entry.enabled = false;
        Ok(())
    }

    /// Check if a platform is enabled
    pub async fn is_enabled(&self, platform: Platform) -> bool {
        let runners = self.runners.read().await;
        runners.get(&platform).map_or(false, |entry| entry.enabled)
    }

    /// List all registered platforms
    pub async fn list_all(&self) -> Vec<Platform> {
        let runners = self.runners.read().await;
        runners.keys().copied().collect()
    }

    /// List enabled platforms
    pub async fn list_enabled(&self) -> Vec<Platform> {
        let runners = self.runners.read().await;
        runners
            .iter()
            .filter_map(|(platform, entry)| {
                if entry.enabled {
                    Some(*platform)
                } else {
                    None
                }
            })
            .collect()
    }

    /// List available platforms (enabled + healthy + authenticated)
    pub async fn list_available(&self) -> Vec<Platform> {
        let enabled = self.list_enabled().await;
        let mut available = Vec::new();

        for platform in enabled {
            // Check health
            if !self.health_monitor.is_available(platform).await {
                debug!("Platform {} not available (unhealthy)", platform);
                continue;
            }

            // Check authentication
            let result = self.auth_checker.check_platform(platform).await;
            if !result.authenticated {
                debug!("Platform {} not available (not authenticated)", platform);
                continue;
            }

            available.push(platform);
        }

        debug!("Available platforms: {:?}", available);
        available
    }

    /// Get platform information
    pub async fn get_info(&self, platform: Platform) -> Option<PlatformInfo> {
        let runners = self.runners.read().await;
        runners.get(&platform).map(|entry| PlatformInfo {
            platform,
            name: entry.name.clone(),
            enabled: entry.enabled,
        })
    }

    /// Get information for all platforms
    pub async fn get_all_info(&self) -> Vec<PlatformInfo> {
        let runners = self.runners.read().await;
        runners
            .iter()
            .map(|(platform, entry)| PlatformInfo {
                platform: *platform,
                name: entry.name.clone(),
                enabled: entry.enabled,
            })
            .collect()
    }

    /// Check availability of all platforms
    pub async fn check_all_availability(&self) -> HashMap<Platform, bool> {
        let mut availability = HashMap::new();
        let registered = self.list_all().await;

        for platform in registered {
            let available = self.is_available(platform).await;
            availability.insert(platform, available);
        }

        availability
    }

    /// Check if a specific platform is available
    pub async fn is_available(&self, platform: Platform) -> bool {
        // Check if registered and enabled
        if !self.is_enabled(platform).await {
            return false;
        }

        // Check health
        if !self.health_monitor.is_available(platform).await {
            return false;
        }

        // Check authentication
        let result = self.auth_checker.check_platform(platform).await;
        result.authenticated
    }

    /// Get health monitor
    pub fn health_monitor(&self) -> Arc<HealthMonitor> {
        Arc::clone(&self.health_monitor)
    }

    /// Get auth checker
    pub fn auth_checker(&self) -> Arc<AuthStatusChecker> {
        Arc::clone(&self.auth_checker)
    }

    /// Clear all registrations
    pub async fn clear(&self) {
        info!("Clearing platform registry");
        let mut runners = self.runners.write().await;
        runners.clear();
    }
}

impl Default for PlatformRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Platform information
#[derive(Debug, Clone)]
pub struct PlatformInfo {
    /// Platform identifier
    pub platform: Platform,
    /// Display name
    pub name: String,
    /// Whether the platform is enabled
    pub enabled: bool,
}

/// Global platform registry instance
static REGISTRY: once_cell::sync::Lazy<Arc<tokio::sync::Mutex<Option<PlatformRegistry>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(tokio::sync::Mutex::new(None)));

/// Initialize the global platform registry
pub async fn init_global_registry() -> Result<()> {
    let mut registry = REGISTRY.lock().await;
    if registry.is_none() {
        let new_registry = PlatformRegistry::new();
        new_registry.init_default().await?;
        *registry = Some(new_registry);
        info!("Global platform registry initialized");
    }
    Ok(())
}

/// Get the global platform registry
pub async fn global_registry() -> Result<Arc<PlatformRegistry>> {
    // Ensure registry is initialized
    init_global_registry().await?;

    let registry = REGISTRY.lock().await;
    match registry.as_ref() {
        Some(r) => {
            // Create a new PlatformRegistry that shares the same internals
            Ok(Arc::new(PlatformRegistry {
                runners: Arc::clone(&r.runners),
                health_monitor: Arc::clone(&r.health_monitor),
                auth_checker: Arc::clone(&r.auth_checker),
            }))
        }
        None => anyhow::bail!("Registry not initialized"),
    }
}

/// Get a runner from the global registry
pub async fn get_runner(platform: Platform) -> Result<Arc<dyn PlatformRunner>> {
    let registry = global_registry().await?;
    registry
        .get(platform)
        .await
        .context(format!("Platform {} not registered", platform))
}

/// List all available platforms from global registry
pub async fn list_available_platforms() -> Result<Vec<Platform>> {
    let registry = global_registry().await?;
    Ok(registry.list_available().await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_registry_creation() {
        let registry = PlatformRegistry::new();
        assert!(registry.list_all().await.is_empty());
    }

    #[tokio::test]
    async fn test_register_platform() {
        let registry = PlatformRegistry::new();
        let runner = Arc::from(create_runner(Platform::Cursor));

        registry
            .register(Platform::Cursor, runner, "Cursor")
            .await
            .unwrap();

        assert!(registry.is_registered(Platform::Cursor).await);
    }

    #[tokio::test]
    async fn test_unregister_platform() {
        let registry = PlatformRegistry::new();
        let runner = Arc::from(create_runner(Platform::Cursor));

        registry
            .register(Platform::Cursor, runner, "Cursor")
            .await
            .unwrap();
        registry.unregister(Platform::Cursor).await.unwrap();

        assert!(!registry.is_registered(Platform::Cursor).await);
    }

    #[tokio::test]
    async fn test_enable_disable() {
        let registry = PlatformRegistry::new();
        let runner = Arc::from(create_runner(Platform::Cursor));

        registry
            .register(Platform::Cursor, runner, "Cursor")
            .await
            .unwrap();

        assert!(registry.is_enabled(Platform::Cursor).await);

        registry.disable(Platform::Cursor).await.unwrap();
        assert!(!registry.is_enabled(Platform::Cursor).await);

        registry.enable(Platform::Cursor).await.unwrap();
        assert!(registry.is_enabled(Platform::Cursor).await);
    }

    #[tokio::test]
    async fn test_list_enabled() {
        let registry = PlatformRegistry::new();

        for platform in [Platform::Cursor, Platform::Codex, Platform::Claude] {
            let runner = Arc::from(create_runner(platform));
            registry.register(platform, runner, format!("{}", platform)).await.unwrap();
        }

        registry.disable(Platform::Codex).await.unwrap();

        let enabled = registry.list_enabled().await;
        assert_eq!(enabled.len(), 2);
        assert!(enabled.contains(&Platform::Cursor));
        assert!(enabled.contains(&Platform::Claude));
        assert!(!enabled.contains(&Platform::Codex));
    }

    #[tokio::test]
    async fn test_init_default() {
        let registry = PlatformRegistry::new();
        registry.init_default().await.unwrap();

        let all = registry.list_all().await;
        assert_eq!(all.len(), 5);

        for platform in Platform::all() {
            assert!(registry.is_registered(*platform).await);
            assert!(registry.is_enabled(*platform).await);
        }
    }

    #[tokio::test]
    async fn test_get_info() {
        let registry = PlatformRegistry::new();
        let runner = Arc::from(create_runner(Platform::Cursor));

        registry
            .register(Platform::Cursor, runner, "Cursor IDE")
            .await
            .unwrap();

        let info = registry.get_info(Platform::Cursor).await.unwrap();
        assert_eq!(info.platform, Platform::Cursor);
        assert_eq!(info.name, "Cursor IDE");
        assert!(info.enabled);
    }

    #[tokio::test]
    async fn test_clear() {
        let registry = PlatformRegistry::new();
        registry.init_default().await.unwrap();

        assert_eq!(registry.list_all().await.len(), 5);

        registry.clear().await;
        assert!(registry.list_all().await.is_empty());
    }

    #[tokio::test]
    async fn test_global_registry() {
        // This test should not interfere with others because each test gets its own instance
        let result = init_global_registry().await;
        assert!(result.is_ok());

        let registry = global_registry().await.unwrap();
        let platforms = registry.list_all().await;
        assert_eq!(platforms.len(), 5);
    }
}
