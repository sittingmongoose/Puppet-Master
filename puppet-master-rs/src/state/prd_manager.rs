//! PRD (Product Requirements Document) Manager
//!
//! Manages loading, saving, and manipulating the prd.json file with:
//! - Atomic writes (write to temp, then rename)
//! - Automatic backups (keep last 5)
//! - Thread-safe CRUD operations
//! - Hierarchical Phase/Task/Subtask navigation

use crate::types::{ItemStatus, PRD, Phase, Subtask, Task};
use crate::utils::atomic_writer::AtomicWriter;
use anyhow::{Context, Result, anyhow};
use serde_json;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

const MAX_BACKUPS: usize = 5;

// DRY:DATA:PrdManager
/// Thread-safe PRD manager
#[derive(Clone)]
pub struct PrdManager {
    inner: Arc<Mutex<PrdManagerInner>>,
}

struct PrdManagerInner {
    path: PathBuf,
    prd: PRD,
}

impl PrdManager {
    // DRY:FN:new
    /// Create a new PRD manager and load from file
    pub fn new(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();
        let prd = Self::load_from_file(&path)?;

        Ok(Self {
            inner: Arc::new(Mutex::new(PrdManagerInner { path, prd })),
        })
    }

    // DRY:FN:new_with_prd
    /// Create a new PRD manager with a new PRD (doesn't save)
    pub fn new_with_prd(path: impl AsRef<Path>, prd: PRD) -> Self {
        Self {
            inner: Arc::new(Mutex::new(PrdManagerInner {
                path: path.as_ref().to_path_buf(),
                prd,
            })),
        }
    }

    /// Load PRD from file
    fn load_from_file(path: &Path) -> Result<PRD> {
        // Check if file exists, return default PRD if not
        if !path.exists() {
            log::info!(
                "PRD file {} does not exist, creating default PRD",
                path.display()
            );
            return Ok(PRD::new("New Project"));
        }

        let content = std::fs::read_to_string(path)
            .with_context(|| format!("Failed to read PRD from {}", path.display()))?;

        serde_json::from_str(&content)
            .with_context(|| format!("Failed to parse PRD JSON from {}", path.display()))
    }

    // DRY:FN:save
    /// Save PRD to file with atomic write and backup
    pub fn save(&self) -> Result<()> {
        let inner = self.inner.lock().unwrap();

        // Create backup before writing
        self.create_backup(&inner.path)?;

        // Serialize PRD
        let json =
            serde_json::to_string_pretty(&inner.prd).context("Failed to serialize PRD to JSON")?;

        // Atomic write
        AtomicWriter::write(&inner.path, json.as_bytes())
            .with_context(|| format!("Failed to write PRD to {}", inner.path.display()))?;

        log::info!("PRD saved to {}", inner.path.display());
        Ok(())
    }

    /// Create a backup of the current file
    fn create_backup(&self, path: &Path) -> Result<()> {
        if !path.exists() {
            return Ok(());
        }

        // Rotate existing backups
        for i in (1..MAX_BACKUPS).rev() {
            let old_backup = path.with_extension(format!("json.bak.{}", i));
            let new_backup = path.with_extension(format!("json.bak.{}", i + 1));

            if old_backup.exists() {
                if i == MAX_BACKUPS - 1 {
                    // Remove oldest backup
                    std::fs::remove_file(&old_backup).ok();
                } else {
                    std::fs::rename(&old_backup, &new_backup).ok();
                }
            }
        }

        // Create new backup
        let backup_path = path.with_extension("json.bak.1");
        std::fs::copy(path, backup_path).ok();

        Ok(())
    }

    // DRY:FN:get_prd
    /// Get a clone of the entire PRD
    pub fn get_prd(&self) -> PRD {
        let inner = self.inner.lock().unwrap();
        inner.prd.clone()
    }

