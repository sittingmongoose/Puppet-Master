//! Log Retention Manager
//!
//! Manages log retention and cleanup.
//! Removes old logs based on age, size, or count policies.

use anyhow::{Context, Result};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// Log retention manager
pub struct LogRetentionManager {
    config: RetentionConfig,
}

/// Retention policy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionConfig {
    /// Maximum age in days before cleanup
    pub max_age_days: u32,
    /// Maximum total size in MB
    pub max_total_size_mb: u64,
    /// Maximum number of files to keep
    pub max_file_count: u32,
    /// File patterns to protect from deletion (glob patterns)
    pub protected_patterns: Vec<String>,
}

impl Default for RetentionConfig {
    fn default() -> Self {
        Self {
            max_age_days: 30,
            max_total_size_mb: 1024, // 1 GB
            max_file_count: 1000,
            protected_patterns: vec!["*.protected".to_string(), "important-*".to_string()],
        }
    }
}

/// Result of a cleanup operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupResult {
    /// Number of files removed
    pub files_removed: u32,
    /// Bytes freed
    pub bytes_freed: u64,
    /// Number of files kept
    pub files_kept: u32,
}

impl CleanupResult {
    /// Create an empty result
    pub fn empty() -> Self {
        Self {
            files_removed: 0,
            bytes_freed: 0,
            files_kept: 0,
        }
    }

    /// Add to this result
    pub fn add(&mut self, other: &CleanupResult) {
        self.files_removed += other.files_removed;
        self.bytes_freed += other.bytes_freed;
        self.files_kept += other.files_kept;
    }

    /// Get total files processed
    pub fn total_files(&self) -> u32 {
        self.files_removed + self.files_kept
    }
}

/// File info for cleanup decisions
#[derive(Debug)]
struct FileInfo {
    path: PathBuf,
    size: u64,
    modified: DateTime<Utc>,
    protected: bool,
}

impl LogRetentionManager {
    /// Create a new retention manager
    pub fn new(config: RetentionConfig) -> Self {
        Self { config }
    }

    /// Create with default configuration
    pub fn with_defaults() -> Self {
        Self::new(RetentionConfig::default())
    }

    /// Clean up logs in a directory
    pub fn cleanup(&self, log_dir: impl AsRef<Path>) -> Result<CleanupResult> {
        let log_dir = log_dir.as_ref();

        if !log_dir.exists() {
            return Ok(CleanupResult::empty());
        }

        log::info!("Starting log cleanup in {}", log_dir.display());

        // Collect file information
        let mut files = self.collect_files(log_dir)?;

        // Sort by modification time (oldest first)
        files.sort_by_key(|f| f.modified);

        let mut result = CleanupResult::empty();
        let now = Utc::now();
        let max_age = Duration::days(self.config.max_age_days as i64);
        let cutoff_time = now - max_age;

        // First pass: remove files older than max age
        for file in &mut files {
            if file.protected {
                continue;
            }

            if file.modified < cutoff_time {
                self.remove_file(&file.path, file.size, &mut result)?;
                file.size = 0; // Mark as removed
            }
        }

        // Calculate current total size
        let mut total_size: u64 = files.iter().filter(|f| f.size > 0).map(|f| f.size).sum();

        // Second pass: remove oldest files if total size exceeds limit
        let max_size_bytes = self.config.max_total_size_mb * 1024 * 1024;
        if total_size > max_size_bytes {
            for file in &mut files {
                if file.protected || file.size == 0 {
                    continue;
                }

                if total_size > max_size_bytes {
                    total_size -= file.size;
                    self.remove_file(&file.path, file.size, &mut result)?;
                    file.size = 0;
                } else {
                    break;
                }
            }
        }

        // Third pass: remove oldest files if count exceeds limit
        let active_files: Vec<_> = files.iter().filter(|f| f.size > 0).collect();
        if active_files.len() > self.config.max_file_count as usize {
            let to_remove = active_files.len() - self.config.max_file_count as usize;

            for file in files.iter_mut().take(to_remove) {
                if file.protected || file.size == 0 {
                    continue;
                }

                self.remove_file(&file.path, file.size, &mut result)?;
                file.size = 0;
            }
        }

        // Count files kept
        result.files_kept = files.iter().filter(|f| f.size > 0).count() as u32;

        log::info!(
            "Cleanup complete: {} files removed, {} MB freed, {} files kept",
            result.files_removed,
            result.bytes_freed / 1024 / 1024,
            result.files_kept
        );

        Ok(result)
    }

