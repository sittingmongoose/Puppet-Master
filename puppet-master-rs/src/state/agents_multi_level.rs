//! Multi-Level AGENTS.md Loader
//!
//! Loads and merges AGENTS.md from multiple hierarchy levels.
//! Root AGENTS.md → phase AGENTS.md → task AGENTS.md → subtask AGENTS.md

use crate::state::AgentsManager;
use crate::types::{AgentDefinition, AgentsDoc};
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Multi-level AGENTS.md loader
pub struct MultiLevelLoader {
    _root_path: PathBuf,
    manager: AgentsManager,
}

/// Merged agents from multiple hierarchy levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergedAgents {
    /// Successful patterns from all levels
    pub patterns: Vec<AgentEntry>,
    /// Failure modes from all levels
    pub failure_modes: Vec<AgentEntry>,
    /// "Do" rules from all levels
    pub do_rules: Vec<String>,
    /// "Don't" rules from all levels
    pub dont_rules: Vec<String>,
    /// List of source levels that were merged
    pub source_levels: Vec<String>,
}

/// Single agent entry with source tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentEntry {
    /// The agent definition
    pub definition: AgentDefinition,
    /// Which tier this came from
    pub source_tier: String,
    /// Priority (root=0, phase=1, task=2, subtask=3)
    pub priority: u32,
}

impl MergedAgents {
    /// Create an empty merged agents structure
    pub fn new() -> Self {
        Self {
            patterns: Vec::new(),
            failure_modes: Vec::new(),
            do_rules: Vec::new(),
            dont_rules: Vec::new(),
            source_levels: Vec::new(),
        }
    }

    /// Get total number of entries
    pub fn total_entries(&self) -> usize {
        self.patterns.len() + self.failure_modes.len() + self.do_rules.len() + self.dont_rules.len()
    }

    /// Sort entries by priority (root first, then down the hierarchy)
    pub fn sort_by_priority(&mut self) {
        self.patterns.sort_by_key(|e| e.priority);
        self.failure_modes.sort_by_key(|e| e.priority);
    }

    /// Deduplicate entries (remove exact duplicates, keeping highest priority)
    pub fn deduplicate(&mut self) {
        // Deduplicate patterns
        let mut seen_patterns = std::collections::HashSet::new();
        self.patterns.retain(|entry| {
            let key = entry.definition.description.to_lowercase();
            if seen_patterns.contains(&key) {
                false
            } else {
                seen_patterns.insert(key);
                true
            }
        });

        // Deduplicate failure modes
        let mut seen_failures = std::collections::HashSet::new();
        self.failure_modes.retain(|entry| {
            let key = entry.definition.description.to_lowercase();
            if seen_failures.contains(&key) {
                false
            } else {
                seen_failures.insert(key);
                true
            }
        });

        // Deduplicate do rules
        let seen_do: std::collections::HashSet<_> =
            self.do_rules.iter().map(|s| s.to_lowercase()).collect();
        self.do_rules = seen_do.into_iter().collect();

        // Deduplicate don't rules
        let seen_dont: std::collections::HashSet<_> =
            self.dont_rules.iter().map(|s| s.to_lowercase()).collect();
        self.dont_rules = seen_dont.into_iter().collect();
    }
}

impl Default for MergedAgents {
    fn default() -> Self {
        Self::new()
    }
}

impl MultiLevelLoader {
    /// Create a new multi-level loader
    pub fn new(root_path: PathBuf) -> Self {
        let manager = AgentsManager::new(&root_path);
        Self {
            _root_path: root_path,
            manager,
        }
    }

    /// Load and merge AGENTS.md for a specific tier
    pub fn load(&self, tier_id: &str) -> Result<MergedAgents> {
        let mut merged = MergedAgents::new();

        // Build hierarchy path from root to the specified tier
        let hierarchy = self.build_hierarchy_path(tier_id);

        log::debug!(
            "Loading AGENTS.md hierarchy for tier {}: {:?}",
            tier_id,
            hierarchy
        );

        // Load and merge each level
        for (level_idx, level_tier) in hierarchy.iter().enumerate() {
            match self.load_tier(level_tier, level_idx as u32) {
                Ok(level_data) => {
                    self.merge_level(&mut merged, level_data, level_tier);
                }
                Err(e) => {
                    log::debug!(
                        "Could not load AGENTS.md for tier {} (level {}): {}",
                        level_tier,
                        level_idx,
                        e
                    );
                    // Continue loading other levels
                }
            }
        }

        // Sort and deduplicate
        merged.sort_by_priority();
        merged.deduplicate();

        log::info!(
            "Merged AGENTS.md: {} patterns, {} failures, {} do's, {} don'ts from {} levels",
            merged.patterns.len(),
            merged.failure_modes.len(),
            merged.do_rules.len(),
            merged.dont_rules.len(),
            merged.source_levels.len()
        );

        Ok(merged)
    }

