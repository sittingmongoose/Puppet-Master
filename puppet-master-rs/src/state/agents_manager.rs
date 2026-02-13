//! AGENTS.md Manager
//!
//! Manages AGENTS.md files across the multi-level hierarchy:
//! - Load/save AGENTS.md files at different tier levels
//! - Parse sections and agent definitions
//! - Append learnings to appropriate sections

use crate::types::{AgentDefinition, AgentsDoc};
use anyhow::{Context, Result};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

/// Thread-safe AGENTS.md manager
#[derive(Clone)]
pub struct AgentsManager {
    inner: Arc<Mutex<AgentsManagerInner>>,
}

struct AgentsManagerInner {
    root_path: PathBuf,
}

impl AgentsManager {
    /// Create a new AGENTS.md manager
    pub fn new(root_path: impl AsRef<Path>) -> Self {
        Self {
            inner: Arc::new(Mutex::new(AgentsManagerInner {
                root_path: root_path.as_ref().to_path_buf(),
            })),
        }
    }

    /// Get the AGENTS.md path for a specific tier
    pub fn get_agents_path(&self, tier_id: &str) -> PathBuf {
        let inner = self.inner.lock().unwrap();
        let parts: Vec<&str> = tier_id.split('.').collect();

        let mut path = inner.root_path.clone();

        // Build hierarchical path
        // e.g., "phase1.task2.subtask3" -> root/phase1/task2/subtask3/AGENTS.md
        for part in parts {
            path = path.join(part);
        }

        path.join("AGENTS.md")
    }

    /// Load AGENTS.md for a tier
    pub fn load(&self, tier_id: &str) -> Result<AgentsDoc> {
        let path = self.get_agents_path(tier_id);

        if !path.exists() {
            return Ok(AgentsDoc::new(tier_id));
        }

        let content = fs::read_to_string(&path)
            .with_context(|| format!("Failed to read AGENTS.md from {}", path.display()))?;

        self.parse_agents_doc(tier_id, &content)
    }

    /// Parse AGENTS.md content into AgentsDoc
    fn parse_agents_doc(&self, tier_id: &str, content: &str) -> Result<AgentsDoc> {
        let mut doc = AgentsDoc::new(tier_id);

        let mut current_section: Option<String> = None;

        for line in content.lines() {
            let trimmed = line.trim();

            if trimmed.starts_with("## ") || trimmed.starts_with("# ") {
                let header = trimmed.trim_start_matches('#').trim().to_lowercase();

                current_section = Some(header);
            } else if trimmed.starts_with("- ") || trimmed.starts_with("* ") {
                let item = trimmed
                    .trim_start_matches('-')
                    .trim_start_matches('*')
                    .trim()
                    .to_string();

                if let Some(ref section) = current_section {
                    // Store parsed items as agent definitions with the section as role
                    let role = if section.contains("pattern") {
                        "pattern"
                    } else if section.contains("failure") {
                        "failure_mode"
                    } else if section.contains("do") && !section.contains("don't") {
                        "do_item"
                    } else if section.contains("don't") || section.contains("avoid") {
                        "dont_item"
                    } else {
                        "general"
                    };
                    doc.agents.push(AgentDefinition::new(&item, role, &item));
                }
            }
        }

        Ok(doc)
    }

    /// Save AGENTS.md for a tier
    pub fn save(&self, tier_id: &str, doc: &AgentsDoc) -> Result<()> {
        let path = self.get_agents_path(tier_id);

        // Create parent directory
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory {}", parent.display()))?;
        }

        let content = self.format_agents_doc(doc);

        fs::write(&path, content)
            .with_context(|| format!("Failed to write AGENTS.md to {}", path.display()))?;

