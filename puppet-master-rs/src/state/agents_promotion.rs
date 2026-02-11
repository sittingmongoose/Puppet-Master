//! AGENTS.md Promotion Engine
//!
//! Tracks pattern usage across iterations and promotes high-value entries
//! up the AGENTS.md hierarchy (subtask → task → phase → root).

use crate::types::AgentDefinition;
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Promotion engine configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromotionConfig {
    /// Minimum number of times a pattern must be used
    pub min_usage_count: u32,
    /// Minimum success rate (0.0 to 1.0)
    pub min_success_rate: f64,
    /// Combined score threshold for promotion
    pub promotion_threshold: f64,
}

impl Default for PromotionConfig {
    fn default() -> Self {
        Self {
            min_usage_count: 3,
            min_success_rate: 0.75,
            promotion_threshold: 0.8,
        }
    }
}

/// Promotion engine for agent learnings
pub struct PromotionEngine {
    config: PromotionConfig,
    usage_tracker: UsageTracker,
}

/// Tracks usage statistics for agent entries
#[derive(Debug, Default)]
struct UsageTracker {
    usage: HashMap<String, UsageStats>,
}

/// Usage statistics for a single agent entry
#[derive(Debug, Clone)]
struct UsageStats {
    /// Number of times used
    count: u32,
    /// Number of successful outcomes
    successes: u32,
    /// Number of failed outcomes
    failures: u32,
    /// Tier where this entry originated
    source_tier: String,
}

impl UsageStats {
    fn success_rate(&self) -> f64 {
        if self.count == 0 {
            0.0
        } else {
            self.successes as f64 / self.count as f64
        }
    }

    fn promotion_score(&self) -> f64 {
        let usage_score = (self.count as f64).min(10.0) / 10.0;
        let success_score = self.success_rate();
        (usage_score + success_score) / 2.0
    }
}

/// Candidate for promotion to a higher tier
#[derive(Debug, Clone)]
pub struct PromotionCandidate {
    /// The entry text/description
    pub entry_text: String,
    /// Source tier ID
    pub source_tier: String,
    /// Number of times used
    pub usage_count: u32,
    /// Success rate (0.0 to 1.0)
    pub success_rate: f64,
    /// Target tier for promotion
    pub target_tier: String,
    /// Combined promotion score
    pub score: f64,
}

impl PromotionEngine {
    /// Create a new promotion engine
    pub fn new(config: PromotionConfig) -> Self {
        Self {
            config,
            usage_tracker: UsageTracker::default(),
        }
    }

    /// Create with default configuration
    pub fn with_defaults() -> Self {
        Self::new(PromotionConfig::default())
    }

    /// Record usage of an agent entry
    pub fn record_usage(
        &mut self,
        entry_text: &str,
        source_tier: &str,
        success: bool,
    ) -> Result<()> {
        let stats = self
            .usage_tracker
            .usage
            .entry(entry_text.to_string())
            .or_insert_with(|| UsageStats {
                count: 0,
                successes: 0,
                failures: 0,
                source_tier: source_tier.to_string(),
            });

        stats.count += 1;
        if success {
            stats.successes += 1;
        } else {
            stats.failures += 1;
        }

        log::trace!(
            "Recorded {} for '{}': {} uses, {:.2}% success",
            if success { "success" } else { "failure" },
            entry_text,
            stats.count,
            stats.success_rate() * 100.0
        );

        Ok(())
    }

    /// Evaluate which entries should be promoted
    pub fn evaluate(&self, entries: &[AgentDefinition]) -> Vec<PromotionCandidate> {
        let mut candidates = Vec::new();

        for entry in entries {
            if let Some(stats) = self.usage_tracker.usage.get(&entry.description) {
                // Check if meets minimum criteria
                if stats.count < self.config.min_usage_count {
                    continue;
                }

                let success_rate = stats.success_rate();
                if success_rate < self.config.min_success_rate {
                    continue;
                }

                let score = stats.promotion_score();
                if score < self.config.promotion_threshold {
                    continue;
                }

                // Determine target tier (promote one level up)
                let target_tier = self.calculate_target_tier(&stats.source_tier);

                candidates.push(PromotionCandidate {
                    entry_text: entry.description.clone(),
                    source_tier: stats.source_tier.clone(),
                    usage_count: stats.count,
                    success_rate,
                    target_tier,
                    score,
                });
            }
        }

        // Sort by score, highest first
        candidates.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        candidates
    }

    /// Calculate the target tier for promotion (one level up)
    fn calculate_target_tier(&self, source_tier: &str) -> String {
        let parts: Vec<&str> = source_tier.split('.').collect();

        if parts.is_empty() {
            return "root".to_string();
        }

        if parts.len() == 1 {
            // Already at phase level, promote to root
            return "root".to_string();
        }

        // Remove last segment to go up one level
        parts[..parts.len() - 1].join(".")
    }

    /// Promote a candidate by copying it to the target tier
    pub fn promote(
        &self,
        candidate: &PromotionCandidate,
        agents_manager: &crate::state::AgentsManager,
    ) -> Result<()> {
        log::info!(
            "Promoting '{}' from {} to {} (score: {:.2})",
            candidate.entry_text,
            candidate.source_tier,
            candidate.target_tier,
            candidate.score
        );

        // Add to target tier as a promoted pattern
        let promotion_note = format!(
            "{} (promoted: {}x usage, {:.1}% success)",
            candidate.entry_text,
            candidate.usage_count,
            candidate.success_rate * 100.0
        );

        agents_manager
            .append_pattern(&candidate.target_tier, promotion_note)
            .context("Failed to promote agent entry")?;

        Ok(())
    }

