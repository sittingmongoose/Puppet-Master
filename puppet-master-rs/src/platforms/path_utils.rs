//! Cross-platform path utilities for CLI executable discovery.
//!
//! Extracted from `installation_manager.rs` and `platform_detector.rs` to provide
//! a single source of truth for tilde expansion, executable existence checks,
//! fallback directory enumeration, and shell PATH parsing.

#[cfg(not(target_os = "windows"))]
use log::debug;
use std::path::{Path, PathBuf};
use which::which;

// DRY:FN:expand_home — Cross-platform tilde expansion (~) using $HOME or $USERPROFILE
/// Expand leading `~` in a path string to the user's home directory.
///
/// Tries `$HOME` first (Unix + WSL), then falls back to `$USERPROFILE` (native Windows).
/// Returns the original string unchanged if neither variable is set or the path does
/// not start with `~`.
pub fn expand_home(path: &str) -> String {
    if !path.starts_with('~') {
        return path.to_string();
    }

    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_default();

    if home.is_empty() {
        return path.to_string();
    }

    path.replacen('~', &home, 1)
}

// DRY:FN:check_executable_exists — Check if a path points to an executable, with Windows extension fallback
/// Check whether `path` exists as a file. On Windows, also probes `.exe`, `.cmd`,
/// and `.bat` extensions when the base path is not found.
///
/// Returns the resolved path (possibly with an added extension) or `None`.
pub fn check_executable_exists(path: &Path) -> Option<PathBuf> {
    if path.exists() && path.is_file() {
        return Some(path.to_path_buf());
    }

    #[cfg(target_os = "windows")]
    {
        for ext in &["exe", "cmd", "bat"] {
            let mut with_ext = path.as_os_str().to_os_string();
            with_ext.push(format!(".{}", ext));
            let candidate = PathBuf::from(with_ext);
            if candidate.exists() && candidate.is_file() {
                return Some(candidate);
            }
        }
    }

    None
}

// DRY:FN:get_fallback_directories — Cross-platform fallback directories for CLI discovery
/// Returns a list of common directories where CLI executables may be installed,
/// varying by operating system. Includes user-local directories derived from
/// `$HOME` / `$USERPROFILE`.
pub fn get_fallback_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    #[cfg(not(target_os = "windows"))]
    {
        dirs.push(PathBuf::from("/usr/local/bin"));
        dirs.push(PathBuf::from("/usr/bin"));
        dirs.push(PathBuf::from("/bin"));

        #[cfg(target_os = "macos")]
        {
            dirs.push(PathBuf::from("/opt/homebrew/bin"));
            dirs.push(PathBuf::from("/opt/local/bin"));
        }

        #[cfg(target_os = "linux")]
        {
            dirs.push(PathBuf::from("/home/linuxbrew/.linuxbrew/bin"));
            dirs.push(PathBuf::from("/snap/bin"));
        }

        if let Some(home) = std::env::var_os("HOME") {
            let home_path = PathBuf::from(home);
            dirs.push(home_path.join(".cargo/bin"));
            dirs.push(home_path.join(".local/bin"));
            dirs.push(home_path.join("bin"));
            dirs.push(home_path.join(".npm-global/bin"));
            dirs.push(home_path.join(".node_modules/bin"));
        }
    }

    #[cfg(target_os = "windows")]
    {
        if let Some(program_files) = std::env::var_os("ProgramFiles") {
            dirs.push(PathBuf::from(program_files));
        }
        if let Some(program_files_x86) = std::env::var_os("ProgramFiles(x86)") {
            dirs.push(PathBuf::from(program_files_x86));
        }
        if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
            let local = PathBuf::from(local_app_data);
            dirs.push(local.join("Programs"));
            // Cursor installer puts agent.cmd here
            dirs.push(local.join("cursor-agent"));
        }
        if let Some(app_data) = std::env::var_os("APPDATA") {
            // npm global installs go here (claude.cmd, codex.cmd, etc.)
            dirs.push(PathBuf::from(&app_data).join("npm"));
            dirs.push(PathBuf::from(app_data));
        }
        if let Some(user_profile) = std::env::var_os("USERPROFILE") {
            let user_path = PathBuf::from(user_profile);
            dirs.push(user_path.join(".cargo\\bin"));
            dirs.push(user_path.join("AppData\\Local\\Programs"));
        }
    }

    dirs
}

