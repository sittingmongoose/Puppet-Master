# Start Chain Module - Implementation Checklist

**Goal:** Fix critical gaps to reach 100% feature parity with TypeScript

---

## 🔴 CRITICAL: Document Parser Support (BLOCKER)

### Task 1: Add DOCX Parser Support

**Status:** ❌ TODO  
**Priority:** P0 (BLOCKER)  
**Estimated Time:** 4-6 hours

#### Steps:

1. **Add dependency to Cargo.toml**
   ```toml
   [dependencies]
   # Option 1: docx-rs (pure Rust)
   docx-rs = "0.4"
   
   # Option 2: If docx-rs doesn't work well, try:
   # zip = "0.6"
   # quick-xml = "0.31"
   # (and implement custom DOCX parser)
   ```

2. **Implement in `document_parser.rs`**
   ```rust
   /// Parses a DOCX document.
   pub fn parse_docx(content: &[u8]) -> Result<ParsedDocument, String> {
       // Use docx-rs to read content
       // Extract:
       // - Document title from first heading
       // - Sections from heading hierarchy
       // - List items (bullet and numbered)
       // - Paragraphs as content
       
       // Return ParsedDocument with sections
   }
   ```

3. **Add tests**
   ```rust
   #[test]
   fn test_parse_docx_simple() { ... }
   
   #[test]
   fn test_parse_docx_with_lists() { ... }
   
   #[test]
   fn test_parse_docx_nested_sections() { ... }
   ```

4. **Create test DOCX files**
   - `tests/fixtures/simple.docx`
   - `tests/fixtures/requirements.docx`

5. **Update public API**
   ```rust
   // In mod.rs
   pub use document_parser::{DocumentParser, ParsedDocument, ...};
   ```

**Acceptance Criteria:**
- [ ] DOCX files can be parsed into ParsedDocument
- [ ] Headings map to sections
- [ ] Lists are extracted correctly
- [ ] Tests pass with real DOCX files
- [ ] Error handling for corrupt files

---

### Task 2: Add PDF Parser Support

**Status:** ❌ TODO  
**Priority:** P0 (BLOCKER)  
**Estimated Time:** 4-6 hours

#### Steps:

1. **Add dependency to Cargo.toml**
   ```toml
   [dependencies]
   # Option 1: lopdf (low-level)
   lopdf = "0.31"
   
   # Option 2: pdf-extract (higher-level)
   pdf-extract = "0.7"
   
   # Recommended: pdf-extract for easier text extraction
   ```

2. **Implement in `document_parser.rs`**
   ```rust
   /// Parses a PDF document.
   pub fn parse_pdf(content: &[u8]) -> Result<ParsedDocument, String> {
       // Use pdf-extract to read text
       // Extract:
       // - Raw text content
       // - Try to infer structure from:
       //   - Font sizes (larger = headings)
       //   - Indentation (list items)
       //   - Line breaks (sections)
       
       // Return ParsedDocument with sections
   }
   ```

3. **Implement heuristics for structure detection**
   ```rust
   fn infer_pdf_structure(text: &str) -> Vec<DocumentSection> {
       // Look for:
       // - ALL CAPS lines → headings
       // - Numbered lines → ordered lists
       // - Lines starting with bullets/dashes → lists
       // - Empty lines → section breaks
   }
   ```

4. **Add tests**
   ```rust
   #[test]
   fn test_parse_pdf_simple() { ... }
   
   #[test]
   fn test_parse_pdf_with_structure() { ... }
   
   #[test]
   fn test_parse_pdf_text_only() { ... }
   ```

5. **Create test PDF files**
   - `tests/fixtures/simple.pdf`
   - `tests/fixtures/requirements.pdf`

**Acceptance Criteria:**
- [ ] PDF files can be parsed into ParsedDocument
- [ ] Text extraction works
- [ ] Basic structure detection (headings, lists)
- [ ] Tests pass with real PDF files
- [ ] Error handling for encrypted/corrupt PDFs

---

### Task 3: Update DocumentParser API

**Status:** ❌ TODO  
**Priority:** P0 (BLOCKER)  
**Estimated Time:** 1-2 hours

#### Steps:

