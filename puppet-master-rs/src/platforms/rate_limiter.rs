//! Rate limiting for platform API calls
//!
//! This module implements rate limiting using a token bucket algorithm:
//! - Configurable calls-per-minute per platform
//! - Async acquire() method that blocks until rate limit allows
//! - Separate limits for each platform

use crate::types::Platform;
use anyhow::Result;
use log::debug;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::time::sleep;

/// Rate limiter configuration for a platform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimiterConfig {
    /// Platform this config applies to
    pub platform: Platform,
    /// Maximum calls per minute
    pub max_calls_per_minute: u32,
    /// Token refill interval in milliseconds
    pub refill_interval_ms: u64,
}

impl RateLimiterConfig {
    /// Create unlimited rate limiter config
    pub fn unlimited(platform: Platform) -> Self {
        Self {
            platform,
            max_calls_per_minute: u32::MAX,
            refill_interval_ms: 1,
        }
    }

    /// Create default rate limiter config for a platform
    pub fn default_for_platform(platform: Platform) -> Self {
        match platform {
            Platform::Cursor => Self {
                platform,
                max_calls_per_minute: 60, // 1 per second
                refill_interval_ms: 1000,
            },
            Platform::Codex => Self {
                platform,
                max_calls_per_minute: 60,
                refill_interval_ms: 1000,
            },
            Platform::Claude => Self {
                platform,
                max_calls_per_minute: 50, // Claude might have tighter limits
                refill_interval_ms: 1200,
            },
            Platform::Gemini => Self {
                platform,
                max_calls_per_minute: 60,
                refill_interval_ms: 1000,
            },
            Platform::Copilot => Self {
                platform,
                max_calls_per_minute: 60,
                refill_interval_ms: 1000,
            },
        }
    }
}

/// Token bucket for rate limiting
#[derive(Debug)]
struct TokenBucket {
    tokens: f64,
    max_tokens: f64,
    refill_rate: f64, // tokens per second
    last_refill: Instant,
}

impl TokenBucket {
    /// Create a new token bucket
    fn new(max_tokens: f64, refill_rate: f64) -> Self {
        Self {
            tokens: max_tokens,
            max_tokens,
            refill_rate,
            last_refill: Instant::now(),
        }
    }

    /// Refill tokens based on elapsed time
    fn refill(&mut self) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill).as_secs_f64();
        let tokens_to_add = elapsed * self.refill_rate;

        self.tokens = (self.tokens + tokens_to_add).min(self.max_tokens);
        self.last_refill = now;
    }

    /// Try to consume a token
    fn try_consume(&mut self) -> bool {
        self.refill();

        if self.tokens >= 1.0 {
            self.tokens -= 1.0;
            true
        } else {
            false
        }
    }

    /// Get time until next token is available
    fn time_until_next_token(&self) -> Duration {
        if self.tokens >= 1.0 {
            Duration::from_secs(0)
        } else {
            let tokens_needed = 1.0 - self.tokens;
            let secs = tokens_needed / self.refill_rate;
            Duration::from_secs_f64(secs.max(0.0))
        }
    }
}

/// Rate limiter for managing API call rates
pub struct RateLimiter {
    configs: Arc<Mutex<HashMap<Platform, RateLimiterConfig>>>,
    buckets: Arc<Mutex<HashMap<Platform, TokenBucket>>>,
}

impl RateLimiter {
    /// Create a new rate limiter
    pub fn new() -> Self {
        let mut configs = HashMap::new();
        let mut buckets = HashMap::new();

        // Initialize with default configs
        for &platform in Platform::all() {
            let config = RateLimiterConfig::default_for_platform(platform);
            let refill_rate = config.max_calls_per_minute as f64 / 60.0; // tokens per second
            
            configs.insert(platform, config.clone());
            buckets.insert(
                platform,
                TokenBucket::new(config.max_calls_per_minute as f64, refill_rate),
            );
        }

        Self {
            configs: Arc::new(Mutex::new(configs)),
            buckets: Arc::new(Mutex::new(buckets)),
        }
    }

    /// Set rate limiter config for a platform
    pub fn set_config(&self, config: RateLimiterConfig) {
        let mut configs = self.configs.lock().unwrap();
        let mut buckets = self.buckets.lock().unwrap();

        let refill_rate = config.max_calls_per_minute as f64 / 60.0;
        
        configs.insert(config.platform, config.clone());
        buckets.insert(
            config.platform,
            TokenBucket::new(config.max_calls_per_minute as f64, refill_rate),
        );
    }

    /// Get rate limiter config for a platform
    pub fn get_config(&self, platform: Platform) -> RateLimiterConfig {
        let configs = self.configs.lock().unwrap();
        configs
            .get(&platform)
            .cloned()
            .unwrap_or_else(|| RateLimiterConfig::default_for_platform(platform))
    }