    /// Collect file information from directory
    fn collect_files(&self, dir: &Path) -> Result<Vec<FileInfo>> {
        let mut files = Vec::new();

        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();

            if !path.is_file() {
                continue;
            }

            let metadata = entry.metadata()?;
            let size = metadata.len();

            // Get modification time
            let modified = metadata
                .modified()
                .ok()
                .and_then(|t| DateTime::from_timestamp(
                    t.duration_since(std::time::UNIX_EPOCH).ok()?.as_secs() as i64,
                    0,
                ))
                .unwrap_or_else(Utc::now);

            // Check if protected
            let protected = self.is_protected(&path)?;

            files.push(FileInfo {
                path,
                size,
                modified,
                protected,
            });
        }

        Ok(files)
    }

    /// Check if a file is protected
    fn is_protected(&self, path: &Path) -> Result<bool> {
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("");

        for pattern in &self.config.protected_patterns {
            if glob_match(pattern, file_name) {
                return Ok(true);
            }
        }

        Ok(false)
    }

    /// Remove a file and update result
    fn remove_file(&self, path: &Path, size: u64, result: &mut CleanupResult) -> Result<()> {
        log::debug!("Removing log file: {} ({} bytes)", path.display(), size);

        fs::remove_file(path)
            .with_context(|| format!("Failed to remove file {}", path.display()))?;

        result.files_removed += 1;
        result.bytes_freed += size;

        Ok(())
    }

    /// Get current log directory statistics
    pub fn get_stats(&self, log_dir: impl AsRef<Path>) -> Result<LogStats> {
        let log_dir = log_dir.as_ref();

        if !log_dir.exists() {
            return Ok(LogStats::default());
        }

        let files = self.collect_files(log_dir)?;

        let total_files = files.len();
        let total_size = files.iter().map(|f| f.size).sum();
        let protected_files = files.iter().filter(|f| f.protected).count();

        let oldest_file = files
            .iter()
            .min_by_key(|f| f.modified)
            .map(|f| f.modified);

        let newest_file = files
            .iter()
            .max_by_key(|f| f.modified)
            .map(|f| f.modified);

        Ok(LogStats {
            total_files,
            total_size_bytes: total_size,
            protected_files,
            oldest_file,
            newest_file,
        })
    }

    /// Check if cleanup is needed
    pub fn needs_cleanup(&self, log_dir: impl AsRef<Path>) -> Result<bool> {
        let stats = self.get_stats(log_dir)?;

        // Check file count
        if stats.total_files > self.config.max_file_count as usize {
            return Ok(true);
        }

        // Check total size
        let max_size_bytes = self.config.max_total_size_mb * 1024 * 1024;
        if stats.total_size_bytes > max_size_bytes {
            return Ok(true);
        }

        // Check age
        if let Some(oldest) = stats.oldest_file {
            let now = Utc::now();
            let max_age = Duration::days(self.config.max_age_days as i64);
            if oldest < now - max_age {
                return Ok(true);
            }
        }

        Ok(false)
    }
}

/// Statistics about log files
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct LogStats {
    /// Total number of log files
    pub total_files: usize,
    /// Total size in bytes
    pub total_size_bytes: u64,
    /// Number of protected files
    pub protected_files: usize,
    /// Oldest file timestamp
    #[serde(skip_serializing_if = "Option::is_none")]
    pub oldest_file: Option<DateTime<Utc>>,
    /// Newest file timestamp
    #[serde(skip_serializing_if = "Option::is_none")]
    pub newest_file: Option<DateTime<Utc>>,
}

