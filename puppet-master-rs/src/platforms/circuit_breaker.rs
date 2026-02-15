//! Circuit breaker resilience pattern for platform operations
//!
//! This module implements a circuit breaker pattern to prevent cascading failures
//! and provide graceful degradation when a platform becomes unavailable.
//!
//! # States
//!
//! - **Closed**: Normal operation, all requests pass through
//! - **Open**: Failure threshold reached, all requests fail fast
//! - **HalfOpen**: Testing recovery, limited requests allowed
//!
//! # Stagnation Detection
//!
//! If a circuit breaker remains open for too long without recovery attempts,
//! an alert is triggered to notify operators.

use crate::types::Platform;
use anyhow::{Result, anyhow};
use chrono::{DateTime, Duration, Utc};
use log::{debug, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::future::Future;
use std::sync::Arc;
use tokio::sync::RwLock;

// DRY:DATA:CircuitState
/// Circuit breaker state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CircuitState {
    /// Normal operation - all calls allowed
    Closed,
    /// Failure threshold exceeded - all calls fail fast
    Open,
    /// Testing recovery - limited calls allowed
    HalfOpen,
}

impl std::fmt::Display for CircuitState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CircuitState::Closed => write!(f, "closed"),
            CircuitState::Open => write!(f, "open"),
            CircuitState::HalfOpen => write!(f, "half-open"),
        }
    }
}

// DRY:DATA:CircuitBreakerConfig
/// Configuration for circuit breaker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreakerConfig {
    /// Number of consecutive failures before opening circuit
    pub failure_threshold: u32,
    /// Number of consecutive successes before closing from half-open
    pub success_threshold: u32,
    /// Timeout before attempting recovery (moving to half-open)
    pub recovery_timeout: Duration,
    /// Maximum time circuit can remain open before stagnation alert
    pub stagnation_timeout: Duration,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            success_threshold: 2,
            recovery_timeout: Duration::minutes(5),
            stagnation_timeout: Duration::hours(1),
        }
    }
}

/// Circuit breaker state tracking
#[derive(Debug, Clone)]
struct CircuitBreakerState {
    /// Current state
    state: CircuitState,
    /// Consecutive failure count
    failure_count: u32,
    /// Consecutive success count (in half-open state)
    success_count: u32,
    /// Last failure timestamp
    last_failure_time: Option<DateTime<Utc>>,
    /// Last success timestamp
    last_success_time: Option<DateTime<Utc>>,
    /// When circuit was opened
    opened_at: Option<DateTime<Utc>>,
    /// Last state transition
    last_state_change: DateTime<Utc>,
    /// Stagnation alert already sent
    stagnation_alerted: bool,
}

impl CircuitBreakerState {
    fn new() -> Self {
        Self {
            state: CircuitState::Closed,
            failure_count: 0,
            success_count: 0,
            last_failure_time: None,
            last_success_time: None,
            opened_at: None,
            last_state_change: Utc::now(),
            stagnation_alerted: false,
        }
    }
}

// DRY:DATA:CircuitBreaker
/// Circuit breaker for platform operations
pub struct CircuitBreaker {
    /// Platform this circuit breaker protects
    platform: Platform,
    /// Configuration
    config: CircuitBreakerConfig,
    /// Current state
    state: Arc<RwLock<CircuitBreakerState>>,
}

impl CircuitBreaker {
    /// Create a new circuit breaker
    pub fn new(platform: Platform, config: CircuitBreakerConfig) -> Self {
        Self {
            platform,
            config,
            state: Arc::new(RwLock::new(CircuitBreakerState::new())),
        }
    }

    /// Create with default configuration
    pub fn with_defaults(platform: Platform) -> Self {
        Self::new(platform, CircuitBreakerConfig::default())
    }

    /// Get current circuit state
    pub async fn get_state(&self) -> CircuitState {
        let state = self.state.read().await;
        state.state
    }