    // DRY:FN:find_item
    /// Find any item (Phase, Task, or Subtask) by ID
    pub fn find_item(&self, id: &str) -> Option<ItemType> {
        let inner = self.inner.lock().unwrap();

        for phase in &inner.prd.phases {
            if phase.id == id {
                return Some(ItemType::Phase(phase.clone()));
            }

            for task in &phase.tasks {
                if task.id == id {
                    return Some(ItemType::Task(task.clone()));
                }

                for subtask in &task.subtasks {
                    if subtask.id == id {
                        return Some(ItemType::Subtask(subtask.clone()));
                    }
                }
            }
        }

        None
    }

    // DRY:FN:update_status
    /// Update the status of any item by ID
    pub fn update_status(&self, id: &str, new_status: ItemStatus) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();
        let mut found = false;

        // Search through phases
        for phase in &mut inner.prd.phases {
            if phase.id == id {
                phase.status = new_status;
                found = true;
                break;
            }

            // Search through tasks
            for task in &mut phase.tasks {
                if task.id == id {
                    task.status = new_status;
                    found = true;
                    break;
                }

                // Search through subtasks
                for subtask in &mut task.subtasks {
                    if subtask.id == id {
                        subtask.status = new_status;
                        found = true;
                        break;
                    }
                }

                if found {
                    break;
                }
            }

            if found {
                break;
            }
        }

        if !found {
            return Err(anyhow!("Item with ID '{}' not found", id));
        }

        log::debug!("Updated status of {} to {:?}", id, new_status);
        Ok(())
    }

    // DRY:FN:get_next_pending
    /// Get the next pending item (phase, task, or subtask)
    pub fn get_next_pending(&self) -> Option<(String, ItemType)> {
        let inner = self.inner.lock().unwrap();

        for phase in &inner.prd.phases {
            // Check if phase dependencies are met
            if !self.dependencies_met(&inner, &phase.dependencies) {
                continue;
            }

            if phase.status == ItemStatus::Pending {
                return Some((phase.id.clone(), ItemType::Phase(phase.clone())));
            }

            if phase.status == ItemStatus::Running || phase.status == ItemStatus::Passed {
                for task in &phase.tasks {
                    if !self.dependencies_met(&inner, &task.dependencies) {
                        continue;
                    }

                    if task.status == ItemStatus::Pending {
                        return Some((task.id.clone(), ItemType::Task(task.clone())));
                    }

                    if task.status == ItemStatus::Running || task.status == ItemStatus::Passed {
                        for subtask in &task.subtasks {
                            if subtask.status == ItemStatus::Pending {
                                return Some((
                                    subtask.id.clone(),
                                    ItemType::Subtask(subtask.clone()),
                                ));
                            }
                        }
                    }
                }
            }
        }

        None
    }

    /// Check if all dependencies are met
    fn dependencies_met(&self, inner: &PrdManagerInner, deps: &[String]) -> bool {
        if deps.is_empty() {
            return true;
        }

        deps.iter().all(|dep_id| {
            inner
                .prd
                .phases
                .iter()
                .flat_map(|p| {
                    std::iter::once(&p.id).chain(p.tasks.iter().flat_map(|t| {
                        std::iter::once(&t.id).chain(t.subtasks.iter().map(|s| &s.id))
                    }))
                })
                .any(|id| {
                    if id == dep_id {
                        // Find the item and check its status
                        self.find_item_status_in_prd(&inner.prd, dep_id)
                            .map(|status| status == ItemStatus::Passed)
                            .unwrap_or(false)
                    } else {
                        false
                    }
                })
        })
    }

    /// Helper to find item status in PRD
    fn find_item_status_in_prd(&self, prd: &PRD, id: &str) -> Option<ItemStatus> {
        for phase in &prd.phases {
            if phase.id == id {
                return Some(phase.status);
            }
            for task in &phase.tasks {
                if task.id == id {
                    return Some(task.status);
                }
                for subtask in &task.subtasks {
                    if subtask.id == id {
                        return Some(subtask.status);
                    }
                }
            }
        }
        None
    }

    // DRY:FN:add_phase
    /// Add a new phase
    pub fn add_phase(&self, phase: Phase) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();

        // Check for duplicate ID
        if inner.prd.phases.iter().any(|p| p.id == phase.id) {
            return Err(anyhow!("Phase with ID '{}' already exists", phase.id));
        }

        inner.prd.phases.push(phase);
        log::debug!("Added new phase");
        Ok(())
    }

    // DRY:FN:add_task
    /// Add a new task to a phase
    pub fn add_task(&self, phase_id: &str, task: Task) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();

        let phase = inner
            .prd
            .phases
            .iter_mut()
            .find(|p| p.id == phase_id)
            .ok_or_else(|| anyhow!("Phase '{}' not found", phase_id))?;

        // Check for duplicate ID
        if phase.tasks.iter().any(|t| t.id == task.id) {
            return Err(anyhow!("Task with ID '{}' already exists", task.id));
        }

        phase.tasks.push(task);
        log::debug!("Added new task to phase {}", phase_id);
        Ok(())
    }

    // DRY:FN:add_subtask
    /// Add a new subtask to a task
    pub fn add_subtask(&self, task_id: &str, subtask: Subtask) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();

        for phase in &mut inner.prd.phases {
            if let Some(task) = phase.tasks.iter_mut().find(|t| t.id == task_id) {
                // Check for duplicate ID
                if task.subtasks.iter().any(|s| s.id == subtask.id) {
                    return Err(anyhow!("Subtask with ID '{}' already exists", subtask.id));
                }

                task.subtasks.push(subtask);
                log::debug!("Added new subtask to task {}", task_id);
                return Ok(());
            }
        }

        Err(anyhow!("Task '{}' not found", task_id))
    }
}

