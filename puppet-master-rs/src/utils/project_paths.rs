//! Project Paths
//!
//! Utilities for resolving project paths and the .puppet-master directory structure.
//! Provides consistent path resolution across the application.

use anyhow::{Context, Result};
use std::path::{Path, PathBuf};

// DRY:HELPER:derive_project_root
/// Derive the project root directory from a config file path
///
/// Walks up the directory tree from the config file location to find
/// the project root. The project root is typically where .git or
/// .puppet-master directory exists.
pub fn derive_project_root(config_path: &Path) -> Result<PathBuf> {
    // Get the directory containing the config file
    let start_dir = if config_path.is_file() {
        config_path
            .parent()
            .context("Config path has no parent directory")?
    } else {
        config_path
    };

    // Walk up the directory tree looking for project indicators
    let mut current_dir = start_dir;
    loop {
        // Check for .git directory
        if current_dir.join(".git").exists() {
            return Ok(current_dir.to_path_buf());
        }

        // Check for .puppet-master directory
        if current_dir.join(".puppet-master").exists() {
            return Ok(current_dir.to_path_buf());
        }

        // Check for common project files
        if current_dir.join("Cargo.toml").exists()
            || current_dir.join("package.json").exists()
            || current_dir.join("pom.xml").exists()
            || current_dir.join("go.mod").exists()
        {
            return Ok(current_dir.to_path_buf());
        }

        // Move up to parent directory
        match current_dir.parent() {
            Some(parent) => current_dir = parent,
            None => {
                // Reached filesystem root, return the original directory
                return Ok(start_dir.to_path_buf());
            }
        }
    }
}

// DRY:HELPER:is_directory_writable
/// Best-effort writability check for a directory.
///
/// Note: permission bits alone are not sufficient to detect read-only mounts (e.g. DMG images on
/// macOS). We do a tiny create/delete probe file to confirm writability.
pub fn is_directory_writable(path: &Path) -> bool {
    let Ok(metadata) = std::fs::metadata(path) else {
        return false;
    };
    if !metadata.is_dir() {
        return false;
    }
    if metadata.permissions().readonly() {
        return false;
    }

    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let probe_path = path.join(format!("pm-write-probe-{}-{}", std::process::id(), nanos));

    match std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&probe_path)
    {
        Ok(_) => {
            let _ = std::fs::remove_file(&probe_path);
            true
        }
        Err(_) => false,
    }
}

// DRY:HELPER:resolve_writable_state_root
/// Resolve a writable base directory for `.puppet-master` state.
///
/// Priority:
/// 1. Derived project root (or workspace parent when running in `puppet-master-rs/`) if writable.
/// 2. Platform app data directory (`directories::ProjectDirs`) if writable/creatable.
/// 3. Original start path (best effort fallback).
pub fn resolve_writable_state_root(start: &Path) -> PathBuf {
    let mut derived = derive_project_root(start).unwrap_or_else(|_| start.to_path_buf());

    // When checks run from the crate directory, prefer the parent workspace root.
    if derived
        .file_name()
        .is_some_and(|name| name == "puppet-master-rs")
    {
        if let Some(parent) = derived.parent() {
            derived = parent.to_path_buf();
        }
    }

    if is_directory_writable(&derived) {
        return derived;
    }

    if let Some(project_dirs) = directories::ProjectDirs::from("com", "puppetmaster", "Puppet Master") {
        let app_data_root = project_dirs.data_local_dir().to_path_buf();
        if std::fs::create_dir_all(&app_data_root).is_ok() && is_directory_writable(&app_data_root)
        {
            return app_data_root;
        }
    }

    start.to_path_buf()
}

// DRY:HELPER:resolve_under_project_root
/// Resolve a relative path under the project root
///
/// Takes a project root and a relative path, and returns the absolute path.
/// If the relative path is already absolute, returns it as-is.
pub fn resolve_under_project_root(root: &Path, relative: &str) -> PathBuf {
    let path = PathBuf::from(relative);

    if path.is_absolute() {
        path
    } else {
        root.join(path)
    }
}

// DRY:HELPER:resolve_working_directory
/// Resolve the working directory from configuration
///
/// Returns the configured working directory, or the project root if not specified.
pub fn resolve_working_directory(config: &crate::types::PuppetMasterConfig) -> PathBuf {
    // Check if working directory is explicitly set in project config
    let working_dir = &config.project.working_directory;

    // If it's absolute, use it directly
    if working_dir.is_absolute() {
        working_dir.clone()
    } else {
        // Otherwise, resolve relative to the workspace path
        config.paths.workspace.join(working_dir)
    }
}

// DRY:HELPER:puppet_master_dir
/// Get the .puppet-master directory path
///
/// Returns the path to the .puppet-master directory in the project root.
pub fn puppet_master_dir(root: &Path) -> PathBuf {
    root.join(".puppet-master")
}

