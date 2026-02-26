//! Reference material management for interview context.
//!
//! Manages user-provided reference materials (links, files, photos, folders)
//! that guide the interview process.

use anyhow::{Context, Result};
use log::{debug, info, warn};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::time::Duration;

// DRY:DATA:ReferenceType
/// Types of reference materials that can be provided.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReferenceType {
    /// URL to documentation or article.
    Link(String),
    /// Local file path.
    File(PathBuf),
    /// Image file (screenshot, diagram, photo).
    Image(PathBuf),
    /// Directory containing multiple reference files.
    Directory(PathBuf),
}

// DRY:DATA:ReferenceMaterial
/// A single reference material item.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferenceMaterial {
    /// Type and location of the reference.
    pub ref_type: ReferenceType,
    /// Optional user-provided description.
    pub description: Option<String>,
    /// When this was added.
    pub added_at: String,
}

/// Image metadata extracted from file
#[derive(Debug, Clone)]
struct ImageMetadata {
    filename: String,
    size_bytes: u64,
    mime_type: String,
    dimensions: Option<(u32, u32)>,
    hash: String,
}

// DRY:DATA:ReferenceManager
/// Manages a collection of reference materials for the interview.
pub struct ReferenceManager {
    materials: Vec<ReferenceMaterial>,
    /// Maximum size of individual files to include (in bytes).
    max_file_size: usize,
    /// Maximum number of files to include from directories.
    max_directory_files: usize,
    /// HTTP timeout for URL fetching (in seconds).
    http_timeout_secs: u64,
    /// Maximum size for fetched URL content (in bytes).
    max_url_size: usize,
    /// Maximum image size for OCR processing (in bytes).
    max_ocr_image_size: usize,
    /// OCR operation timeout (in seconds).
    ocr_timeout_secs: u64,
}

impl ReferenceManager {
    // DRY:FN:new
    /// Creates a new empty reference manager.
    pub fn new() -> Self {
        Self {
            materials: Vec::new(),
            max_file_size: 1024 * 1024,           // 1MB default
            max_directory_files: 50,              // 50 files max
            http_timeout_secs: 10,                // 10 second timeout for HTTP requests
            max_url_size: 512 * 1024,             // 512KB max for URL content
            max_ocr_image_size: 10 * 1024 * 1024, // 10MB max for OCR images
            ocr_timeout_secs: 30,                 // 30 second timeout for OCR operations
        }
    }

    // DRY:FN:with_max_file_size
    /// Sets the maximum file size to include (in bytes).
    pub fn with_max_file_size(mut self, size: usize) -> Self {
        self.max_file_size = size;
        self
    }

    // DRY:FN:with_max_directory_files
    /// Sets the maximum number of files to include from directories.
    pub fn with_max_directory_files(mut self, count: usize) -> Self {
        self.max_directory_files = count;
        self
    }

    // DRY:FN:with_http_timeout_secs
    /// Sets the HTTP timeout for URL fetching (in seconds).
    pub fn with_http_timeout_secs(mut self, secs: u64) -> Self {
        self.http_timeout_secs = secs;
        self
    }

    // DRY:FN:with_max_url_size
    /// Sets the maximum size for fetched URL content (in bytes).
    pub fn with_max_url_size(mut self, size: usize) -> Self {
        self.max_url_size = size;
        self
    }

    // DRY:FN:with_max_ocr_image_size
    /// Sets the maximum image size for OCR processing (in bytes).
    pub fn with_max_ocr_image_size(mut self, size: usize) -> Self {
        self.max_ocr_image_size = size;
        self
    }

    // DRY:FN:with_ocr_timeout_secs
    /// Sets the OCR operation timeout (in seconds).
    pub fn with_ocr_timeout_secs(mut self, secs: u64) -> Self {
        self.ocr_timeout_secs = secs;
        self
    }

    /// Returns a list of vision-capable platforms from the model catalog.
    /// This can be used to filter UI options based on actual capabilities.
    // DRY:FN:get_vision_capable_platforms -- Returns all platforms that support images via platform_specs
    pub fn get_vision_capable_platforms() -> Vec<String> {
        crate::platforms::platform_specs::image_capable_platforms()
            .into_iter()
            .map(|p| p.to_string().to_lowercase())
            .collect()
    }

