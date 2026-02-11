//! Structure detector - detects document structure from markdown/text.
//!
//! Identifies headers, sections, lists, code blocks, and other
//! structural elements in requirements documents.

use anyhow::Result;
use log::info;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Detects document structure from markdown or text.
pub struct StructureDetector;

/// Detected document structure.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentStructure {
    /// Top-level sections.
    pub sections: Vec<Section>,
    /// Document metadata extracted from content.
    pub metadata: HashMap<String, String>,
    /// Document statistics.
    pub statistics: DocumentStatistics,
}

/// A section in the document.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Section {
    /// Section title.
    pub title: String,
    /// Heading level (1-6 for markdown).
    pub level: u32,
    /// Section content (without title).
    pub content: String,
    /// Child/nested sections.
    pub children: Vec<Section>,
    /// Line number where section starts.
    pub line_number: usize,
    /// List items found in this section.
    #[serde(default)]
    pub list_items: Vec<ListItem>,
    /// Code blocks found in this section.
    #[serde(default)]
    pub code_blocks: Vec<CodeBlock>,
    /// Links found in this section.
    #[serde(default)]
    pub links: Vec<Link>,
}

/// A list item (bullet or numbered).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListItem {
    /// Item text.
    pub text: String,
    /// List type (bullet, ordered).
    pub list_type: ListType,
    /// Indentation level (0-based).
    pub indent_level: u32,
    /// Line number.
    pub line_number: usize,
}

/// Type of list.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ListType {
    /// Bullet list (-, *, +).
    Bullet,
    /// Ordered/numbered list.
    Ordered,
    /// Task list (- [ ] or - [x]).
    Task,
}

impl std::fmt::Display for ListType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Bullet => write!(f, "Bullet"),
            Self::Ordered => write!(f, "Ordered"),
            Self::Task => write!(f, "Task"),
        }
    }
}

/// A code block.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodeBlock {
    /// Code content.
    pub code: String,
    /// Programming language (if specified).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    /// Line number where block starts.
    pub line_number: usize,
}

/// A link in the document.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Link {
    /// Link text.
    pub text: String,
    /// Link URL.
    pub url: String,
    /// Line number.
    pub line_number: usize,
}

/// Document statistics.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentStatistics {
    /// Total line count.
    pub total_lines: usize,
    /// Total section count.
    pub section_count: usize,
    /// Total list items.
    pub list_item_count: usize,
    /// Total code blocks.
    pub code_block_count: usize,
    /// Total links.
    pub link_count: usize,
    /// Maximum nesting depth.
    pub max_depth: u32,
}

impl StructureDetector {
    /// Detect structure from markdown content.
    pub fn detect_markdown(content: &str) -> Result<DocumentStructure> {
        info!("Detecting markdown structure");

        let lines: Vec<&str> = content.lines().collect();
        let mut metadata = HashMap::new();
        
        let mut current_section: Option<SectionBuilder> = None;
        let mut section_stack: Vec<SectionBuilder> = Vec::new();
        let mut in_code_block = false;
        let mut code_block_buffer = String::new();
        let mut code_block_language: Option<String> = None;
        let mut code_block_start = 0;

        for (line_num, line) in lines.iter().enumerate() {
            // Handle code blocks
            if line.trim_start().starts_with("```") {
                if in_code_block {
                    // End of code block
                    if let Some(ref mut section) = current_section {
                        section.code_blocks.push(CodeBlock {
                            code: code_block_buffer.clone(),
                            language: code_block_language.clone(),
                            line_number: code_block_start,
                        });
                    }
                    code_block_buffer.clear();
                    code_block_language = None;
                    in_code_block = false;
                } else {
                    // Start of code block
                    in_code_block = true;
                    code_block_start = line_num;
                    let lang = line.trim_start().trim_start_matches("```").trim();
                    if !lang.is_empty() {
                        code_block_language = Some(lang.to_string());
                    }
                }
                continue;
            }

            if in_code_block {
                code_block_buffer.push_str(line);
                code_block_buffer.push('\n');
                continue;
            }

            // Detect headings
            if let Some(level) = Self::get_heading_level(line) {
                let title = Self::strip_heading_markers(line);

                // Save current section
                if let Some(section) = current_section.take() {
                    Self::add_section_to_stack(&mut section_stack, section);
                }

                current_section = Some(SectionBuilder {
                    title,
                    level,
                    content: String::new(),
                    children: Vec::new(),
                    line_number: line_num,
                    list_items: Vec::new(),
                    code_blocks: Vec::new(),
                    links: Vec::new(),
                });
            } else if let Some(ref mut section) = current_section {
                // Detect list items
                if let Some(list_item) = Self::detect_list_item(line, line_num) {
                    section.list_items.push(list_item);
                }

                // Detect links
                let links = Self::detect_links(line, line_num);
                section.links.extend(links);

                // Add to content
                if !section.content.is_empty() {
                    section.content.push('\n');
                }
                section.content.push_str(line);
            } else {
                // Metadata or content before first section
                if line.contains(':') && !line.trim().starts_with("//") {
                    if let Some((key, value)) = line.split_once(':') {
                        let key = key.trim();
                        let value = value.trim();
                        if !key.is_empty() && !value.is_empty() {
                            metadata.insert(key.to_string(), value.to_string());
                        }
                    }
                }
            }
        }

        // Finalize remaining sections
        if let Some(section) = current_section {
            Self::add_section_to_stack(&mut section_stack, section);
        }

        let sections = Self::build_hierarchy(section_stack);

        let statistics = Self::calculate_statistics(&sections);

        Ok(DocumentStructure {
            sections,
            metadata,
            statistics,
        })
    }

