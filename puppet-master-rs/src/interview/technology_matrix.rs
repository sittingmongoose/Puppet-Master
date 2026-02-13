//! Technology matrix generator for extracting and documenting pinned versions.
//!
//! Generates a technology-matrix.md file based on technology decisions and
//! answers from the Architecture & Technology phase.

use anyhow::{Context, Result};
use regex::Regex;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use super::document_writer::CompletedPhase;
use super::state::{Decision, InterviewQA};

/// A single technology entry with its version information.
#[derive(Debug, Clone)]
pub struct TechnologyEntry {
    /// Technology name (e.g., "Rust", "React", "Node.js").
    pub name: String,
    /// Pinned version (e.g., "1.75.0", "18.2.0").
    pub version: String,
    /// Additional context or notes.
    pub notes: String,
}

/// Category grouping for technologies.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum TechCategory {
    Language,
    Framework,
    Database,
    Infrastructure,
    Tools,
    Other,
}

impl TechCategory {
    fn as_str(&self) -> &'static str {
        match self {
            Self::Language => "Languages",
            Self::Framework => "Frameworks & Libraries",
            Self::Database => "Databases & Storage",
            Self::Infrastructure => "Infrastructure & Deployment",
            Self::Tools => "Build & Development Tools",
            Self::Other => "Other",
        }
    }
}

/// Extracts technology entries from decisions and Q&A history.
pub struct TechnologyExtractor {
    /// Known technology patterns for categorization.
    patterns: Vec<TechPattern>,
}

struct TechPattern {
    keywords: Vec<&'static str>,
    category: TechCategory,
}

impl TechnologyExtractor {
    /// Creates a new extractor with default patterns.
    pub fn new() -> Self {
        Self {
            patterns: default_tech_patterns(),
        }
    }

    /// Extracts all technology entries from completed phases.
    ///
    /// Focuses on the Architecture & Technology phase but also scans other
    /// phases for version mentions.
    pub fn extract(&self, phases: &[CompletedPhase]) -> Vec<(TechCategory, Vec<TechnologyEntry>)> {
        let mut entries_by_category: HashMap<TechCategory, Vec<TechnologyEntry>> = HashMap::new();

        for phase in phases {
            // Prioritize architecture phase
            let is_arch = phase.definition.id == "architecture_technology";

            // Extract from decisions
            for decision in &phase.decisions {
                if let Some((cat, entries)) = self.extract_from_text(&decision.summary) {
                    entries_by_category.entry(cat).or_default().extend(entries);
                }
            }

            // Extract from Q&A (especially for architecture phase)
            if is_arch {
                for qa in &phase.qa_history {
                    if let Some((cat, entries)) = self.extract_from_text(&qa.answer) {
                        entries_by_category.entry(cat).or_default().extend(entries);
                    }
                }
            }
        }

        // Deduplicate and sort
        for entries in entries_by_category.values_mut() {
            entries.sort_by(|a, b| a.name.cmp(&b.name));
            entries.dedup_by(|a, b| a.name == b.name && a.version == b.version);
        }

        // Convert to sorted vec
        let mut result: Vec<_> = entries_by_category.into_iter().collect();
        result.sort_by_key(|(cat, _)| match cat {
            TechCategory::Language => 0,
            TechCategory::Framework => 1,
            TechCategory::Database => 2,
            TechCategory::Infrastructure => 3,
            TechCategory::Tools => 4,
            TechCategory::Other => 5,
        });

        result
    }

    /// Extracts technology entries from a single text string.
    fn extract_from_text(&self, text: &str) -> Option<(TechCategory, Vec<TechnologyEntry>)> {
        let version_regex = Regex::new(r"\b(\d+\.\d+(?:\.\d+)?(?:-\w+)?)\b").ok()?;
        let lower_text = text.to_lowercase();

        // Look for version patterns: "Technology X.Y.Z" or "Technology vX.Y.Z"
        for pattern in &self.patterns {
            let mut match_pos: Option<usize> = None;
            for keyword in &pattern.keywords {
                let lower_keyword = keyword.to_lowercase();
                if let Some(pos) = lower_text.find(&lower_keyword) {
                    match_pos = Some(pos);
                    break;
                }
            }

            if let Some(pos) = match_pos {
                // Extract surrounding context (50 chars after)
                let context_start = pos;
                let context_end = (pos + 50).min(text.len());
                let context = &text[context_start..context_end];

                // Look for version in context
                if let Some(captures) = version_regex.find(context) {
                    let version = captures.as_str().to_string();
                    return Some((
                        pattern.category.clone(),
                        vec![TechnologyEntry {
                            name: pattern
                                .keywords
                                .first()
                                .copied()
                                .unwrap_or("Unknown")
                                .to_string(),
                            version,
                            notes: String::new(),
                        }],
                    ));
                }
            }
        }

        None
    }
}