    /// Get detailed state information
    pub async fn get_info(&self) -> CircuitBreakerInfo {
        let state = self.state.read().await;
        CircuitBreakerInfo {
            platform: self.platform,
            state: state.state,
            failure_count: state.failure_count,
            success_count: state.success_count,
            last_failure_time: state.last_failure_time,
            last_success_time: state.last_success_time,
            opened_at: state.opened_at,
            last_state_change: state.last_state_change,
        }
    }

    /// Record a successful operation
    pub async fn record_success(&self) {
        let mut state = self.state.write().await;
        state.last_success_time = Some(Utc::now());
        state.failure_count = 0;

        match state.state {
            CircuitState::HalfOpen => {
                state.success_count += 1;
                debug!(
                    "{} circuit breaker: success in half-open ({}/{})",
                    self.platform, state.success_count, self.config.success_threshold
                );

                if state.success_count >= self.config.success_threshold {
                    self.transition_to_closed(&mut state);
                }
            }
            CircuitState::Closed => {
                debug!("{} circuit breaker: success in closed state", self.platform);
            }
            CircuitState::Open => {
                // Success while open shouldn't happen, but reset if it does
                warn!(
                    "{} circuit breaker: unexpected success while open, closing",
                    self.platform
                );
                self.transition_to_closed(&mut state);
            }
        }
    }

    /// Record a failed operation
    pub async fn record_failure(&self) {
        let mut state = self.state.write().await;
        state.last_failure_time = Some(Utc::now());
        state.success_count = 0;

        match state.state {
            CircuitState::Closed => {
                state.failure_count += 1;
                debug!(
                    "{} circuit breaker: failure in closed ({}/{})",
                    self.platform, state.failure_count, self.config.failure_threshold
                );

                if state.failure_count >= self.config.failure_threshold {
                    self.transition_to_open(&mut state);
                }
            }
            CircuitState::HalfOpen => {
                warn!(
                    "{} circuit breaker: failure in half-open, reopening",
                    self.platform
                );
                self.transition_to_open(&mut state);
            }
            CircuitState::Open => {
                debug!("{} circuit breaker: failure while open", self.platform);
            }
        }
    }

    /// Execute a function with circuit breaker protection
    pub async fn execute<F, T, Fut>(&self, f: F) -> Result<T>
    where
        F: FnOnce() -> Fut,
        Fut: Future<Output = Result<T>>,
    {
        // Check if we should allow the call
        {
            let mut state = self.state.write().await;

            match state.state {
                CircuitState::Open => {
                    // Check if we should transition to half-open
                    if let Some(opened_at) = state.opened_at {
                        let elapsed = Utc::now().signed_duration_since(opened_at);
                        if elapsed >= self.config.recovery_timeout {
                            self.transition_to_half_open(&mut state);
                        } else {
                            // Check for stagnation
                            if elapsed >= self.config.stagnation_timeout
                                && !state.stagnation_alerted
                            {
                                warn!(
                                    "{} circuit breaker: stagnated in open state for {:?}",
                                    self.platform, elapsed
                                );
                                state.stagnation_alerted = true;
                            }

                            return Err(anyhow!(
                                "{} circuit breaker is open (will retry in {:?})",
                                self.platform,
                                self.config.recovery_timeout - elapsed
                            ));
                        }
                    }
                }
                CircuitState::Closed | CircuitState::HalfOpen => {
                    // Allow the call
                }
            }
        }

        // Execute the function
        match f().await {
            Ok(result) => {
                self.record_success().await;
                Ok(result)
            }
            Err(e) => {
                self.record_failure().await;
                Err(e)
            }
        }
    }

    /// Manually reset the circuit breaker
    pub async fn reset(&self) {
        let mut state = self.state.write().await;
        info!("{} circuit breaker: manual reset", self.platform);
        *state = CircuitBreakerState::new();
    }

    /// Transition to closed state
    fn transition_to_closed(&self, state: &mut CircuitBreakerState) {
        info!("{} circuit breaker: closed", self.platform);
        state.state = CircuitState::Closed;
        state.failure_count = 0;
        state.success_count = 0;
        state.opened_at = None;
        state.last_state_change = Utc::now();
        state.stagnation_alerted = false;
    }