    // DRY:FN:derive_context_files
    /// Derives context file paths from reference materials for platform runners.
    ///
    /// We include:
    /// - explicit File/Image references
    /// - image files from Directory references (non-recursive, capped)
    pub fn derive_context_files(materials: &[ReferenceMaterial]) -> Vec<String> {
        use std::collections::HashSet;

        fn is_image(path: &Path) -> bool {
            let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
                return false;
            };
            matches!(
                ext.to_ascii_lowercase().as_str(),
                "png" | "jpg" | "jpeg" | "gif" | "webp"
            )
        }

        let mut out: Vec<String> = Vec::new();
        let mut seen: HashSet<String> = HashSet::new();

        for m in materials {
            match &m.ref_type {
                ReferenceType::Link(_) => {}
                ReferenceType::File(p) | ReferenceType::Image(p) => {
                    let p = std::fs::canonicalize(p).unwrap_or_else(|_| p.clone());
                    let s = p.to_string_lossy().to_string();
                    if seen.insert(s.clone()) {
                        out.push(s);
                    }
                }
                ReferenceType::Directory(dir) => {
                    let Ok(entries) = std::fs::read_dir(dir) else {
                        continue;
                    };
                    for entry in entries.flatten().take(50) {
                        let path = entry.path();
                        if path.is_file() && is_image(&path) {
                            let p = std::fs::canonicalize(&path).unwrap_or(path);
                            let s = p.to_string_lossy().to_string();
                            if seen.insert(s.clone()) {
                                out.push(s);
                            }
                        }
                    }
                }
            }
        }

