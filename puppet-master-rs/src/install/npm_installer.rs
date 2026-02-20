//! npm package installation into the app-local prefix directory.
//!
//! Sets `NPM_CONFIG_PREFIX` to `{APP_DATA_DIR}/lib` so installed packages (and
//! their wrapper scripts) land in `{APP_DATA_DIR}/lib/bin/`.  After installing,
//! a shim script is generated in `{APP_DATA_DIR}/bin/` that delegates to the
//! npm-installed wrapper with correct `NODE_PATH` environment variable.
//!
//! The shim approach (instead of copying) prevents module resolution errors that
//! occur when npm wrappers are moved away from their node_modules directory.
//!
//! # Pipe-deadlock prevention
//! Both stdout and stderr are drained concurrently via `tokio::join!` so a
//! large install that fills the kernel pipe buffer does not deadlock.

use crate::install::app_paths::{ensure_app_bin_dir, ensure_lib_dir, get_lib_dir};
use crate::install::install_coordinator::InstallOutcome;
use crate::platforms::path_utils::resolve_executable;
use log::info;
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
    crate::platforms::platform_specs::npm_package_info(platform).map(
        |(package_name, binary_name)| NpmPackage {
            package_name,
            binary_name,
        },
    )
}

// DRY:FN:npm_install_to_app_dir — Install an npm package into the app data directory
/// Install `package_name` globally using `NPM_CONFIG_PREFIX={APP_DATA_DIR}/lib`.
///
/// After installation, generates a shim script in `{APP_DATA_DIR}/bin/{binary_name}`
/// that delegates to the npm-installed wrapper with correct `NODE_PATH` environment.
///
/// Returns an [`InstallOutcome`] with streaming log lines.
pub async fn npm_install_to_app_dir(pkg: &NpmPackage) -> InstallOutcome {
    info!("npm install -g {} (app-local prefix)", pkg.package_name);

    // Resolve npm
    let npm_path = match resolve_executable("npm") {
        Some(p) => p,
        None => {
            return InstallOutcome::failure("npm not found. Install Node.js (>= 18) first.");
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
        "Running: {} install -g {} --include=optional (NPM_CONFIG_PREFIX={}, cache={})",
        npm_path.display(),
        pkg.package_name,
        lib_dir.display(),
        crate::install::app_paths::get_npm_cache_dir().display()
    ));

    // Build npm_config_prefix as OsString to handle paths with spaces on Windows
    let prefix_val: OsString = lib_dir.into_os_string();

    let mut child = match Command::new(&npm_path)
        .args(["install", "-g", pkg.package_name, "--include=optional"])
        .env("NPM_CONFIG_PREFIX", &prefix_val)
        .env("npm_config_cache", crate::install::app_paths::get_npm_cache_dir())
        .env("NPM_CONFIG_CACHE", crate::install::app_paths::get_npm_cache_dir())
        .env(
            "PATH",
            crate::platforms::path_utils::build_enhanced_path_for_subprocess(),
        )
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
            format!(
                "npm install -g {} failed (exit {})",
                pkg.package_name, status
            ),
            log_lines,
        );
    }

    // Generate shim in app bin that delegates to lib/bin with correct NODE_PATH
    let lib_dir_path = get_lib_dir();
    let bin_dir_path = crate::install::app_paths::get_app_bin_dir();
    let node_path = resolve_executable("node").map(PathBuf::from);

    let installed_path = match generate_npm_bin_shim(
        pkg.binary_name,
        &lib_dir_path,
        &bin_dir_path,
        node_path.as_deref(),
        &mut log_lines,
    ) {
        Ok(path) => Some(path),
        Err(e) => {
            return InstallOutcome::failure_with_log(
                format!("Failed to generate shim for {}: {}", pkg.binary_name, e),
                log_lines,
            );
        }
    };

    // Verify install by checking that the npm wrapper script exists at lib/bin/{binary_name}.
    // We do NOT run the binary here — `--version` can hang for interactive CLIs like @github/copilot
    // whose native binary starts an interactive TUI instead of printing a version and exiting.
    // npm exits non-zero if install fails (caught above), so a missing lib/bin wrapper means something
    // went wrong with the package layout.
    let lib_bin = lib_dir_path.join("bin").join(pkg.binary_name);
    if lib_bin.exists() {
        log_lines.push(format!(
            "Install verified: npm wrapper found at {}",
            lib_bin.display()
        ));
    } else {
        return InstallOutcome::failure_with_log(
            format!(
                "npm install of {} appears incomplete: wrapper not found at {}",
                pkg.package_name,
                lib_bin.display()
            ),
            log_lines,
        );
    }

    InstallOutcome {
        success: true,
        message: format!("{} installed successfully.", pkg.package_name),
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

// DRY:FN:generate_npm_bin_shim — Generate a shim script in APP_BIN that delegates to the real npm wrapper with correct NODE_PATH and node in PATH
/// Generate a shim script that delegates to the npm-installed wrapper with correct environment.
///
/// The shim:
/// - Sets `LIB_DIR` to the absolute path of the npm prefix directory
/// - Exports `NODE_PATH=$LIB_DIR/lib/node_modules` so npm packages can resolve modules
/// - Adds node to PATH if available
/// - Delegates to the real npm wrapper at `$LIB_DIR/bin/{tool_name}`
///
/// This avoids the broken relative paths that occur when copying npm wrappers out of their
/// node_modules directory.
///
/// # Arguments
/// - `tool_name`: The binary name (e.g., "gemini", "codex")
/// - `lib_dir`: The npm prefix directory (e.g., `{APP_DATA_DIR}/lib`)
/// - `bin_dir`: The app bin directory where the shim will be written
/// - `node_path`: Optional path to node executable (to add its parent dir to PATH)
/// - `log_lines`: Mutable log buffer
///
/// # Returns
/// Path to the generated shim on success.
pub fn generate_npm_bin_shim(
    tool_name: &str,
    lib_dir: &std::path::Path,
    bin_dir: &std::path::Path,
    node_path: Option<&std::path::Path>,
    log_lines: &mut Vec<String>,
) -> Result<PathBuf, String> {
    let node_parent = node_path
        .and_then(|p| p.parent())
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    #[cfg(target_os = "windows")]
    {
        let shim_path = bin_dir.join(format!("{}.cmd", tool_name));
        let lib_dir_str = lib_dir.display().to_string();

        let content = if node_parent.is_empty() {
            format!(
                "@echo off\r\nREM Auto-generated shim for {} — do not edit\r\nset \"LIB_DIR={}\"\r\nset \"NODE_PATH=%LIB_DIR%\\lib\\node_modules\"\r\n\"%LIB_DIR%\\bin\\{}.cmd\" %*\r\n",
                tool_name, lib_dir_str, tool_name
            )
        } else {
            format!(
                "@echo off\r\nREM Auto-generated shim for {} — do not edit\r\nset \"LIB_DIR={}\"\r\nset \"NODE_PATH=%LIB_DIR%\\lib\\node_modules\"\r\nset \"PATH={};%PATH%\"\r\n\"%LIB_DIR%\\bin\\{}.cmd\" %*\r\n",
                tool_name, lib_dir_str, node_parent, tool_name
            )
        };

        std::fs::write(&shim_path, content).map_err(|e| e.to_string())?;
        log_lines.push(format!("Generated Windows shim: {}", shim_path.display()));
        Ok(shim_path)
    }

    #[cfg(not(target_os = "windows"))]
    {
        let shim_path = bin_dir.join(tool_name);
        let lib_dir_str = lib_dir.display().to_string();

        let content = if node_parent.is_empty() {
            format!(
                "#!/usr/bin/env bash\n# Auto-generated shim for {} — do not edit\nLIB_DIR=\"{}\"\nexport NODE_PATH=\"$LIB_DIR/lib/node_modules\"\nexec \"$LIB_DIR/bin/{}\" \"$@\"\n",
                tool_name, lib_dir_str, tool_name
            )
        } else {
            format!(
                "#!/usr/bin/env bash\n# Auto-generated shim for {} — do not edit\nLIB_DIR=\"{}\"\nexport NODE_PATH=\"$LIB_DIR/lib/node_modules\"\nexport PATH=\"{}:$PATH\"\nexec \"$LIB_DIR/bin/{}\" \"$@\"\n",
                tool_name, lib_dir_str, node_parent, tool_name
            )
        };

        std::fs::write(&shim_path, &content).map_err(|e| e.to_string())?;

        // Set executable permissions on Unix
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(&shim_path)
                .map_err(|e| e.to_string())?
                .permissions();
            perms.set_mode(0o755);
            std::fs::set_permissions(&shim_path, perms).map_err(|e| e.to_string())?;
        }

        log_lines.push(format!("Generated Unix shim: {}", shim_path.display()));
        Ok(shim_path)
    }
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
    fn npm_package_for_claude_returns_none() {
        assert!(npm_package_for_platform(crate::types::Platform::Claude).is_none());
    }

    #[test]
    fn npm_package_for_copilot_returns_correct_package() {
        // Copilot is now installed via npm @github/copilot (coding agent, not gh-copilot suggest/explain)
        let pkg = npm_package_for_platform(crate::types::Platform::Copilot).unwrap();
        assert_eq!(pkg.package_name, "@github/copilot");
        assert_eq!(pkg.binary_name, "copilot");
    }
}
