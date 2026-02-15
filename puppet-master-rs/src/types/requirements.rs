//! Requirements types for managing project requirements.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// DRY:DATA:RequirementsSource
/// Source format of requirements documentation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RequirementsSource {
    /// Markdown format (.md)
    Markdown,
    /// PDF document
    Pdf,
    /// Microsoft Word document (.docx)
    Docx,
    /// Plain text file
    PlainText,
    /// URL to fetch requirements from
    Url,
}

impl RequirementsSource {
    // DRY:FN:extension
    /// Returns the typical file extension for this source type.
    pub fn extension(&self) -> Option<&'static str> {
        match self {
            Self::Markdown => Some("md"),
            Self::Pdf => Some("pdf"),
            Self::Docx => Some("docx"),
            Self::PlainText => Some("txt"),
            Self::Url => None,
        }
    }
}

// DRY:DATA:RequirementPriority
/// Priority level of a requirement.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RequirementPriority {
    /// Must be implemented
    Critical,
    /// Should be implemented
    High,
    /// Nice to have
    Medium,
    /// Optional
    Low,
}

impl Default for RequirementPriority {
    fn default() -> Self {
        Self::Medium
    }
}

// DRY:DATA:ParsedRequirement
/// A parsed requirement from the source documentation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedRequirement {
    /// Unique identifier for the requirement.
    pub id: String,

    /// Short title or summary.
    pub title: String,

    /// Detailed description.
    pub description: String,

    /// Priority level.
    #[serde(default)]
    pub priority: RequirementPriority,

    /// Location in the source document (e.g., "Section 2.3", "Page 5", "Line 42").
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_location: Option<String>,

    /// Tags or categories.
    #[serde(default)]
    pub tags: Vec<String>,

    /// When this requirement was parsed.
    #[serde(default = "Utc::now")]
    pub parsed_at: DateTime<Utc>,
}

impl ParsedRequirement {
    // DRY:FN:new
    /// Creates a new requirement with the given id, title, and description.
    pub fn new(
        id: impl Into<String>,
        title: impl Into<String>,
        description: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            description: description.into(),
            priority: RequirementPriority::default(),
            source_location: None,
            tags: Vec::new(),
            parsed_at: Utc::now(),
        }
    }

    // DRY:FN:with_priority
    /// Sets the priority and returns self for chaining.
    pub fn with_priority(mut self, priority: RequirementPriority) -> Self {
        self.priority = priority;
        self
    }

    // DRY:FN:with_source_location
    /// Sets the source location and returns self for chaining.
    pub fn with_source_location(mut self, location: impl Into<String>) -> Self {
        self.source_location = Some(location.into());
        self
    }

    // DRY:FN:with_tag
    /// Adds a tag and returns self for chaining.
    pub fn with_tag(mut self, tag: impl Into<String>) -> Self {
        self.tags.push(tag.into());
        self
    }
}

// DRY:DATA:RequirementsSection
/// A hierarchical section of requirements.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementsSection {
    /// Section title.
    pub title: String,

    /// Requirements directly in this section.
    #[serde(default)]
    pub requirements: Vec<ParsedRequirement>,

    /// Nested subsections.
    #[serde(default)]
    pub subsections: Vec<RequirementsSection>,
}

impl RequirementsSection {
    // DRY:FN:new
    /// Creates a new empty section with the given title.
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            requirements: Vec::new(),
            subsections: Vec::new(),
        }
    }

    // DRY:FN:total_requirements
    /// Returns the total count of requirements in this section and all subsections.
    pub fn total_requirements(&self) -> usize {
        self.requirements.len()
            + self
                .subsections
                .iter()
                .map(|s| s.total_requirements())
                .sum::<usize>()
    }

    // DRY:FN:all_requirements
    /// Flattens all requirements from this section and subsections.
    pub fn all_requirements(&self) -> Vec<&ParsedRequirement> {
        let mut all = Vec::new();
        all.extend(self.requirements.iter());
        for subsection in &self.subsections {
            all.extend(subsection.all_requirements());
        }
        all
    }
}

// DRY:DATA:RequirementsStats
/// Statistics about requirements.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementsStats {
    /// Total number of requirements.
    pub total: usize,

    /// Count by priority level.
    pub by_priority: HashMap<String, usize>,

    /// Coverage percentage (requirements with PRD items).
    #[serde(default)]
    pub coverage_percent: f32,

    /// Number of requirements with tests.
    #[serde(default)]
    pub tested_count: usize,
}

