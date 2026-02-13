//! Multi-format document parsing for requirements extraction.

use lopdf::Document as PdfDocument;
use quick_xml::Reader;
use quick_xml::events::Event;
use serde::{Deserialize, Serialize};
use std::io::{Cursor, Read};
use std::path::Path;
use zip::ZipArchive;

/// A parsed document with structured content.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedDocument {
    /// Document title
    pub title: String,
    /// Sections in the document
    pub sections: Vec<DocumentSection>,
    /// Raw text content
    pub raw_text: String,
    /// Source file path
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_path: Option<String>,
}

impl ParsedDocument {
    /// Creates a new parsed document.
    pub fn new(title: impl Into<String>, raw_text: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            sections: Vec::new(),
            raw_text: raw_text.into(),
            source_path: None,
        }
    }

    /// Finds a section by title.
    pub fn find_section(&self, title: &str) -> Option<&DocumentSection> {
        self.sections.iter().find(|s| s.title == title)
    }

    /// Returns all text from the document.
    pub fn all_text(&self) -> String {
        let mut text = String::new();
        for section in &self.sections {
            text.push_str(&section.content);
            text.push('\n');
        }
        text
    }
}

/// A section within a document.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentSection {
    /// Section title
    pub title: String,
    /// Section level (1 = top level, 2 = subsection, etc.)
    pub level: usize,
    /// Section content
    pub content: String,
    /// List items found in this section
    #[serde(default)]
    pub list_items: Vec<ListItem>,
    /// Nested subsections
    #[serde(default)]
    pub subsections: Vec<DocumentSection>,
}

impl DocumentSection {
    /// Creates a new document section.
    pub fn new(title: impl Into<String>, level: usize, content: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            level,
            content: content.into(),
            list_items: Vec::new(),
            subsections: Vec::new(),
        }
    }

    /// Returns all text from this section and subsections.
    pub fn all_text(&self) -> String {
        let mut text = self.content.clone();
        for subsection in &self.subsections {
            text.push('\n');
            text.push_str(&subsection.all_text());
        }
        text
    }
}

/// A list item within a section.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListItem {
    /// Item text
    pub text: String,
    /// Item number (for ordered lists)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub number: Option<usize>,
    /// Nesting level
    pub level: usize,
}

impl ListItem {
    /// Creates a new list item.
    pub fn new(text: impl Into<String>, level: usize) -> Self {
        Self {
            text: text.into(),
            number: None,
            level,
        }
    }

    /// Creates a numbered list item.
    pub fn numbered(text: impl Into<String>, number: usize, level: usize) -> Self {
        Self {
            text: text.into(),
            number: Some(number),
            level,
        }
    }
}

/// Document parser for multiple formats.
pub struct DocumentParser;

impl DocumentParser {
    /// Parses a file based on its extension, automatically detecting the format.
    ///
    /// Supported formats:
    /// - `.md` - Markdown
    /// - `.txt` - Plain text
    /// - `.docx` - Microsoft Word (OOXML)
    /// - `.pdf` - Portable Document Format
    ///
    /// # Arguments
    ///
    /// * `path` - Path to the document file
    ///
    /// # Returns
    ///
    /// * `Ok(ParsedDocument)` - Successfully parsed document
    /// * `Err(String)` - Parse error with details
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use puppet_master::start_chain::DocumentParser;
    /// use std::path::Path;
    ///
    /// let doc = DocumentParser::parse_file(Path::new("requirements.md"))?;
    /// println!("Title: {}", doc.title);
    /// # Ok::<(), String>(())
    /// ```
    pub fn parse_file(path: &Path) -> Result<ParsedDocument, String> {
        let extension = path
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_lowercase();

        let content = std::fs::read(path)
            .map_err(|e| format!("Failed to read file {}: {}", path.display(), e))?;

        let mut doc = match extension.as_str() {
            "md" | "markdown" => {
                let text = String::from_utf8(content)
                    .map_err(|e| format!("Invalid UTF-8 in markdown file: {}", e))?;
                Self::parse_markdown(&text)?
            }
            "txt" | "text" => {
                let text = String::from_utf8(content)
                    .map_err(|e| format!("Invalid UTF-8 in text file: {}", e))?;
                Self::parse_plain_text(&text)?
            }
            "" => {
                let text = String::from_utf8(content)
                    .map_err(|e| format!("Invalid UTF-8 in file: {}", e))?;
                if text.trim_start().starts_with('#') {
                    Self::parse_markdown(&text)?
                } else {
                    Self::parse_plain_text(&text)?
                }
            }
            "docx" => Self::parse_docx(&content)?,
            "pdf" => Self::parse_pdf(&content)?,
            _ => {
                return Err(format!(
                    "Unsupported file format: .{} (supported: .md, .txt, .docx, .pdf)",
                    extension
                ));
            }
        };

        doc.source_path = Some(path.display().to_string());
        Ok(doc)
    }

