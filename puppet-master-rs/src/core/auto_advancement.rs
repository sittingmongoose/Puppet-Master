//! Auto-advancement logic for tier progression
//!
//! Determines when and how to advance through the tier hierarchy:
//! - Advance to next subtask within task
//! - Advance to next task within phase
//! - Advance to next phase
//! - Complete entire orchestration

use crate::core::tier_node::{TierNode, TierTree};
use crate::types::*;
use anyhow::{Result, anyhow};

// DRY:DATA:AdvancementEngine
/// Auto-advancement engine
#[derive(Debug)]
pub struct AdvancementEngine;

impl AdvancementEngine {
    // DRY:FN:new
    /// Create new advancement engine
    pub fn new() -> Self {
        Self
    }
    // DRY:FN:determine_advancement

    /// Determine next action after completing a tier
    pub fn determine_advancement(
        &self,
        tree: &TierTree,
        current_tier_id: &str,
    ) -> Result<AdvancementResult> {
        let node = tree
            .find_by_id(current_tier_id)
            .ok_or_else(|| anyhow!("Tier {} not found", current_tier_id))?;

        // Verify current tier is passed
        if node.state_machine.current_state() != TierState::Passed {
            return Ok(AdvancementResult::new(
                false,
                format!("Tier {} not in Passed state", current_tier_id),
            ));
        }

        // Find next sibling or advance to parent
        match node.tier_type {
            TierType::Subtask => self.advance_from_subtask(tree, node),
            TierType::Task => self.advance_from_task(tree, node),
            TierType::Phase => self.advance_from_phase(tree, node),
            TierType::Iteration => Ok(AdvancementResult::new(true, "Iteration complete")),
        }
    }

    /// Advance from a completed subtask
    fn advance_from_subtask(&self, tree: &TierTree, node: &TierNode) -> Result<AdvancementResult> {
        let parent_idx = node
            .parent
            .ok_or_else(|| anyhow!("Subtask {} has no parent", node.id))?;
        let parent_task = tree
            .get_node(parent_idx)
            .ok_or_else(|| anyhow!("Parent task not found"))?;

        let siblings = &parent_task.children;
        let current_pos = siblings
            .iter()
            .position(|&idx| idx == node.index)
            .ok_or_else(|| anyhow!("Current node not in parent's children"))?;

        if current_pos + 1 < siblings.len() {
            let next_idx = siblings[current_pos + 1];
            let next_node = tree
                .get_node(next_idx)
                .ok_or_else(|| anyhow!("Next subtask not found"))?;

            return Ok(AdvancementResult::new(
                true,
                format!("Advance to next subtask: {}", next_node.id),
            ));
        }

        if self.all_children_passed(tree, &parent_task.children) {
            self.advance_from_task(tree, parent_task)
        } else {
            Ok(AdvancementResult::new(
                false,
                "Some subtasks not complete yet",
            ))
        }
    }

    /// Advance from a completed task
    fn advance_from_task(&self, tree: &TierTree, node: &TierNode) -> Result<AdvancementResult> {
        let parent_idx = node
            .parent
            .ok_or_else(|| anyhow!("Task {} has no parent", node.id))?;
        let parent_phase = tree
            .get_node(parent_idx)
            .ok_or_else(|| anyhow!("Parent phase not found"))?;

        let siblings = &parent_phase.children;
        let current_pos = siblings
            .iter()
            .position(|&idx| idx == node.index)
            .ok_or_else(|| anyhow!("Current node not in parent's children"))?;

        if current_pos + 1 < siblings.len() {
            let next_task_idx = siblings[current_pos + 1];
            let next_task = tree
                .get_node(next_task_idx)
                .ok_or_else(|| anyhow!("Next task not found"))?;

            return Ok(AdvancementResult::new(
                true,
                format!("Advance to next task: {}", next_task.id),
            ));
        }

        if self.all_children_passed(tree, &parent_phase.children) {
            self.advance_from_phase(tree, parent_phase)
        } else {
            Ok(AdvancementResult::new(false, "Some tasks not complete yet"))
        }
    }

    /// Advance from a completed phase
    fn advance_from_phase(&self, tree: &TierTree, node: &TierNode) -> Result<AdvancementResult> {
        let roots = tree.roots();
        let current_pos = roots
            .iter()
            .position(|&idx| idx == node.index)
            .ok_or_else(|| anyhow!("Current phase not in roots"))?;

        if current_pos + 1 < roots.len() {
            let next_phase_idx = roots[current_pos + 1];
            let next_phase = tree
                .get_node(next_phase_idx)
                .ok_or_else(|| anyhow!("Next phase not found"))?;

            return Ok(AdvancementResult::new(
                true,
                format!("Advance to next phase: {}", next_phase.id),
            ));
        }

        // No more phases, check if all phases are complete
        if roots
            .iter()
            .all(|&idx| self.all_children_passed_recursive(tree, idx))
        {
            Ok(AdvancementResult::new(true, "All work complete"))
        } else {
            Ok(AdvancementResult::new(
                false,
                "Some phases not complete yet",
            ))
        }
    }

