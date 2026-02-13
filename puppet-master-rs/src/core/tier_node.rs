//! Tier hierarchy and tree structure for PRD management
//!
//! Uses arena-based storage for efficient tree representation.
//! Supports:
//! - Parent-child relationships
//! - DFS/BFS traversal
//! - Path computation
//! - State tracking per node

use crate::core::state_machine::TierStateMachine;
use crate::types::*;
use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};

/// A single tier node in the hierarchy
#[derive(Debug, Clone)]
pub struct TierNode {
    /// Index in the arena
    pub index: usize,
    /// Unique tier ID (e.g., "1.1.1")
    pub id: String,
    /// Tier type (Phase/Task/Subtask)
    pub tier_type: TierType,
    /// Title/name
    pub title: String,
    /// Description
    pub description: String,
    /// Parent node index (None for root)
    pub parent: Option<usize>,
    /// Children node indices
    pub children: Vec<usize>,
    /// State machine for this tier
    pub state_machine: TierStateMachine,
    /// Acceptance criteria
    pub acceptance_criteria: Vec<String>,
    /// Required files
    pub required_files: Vec<String>,
    /// Dependencies on other tier IDs
    pub dependencies: Vec<String>,
}

impl TierNode {
    /// Create new tier node
    pub fn new(
        index: usize,
        id: String,
        tier_type: TierType,
        title: String,
        description: String,
        max_iterations: u32,
    ) -> Self {
        let state_machine = TierStateMachine::new(id.clone(), tier_type, max_iterations);

        Self {
            index,
            id,
            tier_type,
            title,
            description,
            parent: None,
            children: Vec::new(),
            state_machine,
            acceptance_criteria: Vec::new(),
            required_files: Vec::new(),
            dependencies: Vec::new(),
        }
    }

    /// Check if this is a leaf node (has no children)
    pub fn is_leaf(&self) -> bool {
        self.children.is_empty()
    }

    /// Check if this is a root node (has no parent)
    pub fn is_root(&self) -> bool {
        self.parent.is_none()
    }

    /// Get depth level (0 for root, 1 for children of root, etc.)
    pub fn depth(&self) -> usize {
        match self.tier_type {
            TierType::Phase => 0,
            TierType::Task => 1,
            TierType::Subtask => 2,
            TierType::Iteration => 3,
        }
    }
}

/// Tier tree using arena-based storage
#[derive(Debug, Clone)]
pub struct TierTree {
    /// All nodes stored in a flat vector (arena)
    nodes: Vec<TierNode>,
    /// Map from tier ID to node index
    id_to_index: HashMap<String, usize>,
    /// Root node indices (phases)
    roots: Vec<usize>,
}

