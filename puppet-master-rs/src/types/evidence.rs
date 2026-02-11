//! Evidence types for verification and audit trails.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Type of evidence collected during verification.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EvidenceType {
    /// Test execution log output
    TestLog,
    /// Screenshot of UI or terminal
    Screenshot,
    /// Browser trace/network capture
    BrowserTrace,
    /// File system snapshot
    FileSnapshot,
    /// Performance or other metric
    Metric,
    /// Gate verification report
    GateReport,
    /// Command execution output
    CommandOutput,
    /// Custom evidence type
    Custom(String),
}

impl EvidenceType {
    /// Returns a human-readable name for this evidence type.
    pub fn name(&self) -> &str {
        match self {
            Self::TestLog => "Test Log",
            Self::Screenshot => "Screenshot",
            Self::BrowserTrace => "Browser Trace",
            Self::FileSnapshot => "File Snapshot",
            Self::Metric => "Metric",
            Self::GateReport => "Gate Report",
            Self::CommandOutput => "Command Output",
            Self::Custom(name) => name,
        }
    }
}

/// Stored evidence record linking to artifacts.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredEvidence {
    /// Unique identifier for this evidence.
    pub id: String,

    /// Type of evidence.
    pub evidence_type: EvidenceType,

    /// ID of the item (task, subtask, criterion) this evidence relates to.
    pub item_id: String,

    /// When this evidence was collected.
    pub timestamp: DateTime<Utc>,

    /// Path to the evidence file (relative to evidence directory).
    pub file_path: PathBuf,

    /// Additional metadata.
    #[serde(default)]
    pub metadata: HashMap<String, String>,

    /// Optional description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Size of evidence file in bytes.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_size: Option<u64>,
}

impl StoredEvidence {
    /// Creates a new evidence record.
    pub fn new(
        id: impl Into<String>,
        evidence_type: EvidenceType,
        item_id: impl Into<String>,
        file_path: PathBuf,
    ) -> Self {
        Self {
            id: id.into(),
            evidence_type,
            item_id: item_id.into(),
            timestamp: Utc::now(),
            file_path,
            metadata: HashMap::new(),
            description: None,
            file_size: None,
        }
    }

    /// Adds metadata and returns self for chaining.
    pub fn with_metadata(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.metadata.insert(key.into(), value.into());
        self
    }

    /// Sets description and returns self for chaining.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Sets file size and returns self for chaining.
    pub fn with_file_size(mut self, size: u64) -> Self {
        self.file_size = Some(size);
        self
    }
}

/// Individual verifier result within a gate report.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifierResult {
    /// Name of the verifier (e.g., "regex_check", "file_exists").
    pub verifier_name: String,

    /// Whether this verifier passed.
    pub passed: bool,

    /// Output or findings from the verifier.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<String>,

    /// Execution time in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,
}

impl VerifierResult {
    /// Creates a new verifier result.
    pub fn new(verifier_name: impl Into<String>, passed: bool) -> Self {
        Self {
            verifier_name: verifier_name.into(),
            passed,
            output: None,
            duration_ms: None,
        }
    }

    /// Sets output and returns self for chaining.
    pub fn with_output(mut self, output: impl Into<String>) -> Self {
        self.output = Some(output.into());
        self
    }

    /// Sets duration and returns self for chaining.
    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }
}

/// Evidence from a gate verification run.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GateReportEvidence {
    /// Gate identifier.
    pub gate_id: String,

    /// Tier ID this gate belongs to.
    pub tier_id: String,

    /// Overall gate pass/fail status.
    pub passed: bool,

    /// Individual verifier results.
    pub verifier_results: Vec<VerifierResult>,

    /// When the gate was executed.
    pub timestamp: DateTime<Utc>,

    /// Total execution time in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_duration_ms: Option<u64>,

    /// Additional context or notes.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

impl GateReportEvidence {
    /// Creates a new gate report evidence.
    pub fn new(
        gate_id: impl Into<String>,
        tier_id: impl Into<String>,
        passed: bool,
        verifier_results: Vec<VerifierResult>,
    ) -> Self {
        Self {
            gate_id: gate_id.into(),
            tier_id: tier_id.into(),
            passed,
            verifier_results,
            timestamp: Utc::now(),
            total_duration_ms: None,
            notes: None,
        }
    }