/// Simple glob pattern matching (supports * and ?)
fn glob_match(pattern: &str, text: &str) -> bool {
    let mut pattern_chars = pattern.chars().peekable();
    let mut text_chars = text.chars().peekable();

    while let Some(p) = pattern_chars.next() {
        match p {
            '*' => {
                // Match zero or more characters
                if pattern_chars.peek().is_none() {
                    return true; // * at end matches rest
                }

                // Try to match rest of pattern with remaining text
                while text_chars.peek().is_some() {
                    if glob_match(
                        &pattern_chars.clone().collect::<String>(),
                        &text_chars.clone().collect::<String>(),
                    ) {
                        return true;
                    }
                    text_chars.next();
                }

                return false;
            }
            '?' => {
                // Match exactly one character
                if text_chars.next().is_none() {
                    return false;
                }
            }
            c => {
                // Match exact character
                if text_chars.next() != Some(c) {
                    return false;
                }
            }
        }
    }

    text_chars.peek().is_none()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Write;
    use tempfile::TempDir;

    fn create_test_file(dir: &Path, name: &str, size: usize, age_days: i64) -> PathBuf {
        let path = dir.join(name);
        let mut file = File::create(&path).unwrap();

        // Write data
        file.write_all(&vec![0u8; size]).unwrap();

        // Set modification time
        let modified_time = (Utc::now() - Duration::days(age_days))
            .timestamp() as u64;
        
        // Note: Setting file times requires additional platform-specific code
        // For testing, we'll just create the files

        path
    }

    #[test]
    fn test_glob_match() {
        assert!(glob_match("*.log", "test.log"));
        assert!(glob_match("test-*.log", "test-123.log"));
        assert!(glob_match("?.txt", "a.txt"));
        assert!(!glob_match("?.txt", "ab.txt"));
        assert!(glob_match("*", "anything"));
        assert!(!glob_match("test.log", "test.txt"));
    }

    #[test]
    fn test_protected_patterns() {
        let config = RetentionConfig {
            max_age_days: 30,
            max_total_size_mb: 100,
            max_file_count: 10,
            protected_patterns: vec!["*.protected".to_string()],
        };

        let manager = LogRetentionManager::new(config);

        assert!(manager
            .is_protected(Path::new("important.protected"))
            .unwrap());
        assert!(!manager.is_protected(Path::new("regular.log")).unwrap());
    }

    #[test]
    fn test_get_stats() {
        let temp_dir = TempDir::new().unwrap();
        let manager = LogRetentionManager::with_defaults();

        // Create some test files
        create_test_file(temp_dir.path(), "log1.txt", 1024, 5);
        create_test_file(temp_dir.path(), "log2.txt", 2048, 10);

        let stats = manager.get_stats(temp_dir.path()).unwrap();

        assert_eq!(stats.total_files, 2);
        assert_eq!(stats.total_size_bytes, 3072);
    }

    #[test]
    fn test_cleanup_empty_dir() {
        let temp_dir = TempDir::new().unwrap();
        let manager = LogRetentionManager::with_defaults();

        let result = manager.cleanup(temp_dir.path()).unwrap();

        assert_eq!(result.files_removed, 0);
        assert_eq!(result.files_kept, 0);
    }

    #[test]
    fn test_needs_cleanup() {
        let temp_dir = TempDir::new().unwrap();
        
        let config = RetentionConfig {
            max_age_days: 30,
            max_total_size_mb: 1, // 1 MB
            max_file_count: 2,
            protected_patterns: Vec::new(),
        };
        
        let manager = LogRetentionManager::new(config);

        // Initially should not need cleanup
        assert!(!manager.needs_cleanup(temp_dir.path()).unwrap());

        // Create files that exceed count limit
        create_test_file(temp_dir.path(), "log1.txt", 100, 5);
        create_test_file(temp_dir.path(), "log2.txt", 100, 5);
        create_test_file(temp_dir.path(), "log3.txt", 100, 5);

        assert!(manager.needs_cleanup(temp_dir.path()).unwrap());
    }
}
