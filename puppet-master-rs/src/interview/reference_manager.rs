//! Reference material management for interview context.
//!
//! Manages user-provided reference materials (links, files, photos, folders)
//! that guide the interview process.

use anyhow::{Context, Result};
use log::{debug, info, warn};
use std::fs;
use std::path::{Path, PathBuf};

/// Types of reference materials that can be provided.
#[derive(Debug, Clone)]
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

/// A single reference material item.
#[derive(Debug, Clone)]
pub struct ReferenceMaterial {
    /// Type and location of the reference.
    pub ref_type: ReferenceType,
    /// Optional user-provided description.
    pub description: Option<String>,
    /// When this was added.
    pub added_at: String,
}

/// Manages a collection of reference materials for the interview.
pub struct ReferenceManager {
    materials: Vec<ReferenceMaterial>,
    /// Maximum size of individual files to include (in bytes).
    max_file_size: usize,
    /// Maximum number of files to include from directories.
    max_directory_files: usize,
}

impl ReferenceManager {
    /// Creates a new empty reference manager.
    pub fn new() -> Self {
        Self {
            materials: Vec::new(),
            max_file_size: 1024 * 1024, // 1MB default
            max_directory_files: 50,    // 50 files max
        }
    }

    /// Sets the maximum file size to include (in bytes).
    pub fn with_max_file_size(mut self, size: usize) -> Self {
        self.max_file_size = size;
        self
    }

    /// Sets the maximum number of files to include from directories.
    pub fn with_max_directory_files(mut self, count: usize) -> Self {
        self.max_directory_files = count;
        self
    }

    /// Adds a new reference material.
    pub fn add(&mut self, material: ReferenceMaterial) {
        debug!("Added reference material: {:?}", material.ref_type);
        self.materials.push(material);
    }

    /// Returns all reference materials.
    pub fn materials(&self) -> &[ReferenceMaterial] {
        &self.materials
    }

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
                    context.push_str("*Note: URL content fetching not implemented - please provide local files or describe content*\n\n");
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
                        context.push_str(&format!(
                            "*Image file present: {} bytes*\n\n",
                            fs::metadata(path).map(|m| m.len()).unwrap_or(0)
                        ));
                        context.push_str("*Note: Image analysis/OCR not yet implemented - please describe image content or extract text manually*\n\n");
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
}
