//! Evidence Store
//!
//! Manages storage and retrieval of evidence files:
//! - Hierarchical directory structure
//! - Multiple evidence types (test logs, screenshots, etc.)
//! - Metadata tracking

use crate::types::{Evidence, EvidenceType};
use anyhow::{Context, Result};
use chrono::Utc;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

/// Thread-safe evidence store
#[derive(Clone)]
pub struct EvidenceStore {
    inner: Arc<Mutex<EvidenceStoreInner>>,
}

struct EvidenceStoreInner {
    base_path: PathBuf,
}

impl EvidenceStore {
    /// Create a new evidence store
    pub fn new(base_path: impl AsRef<Path>) -> Result<Self> {
        let base_path = base_path.as_ref().to_path_buf();

        // Create base directory
        fs::create_dir_all(&base_path).with_context(|| {
            format!(
                "Failed to create evidence directory {}",
                base_path.display()
            )
        })?;

        // Create subdirectories for each evidence type
        for evidence_type in &[
            EvidenceType::Text,
            EvidenceType::File,
            EvidenceType::CommandOutput,
            EvidenceType::Image,
            EvidenceType::TestResult,
            EvidenceType::GitCommit,
        ] {
            let subdir = base_path.join(evidence_type.to_string());
            fs::create_dir_all(&subdir).with_context(|| {
                format!(
                    "Failed to create evidence subdirectory {}",
                    subdir.display()
                )
            })?;
        }

        log::info!("Evidence store initialized at {}", base_path.display());

        Ok(Self {
            inner: Arc::new(Mutex::new(EvidenceStoreInner { base_path })),
        })
    }

    /// Store evidence and return the Evidence record
    pub fn store_evidence(
        &self,
        tier_id: &str,
        session_id: &str,
        evidence_type: EvidenceType,
        data: &[u8],
        metadata: HashMap<String, String>,
    ) -> Result<Evidence> {
        let inner = self.inner.lock().unwrap();

        let timestamp = Utc::now();

        // Determine file extension based on evidence type
        let extension = match &evidence_type {
            EvidenceType::Text => "txt",
            EvidenceType::File => "dat",
            EvidenceType::CommandOutput => "log",
            EvidenceType::Image => "png",
            EvidenceType::TestResult => "json",
            EvidenceType::GitCommit => "txt",
        };

        let id = uuid::Uuid::new_v4().to_string();

        // Create filename: {tier_id}_{session_id}_{timestamp}_{id}.{ext}
        let filename = format!(
            "{}_{}_{}_{}.{}",
            tier_id,
            session_id,
            timestamp.format("%Y%m%d_%H%M%S"),
            id,
            extension
        );

        let subdir = inner.base_path.join(evidence_type.to_string());
        let file_path = subdir.join(&filename);

        // Ensure subdirectory exists
        fs::create_dir_all(&subdir).with_context(|| {
            format!(
                "Failed to create evidence subdirectory {}",
                subdir.display()
            )
        })?;

        // Write data
        fs::write(&file_path, data)
            .with_context(|| format!("Failed to write evidence to {}", file_path.display()))?;

        log::debug!(
            "Stored evidence {} for tier {} at {}",
            id,
            tier_id,
            file_path.display()
        );

        Ok(Evidence {
            evidence_type: evidence_type.to_string(),
            path: file_path,
            timestamp,
            description: Some(format!("tier={} session={}", tier_id, session_id)),
            metadata,
        })
    }

    /// Store text evidence
    pub fn store_text(
        &self,
        tier_id: &str,
        session_id: &str,
        evidence_type: EvidenceType,
        text: &str,
        metadata: HashMap<String, String>,
    ) -> Result<Evidence> {
        self.store_evidence(
            tier_id,
            session_id,
            evidence_type,
            text.as_bytes(),
            metadata,
        )
    }

    /// List all evidence for a tier
    pub fn list_for_tier(&self, tier_id: &str) -> Result<Vec<Evidence>> {
        let inner = self.inner.lock().unwrap();
        let mut evidence_list = Vec::new();

        // Scan all subdirectories
        for evidence_type in &[
            EvidenceType::Text,
            EvidenceType::File,
            EvidenceType::CommandOutput,
            EvidenceType::Image,
            EvidenceType::TestResult,
            EvidenceType::GitCommit,
        ] {
            let subdir = inner.base_path.join(evidence_type.to_string());

            if !subdir.exists() {
                continue;
            }

            let entries = fs::read_dir(&subdir).with_context(|| {
                format!("Failed to read evidence directory {}", subdir.display())
            })?;

            for entry in entries {
                let entry = entry?;
                let path = entry.path();

                if !path.is_file() {
                    continue;
                }

                // Check if filename starts with tier_id
                if let Some(filename) = path.file_name() {
                    if let Some(name) = filename.to_str() {
                        if name.starts_with(tier_id) {
                            if let Some(evidence) = self.parse_evidence_file(&path, evidence_type) {
                                evidence_list.push(evidence);
                            }
                        }
                    }
                }
            }
        }

        Ok(evidence_list)
    }