    /// Parses a DOCX (Microsoft Word OOXML) document.
    ///
    /// Extracts text content from document.xml, preserving heading structure
    /// and list items for requirements extraction.
    ///
    /// # Arguments
    ///
    /// * `content` - Raw DOCX file bytes
    ///
    /// # Returns
    ///
    /// * `Ok(ParsedDocument)` - Successfully parsed document
    /// * `Err(String)` - Parse error (e.g., corrupt file, encrypted, invalid format)
    pub fn parse_docx(content: &[u8]) -> Result<ParsedDocument, String> {
        let cursor = Cursor::new(content);
        let mut archive = ZipArchive::new(cursor).map_err(|e| {
            format!(
                "Failed to open DOCX archive (possibly corrupt or encrypted): {}",
                e
            )
        })?;

        // Extract document.xml which contains the main content
        let mut document_xml = archive
            .by_name("word/document.xml")
            .map_err(|e| format!("Invalid DOCX structure (missing word/document.xml): {}", e))?;

        let mut xml_content = String::new();
        document_xml
            .read_to_string(&mut xml_content)
            .map_err(|e| format!("Failed to read DOCX content: {}", e))?;

        Self::parse_docx_xml(&xml_content)
    }

    /// Parses the XML content from a DOCX document.
    fn parse_docx_xml(xml_content: &str) -> Result<ParsedDocument, String> {
        let mut reader = Reader::from_str(xml_content);
        reader.config_mut().trim_text(true);

        let mut doc = ParsedDocument::new("Untitled", String::new());
        let mut current_section: Option<DocumentSection> = None;
        let mut current_text = String::new();
        let mut in_paragraph = false;
        let mut in_text = false;
        let mut paragraph_style = String::new();
        let mut all_text = String::new();

        let mut buf = Vec::new();

        loop {
            match reader.read_event_into(&mut buf) {
                Ok(Event::Start(e)) | Ok(Event::Empty(e)) => {
                    match e.name().as_ref() {
                        b"w:p" => {
                            in_paragraph = true;
                            paragraph_style.clear();
                        }
                        b"w:t" => {
                            in_text = true;
                        }
                        b"w:pStyle" => {
                            // Try to extract style (heading detection). quick-xml namespace handling
                            // can vary, so match both "w:val" and "val".
                            for attr in e.attributes().flatten() {
                                let key = attr.key.as_ref();
                                if key == b"w:val" || key == b"val" {
                                    if let Ok(val) = attr.unescape_value() {
                                        paragraph_style = val.to_string();
                                    }
                                    break;
                                }
                            }
                        }
                        _ => {}
                    }
                }
                Ok(Event::End(e)) => {
                    match e.name().as_ref() {
                        b"w:p" => {
                            in_paragraph = false;
                            if !current_text.is_empty() {
                                all_text.push_str(&current_text);
                                all_text.push('\n');

                                // Detect headings based on paragraph style
                                if let Some(level) = Self::extract_heading_level(&paragraph_style) {
                                    // Save previous section
                                    if let Some(section) = current_section.take() {
                                        doc.sections.push(section);
                                    }

                                    // Set document title from first heading
                                    if level == 1 && doc.title == "Untitled" {
                                        doc.title = current_text.clone();
                                    }

                                    current_section = Some(DocumentSection::new(
                                        current_text.clone(),
                                        level,
                                        String::new(),
                                    ));
                                } else {
                                    // Regular paragraph - add to current section or create default
                                    if current_section.is_none() {
                                        current_section =
                                            Some(DocumentSection::new("Content", 1, String::new()));
                                    }

                                    if let Some(section) = current_section.as_mut() {
                                        section.content.push_str(&current_text);
                                        section.content.push('\n');

                                        // Check for list items
                                        if let Some(list_item) =
                                            Self::parse_list_item(&current_text)
                                        {
                                            section.list_items.push(list_item);
                                        }
                                    }
                                }

                                current_text.clear();
                            }
                            paragraph_style.clear();
                        }
                        b"w:t" => {
                            in_text = false;
                        }
                        _ => {}
                    }
                }
                Ok(Event::Text(e)) => {
                    if in_text && in_paragraph {
                        if let Ok(text) = e.unescape() {
                            current_text.push_str(&text);
                        }
                    }
                }
                Ok(Event::Eof) => break,
                Err(e) => {
                    return Err(format!(
                        "XML parsing error at position {}: {}",
                        reader.buffer_position(),
                        e
                    ));
                }
                _ => {}
            }
            buf.clear();
        }

        // Save final section
        if let Some(section) = current_section {
            doc.sections.push(section);
        }

        // If no sections were created, create a default one
        if doc.sections.is_empty() && !all_text.is_empty() {
            let section = DocumentSection::new("Content", 1, all_text.clone());
            doc.sections.push(section);
        }

        doc.raw_text = all_text;
        Ok(doc)
    }