    /// Transition to open state
    fn transition_to_open(&self, state: &mut CircuitBreakerState) {
        warn!(
            "{} circuit breaker: opened after {} failures",
            self.platform, state.failure_count
        );
        state.state = CircuitState::Open;
        state.opened_at = Some(Utc::now());
        state.last_state_change = Utc::now();
        state.success_count = 0;
        state.stagnation_alerted = false;
    }

    /// Transition to half-open state
    fn transition_to_half_open(&self, state: &mut CircuitBreakerState) {
        info!(
            "{} circuit breaker: half-open (testing recovery)",
            self.platform
        );
        state.state = CircuitState::HalfOpen;
        state.last_state_change = Utc::now();
        state.success_count = 0;
        state.failure_count = 0;
    }
}

// DRY:DATA:CircuitBreakerInfo
/// Circuit breaker information snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreakerInfo {
    pub platform: Platform,
    pub state: CircuitState,
    pub failure_count: u32,
    pub success_count: u32,
    pub last_failure_time: Option<DateTime<Utc>>,
    pub last_success_time: Option<DateTime<Utc>>,
    pub opened_at: Option<DateTime<Utc>>,
    pub last_state_change: DateTime<Utc>,
}

// DRY:DATA:CircuitBreakerManager
/// Manager for all platform circuit breakers
pub struct CircuitBreakerManager {
    breakers: Arc<RwLock<HashMap<Platform, CircuitBreaker>>>,
}

impl CircuitBreakerManager {
    /// Create a new circuit breaker manager
    pub fn new() -> Self {
        let mut breakers = HashMap::new();
        for platform in Platform::all() {
            breakers.insert(*platform, CircuitBreaker::with_defaults(*platform));
        }

        Self {
            breakers: Arc::new(RwLock::new(breakers)),
        }
    }

    /// Get circuit breaker for a platform
    pub async fn get(&self, platform: Platform) -> Option<CircuitBreaker> {
        let breakers = self.breakers.read().await;
        breakers.get(&platform).cloned()
    }

    /// Set custom configuration for a platform
    pub async fn set_config(&self, platform: Platform, config: CircuitBreakerConfig) {
        let mut breakers = self.breakers.write().await;
        breakers.insert(platform, CircuitBreaker::new(platform, config));
    }

    /// Get all circuit breaker states
    pub async fn get_all_states(&self) -> HashMap<Platform, CircuitState> {
        let breakers = self.breakers.read().await;
        let mut states = HashMap::new();

        for (platform, breaker) in breakers.iter() {
            states.insert(*platform, breaker.get_state().await);
        }

        states
    }

    /// Reset all circuit breakers
    pub async fn reset_all(&self) {
        let breakers = self.breakers.read().await;
        for breaker in breakers.values() {
            breaker.reset().await;
        }
        info!("All circuit breakers reset");
    }
}

