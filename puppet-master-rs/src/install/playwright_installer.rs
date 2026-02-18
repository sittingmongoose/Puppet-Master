//! Playwright app-local installation.
//!
//! Installs Playwright via npm with `NPM_CONFIG_PREFIX` pointing to the app
//! data directory, then downloads browser binaries to
//! `{APP_DATA_DIR}/playwright-browsers/`.

use crate::install::app_paths::{get_app_bin_dir, get_lib_dir, get_playwright_browsers_dir};
use crate::install::install_coordinator::InstallOutcome;
use crate::install::npm_installer::{NpmPackage, npm_install_to_app_dir};
use crate::platforms::path_utils::resolve_executable;
use log::{info, warn};
use std::ffi::OsString;
use std::path::PathBuf;
use std::process::Stdio;

const PLAYWRIGHT_PKG: NpmPackage = NpmPackage {
    package_name: "playwright",
    binary_name: "playwright",
};

// DRY:FN:generate_playwright_shim — Write a playwright shim that sets PLAYWRIGHT_BROWSERS_PATH and NODE_PATH
/// Generate a playwright-specific shim that sets both `NODE_PATH` and
/// `PLAYWRIGHT_BROWSERS_PATH` before delegating to the npm-installed wrapper.
///
/// This overwrites the generic shim created by [`npm_install_to_app_dir`] with one
/// that includes the browser path so Playwright can locate its app-local browsers.
///
/// # Arguments
/// - `lib_dir`: The npm prefix directory (e.g. `{APP_DATA_DIR}/lib`).
/// - `bin_dir`: The app bin directory where the shim will be written.
/// - `node_path`: Optional path to the `node` executable (prepended to PATH).
fn generate_playwright_shim(
    lib_dir: &std::path::Path,
    bin_dir: &std::path::Path,
    node_path: Option<&std::path::Path>,
) -> Result<(), String> {
    let browsers_dir = crate::install::app_paths::get_playwright_browsers_dir();
    let lib_dir_str = lib_dir.display().to_string();
    let browsers_dir_str = browsers_dir.display().to_string();
    let node_parent = node_path
        .and_then(|p| p.parent())
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    #[cfg(not(target_os = "windows"))]
    {
        let shim_path = bin_dir.join("playwright");
        let content = if node_parent.is_empty() {
            format!(
                "#!/usr/bin/env bash\n# Auto-generated shim for playwright — do not edit\nLIB_DIR=\"{lib_dir_str}\"\nexport NODE_PATH=\"$LIB_DIR/lib/node_modules\"\nexport PLAYWRIGHT_BROWSERS_PATH=\"{browsers_dir_str}\"\nexec \"$LIB_DIR/bin/playwright\" \"$@\"\n"
            )
        } else {
            format!(
                "#!/usr/bin/env bash\n# Auto-generated shim for playwright — do not edit\nLIB_DIR=\"{lib_dir_str}\"\nexport NODE_PATH=\"$LIB_DIR/lib/node_modules\"\nexport PATH=\"{node_parent}:$PATH\"\nexport PLAYWRIGHT_BROWSERS_PATH=\"{browsers_dir_str}\"\nexec \"$LIB_DIR/bin/playwright\" \"$@\"\n"
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
        let shim_path = bin_dir.join("playwright.cmd");
        let content = if node_parent.is_empty() {
            format!(
                "@echo off\r\nREM Auto-generated shim for playwright — do not edit\r\nset \"LIB_DIR={lib_dir_str}\"\r\nset \"NODE_PATH=%LIB_DIR%\\lib\\node_modules\"\r\nset \"PLAYWRIGHT_BROWSERS_PATH={browsers_dir_str}\"\r\n\"%LIB_DIR%\\bin\\playwright.cmd\" %*\r\n"
            )
        } else {
            format!(
                "@echo off\r\nREM Auto-generated shim for playwright — do not edit\r\nset \"LIB_DIR={lib_dir_str}\"\r\nset \"NODE_PATH=%LIB_DIR%\\lib\\node_modules\"\r\nset \"PATH={node_parent};%PATH%\"\r\nset \"PLAYWRIGHT_BROWSERS_PATH={browsers_dir_str}\"\r\n\"%LIB_DIR%\\bin\\playwright.cmd\" %*\r\n"
            )
        };
        std::fs::write(&shim_path, content).map_err(|e| e.to_string())?;
    }

    Ok(())
}

// DRY:FN:install_playwright_app_local — npm install playwright + browser download
/// Install Playwright into the app data directory and download browser binaries.
///
/// Steps:
/// 1. `npm install -g playwright` with `NPM_CONFIG_PREFIX={APP_DATA_DIR}/lib`
/// 2. Regenerate the playwright shim to include `PLAYWRIGHT_BROWSERS_PATH`
/// 3. `npx playwright install` with `PLAYWRIGHT_BROWSERS_PATH={APP_DATA_DIR}/playwright-browsers`
pub async fn install_playwright_app_local() -> InstallOutcome {
    info!("Installing Playwright (app-local)");

    // Step 1: npm install playwright
    let npm_outcome = npm_install_to_app_dir(&PLAYWRIGHT_PKG).await;
    if !npm_outcome.success {
        return npm_outcome;
    }

    let mut log_lines = npm_outcome.log_lines;

    // Step 2: Regenerate the playwright shim to include PLAYWRIGHT_BROWSERS_PATH.
    // The generic shim from npm_install_to_app_dir lacks this env var, so playwright
    // cannot locate its app-local browser binaries when invoked via the shim.
    let lib_dir_path = get_lib_dir();
    let bin_dir_path = get_app_bin_dir();
    let node_path = resolve_executable("node").map(PathBuf::from);
    match generate_playwright_shim(&lib_dir_path, &bin_dir_path, node_path.as_deref()) {
        Ok(()) => {
            log_lines.push(
                "Regenerated playwright shim with PLAYWRIGHT_BROWSERS_PATH.".to_string(),
            );
        }
        Err(e) => {
            // Non-fatal: browsers are still installed, shim just lacks the env var.
            warn!("Failed to regenerate playwright shim: {e}");
            log_lines.push(format!(
                "Warning: could not regenerate playwright shim: {e}"
            ));
        }
    }

    // Step 3: Download browsers
    let browsers_outcome = download_playwright_browsers(&mut log_lines).await;
    if !browsers_outcome.success {
        return InstallOutcome {
            success: false,
            message: browsers_outcome.message,
            log_lines,
            installed_path: None,
        };
    }

    log_lines.extend(browsers_outcome.log_lines);
    InstallOutcome {
        success: true,
        message: "Playwright installed with browsers.".to_string(),
        log_lines,
        installed_path: None,
    }
}

async fn download_playwright_browsers(log_lines: &mut Vec<String>) -> InstallOutcome {
    let lib_dir = get_lib_dir();
    let browsers_dir = get_playwright_browsers_dir();

    // Ensure browsers directory exists
    if let Err(e) = std::fs::create_dir_all(&browsers_dir) {
        return InstallOutcome::failure(format!("Failed to create playwright-browsers dir: {e}"));
    }

    // Find npx
    let npx_path = match resolve_executable("npx") {
        Some(p) => p,
        None => {
            return InstallOutcome::failure("npx not found; cannot download Playwright browsers.");
        }
    };

    let prefix_val: OsString = lib_dir.into_os_string();
    let browsers_val: OsString = browsers_dir.as_os_str().to_owned();

    log_lines.push(format!(
        "Running: npx playwright install (PLAYWRIGHT_BROWSERS_PATH={})",
        browsers_dir.display()
    ));

    let result = tokio::process::Command::new(&npx_path)
        .args(["playwright", "install"])
        .env("NPM_CONFIG_PREFIX", &prefix_val)
        .env("PLAYWRIGHT_BROWSERS_PATH", &browsers_val)
        .env(
            "PATH",
            crate::platforms::path_utils::build_enhanced_path_for_subprocess(),
        )
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(out) => {
            log_lines.push(String::from_utf8_lossy(&out.stdout).to_string());
            if !out.status.success() {
                log_lines.push(String::from_utf8_lossy(&out.stderr).to_string());
                return InstallOutcome::failure_with_log(
                    "playwright install (browser download) failed",
                    log_lines.clone(),
                );
            }
            InstallOutcome {
                success: true,
                message: format!(
                    "Playwright browsers downloaded to {}",
                    browsers_dir.display()
                ),
                log_lines: log_lines.clone(),
                installed_path: Some(browsers_dir),
            }
        }
        Err(e) => InstallOutcome::failure(format!("npx playwright install failed: {e}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn playwright_pkg_has_correct_name() {
        assert_eq!(PLAYWRIGHT_PKG.package_name, "playwright");
        assert_eq!(PLAYWRIGHT_PKG.binary_name, "playwright");
    }
}