// DRY:DATA:ItemType
/// Enum to represent any item type
#[derive(Debug, Clone)]
pub enum ItemType {
    Phase(Phase),
    Task(Task),
    Subtask(Subtask),
}

impl ItemType {
    // DRY:FN:id
    pub fn id(&self) -> &str {
        match self {
            ItemType::Phase(p) => &p.id,
            ItemType::Task(t) => &t.id,
            ItemType::Subtask(s) => &s.id,
        }
    }

    // DRY:FN:name
    pub fn name(&self) -> &str {
        match self {
            ItemType::Phase(p) => &p.title,
            ItemType::Task(t) => &t.title,
            ItemType::Subtask(s) => &s.title,
        }
    }

    // DRY:FN:status
    pub fn status(&self) -> ItemStatus {
        match self {
            ItemType::Phase(p) => p.status,
            ItemType::Task(t) => t.status,
            ItemType::Subtask(s) => s.status,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::PRD;
    use tempfile::TempDir;

    fn create_test_prd() -> PRD {
        let mut prd = PRD::new("Test Project");
        prd.phases.push(Phase {
            id: "phase1".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: Some("Test phase".to_string()),
            status: ItemStatus::Pending,
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        });
        prd
    }

    #[test]
    fn test_save_and_load() {
        let temp_dir = TempDir::new().unwrap();
        let prd_path = temp_dir.path().join("prd.json");
        let prd = create_test_prd();

        let manager = PrdManager::new_with_prd(&prd_path, prd.clone());
        manager.save().unwrap();

        let loaded = PrdManager::new(&prd_path).unwrap();
        let loaded_prd = loaded.get_prd();

        assert_eq!(loaded_prd.metadata.version, prd.metadata.version);
        assert_eq!(loaded_prd.phases.len(), 1);
    }

    #[test]
    fn test_update_status() {
        let temp_dir = TempDir::new().unwrap();
        let prd_path = temp_dir.path().join("prd.json");
        let prd = create_test_prd();

        let manager = PrdManager::new_with_prd(&prd_path, prd);
        manager
            .update_status("phase1", ItemStatus::Running)
            .unwrap();

        let updated = manager.find_item("phase1").unwrap();
        assert_eq!(updated.status(), ItemStatus::Running);
    }
}