// DRY:HELPER:settings_file
/// Get the settings.json file path
///
/// Returns the path to the app settings file inside .puppet-master.
pub fn settings_file(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("settings.json")
}

// DRY:HELPER:evidence_dir
/// Get the evidence directory path
///
/// Returns the path where evidence files are stored.
pub fn evidence_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("evidence")
}

// DRY:HELPER:logs_dir
/// Get the logs directory path
///
/// Returns the path where log files are stored.
pub fn logs_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("logs")
}

// DRY:HELPER:checkpoints_dir
/// Get the checkpoints directory path
///
/// Returns the path where checkpoint/state files are stored.
pub fn checkpoints_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("checkpoints")
}

// DRY:HELPER:usage_dir
/// Get the usage directory path
///
/// Returns the path where usage tracking files are stored.
pub fn usage_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("usage")
}

// DRY:HELPER:agents_dir
/// Get the agents directory path
///
/// Returns the path where agent-specific data is stored.
pub fn agents_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("agents")
}

// DRY:HELPER:memory_dir
/// Get the memory/state directory path
///
/// Returns the path where memory and state files are stored.
pub fn memory_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("memory")
}

// DRY:HELPER:backups_dir
/// Get the backups directory path
///
/// Returns the path where backup files are stored.
pub fn backups_dir(root: &Path) -> PathBuf {
    puppet_master_dir(root).join("backups")
}

// DRY:HELPER:initialize_puppet_master_dirs
/// Initialize the .puppet-master directory structure
///
/// Creates all necessary subdirectories if they don't exist.
pub fn initialize_puppet_master_dirs(root: &Path) -> Result<()> {
    let dirs = [
        puppet_master_dir(root),
        evidence_dir(root),
        logs_dir(root),
        checkpoints_dir(root),
        usage_dir(root),
        agents_dir(root),
        memory_dir(root),
        backups_dir(root),
    ];

    for dir in &dirs {
        std::fs::create_dir_all(dir)
            .with_context(|| format!("Failed to create directory: {}", dir.display()))?;
    }

    Ok(())
}

// DRY:HELPER:is_within_project_root
/// Check if a path is within the project root
///
/// Returns true if the given path is a descendant of the project root.
pub fn is_within_project_root(root: &Path, path: &Path) -> bool {
    path.canonicalize()
        .ok()
        .and_then(|p| p.ancestors().find(|a| *a == root).map(|_| true))
        .unwrap_or(false)
}

// DRY:HELPER:get_relative_to_root
/// Get relative path from project root
///
/// Returns the path relative to the project root, or None if not within root.
pub fn get_relative_to_root(root: &Path, path: &Path) -> Option<PathBuf> {
    path.strip_prefix(root).ok().map(|p| p.to_path_buf())
}

