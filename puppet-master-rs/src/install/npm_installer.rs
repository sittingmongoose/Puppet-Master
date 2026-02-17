//! npm package installation into the app-local prefix directory.
//!
//! Sets `NPM_CONFIG_PREFIX` to `{APP_DATA_DIR}/lib` so installed packages (and
//! their wrapper scripts) land in `{APP_DATA_DIR}/lib/bin/`.  After installing,
//! the wrapper script is copied to `{APP_DATA_DIR}/bin/` so detection always
//! checks the same location.
//!
//! # Pipe-deadlock prevention
//! Both stdout and stderr are drained concurrently via `tokio::join!` so a
//! large install that fills the kernel pipe buffer does not deadlock.

use crate::install::app_paths::{ensure_app_bin_dir, ensure_lib_dir, get_lib_dir};
use crate::install::install_coordinator::InstallOutcome;
use crate::platforms::path_utils::resolve_executable;
use log::{debug, info, warn};
use std::ffi::OsString;
use std::path::PathBuf;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

/// npm package descriptor for a CLI tool.
#[derive(Debug, Clone)]
pub struct NpmPackage {
    /// The npm package name (e.g. `"@google/gemini-cli"`).
    pub package_name: &'static str,
    /// The wrapper-script name installed by npm (e.g. `"gemini"`).
    pub binary_name: &'static str,
}

/// Return the npm package info for a known platform, if applicable.
///
/// Uses `crate::platforms::platform_specs::npm_package_info` as the single source of truth.
pub fn npm_package_for_platform(platform: crate::types::Platform) -> Option<NpmPackage> {
    crate::platforms::platform_specs::npm_package_info(platform).map(|(package_name, binary_name)| {
        NpmPackage {
            package_name,
            binary_name,
        }
    })
}

// DRY:FN:npm_install_to_app_dir — Install an npm package into the app data directory
/// Install `package_name` globally using `NPM_CONFIG_PREFIX={APP_DATA_DIR}/lib`.
///
/// After installation, copies the wrapper script from
/// `{APP_DATA_DIR}/lib/bin/{binary_name}` → `{APP_DATA_DIR}/bin/{binary_name}`.
///
/// Returns an [`InstallOutcome`] with streaming log lines.
pub async fn npm_install_to_app_dir(pkg: &NpmPackage) -> InstallOutcome {
    info!(
        "npm install -g {} (app-local prefix)",
        pkg.package_name
    );

    // Resolve npm
    let npm_path = match resolve_executable("npm") {
        Some(p) => p,
        None => {
            return InstallOutcome::failure(
                "npm not found. Install Node.js (>= 18) first.",
            );
        }
    };

    // Ensure directories exist
    let lib_dir = match ensure_lib_dir() {
        Ok(d) => d,
        Err(e) => return InstallOutcome::failure(format!("Failed to create lib dir: {e}")),
    };
    if let Err(e) = ensure_app_bin_dir() {
        return InstallOutcome::failure(format!("Failed to create bin dir: {e}"));
    }

    let mut log_lines = Vec::new();
    log_lines.push(format!(
        "Running: {} install -g {} (NPM_CONFIG_PREFIX={})",
        npm_path.display(),
        pkg.package_name,
        lib_dir.display()
    ));

    // Build npm_config_prefix as OsString to handle paths with spaces on Windows
    let prefix_val: OsString = lib_dir.into_os_string();

    let mut child = match Command::new(&npm_path)
        .args(["install", "-g", pkg.package_name])
        .env("NPM_CONFIG_PREFIX", &prefix_val)
        // Clear any inherited NPM_CONFIG_PREFIX that might conflict
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
    {
        Ok(c) => c,
        Err(e) => {
            return InstallOutcome::failure(format!("Failed to spawn npm: {e}"));
        }
    };

    // Drain stdout + stderr concurrently to prevent pipe-buffer deadlock
    let stdout = child.stdout.take().expect("stdout piped");
    let stderr = child.stderr.take().expect("stderr piped");

    let (stdout_lines, stderr_lines) = tokio::join!(
        collect_lines(BufReader::new(stdout)),
        collect_lines(BufReader::new(stderr)),
    );

    log_lines.extend(stdout_lines);
    log_lines.extend(stderr_lines);

    let status = match child.wait().await {
        Ok(s) => s,
        Err(e) => {
            return InstallOutcome::failure_with_log(
                format!("npm process wait failed: {e}"),
                log_lines,
            );
        }
    };

    if !status.success() {
        return InstallOutcome::failure_with_log(
            format!("npm install -g {} failed (exit {})", pkg.package_name, status),
            log_lines,
        );
    }

    // Copy wrapper from lib/bin → app bin/
    let lib_dir_path = get_lib_dir();
    let installed_path = copy_npm_bin_to_app_bin(&lib_dir_path, pkg.binary_name, &mut log_lines);

    InstallOutcome {
        success: true,
        message: format!(
            "{} installed successfully.",
            pkg.package_name
        ),
        log_lines,
        installed_path,
    }
}