// DRY:FN:find_in_shell_path — Find an executable by parsing PATH exports from shell profiles
/// Parse shell profile files (`.bashrc`, `.bash_profile`, `.zshrc`, `.profile`) for
/// `export PATH=` lines, expand `$HOME`/`~`, and check each directory for `cli_name`.
///
/// Uses [`check_executable_exists`] so Windows extension probing is applied automatically.
///
/// Returns `None` on Windows (shell profiles are a Unix concept) or when no match is found.
pub fn find_in_shell_path(cli_name: &str) -> Option<PathBuf> {
    #[cfg(not(target_os = "windows"))]
    {
        let home = std::env::var("HOME").ok()?;
        let shell_profiles = [
            format!("{}/.bashrc", home),
            format!("{}/.bash_profile", home),
            format!("{}/.zshrc", home),
            format!("{}/.profile", home),
        ];

        for profile in &shell_profiles {
            if let Ok(content) = std::fs::read_to_string(profile) {
                for line in content.lines() {
                    let trimmed = line.trim_start();
                    if trimmed.starts_with("export PATH=") || trimmed.starts_with("PATH=") {
                        if let Some(paths_str) = line.split('=').nth(1) {
                            for path_entry in paths_str.split(':') {
                                let path_entry =
                                    path_entry.trim().trim_matches('"').trim_matches('\'');
                                let expanded =
                                    path_entry.replace("$HOME", &home).replace('~', &home);
                                let exe_path = PathBuf::from(&expanded).join(cli_name);
                                if let Some(found) = check_executable_exists(&exe_path) {
                                    debug!("Found {} in shell PATH: {}", cli_name, found.display());
                                    return Some(found);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let _ = cli_name; // suppress unused warning
    }

    None
}

// DRY:FN:resolve_executable -- Resolve executable using PATH, fallback directories, and shell profile PATH parsing
/// Resolve a CLI executable using the same layered approach used by Doctor checks:
///
/// 1. System `PATH` lookup via `which`
/// 2. Known fallback directories from [`get_fallback_directories`]
/// 3. Shell profile PATH parsing via [`find_in_shell_path`]
pub fn resolve_executable(cli_name: &str) -> Option<PathBuf> {
    if let Ok(path) = which(cli_name) {
        return Some(path);
    }

    for dir in get_fallback_directories() {
        let candidate = dir.join(cli_name);
        if let Some(found) = check_executable_exists(&candidate) {
            return Some(found);
        }
    }

    find_in_shell_path(cli_name)
}

// DRY:FN:resolve_executable_candidates -- Resolve first available executable from a candidate list
/// Resolve the first available executable from `candidates`, returning the selected command name
/// and resolved executable path.
pub fn resolve_executable_candidates(candidates: &[&str]) -> Option<(String, PathBuf)> {
    candidates
        .iter()
        .find_map(|name| resolve_executable(name).map(|path| ((*name).to_string(), path)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_home_no_tilde() {
        assert_eq!(expand_home("/usr/local/bin"), "/usr/local/bin");
    }

    #[test]
    fn test_expand_home_with_tilde() {
        // If $HOME is set, tilde should be replaced
        if let Ok(home) = std::env::var("HOME") {
            let result = expand_home("~/.local/bin");
            assert_eq!(result, format!("{}/.local/bin", home));
        }
    }

    #[test]
    fn test_expand_home_only_tilde() {
        if let Ok(home) = std::env::var("HOME") {
            assert_eq!(expand_home("~"), home);
        }
    }

    #[test]
    fn test_check_executable_exists_missing() {
        assert!(check_executable_exists(Path::new("/nonexistent/binary/foo")).is_none());
    }

    #[test]
    fn test_check_executable_exists_real() {
        // /usr/bin/env is almost always present on Unix
        #[cfg(not(target_os = "windows"))]
        {
            let result = check_executable_exists(Path::new("/usr/bin/env"));
            assert!(result.is_some());
        }
    }

    #[test]
    fn test_get_fallback_directories_non_empty() {
        let dirs = get_fallback_directories();
        assert!(!dirs.is_empty());
    }

    #[test]
    fn test_find_in_shell_path_nonexistent() {
        // Should return None for a command that cannot exist
        assert!(find_in_shell_path("__rwm_nonexistent_binary_42__").is_none());
    }

    #[test]
    fn test_resolve_executable_nonexistent() {
        assert!(resolve_executable("__rwm_nonexistent_binary_42__").is_none());
    }

    #[test]
    fn test_resolve_executable_known_command() {
        #[cfg(target_os = "windows")]
        let cmd = "cmd";
        #[cfg(not(target_os = "windows"))]
        let cmd = "sh";

        assert!(resolve_executable(cmd).is_some());
    }

    #[test]
    fn test_resolve_executable_candidates_picks_first_available() {
        #[cfg(target_os = "windows")]
        let known = "cmd";
        #[cfg(not(target_os = "windows"))]
        let known = "sh";

        let resolved = resolve_executable_candidates(&["__rwm_missing_binary__", known])
            .expect("expected path");
        assert_eq!(resolved.0, known);
    }
}