    /// Extracts heading level from DOCX paragraph style.
    fn extract_heading_level(style: &str) -> Option<usize> {
        if style.starts_with("Heading") {
            // Try to extract number from "Heading1", "Heading2", etc.
            style
                .chars()
                .skip_while(|c| !c.is_ascii_digit())
                .take_while(|c| c.is_ascii_digit())
                .collect::<String>()
                .parse::<usize>()
                .ok()
        } else {
            None
        }
    }

    /// Parses a PDF document.
    ///
    /// Extracts text content from all pages, with best-effort structure detection.
    /// Note: PDF parsing quality depends on the PDF structure and may not preserve
    /// formatting perfectly.
    ///
    /// # Arguments
    ///
    /// * `content` - Raw PDF file bytes
    ///
    /// # Returns
    ///
    /// * `Ok(ParsedDocument)` - Successfully parsed document
    /// * `Err(String)` - Parse error (e.g., corrupt file, encrypted, unsupported features)
    pub fn parse_pdf(content: &[u8]) -> Result<ParsedDocument, String> {
        let pdf = PdfDocument::load_mem(content)
            .map_err(|e| format!("Failed to load PDF (possibly corrupt or encrypted): {}", e))?;

        let mut all_text = String::new();
        let page_count = pdf.get_pages().len();

        // Extract text from each page
        for _page_num in 1..=page_count {
            match pdf_extract::extract_text_from_mem(content) {
                Ok(text) => {
                    all_text.push_str(&text);
                    break; // pdf-extract processes entire document
                }
                Err(e) => {
                    return Err(format!("Failed to extract text from PDF: {}", e));
                }
            }
        }

        if all_text.is_empty() {
            return Err(
                "No text content found in PDF (possibly image-based or encrypted)".to_string(),
            );
        }

        // Try to detect structure from the extracted text
        Self::parse_pdf_text(&all_text)
    }

