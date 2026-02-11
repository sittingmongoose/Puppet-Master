//! Platform health monitoring and circuit breaker implementation
//!
//! This module provides real-time health monitoring for AI platforms, tracking:
//! - Availability status
//! - Consecutive failure counts
//! - Circuit breaker state
//! - Last error information
//! - Automatic recovery and retry logic

use crate::types::Platform;
use chrono::{DateTime, Duration, Utc};
use log::{debug, info, warn};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Health monitoring system for all platforms
#[derive(Clone)]
pub struct HealthMonitor {
    /// Platform health status map
    status: Arc<RwLock<HashMap<Platform, PlatformHealth>>>,
    
    /// Configuration for health checks
    config: Arc<HealthConfig>,
}

impl HealthMonitor {
    /// Creates a new health monitor with default configuration
    pub fn new() -> Self {
        Self::with_config(HealthConfig::default())
    }
    
    /// Creates a new health monitor with custom configuration
    pub fn with_config(config: HealthConfig) -> Self {
        let mut status = HashMap::new();
        
        // Initialize health status for all platforms
        for platform in Platform::all() {
            status.insert(*platform, PlatformHealth::new(*platform));
        }
        
        Self {
            status: Arc::new(RwLock::new(status)),
            config: Arc::new(config),
        }
    }
    
    /// Records a successful execution for a platform
    pub async fn record_success(&self, platform: Platform) {
        let mut status = self.status.write().await;
        
        if let Some(health) = status.get_mut(&platform) {
            health.consecutive_failures = 0;
            health.available = true;
            health.last_check = Utc::now();
            health.last_success = Some(Utc::now());
            
            // Close circuit breaker if open
            if health.circuit_breaker_open {
                info!("Circuit breaker closed for platform: {}", platform);
                health.circuit_breaker_open = false;
                health.circuit_breaker_opened_at = None;
            }
            
            debug!("Recorded success for platform: {}", platform);
        }
    }
    
    /// Records a failed execution for a platform
    pub async fn record_failure(&self, platform: Platform, error: String) {
        let mut status = self.status.write().await;
        
        if let Some(health) = status.get_mut(&platform) {
            health.consecutive_failures += 1;
            health.last_check = Utc::now();
            health.last_error = Some(error.clone());
            health.last_failure = Some(Utc::now());
            
            // Open circuit breaker if threshold reached
            if health.consecutive_failures >= self.config.circuit_breaker_threshold {
                if !health.circuit_breaker_open {
                    warn!(
                        "Circuit breaker opened for platform {} after {} consecutive failures",
                        platform, health.consecutive_failures
                    );
                    health.circuit_breaker_open = true;
                    health.circuit_breaker_opened_at = Some(Utc::now());
                    health.available = false;
                }
            }
            
            debug!(
                "Recorded failure for platform {}: {} (consecutive: {})",
                platform, error, health.consecutive_failures
            );
        }
    }
    
    /// Checks if a platform is available for use
    pub async fn is_available(&self, platform: Platform) -> bool {
        let status = self.status.read().await;
        
        if let Some(health) = status.get(&platform) {
            // If circuit breaker is open, check if enough time has passed for retry
            if health.circuit_breaker_open {
                if let Some(opened_at) = health.circuit_breaker_opened_at {
                    let elapsed = Utc::now().signed_duration_since(opened_at);
                    
                    // Allow retry after cooldown period
                    if elapsed >= self.config.circuit_breaker_cooldown {
                        return true; // Allow one retry attempt
                    }
                    return false;
                }
            }
            
            health.available
        } else {
            false
        }
    }
    
    /// Gets the health status for a platform
    pub async fn get_health(&self, platform: Platform) -> Option<PlatformHealth> {
        let status = self.status.read().await;
        status.get(&platform).cloned()
    }
    
    /// Gets health status for all platforms
    pub async fn get_all_health(&self) -> HashMap<Platform, PlatformHealth> {
        let status = self.status.read().await;
        status.clone()
    }
    
    /// Manually sets availability for a platform
    pub async fn set_availability(&self, platform: Platform, available: bool) {
        let mut status = self.status.write().await;
        
        if let Some(health) = status.get_mut(&platform) {
            health.available = available;
            health.last_check = Utc::now();
            
            if available {
                health.consecutive_failures = 0;
                health.circuit_breaker_open = false;
                health.circuit_breaker_opened_at = None;
            }
            
            info!(
                "Manually set availability for platform {} to {}",
                platform, available
            );
        }
    }
    
    /// Resets health status for a platform
    pub async fn reset_health(&self, platform: Platform) {
        let mut status = self.status.write().await;
        
        if let Some(health) = status.get_mut(&platform) {
            *health = PlatformHealth::new(platform);
            info!("Reset health status for platform: {}", platform);
        }
    }
    
    /// Gets platforms that are currently available
    pub async fn get_available_platforms(&self) -> Vec<Platform> {
        let status = self.status.read().await;
        
        status
            .iter()
            .filter_map(|(platform, health)| {
                if health.available && !health.circuit_breaker_open {
                    Some(*platform)
                } else {
                    None
                }
            })
            .collect()
    }
    
    /// Gets platforms with open circuit breakers
    pub async fn get_circuit_breaker_platforms(&self) -> Vec<Platform> {
        let status = self.status.read().await;
        
        status
            .iter()
            .filter_map(|(platform, health)| {
                if health.circuit_breaker_open {
                    Some(*platform)
                } else {
                    None
                }
            })
            .collect()
    }
}

impl Default for HealthMonitor {
    fn default() -> Self {
        Self::new()
    }
}

/// Health status for a single platform
#[derive(Debug, Clone)]
pub struct PlatformHealth {
    /// Platform identifier
    pub platform: Platform,
    