        out
    }

    // DRY:FN:add
    /// Adds a new reference material.
    pub fn add(&mut self, material: ReferenceMaterial) {
        debug!("Added reference material: {:?}", material.ref_type);
        self.materials.push(material);
    }

    // DRY:FN:materials
    /// Returns all reference materials.
    pub fn materials(&self) -> &[ReferenceMaterial] {
        &self.materials
    }

    // DRY:FN:load_context
    /// Loads content from all reference materials into a single context string.
    ///
    /// Reads files, lists directories, and includes snippets with safe error handling.
    pub fn load_context(&self) -> Result<String> {
        let mut context = String::new();

        context.push_str("# Reference Materials\n\n");

        if self.materials.is_empty() {
            context.push_str("*No reference materials provided*\n\n");
            return Ok(context);
        }

        for (i, material) in self.materials.iter().enumerate() {
            context.push_str(&format!("## Reference {}\n\n", i + 1));
            context.push_str(&format!("**Added:** {}\n\n", material.added_at));

            if let Some(desc) = &material.description {
                context.push_str(&format!("**Description:** {desc}\n\n"));
            }

            match &material.ref_type {
                ReferenceType::Link(url) => {
                    context.push_str(&format!("**Link:** {url}\n\n"));
                    // Best-effort URL fetching
                    match self.fetch_url_content(url) {
                        Ok(content) => {
                            context.push_str("**Fetched Content:**\n");
                            context.push_str("```\n");
                            context.push_str(&content);
                            context.push_str("\n```\n\n");
                        }
                        Err(e) => {
                            warn!("Failed to fetch URL {}: {}", url, e);
                            context.push_str(&format!(
                                "*Note: Unable to fetch URL content ({}). Please provide summary or local copy if critical.*\n\n",
                                e
                            ));
                        }
                    }
                }
                ReferenceType::File(path) => match self.load_file_content(path) {
                    Ok(content) => {
                        context.push_str(&format!("**File:** {}\n\n", path.display()));
                        context.push_str("```\n");
                        context.push_str(&content);
                        context.push_str("\n```\n\n");
                    }
                    Err(e) => {
                        warn!("Failed to load file {}: {}", path.display(), e);
                        context.push_str(&format!(
                            "**File:** {} *(failed to load: {})*\n\n",
                            path.display(),
                            e
                        ));
                    }
                },
                ReferenceType::Image(path) => {
                    context.push_str(&format!("**Image:** {}\n\n", path.display()));

                    // Check if file exists
                    if path.exists() {
                        // Extract comprehensive metadata
                        match self.extract_image_metadata(path) {
                            Ok(metadata) => {
                                // Always include metadata
                                context.push_str(&format!(
                                    "**Image Metadata:**\n\
                                     - Filename: {}\n\
                                     - Size: {} bytes\n\
                                     - Type: {}\n",
                                    metadata.filename, metadata.size_bytes, metadata.mime_type
                                ));

                                if let Some((width, height)) = metadata.dimensions {
                                    context
                                        .push_str(&format!("- Dimensions: {}x{}\n", width, height));
                                }

                                context.push_str(&format!("- Hash: {}\n\n", metadata.hash));

                                // Try OCR extraction (best effort)
                                match self.extract_image_text_async(path) {
                                    Ok(text) if !text.trim().is_empty() => {
                                        context.push_str("**Extracted Text (OCR):**\n");
                                        context.push_str("```\n");
                                        context.push_str(&text);
                                        context.push_str("\n```\n\n");
                                    }
                                    Ok(_) => {
                                        context.push_str(
                                            "*Note: OCR completed but no text detected in image*\n\n",
                                        );
                                    }
                                    Err(e) => {
                                        debug!(
                                            "OCR extraction failed for {}: {}",
                                            path.display(),
                                            e
                                        );
                                        context.push_str(&format!(
                                            "*Note: OCR not available ({})*\n\n",
                                            e
                                        ));
                                    }
                                }
                            }
                            Err(e) => {
                                warn!("Failed to extract image metadata: {}", e);
                                context.push_str(&format!(
                                    "*Error: Unable to read image metadata ({})*\n\n",
                                    e
                                ));
                            }
                        }
                    } else {
                        context.push_str("*Error: Image file not found*\n\n");
                    }
                }
                ReferenceType::Directory(path) => match self.load_directory_listing(path) {
                    Ok(listing) => {
                        context.push_str(&format!("**Directory:** {}\n\n", path.display()));
                        context.push_str(&listing);
                    }
                    Err(e) => {
                        warn!("Failed to list directory {}: {}", path.display(), e);
                        context.push_str(&format!(
                            "**Directory:** {} *(failed to list: {})*\n\n",
                            path.display(),
                            e
                        ));
                    }
                },
            }
        }

        Ok(context)
    }

    /// Loads content from a text file with size and encoding safety.
    fn load_file_content(&self, path: &Path) -> Result<String> {
        // Check if file exists
        if !path.exists() {
            anyhow::bail!("File not found");
        }

        // Check if it's a PDF file
        if let Some(ext) = path.extension() {
            if ext.to_string_lossy().to_lowercase() == "pdf" {
                return self.extract_pdf_content(path);
            }
        }

        // Check file size
        let metadata = fs::metadata(path).context("Failed to read file metadata")?;

        if metadata.len() > self.max_file_size as u64 {
            return Ok(format!(
                "[File too large: {} bytes (max: {} bytes). Showing first {} characters...]\n{}",
                metadata.len(),
                self.max_file_size,
                self.max_file_size / 2,
                self.load_file_snippet(path, self.max_file_size / 2)?
            ));
        }

        // Try to read as UTF-8
        match fs::read_to_string(path) {
            Ok(content) => {
                // Check for manifest files and extract key info
                if self.is_manifest_file(path) {
                    Ok(self.extract_manifest_data(path, &content))
                } else {
                    Ok(content)
                }
            }
            Err(_) => {
                // Not valid UTF-8, report as binary
                anyhow::bail!("Binary file (not UTF-8 text)")
            }
        }
    }

    /// Loads a snippet from a file (first n bytes).
    fn load_file_snippet(&self, path: &Path, max_bytes: usize) -> Result<String> {
        let content = fs::read_to_string(path).context("Failed to read file")?;

        let truncated: String = content.chars().take(max_bytes).collect();
        Ok(truncated)
    }

    /// Checks if a file is a known manifest/config file.
    fn is_manifest_file(&self, path: &Path) -> bool {
        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            matches!(
                name.to_lowercase().as_str(),
                "cargo.toml"
                    | "package.json"
                    | "requirements.txt"
                    | "gemfile"
                    | "pom.xml"
                    | "build.gradle"
                    | "go.mod"
                    | "pyproject.toml"
                    | "composer.json"
                    | "package-lock.json"
                    | "cargo.lock"
                    | "pipfile"
                    | "yarn.lock"
            )
        } else {
            false
        }
    }

    /// Extracts key data from manifest files.
    fn extract_manifest_data(&self, path: &Path, content: &str) -> String {
        let mut result = String::new();

        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            result.push_str(&format!("=== {} MANIFEST ===\n\n", name.to_uppercase()));

            match name.to_lowercase().as_str() {
                "cargo.toml" => {
                    result.push_str("Key Dependencies:\n");
                    for line in content.lines() {
                        if line.contains("version =") || line.contains("features =") {
                            result.push_str(&format!("  {}\n", line.trim()));
                        }
                    }
                }
                "package.json" => {
                    result.push_str("Key Package Info:\n");
                    let in_deps = content.contains("\"dependencies\"");
                    let in_devdeps = content.contains("\"devDependencies\"");
                    if in_deps || in_devdeps {
                        result.push_str("  (Dependencies section found)\n");
                    }
                    for line in content.lines() {
                        if line.contains("\"name\":")
                            || line.contains("\"version\":")
                            || line.contains("\"scripts\":")
                        {
                            result.push_str(&format!("  {}\n", line.trim()));
                        }
                    }
                }
                "requirements.txt" | "pipfile" => {
                    result.push_str("Python Dependencies:\n");
                    for line in content.lines().take(20) {
                        if !line.trim().is_empty() && !line.starts_with('#') {
                            result.push_str(&format!("  {}\n", line.trim()));
                        }
                    }
                }
                _ => {
                    result.push_str("(Manifest file detected - showing full content below)\n");
                }
            }

            result.push_str("\nFull Content:\n");
            result.push_str(content);
        }

        result
    }

    /// Lists directory contents with file metadata.
    fn load_directory_listing(&self, path: &Path) -> Result<String> {
        if !path.exists() {
            anyhow::bail!("Directory not found");
        }

        if !path.is_dir() {
            anyhow::bail!("Path is not a directory");
        }

        let mut listing = String::new();
        listing.push_str("### Directory Contents\n\n");

        let entries = fs::read_dir(path)
            .context("Failed to read directory")?
            .filter_map(|e| e.ok())
            .take(self.max_directory_files)
            .collect::<Vec<_>>();

        if entries.is_empty() {
            listing.push_str("*(Empty directory)*\n\n");
            return Ok(listing);
        }

        // Count files and directories
        let mut files = Vec::new();
        let mut dirs = Vec::new();

        for entry in entries {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            if path.is_dir() {
                dirs.push(name);
            } else {
                let size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
                files.push((name, size));
            }
        }

        // List directories first
        if !dirs.is_empty() {
            listing.push_str("**Subdirectories:**\n");
            for dir in dirs {
                listing.push_str(&format!("- [DIR] {}/\n", dir));
            }
            listing.push('\n');
        }

        // List files
        if !files.is_empty() {
            listing.push_str("**Files:**\n");
            for (name, size) in files {
                listing.push_str(&format!("- [FILE] {} ({} bytes)\n", name, size));

                // Try to include snippet for small text files
                let file_path = path.join(&name);
                if size < 10_000 && self.is_text_file(&file_path) {
                    if let Ok(snippet) = self.load_file_snippet(&file_path, 200) {
                        let preview: String =
                            snippet.lines().take(3).collect::<Vec<_>>().join("\n");
                        if !preview.trim().is_empty() {
                            listing.push_str(&format!(
                                "  ```\n  {}\n  ```\n",
                                preview.replace('\n', "\n  ")
                            ));
                        }
                    }
                }
            }
            listing.push('\n');
        }

        Ok(listing)
    }

    /// Checks if a file is likely a text file based on extension.
    fn is_text_file(&self, path: &Path) -> bool {
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            matches!(
                ext.to_lowercase().as_str(),
                "txt"
                    | "md"
                    | "rs"
                    | "js"
                    | "ts"
                    | "py"
                    | "go"
                    | "java"
                    | "c"
                    | "cpp"
                    | "h"
                    | "hpp"
                    | "json"
                    | "yaml"
                    | "yml"
                    | "toml"
                    | "xml"
                    | "html"
                    | "css"
                    | "sh"
                    | "bash"
                    | "zsh"
                    | "fish"
                    | "dockerfile"
                    | "makefile"
                    | "cmake"
                    | "gitignore"
                    | "env"
            )
        } else {
            // Files without extension might be text (README, LICENSE, etc.)
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                matches!(
                    name.to_uppercase().as_str(),
                    "README" | "LICENSE" | "MAKEFILE" | "DOCKERFILE" | "CHANGELOG"
                )
            } else {
                false
            }
        }
    }

    /// Fetches content from a URL with timeout and size limits.
    ///
    /// This is a best-effort operation - it will gracefully fail if:
    /// - Network is unavailable
    /// - Request times out
    /// - Response is too large
    /// - Content is not text-based
    fn fetch_url_content(&self, url: &str) -> Result<String> {
        // Use a blocking request since we're in a sync context
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(self.http_timeout_secs))
            .user_agent("puppet-master/0.1")
            .build()
            .context("Failed to create HTTP client")?;

        let response = client
            .get(url)
            .send()
            .context("Failed to send HTTP request")?;

        if !response.status().is_success() {
            anyhow::bail!("HTTP error: {}", response.status());
        }

        // Check content length if available
        if let Some(content_length) = response.content_length() {
            if content_length > self.max_url_size as u64 {
                anyhow::bail!(
                    "Response too large: {} bytes (max: {} bytes)",
                    content_length,
                    self.max_url_size
                );
            }
        }

        // Read response with size limit
        let mut content = String::new();
        let mut limited_reader = response.take(self.max_url_size as u64);
        std::io::Read::read_to_string(&mut limited_reader, &mut content)
            .context("Failed to read response body")?;

        // Truncate to reasonable length if needed
        if content.len() > self.max_url_size {
            content.truncate(self.max_url_size);
            content.push_str("\n\n[Content truncated...]");
        }

        // Basic cleanup - remove excessive whitespace and script tags
        let content = self.clean_html_content(&content);

        Ok(content)
    }

    /// Basic HTML cleanup for fetched content.
    fn clean_html_content(&self, content: &str) -> String {
        let mut cleaned = content.to_string();

        // Remove script tags and their content
        while let Some(start) = cleaned.find("<script") {
            if let Some(end) = cleaned[start..].find("</script>") {
                cleaned.replace_range(start..start + end + 9, "");
            } else {
                break;
            }
        }

        // Remove style tags and their content
        while let Some(start) = cleaned.find("<style") {
            if let Some(end) = cleaned[start..].find("</style>") {
                cleaned.replace_range(start..start + end + 8, "");
            } else {
                break;
            }
        }

        // Basic HTML tag stripping (very simple - doesn't handle all cases)
        let mut result = String::new();
        let mut in_tag = false;
        for ch in cleaned.chars() {
            match ch {
                '<' => in_tag = true,
                '>' => in_tag = false,
                _ if !in_tag => result.push(ch),
                _ => {}
            }
        }

        // Collapse multiple blank lines
        let mut final_result = String::new();
        let mut prev_blank = false;
        for line in result.lines() {
            let is_blank = line.trim().is_empty();
            if !is_blank || !prev_blank {
                final_result.push_str(line);
                final_result.push('\n');
            }
            prev_blank = is_blank;
        }

        final_result.trim().to_string()
    }

    /// Extracts text content from a PDF file.
    ///
    /// Respects max_file_size limit and provides graceful error handling.
    fn extract_pdf_content(&self, path: &Path) -> Result<String> {
        // Check file size first
        let metadata = fs::metadata(path).context("Failed to read PDF metadata")?;

        if metadata.len() > self.max_file_size as u64 {
            return Ok(format!(
                "[PDF too large: {} bytes (max: {} bytes). Please provide a smaller file or summary.]",
                metadata.len(),
                self.max_file_size
            ));
        }

        // Try to extract text from PDF
        match pdf_extract::extract_text(path) {
            Ok(text) => {
                // Apply size limit to extracted text
                if text.len() > self.max_file_size {
                    let truncated: String = text.chars().take(self.max_file_size).collect();
                    Ok(format!(
                        "{}\n\n[PDF content truncated at {} characters]",
                        truncated, self.max_file_size
                    ))
                } else {
                    Ok(format!("=== PDF CONTENT ===\n\n{}", text))
                }
            }
            Err(e) => {
                warn!("Failed to extract PDF text from {}: {}", path.display(), e);
                anyhow::bail!("PDF text extraction failed: {}", e)
            }
        }
    }

    /// Extracts comprehensive image metadata.
    ///
    /// Always returns: filename, size, mime type, hash
    /// Best effort: dimensions (requires valid image format)
    fn extract_image_metadata(&self, path: &Path) -> Result<ImageMetadata> {
        let metadata = fs::metadata(path).context("Failed to read file metadata")?;

        let filename = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let size_bytes = metadata.len();

        // Determine MIME type from extension
        let mime_type = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| match ext.to_lowercase().as_str() {
                "png" => "image/png",
                "jpg" | "jpeg" => "image/jpeg",
                "gif" => "image/gif",
                "bmp" => "image/bmp",
                "webp" => "image/webp",
                "svg" => "image/svg+xml",
                "tiff" | "tif" => "image/tiff",
                _ => "image/unknown",
            })
            .unwrap_or("image/unknown")
            .to_string();

        // Compute hash
        let mut file = fs::File::open(path).context("Failed to open file for hashing")?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)
            .context("Failed to read file for hashing")?;
        let hash = format!("{:x}", md5::compute(&buffer));

        // Try to extract dimensions using image crate
        let dimensions = image::image_dimensions(path).ok();

        Ok(ImageMetadata {
            filename,
            size_bytes,
            mime_type,
            dimensions,
            hash,
        })
    }

    /// Extracts text from an image using Tesseract OCR with enforced timeout.
    ///
    /// This is a best-effort operation that:
    /// - Checks for tesseract installation
    /// - Enforces size limits
    /// - **Enforces real timeout** using tokio::time::timeout
    /// - Returns graceful errors if OCR is unavailable or times out
    fn extract_image_text_async(&self, path: &Path) -> Result<String> {
        // Check file size first
        let metadata = fs::metadata(path).context("Failed to read image metadata")?;

        if metadata.len() > self.max_ocr_image_size as u64 {
            anyhow::bail!(
                "Image too large for OCR: {} bytes (max: {} bytes)",
                metadata.len(),
                self.max_ocr_image_size
            );
        }

        // Check if tesseract is available
        let tesseract_path = which::which("tesseract").context("tesseract not found in PATH")?;

        debug!("Found tesseract at: {}", tesseract_path.display());

        // Run tesseract with ENFORCED timeout using tokio
        let timeout_duration = Duration::from_secs(self.ocr_timeout_secs);
        let path_owned = path.to_owned();
        let tesseract_path_owned = tesseract_path.to_owned();

        // Block on async runtime to execute with timeout
        let output = tokio::runtime::Runtime::new()
            .context("Failed to create tokio runtime")?
            .block_on(async {
                tokio::time::timeout(timeout_duration, async {
                    tokio::process::Command::new(&tesseract_path_owned)
                        .arg(&path_owned)
                        .arg("stdout") // Output to stdout instead of file
                        .arg("-l")
                        .arg("eng") // English language (most common)
                        .arg("--psm")
                        .arg("3") // Page segmentation mode: Fully automatic
                        .arg("--oem")
                        .arg("3") // OCR Engine Mode: Default (LSTM + legacy)
                        .env("OMP_THREAD_LIMIT", "1") // Limit threads for safety
                        .output()
                        .await
                })
                .await
            });

        match output {
            Ok(Ok(output)) => {
                if !output.status.success() {
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    anyhow::bail!("tesseract failed: {}", stderr.trim());
                }

                // Get the extracted text
                let text = String::from_utf8_lossy(&output.stdout).to_string();

                // Basic cleanup: trim excessive whitespace
                let cleaned = text
                    .lines()
                    .map(|line| line.trim())
                    .filter(|line| !line.is_empty())
                    .collect::<Vec<_>>()
                    .join("\n");

                Ok(cleaned)
            }
            Ok(Err(e)) => {
                anyhow::bail!("Failed to execute tesseract: {}", e);
            }
            Err(_) => {
                anyhow::bail!(
                    "OCR operation timed out after {} seconds",
                    self.ocr_timeout_secs
                );
            }
        }
    }

    // DRY:FN:clear
    /// Clears all reference materials.
    pub fn clear(&mut self) {
        info!("Cleared all reference materials");
        self.materials.clear();
    }
}