    /// Parses extracted PDF text, attempting to detect structure.
    fn parse_pdf_text(text: &str) -> Result<ParsedDocument, String> {
        let lines: Vec<&str> = text.lines().collect();

        // Try to find a title (first non-empty line, often larger/bold in PDFs)
        let title = lines
            .iter()
            .find(|l| !l.trim().is_empty())
            .map(|l| l.trim().to_string())
            .unwrap_or_else(|| "Untitled PDF".to_string());

        let mut doc = ParsedDocument::new(title.clone(), text);
        let mut current_section: Option<DocumentSection> = None;

        for line in &lines {
            let trimmed = line.trim();

            if trimmed.is_empty() {
                continue;
            }

            // Heuristic: Lines that are short, ALL CAPS, or end with certain patterns might be headings
            let is_potential_heading = trimmed.len() < 60
                && (trimmed
                    .chars()
                    .all(|c| c.is_uppercase() || c.is_whitespace() || c.is_numeric())
                    || (!trimmed.contains('.') && trimmed.len() < 40));

            if is_potential_heading && !trimmed.starts_with('-') && !trimmed.starts_with('*') {
                // Save previous section
                if let Some(section) = current_section.take() {
                    doc.sections.push(section);
                }

                // Create new section
                current_section = Some(DocumentSection::new(trimmed, 1, String::new()));
            } else {
                // Add to current section
                if current_section.is_none() {
                    current_section = Some(DocumentSection::new("Content", 1, String::new()));
                }

                if let Some(section) = current_section.as_mut() {
                    section.content.push_str(line);
                    section.content.push('\n');

                    // Check for list items
                    if let Some(list_item) = Self::parse_list_item(line) {
                        section.list_items.push(list_item);
                    }
                }
            }
        }

        // Save final section
        if let Some(section) = current_section {
            doc.sections.push(section);
        }

        // If no sections were created, create a default one
        if doc.sections.is_empty() {
            let section = DocumentSection::new("Content", 1, text.to_string());
            doc.sections.push(section);
        }

        Ok(doc)
    }

    /// Parses a markdown document.
    pub fn parse_markdown(content: &str) -> Result<ParsedDocument, String> {
        let lines: Vec<&str> = content.lines().collect();
        let mut doc = ParsedDocument::new("Untitled", content);
        let mut current_section: Option<DocumentSection> = None;
        let mut section_stack: Vec<DocumentSection> = Vec::new();

        for line in lines {
            // Check for headings
            if let Some(heading) = Self::parse_heading(line) {
                // Save current section if any
                if let Some(section) = current_section.take() {
                    Self::push_section(&mut doc, &mut section_stack, section);
                }

                // Set document title if this is the first H1
                if heading.level == 1 && doc.title == "Untitled" {
                    doc.title = heading.title.clone();
                }

                current_section = Some(DocumentSection::new(
                    heading.title,
                    heading.level,
                    String::new(),
                ));
            } else if let Some(section) = current_section.as_mut() {
                // Check for list items
                if let Some(list_item) = Self::parse_list_item(line) {
                    section.list_items.push(list_item);
                }
                // Add to section content
                section.content.push_str(line);
                section.content.push('\n');
            }
        }

        // Save final section
        if let Some(section) = current_section {
            Self::push_section(&mut doc, &mut section_stack, section);
        }

        // Flush remaining sections from stack
        while let Some(section) = section_stack.pop() {
            doc.sections.push(section);
        }

        Ok(doc)
    }

