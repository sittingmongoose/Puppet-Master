//! Dependency analysis and topological sorting
//!
//! Analyzes subtask dependencies and builds execution levels for parallel execution with:
//! - Topological sorting using Kahn's algorithm
//! - Cycle detection
//! - Parallelization groups (execution waves)
//! - Dependency validation

use anyhow::{Result, anyhow};
use std::collections::{HashMap, HashSet};

/// Dependency node representing a task in the dependency graph
#[derive(Debug, Clone)]
pub struct DependencyNode {
    /// Task/subtask ID
    pub id: String,
    /// IDs of tasks this depends on
    pub depends_on: Vec<String>,
    /// IDs of tasks that depend on this
    pub depended_by: Vec<String>,
    /// Execution level (0 = can run first, higher = later)
    pub level: usize,
}

/// Complete dependency graph with execution levels
#[derive(Debug, Clone)]
pub struct DependencyGraph {
    /// All nodes indexed by ID
    pub nodes: HashMap<String, DependencyNode>,
    /// Nodes grouped by execution level (can run in parallel)
    pub levels: Vec<Vec<String>>,
    /// Whether the graph has any dependencies
    pub has_dependencies: bool,
    /// Whether cycles were detected
    pub has_cycles: bool,
    /// Cycle path if detected
    pub cycle_path: Option<Vec<String>>,
}

/// Dependency analyzer for building execution graphs
pub struct DependencyAnalyzer {
    // Stateless, could be functions but kept as struct for consistency
}

impl DependencyAnalyzer {
    /// Create new analyzer
    pub fn new() -> Self {
        Self {}
    }

    /// Build dependency graph from task dependencies
    ///
    /// # Arguments
    /// * `dependencies` - Vector of (task_id, vec![dependency_ids])
    ///
    /// # Returns
    /// DependencyGraph with execution levels
    ///
    /// # Errors
    /// Returns error if cycles detected or invalid dependencies found
    pub fn build_graph(&self, dependencies: Vec<(String, Vec<String>)>) -> Result<DependencyGraph> {
        // Phase 1: Build nodes
        let mut nodes = HashMap::new();
        let all_ids: HashSet<String> = dependencies.iter().map(|(id, _)| id.clone()).collect();

        for (id, deps) in &dependencies {
            nodes.insert(
                id.clone(),
                DependencyNode {
                    id: id.clone(),
                    depends_on: deps.clone(),
                    depended_by: Vec::new(),
                    level: 0, // Will be computed
                },
            );
        }

        // Phase 2: Build reverse dependencies and validate
        for (id, deps) in &dependencies {
            for dep_id in deps {
                // Check if dependency exists
                if !all_ids.contains(dep_id) {
                    return Err(anyhow!(
                        "Task {} depends on non-existent task: {}",
                        id,
                        dep_id
                    ));
                }

                // Add reverse dependency
                if let Some(dep_node) = nodes.get_mut(dep_id) {
                    dep_node.depended_by.push(id.clone());
                }
            }
        }

        // Phase 3: Detect cycles and compute levels
        let (levels, has_cycles, cycle_path) = self.compute_levels(&nodes)?;

        if has_cycles {
            return Err(anyhow!(
                "Circular dependency detected: {}",
                cycle_path
                    .as_ref()
                    .map(|p| p.join(" -> "))
                    .unwrap_or_default()
            ));
        }

        // Update node levels
        for (level_idx, level_nodes) in levels.iter().enumerate() {
            for node_id in level_nodes {
                if let Some(node) = nodes.get_mut(node_id) {
                    node.level = level_idx;
                }
            }
        }

        let has_dependencies = dependencies.iter().any(|(_, deps)| !deps.is_empty());

        Ok(DependencyGraph {
            nodes,
            levels,
            has_dependencies,
            has_cycles: false,
            cycle_path: None,
        })
    }

    /// Get parallelizable groups (tasks that can run concurrently)
    ///
    /// Returns vector of vectors where each inner vector represents tasks
    /// that can be executed in parallel (wave-based execution)
    pub fn get_parallelizable_groups(
        &self,
        dependencies: Vec<(String, Vec<String>)>,
    ) -> Result<Vec<Vec<String>>> {
        let graph = self.build_graph(dependencies)?;
        Ok(graph.levels)
    }

    /// Perform topological sort
    ///
    /// Returns flattened list of task IDs in execution order
    pub fn topological_sort(
        &self,
        dependencies: Vec<(String, Vec<String>)>,
    ) -> Result<Vec<String>> {
        let graph = self.build_graph(dependencies)?;
        Ok(graph.levels.into_iter().flatten().collect())
    }

    /// Check if task is ready to execute given completed tasks
    ///
    /// # Arguments
    /// * `task_id` - Task to check
    /// * `dependencies` - Task's dependencies
    /// * `completed` - Set of completed task IDs
    pub fn is_ready_to_execute(
        &self,
        _task_id: &str,
        dependencies: &[String],
        completed: &HashSet<String>,
    ) -> bool {
        dependencies.iter().all(|dep| completed.contains(dep))
    }