        log::debug!("Saved AGENTS.md for tier {}", tier_id);
        Ok(())
    }

    /// Format AGENTS.md content
    fn format_agents_doc(&self, doc: &AgentsDoc) -> String {
        let mut content = String::new();

        content.push_str(&format!("# Agent Learnings - {}\n\n", doc.project_name));

        let patterns: Vec<_> = doc.agents.iter().filter(|a| a.role == "pattern").collect();
        let failures: Vec<_> = doc
            .agents
            .iter()
            .filter(|a| a.role == "failure_mode")
            .collect();
        let dos: Vec<_> = doc.agents.iter().filter(|a| a.role == "do_item").collect();
        let donts: Vec<_> = doc
            .agents
            .iter()
            .filter(|a| a.role == "dont_item")
            .collect();

        if !patterns.is_empty() {
            content.push_str("## Successful Patterns\n\n");
            for agent in &patterns {
                content.push_str(&format!("- {}\n", agent.description));
            }
            content.push('\n');
        }

        if !failures.is_empty() {
            content.push_str("## Failure Modes\n\n");
            for agent in &failures {
                content.push_str(&format!("- {}\n", agent.description));
            }
            content.push('\n');
        }

        if !dos.is_empty() {
            content.push_str("## Do\n\n");
            for agent in &dos {
                content.push_str(&format!("- {}\n", agent.description));
            }
            content.push('\n');
        }

        if !donts.is_empty() {
            content.push_str("## Don't\n\n");
            for agent in &donts {
                content.push_str(&format!("- {}\n", agent.description));
            }
            content.push('\n');
        }

        content
    }

    /// Append a pattern to the patterns section
    pub fn append_pattern(&self, tier_id: &str, pattern: String) -> Result<()> {
        let mut doc = self.load(tier_id)?;
        doc.agents
            .push(AgentDefinition::new(&pattern, "pattern", &pattern));
        self.save(tier_id, &doc)
    }

    /// Append a failure mode
    pub fn append_failure(&self, tier_id: &str, failure: String) -> Result<()> {
        let mut doc = self.load(tier_id)?;
        doc.agents
            .push(AgentDefinition::new(&failure, "failure_mode", &failure));
        self.save(tier_id, &doc)
    }

    /// Append to do list
    pub fn append_do(&self, tier_id: &str, item: String) -> Result<()> {
        let mut doc = self.load(tier_id)?;
        doc.agents
            .push(AgentDefinition::new(&item, "do_item", &item));
        self.save(tier_id, &doc)
    }

    /// Append to don't list
    pub fn append_dont(&self, tier_id: &str, item: String) -> Result<()> {
        let mut doc = self.load(tier_id)?;
        doc.agents
            .push(AgentDefinition::new(&item, "dont_item", &item));
        self.save(tier_id, &doc)
    }

    /// Get all AGENTS.md in the hierarchy for a tier
    pub fn get_hierarchy(&self, tier_id: &str) -> Result<Vec<(String, AgentsDoc)>> {
        let parts: Vec<&str> = tier_id.split('.').collect();
        let mut hierarchy = Vec::new();

        // Load root AGENTS.md
        if let Ok(root_doc) = self.load("") {
            hierarchy.push(("root".to_string(), root_doc));
        }

        // Load each level in the hierarchy
        for i in 1..=parts.len() {
            let tier = parts[..i].join(".");
            if let Ok(doc) = self.load(&tier) {
                hierarchy.push((tier, doc));
            }
        }

        Ok(hierarchy)
    }

    /// Validate AGENTS.md with gate enforcer
    pub fn validate_with_enforcer(
        &self,
        tier_id: &str,
    ) -> Result<crate::state::agents_gate_enforcer::EnforcementResult> {
        use crate::state::agents_gate_enforcer::GateEnforcer;

        let doc = self.load(tier_id)?;
        let content = self.format_agents_doc(&doc);
        let enforcer = GateEnforcer::new();

        enforcer.enforce(&content, &doc)
    }

    /// Merge all learnings from hierarchy
    pub fn merge_hierarchy(&self, tier_id: &str) -> Result<AgentsDoc> {
        let hierarchy = self.get_hierarchy(tier_id)?;

        let mut merged = AgentsDoc::new(tier_id);

        for (_tier, doc) in hierarchy {
            merged.agents.extend(doc.agents);
        }

        Ok(merged)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_save_and_load() {
        let temp_dir = TempDir::new().unwrap();
        let manager = AgentsManager::new(temp_dir.path());

        let mut doc = AgentsDoc::new("phase1");
        doc.agents
            .push(AgentDefinition::new("Pattern 1", "pattern", "Pattern 1"));
        doc.agents.push(AgentDefinition::new(
            "Failure 1",
            "failure_mode",
            "Failure 1",
        ));

        manager.save("phase1", &doc).unwrap();
        let loaded = manager.load("phase1").unwrap();

        let patterns: Vec<_> = loaded
            .agents
            .iter()
            .filter(|a| a.role == "pattern")
            .collect();
        let failures: Vec<_> = loaded
            .agents
            .iter()
            .filter(|a| a.role == "failure_mode")
            .collect();
        assert_eq!(patterns.len(), 1);
        assert_eq!(failures.len(), 1);
    }

    #[test]
    fn test_append_pattern() {
        let temp_dir = TempDir::new().unwrap();
        let manager = AgentsManager::new(temp_dir.path());

        manager
            .append_pattern("phase1", "New pattern".to_string())
            .unwrap();

        let doc = manager.load("phase1").unwrap();
        let patterns: Vec<_> = doc.agents.iter().filter(|a| a.role == "pattern").collect();
        assert_eq!(patterns.len(), 1);
        assert_eq!(patterns[0].description, "New pattern");
    }

    #[test]
    fn test_hierarchy() {
        let temp_dir = TempDir::new().unwrap();
        let manager = AgentsManager::new(temp_dir.path());

        manager
            .append_pattern("phase1", "Phase pattern".to_string())
            .unwrap();
        manager
            .append_pattern("phase1.task1", "Task pattern".to_string())
            .unwrap();

        let merged = manager.merge_hierarchy("phase1.task1").unwrap();
        let patterns: Vec<_> = merged
            .agents
            .iter()
            .filter(|a| a.role == "pattern")
            .collect();
        assert_eq!(patterns.len(), 2);
    }
}
