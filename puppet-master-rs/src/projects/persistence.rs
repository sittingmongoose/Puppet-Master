//! Projects persistence - Store and load known projects list
//!
//! Stores known projects in `.puppet-master/projects.json` in the app data directory.
//! Maintains a list of projects that have been opened or explicitly added by the user.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

// DRY:DATA:KnownProject
/// A known project entry with metadata
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct KnownProject {
    /// Project name
    pub name: String,
    /// Absolute path to project directory
    pub path: PathBuf,
    /// When this project was last opened/accessed
    pub last_accessed: DateTime<Utc>,
    /// When this project was first added
    pub added_at: DateTime<Utc>,
    /// Whether the project is pinned (stays at top of list)
    #[serde(default)]
    pub pinned: bool,
    /// Optional notes/description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

impl KnownProject {
    // DRY:FN:new
    /// Create a new known project entry
    pub fn new(name: String, path: PathBuf) -> Self {
        let now = Utc::now();
        Self {
            name,
            path,
            last_accessed: now,
            added_at: now,
            pinned: false,
            notes: None,
        }
    }

    // DRY:FN:touch
    /// Update the last accessed timestamp
    pub fn touch(&mut self) {
        self.last_accessed = Utc::now();
    }

    // DRY:FN:exists
    /// Check if the project directory still exists
    pub fn exists(&self) -> bool {
        self.path.exists() && self.path.is_dir()
    }
}

// DRY:DATA:ProjectsPersistence
/// Projects persistence manager
pub struct ProjectsPersistence {
    /// Path to the projects.json file
    storage_path: PathBuf,
}

impl ProjectsPersistence {
    // DRY:FN:new
    /// Create a new projects persistence manager
    ///
    /// Uses the app data directory structure:
    /// - Windows: %LOCALAPPDATA%\RWM Puppet Master\.puppet-master\projects.json
    /// - Linux: ~/.local/share/RWM Puppet Master/.puppet-master/projects.json (or current dir)
    /// - macOS: ~/Library/Application Support/RWM Puppet Master/.puppet-master/projects.json
    pub fn new() -> Result<Self> {
        let storage_dir = Self::get_app_data_dir()?;
        let puppet_master_dir = storage_dir.join(".puppet-master");

        // Create the .puppet-master directory if it doesn't exist
        fs::create_dir_all(&puppet_master_dir)
            .context("Failed to create .puppet-master directory in app data")?;

        let storage_path = puppet_master_dir.join("projects.json");

        Ok(Self { storage_path })
    }

    /// Get the app data directory based on platform
    fn get_app_data_dir() -> Result<PathBuf> {
        if cfg!(windows) {
            // Windows: Use %LOCALAPPDATA%\RWM Puppet Master
            if let Some(proj_dirs) = directories::ProjectDirs::from("com", "RWM", "Puppet Master") {
                Ok(proj_dirs.data_local_dir().to_path_buf())
            } else if let Some(base_dirs) = directories::BaseDirs::new() {
                Ok(base_dirs.data_local_dir().join("RWM Puppet Master"))
            } else {
                anyhow::bail!("Failed to determine app data directory on Windows")
            }
        } else if cfg!(target_os = "linux") {
            // Linux: Check if running from system install
            if let Ok(exe_path) = std::env::current_exe() {
                if exe_path.starts_with("/usr/bin") || exe_path.starts_with("/usr/local/bin") {
                    if let Some(proj_dirs) =
                        directories::ProjectDirs::from("com", "RWM", "Puppet Master")
                    {
                        return Ok(proj_dirs.data_local_dir().to_path_buf());
                    } else if let Some(base_dirs) = directories::BaseDirs::new() {
                        return Ok(base_dirs.data_local_dir().join("RWM Puppet Master"));
                    }
                }
            }
            // Fallback to current directory for local installs
            Ok(std::env::current_dir()?)
        } else if cfg!(target_os = "macos") {
            // macOS: Use Application Support directory
            if let Some(proj_dirs) = directories::ProjectDirs::from("com", "RWM", "Puppet Master") {
                Ok(proj_dirs.data_dir().to_path_buf())
            } else if let Some(base_dirs) = directories::BaseDirs::new() {
                Ok(base_dirs.data_dir().join("RWM Puppet Master"))
            } else {
                anyhow::bail!("Failed to determine app data directory on macOS")
            }
        } else {
            // Unknown platform, use current directory
            Ok(std::env::current_dir()?)
        }
    }

    // DRY:FN:load
    /// Load the list of known projects
    pub fn load(&self) -> Result<Vec<KnownProject>> {
        if !self.storage_path.exists() {
            // No storage file yet, return empty list
            return Ok(Vec::new());
        }

        let content =
            fs::read_to_string(&self.storage_path).context("Failed to read projects.json")?;

        let projects: Vec<KnownProject> =
            serde_json::from_str(&content).context("Failed to parse projects.json")?;

        Ok(projects)
    }

    // DRY:FN:save
    /// Save the list of known projects
    pub fn save(&self, projects: &[KnownProject]) -> Result<()> {
        let json = serde_json::to_string_pretty(projects)
            .context("Failed to serialize projects to JSON")?;

        // Atomic write using temp file + rename
        let temp_path = self.storage_path.with_extension("tmp");
        fs::write(&temp_path, json).context("Failed to write projects temp file")?;

        fs::rename(&temp_path, &self.storage_path).context("Failed to rename projects file")?;

        Ok(())
    }

    // DRY:FN:add_or_update
    /// Add or update a project in the known projects list
    ///
    /// If the project already exists (by path), updates its last_accessed time.
    /// Otherwise, adds a new entry.
    pub fn add_or_update(&self, project: KnownProject) -> Result<()> {
        let mut projects = self.load()?;

        // Check if project already exists (match by path)
        if let Some(existing) = projects.iter_mut().find(|p| p.path == project.path) {
            // Update existing entry
            existing.name = project.name;
            existing.last_accessed = project.last_accessed;
            existing.notes = project.notes;
            // Preserve pinned status and added_at from existing
        } else {
            // Add new entry
            projects.push(project);
        }

        self.save(&projects)?;
        Ok(())
    }

    // DRY:FN:remove
    /// Remove a project by path
    pub fn remove(&self, path: &Path) -> Result<bool> {
        let mut projects = self.load()?;
        let original_len = projects.len();

        projects.retain(|p| p.path != path);

        if projects.len() < original_len {
            self.save(&projects)?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    // DRY:FN:set_pinned
    /// Pin or unpin a project
    pub fn set_pinned(&self, path: &Path, pinned: bool) -> Result<bool> {
        let mut projects = self.load()?;

        if let Some(project) = projects.iter_mut().find(|p| p.path == path) {
            project.pinned = pinned;
            self.save(&projects)?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    // DRY:FN:set_notes
    /// Update the notes for a project
    pub fn set_notes(&self, path: &Path, notes: Option<String>) -> Result<bool> {
        let mut projects = self.load()?;

        if let Some(project) = projects.iter_mut().find(|p| p.path == path) {
            project.notes = notes;
            self.save(&projects)?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    // DRY:FN:get_sorted
    /// Get projects sorted by most recently accessed (pinned first)
    pub fn get_sorted(&self) -> Result<Vec<KnownProject>> {
        let mut projects = self.load()?;

        // Sort: pinned first, then by last_accessed descending
        projects.sort_by(|a, b| match (a.pinned, b.pinned) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => b.last_accessed.cmp(&a.last_accessed),
        });

        Ok(projects)
    }

    // DRY:FN:cleanup_missing
    /// Clean up projects that no longer exist on disk
    pub fn cleanup_missing(&self) -> Result<usize> {
        let mut projects = self.load()?;
        let original_len = projects.len();

        projects.retain(|p| p.exists());

        let removed_count = original_len - projects.len();
        if removed_count > 0 {
            self.save(&projects)?;
        }

        Ok(removed_count)
    }

    // DRY:FN:storage_path
    /// Get the storage path (for debugging/info)
    pub fn storage_path(&self) -> &Path {
        &self.storage_path
    }
}

impl Default for ProjectsPersistence {
    fn default() -> Self {
        Self::new().unwrap_or_else(|_| {
            // Fallback to current directory if app data directory fails
            let fallback_path = PathBuf::from(".puppet-master").join("projects.json");
            Self {
                storage_path: fallback_path,
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_persistence(temp_dir: &TempDir) -> ProjectsPersistence {
        let storage_path = temp_dir.path().join("projects.json");
        ProjectsPersistence { storage_path }
    }

    #[test]
    fn test_new_known_project() {
        let project = KnownProject::new("Test".to_string(), PathBuf::from("/test/path"));
        assert_eq!(project.name, "Test");
        assert_eq!(project.path, PathBuf::from("/test/path"));
        assert!(!project.pinned);
        assert!(project.notes.is_none());
    }

    #[test]
    fn test_touch_updates_timestamp() {
        let mut project = KnownProject::new("Test".to_string(), PathBuf::from("/test/path"));
        let original_time = project.last_accessed;

        std::thread::sleep(std::time::Duration::from_millis(10));
        project.touch();

        assert!(project.last_accessed > original_time);
    }

    #[test]
    fn test_save_and_load() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let projects = vec![
            KnownProject::new("Project1".to_string(), PathBuf::from("/path1")),
            KnownProject::new("Project2".to_string(), PathBuf::from("/path2")),
        ];

        persistence.save(&projects).unwrap();
        let loaded = persistence.load().unwrap();

        assert_eq!(loaded.len(), 2);
        assert_eq!(loaded[0].name, "Project1");
        assert_eq!(loaded[1].name, "Project2");
    }

    #[test]
    fn test_load_nonexistent_returns_empty() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let projects = persistence.load().unwrap();
        assert!(projects.is_empty());
    }

    #[test]
    fn test_add_or_update_new_project() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let project = KnownProject::new("Test".to_string(), PathBuf::from("/test"));
        persistence.add_or_update(project).unwrap();

        let loaded = persistence.load().unwrap();
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].name, "Test");
    }

    #[test]
    fn test_add_or_update_existing_project() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let project1 = KnownProject::new("Test".to_string(), PathBuf::from("/test"));
        persistence.add_or_update(project1).unwrap();

        std::thread::sleep(std::time::Duration::from_millis(10));

        let mut project2 = KnownProject::new("Test Updated".to_string(), PathBuf::from("/test"));
        project2.touch();
        persistence.add_or_update(project2).unwrap();

        let loaded = persistence.load().unwrap();
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].name, "Test Updated");
    }

    #[test]
    fn test_remove_project() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let project = KnownProject::new("Test".to_string(), PathBuf::from("/test"));
        persistence.add_or_update(project).unwrap();

        let removed = persistence.remove(&PathBuf::from("/test")).unwrap();
        assert!(removed);

        let loaded = persistence.load().unwrap();
        assert!(loaded.is_empty());
    }

    #[test]
    fn test_remove_nonexistent_project() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let removed = persistence.remove(&PathBuf::from("/nonexistent")).unwrap();
        assert!(!removed);
    }

    #[test]
    fn test_set_pinned() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let project = KnownProject::new("Test".to_string(), PathBuf::from("/test"));
        persistence.add_or_update(project).unwrap();

        let updated = persistence
            .set_pinned(&PathBuf::from("/test"), true)
            .unwrap();
        assert!(updated);

        let loaded = persistence.load().unwrap();
        assert!(loaded[0].pinned);
    }

    #[test]
    fn test_set_notes() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        let project = KnownProject::new("Test".to_string(), PathBuf::from("/test"));
        persistence.add_or_update(project).unwrap();

        let updated = persistence
            .set_notes(&PathBuf::from("/test"), Some("My notes".to_string()))
            .unwrap();
        assert!(updated);

        let loaded = persistence.load().unwrap();
        assert_eq!(loaded[0].notes, Some("My notes".to_string()));
    }

    #[test]
    fn test_get_sorted() {
        let temp_dir = TempDir::new().unwrap();
        let persistence = create_test_persistence(&temp_dir);

        // Add projects with different timestamps
        let mut project1 = KnownProject::new("Old".to_string(), PathBuf::from("/old"));
        project1.last_accessed = DateTime::from_timestamp(1000, 0).unwrap();
        persistence.add_or_update(project1).unwrap();

        let mut project2 = KnownProject::new("Recent".to_string(), PathBuf::from("/recent"));
        project2.last_accessed = DateTime::from_timestamp(2000, 0).unwrap();
        persistence.add_or_update(project2).unwrap();

        let mut project3 = KnownProject::new("Pinned".to_string(), PathBuf::from("/pinned"));
        project3.pinned = true;
        project3.last_accessed = DateTime::from_timestamp(500, 0).unwrap();
        persistence.add_or_update(project3).unwrap();

        let sorted = persistence.get_sorted().unwrap();

        // Pinned should be first, then by last_accessed descending
        assert_eq!(sorted[0].name, "Pinned");
        assert_eq!(sorted[1].name, "Recent");
        assert_eq!(sorted[2].name, "Old");
    }
}
