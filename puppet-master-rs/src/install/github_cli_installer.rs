//! GitHub CLI (gh) app-local binary installer.
//!
//! Downloads the latest `gh` release from the GitHub Releases API and installs
//! the binary into `{APP_DATA_DIR}/bin/gh`.
//!
//! Platform asset mapping:
//! - Linux  amd64 → `gh_*_linux_amd64.tar.gz`
//! - Linux  arm64 → `gh_*_linux_arm64.tar.gz`
//! - macOS  amd64 → `gh_*_macOS_amd64.zip`
//! - macOS  arm64 → `gh_*_macOS_arm64.zip`
//! - Windows amd64 → `gh_*_windows_amd64.zip`

use crate::install::app_paths::ensure_app_bin_dir;
use crate::install::install_coordinator::InstallOutcome;
use log::{debug, info};
use std::path::PathBuf;

/// GitHub Releases API endpoint for the `cli/cli` repository.
const GH_RELEASES_API: &str =
    "https://api.github.com/repos/cli/cli/releases/latest";

// DRY:FN:install_gh_to_app_bin — Download + extract gh binary into app-local bin/
/// Download the latest GitHub CLI binary for the current platform and install it
/// into `{APP_DATA_DIR}/bin/gh`.
pub async fn install_gh_to_app_bin() -> InstallOutcome {
    info!("Installing GitHub CLI to app-local bin/");
    let mut log_lines = Vec::new();

    // Step 1: Fetch release metadata
    log_lines.push(format!("Fetching release info from {GH_RELEASES_API}"));
    let release = match fetch_latest_release(&mut log_lines).await {
        Ok(r) => r,
        Err(e) => return InstallOutcome::failure_with_log(e, log_lines),
    };

    // Step 2: Pick the right asset
    let asset_url = match pick_asset_url(&release, &mut log_lines) {
        Some(u) => u,
        None => {
            return InstallOutcome::failure_with_log(
                "No compatible gh release asset found for this platform/arch.",
                log_lines,
            );
        }
    };

    // Step 3: Download
    log_lines.push(format!("Downloading {asset_url}"));
    let bytes = match download_bytes(&asset_url, &mut log_lines).await {
        Ok(b) => b,
        Err(e) => return InstallOutcome::failure_with_log(e, log_lines),
    };

    // Step 4: Extract + install
    let bin_dir = match ensure_app_bin_dir() {
        Ok(d) => d,
        Err(e) => {
            return InstallOutcome::failure_with_log(
                format!("Failed to create bin dir: {e}"),
                log_lines,
            )
        }
    };

    match extract_and_install_gh(bytes.as_slice(), &bin_dir, &asset_url, &mut log_lines) {
        Ok(dst) => {
            log_lines.push(format!("gh installed at {}", dst.display()));
            InstallOutcome {
                success: true,
                message: format!(
                    "GitHub CLI installed to {}",
                    dst.display()
                ),
                log_lines,
                installed_path: Some(dst),
            }
        }
        Err(e) => InstallOutcome::failure_with_log(e, log_lines),
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
        .get(GH_RELEASES_API)
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
    log_lines.push(format!("Latest gh release: {tag}"));
    Ok(json)
}

/// Select the download URL for the current platform + architecture.
fn pick_asset_url(release: &serde_json::Value, log_lines: &mut Vec<String>) -> Option<String> {
    let assets = release["assets"].as_array()?;

    let (os_key, arch_key, ext) = current_platform_keys();
    log_lines.push(format!(
        "Looking for asset matching os={os_key} arch={arch_key} ext={ext}"
    ));

    for asset in assets {
        let name = asset["name"].as_str().unwrap_or("");
        let name_lower = name.to_lowercase();
        if name_lower.contains(os_key)
            && name_lower.contains(arch_key)
            && name_lower.ends_with(ext)
        {
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

/// Returns `(os_substring, arch_substring, extension)` for the current target.
fn current_platform_keys() -> (&'static str, &'static str, &'static str) {
    #[cfg(target_os = "linux")]
    let os = "linux";
    #[cfg(target_os = "macos")]
    let os = "macos";
    #[cfg(target_os = "windows")]
    let os = "windows";
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    let os = "linux";

    #[cfg(target_arch = "x86_64")]
    let arch = "amd64";
    #[cfg(target_arch = "aarch64")]
    let arch = "arm64";
    #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
    let arch = "amd64";

    #[cfg(target_os = "windows")]
    let ext = ".zip";
    #[cfg(not(target_os = "windows"))]
    let ext = ".tar.gz";

    (os, arch, ext)
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
        log_lines.push(format!(
            "Downloading {} bytes…",
            content_length
        ));
    }

    resp.bytes()
        .await
        .map(|b| b.to_vec())
        .map_err(|e| format!("Reading download body: {e}"))
}

/// Extract the `gh` binary from the downloaded archive and copy to `bin_dir`.
fn extract_and_install_gh(
    bytes: &[u8],
    bin_dir: &std::path::Path,
    asset_url: &str,
    log_lines: &mut Vec<String>,
) -> Result<PathBuf, String> {
    let tmp_dir = std::env::temp_dir().join(format!("rwm-gh-{}", std::process::id()));
    std::fs::create_dir_all(&tmp_dir)
        .map_err(|e| format!("Failed to create temp dir: {e}"))?;

    let tmp_archive = if asset_url.ends_with(".zip") {
        tmp_dir.join("gh.zip")
    } else {
        tmp_dir.join("gh.tar.gz")
    };

    debug!("Writing archive to {}", tmp_archive.display());
    std::fs::write(&tmp_archive, bytes)
        .map_err(|e| format!("Failed to write archive: {e}"))?;

    let gh_binary_name = if cfg!(target_os = "windows") { "gh.exe" } else { "gh" };

    if asset_url.ends_with(".zip") {
        extract_zip_and_find_gh(&tmp_archive, &tmp_dir, gh_binary_name, log_lines)?;
    } else {
        extract_tarball_and_find_gh(&tmp_archive, &tmp_dir, log_lines)?;
    }

    // Find the extracted `gh` binary (it's usually inside a versioned subdirectory)
    let gh_src = find_gh_binary(&tmp_dir, gh_binary_name)
        .ok_or_else(|| format!("Could not find {gh_binary_name} in extracted archive"))?;

    let dst = bin_dir.join(gh_binary_name);
    std::fs::copy(&gh_src, &dst)
        .map_err(|e| format!("Failed to copy gh binary: {e}"))?;

    set_executable_bit(&dst);
    log_lines.push(format!("Installed gh → {}", dst.display()));

    // Cleanup
    let _ = std::fs::remove_dir_all(&tmp_dir);

    Ok(dst)
}

/// Extract a `.zip` archive into `extract_dir`.
fn extract_zip_and_find_gh(
    archive: &std::path::Path,
    extract_dir: &std::path::Path,
    _gh_name: &str,
    log_lines: &mut Vec<String>,
) -> Result<(), String> {
    let file = std::fs::File::open(archive)
        .map_err(|e| format!("Cannot open zip: {e}"))?;
    let mut zip = zip::ZipArchive::new(file)
        .map_err(|e| format!("Invalid zip archive: {e}"))?;

    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| format!("Zip entry error: {e}"))?;
        let out_path = extract_dir.join(entry.mangled_name());
        if entry.is_dir() {
            std::fs::create_dir_all(&out_path)
                .map_err(|e| format!("mkdir error: {e}"))?;
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|e| format!("mkdir error: {e}"))?;
            }
            let mut out_file = std::fs::File::create(&out_path)
                .map_err(|e| format!("File create error: {e}"))?;
            std::io::copy(&mut entry, &mut out_file)
                .map_err(|e| format!("Copy error: {e}"))?;
        }
    }

    log_lines.push("Archive extracted (zip)".to_string());
    Ok(())
}