    /// Whether platform is available
    pub available: bool,
    
    /// Timestamp of last health check
    pub last_check: DateTime<Utc>,
    
    /// Number of consecutive failures
    pub consecutive_failures: u32,
    
    /// Whether circuit breaker is open
    pub circuit_breaker_open: bool,
    
    /// When circuit breaker was opened
    pub circuit_breaker_opened_at: Option<DateTime<Utc>>,
    
    /// Last error message
    pub last_error: Option<String>,
    
    /// Last successful execution
    pub last_success: Option<DateTime<Utc>>,
    
    /// Last failed execution
    pub last_failure: Option<DateTime<Utc>>,
}

impl PlatformHealth {
    /// Creates a new platform health status
    pub fn new(platform: Platform) -> Self {
        Self {
            platform,
            available: true,
            last_check: Utc::now(),
            consecutive_failures: 0,
            circuit_breaker_open: false,
            circuit_breaker_opened_at: None,
            last_error: None,
            last_success: None,
            last_failure: None,
        }
    }
    
    /// Gets success rate as percentage (0-100)
    pub fn success_rate(&self) -> f64 {
        if self.last_success.is_some() || self.last_failure.is_some() {
            if self.consecutive_failures == 0 {
                100.0
            } else {
                0.0
            }
        } else {
            0.0 // No data yet
        }
    }
    
    /// Checks if platform is healthy (available and no open circuit breaker)
    pub fn is_healthy(&self) -> bool {
        self.available && !self.circuit_breaker_open
    }
    
    /// Gets time since last check
    pub fn time_since_last_check(&self) -> Duration {
        Utc::now().signed_duration_since(self.last_check)
    }
}

/// Configuration for health monitoring
#[derive(Debug, Clone)]
pub struct HealthConfig {
    /// Number of consecutive failures before opening circuit breaker
    pub circuit_breaker_threshold: u32,
    
    /// Cooldown period before allowing retry after circuit breaker opens
    pub circuit_breaker_cooldown: Duration,
    
    /// Interval for automatic health checks
    pub health_check_interval: Duration,
}

impl Default for HealthConfig {
    fn default() -> Self {
        Self {
            circuit_breaker_threshold: 3,
            circuit_breaker_cooldown: Duration::minutes(5),
            health_check_interval: Duration::minutes(1),
        }
    }
}

impl HealthConfig {
    /// Creates a new health configuration
    pub fn new(
        circuit_breaker_threshold: u32,
        circuit_breaker_cooldown: Duration,
        health_check_interval: Duration,
    ) -> Self {
        Self {
            circuit_breaker_threshold,
            circuit_breaker_cooldown,
            health_check_interval,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_record_success() {
        let monitor = HealthMonitor::new();
        
        monitor.record_success(Platform::Cursor).await;
        
        let health = monitor.get_health(Platform::Cursor).await.unwrap();
        assert_eq!(health.consecutive_failures, 0);
        assert!(health.available);
    }

    #[tokio::test]
    async fn test_record_failure() {
        let monitor = HealthMonitor::new();
        
        monitor.record_failure(Platform::Cursor, "Test error".to_string()).await;
        
        let health = monitor.get_health(Platform::Cursor).await.unwrap();
        assert_eq!(health.consecutive_failures, 1);
        assert!(health.last_error.is_some());
    }

    #[tokio::test]
    async fn test_circuit_breaker() {
        let config = HealthConfig {
            circuit_breaker_threshold: 2,
            circuit_breaker_cooldown: Duration::seconds(1),
            health_check_interval: Duration::minutes(1),
        };
        let monitor = HealthMonitor::with_config(config);
        
        // First failure
        monitor.record_failure(Platform::Cursor, "Error 1".to_string()).await;
        assert!(monitor.is_available(Platform::Cursor).await);
        
        // Second failure - should open circuit breaker
        monitor.record_failure(Platform::Cursor, "Error 2".to_string()).await;
        
        let health = monitor.get_health(Platform::Cursor).await.unwrap();
        assert!(health.circuit_breaker_open);
        
        // Should be unavailable now
        assert!(!monitor.is_available(Platform::Cursor).await);
        
        // Wait for cooldown
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;
        
        // Should allow retry after cooldown
        assert!(monitor.is_available(Platform::Cursor).await);
        
        // Success should close circuit breaker
        monitor.record_success(Platform::Cursor).await;
        
        let health = monitor.get_health(Platform::Cursor).await.unwrap();
        assert!(!health.circuit_breaker_open);
        assert_eq!(health.consecutive_failures, 0);
    }

    #[tokio::test]
    async fn test_get_available_platforms() {
        let monitor = HealthMonitor::new();
        
        // Initially all should be available
        let available = monitor.get_available_platforms().await;
        assert_eq!(available.len(), 5);
        
        // Make one unavailable
        monitor.set_availability(Platform::Cursor, false).await;
        
        let available = monitor.get_available_platforms().await;
        assert_eq!(available.len(), 4);
        assert!(!available.contains(&Platform::Cursor));
    }

    #[tokio::test]
    async fn test_health_reset() {
        let monitor = HealthMonitor::new();
        
        monitor.record_failure(Platform::Cursor, "Error".to_string()).await;
        monitor.record_failure(Platform::Cursor, "Error".to_string()).await;
        
        let health = monitor.get_health(Platform::Cursor).await.unwrap();
        assert_eq!(health.consecutive_failures, 2);
        
        monitor.reset_health(Platform::Cursor).await;
        
        let health = monitor.get_health(Platform::Cursor).await.unwrap();
        assert_eq!(health.consecutive_failures, 0);
        assert!(health.available);
    }
}