    /// Acquire permission to make a call (blocks until allowed)
    pub async fn acquire(&self, platform: Platform) -> Result<()> {
        loop {
            let wait_time = {
                let mut buckets = self.buckets.lock().unwrap();
                let bucket = buckets.get_mut(&platform).unwrap();

                if bucket.try_consume() {
                    debug!("Rate limit acquired for {}", platform);
                    return Ok(());
                }

                bucket.time_until_next_token()
            };

            // Wait and try again
            debug!(
                "Rate limit reached for {}, waiting {:?}",
                platform, wait_time
            );
            sleep(wait_time).await;
        }
    }

    /// Try to acquire permission without blocking
    pub fn try_acquire(&self, platform: Platform) -> bool {
        let mut buckets = self.buckets.lock().unwrap();
        let bucket = buckets.get_mut(&platform).unwrap();
        bucket.try_consume()
    }

    /// Reset rate limiter for a platform
    pub fn reset(&self, platform: Platform) {
        let mut buckets = self.buckets.lock().unwrap();
        if let Some(bucket) = buckets.get_mut(&platform) {
            bucket.tokens = bucket.max_tokens;
            bucket.last_refill = Instant::now();
        }
    }

    /// Reset all rate limiters
    pub fn reset_all(&self) {
        let mut buckets = self.buckets.lock().unwrap();
        for bucket in buckets.values_mut() {
            bucket.tokens = bucket.max_tokens;
            bucket.last_refill = Instant::now();
        }
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new()
    }
}

/// Global rate limiter instance
static RATE_LIMITER: once_cell::sync::Lazy<RateLimiter> =
    once_cell::sync::Lazy::new(RateLimiter::new);

/// Get the global rate limiter
pub fn global_rate_limiter() -> &'static RateLimiter {
    &RATE_LIMITER
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limiter_config() {
        let config = RateLimiterConfig::default_for_platform(Platform::Cursor);
        assert!(config.max_calls_per_minute > 0);
    }

    #[test]
    fn test_rate_limiter_creation() {
        let limiter = RateLimiter::new();
        for platform in Platform::all() {
            let config = limiter.get_config(*platform);
            assert!(config.max_calls_per_minute > 0);
        }
    }

    #[tokio::test]
    async fn test_acquire() {
        let limiter = RateLimiter::new();

        // Set a high limit for testing
        limiter.set_config(RateLimiterConfig {
            platform: Platform::Cursor,
            max_calls_per_minute: 600, // 10 per second
            refill_interval_ms: 100,
        });

        // Should be able to acquire immediately
        assert!(limiter.acquire(Platform::Cursor).await.is_ok());
    }

    #[test]
    fn test_try_acquire() {
        let limiter = RateLimiter::new();

        // Set a reasonable limit
        limiter.set_config(RateLimiterConfig {
            platform: Platform::Cursor,
            max_calls_per_minute: 60,
            refill_interval_ms: 1000,
        });

        // Should be able to acquire multiple times up to limit
        let mut acquired = 0;
        for _ in 0..100 {
            if limiter.try_acquire(Platform::Cursor) {
                acquired += 1;
            } else {
                break;
            }
        }

        // Should have acquired at least some
        assert!(acquired > 0);
        // But not unlimited
        assert!(acquired <= 60);
    }

    #[test]
    fn test_reset() {
        let limiter = RateLimiter::new();

        // Exhaust the bucket
        limiter.set_config(RateLimiterConfig {
            platform: Platform::Cursor,
            max_calls_per_minute: 5,
            refill_interval_ms: 12000, // Very slow refill
        });

        for _ in 0..5 {
            let _ = limiter.try_acquire(Platform::Cursor);
        }

        // Should be exhausted
        assert!(!limiter.try_acquire(Platform::Cursor));

        // Reset
        limiter.reset(Platform::Cursor);

        // Should be able to acquire again
        assert!(limiter.try_acquire(Platform::Cursor));
    }

    #[test]
    fn test_token_bucket() {
        let mut bucket = TokenBucket::new(10.0, 1.0); // 10 tokens, 1 per second

        // Should have 10 tokens initially
        for _ in 0..10 {
            assert!(bucket.try_consume());
        }

        // Should be empty
        assert!(!bucket.try_consume());
    }

    #[tokio::test]
    async fn test_token_refill() {
        let mut bucket = TokenBucket::new(10.0, 10.0); // 10 tokens, 10 per second

        // Consume all tokens
        for _ in 0..10 {
            assert!(bucket.try_consume());
        }

        // Wait for refill
        sleep(Duration::from_millis(500)).await;

        // Should have ~5 tokens refilled
        let mut refilled = 0;
        for _ in 0..10 {
            if bucket.try_consume() {
                refilled += 1;
            } else {
                break;
            }
        }

        assert!(refilled >= 4 && refilled <= 6); // Allow some variance
    }
}