impl TierTree {
    /// Create empty tier tree
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            id_to_index: HashMap::new(),
            roots: Vec::new(),
        }
    }

    /// Add a new node to the tree
    pub fn add_node(
        &mut self,
        id: String,
        tier_type: TierType,
        title: String,
        description: String,
        parent_id: Option<String>,
        max_iterations: u32,
    ) -> Result<usize> {
        // Check for duplicate ID
        if self.id_to_index.contains_key(&id) {
            return Err(anyhow!("Tier ID {} already exists", id));
        }

        let index = self.nodes.len();
        let mut node = TierNode::new(
            index,
            id.clone(),
            tier_type,
            title,
            description,
            max_iterations,
        );

        // Set up parent-child relationship
        if let Some(parent_id) = parent_id {
            let parent_index = self
                .find_index_by_id(&parent_id)
                .ok_or_else(|| anyhow!("Parent tier {} not found", parent_id))?;

            node.parent = Some(parent_index);
            self.nodes[parent_index].children.push(index);
        } else {
            // This is a root node
            self.roots.push(index);
        }

        self.nodes.push(node);
        self.id_to_index.insert(id, index);

        Ok(index)
    }

    /// Find node by ID
    pub fn find_by_id(&self, id: &str) -> Option<&TierNode> {
        self.id_to_index.get(id).map(|&idx| &self.nodes[idx])
    }

    /// Find mutable node by ID
    pub fn find_by_id_mut(&mut self, id: &str) -> Option<&mut TierNode> {
        self.id_to_index
            .get(id)
            .copied()
            .map(|idx| &mut self.nodes[idx])
    }

    /// Find node index by ID
    pub fn find_index_by_id(&self, id: &str) -> Option<usize> {
        self.id_to_index.get(id).copied()
    }

    /// Get node by index
    pub fn get_node(&self, index: usize) -> Option<&TierNode> {
        self.nodes.get(index)
    }

    /// Get mutable node by index
    pub fn get_node_mut(&mut self, index: usize) -> Option<&mut TierNode> {
        self.nodes.get_mut(index)
    }

    /// Get all root nodes
    pub fn roots(&self) -> &[usize] {
        &self.roots
    }

    /// Get children of a node
    pub fn get_children(&self, node_id: &str) -> Vec<&TierNode> {
        if let Some(&index) = self.id_to_index.get(node_id) {
            self.nodes[index]
                .children
                .iter()
                .filter_map(|&idx| self.nodes.get(idx))
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Get path from root to node (list of IDs)
    pub fn get_path(&self, node_id: &str) -> Vec<String> {
        let mut path = Vec::new();

        if let Some(&mut_index) = self.id_to_index.get(node_id) {
            let mut current_index = mut_index;

            loop {
                let node = &self.nodes[current_index];
                path.push(node.id.clone());

                match node.parent {
                    Some(parent_idx) => current_index = parent_idx,
                    None => break,
                }
            }
        }

        path.reverse();
        path
    }

    /// Get path string (e.g., "Phase 1 > Task 1.1 > Subtask 1.1.1")
    pub fn get_path_string(&self, node_id: &str) -> String {
        let path = self.get_path(node_id);
        path.iter()
            .filter_map(|id| self.find_by_id(id))
            .map(|node| node.title.clone())
            .collect::<Vec<_>>()
            .join(" > ")
    }

    /// Get next pending leaf node (DFS order)
    pub fn get_next_pending(&self) -> Option<&TierNode> {
        for &root_idx in &self.roots {
            if let Some(node) = self.find_next_pending_from(root_idx) {
                return Some(node);
            }
        }
        None
    }

    /// Find next pending node from a starting point (DFS)
    fn find_next_pending_from(&self, start_idx: usize) -> Option<&TierNode> {
        let node = &self.nodes[start_idx];

        // If this node is pending and is a leaf, return it
        if node.is_leaf() && node.state_machine.current_state() == TierState::Pending {
            return Some(node);
        }

        // Otherwise, search children in order
        for &child_idx in &node.children {
            if let Some(found) = self.find_next_pending_from(child_idx) {
                return Some(found);
            }
        }

        None
    }

    /// Iterate all nodes in DFS order
    pub fn iter_dfs(&self) -> impl Iterator<Item = &TierNode> {
        let mut stack: Vec<usize> = self.roots.iter().rev().copied().collect();
        let mut result = Vec::new();

        while let Some(idx) = stack.pop() {
            let node = &self.nodes[idx];
            result.push(node);

            // Push children in reverse order so they're popped in correct order
            for &child_idx in node.children.iter().rev() {
                stack.push(child_idx);
            }
        }

        result.into_iter()
    }

    /// Iterate all nodes in BFS order
    pub fn iter_bfs(&self) -> impl Iterator<Item = &TierNode> {
        let mut queue: VecDeque<usize> = self.roots.iter().copied().collect();
        let mut result = Vec::new();

        while let Some(idx) = queue.pop_front() {
            let node = &self.nodes[idx];
            result.push(node);

            for &child_idx in &node.children {
                queue.push_back(child_idx);
            }
        }

        result.into_iter()
    }

    /// Get all leaf nodes (subtasks)
    pub fn get_leaves(&self) -> Vec<&TierNode> {
        self.nodes.iter().filter(|n| n.is_leaf()).collect()
    }

    /// Check if all children of a node have passed
    pub fn all_children_passed(&self, node_id: &str) -> bool {
        let children = self.get_children(node_id);

        if children.is_empty() {
            return false;
        }

        children
            .iter()
            .all(|child| child.state_machine.current_state() == TierState::Passed)
    }

    /// Count nodes by state
    pub fn count_by_state(&self, state: TierState) -> usize {
        self.nodes
            .iter()
            .filter(|n| n.state_machine.current_state() == state)
            .count()
    }

    /// Get summary statistics
    pub fn get_stats(&self) -> TreeStats {
        TreeStats {
            total_nodes: self.nodes.len(),
            phases: self.count_by_type(TierType::Phase),
            tasks: self.count_by_type(TierType::Task),
            subtasks: self.count_by_type(TierType::Subtask),
            pending: self.count_by_state(TierState::Pending),
            running: self.count_by_state(TierState::Running),
            passed: self.count_by_state(TierState::Passed),
            failed: self.count_by_state(TierState::Failed),
            escalated: self.count_by_state(TierState::Escalated),
        }
    }

    fn count_by_type(&self, tier_type: TierType) -> usize {
        self.nodes
            .iter()
            .filter(|n| n.tier_type == tier_type)
            .count()
    }

    /// Build tree from PRD data
    pub fn from_prd(prd: &PRD, max_iterations: u32) -> Result<Self> {
        let mut tree = TierTree::new();

        // Add phases
        for phase in &prd.phases {
            let phase_idx = tree.add_node(
                phase.id.clone(),
                TierType::Phase,
                phase.title.clone(),
                phase.description.clone().unwrap_or_default(),
                None,
                max_iterations,
            )?;

            if let Some(node) = tree.get_node_mut(phase_idx) {
                node.dependencies = phase.dependencies.clone();
            }

            // Add tasks
            for task in &phase.tasks {
                let task_idx = tree.add_node(
                    task.id.clone(),
                    TierType::Task,
                    task.title.clone(),
                    task.description.clone().unwrap_or_default(),
                    Some(phase.id.clone()),
                    max_iterations,
                )?;

                if let Some(node) = tree.get_node_mut(task_idx) {
                    node.dependencies = task.dependencies.clone();
                }

                // Add subtasks
                for subtask in &task.subtasks {
                    let subtask_idx = tree.add_node(
                        subtask.id.clone(),
                        TierType::Subtask,
                        subtask.title.clone(),
                        subtask.description.clone().unwrap_or_default(),
                        Some(task.id.clone()),
                        max_iterations,
                    )?;

                    if let Some(node) = tree.get_node_mut(subtask_idx) {
                        node.acceptance_criteria = subtask.acceptance_criteria.clone();
                    }
                }
            }
        }

        Ok(tree)
    }
}

impl Default for TierTree {
    fn default() -> Self {
        Self::new()
    }
}

/// Tree statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeStats {
    pub total_nodes: usize,
    pub phases: usize,
    pub tasks: usize,
    pub subtasks: usize,
    pub pending: usize,
    pub running: usize,
    pub passed: usize,
    pub failed: usize,
    pub escalated: usize,
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_tree() -> TierTree {
        let mut tree = TierTree::new();

        // Phase 1
        tree.add_node(
            "1".to_string(),
            TierType::Phase,
            "Phase 1".to_string(),
            "First phase".to_string(),
            None,
            3,
        )
        .unwrap();

        // Task 1.1
        tree.add_node(
            "1.1".to_string(),
            TierType::Task,
            "Task 1.1".to_string(),
            "First task".to_string(),
            Some("1".to_string()),
            3,
        )
        .unwrap();

        // Subtask 1.1.1
        tree.add_node(
            "1.1.1".to_string(),
            TierType::Subtask,
            "Subtask 1.1.1".to_string(),
            "First subtask".to_string(),
            Some("1.1".to_string()),
            3,
        )
        .unwrap();

        // Subtask 1.1.2
        tree.add_node(
            "1.1.2".to_string(),
            TierType::Subtask,
            "Subtask 1.1.2".to_string(),
            "Second subtask".to_string(),
            Some("1.1".to_string()),
            3,
        )
        .unwrap();

        tree
    }

    #[test]
    fn test_add_node() {
        let tree = create_test_tree();
        assert_eq!(tree.nodes.len(), 4);
        assert_eq!(tree.roots.len(), 1);
    }

    #[test]
    fn test_find_by_id() {
        let tree = create_test_tree();
        let node = tree.find_by_id("1.1.1").unwrap();
        assert_eq!(node.title, "Subtask 1.1.1");
        assert_eq!(node.tier_type, TierType::Subtask);
    }

    #[test]
    fn test_get_children() {
        let tree = create_test_tree();
        let children = tree.get_children("1.1");
        assert_eq!(children.len(), 2);
        assert_eq!(children[0].id, "1.1.1");
        assert_eq!(children[1].id, "1.1.2");
    }

    #[test]
    fn test_get_path() {
        let tree = create_test_tree();
        let path = tree.get_path("1.1.2");
        assert_eq!(path, vec!["1", "1.1", "1.1.2"]);
    }

    #[test]
    fn test_get_path_string() {
        let tree = create_test_tree();
        let path_str = tree.get_path_string("1.1.2");
        assert_eq!(path_str, "Phase 1 > Task 1.1 > Subtask 1.1.2");
    }

    #[test]
    fn test_get_leaves() {
        let tree = create_test_tree();
        let leaves = tree.get_leaves();
        assert_eq!(leaves.len(), 2);
        assert!(leaves.iter().all(|n| n.tier_type == TierType::Subtask));
    }

    #[test]
    fn test_iter_dfs() {
        let tree = create_test_tree();
        let ids: Vec<String> = tree.iter_dfs().map(|n| n.id.clone()).collect();
        assert_eq!(ids, vec!["1", "1.1", "1.1.1", "1.1.2"]);
    }

    #[test]
    fn test_iter_bfs() {
        let tree = create_test_tree();
        let ids: Vec<String> = tree.iter_bfs().map(|n| n.id.clone()).collect();
        assert_eq!(ids, vec!["1", "1.1", "1.1.1", "1.1.2"]);
    }

    #[test]
    fn test_get_stats() {
        let tree = create_test_tree();
        let stats = tree.get_stats();
        assert_eq!(stats.total_nodes, 4);
        assert_eq!(stats.phases, 1);
        assert_eq!(stats.tasks, 1);
        assert_eq!(stats.subtasks, 2);
        assert_eq!(stats.pending, 4);
    }

    #[test]
    fn test_duplicate_id() {
        let mut tree = TierTree::new();
        tree.add_node(
            "1".to_string(),
            TierType::Phase,
            "Phase 1".to_string(),
            "Test".to_string(),
            None,
            3,
        )
        .unwrap();

        let result = tree.add_node(
            "1".to_string(),
            TierType::Phase,
            "Phase 1 Dup".to_string(),
            "Test".to_string(),
            None,
            3,
        );

        assert!(result.is_err());
    }
}
