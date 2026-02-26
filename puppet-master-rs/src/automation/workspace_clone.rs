//! Ephemeral workspace cloning and artifact manifest helpers.

use crate::automation::{ArtifactManifest, ArtifactManifestEntry};
use anyhow::{Context, Result, bail};
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
#[cfg(unix)]
use std::process::Command;

// DRY:DATA:ClonedWorkspace
/// Ephemeral cloned workspace metadata.
#[derive(Debug, Clone)]
pub struct ClonedWorkspace {
    pub original_root: PathBuf,
    pub clone_root: PathBuf,
}

impl ClonedWorkspace {
    // DRY:FN:cleanup
    pub fn cleanup(&self) -> Result<()> {
        if self.clone_root.exists() {
            std::fs::remove_dir_all(&self.clone_root).with_context(|| {
                format!(
                    "Failed to remove cloned workspace {}",
                    self.clone_root.display()
                )
            })?;
        }
        Ok(())
    }
}

// DRY:FN:create_ephemeral_clone
/// Create an ephemeral clone using platform-native copy semantics.
pub fn create_ephemeral_clone(original_root: &Path, run_id: &str) -> Result<ClonedWorkspace> {
    if !original_root.exists() {
        bail!("Workspace root does not exist: {}", original_root.display());
    }

    let clone_root = std::env::temp_dir()
        .join("puppet-master-gui-automation")
        .join(run_id)
        .join("workspace");

    if let Some(parent) = clone_root.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create parent {}", parent.display()))?;
    }

    std::fs::create_dir_all(&clone_root)
        .with_context(|| format!("Failed to create clone root {}", clone_root.display()))?;

    #[cfg(unix)]
    {
        // Use rsync with exclusions for build artifacts that can cause cp -a to fail
        // Excluded: target/ (Rust builds), node_modules/, .git/, and other common artifacts
        let status = Command::new("rsync")
            .args([
                "-a",
                "--exclude=target/",
                "--exclude=node_modules/",
                "--exclude=.git/",
                "--exclude=dist/",
                "--exclude=coverage/",
                "--exclude=.cache/",
                "--exclude=installer-work/",
            ])
            .arg(format!("{}/", original_root.display()))
            .arg(&clone_root)
            .status()
            .context("Failed to spawn rsync for workspace clone")?;

        if !status.success() {
            bail!("rsync failed while cloning workspace");
        }
    }

    #[cfg(not(unix))]
    {
        copy_recursive(original_root, &clone_root)?;
    }

    Ok(ClonedWorkspace {
        original_root: original_root.to_path_buf(),
        clone_root,
    })
}

// DRY:FN:ensure_path_within
/// Ensure a candidate path stays within a root.
pub fn ensure_path_within(root: &Path, candidate: &Path) -> Result<()> {
    let canonical_root = root
        .canonicalize()
        .with_context(|| format!("Failed to canonicalize root {}", root.display()))?;

    let canonical_candidate = if candidate.exists() {
        candidate
            .canonicalize()
            .with_context(|| format!("Failed to canonicalize candidate {}", candidate.display()))?
    } else if let Some(parent) = candidate.parent() {
        let canonical_parent = parent
            .canonicalize()
            .with_context(|| format!("Failed to canonicalize parent {}", parent.display()))?;
        canonical_parent.join(candidate.file_name().unwrap_or_else(|| OsStr::new("")))
    } else {
        candidate.to_path_buf()
    };

    if !canonical_candidate.starts_with(&canonical_root) {
        bail!(
            "Path {} is outside allowed root {}",
            candidate.display(),
            root.display()
        );
    }

    Ok(())
}

// DRY:FN:build_artifact_manifest
/// Build manifest (hash + metadata) for all artifacts under root.
pub fn build_artifact_manifest(root: &Path) -> Result<ArtifactManifest> {
    let mut entries = Vec::new();

    if root.exists() {
        collect_manifest_entries(root, root, &mut entries)?;
    }

    entries.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));

    Ok(ArtifactManifest {
        root: root.to_path_buf(),
        entries,
    })
}

// DRY:FN:collect_manifest_entries
fn collect_manifest_entries(
    base: &Path,
    current: &Path,
    out: &mut Vec<ArtifactManifestEntry>,
) -> Result<()> {
    for entry in std::fs::read_dir(current)
        .with_context(|| format!("Failed to read dir {}", current.display()))?
    {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            collect_manifest_entries(base, &path, out)?;
            continue;
        }

        if !path.is_file() {
            continue;
        }

        let bytes = std::fs::read(&path)
            .with_context(|| format!("Failed to read artifact {}", path.display()))?;
        let digest = md5::compute(&bytes);
        let rel = path
            .strip_prefix(base)
            .unwrap_or(&path)
            .to_string_lossy()
            .to_string();

        out.push(ArtifactManifestEntry {
            relative_path: rel,
            kind: classify_artifact_kind(&path),
            md5: format!("{:x}", digest),
            bytes: bytes.len() as u64,
        });
    }

    Ok(())
}

// DRY:FN:classify_artifact_kind
fn classify_artifact_kind(path: &Path) -> String {
    match path
        .extension()
        .and_then(|v| v.to_str())
        .unwrap_or_default()
    {
        "png" | "jpg" | "jpeg" => "screenshot".to_string(),
        "json" | "jsonl" => "data".to_string(),
        "md" => "summary".to_string(),
        "log" | "txt" => "log".to_string(),
        _ => "other".to_string(),
    }
}

#[cfg(not(unix))]
// DRY:FN:copy_recursive
fn copy_recursive(source: &Path, dest: &Path) -> Result<()> {
    for entry in std::fs::read_dir(source)
        .with_context(|| format!("Failed to read source dir {}", source.display()))?
    {
        let entry = entry?;
        let src_path = entry.path();
        let file_name = entry.file_name();
        let file_name_str = file_name.to_string_lossy();

        // Skip build artifacts and problematic directories
        if src_path.is_dir()
            && matches!(
                file_name_str.as_ref(),
                "target"
                    | "node_modules"
                    | ".git"
                    | "dist"
                    | "coverage"
                    | ".cache"
                    | "installer-work"
            )
        {
            continue;
        }

        let dst_path = dest.join(entry.file_name());

        if src_path.is_dir() {
            std::fs::create_dir_all(&dst_path)
                .with_context(|| format!("Failed to create dir {}", dst_path.display()))?;
            copy_recursive(&src_path, &dst_path)?;
        } else if src_path.is_file() {
            std::fs::copy(&src_path, &dst_path).with_context(|| {
                format!(
                    "Failed to copy {} to {}",
                    src_path.display(),
                    dst_path.display()
                )
            })?;
        }
    }

    Ok(())
}