    /// Returns the number of passed verifiers.
    pub fn passed_count(&self) -> usize {
        self.verifier_results.iter().filter(|v| v.passed).count()
    }

    /// Returns the number of failed verifiers.
    pub fn failed_count(&self) -> usize {
        self.verifier_results.iter().filter(|v| !v.passed).count()
    }

    /// Returns the pass rate as a percentage.
    pub fn pass_rate(&self) -> f32 {
        if self.verifier_results.is_empty() {
            return 0.0;
        }
        (self.passed_count() as f32 / self.verifier_results.len() as f32) * 100.0
    }
}

/// Collection of evidence for a specific item or phase.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvidenceCollection {
    /// All stored evidence records.
    pub evidence: Vec<StoredEvidence>,

    /// When this collection was created.
    #[serde(default = "Utc::now")]
    pub created_at: DateTime<Utc>,
}

impl EvidenceCollection {
    /// Creates a new empty collection.
    pub fn new() -> Self {
        Self {
            evidence: Vec::new(),
            created_at: Utc::now(),
        }
    }

    /// Adds evidence to the collection.
    pub fn add(&mut self, evidence: StoredEvidence) {
        self.evidence.push(evidence);
    }

    /// Returns evidence for a specific item.
    pub fn for_item(&self, item_id: &str) -> Vec<&StoredEvidence> {
        self.evidence.iter().filter(|e| e.item_id == item_id).collect()
    }

    /// Returns evidence of a specific type.
    pub fn by_type(&self, evidence_type: &EvidenceType) -> Vec<&StoredEvidence> {
        self.evidence
            .iter()
            .filter(|e| &e.evidence_type == evidence_type)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evidence_type_name() {
        assert_eq!(EvidenceType::TestLog.name(), "Test Log");
        assert_eq!(EvidenceType::Screenshot.name(), "Screenshot");
        assert_eq!(EvidenceType::Custom("MyType".to_string()).name(), "MyType");
    }

    #[test]
    fn test_stored_evidence_builder() {
        let evidence = StoredEvidence::new(
            "EV-001",
            EvidenceType::TestLog,
            "TASK-001",
            PathBuf::from("logs/test.log"),
        )
        .with_metadata("test_suite", "integration")
        .with_description("Integration test results")
        .with_file_size(1024);

        assert_eq!(evidence.id, "EV-001");
        assert_eq!(evidence.item_id, "TASK-001");
        assert_eq!(evidence.metadata.get("test_suite").unwrap(), "integration");
        assert_eq!(evidence.file_size, Some(1024));
    }

    #[test]
    fn test_verifier_result() {
        let result = VerifierResult::new("regex_check", true)
            .with_output("Pattern matched successfully")
            .with_duration(50);

        assert_eq!(result.verifier_name, "regex_check");
        assert!(result.passed);
        assert_eq!(result.duration_ms, Some(50));
    }

    #[test]
    fn test_gate_report_evidence_stats() {
        let results = vec![
            VerifierResult::new("check1", true),
            VerifierResult::new("check2", true),
            VerifierResult::new("check3", false),
        ];

        let gate_report = GateReportEvidence::new("GATE-001", "TIER-001", false, results);

        assert_eq!(gate_report.passed_count(), 2);
        assert_eq!(gate_report.failed_count(), 1);
        assert!((gate_report.pass_rate() - 66.666).abs() < 0.01);
    }

    #[test]
    fn test_evidence_collection() {
        let mut collection = EvidenceCollection::new();

        collection.add(StoredEvidence::new(
            "EV-001",
            EvidenceType::TestLog,
            "TASK-001",
            PathBuf::from("test1.log"),
        ));
        collection.add(StoredEvidence::new(
            "EV-002",
            EvidenceType::Screenshot,
            "TASK-001",
            PathBuf::from("screen.png"),
        ));
        collection.add(StoredEvidence::new(
            "EV-003",
            EvidenceType::TestLog,
            "TASK-002",
            PathBuf::from("test2.log"),
        ));

        assert_eq!(collection.for_item("TASK-001").len(), 2);
        assert_eq!(collection.by_type(&EvidenceType::TestLog).len(), 2);
        assert_eq!(collection.by_type(&EvidenceType::Screenshot).len(), 1);
    }
}
