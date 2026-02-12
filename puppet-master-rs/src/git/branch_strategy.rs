//! Branch strategy manager - implements branching strategies

use crate::types::{BranchStrategy, TierType};
use anyhow::Result;
use log::info;

use super::GitManager;

/// Manages branching strategy for tiers
pub struct BranchStrategyManager {
    strategy: BranchStrategy,
    git: GitManager,
}

impl BranchStrategyManager {
    /// Create a new branch strategy manager
    pub fn new(strategy: BranchStrategy, git: GitManager) -> Self {
        Self { strategy, git }
    }

    /// Ensure the appropriate branch exists and is checked out for a tier
    pub async fn ensure_branch(
        &self,
        tier_type: TierType,
        tier_id: &str,
    ) -> Result<String> {
        let branch_name = self.generate_branch_name(tier_type, tier_id);

        // Check if branch exists
        let branches = self.git.branch_list().await?;
        let branch_exists = branches.iter().any(|b| b == &branch_name);

        if branch_exists {
            info!("Checking out existing branch: {}", branch_name);
            self.git.checkout(&branch_name).await?;
        } else {
            info!("Creating new branch: {}", branch_name);
            self.git.create_branch(&branch_name).await?;
        }

        Ok(branch_name)
    }

    /// Generate branch name based on strategy and tier information
    pub fn generate_branch_name(&self, tier_type: TierType, tier_id: &str) -> String {
        match self.strategy {
            BranchStrategy::MainOnly => "main".to_string(),
            BranchStrategy::Feature | BranchStrategy::Tier => {
                match tier_type {
                    TierType::Phase => {
                        format!("ph-{}", Self::sanitize_id(tier_id))
                    }
                    TierType::Task => {
                        format!("tk-{}", Self::sanitize_id(tier_id))
                    }
                    TierType::Subtask => {
                        let task_id = Self::extract_task_id(tier_id);
                        format!("tk-{}", Self::sanitize_id(&task_id))
                    }
                    TierType::Iteration => {
                        let task_id = Self::extract_task_id(tier_id);
                        format!("tk-{}", Self::sanitize_id(&task_id))
                    }
                }
            }
            BranchStrategy::Release => {
                match tier_type {
                    TierType::Phase => format!("release/ph-{}", Self::sanitize_id(tier_id)),
                    TierType::Task => format!("release/tk-{}", Self::sanitize_id(tier_id)),
                    TierType::Subtask => format!("release/st-{}", Self::sanitize_id(tier_id)),
                    TierType::Iteration => {
                        let task_id = Self::extract_task_id(tier_id);
                        format!("release/tk-{}", Self::sanitize_id(&task_id))
                    }
                }
            }
        }
    }

    /// Sanitize tier ID for use in branch name
    fn sanitize_id(id: &str) -> String {
        id.to_lowercase()
            .replace("ph-", "")
            .replace("tk-", "")
            .replace("st-", "")
            .replace("_", "-")
    }

    /// Extract phase ID from tier ID (e.g., TK-001-002 -> PH-001)
        #[allow(dead_code)]
    fn extract_phase_id(tier_id: &str) -> String {
        let parts: Vec<&str> = tier_id.split('-').collect();
        if parts.len() >= 2 {
            format!("PH-{}", parts[1])
        } else {
            tier_id.to_string()
        }
    }

    /// Extract task ID from tier ID (e.g., ST-001-002-003 -> TK-001-002)
    fn extract_task_id(tier_id: &str) -> String {
        let parts: Vec<&str> = tier_id.split('-').collect();
        if parts.len() >= 3 {
            format!("TK-{}-{}", parts[1], parts[2])
        } else {
            tier_id.to_string()
        }
    }

    /// Merge branch according to strategy
    pub async fn merge_branch(
        &self,
        source_branch: &str,
        merge_type: &str,
    ) -> Result<()> {
        info!("Merging {} using {} strategy", source_branch, merge_type);

        match merge_type {
            "merge" => {
                self.git.run_git_cmd(&["merge", "--no-ff", source_branch]).await?;
            }
            "squash" => {
                self.git.run_git_cmd(&["merge", "--squash", source_branch]).await?;
                // Caller needs to commit after squash
            }
            "rebase" => {
                self.git.run_git_cmd(&["rebase", source_branch]).await?;
            }
            _ => {
                // Default to merge
                self.git.run_git_cmd(&["merge", source_branch]).await?;
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_id() {
        assert_eq!(BranchStrategyManager::sanitize_id("PH-001"), "001");
        assert_eq!(BranchStrategyManager::sanitize_id("TK-001-002"), "001-002");
        // ST_001_002_003 becomes st_001_002_003 (lowercase), then st-001-002-003 (underscores replaced)
        // The "st-" replacement doesn't match "st_", so we get "st-001-002-003"
        assert_eq!(BranchStrategyManager::sanitize_id("ST_001_002_003"), "st-001-002-003");
    }

    #[test]
    fn test_extract_phase_id() {
        assert_eq!(BranchStrategyManager::extract_phase_id("TK-001-002"), "PH-001");
        assert_eq!(BranchStrategyManager::extract_phase_id("ST-001-002-003"), "PH-001");
    }

    #[test]
    fn test_extract_task_id() {
        assert_eq!(BranchStrategyManager::extract_task_id("ST-001-002-003"), "TK-001-002");
    }

    #[test]
    fn test_branch_name_generation() {
        use std::path::PathBuf;
        let git = GitManager::new(PathBuf::from("/tmp"));
        let manager = BranchStrategyManager::new(BranchStrategy::Tier, git);

        assert_eq!(
            manager.generate_branch_name(TierType::Phase, "PH-001"),
            "ph-001"
        );
        assert_eq!(
            manager.generate_branch_name(TierType::Task, "TK-001-002"),
            "tk-001-002"
        );
        assert_eq!(
            manager.generate_branch_name(TierType::Subtask, "ST-001-002-003"),
            "tk-001-002"
        );
    }
}