impl Default for CircuitBreakerManager {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for CircuitBreaker {
    fn clone(&self) -> Self {
        Self {
            platform: self.platform,
            config: self.config.clone(),
            state: Arc::clone(&self.state),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{Duration as TokioDuration, sleep};

    #[tokio::test]
    async fn test_circuit_breaker_closed_to_open() {
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            success_threshold: 2,
            recovery_timeout: Duration::seconds(1),
            stagnation_timeout: Duration::hours(1),
        };
        let breaker = CircuitBreaker::new(Platform::Cursor, config);

        assert_eq!(breaker.get_state().await, CircuitState::Closed);

        // Record failures
        breaker.record_failure().await;
        breaker.record_failure().await;
        assert_eq!(breaker.get_state().await, CircuitState::Closed);

        breaker.record_failure().await;
        assert_eq!(breaker.get_state().await, CircuitState::Open);
    }

    #[tokio::test]
    async fn test_circuit_breaker_open_to_half_open() {
        let config = CircuitBreakerConfig {
            failure_threshold: 2,
            success_threshold: 2,
            recovery_timeout: Duration::milliseconds(100),
            stagnation_timeout: Duration::hours(1),
        };
        let breaker = CircuitBreaker::new(Platform::Cursor, config);

        // Open the circuit
        breaker.record_failure().await;
        breaker.record_failure().await;
        assert_eq!(breaker.get_state().await, CircuitState::Open);

        // Wait for recovery timeout
        sleep(TokioDuration::from_millis(150)).await;

        // Execute should transition to half-open
        let result = breaker
            .execute(|| async { Ok::<(), anyhow::Error>(()) })
            .await;
        assert!(result.is_ok());
        assert_eq!(breaker.get_state().await, CircuitState::HalfOpen);
    }

    #[tokio::test]
    async fn test_circuit_breaker_half_open_to_closed() {
        let config = CircuitBreakerConfig {
            failure_threshold: 2,
            success_threshold: 2,
            recovery_timeout: Duration::milliseconds(50),
            stagnation_timeout: Duration::hours(1),
        };
        let breaker = CircuitBreaker::new(Platform::Cursor, config);

        // Open the circuit
        breaker.record_failure().await;
        breaker.record_failure().await;

        // Wait and execute to get to half-open
        sleep(TokioDuration::from_millis(100)).await;
        let _ = breaker
            .execute(|| async { Ok::<(), anyhow::Error>(()) })
            .await;

        assert_eq!(breaker.get_state().await, CircuitState::HalfOpen);

        // Record success to close
        breaker.record_success().await;
        assert_eq!(breaker.get_state().await, CircuitState::Closed);
    }

    #[tokio::test]
    async fn test_circuit_breaker_execute_success() {
        let breaker = CircuitBreaker::with_defaults(Platform::Cursor);

        let result = breaker
            .execute(|| async { Ok::<String, anyhow::Error>("success".to_string()) })
            .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "success");
    }

    #[tokio::test]
    async fn test_circuit_breaker_execute_failure() {
        let config = CircuitBreakerConfig {
            failure_threshold: 2,
            ..Default::default()
        };
        let breaker = CircuitBreaker::new(Platform::Cursor, config);

        // First failure
        let result = breaker
            .execute(|| async { Err::<(), anyhow::Error>(anyhow!("error")) })
            .await;
        assert!(result.is_err());

        // Second failure should open circuit
        let result = breaker
            .execute(|| async { Err::<(), anyhow::Error>(anyhow!("error")) })
            .await;
        assert!(result.is_err());

        assert_eq!(breaker.get_state().await, CircuitState::Open);

        // Third attempt should fail fast without executing
        let result = breaker
            .execute(|| async { Ok::<(), anyhow::Error>(()) })
            .await;
        assert!(result.is_err());
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("circuit breaker is open")
        );
    }

    #[tokio::test]
    async fn test_circuit_breaker_reset() {
        let breaker = CircuitBreaker::with_defaults(Platform::Cursor);

        breaker.record_failure().await;
        breaker.record_failure().await;

        breaker.reset().await;

        assert_eq!(breaker.get_state().await, CircuitState::Closed);
        let info = breaker.get_info().await;
        assert_eq!(info.failure_count, 0);
    }

    #[tokio::test]
    async fn test_circuit_breaker_manager() {
        let manager = CircuitBreakerManager::new();

        let breaker = manager.get(Platform::Cursor).await;
        assert!(breaker.is_some());

        let states = manager.get_all_states().await;
        assert_eq!(states.len(), 5);
        for state in states.values() {
            assert_eq!(*state, CircuitState::Closed);
        }
    }

    #[tokio::test]
    async fn test_circuit_breaker_info() {
        let breaker = CircuitBreaker::with_defaults(Platform::Cursor);

        breaker.record_failure().await;
        let info = breaker.get_info().await;

        assert_eq!(info.platform, Platform::Cursor);
        assert_eq!(info.failure_count, 1);
        assert!(info.last_failure_time.is_some());
    }
}