// DRY:DATA:RequirementsInventory
/// Complete inventory of requirements from all sources.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementsInventory {
    /// All parsed requirements.
    pub items: Vec<ParsedRequirement>,

    /// Statistics.
    pub stats: RequirementsStats,

    /// When this inventory was created.
    #[serde(default = "Utc::now")]
    pub created_at: DateTime<Utc>,
}

impl RequirementsInventory {
    // DRY:FN:new
    /// Creates a new inventory from requirements.
    pub fn new(items: Vec<ParsedRequirement>) -> Self {
        let stats = Self::calculate_stats(&items);
        Self {
            items,
            stats,
            created_at: Utc::now(),
        }
    }

    /// Calculates statistics for the given requirements.
    fn calculate_stats(items: &[ParsedRequirement]) -> RequirementsStats {
        let mut by_priority: HashMap<String, usize> = HashMap::new();

        for item in items {
            let key = format!("{:?}", item.priority);
            *by_priority.entry(key).or_insert(0) += 1;
        }

        RequirementsStats {
            total: items.len(),
            by_priority,
            coverage_percent: 0.0,
            tested_count: 0,
        }
    }

    // DRY:FN:by_priority
    /// Returns requirements with the given priority.
    pub fn by_priority(&self, priority: RequirementPriority) -> Vec<&ParsedRequirement> {
        self.items
            .iter()
            .filter(|r| r.priority == priority)
            .collect()
    }

    // DRY:FN:find_by_id
    /// Finds a requirement by ID.
    pub fn find_by_id(&self, id: &str) -> Option<&ParsedRequirement> {
        self.items.iter().find(|r| r.id == id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_requirements_source_extension() {
        assert_eq!(RequirementsSource::Markdown.extension(), Some("md"));
        assert_eq!(RequirementsSource::Pdf.extension(), Some("pdf"));
        assert_eq!(RequirementsSource::Docx.extension(), Some("docx"));
        assert_eq!(RequirementsSource::PlainText.extension(), Some("txt"));
        assert_eq!(RequirementsSource::Url.extension(), None);
    }

    #[test]
    fn test_parsed_requirement_builder() {
        let req = ParsedRequirement::new("REQ-001", "Test Requirement", "Test description")
            .with_priority(RequirementPriority::High)
            .with_source_location("Section 2.1")
            .with_tag("backend")
            .with_tag("api");

        assert_eq!(req.id, "REQ-001");
        assert_eq!(req.title, "Test Requirement");
        assert_eq!(req.priority, RequirementPriority::High);
        assert_eq!(req.source_location, Some("Section 2.1".to_string()));
        assert_eq!(req.tags, vec!["backend", "api"]);
    }

    #[test]
    fn test_requirements_section_total() {
        let mut section = RequirementsSection::new("Main Section");
        section
            .requirements
            .push(ParsedRequirement::new("REQ-001", "Req 1", "Desc 1"));
        section
            .requirements
            .push(ParsedRequirement::new("REQ-002", "Req 2", "Desc 2"));

        let mut subsection = RequirementsSection::new("Subsection");
        subsection
            .requirements
            .push(ParsedRequirement::new("REQ-003", "Req 3", "Desc 3"));

        section.subsections.push(subsection);

        assert_eq!(section.total_requirements(), 3);
    }

    #[test]
    fn test_requirements_inventory() {
        let items = vec![
            ParsedRequirement::new("REQ-001", "Req 1", "Desc 1")
                .with_priority(RequirementPriority::High),
            ParsedRequirement::new("REQ-002", "Req 2", "Desc 2")
                .with_priority(RequirementPriority::High),
            ParsedRequirement::new("REQ-003", "Req 3", "Desc 3")
                .with_priority(RequirementPriority::Medium),
        ];

        let inventory = RequirementsInventory::new(items);

        assert_eq!(inventory.stats.total, 3);
        assert_eq!(inventory.by_priority(RequirementPriority::High).len(), 2);
        assert_eq!(inventory.find_by_id("REQ-002").unwrap().title, "Req 2");
        assert!(inventory.find_by_id("REQ-999").is_none());
    }
}
