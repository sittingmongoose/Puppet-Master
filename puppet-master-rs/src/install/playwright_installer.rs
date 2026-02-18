//! Playwright app-local installation.
//!
//! Installs Playwright via npm with `NPM_CONFIG_PREFIX` pointing to the app
//! data directory, then downloads browser binaries to
//! `{APP_DATA_DIR}/playwright-browsers/`.

use crate::install::app_paths::{get_lib_dir, get_playwright_browsers_dir};
use crate::install::install_coordinator::InstallOutcome;
use crate::install::npm_installer::{NpmPackage, npm_install_to_app_dir};
use crate::platforms::path_utils::resolve_executable;
use log::info;
use std::ffi::OsString;
use std::process::Stdio;

const PLAYWRIGHT_PKG: NpmPackage = NpmPackage {
    package_name: "playwright",
    binary_name: "playwright",
};

// DRY:FN:install_playwright_app_local — npm install playwright + browser download
/// Install Playwright into the app data directory and download browser binaries.
///
/// Steps:
/// 1. `npm install -g playwright` with `NPM_CONFIG_PREFIX={APP_DATA_DIR}/lib`
/// 2. `npx playwright install` with `PLAYWRIGHT_BROWSERS_PATH={APP_DATA_DIR}/playwright-browsers`
pub async fn install_playwright_app_local() -> InstallOutcome {
    info!("Installing Playwright (app-local)");

    // Step 1: npm install playwright
    let npm_outcome = npm_install_to_app_dir(&PLAYWRIGHT_PKG).await;
    if !npm_outcome.success {
        return npm_outcome;
    }

    let mut log_lines = npm_outcome.log_lines;

    // Step 2: Download browsers
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