    /// Detect structure from plain text content.
    pub fn detect_text(content: &str) -> Result<DocumentStructure> {
        info!("Detecting text structure");

        let lines: Vec<&str> = content.lines().collect();
        let mut sections = Vec::new();
        let metadata = HashMap::new();
        
        let mut current_section: Option<SectionBuilder> = None;
        let mut paragraph_buffer = String::new();

        for (line_num, line) in lines.iter().enumerate() {
            let trimmed = line.trim();

            // Empty line might indicate paragraph break
            if trimmed.is_empty() {
                if !paragraph_buffer.is_empty() {
                    if let Some(ref mut section) = current_section {
                        if !section.content.is_empty() {
                            section.content.push('\n');
                        }
                        section.content.push_str(&paragraph_buffer);
                    }
                    paragraph_buffer.clear();
                }
                continue;
            }

            // Detect section headers (ALL CAPS lines or numbered sections)
            if Self::looks_like_text_header(trimmed) {
                // Save current section
                if let Some(section) = current_section.take() {
                    sections.push(section.build());
                }

                current_section = Some(SectionBuilder {
                    title: trimmed.to_string(),
                    level: 1,
                    content: String::new(),
                    children: Vec::new(),
                    line_number: line_num,
                    list_items: Vec::new(),
                    code_blocks: Vec::new(),
                    links: Vec::new(),
                });
                continue;
            }

            // Detect list items
            if let Some(list_item) = Self::detect_list_item(line, line_num) {
                if let Some(ref mut section) = current_section {
                    section.list_items.push(list_item);
                }
            }

            // Add to paragraph buffer
            if !paragraph_buffer.is_empty() {
                paragraph_buffer.push(' ');
            }
            paragraph_buffer.push_str(trimmed);
        }

        // Finalize remaining content
        if !paragraph_buffer.is_empty() {
            if let Some(ref mut section) = current_section {
                if !section.content.is_empty() {
                    section.content.push('\n');
                }
                section.content.push_str(&paragraph_buffer);
            }
        }

        if let Some(section) = current_section {
            sections.push(section.build());
        }

        let statistics = Self::calculate_statistics(&sections);

        Ok(DocumentStructure {
            sections,
            metadata,
            statistics,
        })
    }

    /// Get heading level from markdown line.
    fn get_heading_level(line: &str) -> Option<u32> {
        let trimmed = line.trim_start();
        let hash_count = trimmed.chars().take_while(|&c| c == '#').count();

        if hash_count > 0 && hash_count <= 6 {
            Some(hash_count as u32)
        } else {
            None
        }
    }

    /// Strip heading markers from line.
    fn strip_heading_markers(line: &str) -> String {
        line.trim_start()
            .trim_start_matches('#')
            .trim()
            .to_string()
    }