    /// Get tasks ready to execute
    ///
    /// # Arguments
    /// * `dependencies` - All task dependencies
    /// * `completed` - Set of completed task IDs
    /// * `in_progress` - Set of currently running task IDs
    pub fn get_ready_tasks(
        &self,
        dependencies: &[(String, Vec<String>)],
        completed: &HashSet<String>,
        in_progress: &HashSet<String>,
    ) -> Vec<String> {
        dependencies
            .iter()
            .filter(|(id, deps)| {
                !completed.contains(id)
                    && !in_progress.contains(id)
                    && self.is_ready_to_execute(id, deps, completed)
            })
            .map(|(id, _)| id.clone())
            .collect()
    }

    /// Validate dependencies without building full graph
    ///
    /// Returns validation result with any errors found
    pub fn validate(&self, dependencies: &[(String, Vec<String>)]) -> ValidationResult {
        let mut errors = Vec::new();
        let all_ids: HashSet<_> = dependencies.iter().map(|(id, _)| id.clone()).collect();

        // Check for invalid references
        for (id, deps) in dependencies {
            for dep_id in deps {
                if !all_ids.contains(dep_id) {
                    errors.push(format!(
                        "Task {} depends on non-existent task: {}",
                        id, dep_id
                    ));
                }
                if dep_id == id {
                    errors.push(format!("Task {} depends on itself", id));
                }
            }
        }

        // Check for cycles if basic validation passes
        if errors.is_empty() {
            if let Err(e) = self.build_graph(dependencies.to_vec()) {
                errors.push(e.to_string());
            }
        }

        ValidationResult {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    /// Compute execution levels using Kahn's topological sort algorithm
    fn compute_levels(
        &self,
        nodes: &HashMap<String, DependencyNode>,
    ) -> Result<(Vec<Vec<String>>, bool, Option<Vec<String>>)> {
        // Calculate in-degrees (number of unprocessed dependencies)
        let mut in_degree: HashMap<String, usize> = nodes
            .iter()
            .map(|(id, node)| (id.clone(), node.depends_on.len()))
            .collect();

        let mut levels: Vec<Vec<String>> = Vec::new();
        let mut processed = HashSet::new();

        // Process nodes level by level
        while processed.len() < nodes.len() {
            // Find all nodes with no remaining dependencies
            let current_level: Vec<String> = in_degree
                .iter()
                .filter(|(id, degree)| **degree == 0 && !processed.contains(id.as_str()))
                .map(|(id, _)| id.clone())
                .collect();

            // If no nodes can be processed, we have a cycle
            if current_level.is_empty() {
                let cycle_path = self.find_cycle(nodes, &processed);
                return Ok((levels, true, Some(cycle_path)));
            }

            // Mark current level nodes as processed
            for id in &current_level {
                processed.insert(id.clone());

                // Reduce in-degree of dependent nodes
                if let Some(node) = nodes.get(id) {
                    for dependent_id in &node.depended_by {
                        if let Some(degree) = in_degree.get_mut(dependent_id) {
                            *degree = degree.saturating_sub(1);
                        }
                    }
                }
            }

            levels.push(current_level);
        }

        Ok((levels, false, None))
    }

    /// Find a cycle in the dependency graph using DFS
    fn find_cycle(
        &self,
        nodes: &HashMap<String, DependencyNode>,
        processed: &HashSet<String>,
    ) -> Vec<String> {
        let mut visiting = HashSet::new();
        let mut path = Vec::new();

        for id in nodes.keys() {
            if !processed.contains(id) {
                if self.dfs_cycle(id, nodes, processed, &mut visiting, &mut path) {
                    // Extract cycle from path
                    if let Some(cycle_start) = path.iter().position(|p| visiting.contains(p)) {
                        let mut cycle = path[cycle_start..].to_vec();
                        cycle.push(path[cycle_start].clone()); // Close the cycle
                        return cycle;
                    }
                    return path;
                }
            }
        }

        Vec::new()
    }

    /// DFS helper for cycle detection
    fn dfs_cycle(
        &self,
        id: &str,
        nodes: &HashMap<String, DependencyNode>,
        processed: &HashSet<String>,
        visiting: &mut HashSet<String>,
        path: &mut Vec<String>,
    ) -> bool {
        if processed.contains(id) {
            return false;
        }
        if visiting.contains(id) {
            return true; // Found cycle
        }

        visiting.insert(id.to_string());
        path.push(id.to_string());

        if let Some(node) = nodes.get(id) {
            for dep_id in &node.depends_on {
                if self.dfs_cycle(dep_id, nodes, processed, visiting, path) {
                    return true;
                }
            }
        }

        path.pop();
        visiting.remove(id);
        false
    }
}

impl Default for DependencyAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

/// Validation result
#[derive(Debug, Clone)]
pub struct ValidationResult {
    /// Whether dependencies are valid
    pub is_valid: bool,
    /// List of validation errors
    pub errors: Vec<String>,
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_dependency_chain() {
        let analyzer = DependencyAnalyzer::new();

        // A -> B -> C (linear chain)
        let deps = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec!["A".to_string()]),
            ("C".to_string(), vec!["B".to_string()]),
        ];

        let graph = analyzer.build_graph(deps).unwrap();

        assert_eq!(graph.levels.len(), 3);
        assert_eq!(graph.levels[0], vec!["A"]);
        assert_eq!(graph.levels[1], vec!["B"]);
        assert_eq!(graph.levels[2], vec!["C"]);
    }