/// Extract a `.tar.gz` archive using the system `tar` command.
fn extract_tarball_and_find_gh(
    archive: &std::path::Path,
    extract_dir: &std::path::Path,
    log_lines: &mut Vec<String>,
) -> Result<(), String> {
    let status = std::process::Command::new("tar")
        .args([
            "xzf",
            archive.to_str().unwrap_or(""),
            "-C",
            extract_dir.to_str().unwrap_or(""),
        ])
        .status()
        .map_err(|e| format!("tar not available: {e}"))?;

    if !status.success() {
        return Err("tar extraction failed".to_string());
    }

    log_lines.push("Archive extracted (tar.gz)".to_string());
    Ok(())
}

/// Recursively search `dir` for a file named `name`.
fn find_gh_binary(dir: &std::path::Path, name: &str) -> Option<PathBuf> {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return None;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            if path.file_name().and_then(|n| n.to_str()) == Some(name) {
                return Some(path);
            }
        } else if path.is_dir() {
            if let Some(found) = find_gh_binary(&path, name) {
                return Some(found);
            }
        }
    }
    None
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn current_platform_keys_returns_non_empty() {
        let (os, arch, ext) = current_platform_keys();
        assert!(!os.is_empty());
        assert!(!arch.is_empty());
        assert!(!ext.is_empty());
    }
}
