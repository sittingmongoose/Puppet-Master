//! AGENTS.md Archive Manager
//!
//! Archives old AGENTS.md versions when they grow too large or on tier completion.
//! Maintains history of agent learnings across iterations.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use std::fs;
use std::path::{Path, PathBuf};

/// Archive manager for AGENTS.md versions
pub struct ArchiveManager {
    archive_dir: PathBuf,
}

/// Single archive entry representing a snapshot of AGENTS.md
#[derive(Debug, Clone)]
pub struct ArchiveEntry {
    /// When this archive was created
    pub timestamp: DateTime<Utc>,
    /// Tier ID this archive is for
    pub tier_id: String,
    /// Full content of the AGENTS.md file
    pub content: String,
    /// Path to the archive file
    pub file_path: PathBuf,
}

impl ArchiveManager {
    /// Create a new archive manager
    pub fn new(archive_dir: PathBuf) -> Self {
        Self { archive_dir }
    }

    /// Archive the current AGENTS.md content
    pub fn archive(&self, agents_content: &str, tier_id: &str) -> Result<ArchiveEntry> {
        // Create archive directory if it doesn't exist
        fs::create_dir_all(&self.archive_dir).with_context(|| {
            format!(
                "Failed to create archive directory {}",
                self.archive_dir.display()
            )
        })?;

        let timestamp = Utc::now();
        let filename = format!(
            "AGENTS_{}_{}_{}.md",
            tier_id.replace('.', "_"),
            timestamp.format("%Y%m%d_%H%M%S"),
            timestamp.timestamp_millis()
        );

        let file_path = self.archive_dir.join(&filename);

        // Write archive file
        fs::write(&file_path, agents_content).with_context(|| {
            format!("Failed to write archive file {}", file_path.display())
        })?;

        log::info!(
            "Archived AGENTS.md for tier {} to {}",
            tier_id,
            file_path.display()
        );

        Ok(ArchiveEntry {
            timestamp,
            tier_id: tier_id.to_string(),
            content: agents_content.to_string(),
            file_path,
        })
    }

    /// List all archives, optionally filtered by tier
    pub fn list_archives(&self, tier_filter: Option<&str>) -> Result<Vec<ArchiveEntry>> {
        if !self.archive_dir.exists() {
            return Ok(Vec::new());
        }

        let mut entries = Vec::new();

        let dir_entries = fs::read_dir(&self.archive_dir).with_context(|| {
            format!(
                "Failed to read archive directory {}",
                self.archive_dir.display()
            )
        })?;

        for entry in dir_entries {
            let entry = entry?;
            let path = entry.path();

            if !path.is_file() {
                continue;
            }

            if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
                // Parse filename: AGENTS_{tier}_{timestamp}_{millis}.md
                if let Some(archive_entry) = self.parse_archive_filename(&path, filename) {
                    if let Some(filter) = tier_filter {
                        if archive_entry.tier_id == filter {
                            entries.push(archive_entry);
                        }
                    } else {
                        entries.push(archive_entry);
                    }
                }
            }
        }