impl Default for ReferenceManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_manager() {
        let mgr = ReferenceManager::new();
        assert!(mgr.materials().is_empty());
    }

    #[test]
    fn test_add_material() {
        let mut mgr = ReferenceManager::new();
        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::Link("https://example.com".to_string()),
            description: Some("Example docs".to_string()),
            added_at: chrono::Utc::now().to_rfc3339(),
        });
        assert_eq!(mgr.materials().len(), 1);
    }

    #[test]
    fn test_load_context() {
        let mut mgr = ReferenceManager::new();
        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::Link("https://rust-lang.org".to_string()),
            description: Some("Rust docs".to_string()),
            added_at: chrono::Utc::now().to_rfc3339(),
        });
        let context = mgr.load_context().unwrap();
        assert!(context.contains("Reference Materials"));
        assert!(context.contains("rust-lang.org"));
    }

    #[test]
    fn test_clear() {
        let mut mgr = ReferenceManager::new();
        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::File(PathBuf::from("/tmp/test.txt")),
            description: None,
            added_at: chrono::Utc::now().to_rfc3339(),
        });
        assert_eq!(mgr.materials().len(), 1);
        mgr.clear();
        assert!(mgr.materials().is_empty());
    }

    #[test]
    fn test_with_http_timeout() {
        let mgr = ReferenceManager::new().with_http_timeout_secs(5);
        assert_eq!(mgr.http_timeout_secs, 5);
    }

    #[test]
    fn test_with_max_url_size() {
        let mgr = ReferenceManager::new().with_max_url_size(1024);
        assert_eq!(mgr.max_url_size, 1024);
    }

    #[test]
    fn test_pdf_detection() {
        let pdf_path = PathBuf::from("test.pdf");
        let txt_path = PathBuf::from("test.txt");

        // PDF extension is lowercase
        assert_eq!(
            pdf_path
                .extension()
                .unwrap()
                .to_string_lossy()
                .to_lowercase(),
            "pdf"
        );
        assert_ne!(
            txt_path
                .extension()
                .unwrap()
                .to_string_lossy()
                .to_lowercase(),
            "pdf"
        );
    }

    #[test]
    fn test_html_cleanup() {
        let mgr = ReferenceManager::new();
        let html = r#"<html><body><script>alert('test');</script><p>Hello World</p></body></html>"#;
        let cleaned = mgr.clean_html_content(html);

        assert!(!cleaned.contains("<script>"));
        assert!(!cleaned.contains("alert"));
        assert!(cleaned.contains("Hello World"));
    }

    #[test]
    fn test_url_fetch_invalid_url() {
        let mgr = ReferenceManager::new().with_http_timeout_secs(1);

        // Test with invalid URL - should fail gracefully
        let result = mgr.fetch_url_content("not-a-valid-url");
        assert!(result.is_err());
    }

    #[test]
    fn test_load_context_with_invalid_pdf() {
        use std::io::Write;

        // Create a temporary "PDF" file that's not actually a PDF
        let temp_dir = std::env::temp_dir();
        let fake_pdf = temp_dir.join("fake_test.pdf");

        {
            let mut file = std::fs::File::create(&fake_pdf).unwrap();
            file.write_all(b"This is not a real PDF file").unwrap();
        }

        let mut mgr = ReferenceManager::new();
        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::File(fake_pdf.clone()),
            description: Some("Fake PDF for testing".to_string()),
            added_at: chrono::Utc::now().to_rfc3339(),
        });

        let context = mgr.load_context().unwrap();

        // Should mention the file but indicate it failed to load
        assert!(context.contains("fake_test.pdf"));
        assert!(context.contains("failed") || context.contains("extraction failed"));

        // Cleanup
        let _ = std::fs::remove_file(fake_pdf);
    }

    #[test]
    fn test_load_context_with_link_no_network() {
        let mut mgr = ReferenceManager::new().with_http_timeout_secs(1); // Short timeout

        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::Link(
                "http://definitely-not-a-real-domain-12345678.invalid".to_string(),
            ),
            description: Some("Test link that should fail".to_string()),
            added_at: chrono::Utc::now().to_rfc3339(),
        });

        let context = mgr.load_context().unwrap();

        // Should contain the URL and a note about failure
        assert!(context.contains("definitely-not-a-real-domain-12345678"));
        assert!(context.contains("Unable to fetch") || context.contains("failed"));
    }

    #[test]
    fn test_ocr_configuration() {
        let mgr = ReferenceManager::new()
            .with_max_ocr_image_size(5_000_000)
            .with_ocr_timeout_secs(60);

        assert_eq!(mgr.max_ocr_image_size, 5_000_000);
        assert_eq!(mgr.ocr_timeout_secs, 60);
    }

    #[test]
    fn test_image_reference_with_missing_file() {
        let mut mgr = ReferenceManager::new();
        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::Image(PathBuf::from("/nonexistent/image.png")),
            description: Some("Test image".to_string()),
            added_at: chrono::Utc::now().to_rfc3339(),
        });

        let context = mgr.load_context().unwrap();

        // Should mention the image and indicate it's not found
        assert!(context.contains("image.png"));
        assert!(context.contains("not found"));
    }

    #[test]
    fn test_image_reference_graceful_ocr_failure() {
        use std::io::Write;

        // Create a small dummy image file
        let temp_dir = std::env::temp_dir();
        let fake_image = temp_dir.join("test_ocr_image.png");

        {
            let mut file = std::fs::File::create(&fake_image).unwrap();
            // Write minimal PNG header (not a real image, but exists)
            file.write_all(&[137, 80, 78, 71, 13, 10, 26, 10]).unwrap();
        }

        let mut mgr = ReferenceManager::new();
        mgr.add(ReferenceMaterial {
            ref_type: ReferenceType::Image(fake_image.clone()),
            description: Some("Fake image for OCR testing".to_string()),
            added_at: chrono::Utc::now().to_rfc3339(),
        });

        let context = mgr.load_context().unwrap();

        // Should mention the image
        assert!(context.contains("test_ocr_image.png"));

        // If tesseract is not installed, should mention OCR not available
        // If tesseract is installed but fails on fake image, should still be graceful
        assert!(
            context.contains("OCR not available")
                || context.contains("no text detected")
                || context.contains("Extracted Text")
        );

        // Cleanup
        let _ = std::fs::remove_file(fake_image);
    }

    #[test]
    fn test_image_metadata_extraction() {
        use std::io::Write;

        // Create a small test image
        let temp_dir = std::env::temp_dir();
        let test_image = temp_dir.join("test_metadata.png");

        {
            // Create a minimal valid PNG (1x1 white pixel)
            let png_data = vec![
                137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
                0, 0, 0, 13, 73, 72, 68, 82, // IHDR chunk
                0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65,
                84, // IDAT chunk
                8, 215, 99, 248, 255, 255, 63, 0, 5, 254, 2, 254, 167, 53, 129, 132, 0, 0, 0, 0,
                73, 69, 78, 68, 174, 66, 96, 130, // IEND chunk
            ];
            let mut file = std::fs::File::create(&test_image).unwrap();
            file.write_all(&png_data).unwrap();
        }

        let mgr = ReferenceManager::new();
        let metadata = mgr.extract_image_metadata(&test_image).unwrap();

        // Verify metadata fields
        assert_eq!(metadata.filename, "test_metadata.png");
        assert!(metadata.size_bytes > 0);
        assert_eq!(metadata.mime_type, "image/png");
        assert!(metadata.dimensions.is_some());
        if let Some((w, h)) = metadata.dimensions {
            assert_eq!(w, 1);
            assert_eq!(h, 1);
        }
        assert!(!metadata.hash.is_empty());

        // Cleanup
        let _ = std::fs::remove_file(test_image);
    }

    #[test]
    fn test_ocr_timeout_config() {
        // Verify timeout can be configured
        let mgr = ReferenceManager::new().with_ocr_timeout_secs(5);
        assert_eq!(mgr.ocr_timeout_secs, 5);

        // Very short timeout should fail quickly if tesseract is available
        // but we won't test actual timeout in unit tests (would be flaky)
    }

    #[test]
    fn test_vision_capable_platforms() {
        // Test that we can query vision-capable platforms
        let platforms = ReferenceManager::get_vision_capable_platforms();

        // Should return a non-empty list
        assert!(
            !platforms.is_empty(),
            "Should have at least one vision-capable platform"
        );

        // Should include cursor (our default preference)
        assert!(
            platforms.contains(&"cursor".to_string()),
            "Cursor should be vision-capable"
        );

        // Should also include other known vision platforms
        assert!(
            platforms.contains(&"claude".to_string()),
            "Claude should be vision-capable"
        );

        // Codex supports image attachments via --image
        assert!(
            platforms.contains(&"codex".to_string()),
            "Codex should be vision-capable"
        );

        // All returned platforms should be lowercase
        for platform in &platforms {
            assert_eq!(platform, &platform.to_lowercase());
        }
    }
}
