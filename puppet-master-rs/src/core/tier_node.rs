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
use log::warn;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::fs;
use std::path::{Path, PathBuf};

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

/// Test strategy item from interview-generated JSON
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TestStrategyItem {
    pub id: String,
    pub source_phase_id: String,
    pub criterion: String,
    pub test_type: String,
    pub test_file: String,
    pub test_name: String,
    pub verification_command: String,
}

/// Test strategy JSON schema
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TestStrategyJson {
    pub project: String,
    pub generated_at: String,
    pub coverage_level: String,
    pub items: Vec<TestStrategyItem>,
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

    /// Load test strategy from interview-generated JSON file
    ///
    /// Attempts to load `.puppet-master/interview/test-strategy.json` relative to the base path.
    /// Returns None if file doesn't exist or can't be parsed (with a warning logged).
    fn load_test_strategy(base_path: Option<&Path>) -> Option<TestStrategyJson> {
        let strategy_path = if let Some(base) = base_path {
            base.join(".puppet-master/interview/test-strategy.json")
        } else {
            PathBuf::from(".puppet-master/interview/test-strategy.json")
        };

        if !strategy_path.exists() {
            return None;
        }

        match fs::read_to_string(&strategy_path) {
            Ok(content) => match serde_json::from_str::<TestStrategyJson>(&content) {
                Ok(strategy) => {
                    log::info!(
                        "Loaded test strategy from {} with {} items",
                        strategy_path.display(),
                        strategy.items.len()
                    );
                    Some(strategy)
                }
                Err(e) => {
                    warn!(
                        "Failed to parse test strategy JSON at {}: {}",
                        strategy_path.display(),
                        e
                    );
                    None
                }
            },
            Err(e) => {
                warn!(
                    "Failed to read test strategy file at {}: {}",
                    strategy_path.display(),
                    e
                );
                None
            }
        }
    }

    /// Map test strategy phase ID to tier ID
    ///
    /// Test strategy uses phase IDs like "product_ux", "security_secrets"
    /// We need to map these to actual tier IDs in the PRD structure
    fn map_phase_id_to_tier_id(phase_id: &str, prd: &PRD) -> Option<String> {
        // First try exact match
        for phase in &prd.phases {
            if phase.id == phase_id {
                return Some(phase.id.clone());
            }
        }

        // Try matching by title/description (case-insensitive)
        let phase_id_lower = phase_id.to_lowercase();
        let phase_id_spaces = phase_id_lower.replace('_', " ").replace('-', " ");
        for phase in &prd.phases {
            let title_lower = phase.title.to_lowercase();
            let description_lower = phase.description.as_ref().map(|d| d.to_lowercase());

            if title_lower.contains(&phase_id_lower)
                || title_lower.contains(&phase_id_spaces)
                || description_lower.as_ref().map_or(false, |d| {
                    d.contains(&phase_id_lower) || d.contains(&phase_id_spaces)
                })
            {
                return Some(phase.id.clone());
            }
        }

        None
    }

    /// Build tree from PRD data
    pub fn from_prd(prd: &PRD, max_iterations: u32) -> Result<Self> {
        Self::from_prd_with_base_path(prd, max_iterations, None)
    }

    /// Build tree from PRD data with optional base path for test strategy loading
    pub fn from_prd_with_base_path(
        prd: &PRD,
        max_iterations: u32,
        base_path: Option<&Path>,
    ) -> Result<Self> {
        let mut tree = TierTree::new();

        // Try to load test strategy JSON
        let test_strategy = Self::load_test_strategy(base_path);

        // Build a map of tier IDs to additional criteria from test strategy
        let mut criteria_map: HashMap<String, Vec<String>> = HashMap::new();

        if let Some(strategy) = &test_strategy {
            for item in &strategy.items {
                // Try to map the source phase ID to a tier ID
                if let Some(tier_id) = Self::map_phase_id_to_tier_id(&item.source_phase_id, prd) {
                    criteria_map
                        .entry(tier_id)
                        .or_insert_with(Vec::new)
                        .push(item.criterion.clone());
                } else {
                    // If we can't map it, try using it directly as a tier ID
                    criteria_map
                        .entry(item.source_phase_id.clone())
                        .or_insert_with(Vec::new)
                        .push(item.criterion.clone());
                }
            }

            if !criteria_map.is_empty() {
                log::info!(
                    "Merged test strategy criteria into {} tier(s)",
                    criteria_map.len()
                );
            }
        }

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

                // Merge test strategy criteria for this phase
                if let Some(additional_criteria) = criteria_map.get(&phase.id) {
                    node.acceptance_criteria
                        .extend(additional_criteria.iter().cloned());
                }
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

                    // Merge test strategy criteria for this task
                    if let Some(additional_criteria) = criteria_map.get(&task.id) {
                        node.acceptance_criteria
                            .extend(additional_criteria.iter().cloned());
                    }
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
                        // Start with PRD acceptance criteria
                        node.acceptance_criteria = subtask.acceptance_criteria.clone();

                        // Merge test strategy criteria for this subtask
                        if let Some(additional_criteria) = criteria_map.get(&subtask.id) {
                            node.acceptance_criteria
                                .extend(additional_criteria.iter().cloned());
                        }
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

    #[test]
    fn test_from_prd_without_test_strategy() {
        // Test that from_prd works without a test strategy file
        let prd = PRD {
            metadata: PRDMetadata {
                name: "Test Project".to_string(),
                description: Some("Test description".to_string()),
                version: "1.0.0".to_string(),
                total_tasks: 1,
                total_subtasks: 1,
                completed_count: 0,
                total_tests: 0,
                passed_tests: 0,
                created_at: None,
                updated_at: None,
            },
            phases: vec![Phase {
                id: "phase1".to_string(),
                title: "Phase 1".to_string(),
                goal: None,
                description: Some("Test phase".to_string()),
                status: ItemStatus::Pending,
                tasks: vec![Task {
                    id: "task1".to_string(),
                    title: "Task 1".to_string(),
                    description: Some("Test task".to_string()),
                    status: ItemStatus::Pending,
                    subtasks: vec![Subtask {
                        id: "subtask1".to_string(),
                        task_id: "task1".to_string(),
                        title: "Subtask 1".to_string(),
                        description: Some("Test subtask".to_string()),
                        criterion: None,
                        status: ItemStatus::Pending,
                        iterations: 0,
                        evidence: vec![],
                        plan: None,
                        acceptance_criteria: vec!["PRD criterion 1".to_string()],
                        iteration_records: vec![],
                    }],
                    evidence: vec![],
                    gate_reports: vec![],
                    dependencies: vec![],
                    complexity: None,
                    task_type: None,
                }],
                iterations: 0,
                evidence: vec![],
                gate_report: None,
                orchestrator_state: None,
                orchestrator_context: None,
                dependencies: vec![],
            }],
        };

        let tree = TierTree::from_prd(&prd, 3).unwrap();
        assert_eq!(tree.nodes.len(), 3); // phase + task + subtask

        // Verify PRD criteria are preserved
        let subtask = tree.find_by_id("subtask1").unwrap();
        assert_eq!(subtask.acceptance_criteria.len(), 1);
        assert_eq!(subtask.acceptance_criteria[0], "PRD criterion 1");
    }

    #[test]
    fn test_from_prd_with_test_strategy() {
        use tempfile::TempDir;

        // Create a temporary directory with test strategy
        let temp_dir = TempDir::new().unwrap();
        let strategy_dir = temp_dir.path().join(".puppet-master/interview");
        fs::create_dir_all(&strategy_dir).unwrap();

        // Write test strategy JSON
        let test_strategy = TestStrategyJson {
            project: "Test Project".to_string(),
            generated_at: "2024-01-01T00:00:00Z".to_string(),
            coverage_level: "Standard".to_string(),
            items: vec![
                TestStrategyItem {
                    id: "TEST-001".to_string(),
                    source_phase_id: "phase1".to_string(),
                    criterion: "Test strategy criterion 1".to_string(),
                    test_type: "unit".to_string(),
                    test_file: "tests/test1.rs".to_string(),
                    test_name: "test_something".to_string(),
                    verification_command: "cargo test".to_string(),
                },
                TestStrategyItem {
                    id: "TEST-002".to_string(),
                    source_phase_id: "subtask1".to_string(),
                    criterion: "Test strategy criterion 2".to_string(),
                    test_type: "integration".to_string(),
                    test_file: "tests/test2.rs".to_string(),
                    test_name: "test_integration".to_string(),
                    verification_command: "cargo test --test integration".to_string(),
                },
            ],
        };

        let json_path = strategy_dir.join("test-strategy.json");
        fs::write(
            &json_path,
            serde_json::to_string_pretty(&test_strategy).unwrap(),
        )
        .unwrap();

        // Create PRD
        let prd = PRD {
            metadata: PRDMetadata {
                name: "Test Project".to_string(),
                description: Some("Test description".to_string()),
                version: "1.0.0".to_string(),
                total_tasks: 1,
                total_subtasks: 1,
                completed_count: 0,
                total_tests: 0,
                passed_tests: 0,
                created_at: None,
                updated_at: None,
            },
            phases: vec![Phase {
                id: "phase1".to_string(),
                title: "Phase 1".to_string(),
                goal: None,
                description: Some("Test phase".to_string()),
                status: ItemStatus::Pending,
                tasks: vec![Task {
                    id: "task1".to_string(),
                    title: "Task 1".to_string(),
                    description: Some("Test task".to_string()),
                    status: ItemStatus::Pending,
                    subtasks: vec![Subtask {
                        id: "subtask1".to_string(),
                        task_id: "task1".to_string(),
                        title: "Subtask 1".to_string(),
                        description: Some("Test subtask".to_string()),
                        criterion: None,
                        status: ItemStatus::Pending,
                        iterations: 0,
                        evidence: vec![],
                        plan: None,
                        acceptance_criteria: vec!["PRD criterion 1".to_string()],
                        iteration_records: vec![],
                    }],
                    evidence: vec![],
                    gate_reports: vec![],
                    dependencies: vec![],
                    complexity: None,
                    task_type: None,
                }],
                iterations: 0,
                evidence: vec![],
                gate_report: None,
                orchestrator_state: None,
                orchestrator_context: None,
                dependencies: vec![],
            }],
        };

        // Build tree with test strategy
        let tree = TierTree::from_prd_with_base_path(&prd, 3, Some(temp_dir.path())).unwrap();

        // Verify phase has merged criterion
        let phase = tree.find_by_id("phase1").unwrap();
        assert_eq!(phase.acceptance_criteria.len(), 1);
        assert!(phase.acceptance_criteria[0].contains("Test strategy criterion 1"));

        // Verify subtask has both PRD and test strategy criteria
        let subtask = tree.find_by_id("subtask1").unwrap();
        assert_eq!(subtask.acceptance_criteria.len(), 2);
        assert_eq!(subtask.acceptance_criteria[0], "PRD criterion 1");
        assert!(subtask.acceptance_criteria[1].contains("Test strategy criterion 2"));
    }

    #[test]
    fn test_load_test_strategy_missing_file() {
        use tempfile::TempDir;

        let temp_dir = TempDir::new().unwrap();
        let result = TierTree::load_test_strategy(Some(temp_dir.path()));
        assert!(result.is_none());
    }

    #[test]
    fn test_load_test_strategy_invalid_json() {
        use tempfile::TempDir;

        let temp_dir = TempDir::new().unwrap();
        let strategy_dir = temp_dir.path().join(".puppet-master/interview");
        fs::create_dir_all(&strategy_dir).unwrap();

        let json_path = strategy_dir.join("test-strategy.json");
        fs::write(&json_path, "{ invalid json }").unwrap();

        let result = TierTree::load_test_strategy(Some(temp_dir.path()));
        assert!(result.is_none());
    }

    #[test]
    fn test_map_phase_id_to_tier_id() {
        let prd = PRD {
            metadata: PRDMetadata {
                name: "Test Project".to_string(),
                description: Some("Test description".to_string()),
                version: "1.0.0".to_string(),
                total_tasks: 0,
                total_subtasks: 0,
                completed_count: 0,
                total_tests: 0,
                passed_tests: 0,
                created_at: None,
                updated_at: None,
            },
            phases: vec![
                Phase {
                    id: "security_secrets".to_string(),
                    title: "Security & Secrets".to_string(),
                    goal: None,
                    description: Some("Security phase".to_string()),
                    status: ItemStatus::Pending,
                    tasks: vec![],
                    iterations: 0,
                    evidence: vec![],
                    gate_report: None,
                    orchestrator_state: None,
                    orchestrator_context: None,
                    dependencies: vec![],
                },
                Phase {
                    id: "phase2".to_string(),
                    title: "Product UX".to_string(),
                    goal: None,
                    description: Some("UX design phase".to_string()),
                    status: ItemStatus::Pending,
                    tasks: vec![],
                    iterations: 0,
                    evidence: vec![],
                    gate_report: None,
                    orchestrator_state: None,
                    orchestrator_context: None,
                    dependencies: vec![],
                },
            ],
        };

        // Test exact match
        assert_eq!(
            TierTree::map_phase_id_to_tier_id("security_secrets", &prd),
            Some("security_secrets".to_string())
        );

        // Test title matching
        assert_eq!(
            TierTree::map_phase_id_to_tier_id("product_ux", &prd),
            Some("phase2".to_string())
        );

        // Test no match
        assert_eq!(TierTree::map_phase_id_to_tier_id("nonexistent", &prd), None);
    }
}