    #[test]
    fn test_parallel_execution() {
        let analyzer = DependencyAnalyzer::new();

        // A, B, C can all run in parallel (no dependencies)
        let deps = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec![]),
            ("C".to_string(), vec![]),
        ];

        let graph = analyzer.build_graph(deps).unwrap();

        assert_eq!(graph.levels.len(), 1);
        assert_eq!(graph.levels[0].len(), 3);
    }

    #[test]
    fn test_diamond_dependency() {
        let analyzer = DependencyAnalyzer::new();

        //     A
        //    / \
        //   B   C
        //    \ /
        //     D
        let deps = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec!["A".to_string()]),
            ("C".to_string(), vec!["A".to_string()]),
            ("D".to_string(), vec!["B".to_string(), "C".to_string()]),
        ];

        let graph = analyzer.build_graph(deps).unwrap();

        assert_eq!(graph.levels.len(), 3);
        assert_eq!(graph.levels[0], vec!["A"]);
        assert!(graph.levels[1].contains(&"B".to_string()));
        assert!(graph.levels[1].contains(&"C".to_string()));
        assert_eq!(graph.levels[2], vec!["D"]);
    }

    #[test]
    fn test_cycle_detection() {
        let analyzer = DependencyAnalyzer::new();

        // A -> B -> C -> A (cycle)
        let deps = vec![
            ("A".to_string(), vec!["C".to_string()]),
            ("B".to_string(), vec!["A".to_string()]),
            ("C".to_string(), vec!["B".to_string()]),
        ];

        let result = analyzer.build_graph(deps);
        assert!(result.is_err());
        assert!(
            result
                .unwrap_err()
                .to_string()
                .contains("Circular dependency")
        );
    }

    #[test]
    fn test_invalid_dependency() {
        let analyzer = DependencyAnalyzer::new();

        // A depends on non-existent B
        let deps = vec![("A".to_string(), vec!["B".to_string()])];

        let result = analyzer.build_graph(deps);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("non-existent"));
    }

    #[test]
    fn test_topological_sort() {
        let analyzer = DependencyAnalyzer::new();

        let deps = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec!["A".to_string()]),
            ("C".to_string(), vec!["B".to_string()]),
        ];

        let sorted = analyzer.topological_sort(deps).unwrap();
        assert_eq!(sorted, vec!["A", "B", "C"]);
    }

    #[test]
    fn test_is_ready_to_execute() {
        let analyzer = DependencyAnalyzer::new();
        let mut completed = HashSet::new();

        // Task with no dependencies should be ready
        assert!(analyzer.is_ready_to_execute("A", &[], &completed));

        // Task with unmet dependencies should not be ready
        assert!(!analyzer.is_ready_to_execute("B", &["A".to_string()], &completed));

        // After completing dependency, should be ready
        completed.insert("A".to_string());
        assert!(analyzer.is_ready_to_execute("B", &["A".to_string()], &completed));
    }

    #[test]
    fn test_get_ready_tasks() {
        let analyzer = DependencyAnalyzer::new();

        let deps = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec!["A".to_string()]),
            ("C".to_string(), vec![]),
            ("D".to_string(), vec!["B".to_string(), "C".to_string()]),
        ];

        let completed = HashSet::new();
        let in_progress = HashSet::new();

        // Initially, A and C should be ready
        let ready = analyzer.get_ready_tasks(&deps, &completed, &in_progress);
        assert_eq!(ready.len(), 2);
        assert!(ready.contains(&"A".to_string()));
        assert!(ready.contains(&"C".to_string()));

        // After A and C complete, B should be ready
        let mut completed = HashSet::new();
        completed.insert("A".to_string());
        completed.insert("C".to_string());
        let ready = analyzer.get_ready_tasks(&deps, &completed, &in_progress);
        assert_eq!(ready, vec!["B"]);
    }

    #[test]
    fn test_validate() {
        let analyzer = DependencyAnalyzer::new();

        // Valid dependencies
        let deps = vec![
            ("A".to_string(), vec![]),
            ("B".to_string(), vec!["A".to_string()]),
        ];
        let result = analyzer.validate(&deps);
        assert!(result.is_valid);
        assert!(result.errors.is_empty());

        // Invalid - self dependency
        let deps = vec![("A".to_string(), vec!["A".to_string()])];
        let result = analyzer.validate(&deps);
        assert!(!result.is_valid);
        assert!(!result.errors.is_empty());

        // Invalid - missing dependency
        let deps = vec![("A".to_string(), vec!["B".to_string()])];
        let result = analyzer.validate(&deps);
        assert!(!result.is_valid);
        assert!(!result.errors.is_empty());
    }
}