    /// Check if all children have passed
    fn all_children_passed(&self, tree: &TierTree, children: &[usize]) -> bool {
        children.iter().all(|&idx| {
            if let Some(node) = tree.get_node(idx) {
                node.state_machine.current_state() == TierState::Passed
            } else {
                false
            }
        })
    }

    /// Recursively check if node and all descendants have passed
    fn all_children_passed_recursive(&self, tree: &TierTree, node_idx: usize) -> bool {
        if let Some(node) = tree.get_node(node_idx) {
            if node.is_leaf() {
                node.state_machine.current_state() == TierState::Passed
            } else {
                self.all_children_passed(tree, &node.children)
                    && node
                        .children
                        .iter()
                        .all(|&idx| self.all_children_passed_recursive(tree, idx))
            }
        } else {
            false
        }
    }
    // DRY:FN:get_next_executable

    /// Get next tier to execute (finds first pending subtask)
    pub fn get_next_executable(&self, tree: &TierTree) -> Option<String> {
        tree.get_next_pending().map(|node| node.id.clone())
    }
    // DRY:FN:is_complete

    /// Check if orchestration is complete
    pub fn is_complete(&self, tree: &TierTree) -> bool {
        let roots = tree.roots();
        roots
            .iter()
            .all(|&idx| self.all_children_passed_recursive(tree, idx))
    }
}

impl Default for AdvancementEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_tree() -> TierTree {
        let mut tree = TierTree::new();

        tree.add_node(
            "1".to_string(),
            TierType::Phase,
            "Phase 1".to_string(),
            "First phase".to_string(),
            None,
            3,
        )
        .unwrap();

        tree.add_node(
            "1.1".to_string(),
            TierType::Task,
            "Task 1.1".to_string(),
            "First task".to_string(),
            Some("1".to_string()),
            3,
        )
        .unwrap();

        tree.add_node(
            "1.1.1".to_string(),
            TierType::Subtask,
            "Subtask 1.1.1".to_string(),
            "First subtask".to_string(),
            Some("1.1".to_string()),
            3,
        )
        .unwrap();

        tree.add_node(
            "1.1.2".to_string(),
            TierType::Subtask,
            "Subtask 1.1.2".to_string(),
            "Second subtask".to_string(),
            Some("1.1".to_string()),
            3,
        )
        .unwrap();

        tree.add_node(
            "1.2".to_string(),
            TierType::Task,
            "Task 1.2".to_string(),
            "Second task".to_string(),
            Some("1".to_string()),
            3,
        )
        .unwrap();

        tree.add_node(
            "1.2.1".to_string(),
            TierType::Subtask,
            "Subtask 1.2.1".to_string(),
            "Third subtask".to_string(),
            Some("1.2".to_string()),
            3,
        )
        .unwrap();

        tree
    }

    #[test]
    fn test_advance_from_subtask_to_next_subtask() -> Result<()> {
        let mut tree = create_test_tree();
        let engine = AdvancementEngine::new();

        if let Some(node) = tree.find_by_id_mut("1.1.1") {
            node.state_machine
                .send(crate::core::state_machine::TierEvent::StartPlanning)?;
            node.state_machine
                .send(crate::core::state_machine::TierEvent::StartExecution)?;
            node.state_machine
                .send(crate::core::state_machine::TierEvent::Complete)?;
            node.state_machine
                .send(crate::core::state_machine::TierEvent::GatePass)?;
        }

        let result = engine.determine_advancement(&tree, "1.1.1")?;
        assert!(result.should_advance);

        Ok(())
    }

    #[test]
    fn test_advance_from_last_subtask_to_next_task() -> Result<()> {
        let mut tree = create_test_tree();
        let engine = AdvancementEngine::new();

        for tier_id in &["1.1.1", "1.1.2"] {
            if let Some(node) = tree.find_by_id_mut(tier_id) {
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::StartPlanning)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::StartExecution)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::Complete)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::GatePass)?;
            }
        }

        let result = engine.determine_advancement(&tree, "1.1.2")?;
        assert!(result.should_advance);

        Ok(())
    }

    #[test]
    fn test_get_next_executable() {
        let tree = create_test_tree();
        let engine = AdvancementEngine::new();

        let next = engine.get_next_executable(&tree);
        assert_eq!(next, Some("1.1.1".to_string()));
    }

    #[test]
    fn test_is_complete_false() {
        let tree = create_test_tree();
        let engine = AdvancementEngine::new();

        assert!(!engine.is_complete(&tree));
    }

    #[test]
    fn test_is_complete_true() -> Result<()> {
        let mut tree = create_test_tree();
        let engine = AdvancementEngine::new();

        // Pass all subtasks
        for tier_id in &["1.1.1", "1.1.2", "1.2.1"] {
            if let Some(node) = tree.find_by_id_mut(tier_id) {
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::StartPlanning)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::StartExecution)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::Complete)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::GatePass)?;
            }
        }

        // Also pass parent tasks and phase (is_complete checks all nodes)
        for tier_id in &["1.1", "1.2", "1"] {
            if let Some(node) = tree.find_by_id_mut(tier_id) {
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::StartPlanning)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::StartExecution)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::Complete)?;
                node.state_machine
                    .send(crate::core::state_machine::TierEvent::GatePass)?;
            }
        }

        assert!(engine.is_complete(&tree));

        Ok(())
    }
}
