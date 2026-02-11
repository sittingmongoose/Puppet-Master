//! File exists verifier - checks if files or directories exist

use crate::types::{Criterion, Evidence, Verifier, VerifierResult};
use async_trait::async_trait;
use chrono::Utc;
use log::debug;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// Verifier that checks file existence
pub struct FileExistsVerifier;

impl FileExistsVerifier {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Verifier for FileExistsVerifier {
    fn verifier_type(&self) -> &str {
        "file_exists"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        // Use expected field as the file path to check
        let path_str = criterion.expected.as_deref().unwrap_or("");

        debug!("Checking file existence: {}", path_str);

        let path = Path::new(path_str);
        let exists = path.exists();

        let message = if exists {
            format!("File exists: {}", path_str)
        } else {
            format!("File not found: {}", path_str)
        };

        let evidence_content = if exists {
            if let Ok(metadata) = std::fs::metadata(path) {
                format!(
                    "Path: {}\nExists: yes\nIs File: {}\nIs Directory: {}\nSize: {} bytes",
                    path_str,
                    metadata.is_file(),
                    metadata.is_dir(),
                    metadata.len()
                )
            } else {
                format!("Path: {}\nExists: yes", path_str)
            }
        } else {
            format!("Path: {}\nExists: no", path_str)
        };

        let evidence = Evidence {
            evidence_type: "file_check".to_string(),
            path: PathBuf::from(path_str),
            timestamp: Utc::now(),
            description: Some(format!("File existence check: {}", path_str)),
            metadata: {
                let mut m = HashMap::new();
                m.insert("content".to_string(), evidence_content);
                m
            },
        };

        VerifierResult {
            passed: exists,
            message,
            evidence: Some(evidence),
            timestamp: Utc::now(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[tokio::test]
    async fn test_file_exists_verifier_success() {
        let mut temp_file = NamedTempFile::new().unwrap();
        write!(temp_file, "test content").unwrap();
        let path = temp_file.path().to_string_lossy().to_string();

        let verifier = FileExistsVerifier::new();
        let criterion = Criterion {
            id: "test-1".to_string(),
            description: "Check temp file".to_string(),
            met: false,
            verification_method: Some("file_exists".to_string()),
            expected: Some(path),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(result.passed);
    }

    #[tokio::test]
    async fn test_file_exists_verifier_failure() {
        let verifier = FileExistsVerifier::new();
        let criterion = Criterion {
            id: "test-2".to_string(),
            description: "Check nonexistent file".to_string(),
            met: false,
            verification_method: Some("file_exists".to_string()),
            expected: Some("/nonexistent/file.txt".to_string()),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(!result.passed);
    }
}