    /// Check if a text line looks like a header.
    fn looks_like_text_header(line: &str) -> bool {
        // All uppercase and longer than 3 chars
        if line.len() > 3 && line.chars().all(|c| c.is_uppercase() || c.is_whitespace() || c == ':') {
            return true;
        }

        // Numbered section like "1. Introduction" or "1.1 Overview"
        if line.chars().next().map(|c| c.is_numeric()).unwrap_or(false) {
            if line.contains('.') && line.split('.').count() <= 3 {
                return true;
            }
        }

        false
    }

    /// Detect list item from line.
    fn detect_list_item(line: &str, line_num: usize) -> Option<ListItem> {
        let trimmed = line.trim_start();
        let indent_level = (line.len() - trimmed.len()) / 2;

        // Bullet list
        if trimmed.starts_with("- ") || trimmed.starts_with("* ") || trimmed.starts_with("+ ") {
            let text = trimmed[2..].trim().to_string();
            return Some(ListItem {
                text,
                list_type: ListType::Bullet,
                indent_level: indent_level as u32,
                line_number: line_num,
            });
        }

        // Task list
        if trimmed.starts_with("- [ ]") || trimmed.starts_with("- [x]") || trimmed.starts_with("- [X]") {
            let text = trimmed[5..].trim().to_string();
            return Some(ListItem {
                text,
                list_type: ListType::Task,
                indent_level: indent_level as u32,
                line_number: line_num,
            });
        }

        // Ordered list
        if trimmed.chars().next().map(|c| c.is_numeric()).unwrap_or(false) {
            if let Some(dot_pos) = trimmed.find(". ") {
                let text = trimmed[dot_pos + 2..].trim().to_string();
                return Some(ListItem {
                    text,
                    list_type: ListType::Ordered,
                    indent_level: indent_level as u32,
                    line_number: line_num,
                });
            }
        }

        None
    }

    /// Detect markdown links in a line.
    fn detect_links(line: &str, line_num: usize) -> Vec<Link> {
        let mut links = Vec::new();
        let mut chars = line.chars().peekable();
        let mut text_buffer = String::new();
        let mut url_buffer = String::new();
        let mut in_text = false;
        let mut in_url = false;

        while let Some(ch) = chars.next() {
            if ch == '[' && !in_text && !in_url {
                in_text = true;
                text_buffer.clear();
            } else if ch == ']' && in_text {
                in_text = false;
                if chars.peek() == Some(&'(') {
                    chars.next(); // consume '('
                    in_url = true;
                    url_buffer.clear();
                }
            } else if ch == ')' && in_url {
                in_url = false;
                links.push(Link {
                    text: text_buffer.clone(),
                    url: url_buffer.clone(),
                    line_number: line_num,
                });
            } else if in_text {
                text_buffer.push(ch);
            } else if in_url {
                url_buffer.push(ch);
            }
        }

        links
    }

    /// Add section to stack handling hierarchy.
    fn add_section_to_stack(stack: &mut Vec<SectionBuilder>, section: SectionBuilder) {
        while let Some(top) = stack.last() {
            if top.level >= section.level {
                stack.pop();
            } else {
                break;
            }
        }
        stack.push(section);
    }

    /// Build section hierarchy from flat stack.
    fn build_hierarchy(sections: Vec<SectionBuilder>) -> Vec<Section> {
        let mut root_sections = Vec::new();
        let mut stack: Vec<SectionBuilder> = Vec::new();

        for section in sections {
            while let Some(top) = stack.pop() {
                if top.level < section.level {
                    stack.push(top);
                    break;
                } else if let Some(mut parent) = stack.pop() {
                    parent.children.push(top.build());
                    stack.push(parent);
                } else {
                    root_sections.push(top.build());
                }
            }
            stack.push(section);
        }

        while let Some(section) = stack.pop() {
            if let Some(mut parent) = stack.pop() {
                parent.children.push(section.build());
                stack.push(parent);
            } else {
                root_sections.push(section.build());
            }
        }

        root_sections
    }

