//! Gemini CLI app-local installation.
//!
//! Installs `@google/gemini-cli` via npm with `NPM_CONFIG_PREFIX` pointing to
//! the app data directory, then overwrites the generic shim with a Gemini-specific
//! one that also exports `NPM_CONFIG_PREFIX`.
//!
//! ## Why a custom shim?
//!
//! The Gemini CLI (≥ 0.29.x) performs an automatic self-update check at startup.
//! When a newer version is available it runs:
//!
//! ```text
//! npm install -g @google/gemini-cli
//! ```
//!
//! For that update to land in the correct app-local directory the process must
//! inherit `NPM_CONFIG_PREFIX=$LIB_DIR`.  The generic shim from
//! [`npm_installer::generate_npm_bin_shim`] does not export this variable, so
//! the auto-update either fails with a permissions error (trying to write to
//! `/usr/local/lib`) or installs to the wrong location.
//!
//! Additionally, `npm` must be in PATH for the update command to succeed.  We
//! detect `npm`'s parent directory at install time and include it in the shim PATH.

use crate::install::app_paths::{get_app_bin_dir, get_lib_dir};
use crate::install::install_coordinator::InstallOutcome;
use crate::install::npm_installer::{NpmPackage, npm_install_to_app_dir};
use crate::platforms::path_utils::resolve_executable;
use log::{info, warn};
use std::path::PathBuf;

const GEMINI_PKG: NpmPackage = NpmPackage {
    package_name: "@google/gemini-cli",
    binary_name: "gemini",
};

/// Generate a Gemini-specific shim that sets `NODE_PATH`, `NPM_CONFIG_PREFIX`,
/// and adds both the `node` and `npm` directories to `PATH`.
///
/// This overwrites the generic shim created by [`npm_install_to_app_dir`] with one
/// that includes `NPM_CONFIG_PREFIX` so that Gemini's built-in auto-updater can
/// install the new version into the correct app-local directory.
fn generate_gemini_shim(
    lib_dir: &std::path::Path,
    bin_dir: &std::path::Path,
    node_path: Option<&std::path::Path>,
    npm_path: Option<&std::path::Path>,
) -> Result<(), String> {
    let lib_dir_str = lib_dir.display().to_string();

    // Collect unique parent directories for node and npm
    let node_parent = node_path
        .and_then(|p| p.parent())
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    let npm_parent = npm_path
        .and_then(|p| p.parent())
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    // Build path prefix: unique dirs from node_parent and npm_parent
    let path_prefix = match (node_parent.as_str(), npm_parent.as_str()) {
        ("", "") => String::new(),
        (n, "") => n.to_string(),
        ("", m) => m.to_string(),
        (n, m) if n == m => n.to_string(),
        (n, m) => format!("{n}:{m}"),
    };

    #[cfg(not(target_os = "windows"))]
    {
        let shim_path = bin_dir.join("gemini");
        let content = if path_prefix.is_empty() {
            format!(
                "#!/usr/bin/env bash\n\
                 # Auto-generated shim for gemini — do not edit\n\
                 LIB_DIR=\"{lib_dir_str}\"\n\
                 export NODE_PATH=\"$LIB_DIR/lib/node_modules\"\n\
                 export NPM_CONFIG_PREFIX=\"$LIB_DIR\"\n\
                 exec \"$LIB_DIR/bin/gemini\" \"$@\"\n"
            )
        } else {
            format!(
                "#!/usr/bin/env bash\n\
                 # Auto-generated shim for gemini — do not edit\n\
                 LIB_DIR=\"{lib_dir_str}\"\n\
                 export NODE_PATH=\"$LIB_DIR/lib/node_modules\"\n\
                 export NPM_CONFIG_PREFIX=\"$LIB_DIR\"\n\
                 export PATH=\"{path_prefix}:$PATH\"\n\
                 exec \"$LIB_DIR/bin/gemini\" \"$@\"\n"
            )
        };
        std::fs::write(&shim_path, &content).map_err(|e| e.to_string())?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(&shim_path)
                .map_err(|e| e.to_string())?
                .permissions();
            perms.set_mode(0o755);
            std::fs::set_permissions(&shim_path, perms).map_err(|e| e.to_string())?;
        }
    }

    #[cfg(target_os = "windows")]
    {
        let shim_path = bin_dir.join("gemini.cmd");
        // On Windows, path separator is ';' and no quotes needed around path entries
        let win_path_prefix = match (node_parent.as_str(), npm_parent.as_str()) {
            ("", "") => String::new(),
            (n, "") => n.to_string(),
            ("", m) => m.to_string(),
            (n, m) if n == m => n.to_string(),
            (n, m) => format!("{n};{m}"),
        };
        let content = if win_path_prefix.is_empty() {
            format!(
                "@echo off\r\n\
                 REM Auto-generated shim for gemini — do not edit\r\n\
                 set \"LIB_DIR={lib_dir_str}\"\r\n\
                 set \"NODE_PATH=%LIB_DIR%\\lib\\node_modules\"\r\n\
                 set \"NPM_CONFIG_PREFIX=%LIB_DIR%\"\r\n\
                 \"%LIB_DIR%\\bin\\gemini.cmd\" %*\r\n"
            )
        } else {
            format!(
                "@echo off\r\n\
                 REM Auto-generated shim for gemini — do not edit\r\n\
                 set \"LIB_DIR={lib_dir_str}\"\r\n\
                 set \"NODE_PATH=%LIB_DIR%\\lib\\node_modules\"\r\n\
                 set \"NPM_CONFIG_PREFIX=%LIB_DIR%\"\r\n\
                 set \"PATH={win_path_prefix};%PATH%\"\r\n\
                 \"%LIB_DIR%\\bin\\gemini.cmd\" %*\r\n"
            )
        };
        std::fs::write(&shim_path, content).map_err(|e| e.to_string())?;
    }

    Ok(())
}