1. **Add format detection**
   ```rust
   impl DocumentParser {
       /// Auto-detect format and parse
       pub fn parse_auto(path: &Path, content: &[u8]) -> Result<ParsedDocument, String> {
           let ext = path.extension()
               .and_then(|s| s.to_str())
               .unwrap_or("");
           
           match ext.to_lowercase().as_str() {
               "md" | "markdown" => Self::parse_markdown(std::str::from_utf8(content)?),
               "txt" => Self::parse_plain_text(std::str::from_utf8(content)?),
               "docx" => Self::parse_docx(content),
               "pdf" => Self::parse_pdf(content),
               _ => Err(format!("Unsupported format: {}", ext)),
           }
       }
   }
   ```

2. **Update existing callers**
   ```rust
   // In requirements_parser.rs or wherever documents are loaded
   let content = tokio::fs::read(&path).await?;
   let doc = DocumentParser::parse_auto(&path, &content)?;
   ```

**Acceptance Criteria:**
- [ ] All 4 formats supported (md, txt, docx, pdf)
- [ ] Auto-detection by file extension
- [ ] Consistent ParsedDocument output
- [ ] Error messages for unsupported formats

---

## 🟡 HIGH PRIORITY: Integration Tests

### Task 4: End-to-End Document Parsing Tests

**Status:** ❌ TODO  
**Priority:** P1  
**Estimated Time:** 2-3 hours

#### Steps:

1. **Create test fixtures directory**
   ```
   tests/
     fixtures/
       requirements.md
       requirements.txt
       requirements.docx
       requirements.pdf
       prd_example.json
   ```

2. **Add integration tests**
   ```rust
   // tests/document_parsing_integration.rs
   
   #[tokio::test]
   async fn test_parse_all_formats() {
       // Test parsing each format
       // Verify output structure
       // Compare results across formats
   }
   
   #[tokio::test]
   async fn test_requirements_to_prd_workflow() {
       // Parse requirements
       // Generate PRD
       // Validate PRD
       // Assert complete workflow
   }
   ```

**Acceptance Criteria:**
- [ ] Integration tests for all 4 formats
- [ ] End-to-end workflow tests
- [ ] Fixtures for realistic documents
- [ ] All tests pass

---

### Task 5: Full PRD Generation Workflow Test

**Status:** ❌ TODO  
**Priority:** P1  
**Estimated Time:** 2 hours

#### Steps:

1. **Create comprehensive test**
   ```rust
   #[tokio::test]
   async fn test_complete_prd_workflow() {
       // 1. Parse requirements (MD)
       let reqs = RequirementsParser::parse_file(Path::new("tests/fixtures/requirements.md")).await?;
       
       // 2. Generate PRD
       let prd = PrdGenerator::generate("Test Project", &reqs)?;
       
       // 3. Run validators
       let coverage = CoverageValidator::validate(&prd, &["REQ-001", "REQ-002"])?;
       let quality = QualityValidator::validate(&prd)?;
       
       // 4. Generate plans
       let test_plan = TestPlanGenerator::generate_from_prd(&prd)?;
       let tier_plan = TierPlanGenerator::generate(&prd)?;
       
       // 5. Create traceability
       let matrix = TraceabilityMatrix::from_prd(&prd, &req_ids);
       
       // Assert everything worked
       assert!(prd.phases.len() > 0);
       assert!(coverage.passed);
       assert!(quality.passed);
   }
   ```

**Acceptance Criteria:**
- [ ] Complete workflow from requirements to plans
- [ ] All validators run successfully
- [ ] Traceability matrix generated
- [ ] Test passes consistently

---

## 🟢 NICE TO HAVE: Enhancements

### Task 6: Custom Error Types

**Status:** ❌ TODO  
**Priority:** P2  
**Estimated Time:** 3-4 hours

#### Steps:

1. **Add thiserror dependency**
   ```toml
   [dependencies]
   thiserror = "1.0"
   ```

2. **Create error types**
   ```rust
   // src/start_chain/errors.rs
   
   use thiserror::Error;
   
   #[derive(Error, Debug)]
   pub enum DocumentParseError {
       #[error("Unsupported document format: {0}")]
       UnsupportedFormat(String),
       
       #[error("Failed to parse {format}: {source}")]
       ParseError {
           format: String,
           source: Box<dyn std::error::Error + Send + Sync>,
       },
       
       #[error("Document is empty or invalid")]
       EmptyDocument,
   }
   
   #[derive(Error, Debug)]
   pub enum ValidationError {
       #[error("PRD validation failed: {0}")]
       ValidationFailed(String),
       
       #[error("Missing required field: {0}")]
       MissingField(String),
   }
   ```