    /// List all evidence across all types
    pub fn list_all(&self) -> Result<Vec<Evidence>> {
        let mut all = Vec::new();
        for evidence_type in &[
            EvidenceType::Text,
            EvidenceType::File,
            EvidenceType::CommandOutput,
            EvidenceType::Image,
            EvidenceType::TestResult,
            EvidenceType::GitCommit,
        ] {
            if let Ok(items) = self.list_by_type(evidence_type.clone()) {
                all.extend(items);
            }
        }
        // Sort by timestamp descending (newest first)
        all.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        Ok(all)
    }

    /// List evidence by type
    pub fn list_by_type(&self, evidence_type: EvidenceType) -> Result<Vec<Evidence>> {
        let inner = self.inner.lock().unwrap();
        let mut evidence_list = Vec::new();

        let subdir = inner.base_path.join(evidence_type.to_string());

        if !subdir.exists() {
            return Ok(evidence_list);
        }

        let entries = fs::read_dir(&subdir)
            .with_context(|| format!("Failed to read evidence directory {}", subdir.display()))?;

        for entry in entries {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() {
                if let Some(evidence) = self.parse_evidence_file(&path, &evidence_type) {
                    evidence_list.push(evidence);
                }
            }
        }

        Ok(evidence_list)
    }

    /// Parse evidence file path to extract metadata
    fn parse_evidence_file(&self, path: &Path, evidence_type: &EvidenceType) -> Option<Evidence> {
        let filename = path.file_stem()?.to_str()?;
        let parts: Vec<&str> = filename.split('_').collect();

        if parts.len() < 4 {
            return None;
        }

        // Get file modification time as timestamp
        let file_meta = fs::metadata(path).ok()?;
        let modified = file_meta.modified().ok()?;
        let timestamp = chrono::DateTime::<chrono::Utc>::from(modified);

        Some(Evidence {
            evidence_type: evidence_type.to_string(),
            path: path.to_path_buf(),
            timestamp,
            description: None,
            metadata: HashMap::new(),
        })
    }

    /// Get evidence by ID (searches for filename containing the id)
    pub fn get_evidence(&self, id: &str) -> Result<Option<Evidence>> {
        let inner = self.inner.lock().unwrap();

        // Search all subdirectories
        for evidence_type in &[
            EvidenceType::Text,
            EvidenceType::File,
            EvidenceType::CommandOutput,
            EvidenceType::Image,
            EvidenceType::TestResult,
            EvidenceType::GitCommit,
        ] {
            let subdir = inner.base_path.join(evidence_type.to_string());

            if !subdir.exists() {
                continue;
            }

            let entries = fs::read_dir(&subdir)?;

            for entry in entries {
                let entry = entry?;
                let path = entry.path();

                if !path.is_file() {
                    continue;
                }

                if let Some(filename) = path.file_stem() {
                    if let Some(name) = filename.to_str() {
                        if name.ends_with(id) {
                            return Ok(self.parse_evidence_file(&path, evidence_type));
                        }
                    }
                }
            }
        }

        Ok(None)
    }

    /// Read evidence content
    pub fn read_evidence(&self, evidence: &Evidence) -> Result<Vec<u8>> {
        fs::read(&evidence.path)
            .with_context(|| format!("Failed to read evidence from {}", evidence.path.display()))
    }

    /// Read evidence as text
    pub fn read_evidence_text(&self, evidence: &Evidence) -> Result<String> {
        fs::read_to_string(&evidence.path)
            .with_context(|| format!("Failed to read evidence from {}", evidence.path.display()))
    }

    /// Delete evidence
    pub fn delete_evidence(&self, evidence: &Evidence) -> Result<()> {
        fs::remove_file(&evidence.path).with_context(|| {
            format!("Failed to delete evidence from {}", evidence.path.display())
        })?;

        log::debug!("Deleted evidence at {}", evidence.path.display());
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_store_and_list() {
        let temp_dir = TempDir::new().unwrap();
        let store = EvidenceStore::new(temp_dir.path()).unwrap();

        let evidence = store
            .store_text(
                "phase1",
                "session1",
                EvidenceType::CommandOutput,
                "test log content",
                HashMap::new(),
            )
            .unwrap();

        assert!(evidence.path.exists());

        let list = store.list_for_tier("phase1").unwrap();
        assert_eq!(list.len(), 1);
    }

    #[test]
    fn test_list_by_type() {
        let temp_dir = TempDir::new().unwrap();
        let store = EvidenceStore::new(temp_dir.path()).unwrap();

        store
            .store_text(
                "phase1",
                "session1",
                EvidenceType::CommandOutput,
                "log 1",
                HashMap::new(),
            )
            .unwrap();

        store
            .store_text(
                "phase2",
                "session1",
                EvidenceType::CommandOutput,
                "log 2",
                HashMap::new(),
            )
            .unwrap();

        let list = store.list_by_type(EvidenceType::CommandOutput).unwrap();
        assert_eq!(list.len(), 2);
    }
}
