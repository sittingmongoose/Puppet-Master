//! GitHub Copilot CLI app-local binary installer.
//!
//! Downloads the latest `copilot` native binary from the `github/gh-copilot`
//! GitHub Releases and installs it into `{APP_DATA_DIR}/bin/copilot`.
//!
//! The `copilot` CLI is a native ELF/Mach-O/PE binary — NOT an npm package.
//!
//! Asset name pattern (flat binaries, no archive):
//! - Linux  amd64 → `linux-amd64`
//! - Linux  arm64 → `linux-arm64`
//! - macOS  amd64 → `darwin-amd64`
//! - macOS  arm64 → `darwin-arm64`
//! - Windows amd64 → `windows-amd64.exe`

use crate::install::app_paths::ensure_app_bin_dir;
use crate::install::install_coordinator::InstallOutcome;
use log::info;

/// GitHub Releases API endpoint for the `github/gh-copilot` repository.
const COPILOT_RELEASES_API: &str =
    "https://api.github.com/repos/github/gh-copilot/releases/latest";

// DRY:FN:install_copilot_app_local — Download copilot native binary into app-local bin/
/// Download the latest GitHub Copilot CLI binary for the current platform and
/// install it into `{APP_DATA_DIR}/bin/copilot`.
pub async fn install_copilot_app_local() -> InstallOutcome {
    info!("Installing GitHub Copilot CLI to app-local bin/");
    let mut log_lines = Vec::new();

    // Step 1: Fetch release metadata
    log_lines.push(format!("Fetching release info from {COPILOT_RELEASES_API}"));
    let release = match fetch_latest_release(&mut log_lines).await {
        Ok(r) => r,
        Err(e) => return InstallOutcome::failure_with_log(e, log_lines),
    };

    // Step 2: Pick the right asset URL
    let asset_url = match pick_asset_url(&release, &mut log_lines) {
        Some(u) => u,
        None => {
            return InstallOutcome::failure_with_log(
                "No compatible copilot release asset found for this platform/arch.",
                log_lines,
            );
        }
    };

    // Step 3: Download the binary directly (no archive — flat binary)
    log_lines.push(format!("Downloading {asset_url}"));
    let bytes = match download_bytes(&asset_url, &mut log_lines).await {
        Ok(b) => b,
        Err(e) => return InstallOutcome::failure_with_log(e, log_lines),
    };

    // Step 4: Write binary to bin dir
    let bin_dir = match ensure_app_bin_dir() {
        Ok(d) => d,
        Err(e) => {
            return InstallOutcome::failure_with_log(
                format!("Failed to create bin dir: {e}"),
                log_lines,
            )
        }
    };

    let binary_name = if cfg!(target_os = "windows") {
        "copilot.exe"
    } else {
        "copilot"
    };
    let dst = bin_dir.join(binary_name);

    if let Err(e) = std::fs::write(&dst, &bytes) {
        return InstallOutcome::failure_with_log(
            format!("Failed to write copilot binary: {e}"),
            log_lines,
        );
    }

    set_executable_bit(&dst);
    log_lines.push(format!("copilot installed at {}", dst.display()));

    InstallOutcome {
        success: true,
        message: format!("GitHub Copilot CLI installed to {}", dst.display()),
        log_lines,
        installed_path: Some(dst),
    }
}

/// Fetch the latest release JSON from GitHub API.
async fn fetch_latest_release(
    log_lines: &mut Vec<String>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::builder()
        .user_agent("rwm-puppet-master/1.0")
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    let resp = client
        .get(COPILOT_RELEASES_API)
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!(
            "GitHub API returned HTTP {}",
            resp.status()
        ));
    }

    let json: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse release JSON: {e}"))?;

    let tag = json["tag_name"].as_str().unwrap_or("unknown");
    log_lines.push(format!("Latest copilot release: {tag}"));
    Ok(json)
}