    /// Get usage statistics for an entry
    pub fn get_stats(&self, entry_text: &str) -> Option<(u32, f64)> {
        self.usage_tracker
            .usage
            .get(entry_text)
            .map(|stats| (stats.count, stats.success_rate()))
    }

    /// Clear all usage statistics
    pub fn clear_stats(&mut self) {
        self.usage_tracker.usage.clear();
    }

    /// Export usage statistics for persistence
    pub fn export_stats(&self) -> HashMap<String, (u32, u32, u32, String)> {
        self.usage_tracker
            .usage
            .iter()
            .map(|(key, stats)| {
                (
                    key.clone(),
                    (stats.count, stats.successes, stats.failures, stats.source_tier.clone()),
                )
            })
            .collect()
    }

    /// Import usage statistics from persistence
    pub fn import_stats(&mut self, data: HashMap<String, (u32, u32, u32, String)>) {
        for (key, (count, successes, failures, source_tier)) in data {
            self.usage_tracker.usage.insert(
                key,
                UsageStats {
                    count,
                    successes,
                    failures,
                    source_tier,
                },
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::AgentsManager;
    use tempfile::TempDir;

    #[test]
    fn test_record_usage() {
        let mut engine = PromotionEngine::with_defaults();

        engine
            .record_usage("Pattern 1", "phase1.task1", true)
            .unwrap();
        engine
            .record_usage("Pattern 1", "phase1.task1", true)
            .unwrap();
        engine
            .record_usage("Pattern 1", "phase1.task1", false)
            .unwrap();

        let (count, success_rate) = engine.get_stats("Pattern 1").unwrap();
        assert_eq!(count, 3);
        assert!((success_rate - 0.666).abs() < 0.01);
    }

    #[test]
    fn test_evaluate_promotion_candidates() {
        let mut engine = PromotionEngine::with_defaults();

        // Record successful usage - need at least 10 uses to get max usage_score
        // promotion_score = (usage_score + success_score) / 2
        // With 5 uses: (5/10 + 1.0) / 2 = 0.75, which is < threshold of 0.8
        // With 10 uses: (10/10 + 1.0) / 2 = 1.0, which passes
        for _ in 0..10 {
            engine
                .record_usage("Good Pattern", "phase1.task1", true)
                .unwrap();
        }

        // Record failed usage - won't meet success_rate threshold
        for _ in 0..3 {
            engine
                .record_usage("Bad Pattern", "phase1.task1", false)
                .unwrap();
        }

        let entries = vec![
            AgentDefinition::new("Good Pattern", "pattern", "Good Pattern"),
            AgentDefinition::new("Bad Pattern", "pattern", "Bad Pattern"),
        ];

        let candidates = engine.evaluate(&entries);

        // Only "Good Pattern" should be a candidate (high success rate and enough uses)
        assert_eq!(candidates.len(), 1);
        assert_eq!(candidates[0].entry_text, "Good Pattern");
        assert_eq!(candidates[0].source_tier, "phase1.task1");
        assert_eq!(candidates[0].target_tier, "phase1");
    }

    #[test]
    fn test_target_tier_calculation() {
        let engine = PromotionEngine::with_defaults();

        assert_eq!(
            engine.calculate_target_tier("phase1.task1.subtask1"),
            "phase1.task1"
        );
        assert_eq!(engine.calculate_target_tier("phase1.task1"), "phase1");
        assert_eq!(engine.calculate_target_tier("phase1"), "root");
    }

    #[test]
    fn test_promotion() {
        let temp_dir = TempDir::new().unwrap();
        let manager = AgentsManager::new(temp_dir.path());
        let mut engine = PromotionEngine::with_defaults();

        // Record successful usage - need 10+ uses to meet promotion threshold
        for _ in 0..10 {
            engine
                .record_usage("Test Pattern", "phase1.task1", true)
                .unwrap();
        }

        let entries = vec![AgentDefinition::new(
            "Test Pattern",
            "pattern",
            "Test Pattern",
        )];

        let candidates = engine.evaluate(&entries);
        assert_eq!(candidates.len(), 1);

        // Promote
        engine.promote(&candidates[0], &manager).unwrap();

        // Verify promoted to parent tier
        let parent_doc = manager.load("phase1").unwrap();
        let patterns: Vec<_> = parent_doc
            .agents
            .iter()
            .filter(|a| a.role == "pattern")
            .collect();
        assert_eq!(patterns.len(), 1);
        assert!(patterns[0].description.contains("Test Pattern"));
        assert!(patterns[0].description.contains("promoted"));
    }

    #[test]
    fn test_export_import_stats() {
        let mut engine = PromotionEngine::with_defaults();

        engine
            .record_usage("Pattern A", "phase1", true)
            .unwrap();
        engine
            .record_usage("Pattern A", "phase1", true)
            .unwrap();

        let exported = engine.export_stats();
        assert_eq!(exported.len(), 1);

        let mut engine2 = PromotionEngine::with_defaults();
        engine2.import_stats(exported);

        let (count, _) = engine2.get_stats("Pattern A").unwrap();
        assert_eq!(count, 2);
    }

    #[test]
    fn test_clear_stats() {
        let mut engine = PromotionEngine::with_defaults();

        engine
            .record_usage("Pattern", "tier", true)
            .unwrap();
        assert!(engine.get_stats("Pattern").is_some());

        engine.clear_stats();
        assert!(engine.get_stats("Pattern").is_none());
    }
}
