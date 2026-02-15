//! Requirements parser - extracts structure from requirements documents

use super::document_parser::{DocumentParser, ParsedDocument};
use crate::types::{ParsedRequirements, RequirementsSection};
use anyhow::{Context, Result};
use std::path::Path;

/// Internal section used during parsing (has hierarchy info)
#[derive(Debug, Clone)]
struct InternalSection {
    heading: String,
    level: u32,
    content: String,
    items: Vec<String>,
    subsections: Vec<InternalSection>,
}

// DRY:DATA:RequirementsParser
/// Parser for requirements files (markdown and plain text)
pub struct RequirementsParser;

impl RequirementsParser {
    // DRY:FN:parse_file
    /// Parse a requirements file
    pub async fn parse_file(path: &Path) -> Result<ParsedRequirements> {
        // Check if file exists before trying to read it
        if !path.exists() {
            anyhow::bail!("Requirements file does not exist: {}", path.display());
        }

        let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("");

        match extension {
            "md" | "markdown" => {
                let content = tokio::fs::read_to_string(path).await.with_context(|| {
                    format!("Failed to read requirements file: {}", path.display())
                })?;
                Self::parse_markdown(&content)
            }
            "txt" | "" => {
                let content = tokio::fs::read_to_string(path).await.with_context(|| {
                    format!("Failed to read requirements file: {}", path.display())
                })?;
                Self::parse_text(&content)
            }
            "docx" | "pdf" => {
                // Use DocumentParser for binary formats
                let parsed_doc = DocumentParser::parse_file(path)
                    .map_err(|e| anyhow::anyhow!("Failed to parse document: {}", e))?;

                Self::convert_parsed_document_to_requirements(parsed_doc)
            }
            _ => {
                let content = tokio::fs::read_to_string(path).await.with_context(|| {
                    format!("Failed to read requirements file: {}", path.display())
                })?;
                Self::parse_text(&content)
            }
        }
    }

    // DRY:FN:parse_markdown
    /// Parse markdown content
    pub fn parse_markdown(content: &str) -> Result<ParsedRequirements> {
        let mut current_section: Option<InternalSection> = None;
        let mut section_stack: Vec<InternalSection> = Vec::new();
        let mut project_name = String::new();

        for line in content.lines() {
            if let Some(heading_level) = Self::get_heading_level(line) {
                let heading_text = Self::strip_heading_markers(line);

                if let Some(section) = current_section.take() {
                    Self::add_section_to_stack(&mut section_stack, section);
                }

                current_section = Some(InternalSection {
                    heading: heading_text.clone(),
                    level: heading_level,
                    content: String::new(),
                    items: Vec::new(),
                    subsections: Vec::new(),
                });

                if heading_level == 1 && project_name.is_empty() {
                    project_name = heading_text;
                }
            } else if let Some(ref mut section) = current_section {
                if line.trim_start().starts_with("- ")
                    || line.trim_start().starts_with("* ")
                    || line.trim_start().starts_with("+ ")
                {
                    let item = line
                        .trim_start()
                        .trim_start_matches("- ")
                        .trim_start_matches("* ")
                        .trim_start_matches("+ ");
                    section.items.push(item.to_string());
                } else if !line.trim().is_empty() {
                    if !section.content.is_empty() {
                        section.content.push('\n');
                    }
                    section.content.push_str(line);
                }
            }
        }

        if let Some(section) = current_section {
            Self::add_section_to_stack(&mut section_stack, section);
        }

        let internal_sections = Self::build_hierarchy(section_stack);

        // Convert internal sections to RequirementsSection
        let sections = internal_sections
            .iter()
            .map(|s| Self::convert_section(s))
            .collect();

        if project_name.is_empty() {
            project_name = "Untitled Project".to_string();
        }

        Ok(ParsedRequirements::new(project_name).with_sections(sections))
    }

    /// Convert an internal section to a RequirementsSection
    fn convert_section(section: &InternalSection) -> RequirementsSection {
        let mut content = section.content.clone();
        for item in &section.items {
            if !content.is_empty() {
                content.push('\n');
            }
            content.push_str(&format!("- {}", item));
        }
        for sub in &section.subsections {
            if !content.is_empty() {
                content.push('\n');
            }
            content.push_str(&format!("### {}\n{}", sub.heading, sub.content));
        }
        RequirementsSection::new(section.heading.clone(), content)
    }

    // DRY:FN:parse_text
    /// Parse plain text content
    pub fn parse_text(content: &str) -> Result<ParsedRequirements> {
        // Sniff if content is actually markdown
        if Self::is_markdown(content) {
            return Self::parse_markdown(content);
        }

        let mut items = Vec::new();
        let mut text_content = String::new();

        for line in content.lines() {
            let trimmed = line.trim();

            if trimmed.is_empty() {
                continue;
            }

            if trimmed.starts_with(|c: char| c.is_numeric())
                || trimmed.starts_with("- ")
                || trimmed.starts_with("* ")
            {
                let item = trimmed
                    .trim_start_matches(|c: char| c.is_numeric() || c == '.' || c == ' ')
                    .trim_start_matches("- ")
                    .trim_start_matches("* ");
                items.push(item.to_string());
            } else {
                if !text_content.is_empty() {
                    text_content.push('\n');
                }
                text_content.push_str(line);
            }
        }

        for item in &items {
            if !text_content.is_empty() {
                text_content.push('\n');
            }
            text_content.push_str(&format!("- {}", item));
        }

        let section = RequirementsSection::new("Requirements", text_content);
        Ok(ParsedRequirements::new("Untitled Project").with_sections(vec![section]))
    }