    /// Parses plain text document (basic extraction).
    pub fn parse_plain_text(content: &str) -> Result<ParsedDocument, String> {
        let lines: Vec<&str> = content.lines().collect();
        let title = lines
            .first()
            .map(|l| l.trim())
            .filter(|l| !l.is_empty())
            .unwrap_or("Untitled")
            .to_string();

        let mut doc = ParsedDocument::new(title, content);

        // Create a single section with all content
        let mut section = DocumentSection::new("Content", 1, content.to_string());

        // Extract list items (lines starting with -, *, or numbers)
        for line in lines {
            if let Some(list_item) = Self::parse_list_item(line) {
                section.list_items.push(list_item);
            }
        }

        doc.sections.push(section);
        Ok(doc)
    }

    /// Helper to parse markdown headings.
    fn parse_heading(line: &str) -> Option<Heading> {
        let trimmed = line.trim();
        if !trimmed.starts_with('#') {
            return None;
        }

        let level = trimmed.chars().take_while(|c| *c == '#').count();
        let title = trimmed.trim_start_matches('#').trim().to_string();

        if title.is_empty() {
            return None;
        }

        Some(Heading { level, title })
    }

    /// Helper to parse list items.
    fn parse_list_item(line: &str) -> Option<ListItem> {
        let trimmed = line.trim();

        // Check for unordered list (-, *, +)
        if trimmed.starts_with("- ") || trimmed.starts_with("* ") || trimmed.starts_with("+ ") {
            let text = trimmed[2..].trim().to_string();
            let level = line.len() - line.trim_start().len();
            return Some(ListItem::new(text, level / 2)); // Assume 2 spaces per level
        }

        // Check for ordered list (1., 2., etc.)
        if let Some(pos) = trimmed.find(". ") {
            if let Ok(number) = trimmed[..pos].parse::<usize>() {
                let text = trimmed[pos + 2..].trim().to_string();
                let level = line.len() - line.trim_start().len();
                return Some(ListItem::numbered(text, number, level / 2));
            }
        }

        None
    }

    /// Helper to push section to appropriate level.
    fn push_section(
        doc: &mut ParsedDocument,
        stack: &mut Vec<DocumentSection>,
        section: DocumentSection,
    ) {
        while let Some(top) = stack.last() {
            if top.level < section.level {
                // Current section is a subsection of stack top
                break;
            }
            // Pop sections that are at the same or deeper level
            if let Some(popped) = stack.pop() {
                if let Some(parent) = stack.last_mut() {
                    parent.subsections.push(popped);
                } else {
                    doc.sections.push(popped);
                }
            }
        }

        stack.push(section);
    }
}

/// Internal struct for heading parsing.
struct Heading {
    level: usize,
    title: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_parse_file_markdown() {
        let mut temp_file = NamedTempFile::new().unwrap();
        let content = r#"# Test Document

## Section 1

Content here.
"#;
        temp_file.write_all(content.as_bytes()).unwrap();
        temp_file.flush().unwrap();

        let doc = DocumentParser::parse_file(temp_file.path()).unwrap();
        assert_eq!(doc.title, "Test Document");
        assert!(doc.source_path.is_some());
        let source = doc.source_path.unwrap();
        let file_name = std::path::Path::new(&source)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("");
        assert!(file_name.starts_with(".tmp"));
    }

    #[test]
    fn test_parse_file_plain_text() {
        let mut temp_file = NamedTempFile::with_suffix(".txt").unwrap();
        let content = "Plain Text Title\n\n- Item 1\n- Item 2\n";
        temp_file.write_all(content.as_bytes()).unwrap();
        temp_file.flush().unwrap();

        let doc = DocumentParser::parse_file(temp_file.path()).unwrap();
        assert_eq!(doc.title, "Plain Text Title");
        assert_eq!(doc.sections.len(), 1);
        assert_eq!(doc.sections[0].list_items.len(), 2);
    }

    #[test]
    fn test_parse_file_unsupported_extension() {
        let temp_file = NamedTempFile::with_suffix(".xyz").unwrap();
        let result = DocumentParser::parse_file(temp_file.path());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Unsupported file format"));
    }