impl Default for TechnologyExtractor {
    fn default() -> Self {
        Self::new()
    }
}

/// Writes the technology matrix document to disk.
pub fn write_technology_matrix(phases: &[CompletedPhase], output_dir: &Path) -> Result<PathBuf> {
    let extractor = TechnologyExtractor::new();
    let tech_by_category = extractor.extract(phases);

    let mut content = String::new();
    content.push_str("# Technology Matrix\n\n");
    content.push_str(&format!(
        "Generated: {}\n\n",
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC")
    ));

    content.push_str(
        "This document lists all pinned technology versions identified during the interview.\n\n",
    );
    content.push_str("---\n\n");

    if tech_by_category.is_empty() {
        content.push_str(
            "*No specific technology versions were explicitly pinned during the interview.*\n\n",
        );
        content.push_str(
            "**Note:** Ensure all production dependencies have specific versions pinned.\n",
        );
    } else {
        for (category, entries) in &tech_by_category {
            content.push_str(&format!("## {}\n\n", category.as_str()));
            content.push_str("| Technology | Version | Notes |\n");
            content.push_str("|------------|---------|-------|\n");

            for entry in entries {
                let notes = if entry.notes.is_empty() {
                    "-"
                } else {
                    &entry.notes
                };
                content.push_str(&format!(
                    "| {} | {} | {} |\n",
                    entry.name, entry.version, notes
                ));
            }
            content.push_str("\n");
        }
    }

    content.push_str("---\n\n");
    content.push_str("## Version Pinning Guidelines\n\n");
    content.push_str("- **DO** pin exact versions for all production dependencies\n");
    content.push_str("- **AVOID** using `latest`, `current`, or `stable` tags\n");
    content.push_str("- **VERIFY** all versions are compatible with each other\n");
    content.push_str("- **DOCUMENT** reasons for specific version choices\n");
    content.push_str("- **TEST** version upgrades in isolated environments\n");

    fs::create_dir_all(output_dir).context("Failed to create output directory")?;
    let path = output_dir.join("technology-matrix.md");
    fs::write(&path, content).context("Failed to write technology-matrix.md")?;

    Ok(path)
}

