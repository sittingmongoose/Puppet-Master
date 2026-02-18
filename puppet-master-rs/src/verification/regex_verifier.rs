//! Regex verifier - checks file content against regex patterns

use crate::types::{Criterion, Evidence, Verifier, VerifierResult};
use async_trait::async_trait;
use chrono::Utc;
use log::debug;
use regex::Regex;
use std::collections::HashMap;
use std::path::PathBuf;

// DRY:DATA:RegexVerifier
/// Verifier that checks file content against regex patterns
pub struct RegexVerifier;

impl RegexVerifier {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Verifier for RegexVerifier {
    fn verifier_type(&self) -> &str {
        "regex"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        // Use expected field as "file:pattern" format, or just pattern
        let expected = criterion.expected.as_deref().unwrap_or("");

        // DRY:PLATFORM:path_parsing - Try to parse "file:pattern" format
        // On Windows, paths may start with a drive letter like "C:\..."
        // Skip the first colon if it's a drive letter separator (single alpha char before colon)
        let (file, pattern) = {
            let search_from = if expected.len() >= 2 
                && expected.as_bytes()[1] == b':' 
                && expected.as_bytes()[0].is_ascii_alphabetic() {
                2 // skip past drive letter colon
            } else {
                0
            };
            if let Some(idx) = expected[search_from..].find(':') {
                let split = search_from + idx;
                (&expected[..split], &expected[split + 1..])
            } else {
                ("", expected)
            }
        };

        debug!("Checking regex pattern in file: {}", file);

        if file.is_empty() || pattern.is_empty() {
            return VerifierResult::failure(
                "Regex verifier requires expected in 'file:pattern' format",
            );
        }

        // Read file content
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(e) => {
                return VerifierResult::failure(format!("Failed to read file {}: {}", file, e));
            }
        };

        // Compile and check regex
        let re = match Regex::new(pattern) {
            Ok(r) => r,
            Err(e) => return VerifierResult::failure(format!("Invalid regex pattern: {}", e)),
        };

        let found = re.is_match(&content);
        let passed = found; // default: should_match = true

        let message = if passed {
            format!("Pattern found in file: {}", file)
        } else {
            format!("Pattern not found in file: {}", file)
        };

        // Find all matches for evidence
        let matches: Vec<_> = re
            .find_iter(&content)
            .map(|m| m.as_str().to_string())
            .collect();
        let match_summary = if matches.is_empty() {
            "No matches found".to_string()
        } else {
            format!("Found {} match(es):\n{}", matches.len(), matches.join("\n"))
        };

        let evidence_content = format!(
            "File: {}\nPattern: {}\nMatch: {}\n\n{}",
            file, pattern, found, match_summary
        );

        let evidence = Evidence {
            evidence_type: "regex_check".to_string(),
            path: PathBuf::from(file),
            timestamp: Utc::now(),
            description: Some(format!("Regex verification: {}", file)),
            metadata: {
                let mut m = HashMap::new();
                m.insert("content".to_string(), evidence_content);
                m
            },
        };

        VerifierResult {
            passed,
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
    async fn test_regex_verifier_match() {
        let mut temp_file = NamedTempFile::new().unwrap();
        write!(temp_file, "Hello World! This is a test.").unwrap();
        let path = temp_file.path().to_string_lossy().to_string();

        let verifier = RegexVerifier::new();
        let criterion = Criterion {
            id: "test-1".to_string(),
            description: "Check for 'Hello'".to_string(),
            met: false,
            verification_method: Some("regex".to_string()),
            expected: Some(format!("{}:Hello\\s+World", path)),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(result.passed);
    }

    #[tokio::test]
    async fn test_regex_verifier_no_match() {
        let mut temp_file = NamedTempFile::new().unwrap();
        write!(temp_file, "Hello World!").unwrap();
        let path = temp_file.path().to_string_lossy().to_string();

        let verifier = RegexVerifier::new();
        let criterion = Criterion {
            id: "test-2".to_string(),
            description: "Check for absence".to_string(),
            met: false,
            verification_method: Some("regex".to_string()),
            expected: Some(format!("{}:NOTFOUND", path)),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(!result.passed);
    }
}