3. **Replace String errors**
   ```rust
   // Before
   pub fn parse_markdown(content: &str) -> Result<ParsedDocument, String>
   
   // After
   pub fn parse_markdown(content: &str) -> Result<ParsedDocument, DocumentParseError>
   ```

**Acceptance Criteria:**
- [ ] All error types defined
- [ ] All Result<T, String> replaced
- [ ] Error context preserved
- [ ] Tests updated

---

### Task 7: Criterion Benchmarks

**Status:** ❌ TODO  
**Priority:** P2  
**Estimated Time:** 2-3 hours

#### Steps:

1. **Add criterion dependency**
   ```toml
   [dev-dependencies]
   criterion = { version = "0.5", features = ["html_reports"] }
   
   [[bench]]
   name = "document_parsing"
   harness = false
   ```

2. **Create benchmarks**
   ```rust
   // benches/document_parsing.rs
   
   use criterion::{black_box, criterion_group, criterion_main, Criterion};
   use puppet_master_rs::start_chain::DocumentParser;
   
   fn bench_parse_markdown(c: &mut Criterion) {
       let content = include_str!("../tests/fixtures/large_requirements.md");
       
       c.bench_function("parse_markdown", |b| {
           b.iter(|| DocumentParser::parse_markdown(black_box(content)))
       });
   }
   
   criterion_group!(benches, bench_parse_markdown);
   criterion_main!(benches);
   ```

**Acceptance Criteria:**
- [ ] Benchmarks for all parsers
- [ ] Benchmarks for PRD generation
- [ ] HTML reports generated
- [ ] Baseline performance documented

---

## Progress Tracking

### Overall Progress: 14/20 (70%)

- [x] architecture_generator.rs ✅
- [x] criterion_classifier.rs ✅
- [x] criterion_to_script.rs ✅
- [ ] document_parser.rs - **NEEDS DOCX/PDF**
- [x] multi_pass_generator.rs ✅
- [x] prd_generator.rs ✅
- [x] prd_validators.rs ✅
- [x] prompt_templates.rs ✅
- [x] requirements_interviewer.rs ✅
- [x] requirements_parser.rs ✅
- [x] structure_detector.rs ✅
- [x] test_plan_generator.rs ✅
- [x] tier_plan_generator.rs ✅
- [x] traceability.rs ✅
- [x] validation_gate.rs ✅
- [x] mod.rs ✅
- [ ] **DOCX parser** ❌
- [ ] **PDF parser** ❌
- [ ] **Integration tests** ❌
- [ ] **Error types** ❌

---

## Effort Estimate

| Task | Priority | Hours | Status |
|------|----------|-------|--------|
| DOCX parser | P0 | 4-6 | ❌ TODO |
| PDF parser | P0 | 4-6 | ❌ TODO |
| Update API | P0 | 1-2 | ❌ TODO |
| Integration tests | P1 | 2-3 | ❌ TODO |
| Workflow tests | P1 | 2 | ❌ TODO |
| Error types | P2 | 3-4 | ❌ TODO |
| Benchmarks | P2 | 2-3 | ❌ TODO |
| **TOTAL** | | **18-26** | |

**Critical Path (P0):** 9-14 hours  
**Full Completion (P0-P2):** 18-26 hours

---

## Success Criteria

### Minimum (P0 - BLOCKER Resolution)
- [ ] DOCX files can be parsed
- [ ] PDF files can be parsed
- [ ] All 4 formats (md, txt, docx, pdf) work
- [ ] Existing tests still pass
- [ ] Basic integration test for each format

### Complete (P0-P1)
- [ ] All P0 items done
- [ ] Comprehensive integration tests
- [ ] Full workflow tests (requirements → PRD → plans)
- [ ] Test coverage > 85%

### Excellent (P0-P2)
- [ ] All P0-P1 items done
- [ ] Custom error types throughout
- [ ] Criterion benchmarks for parsers
- [ ] Performance baselines documented
- [ ] 100% feature parity with TypeScript

---

## Next Steps

1. **Start with DOCX parser** (highest impact)
2. **Then PDF parser** (completes format support)
3. **Add integration tests** (ensures quality)
4. **Optional: Error types + benchmarks** (polish)

After P0 completion, module will be **production-ready** and fully compliant with REQUIREMENTS.md §5.