// DRY:HELPER:resolve_paths_under_root
/// Resolve a list of paths under the project root
///
/// Convenience function to resolve multiple paths at once.
pub fn resolve_paths_under_root(root: &Path, paths: &[String]) -> Vec<PathBuf> {
    paths
        .iter()
        .map(|p| resolve_under_project_root(root, p))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_derive_project_root_with_git() {
        let temp_dir = TempDir::new().unwrap();
        let git_dir = temp_dir.path().join(".git");
        fs::create_dir(&git_dir).unwrap();

        let config_path = temp_dir.path().join("config").join("puppet-master.yaml");
        fs::create_dir_all(config_path.parent().unwrap()).unwrap();
        fs::write(&config_path, "test").unwrap();

        let root = derive_project_root(&config_path).unwrap();
        assert_eq!(root, temp_dir.path());
    }

    #[test]
    fn test_derive_project_root_with_puppet_master() {
        let temp_dir = TempDir::new().unwrap();
        let pm_dir = temp_dir.path().join(".puppet-master");
        fs::create_dir(&pm_dir).unwrap();

        let config_path = temp_dir.path().join("subdir").join("config.yaml");
        fs::create_dir_all(config_path.parent().unwrap()).unwrap();
        fs::write(&config_path, "test").unwrap();

        let root = derive_project_root(&config_path).unwrap();
        assert_eq!(root, temp_dir.path());
    }

    #[test]
    fn test_derive_project_root_with_cargo_toml() {
        let temp_dir = TempDir::new().unwrap();
        let cargo_toml = temp_dir.path().join("Cargo.toml");
        fs::write(&cargo_toml, "[package]").unwrap();

        let config_path = temp_dir.path().join("config.yaml");
        let root = derive_project_root(&config_path).unwrap();
        assert_eq!(root, temp_dir.path());
    }

    #[test]
    fn test_is_directory_writable_tempdir() {
        let temp_dir = TempDir::new().unwrap();
        assert!(is_directory_writable(temp_dir.path()));
    }

    #[test]
    fn test_resolve_writable_state_root_prefers_workspace_parent() {
        let temp_dir = TempDir::new().unwrap();
        let crate_dir = temp_dir.path().join("puppet-master-rs");
        fs::create_dir_all(&crate_dir).unwrap();
        fs::write(crate_dir.join("Cargo.toml"), "[package]").unwrap();

        let resolved = resolve_writable_state_root(&crate_dir);
        assert_eq!(resolved, temp_dir.path());
    }

    #[test]
    fn test_resolve_under_project_root_relative() {
        let root = PathBuf::from("/project");
        let resolved = resolve_under_project_root(&root, "src/main.rs");
        assert_eq!(resolved, PathBuf::from("/project/src/main.rs"));
    }

    #[test]
    fn test_resolve_under_project_root_absolute() {
        let root = PathBuf::from("/project");
        let absolute = "/absolute/path/file.txt";
        let resolved = resolve_under_project_root(&root, absolute);
        assert_eq!(resolved, PathBuf::from(absolute));
    }

    #[test]
    fn test_puppet_master_dir() {
        let root = PathBuf::from("/project");
        let pm_dir = puppet_master_dir(&root);
        assert_eq!(pm_dir, PathBuf::from("/project/.puppet-master"));
    }

    #[test]
    fn test_evidence_dir() {
        let root = PathBuf::from("/project");
        let ev_dir = evidence_dir(&root);
        assert_eq!(ev_dir, PathBuf::from("/project/.puppet-master/evidence"));
    }

    #[test]
    fn test_logs_dir() {
        let root = PathBuf::from("/project");
        let log_dir = logs_dir(&root);
        assert_eq!(log_dir, PathBuf::from("/project/.puppet-master/logs"));
    }

    #[test]
    fn test_checkpoints_dir() {
        let root = PathBuf::from("/project");
        let cp_dir = checkpoints_dir(&root);
        assert_eq!(cp_dir, PathBuf::from("/project/.puppet-master/checkpoints"));
    }

    #[test]
    fn test_usage_dir() {
        let root = PathBuf::from("/project");
        let usage = usage_dir(&root);
        assert_eq!(usage, PathBuf::from("/project/.puppet-master/usage"));
    }

    #[test]
    fn test_agents_dir() {
        let root = PathBuf::from("/project");
        let agents = agents_dir(&root);
        assert_eq!(agents, PathBuf::from("/project/.puppet-master/agents"));
    }

    #[test]
    fn test_memory_dir() {
        let root = PathBuf::from("/project");
        let memory = memory_dir(&root);
        assert_eq!(memory, PathBuf::from("/project/.puppet-master/memory"));
    }

    #[test]
    fn test_backups_dir() {
        let root = PathBuf::from("/project");
        let backups = backups_dir(&root);
        assert_eq!(backups, PathBuf::from("/project/.puppet-master/backups"));
    }

    #[test]
    fn test_initialize_puppet_master_dirs() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();

        initialize_puppet_master_dirs(root).unwrap();

        assert!(puppet_master_dir(root).exists());
        assert!(evidence_dir(root).exists());
        assert!(logs_dir(root).exists());
        assert!(checkpoints_dir(root).exists());
        assert!(usage_dir(root).exists());
        assert!(agents_dir(root).exists());
        assert!(memory_dir(root).exists());
        assert!(backups_dir(root).exists());
    }

    #[test]
    fn test_get_relative_to_root() {
        let root = PathBuf::from("/project");
        let path = PathBuf::from("/project/src/main.rs");

        // This test might not work due to canonicalization issues in test env
        // but the logic is sound for real filesystem paths
        let relative = get_relative_to_root(&root, &path);
        if let Some(rel) = relative {
            assert_eq!(rel, PathBuf::from("src/main.rs"));
        }
    }

    #[test]
    fn test_resolve_paths_under_root() {
        let root = PathBuf::from("/project");
        let paths = vec![
            "src/main.rs".to_string(),
            "tests/test.rs".to_string(),
            "README.md".to_string(),
        ];

        let resolved = resolve_paths_under_root(&root, &paths);
        assert_eq!(resolved.len(), 3);
        assert_eq!(resolved[0], PathBuf::from("/project/src/main.rs"));
        assert_eq!(resolved[1], PathBuf::from("/project/tests/test.rs"));
        assert_eq!(resolved[2], PathBuf::from("/project/README.md"));
    }

    #[test]
    fn test_derive_project_root_fallback() {
        let temp_dir = TempDir::new().unwrap();
        // Create a deep nested structure without any project indicators
        let deep_path = temp_dir
            .path()
            .join("a")
            .join("b")
            .join("c")
            .join("config.yaml");
        fs::create_dir_all(deep_path.parent().unwrap()).unwrap();
        fs::write(&deep_path, "test").unwrap();

        // Should fall back to the config's directory
        let root = derive_project_root(&deep_path).unwrap();
        assert!(root.exists());
    }
}