    /// Build the hierarchy path for a tier
    fn build_hierarchy_path(&self, tier_id: &str) -> Vec<String> {
        if tier_id.is_empty() || tier_id == "root" {
            return vec!["root".to_string()];
        }

        let parts: Vec<&str> = tier_id.split('.').collect();
        let mut hierarchy = vec!["root".to_string()];

        // Build cumulative paths
        for i in 1..=parts.len() {
            hierarchy.push(parts[..i].join("."));
        }

        hierarchy
    }

    /// Load AGENTS.md for a single tier
    fn load_tier(&self, tier_id: &str, _priority: u32) -> Result<AgentsDoc> {
        let tier_to_load = if tier_id == "root" { "" } else { tier_id };

        self.manager
            .load(tier_to_load)
            .with_context(|| format!("Failed to load AGENTS.md for tier {}", tier_id))
    }

    /// Merge a single level into the merged result
    fn merge_level(&self, merged: &mut MergedAgents, doc: AgentsDoc, tier_id: &str) {
        merged.source_levels.push(tier_id.to_string());

        let priority = self.calculate_priority(tier_id);

        for agent in doc.agents {
            let entry = AgentEntry {
                definition: agent.clone(),
                source_tier: tier_id.to_string(),
                priority,
            };

            match agent.role.as_str() {
                "pattern" => merged.patterns.push(entry),
                "failure_mode" => merged.failure_modes.push(entry),
                "do_item" => merged.do_rules.push(agent.description),
                "dont_item" => merged.dont_rules.push(agent.description),
                _ => {
                    // Unknown role, add as pattern
                    log::trace!("Unknown agent role '{}', treating as pattern", agent.role);
                    merged.patterns.push(entry);
                }
            }
        }
    }

    /// Calculate priority based on tier depth (root=0, deeper=higher number)
    fn calculate_priority(&self, tier_id: &str) -> u32 {
        if tier_id == "root" || tier_id.is_empty() {
            return 0;
        }

        tier_id.split('.').count() as u32
    }

    /// Load only from a specific level (no merging)
    pub fn load_single_level(&self, tier_id: &str) -> Result<AgentsDoc> {
        let tier_to_load = if tier_id == "root" { "" } else { tier_id };
        self.manager.load(tier_to_load)
    }

    /// Save AGENTS.md for a tier
    pub fn save(&self, tier_id: &str, doc: &AgentsDoc) -> Result<()> {
        let tier_to_save = if tier_id == "root" { "" } else { tier_id };
        self.manager.save(tier_to_save, doc)
    }