/// Read all lines from an async reader into a Vec.
async fn collect_lines<R: tokio::io::AsyncRead + Unpin>(reader: BufReader<R>) -> Vec<String> {
    let mut lines = Vec::new();
    let mut reader = reader.lines();
    while let Ok(Some(line)) = reader.next_line().await {
        lines.push(line);
    }
    lines
}

/// Copy a binary from `{lib_dir}/bin/{name}` to the app-local `bin/` directory.
/// Returns the destination path on success.
fn copy_npm_bin_to_app_bin(
    lib_dir: &std::path::Path,
    binary_name: &str,
    log_lines: &mut Vec<String>,
) -> Option<PathBuf> {
    let app_bin_dir = crate::install::app_paths::get_app_bin_dir();

    // npm puts wrapper scripts in {prefix}/bin on Unix, {prefix} on Windows
    #[cfg(not(target_os = "windows"))]
    let src = lib_dir.join("bin").join(binary_name);
    #[cfg(target_os = "windows")]
    let src = {
        let mut s = lib_dir.join(binary_name);
        if !s.exists() {
            s = lib_dir.join(format!("{}.cmd", binary_name));
        }
        s
    };

    let dst = app_bin_dir.join(binary_name);
    debug!("Copying {} → {}", src.display(), dst.display());

    if !src.exists() {
        warn!(
            "npm wrapper not found at expected path: {}",
            src.display()
        );
        log_lines.push(format!(
            "Warning: expected wrapper at {} but not found",
            src.display()
        ));
        return None;
    }

    match std::fs::copy(&src, &dst) {
        Ok(_) => {
            log_lines.push(format!("Copied {} → {}", src.display(), dst.display()));
            set_executable(&dst, log_lines);
            Some(dst)
        }
        Err(e) => {
            warn!("Failed to copy {} to app bin: {}", binary_name, e);
            log_lines.push(format!("Warning: copy failed: {e}"));
            None
        }
    }
}

/// Set executable permissions on Unix; no-op on Windows.
#[cfg(not(target_os = "windows"))]
fn set_executable(path: &std::path::Path, log_lines: &mut Vec<String>) {
    use std::os::unix::fs::PermissionsExt;
    match std::fs::metadata(path) {
        Ok(meta) => {
            let mut perms = meta.permissions();
            perms.set_mode(perms.mode() | 0o111); // add +x for all
            if let Err(e) = std::fs::set_permissions(path, perms) {
                log_lines.push(format!("Warning: could not set executable bit: {e}"));
            }
        }
        Err(e) => log_lines.push(format!("Warning: could not read permissions: {e}")),
    }
}

#[cfg(target_os = "windows")]
fn set_executable(_path: &std::path::Path, _log_lines: &mut Vec<String>) {
    // Windows uses .cmd wrappers; no chmod needed
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn npm_package_for_gemini_returns_correct_package() {
        let pkg = npm_package_for_platform(crate::types::Platform::Gemini).unwrap();
        assert_eq!(pkg.package_name, "@google/gemini-cli");
        assert_eq!(pkg.binary_name, "gemini");
    }

    #[test]
    fn npm_package_for_codex_returns_correct_package() {
        let pkg = npm_package_for_platform(crate::types::Platform::Codex).unwrap();
        assert_eq!(pkg.package_name, "@openai/codex");
        assert_eq!(pkg.binary_name, "codex");
    }

    #[test]
    fn npm_package_for_copilot_returns_correct_package() {
        let pkg = npm_package_for_platform(crate::types::Platform::Copilot).unwrap();
        assert_eq!(pkg.package_name, "@github/copilot");
        assert_eq!(pkg.binary_name, "copilot");
    }

    #[test]
    fn npm_package_for_claude_returns_none() {
        assert!(npm_package_for_platform(crate::types::Platform::Claude).is_none());
    }
}