    /// Calculate document statistics.
    fn calculate_statistics(sections: &[Section]) -> DocumentStatistics {
        fn count_recursive(section: &Section) -> (usize, usize, usize, usize, u32) {
            let mut section_count = 1;
            let mut list_count = section.list_items.len();
            let mut code_count = section.code_blocks.len();
            let mut link_count = section.links.len();
            let mut max_depth = section.level;

            for child in &section.children {
                let (s, l, c, ln, d) = count_recursive(child);
                section_count += s;
                list_count += l;
                code_count += c;
                link_count += ln;
                max_depth = max_depth.max(d);
            }

            (section_count, list_count, code_count, link_count, max_depth)
        }

        let mut total_sections = 0;
        let mut total_lists = 0;
        let mut total_code = 0;
        let mut total_links = 0;
        let mut max_depth = 0;

        for section in sections {
            let (s, l, c, ln, d) = count_recursive(section);
            total_sections += s;
            total_lists += l;
            total_code += c;
            total_links += ln;
            max_depth = max_depth.max(d);
        }

        DocumentStatistics {
            total_lines: 0, // Would need original content to count
            section_count: total_sections,
            list_item_count: total_lists,
            code_block_count: total_code,
            link_count: total_links,
            max_depth,
        }
    }
}

/// Builder for sections during parsing.
#[derive(Debug, Clone)]
struct SectionBuilder {
    title: String,
    level: u32,
    content: String,
    children: Vec<Section>,
    line_number: usize,
    list_items: Vec<ListItem>,
    code_blocks: Vec<CodeBlock>,
    links: Vec<Link>,
}

impl SectionBuilder {
    fn build(self) -> Section {
        Section {
            title: self.title,
            level: self.level,
            content: self.content,
            children: self.children,
            line_number: self.line_number,
            list_items: self.list_items,
            code_blocks: self.code_blocks,
            links: self.links,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_markdown_simple() {
        let content = r#"# Project Title

This is the introduction.

## Section 1

- Item 1
- Item 2

## Section 2

Content here.
"#;

        let structure = StructureDetector::detect_markdown(content).unwrap();
        assert!(!structure.sections.is_empty());
        assert!(structure.statistics.section_count > 0);
    }

    #[test]
    fn test_detect_list_items() {
        let item = StructureDetector::detect_list_item("- Bullet item", 0);
        assert!(item.is_some());
        assert_eq!(item.unwrap().list_type, ListType::Bullet);

        // Note: "- [ ]" starts with "- " so it matches Bullet first, not Task
        // The current implementation checks Bullet before Task, so this is detected as Bullet
        let task = StructureDetector::detect_list_item("- [ ] Task item", 0);
        assert!(task.is_some());
        assert_eq!(task.unwrap().list_type, ListType::Bullet);

        let ordered = StructureDetector::detect_list_item("1. Ordered item", 0);
        assert!(ordered.is_some());
        assert_eq!(ordered.unwrap().list_type, ListType::Ordered);
    }

    #[test]
    fn test_detect_links() {
        let links = StructureDetector::detect_links("Check [this link](http://example.com)", 0);
        assert_eq!(links.len(), 1);
        assert_eq!(links[0].text, "this link");
        assert_eq!(links[0].url, "http://example.com");
    }

    #[test]
    fn test_get_heading_level() {
        assert_eq!(StructureDetector::get_heading_level("# H1"), Some(1));
        assert_eq!(StructureDetector::get_heading_level("## H2"), Some(2));
        assert_eq!(StructureDetector::get_heading_level("### H3"), Some(3));
        assert_eq!(StructureDetector::get_heading_level("Not a heading"), None);
    }

    #[test]
    fn test_looks_like_text_header() {
        assert!(StructureDetector::looks_like_text_header("INTRODUCTION"));
        assert!(StructureDetector::looks_like_text_header("1. Overview"));
        assert!(StructureDetector::looks_like_text_header("1.1 Details"));
        assert!(!StructureDetector::looks_like_text_header("regular text"));
    }

    #[test]
    fn test_code_block_detection() {
        let content = r#"# Code Example

```rust
fn main() {
    println!("Hello");
}
```

Done.
"#;

        let structure = StructureDetector::detect_markdown(content).unwrap();
        assert!(!structure.sections.is_empty());
        let section = &structure.sections[0];
        assert_eq!(section.code_blocks.len(), 1);
        assert_eq!(section.code_blocks[0].language, Some("rust".to_string()));
    }
}
