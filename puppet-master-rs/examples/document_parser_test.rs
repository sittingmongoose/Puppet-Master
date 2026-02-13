//! Example demonstrating document parser functionality with DOCX and PDF support.

use puppet_master::start_chain::DocumentParser;
use std::io::{Cursor, Write};
use std::path::Path;
use tempfile::NamedTempFile;
use zip::ZipWriter;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing Document Parser Implementation");
    println!("======================================\n");

    // Test 1: Markdown parsing
    println!("1. Testing Markdown parsing...");
    test_markdown()?;
    println!("   ✓ Markdown parsing successful\n");

    // Test 2: Plain text parsing
    println!("2. Testing Plain text parsing...");
    test_plain_text()?;
    println!("   ✓ Plain text parsing successful\n");

    // Test 3: DOCX parsing
    println!("3. Testing DOCX parsing...");
    test_docx()?;
    println!("   ✓ DOCX parsing successful\n");

    // Test 4: PDF parsing (with minimal test)
    println!("4. Testing PDF error handling...");
    test_pdf_error()?;
    println!("   ✓ PDF error handling successful\n");

    println!("All tests passed! ✓");
    Ok(())
}

fn test_markdown() -> Result<(), Box<dyn std::error::Error>> {
    let mut temp_file = NamedTempFile::with_suffix(".md")?;
    let content = r#"# Requirements Document

## Functional Requirements

- User authentication
- Data encryption
- API endpoints

## Non-Functional Requirements

- Performance targets
- Security standards
"#;
    temp_file.write_all(content.as_bytes())?;
    temp_file.flush()?;

    let doc = DocumentParser::parse_file(temp_file.path())
        .map_err(|e| format!("Markdown parse error: {}", e))?;

    assert_eq!(doc.title, "Requirements Document");
    assert!(!doc.sections.is_empty());
    assert!(doc.raw_text.contains("authentication"));
    println!("   - Found {} sections", doc.sections.len());
    println!("   - Title: {}", doc.title);

    Ok(())
}

fn test_plain_text() -> Result<(), Box<dyn std::error::Error>> {
    let mut temp_file = NamedTempFile::with_suffix(".txt")?;
    let content = "Project Requirements\n\n- Requirement 1\n- Requirement 2\n- Requirement 3\n";
    temp_file.write_all(content.as_bytes())?;
    temp_file.flush()?;

    let doc = DocumentParser::parse_file(temp_file.path())
        .map_err(|e| format!("Plain text parse error: {}", e))?;

    assert_eq!(doc.title, "Project Requirements");
    assert_eq!(doc.sections.len(), 1);
    println!("   - Title: {}", doc.title);
    println!("   - List items: {}", doc.sections[0].list_items.len());

    Ok(())
}

fn test_docx() -> Result<(), Box<dyn std::error::Error>> {
    // Create a minimal valid DOCX
    let cursor = Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(cursor);

    let xml_content = r#"<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:pPr>
                <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
                <w:t>System Requirements</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>This document outlines the system requirements.</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>- Database support</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>- User interface</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>"#;

    let options =
        zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
    zip.start_file("word/document.xml", options)?;
    zip.write_all(xml_content.as_bytes())?;

    let docx_bytes = zip.finish()?.into_inner();

    let mut temp_file = NamedTempFile::with_suffix(".docx")?;
    temp_file.write_all(&docx_bytes)?;
    temp_file.flush()?;

    let doc = DocumentParser::parse_file(temp_file.path())
        .map_err(|e| format!("DOCX parse error: {}", e))?;

    assert_eq!(doc.title, "System Requirements");
    assert!(!doc.sections.is_empty());
    assert!(doc.raw_text.contains("system requirements"));
    println!("   - Title: {}", doc.title);
    println!("   - Sections: {}", doc.sections.len());
    println!("   - Text length: {} chars", doc.raw_text.len());

    Ok(())
}

fn test_pdf_error() -> Result<(), Box<dyn std::error::Error>> {
    // Test that invalid PDF data produces appropriate error
    let mut temp_file = NamedTempFile::with_suffix(".pdf")?;
    temp_file.write_all(b"This is not a valid PDF file")?;
    temp_file.flush()?;

    let result = DocumentParser::parse_file(temp_file.path());
    assert!(result.is_err());
    let error = result.unwrap_err();
    assert!(error.contains("corrupt") || error.contains("encrypted") || error.contains("Failed"));
    println!("   - Correctly detected invalid PDF: {}", error);

    Ok(())
}