    /// Format merged agents back into markdown
    pub fn format_merged(&self, merged: &MergedAgents) -> String {
        let mut content = String::new();

        content.push_str("# Merged Agent Learnings\n\n");
        content.push_str(&format!(
            "Merged from {} levels: ",
            merged.source_levels.len()
        ));
        content.push_str(&merged.source_levels.join(", "));
        content.push_str("\n\n");

        if !merged.patterns.is_empty() {
            content.push_str("## Successful Patterns\n\n");
            for entry in &merged.patterns {
                content.push_str(&format!(
                    "- {} _(from: {})_\n",
                    entry.definition.description, entry.source_tier
                ));
            }
            content.push('\n');
        }

        if !merged.failure_modes.is_empty() {
            content.push_str("## Failure Modes\n\n");
            for entry in &merged.failure_modes {
                content.push_str(&format!(
                    "- {} _(from: {})_\n",
                    entry.definition.description, entry.source_tier
                ));
            }
            content.push('\n');
        }

        if !merged.do_rules.is_empty() {
            content.push_str("## Do\n\n");
            for rule in &merged.do_rules {
                content.push_str(&format!("- {}\n", rule));
            }
            content.push('\n');
        }

        if !merged.dont_rules.is_empty() {
            content.push_str("## Don't\n\n");
            for rule in &merged.dont_rules {
                content.push_str(&format!("- {}\n", rule));
            }
            content.push('\n');
        }

        content
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn setup_test_hierarchy(temp_dir: &TempDir) -> MultiLevelLoader {
        let loader = MultiLevelLoader::new(temp_dir.path().to_path_buf());

        // Create root AGENTS.md
        let mut root_doc = AgentsDoc::new("root");
        root_doc.agents.push(AgentDefinition::new(
            "Root Pattern",
            "pattern",
            "Root Pattern",
        ));
        loader.save("root", &root_doc).unwrap();

        // Create phase1 AGENTS.md
        let mut phase_doc = AgentsDoc::new("phase1");
        phase_doc.agents.push(AgentDefinition::new(
            "Phase Pattern",
            "pattern",
            "Phase Pattern",
        ));
        loader.save("phase1", &phase_doc).unwrap();

        // Create phase1.task1 AGENTS.md
        let mut task_doc = AgentsDoc::new("phase1.task1");
        task_doc.agents.push(AgentDefinition::new(
            "Task Pattern",
            "pattern",
            "Task Pattern",
        ));
        loader.save("phase1.task1", &task_doc).unwrap();

        loader
    }

    #[test]
    fn test_build_hierarchy_path() {
        let temp_dir = TempDir::new().unwrap();
        let loader = MultiLevelLoader::new(temp_dir.path().to_path_buf());

        let hierarchy = loader.build_hierarchy_path("phase1.task1.subtask1");
        assert_eq!(
            hierarchy,
            vec!["root", "phase1", "phase1.task1", "phase1.task1.subtask1"]
        );
    }

    #[test]
    fn test_load_and_merge() {
        let temp_dir = TempDir::new().unwrap();
        let loader = setup_test_hierarchy(&temp_dir);

        let merged = loader.load("phase1.task1").unwrap();

        assert_eq!(merged.source_levels.len(), 3); // root, phase1, phase1.task1
        assert_eq!(merged.patterns.len(), 3); // One from each level
    }

    #[test]
    fn test_priority_calculation() {
        let temp_dir = TempDir::new().unwrap();
        let loader = MultiLevelLoader::new(temp_dir.path().to_path_buf());

        assert_eq!(loader.calculate_priority("root"), 0);
        assert_eq!(loader.calculate_priority("phase1"), 1);
        assert_eq!(loader.calculate_priority("phase1.task1"), 2);
        assert_eq!(loader.calculate_priority("phase1.task1.subtask1"), 3);
    }

    #[test]
    fn test_deduplicate() {
        let temp_dir = TempDir::new().unwrap();
        let loader = MultiLevelLoader::new(temp_dir.path().to_path_buf());

        // Create docs with duplicate patterns
        let mut root_doc = AgentsDoc::new("root");
        root_doc.agents.push(AgentDefinition::new(
            "Duplicate",
            "pattern",
            "Duplicate Pattern",
        ));
        loader.save("root", &root_doc).unwrap();

        let mut phase_doc = AgentsDoc::new("phase1");
        phase_doc.agents.push(AgentDefinition::new(
            "Duplicate",
            "pattern",
            "Duplicate Pattern",
        ));
        loader.save("phase1", &phase_doc).unwrap();

        let merged = loader.load("phase1").unwrap();

        // Should only have one pattern after deduplication
        assert_eq!(merged.patterns.len(), 1);
    }

    #[test]
    fn test_format_merged() {
        let temp_dir = TempDir::new().unwrap();
        let loader = setup_test_hierarchy(&temp_dir);

        let merged = loader.load("phase1.task1").unwrap();
        let formatted = loader.format_merged(&merged);

        assert!(formatted.contains("# Merged Agent Learnings"));
        assert!(formatted.contains("Root Pattern"));
        assert!(formatted.contains("Phase Pattern"));
        assert!(formatted.contains("Task Pattern"));
        assert!(formatted.contains("_(from: root)_"));
    }

    #[test]
    fn test_load_single_level() {
        let temp_dir = TempDir::new().unwrap();
        let loader = setup_test_hierarchy(&temp_dir);

        let phase_doc = loader.load_single_level("phase1").unwrap();
        assert_eq!(phase_doc.agents.len(), 1);
        assert_eq!(phase_doc.agents[0].description, "Phase Pattern");
    }
}