/// Select the download URL for the current platform + architecture.
///
/// Asset names follow the pattern `{os}-{arch}` (e.g. `linux-amd64`, `darwin-arm64`,
/// `windows-amd64.exe`).
fn pick_asset_url(release: &serde_json::Value, log_lines: &mut Vec<String>) -> Option<String> {
    let assets = release["assets"].as_array()?;

    let asset_name = current_asset_name();
    log_lines.push(format!("Looking for asset: {asset_name}"));

    for asset in assets {
        let name = asset["name"].as_str().unwrap_or("");
        if name == asset_name {
            let url = asset["browser_download_url"]
                .as_str()
                .unwrap_or("")
                .to_string();
            if !url.is_empty() {
                log_lines.push(format!("Selected asset: {name}"));
                return Some(url);
            }
        }
    }

    // Log available assets to help diagnose failures
    let names: Vec<&str> = assets
        .iter()
        .filter_map(|a| a["name"].as_str())
        .collect();
    log_lines.push(format!("Available assets: {}", names.join(", ")));
    None
}

/// Returns the exact asset filename for the current target triple.
fn current_asset_name() -> &'static str {
    #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
    return "linux-amd64";
    #[cfg(all(target_os = "linux", target_arch = "aarch64"))]
    return "linux-arm64";
    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    return "darwin-amd64";
    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    return "darwin-arm64";
    #[cfg(all(target_os = "windows", target_arch = "x86_64"))]
    return "windows-amd64.exe";
    #[cfg(not(any(
        all(target_os = "linux", target_arch = "x86_64"),
        all(target_os = "linux", target_arch = "aarch64"),
        all(target_os = "macos", target_arch = "x86_64"),
        all(target_os = "macos", target_arch = "aarch64"),
        all(target_os = "windows", target_arch = "x86_64"),
    )))]
    return "linux-amd64";
}

/// Download bytes from a URL.
async fn download_bytes(url: &str, log_lines: &mut Vec<String>) -> Result<Vec<u8>, String> {
    let client = reqwest::Client::builder()
        .user_agent("rwm-puppet-master/1.0")
        .build()
        .map_err(|e| format!("HTTP client build error: {e}"))?;

    let resp = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Download failed: {e}"))?;

    let status = resp.status();
    if !status.is_success() {
        return Err(format!("Download HTTP {status}"));
    }

    let content_length = resp.content_length().unwrap_or(0);
    if content_length > 0 {
        log_lines.push(format!("Downloading {} bytes…", content_length));
    }

    resp.bytes()
        .await
        .map(|b| b.to_vec())
        .map_err(|e| format!("Reading download body: {e}"))
}

#[cfg(not(target_os = "windows"))]
fn set_executable_bit(path: &std::path::Path) {
    use std::os::unix::fs::PermissionsExt;
    if let Ok(meta) = std::fs::metadata(path) {
        let mut perms = meta.permissions();
        perms.set_mode(perms.mode() | 0o111);
        let _ = std::fs::set_permissions(path, perms);
    }
}

#[cfg(target_os = "windows")]
fn set_executable_bit(_path: &std::path::Path) {}

/// Return the public download URL base for the given platform asset.
/// Used in tests and display only.
pub fn copilot_asset_download_url(tag: &str) -> String {
    let asset = current_asset_name();
    format!(
        "https://github.com/github/gh-copilot/releases/download/{tag}/{asset}"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn current_asset_name_is_non_empty() {
        let name = current_asset_name();
        assert!(!name.is_empty());
    }

    #[test]
    fn asset_name_format_is_correct() {
        let name = current_asset_name();
        // Must be "os-arch" or "os-arch.exe"
        assert!(
            name.contains('-'),
            "Asset name should contain a dash: {name}"
        );
    }

    #[test]
    fn download_url_contains_asset_name() {
        let url = copilot_asset_download_url("v1.2.0");
        assert!(url.contains("gh-copilot"), "URL should reference gh-copilot repo");
        assert!(url.contains("v1.2.0"), "URL should contain the tag");
        assert!(url.contains(current_asset_name()), "URL should contain the asset name");
    }
}