/// Returns default technology patterns for common languages and frameworks.
fn default_tech_patterns() -> Vec<TechPattern> {
    vec![
        TechPattern {
            keywords: vec!["Rust", "rust"],
            category: TechCategory::Language,
        },
        TechPattern {
            keywords: vec!["Node.js", "Node", "node"],
            category: TechCategory::Language,
        },
        TechPattern {
            keywords: vec!["Python", "python"],
            category: TechCategory::Language,
        },
        TechPattern {
            keywords: vec!["TypeScript", "typescript"],
            category: TechCategory::Language,
        },
        TechPattern {
            keywords: vec!["JavaScript", "javascript"],
            category: TechCategory::Language,
        },
        TechPattern {
            keywords: vec!["Go", "golang"],
            category: TechCategory::Language,
        },
        TechPattern {
            keywords: vec!["React", "react"],
            category: TechCategory::Framework,
        },
        TechPattern {
            keywords: vec!["Vue", "vue"],
            category: TechCategory::Framework,
        },
        TechPattern {
            keywords: vec!["Angular", "angular"],
            category: TechCategory::Framework,
        },
        TechPattern {
            keywords: vec!["Iced", "iced"],
            category: TechCategory::Framework,
        },
        TechPattern {
            keywords: vec!["Tauri", "tauri"],
            category: TechCategory::Framework,
        },
        TechPattern {
            keywords: vec!["PostgreSQL", "postgres"],
            category: TechCategory::Database,
        },
        TechPattern {
            keywords: vec!["MySQL", "mysql"],
            category: TechCategory::Database,
        },
        TechPattern {
            keywords: vec!["MongoDB", "mongodb"],
            category: TechCategory::Database,
        },
        TechPattern {
            keywords: vec!["Redis", "redis"],
            category: TechCategory::Database,
        },
        TechPattern {
            keywords: vec!["SQLite", "sqlite"],
            category: TechCategory::Database,
        },
        TechPattern {
            keywords: vec!["Docker", "docker"],
            category: TechCategory::Infrastructure,
        },
        TechPattern {
            keywords: vec!["Kubernetes", "k8s"],
            category: TechCategory::Infrastructure,
        },
        TechPattern {
            keywords: vec!["AWS", "aws"],
            category: TechCategory::Infrastructure,
        },
        TechPattern {
            keywords: vec!["Cargo", "cargo"],
            category: TechCategory::Tools,
        },
        TechPattern {
            keywords: vec!["npm", "NPM"],
            category: TechCategory::Tools,
        },
        TechPattern {
            keywords: vec!["webpack", "Webpack"],
            category: TechCategory::Tools,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interview::phase_manager::InterviewPhaseDefinition;

    fn make_test_phase(id: &str, decisions: Vec<Decision>) -> CompletedPhase {
        CompletedPhase {
            definition: InterviewPhaseDefinition {
                id: id.to_string(),
                domain: "Test".to_string(),
                name: "Test".to_string(),
                description: "Test".to_string(),
                min_questions: 3,
                max_questions: 8,
            },
            decisions,
            qa_history: vec![],
            document_path: PathBuf::new(),
        }
    }

    #[test]
    fn test_extract_rust_version() {
        let extractor = TechnologyExtractor::new();
        let result = extractor.extract_from_text("Using Rust 1.75.0 for the project");
        assert!(result.is_some());
        let (cat, entries) = result.unwrap();
        assert_eq!(cat, TechCategory::Language);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "Rust");
        assert_eq!(entries[0].version, "1.75.0");
    }

    #[test]
    fn test_extract_react_version() {
        let extractor = TechnologyExtractor::new();
        let result = extractor.extract_from_text("Frontend uses React 18.2.0");
        assert!(result.is_some());
        let (cat, entries) = result.unwrap();
        assert_eq!(cat, TechCategory::Framework);
        assert_eq!(entries[0].version, "18.2.0");
    }

    #[test]
    fn test_no_version_found() {
        let extractor = TechnologyExtractor::new();
        let result = extractor.extract_from_text("Using Rust without version");
        assert!(result.is_none());
    }

    #[test]
    fn test_extract_from_phases() {
        let extractor = TechnologyExtractor::new();
        let phases = vec![make_test_phase(
            "architecture_technology",
            vec![Decision {
                phase: "architecture_technology".to_string(),
                summary: "Using Rust 1.75.0 and PostgreSQL 15.2".to_string(),
                reasoning: String::new(),
                timestamp: "2026-01-01T00:00:00Z".to_string(),
            }],
        )];

        let result = extractor.extract(&phases);
        assert!(!result.is_empty());
        // Should find at least Rust
        let has_rust = result
            .iter()
            .any(|(_, entries)| entries.iter().any(|e| e.name == "Rust"));
        assert!(has_rust);
    }

    #[test]
    fn test_deduplication() {
        let extractor = TechnologyExtractor::new();
        let phases = vec![make_test_phase(
            "architecture_technology",
            vec![
                Decision {
                    phase: "architecture_technology".to_string(),
                    summary: "Using Rust 1.75.0".to_string(),
                    reasoning: String::new(),
                    timestamp: "2026-01-01T00:00:00Z".to_string(),
                },
                Decision {
                    phase: "architecture_technology".to_string(),
                    summary: "Rust 1.75.0 for backend".to_string(),
                    reasoning: String::new(),
                    timestamp: "2026-01-01T00:00:00Z".to_string(),
                },
            ],
        )];

        let result = extractor.extract(&phases);
        let rust_entries: Vec<_> = result
            .iter()
            .flat_map(|(_, entries)| entries.iter())
            .filter(|e| e.name == "Rust")
            .collect();

        // Should be deduplicated to 1
        assert_eq!(rust_entries.len(), 1);
    }
}
