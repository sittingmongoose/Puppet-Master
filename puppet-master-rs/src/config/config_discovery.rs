//! Config Discovery
//!
//! Centralized config file path resolution. Single source of truth for where
//! Puppet Master looks for configuration files across macOS, Linux, and Windows.

use crate::config::default_config::default_workspace_dir;
use crate::utils::project_paths::resolve_writable_state_root;
use std::path::{Path, PathBuf};

// DRY:DATA:CONFIG_FILE_NAMES
/// Canonical list of config file names, in search order within each directory.
pub const CONFIG_FILE_NAMES: &[&str] = &[
    "puppet-master.yaml",
    "puppet-master.yml",
    "pm-config.yaml",
    ".puppet-master.yaml",
    ".puppet-master/config.yaml",
];

// DRY:FN:has_config_in_dir
/// Returns true if any of CONFIG_FILE_NAMES exists in the given directory.
pub fn has_config_in_dir(dir: &Path) -> bool {
    for name in CONFIG_FILE_NAMES {
        let path = dir.join(name);
        if path.exists() && path.is_file() {
            return true;
        }
    }
    false
}

/// Find the first existing config file in a directory.
/// Returns None if none of CONFIG_FILE_NAMES exist.
fn find_config_in_dir(dir: &Path) -> Option<PathBuf> {
    for name in CONFIG_FILE_NAMES {
        let path = dir.join(name);
        if path.exists() && path.is_file() {
            return Some(path);
        }
    }
    None
}

// DRY:FN:discover_config_path
/// Discover the path to an existing config file.
///
/// Search order:
/// 1. `hint` directory if provided
/// 2. default_workspace_dir() (platform-specific)
/// 3. resolve_writable_state_root(cwd) (project root from cwd)
/// 4. Current directory
/// 5. Parent directories (up to 3 levels)
/// 6. Home directory
pub fn discover_config_path(hint: Option<&Path>) -> Option<PathBuf> {
    // 1. Hint directory first
    if let Some(h) = hint {
        if h.is_dir() {
            if let Some(p) = find_config_in_dir(h) {
                return Some(p);
            }
        }
    }

    // 2. Default workspace directory
    let workspace_dir = default_workspace_dir();
    if let Some(p) = find_config_in_dir(&workspace_dir) {
        return Some(p);
    }

    let cwd = match std::env::current_dir() {
        Ok(p) => p,
        Err(_) => PathBuf::from("."),
    };

    // 3. Project root from cwd
    let project_root = resolve_writable_state_root(&cwd);
    if project_root != cwd {
        if let Some(p) = find_config_in_dir(&project_root) {
            return Some(p);
        }
    }

    // 4. Current directory
    if let Some(p) = find_config_in_dir(&cwd) {
        return Some(p);
    }

    // 5. Parent directories (up to 3 levels)
    let mut parent_dir = cwd.clone();
    for _ in 0..3 {
        if !parent_dir.pop() {
            break;
        }
        if let Some(p) = find_config_in_dir(&parent_dir) {
            return Some(p);
        }
    }

    // 6. Home directory
    if let Some(home_dir) = directories::UserDirs::new() {
        let home = home_dir.home_dir();
        if let Some(p) = find_config_in_dir(home) {
            return Some(p);
        }
    }

    None
}

// DRY:FN:default_path_for_new_config
/// Returns the path to use when creating a new config file in the given base directory.
/// Uses puppet-master.yaml for consistency with App and STATE_FILES.
pub fn default_path_for_new_config(base_dir: &Path) -> PathBuf {
    base_dir.join("puppet-master.yaml")
}

/// Build a human-readable list of search locations for error messages.
pub fn search_locations_summary() -> String {
    let workspace_dir = default_workspace_dir();
    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let project_root = resolve_writable_state_root(&cwd);
    let home = directories::UserDirs::new()
        .map(|u| u.home_dir().display().to_string())
        .unwrap_or_else(|| "~".to_string());

    format!(
        "Searched: hint (if provided), workspace ({}), project root ({}), cwd ({}), parents, home ({})",
        workspace_dir.display(),
        project_root.display(),
        cwd.display(),
        home
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn has_config_in_dir_true_when_puppet_master_yaml_exists() {
        let dir = TempDir::new().unwrap();
        let config_path = dir.path().join("puppet-master.yaml");
        fs::write(&config_path, "project:\n  name: test\n").unwrap();
        assert!(has_config_in_dir(dir.path()));
    }

    #[test]
    fn has_config_in_dir_true_when_dot_puppet_master_config_exists() {
        let dir = TempDir::new().unwrap();
        let subdir = dir.path().join(".puppet-master");
        fs::create_dir_all(&subdir).unwrap();
        fs::write(subdir.join("config.yaml"), "project:\n  name: test\n").unwrap();
        assert!(has_config_in_dir(dir.path()));
    }

    #[test]
    fn has_config_in_dir_false_when_empty() {
        let dir = TempDir::new().unwrap();
        assert!(!has_config_in_dir(dir.path()));
    }

    #[test]
    fn discover_config_path_finds_hint_first() {
        let hint_dir = TempDir::new().unwrap();
        let config_path = hint_dir.path().join("puppet-master.yaml");
        fs::write(&config_path, "project:\n  name: hint\n").unwrap();

        let found = discover_config_path(Some(hint_dir.path()));
        assert!(found.is_some());
        let found = found.unwrap();
        assert!(found.ends_with("puppet-master.yaml"));
        assert!(found.starts_with(hint_dir.path()));
    }

    #[test]
    fn discover_config_path_with_empty_hint_falls_back() {
        let empty_hint = TempDir::new().unwrap();
        // Hint dir has no config - discovery will fall through to workspace/cwd/etc.
        // Result depends on environment; we just verify it doesn't panic.
        let _ = discover_config_path(Some(empty_hint.path()));
    }

    #[test]
    fn discover_config_path_with_none_does_not_panic() {
        let _ = discover_config_path(None);
    }

    #[test]
    fn default_path_for_new_config_returns_puppet_master_yaml() {
        let dir = TempDir::new().unwrap();
        let path = default_path_for_new_config(dir.path());
        assert_eq!(path.file_name().unwrap(), "puppet-master.yaml");
        assert!(path.starts_with(dir.path()));
    }
}