    /// Detect if text content is markdown
    fn is_markdown(content: &str) -> bool {
        let mut heading_count = 0;
        let mut markdown_indicator_count = 0;

        for line in content.lines().take(50) {
            let trimmed = line.trim();

            // Check for markdown headings
            if trimmed.starts_with('#')
                && trimmed
                    .chars()
                    .nth(1)
                    .map_or(false, |c| c.is_whitespace() || c == '#')
            {
                heading_count += 1;
            }

            // Check for other markdown indicators
            if trimmed.starts_with("```")
                || trimmed.starts_with("---")
                || trimmed.contains("[") && trimmed.contains("](")
                || trimmed.starts_with(">")
                || (trimmed.starts_with("*") && trimmed.ends_with("*") && trimmed.len() > 2)
                || (trimmed.starts_with("_") && trimmed.ends_with("_") && trimmed.len() > 2)
            {
                markdown_indicator_count += 1;
            }
        }

        // If we find 1+ heading or 2+ markdown indicators, treat as markdown
        heading_count >= 1 || markdown_indicator_count >= 2
    }

    /// Convert a ParsedDocument (from DocumentParser) to ParsedRequirements
    fn convert_parsed_document_to_requirements(doc: ParsedDocument) -> Result<ParsedRequirements> {
        let mut sections = Vec::new();

        for section in doc.sections {
            let mut content = section.content.clone();

            // Add list items to content
            for item in &section.list_items {
                if !content.is_empty() {
                    content.push('\n');
                }
                if let Some(num) = item.number {
                    content.push_str(&format!("{}. {}", num, item.text));
                } else {
                    content.push_str(&format!("- {}", item.text));
                }
            }

            // Add subsections to content
            for subsection in &section.subsections {
                if !content.is_empty() {
                    content.push('\n');
                }
                content.push_str(&format!(
                    "\n### {}\n{}",
                    subsection.title, subsection.content
                ));
            }

            sections.push(RequirementsSection::new(section.title.clone(), content));
        }

        // If no sections found, create one from raw text
        if sections.is_empty() && !doc.raw_text.trim().is_empty() {
            sections.push(RequirementsSection::new(
                "Requirements",
                doc.raw_text.clone(),
            ));
        }

        let project_name = if doc.title == "Untitled" {
            "Untitled Project".to_string()
        } else {
            doc.title.clone()
        };

        Ok(ParsedRequirements::new(project_name).with_sections(sections))
    }

    fn get_heading_level(line: &str) -> Option<u32> {
        let trimmed = line.trim_start();
        let hash_count = trimmed.chars().take_while(|&c| c == '#').count();

        if hash_count > 0 && hash_count <= 6 {
            Some(hash_count as u32)
        } else {
            None
        }
    }

    fn strip_heading_markers(line: &str) -> String {
        line.trim_start().trim_start_matches('#').trim().to_string()
    }

    fn add_section_to_stack(stack: &mut Vec<InternalSection>, section: InternalSection) {
        while let Some(top) = stack.last() {
            if top.level >= section.level {
                stack.pop();
            } else {
                break;
            }
        }
        stack.push(section);
    }

    fn build_hierarchy(sections: Vec<InternalSection>) -> Vec<InternalSection> {
        let mut root_sections = Vec::new();
        let mut stack: Vec<InternalSection> = Vec::new();

        for section in sections {
            while let Some(top) = stack.pop() {
                if top.level < section.level {
                    stack.push(top);
                    break;
                } else if let Some(mut parent) = stack.pop() {
                    parent.subsections.push(top);
                    stack.push(parent);
                } else {
                    root_sections.push(top);
                }
            }
            stack.push(section);
        }

        while let Some(section) = stack.pop() {
            if let Some(mut parent) = stack.pop() {
                parent.subsections.push(section);
                stack.push(parent);
            } else {
                root_sections.push(section);
            }
        }

        root_sections
    }
}

// Helper extension for ParsedRequirements
trait ParsedRequirementsExt {
    fn with_sections(self, sections: Vec<RequirementsSection>) -> Self;
}

impl ParsedRequirementsExt for ParsedRequirements {
    fn with_sections(mut self, sections: Vec<RequirementsSection>) -> Self {
        self.sections = sections;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_markdown() {
        let content = r#"
# Project Title

This is the project description.

## Feature 1

Description of feature 1.

- Item 1
- Item 2

## Feature 2

Description of feature 2.

### Sub-feature 2.1

- Sub-item 1
"#;

        let result = RequirementsParser::parse_markdown(content).unwrap();
        assert_eq!(result.project_name, "Project Title");
        assert!(!result.sections.is_empty());
    }

    #[test]
    fn test_parse_text() {
        let content = r#"
Requirements for the project

1. First requirement
2. Second requirement
- Additional item
"#;

        let result = RequirementsParser::parse_text(content).unwrap();
        assert!(!result.sections.is_empty());
    }

    #[test]
    fn test_heading_level() {
        assert_eq!(
            RequirementsParser::get_heading_level("# Heading 1"),
            Some(1)
        );
        assert_eq!(
            RequirementsParser::get_heading_level("## Heading 2"),
            Some(2)
        );
        assert_eq!(
            RequirementsParser::get_heading_level("### Heading 3"),
            Some(3)
        );
        assert_eq!(RequirementsParser::get_heading_level("Not a heading"), None);
    }
}
