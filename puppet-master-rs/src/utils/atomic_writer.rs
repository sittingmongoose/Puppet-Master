//! Atomic File Writer
//!
//! Provides atomic file write operations:
//! - Write to temporary file first
//! - Atomic rename to target
//! - Optional backup of existing file

use anyhow::{Context, Result};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

/// Atomic file writer utility
pub struct AtomicWriter;

impl AtomicWriter {
    /// Write data atomically to a file
    ///
    /// This writes to a temporary file in the same directory, then atomically
    /// renames it to the target path. This ensures the target file is never
    /// in a partially written state.
    pub fn write(path: impl AsRef<Path>, data: &[u8]) -> Result<()> {
        let path = path.as_ref();

        // Create parent directory if needed
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).with_context(|| {
                format!("Failed to create parent directory {}", parent.display())
            })?;
        }

        // Create temp file in same directory
        let temp_path = Self::temp_path(path);

        // Write to temp file
        let mut temp_file = fs::File::create(&temp_path)
            .with_context(|| format!("Failed to create temp file {}", temp_path.display()))?;

        temp_file
            .write_all(data)
            .with_context(|| format!("Failed to write to temp file {}", temp_path.display()))?;

        temp_file
            .sync_all()
            .context("Failed to sync temp file to disk")?;

        drop(temp_file);

        // Atomic rename
        fs::rename(&temp_path, path).with_context(|| {
            format!(
                "Failed to rename {} to {}",
                temp_path.display(),
                path.display()
            )
        })?;

        Ok(())
    }

    /// Write data atomically with a backup of the existing file
    pub fn write_with_backup(path: impl AsRef<Path>, data: &[u8]) -> Result<()> {
        let path = path.as_ref();

        // Create backup if file exists
        if path.exists() {
            let backup_path = Self::backup_path(path);
            fs::copy(path, &backup_path).with_context(|| {
                format!(
                    "Failed to create backup from {} to {}",
                    path.display(),
                    backup_path.display()
                )
            })?;
        }

        Self::write(path, data)
    }

    /// Generate temporary file path
    fn temp_path(path: &Path) -> PathBuf {
        let mut temp = path.as_os_str().to_owned();
        temp.push(".tmp");
        PathBuf::from(temp)
    }

    /// Generate backup file path
    fn backup_path(path: &Path) -> PathBuf {
        let mut backup = path.as_os_str().to_owned();
        backup.push(".bak");
        PathBuf::from(backup)
    }

    /// Write string data atomically
    pub fn write_string(path: impl AsRef<Path>, content: &str) -> Result<()> {
        Self::write(path, content.as_bytes())
    }

    /// Write JSON data atomically
    pub fn write_json<T: serde::Serialize>(path: impl AsRef<Path>, value: &T) -> Result<()> {
        let json = serde_json::to_string_pretty(value)
            .context("Failed to serialize value to JSON")?;
        Self::write_string(path, &json)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_atomic_write() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.txt");

        let data = b"Hello, World!";
        AtomicWriter::write(&file_path, data).expect("Failed to write atomically");

        let read_data = fs::read(&file_path).expect("Failed to read data");
        assert_eq!(read_data, data);
    }

    #[test]
    fn test_atomic_write_string() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.txt");

        let content = "Hello, Rust!";
        AtomicWriter::write_string(&file_path, content).expect("Failed to write string");

        let read_content = fs::read_to_string(&file_path).expect("Failed to read string");
        assert_eq!(read_content, content);
    }

    #[test]
    fn test_write_with_backup() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.txt");

        // Write initial content
        fs::write(&file_path, b"Original").expect("Failed to write initial content");

        // Write with backup
        AtomicWriter::write_with_backup(&file_path, b"Updated").expect("Failed to write with backup");

        // Check new content
        let content = fs::read_to_string(&file_path).expect("Failed to read updated content");
        assert_eq!(content, "Updated");

        // Check backup exists
        let backup_path = file_path.with_extension("txt.bak");
        assert!(backup_path.exists());
        let backup_content = fs::read_to_string(&backup_path).expect("Failed to read backup");
        assert_eq!(backup_content, "Original");
    }

    #[test]
    fn test_write_json() {
        use serde::{Deserialize, Serialize};

        #[derive(Serialize, Deserialize, PartialEq, Debug)]
        struct TestData {
            name: String,
            value: i32,
        }

        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.json");

        let data = TestData {
            name: "test".to_string(),
            value: 42,
        };

        AtomicWriter::write_json(&file_path, &data).expect("Failed to write JSON");

        let json = fs::read_to_string(&file_path).expect("Failed to read JSON file");
        let loaded: TestData = serde_json::from_str(&json).expect("Failed to parse JSON");
        assert_eq!(loaded, data);
    }

    #[test]
    fn test_atomic_replace() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.txt");

        // Initial write
        fs::write(&file_path, b"Initial").expect("Failed to write initial content");

        // Atomic replacement
        AtomicWriter::write(&file_path, b"Replaced").expect("Failed to replace content");

        let content = fs::read_to_string(&file_path).expect("Failed to read replaced content");
        assert_eq!(content, "Replaced");

        // Temp file should not exist
        let temp_path = file_path.with_extension("txt.tmp");
        assert!(!temp_path.exists());
    }
}