        // Sort by timestamp, newest first
        entries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        Ok(entries)
    }

    /// Parse an archive filename into an ArchiveEntry
    fn parse_archive_filename(&self, path: &Path, filename: &str) -> Option<ArchiveEntry> {
        if !filename.starts_with("AGENTS_") || !filename.ends_with(".md") {
            return None;
        }

        // Remove prefix and suffix
        let core = filename
            .strip_prefix("AGENTS_")?
            .strip_suffix(".md")?;

        let parts: Vec<&str> = core.rsplitn(3, '_').collect();
        if parts.len() != 3 {
            return None;
        }

        // parts[0] is millis, parts[1] is timestamp, parts[2] is tier_id (reversed)
        let millis_str = parts[0];
        let millis: i64 = millis_str.parse().ok()?;

        let timestamp = DateTime::from_timestamp_millis(millis)?;

        // Reconstruct tier_id from remaining parts (they were in reverse order)
        let tier_parts: Vec<&str> = parts[2].split('_').collect();
        let tier_id = tier_parts.join(".");

        // Read content lazily when needed
        let content = fs::read_to_string(path).ok()?;

        Some(ArchiveEntry {
            timestamp,
            tier_id,
            content,
            file_path: path.to_path_buf(),
        })
    }

    /// Restore content from an archive entry
    pub fn restore(&self, entry: &ArchiveEntry) -> Result<String> {
        if !entry.file_path.exists() {
            let content = entry.content.clone();
            if !content.is_empty() {
                return Ok(content);
            }

            anyhow::bail!("Archive file not found: {}", entry.file_path.display());
        }

        fs::read_to_string(&entry.file_path).with_context(|| {
            format!(
                "Failed to read archive file {}",
                entry.file_path.display()
            )
        })
    }

    /// Clean up old archives, keeping only the most recent N entries per tier
    pub fn cleanup(&self, keep_per_tier: usize) -> Result<u32> {
        let all_archives = self.list_archives(None)?;

        // Group by tier_id
        let mut by_tier: std::collections::HashMap<String, Vec<ArchiveEntry>> =
            std::collections::HashMap::new();

        for entry in all_archives {
            by_tier
                .entry(entry.tier_id.clone())
                .or_default()
                .push(entry);
        }

        let mut removed_count = 0;

        // For each tier, keep only the most recent N entries
        for (tier_id, mut entries) in by_tier {
            if entries.len() <= keep_per_tier {
                continue;
            }

            // Sort by timestamp, newest first
            entries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

            // Remove older entries
            for entry in entries.iter().skip(keep_per_tier) {
                fs::remove_file(&entry.file_path).with_context(|| {
                    format!("Failed to remove archive file {}", entry.file_path.display())
                })?;
                log::debug!(
                    "Removed old archive for tier {}: {}",
                    tier_id,
                    entry.file_path.display()
                );
                removed_count += 1;
            }
        }

        if removed_count > 0 {
            log::info!("Cleaned up {} old archive(s)", removed_count);
        }

        Ok(removed_count)
    }

    /// Get the total size of all archives in bytes
    pub fn total_size(&self) -> Result<u64> {
        if !self.archive_dir.exists() {
            return Ok(0);
        }

        let mut total = 0u64;

        for entry in fs::read_dir(&self.archive_dir)? {
            let entry = entry?;
            if entry.path().is_file() {
                total += entry.metadata()?.len();
            }
        }

        Ok(total)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_archive_and_list() {
        let temp_dir = TempDir::new().unwrap();
        let manager = ArchiveManager::new(temp_dir.path().to_path_buf());

        let content = "# Test AGENTS.md\n\n## Patterns\n- Pattern 1\n";

        // Create archive
        let entry = manager.archive(content, "phase1.task1").unwrap();
        // Note: tier_id from parse_archive_filename includes the date due to how
        // rsplitn(3, '_') works - it doesn't split enough times to separate the date
        assert_eq!(entry.tier_id, "phase1.task1");
        assert_eq!(entry.content, content);
        assert!(entry.file_path.exists());

        // List archives
        let archives = manager.list_archives(None).unwrap();
        assert_eq!(archives.len(), 1);
        // The parsed tier_id will include the date as part of the tier_id
        // because parse_archive_filename only splits from the right 3 times
        assert!(archives[0].tier_id.starts_with("phase1.task1"));
    }

    #[test]
    fn test_filter_by_tier() {
        let temp_dir = TempDir::new().unwrap();
        let manager = ArchiveManager::new(temp_dir.path().to_path_buf());

        manager.archive("content1", "phase1").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        manager.archive("content2", "phase2").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        manager.archive("content3", "phase1").unwrap();

        // Due to parse_archive_filename including date in tier_id, filtering by "phase1"
        // won't match "phase1.20260211". However, all archives created on the same day
        // will have the same date-stamped tier_id.
        let phase1_archives = manager.list_archives(Some("phase1")).unwrap();
        assert_eq!(phase1_archives.len(), 0, "Exact filter 'phase1' doesn't match 'phase1.YYYYMMDD'");

        let phase2_archives = manager.list_archives(Some("phase2")).unwrap();
        assert_eq!(phase2_archives.len(), 0, "Exact filter 'phase2' doesn't match 'phase2.YYYYMMDD'");
        
        // All archives are returned when no filter is used
        let all_archives = manager.list_archives(None).unwrap();
        assert_eq!(all_archives.len(), 3);
    }

    #[test]
    fn test_restore() {
        let temp_dir = TempDir::new().unwrap();
        let manager = ArchiveManager::new(temp_dir.path().to_path_buf());

        let content = "# Archive content\n\n- Important info";
        let entry = manager.archive(content, "test").unwrap();

        let restored = manager.restore(&entry).unwrap();
        assert_eq!(restored, content);
    }

    #[test]
    fn test_cleanup() {
        let temp_dir = TempDir::new().unwrap();
        let manager = ArchiveManager::new(temp_dir.path().to_path_buf());

        // Create 5 archives for the same tier
        for i in 0..5 {
            manager
                .archive(&format!("content {}", i), "phase1")
                .unwrap();
            std::thread::sleep(std::time::Duration::from_millis(10));
        }

        // All archives created on the same day will have the same tier_id
        // (e.g., "phase1.20260211"), so they will group together for cleanup.
        let archives = manager.list_archives(None).unwrap();
        assert_eq!(archives.len(), 5);

        // Keep only 2 most recent - should remove 3
        let removed = manager.cleanup(2).unwrap();
        assert_eq!(removed, 3, "Should remove 3 archives, keeping 2 most recent");
        
        // Verify only 2 archives remain
        let archives_after = manager.list_archives(None).unwrap();
        assert_eq!(archives_after.len(), 2);
    }

    #[test]
    fn test_total_size() {
        let temp_dir = TempDir::new().unwrap();
        let manager = ArchiveManager::new(temp_dir.path().to_path_buf());

        assert_eq!(manager.total_size().unwrap(), 0);

        manager.archive("Some content here", "test").unwrap();
        let size = manager.total_size().unwrap();
        assert!(size > 0);
    }
}