/// Regenerate the Gemini shim in the app bin directory.
///
/// Callable from outside the module (e.g. the Doctor fix action) to repair the shim
/// without requiring a full reinstall. The shim sets `NODE_PATH`, `NPM_CONFIG_PREFIX`,
/// and adds both `node` and `npm` directories to `PATH`.
pub fn regenerate_gemini_shim() -> Result<(), String> {
    let lib_dir = get_lib_dir();
    let bin_dir = get_app_bin_dir();
    let node_path = resolve_executable("node").map(PathBuf::from);
    let npm_path = resolve_executable("npm").map(PathBuf::from);
    generate_gemini_shim(&lib_dir, &bin_dir, node_path.as_deref(), npm_path.as_deref())
}

/// Install Gemini CLI into the app data directory.
///
/// Steps:
/// 1. `npm install -g @google/gemini-cli` with `NPM_CONFIG_PREFIX={APP_DATA_DIR}/lib`
/// 2. Regenerate the Gemini shim to include `NPM_CONFIG_PREFIX` and the npm binary
///    directory so that Gemini's built-in auto-updater can find `npm` and install
///    the update into the correct app-local directory.
pub async fn install_gemini_app_local() -> InstallOutcome {
    info!("Installing Gemini CLI (app-local)");

    // Step 1: npm install @google/gemini-cli
    let npm_outcome = npm_install_to_app_dir(&GEMINI_PKG).await;
    if !npm_outcome.success {
        return npm_outcome;
    }

    let mut log_lines = npm_outcome.log_lines;

    // Step 2: Overwrite the generic shim with the Gemini-specific one.
    let lib_dir_path = get_lib_dir();
    let bin_dir_path = get_app_bin_dir();
    let node_path = resolve_executable("node").map(PathBuf::from);
    let npm_path = resolve_executable("npm").map(PathBuf::from);

    match generate_gemini_shim(
        &lib_dir_path,
        &bin_dir_path,
        node_path.as_deref(),
        npm_path.as_deref(),
    ) {
        Ok(()) => {
            log_lines.push(
                "Regenerated Gemini shim with NPM_CONFIG_PREFIX for auto-update support."
                    .to_string(),
            );
        }
        Err(e) => {
            warn!("Failed to regenerate Gemini shim: {e}");
            return InstallOutcome::failure_with_log(
                format!("Gemini installed but shim generation failed: {e}. Re-run install."),
                log_lines,
            );
        }
    }

    InstallOutcome {
        success: true,
        message: "Gemini CLI installed with auto-update support.".to_string(),
        log_lines,
        installed_path: npm_outcome.installed_path,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gemini_pkg_has_correct_name() {
        assert_eq!(GEMINI_PKG.package_name, "@google/gemini-cli");
        assert_eq!(GEMINI_PKG.binary_name, "gemini");
    }

    #[test]
    fn gemini_shim_sets_npm_config_prefix() {
        let tmp = tempfile::TempDir::new().unwrap();
        let lib_dir = tmp.path().join("lib");
        let bin_dir = tmp.path().join("bin");
        std::fs::create_dir_all(&bin_dir).unwrap();

        let node = tmp.path().join("node");
        let npm = tmp.path().join("npm");

        generate_gemini_shim(&lib_dir, &bin_dir, Some(&node), Some(&npm)).unwrap();

        #[cfg(not(target_os = "windows"))]
        {
            let content = std::fs::read_to_string(bin_dir.join("gemini")).unwrap();
            assert!(content.contains("NPM_CONFIG_PREFIX"), "shim must export NPM_CONFIG_PREFIX");
            assert!(content.contains("NODE_PATH"), "shim must export NODE_PATH");
        }
        #[cfg(target_os = "windows")]
        {
            let content = std::fs::read_to_string(bin_dir.join("gemini.cmd")).unwrap();
            assert!(content.contains("NPM_CONFIG_PREFIX"), "shim must set NPM_CONFIG_PREFIX");
            assert!(content.contains("NODE_PATH"), "shim must set NODE_PATH");
        }
    }

    #[test]
    fn gemini_shim_includes_npm_dir_in_path() {
        let tmp = tempfile::TempDir::new().unwrap();
        let lib_dir = tmp.path().join("lib");
        let bin_dir = tmp.path().join("bin");
        std::fs::create_dir_all(&bin_dir).unwrap();

        // Use distinct directories for node and npm
        let node_dir = tmp.path().join("node_bin");
        let npm_dir = tmp.path().join("npm_bin");
        let node = node_dir.join("node");
        let npm = npm_dir.join("npm");

        generate_gemini_shim(&lib_dir, &bin_dir, Some(&node), Some(&npm)).unwrap();

        #[cfg(not(target_os = "windows"))]
        {
            let content = std::fs::read_to_string(bin_dir.join("gemini")).unwrap();
            let node_str = node_dir.to_string_lossy();
            let npm_str = npm_dir.to_string_lossy();
            assert!(content.contains(node_str.as_ref()), "shim PATH must include node dir");
            assert!(content.contains(npm_str.as_ref()), "shim PATH must include npm dir");
        }
    }

    #[test]
    fn gemini_shim_deduplicates_path_when_node_and_npm_same_dir() {
        let tmp = tempfile::TempDir::new().unwrap();
        let lib_dir = tmp.path().join("lib");
        let bin_dir = tmp.path().join("bin");
        std::fs::create_dir_all(&bin_dir).unwrap();

        // node and npm in the same directory (typical Linux install)
        let shared_dir = tmp.path().join("shared");
        let node = shared_dir.join("node");
        let npm = shared_dir.join("npm");

        generate_gemini_shim(&lib_dir, &bin_dir, Some(&node), Some(&npm)).unwrap();

        #[cfg(not(target_os = "windows"))]
        {
            let content = std::fs::read_to_string(bin_dir.join("gemini")).unwrap();
            let shared_str = shared_dir.to_string_lossy();
            // The path should appear exactly once, not duplicated
            let occurrences = content.matches(shared_str.as_ref()).count();
            assert_eq!(occurrences, 1, "same dir should appear only once in PATH");
        }
    }
}