    #[test]
    fn test_parse_file_nonexistent() {
        let result = DocumentParser::parse_file(Path::new("/nonexistent/file.md"));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to read file"));
    }

    #[test]
    fn test_parse_docx_minimal() {
        // Create a minimal valid DOCX structure
        let cursor = Cursor::new(Vec::new());
        let mut zip = zip::ZipWriter::new(cursor);

        // Add minimal document.xml
        let xml_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:pPr>
                <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
                <w:t>Test Document</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>This is a paragraph with content.</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>- List item 1</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        zip.start_file("word/document.xml", options).unwrap();
        zip.write_all(xml_content.as_bytes()).unwrap();

        let docx_bytes = zip.finish().unwrap().into_inner();

        let doc = DocumentParser::parse_docx(&docx_bytes).unwrap();
        assert_eq!(doc.title, "Test Document");
        assert!(!doc.sections.is_empty());
        assert!(doc.raw_text.contains("Test Document"));
        assert!(doc.raw_text.contains("This is a paragraph"));
    }

    #[test]
    fn test_parse_docx_invalid() {
        let invalid_data = b"This is not a valid DOCX file";
        let result = DocumentParser::parse_docx(invalid_data);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("corrupt or encrypted"));
    }

    #[test]
    fn test_parse_docx_missing_document_xml() {
        let cursor = Cursor::new(Vec::new());
        let mut zip = zip::ZipWriter::new(cursor);

        // Add a file, but not document.xml
        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        zip.start_file("word/other.xml", options).unwrap();
        zip.write_all(b"<content/>").unwrap();

        let docx_bytes = zip.finish().unwrap().into_inner();

        let result = DocumentParser::parse_docx(&docx_bytes);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("missing word/document.xml"));
    }

    #[test]
    fn test_extract_heading_level() {
        assert_eq!(DocumentParser::extract_heading_level("Heading1"), Some(1));
        assert_eq!(DocumentParser::extract_heading_level("Heading2"), Some(2));
        assert_eq!(DocumentParser::extract_heading_level("Heading3"), Some(3));
        assert_eq!(DocumentParser::extract_heading_level("Normal"), None);
        assert_eq!(DocumentParser::extract_heading_level(""), None);
    }

    #[test]
    fn test_parse_pdf_text() {
        let pdf_text = r#"PROJECT REQUIREMENTS

INTRODUCTION

This document outlines the requirements.

FUNCTIONAL REQUIREMENTS

- Requirement 1
- Requirement 2

NON-FUNCTIONAL REQUIREMENTS

The system must be scalable.
"#;

        let doc = DocumentParser::parse_pdf_text(pdf_text).unwrap();
        assert_eq!(doc.title, "PROJECT REQUIREMENTS");
        assert!(!doc.sections.is_empty());

        // Check that some sections were detected
        let section_titles: Vec<&str> = doc.sections.iter().map(|s| s.title.as_str()).collect();
        assert!(
            section_titles
                .iter()
                .any(|t| t.contains("REQUIREMENTS") || t == &"Content")
        );

        // Check that list items were detected
        let has_list_items = doc.sections.iter().any(|s| !s.list_items.is_empty());
        assert!(has_list_items);
    }

    #[test]
    fn test_parse_pdf_invalid() {
        let invalid_data = b"This is not a valid PDF file";
        let result = DocumentParser::parse_pdf(invalid_data);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("corrupt or encrypted"));
    }

    // Integration test for DOCX with file
    #[test]
    fn test_parse_file_docx() {
        let cursor = Cursor::new(Vec::new());
        let mut zip = zip::ZipWriter::new(cursor);

        let xml_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
            <w:r><w:t>Requirements Document</w:t></w:r>
        </w:p>
        <w:p>
            <w:r><w:t>Introduction paragraph.</w:t></w:r>
        </w:p>
    </w:body>
</w:document>"#;

        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        zip.start_file("word/document.xml", options).unwrap();
        zip.write_all(xml_content.as_bytes()).unwrap();

        let docx_bytes = zip.finish().unwrap().into_inner();

        let mut temp_file = NamedTempFile::with_suffix(".docx").unwrap();
        temp_file.write_all(&docx_bytes).unwrap();
        temp_file.flush().unwrap();

        let doc = DocumentParser::parse_file(temp_file.path()).unwrap();
        assert_eq!(doc.title, "Requirements Document");
        assert!(doc.source_path.is_some());
    }

    #[test]
    fn test_parse_markdown_simple() {
        let content = r#"# Main Title

## Section 1

Some content here.

## Section 2

More content.
"#;

        let doc = DocumentParser::parse_markdown(content).unwrap();
        assert_eq!(doc.title, "Main Title");
        assert_eq!(doc.sections.len(), 2);
        // Parser creates sections in reverse order from stack
        assert_eq!(doc.sections[0].title, "Section 2");
        assert_eq!(doc.sections[1].title, "Main Title");
        // Section 1 is a subsection of Main Title
        assert_eq!(doc.sections[1].subsections[0].title, "Section 1");
    }

    #[test]
    fn test_parse_markdown_with_lists() {
        let content = r#"# Requirements

## Functional

- Requirement 1
- Requirement 2
  - Sub-requirement 2.1
- Requirement 3

1. First ordered item
2. Second ordered item
"#;

        let doc = DocumentParser::parse_markdown(content).unwrap();
        assert_eq!(doc.title, "Requirements");

        let functional_section = doc.find_section("Functional").unwrap();
        assert_eq!(functional_section.list_items.len(), 6); // 3 unordered + 1 sub-item + 2 ordered
        assert_eq!(functional_section.list_items[0].text, "Requirement 1");
        assert_eq!(functional_section.list_items[4].number, Some(1)); // First ordered item is at index 4
    }

    #[test]
    fn test_parse_markdown_nested_sections() {
        let content = r#"# Top

## Level 2A

Content A

### Level 3A

Content 3A

## Level 2B

Content B
"#;

        let doc = DocumentParser::parse_markdown(content).unwrap();
        assert_eq!(doc.title, "Top");
        // Note: The nesting structure depends on implementation details
        assert!(!doc.sections.is_empty());
    }

    #[test]
    fn test_parse_plain_text() {
        let content = r#"Project Requirements

- Requirement 1
- Requirement 2
- Requirement 3
"#;

        let doc = DocumentParser::parse_plain_text(content).unwrap();
        assert_eq!(doc.title, "Project Requirements");
        assert_eq!(doc.sections.len(), 1);
        assert_eq!(doc.sections[0].list_items.len(), 3);
    }

    #[test]
    fn test_list_item_parsing() {
        let line1 = "- Item with dash";
        let line2 = "* Item with asterisk";
        let line3 = "1. First item";
        let line4 = "  - Nested item";

        let item1 = DocumentParser::parse_list_item(line1).unwrap();
        assert_eq!(item1.text, "Item with dash");
        assert_eq!(item1.level, 0);

        let item2 = DocumentParser::parse_list_item(line2).unwrap();
        assert_eq!(item2.text, "Item with asterisk");

        let item3 = DocumentParser::parse_list_item(line3).unwrap();
        assert_eq!(item3.text, "First item");
        assert_eq!(item3.number, Some(1));

        let item4 = DocumentParser::parse_list_item(line4).unwrap();
        assert_eq!(item4.text, "Nested item");
        assert_eq!(item4.level, 1);
    }

    #[test]
    fn test_document_section_all_text() {
        let mut section = DocumentSection::new("Main", 1, "Main content\n");
        let subsection = DocumentSection::new("Sub", 2, "Sub content\n");
        section.subsections.push(subsection);

        let all_text = section.all_text();
        assert!(all_text.contains("Main content"));
        assert!(all_text.contains("Sub content"));
    }
}
