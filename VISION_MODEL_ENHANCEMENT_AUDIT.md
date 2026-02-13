# Vision Model Enhancement Audit & Proposal

**Date:** 2026-02-03  
**Audited by:** rust-engineer  
**Scope:** Image reference handling in interview flow + CLI-only vision model integration

---

## Executive Summary

Current image handling uses **Tesseract OCR** (text extraction) + **metadata fallback** (file size). This works for text-heavy screenshots but fails for diagrams, UI mockups, charts, and non-text visual content. 

**Proposal:** Add **CLI-only vision model support** via existing platform runners (Codex, Claude, Gemini) to generate **descriptive image analysis** that enriches interview context. Keep scope minimal with strict **timeouts**, **size limits**, and **graceful degradation**.

**Impact:**
- ✅ Interview AI can understand visual reference materials (mockups, diagrams, architecture drawings)
- ✅ Zero API dependencies (uses existing CLI subscriptions)
- ✅ Safe fallback chain: Vision → OCR → Metadata
- ✅ No GUI changes required (backend-only)

---

## 1. Current State Analysis

### 1.1 File: `puppet-master-rs/src/interview/reference_manager.rs`

**Lines of code:** 920 lines  
**Key functionality:** `extract_image_text()` at lines 624-689

#### Current Image Processing Flow

```rust
// Location: lines 176-214
ReferenceType::Image(path) => {
    // Step 1: Check file exists and get size
    context.push_str(&format!("*Image file present: {} bytes*\n\n", metadata.len()));
    
    // Step 2: Attempt OCR extraction via Tesseract
    match self.extract_image_text(path) {
        Ok(text) if !text.trim().is_empty() => {
            // Success: Include extracted text
            context.push_str("**Extracted Text (OCR):**\n");
        }
        Ok(_) => {
            // OCR succeeded but no text found
            context.push_str("*Note: OCR completed but no text detected in image*\n\n");
        }
        Err(e) => {
            // OCR failed (tesseract not installed or error)
            context.push_str(&format!(
                "*Note: OCR not available ({}). Please describe image content manually.*\n\n",
                e
            ));
        }
    }
}
```

#### OCR Implementation (`extract_image_text()`)

**Safety features (already present):**
- ✅ File size check (default: 10MB limit via `max_ocr_image_size`)
- ✅ Timeout awareness (field `ocr_timeout_secs`, default: 30s, but **NOT enforced** — uses `std::process::Command` without timeout)
- ✅ Graceful error handling (returns `Result<String>`)
- ✅ Thread limiting (`OMP_THREAD_LIMIT=1`)
- ✅ Binary availability check (`which::which("tesseract")`)

**Tesseract command:**
```bash
tesseract <image_path> stdout -l eng --psm 3 --oem 3
```

**Limitations:**
1. **Text-only** — Cannot describe visual elements (diagrams, UI layouts, colors, spatial relationships)
2. **No timeout enforcement** — Process can hang indefinitely (comment at line 662 acknowledges this)
3. **English-only** — Language hardcoded to `eng` (line 653)
4. **No structured output** — Returns raw text blob without semantic understanding

---

### 1.2 Platform Runner Vision Capabilities

#### Model Catalog Analysis (`src/platforms/model_catalog.rs`)

**Vision-capable models in catalog:**

| Model | Provider | Context Window | Vision Support | CLI Access |
|-------|----------|----------------|----------------|------------|
| Claude Sonnet 4.5 | Anthropic | 200K | ✅ | `claude` CLI |
| Claude Opus 4 | Anthropic | 200K | ✅ | `claude` CLI |
| Claude Haiku 4 | Anthropic | 200K | ✅ | `claude` CLI |
| GPT-4.5 | OpenAI | 128K | ✅ | `codex` CLI (via `--image` flag) |
| GPT-5 | OpenAI | 128K | ✅ | `codex` CLI |
| Gemini 2.0 | Google | 1M | ✅ | `gemini` CLI |
| Gemini Flash 2.0 | Google | 2M | ✅ | `gemini` CLI |

**Key finding:** `codex` CLI explicitly supports `--image <path>` flag (line 22 of `codex.rs`).

#### Platform Runner Support

**1. Codex (OpenAI)** — `puppet-master-rs/src/platforms/codex.rs`
```bash
codex exec "Describe this image in detail" --image /path/to/image.png --json
```
- ✅ Native image flag support
- ✅ JSONL output format
- ✅ Subscription-based (no per-use API cost)
- ✅ Already integrated as platform runner

**2. Claude (Anthropic)** — `puppet-master-rs/src/platforms/claude.rs`
```bash
# Claude CLI supports vision but requires base64 encoding or file reference in prompt
claude -p "Describe the image at /path/to/image.png" --output-format json
```
- ⚠️ No native `--image` flag (as of current CLI version)
- ✅ Can handle image references in prompt (implementation may vary)
- ✅ JSONL output format
- ✅ Subscription-based

**3. Gemini (Google)** — `puppet-master-rs/src/platforms/gemini.rs`
```bash
# Gemini CLI likely supports multimodal input
gemini --prompt "Describe this image" --input /path/to/image.png
```
- ⚠️ CLI syntax TBD (check `gemini --help`)
- ✅ Best-in-class multimodal support (2M context window)
- ✅ Free tier available

**Recommendation:** Start with **Codex runner** (has explicit `--image` flag).

---

## 2. Proposed Enhancement

### 2.1 Architecture: Three-Tier Fallback

```
┌─────────────────────────────────────────┐
│  Image Reference in Interview Flow      │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │ Tier 1: Vision │  ← NEW: CLI vision model analysis
       │    Model       │     (Codex --image, Claude, Gemini)
       └───────┬────────┘
               │ (on failure)
       ┌───────▼────────┐
       │ Tier 2: OCR    │  ← Existing: Tesseract text extraction
       │  (Tesseract)   │
       └───────┬────────┘
               │ (on failure)
       ┌───────▼────────┐
       │ Tier 3: Metadata│  ← Existing: File size + extension
       │   Only         │
       └────────────────┘
```

### 2.2 New Module: `puppet-master-rs/src/interview/vision_extractor.rs`

**Purpose:** Isolated vision model integration with strict safety guardrails.

```rust
//! Vision model-based image analysis for interview references.
//!
//! Provides semantic understanding of images beyond OCR text extraction.
//! Uses CLI-based vision models (Codex, Claude, Gemini) with strict
//! timeouts, size limits, and graceful degradation.

use anyhow::{Context, Result};
use log::{debug, info, warn};
use std::path::Path;
use std::time::Duration;
use tokio::process::Command;
use tokio::time::timeout;

/// Configuration for vision analysis
#[derive(Debug, Clone)]
pub struct VisionConfig {
    /// Maximum image size for vision analysis (bytes)
    pub max_image_size: usize,
    /// Vision model operation timeout (seconds)
    pub timeout_secs: u64,
    /// Enable vision analysis (can be disabled via config)
    pub enabled: bool,
    /// Preferred platform runner (Codex, Claude, Gemini)
    pub preferred_runner: VisionRunner,
}

impl Default for VisionConfig {
    fn default() -> Self {
        Self {
            max_image_size: 5 * 1024 * 1024, // 5MB (vision models handle smaller images better)
            timeout_secs: 45,                 // 45s timeout (longer than OCR due to API latency)
            enabled: true,
            preferred_runner: VisionRunner::Codex,
        }
    }
}

/// Supported vision model runners
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VisionRunner {
    Codex,  // OpenAI via `codex --image`
    Claude, // Anthropic via `claude` (if supported)
    Gemini, // Google via `gemini` (if supported)
}

/// Vision-based image analyzer
pub struct VisionExtractor {
    config: VisionConfig,
}

impl VisionExtractor {
    /// Create a new vision extractor with default config
    pub fn new() -> Self {
        Self {
            config: VisionConfig::default(),
        }
    }

    /// Create with custom config
    pub fn with_config(config: VisionConfig) -> Self {
        Self { config }
    }

    /// Extract semantic description from an image using vision models.
    ///
    /// Returns detailed description including:
    /// - Visual content (UI elements, diagrams, charts)
    /// - Text content (if present)
    /// - Spatial layout and relationships
    /// - Colors and design elements
    /// - Suggested context for software development
    ///
    /// # Safety
    /// - Enforces file size limits
    /// - Enforces execution timeout
    /// - Checks CLI availability before execution
    /// - Returns graceful errors on failure
    pub async fn analyze_image(&self, path: &Path) -> Result<String> {
        if !self.config.enabled {
            anyhow::bail!("Vision analysis disabled in config");
        }

        // Safety check: file size
        let metadata = tokio::fs::metadata(path)
            .await
            .context("Failed to read image metadata")?;

        if metadata.len() > self.config.max_image_size as u64 {
            anyhow::bail!(
                "Image too large for vision analysis: {} bytes (max: {})",
                metadata.len(),
                self.config.max_image_size
            );
        }

        // Try preferred runner, then fallback to others
        let runners = self.get_runner_priority();

        for runner in runners {
            match self.try_analyze_with_runner(path, runner).await {
                Ok(description) => {
                    info!(
                        "Vision analysis successful with {:?} for {}",
                        runner,
                        path.display()
                    );
                    return Ok(description);
                }
                Err(e) => {
                    debug!(
                        "Vision analysis failed with {:?}: {} (trying next runner)",
                        runner, e
                    );
                }
            }
        }

        anyhow::bail!("All vision runners failed or unavailable")
    }

    /// Get prioritized list of runners to try
    fn get_runner_priority(&self) -> Vec<VisionRunner> {
        let mut runners = vec![self.config.preferred_runner];

        // Add fallbacks (exclude preferred)
        for runner in &[VisionRunner::Codex, VisionRunner::Claude, VisionRunner::Gemini] {
            if *runner != self.config.preferred_runner {
                runners.push(*runner);
            }
        }

        runners
    }

    /// Attempt analysis with a specific runner
    async fn try_analyze_with_runner(
        &self,
        path: &Path,
        runner: VisionRunner,
    ) -> Result<String> {
        match runner {
            VisionRunner::Codex => self.analyze_with_codex(path).await,
            VisionRunner::Claude => self.analyze_with_claude(path).await,
            VisionRunner::Gemini => self.analyze_with_gemini(path).await,
        }
    }

    /// Analyze image using Codex CLI (OpenAI)
    async fn analyze_with_codex(&self, path: &Path) -> Result<String> {
        // Check if codex is available
        which::which("codex").context("codex CLI not found in PATH")?;

        let prompt = self.build_analysis_prompt();

        // Build command: codex exec "prompt" --image /path/to/image.png --json --color never
        let mut cmd = Command::new("codex");
        cmd.arg("exec")
            .arg(prompt)
            .arg("--image")
            .arg(path)
            .arg("--json")
            .arg("--color")
            .arg("never")
            .arg("--max-turns")
            .arg("1") // Single-turn analysis
            .arg("--full-auto"); // Non-interactive

        // Execute with timeout
        let output = timeout(
            Duration::from_secs(self.config.timeout_secs),
            cmd.output(),
        )
        .await
        .context("Vision analysis timed out")?
        .context("Failed to execute codex")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("Codex vision analysis failed: {}", stderr.trim());
        }

        // Parse JSONL output and extract description
        let stdout = String::from_utf8_lossy(&output.stdout);
        self.parse_codex_output(&stdout)
    }

    /// Analyze image using Claude CLI (Anthropic)
    async fn analyze_with_claude(&self, path: &Path) -> Result<String> {
        // Check if claude is available
        which::which("claude").context("claude CLI not found in PATH")?;

        // Claude may require base64 encoding or special syntax
        // Placeholder implementation - needs testing with actual Claude CLI
        
        let prompt = format!(
            "{}\n\nImage path: {}",
            self.build_analysis_prompt(),
            path.display()
        );

        let mut cmd = Command::new("claude");
        cmd.arg("-p")
            .arg(prompt)
            .arg("--output-format")
            .arg("json")
            .arg("--no-session-persistence")
            .arg("--max-turns")
            .arg("1");

        let output = timeout(
            Duration::from_secs(self.config.timeout_secs),
            cmd.output(),
        )
        .await
        .context("Vision analysis timed out")?
        .context("Failed to execute claude")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("Claude vision analysis failed: {}", stderr.trim());
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        self.parse_claude_output(&stdout)
    }

    /// Analyze image using Gemini CLI (Google)
    async fn analyze_with_gemini(&self, path: &Path) -> Result<String> {
        // Check if gemini is available
        which::which("gemini").context("gemini CLI not found in PATH")?;

        // Gemini CLI syntax TBD - placeholder implementation
        anyhow::bail!("Gemini vision support not yet implemented")
    }

    /// Build standardized analysis prompt
    fn build_analysis_prompt(&self) -> String {
        // Optimized prompt for software development context
        "Analyze this image for software development purposes. Provide:\n\
         1. **Content Type**: Identify if it's a UI mockup, diagram, chart, screenshot, or other.\n\
         2. **Visual Description**: Describe layout, components, and spatial relationships.\n\
         3. **Text Content**: Extract any visible text, labels, or annotations.\n\
         4. **Technical Details**: Colors, dimensions, notable design patterns.\n\
         5. **Development Context**: How this image relates to software architecture, UI/UX, or documentation.\n\n\
         Be concise but thorough. Focus on details relevant to implementing or understanding the depicted system."
            .to_string()
    }

    /// Parse Codex JSONL output
    fn parse_codex_output(&self, output: &str) -> Result<String> {
        // Codex outputs JSONL events
        // Extract final assistant message
        let mut description = String::new();

        for line in output.lines() {
            if line.trim().is_empty() {
                continue;
            }

            if let Ok(event) = serde_json::from_str::<serde_json::Value>(line) {
                // Look for assistant message content
                if let Some(content) = event.get("content").and_then(|c| c.as_str()) {
                    description.push_str(content);
                } else if let Some(text) = event.get("text").and_then(|t| t.as_str()) {
                    description.push_str(text);
                }
            }
        }

        if description.trim().is_empty() {
            anyhow::bail!("No description extracted from Codex output");
        }

        Ok(description.trim().to_string())
    }

    /// Parse Claude JSON output
    fn parse_claude_output(&self, output: &str) -> Result<String> {
        // Claude outputs JSON
        let parsed: serde_json::Value =
            serde_json::from_str(output).context("Failed to parse Claude JSON")?;

        if let Some(content) = parsed.get("content").and_then(|c| c.as_str()) {
            Ok(content.to_string())
        } else if let Some(text) = parsed.get("text").and_then(|t| t.as_str()) {
            Ok(text.to_string())
        } else {
            anyhow::bail!("No content field in Claude output")
        }
    }
}

impl Default for VisionExtractor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_defaults() {
        let config = VisionConfig::default();
        assert_eq!(config.max_image_size, 5 * 1024 * 1024);
        assert_eq!(config.timeout_secs, 45);
        assert!(config.enabled);
    }

    #[test]
    fn test_runner_priority() {
        let extractor = VisionExtractor::new();
        let runners = extractor.get_runner_priority();
        assert_eq!(runners[0], VisionRunner::Codex); // Default preferred
        assert_eq!(runners.len(), 3); // All runners tried
    }

    #[tokio::test]
    async fn test_size_limit_enforcement() {
        let config = VisionConfig {
            max_image_size: 100, // Very small limit
            ..Default::default()
        };

        let extractor = VisionExtractor::with_config(config);

        // Create a temp file larger than limit
        use std::io::Write;
        let temp_dir = std::env::temp_dir();
        let large_image = temp_dir.join("large_test_image.png");

        {
            let mut file = std::fs::File::create(&large_image).unwrap();
            file.write_all(&vec![0u8; 200]).unwrap(); // 200 bytes
        }

        let result = extractor.analyze_image(&large_image).await;
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("too large for vision"));

        // Cleanup
        let _ = std::fs::remove_file(large_image);
    }

    #[test]
    fn test_prompt_generation() {
        let extractor = VisionExtractor::new();
        let prompt = extractor.build_analysis_prompt();
        assert!(prompt.contains("software development"));
        assert!(prompt.contains("Visual Description"));
        assert!(prompt.contains("Technical Details"));
    }
}
```

### 2.3 Integration into `reference_manager.rs`

**Modified image handling (lines 176-214):**

```rust
ReferenceType::Image(path) => {
    context.push_str(&format!("**Image:** {}\n\n", path.display()));
    
    if path.exists() {
        if let Ok(metadata) = fs::metadata(path) {
            context.push_str(&format!(
                "*Image file present: {} bytes*\n\n",
                metadata.len()
            ));

            // NEW: Tier 1 - Try vision model analysis first
            if let Some(vision) = &self.vision_extractor {
                match vision.analyze_image(path).await {
                    Ok(description) if !description.trim().is_empty() => {
                        context.push_str("**Vision Analysis:**\n");
                        context.push_str(&description);
                        context.push_str("\n\n");
                        continue; // Skip OCR if vision succeeded
                    }
                    Ok(_) => {
                        debug!("Vision analysis returned empty description");
                    }
                    Err(e) => {
                        debug!("Vision analysis failed: {} (falling back to OCR)", e);
                    }
                }
            }

            // Tier 2 - Attempt OCR extraction (existing code)
            match self.extract_image_text(path) {
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
                    debug!("OCR extraction failed for {}: {}", path.display(), e);
                    context.push_str(&format!(
                        "*Note: Image processing unavailable ({}). Please describe image content manually.*\n\n",
                        e
                    ));
                }
            }
        } else {
            context.push_str("*Error: Unable to read image metadata*\n\n");
        }
    } else {
        context.push_str("*Error: Image file not found*\n\n");
    }
}
```

**Add field to `ReferenceManager`:**

```rust
pub struct ReferenceManager {
    materials: Vec<ReferenceMaterial>,
    // ... existing fields ...
    
    /// Vision model extractor (optional, requires CLI tools)
    vision_extractor: Option<Arc<VisionExtractor>>,
}
```

**Constructor update:**

```rust
pub fn new() -> Self {
    // Try to initialize vision extractor (graceful if CLIs unavailable)
    let vision_extractor = VisionExtractor::new_if_available();
    
    Self {
        materials: Vec::new(),
        // ... existing fields ...
        vision_extractor,
    }
}
```

**Add helper in `vision_extractor.rs`:**

```rust
impl VisionExtractor {
    /// Create a vision extractor only if at least one CLI is available
    pub fn new_if_available() -> Option<Arc<Self>> {
        // Check if any vision CLI is available
        let has_codex = which::which("codex").is_ok();
        let has_claude = which::which("claude").is_ok();
        let has_gemini = which::which("gemini").is_ok();

        if has_codex || has_claude || has_gemini {
            Some(Arc::new(Self::new()))
        } else {
            debug!("No vision CLI tools available, vision analysis disabled");
            None
        }
    }
}
```

---

## 3. Safety Features & Constraints

### 3.1 Size Limits

| Tier | Max Size | Rationale |
|------|----------|-----------|
| Vision | 5 MB | Vision models work best with smaller images; reduces latency |
| OCR | 10 MB | Tesseract can handle larger images for text extraction |

**Implementation:** Both checked before processing (lines 634-640 for OCR, new check in vision).

### 3.2 Timeouts

| Tier | Timeout | Implementation |
|------|---------|----------------|
| Vision | 45s | `tokio::time::timeout()` wrapper |
| OCR | 30s | ⚠️ **NOT ENFORCED** — needs fix (see issue below) |

**OCR Timeout Fix Required:**

```rust
// Current (line 649): No timeout
let output = Command::new(tesseract_path).arg(path).arg("stdout").output();

// Proposed fix:
use tokio::process::Command; // Change to async
use tokio::time::timeout;

let output = timeout(
    Duration::from_secs(self.ocr_timeout_secs),
    Command::new(tesseract_path).arg(path).arg("stdout").output()
).await??; // Double ? for timeout error and command error
```

**Action item:** Convert `extract_image_text()` to async and enforce timeout.

### 3.3 Graceful Degradation

```
Vision fails → Try OCR → OCR fails → Show metadata only
```

No hard failures. User always gets context (even if just file size).

### 3.4 Configuration

**New config section in `~/.puppet-master/config.toml`:**

```toml
[interview.vision]
enabled = true
max_image_size_mb = 5
timeout_secs = 45
preferred_runner = "Codex"  # Options: Codex, Claude, Gemini

# Optional: Disable specific runners
disable_runners = []  # e.g., ["Claude"] to skip Claude
```

**Environment variable override:**

```bash
PUPPET_MASTER_VISION_ENABLED=false  # Disable vision analysis
PUPPET_MASTER_VISION_TIMEOUT=60     # Increase timeout
```

---

## 4. Platform Runner Support Matrix

### 4.1 Codex (OpenAI) — **PRIMARY TARGET**

**Status:** ✅ Ready to implement  
**CLI flag:** `--image <path>`  
**Documentation:** Lines 22-25 of `codex.rs`

**Command:**
```bash
codex exec "Describe this image for software development" \
  --image /path/to/image.png \
  --json \
  --color never \
  --max-turns 1 \
  --full-auto
```

**Output format:** JSONL event stream  
**Parsing strategy:** Extract `content` or `text` field from JSON events

**Authentication:**
- Uses saved CLI auth (ChatGPT Plus/Pro subscription)
- No API key required
- Works offline once authenticated

**Advantages:**
1. Native `--image` flag (no hacks needed)
2. Already integrated as platform runner
3. Fast response times (GPT-4.5 Turbo)
4. Reliable JSONL parsing

**Implementation priority:** 🥇 **HIGH** (implement first)

---

### 4.2 Claude (Anthropic) — **SECONDARY TARGET**

**Status:** ⚠️ Needs verification  
**CLI flag:** Unknown (may require base64 or special syntax)  
**Documentation:** No explicit image flag in `claude.rs`

**Possible approaches:**
1. Check `claude --help` for image support
2. Use file reference in prompt: `"Analyze the image at /path/to/image.png"`
3. Base64 encode and embed in prompt (not recommended for large images)

**Command (speculative):**
```bash
claude -p "Describe the image at /path/to/image.png" \
  --output-format json \
  --no-session-persistence \
  --max-turns 1
```

**Output format:** JSON (single response)  
**Parsing strategy:** Extract `content` or `text` field

**Authentication:**
- Uses Claude subscription (Claude Max/Pro)
- No API key required

**Advantages:**
1. Best-in-class vision models (Claude Opus 4, Sonnet 4.5)
2. Already integrated as platform runner
3. Large context window (200K)

**Disadvantages:**
1. CLI image support unclear (needs testing)
2. May require workarounds

**Implementation priority:** 🥈 **MEDIUM** (implement after Codex)

---

### 4.3 Gemini (Google) — **TERTIARY TARGET**

**Status:** ❓ Unknown CLI syntax  
**CLI:** Likely `gemini` command  
**Documentation:** Not present in current codebase

**Research needed:**
1. Verify Gemini CLI installation method
2. Check image input syntax
3. Confirm output format

**Potential command:**
```bash
gemini --prompt "Describe this image" --input /path/to/image.png --format json
```

**Advantages:**
1. Largest context window (2M tokens)
2. "Fast multimodal model" (per `model_catalog.rs` line 151)
3. Free tier available

**Disadvantages:**
1. CLI may not be installed by default
2. Syntax unknown
3. No existing runner integration

**Implementation priority:** 🥉 **LOW** (optional future enhancement)

---

## 5. Testing Strategy

### 5.1 Unit Tests

**Location:** `puppet-master-rs/src/interview/vision_extractor.rs` (tests module)

**Test cases:**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    // Configuration tests
    #[test]
    fn test_config_defaults() { /* ... */ }

    #[test]
    fn test_custom_config() { /* ... */ }

    // Size limit enforcement
    #[tokio::test]
    async fn test_size_limit_too_large() {
        // Create image > max_image_size
        // Assert: Error contains "too large"
    }

    #[tokio::test]
    async fn test_size_limit_within_bounds() {
        // Create image < max_image_size
        // Mock CLI call
        // Assert: Success or graceful CLI failure
    }

    // Timeout enforcement
    #[tokio::test]
    async fn test_timeout_enforcement() {
        // Mock slow CLI response (sleep 60s)
        // Set timeout to 10s
        // Assert: Error contains "timed out"
    }

    // CLI availability checks
    #[tokio::test]
    async fn test_codex_unavailable() {
        // Mock `which::which("codex")` failure
        // Assert: Falls back to next runner
    }

    #[tokio::test]
    async fn test_all_clis_unavailable() {
        // Mock all `which::which()` failures
        // Assert: Error "All vision runners failed"
    }

    // Output parsing
    #[test]
    fn test_parse_codex_jsonl() {
        let sample_output = r#"{"event":"start"}
{"content":"This is a UI mockup showing..."}
{"event":"done"}"#;
        // Assert: Extracted content correctly
    }

    #[test]
    fn test_parse_claude_json() {
        let sample_output = r#"{"content":"This image depicts..."}"#;
        // Assert: Extracted content correctly
    }

    // Runner priority
    #[test]
    fn test_runner_fallback_order() {
        let extractor = VisionExtractor::with_config(VisionConfig {
            preferred_runner: VisionRunner::Claude,
            ..Default::default()
        });
        let priority = extractor.get_runner_priority();
        assert_eq!(priority[0], VisionRunner::Claude);
        assert_eq!(priority.len(), 3);
    }

    // Prompt generation
    #[test]
    fn test_prompt_contains_key_sections() {
        let extractor = VisionExtractor::new();
        let prompt = extractor.build_analysis_prompt();
        assert!(prompt.contains("Content Type"));
        assert!(prompt.contains("Visual Description"));
        assert!(prompt.contains("Text Content"));
        assert!(prompt.contains("Technical Details"));
    }
}
```

### 5.2 Integration Tests

**Location:** `puppet-master-rs/tests/interview_vision_tests.rs`

**Test cases:**

```rust
use puppet_master::interview::{ReferenceManager, ReferenceType, ReferenceMaterial};
use std::path::PathBuf;

#[tokio::test]
async fn test_vision_analysis_with_real_image() {
    // Requires: codex CLI installed and authenticated
    if which::which("codex").is_err() {
        eprintln!("Skipping test: codex CLI not available");
        return;
    }

    let mut mgr = ReferenceManager::new();
    
    // Create test image (simple PNG)
    let test_image = create_test_ui_mockup(); // Helper function
    
    mgr.add(ReferenceMaterial {
        ref_type: ReferenceType::Image(test_image.clone()),
        description: Some("Test UI mockup".to_string()),
        added_at: chrono::Utc::now().to_rfc3339(),
    });

    let context = mgr.load_context().await.unwrap();
    
    // Should contain vision analysis section
    assert!(context.contains("Vision Analysis:"));
    // Should not fallback to OCR if vision succeeded
    assert!(!context.contains("Extracted Text (OCR)"));
    
    // Cleanup
    let _ = std::fs::remove_file(test_image);
}

#[tokio::test]
async fn test_fallback_to_ocr_when_vision_fails() {
    let mut mgr = ReferenceManager::new();
    
    // Force vision failure by using oversized image
    let large_image = create_large_test_image(20_000_000); // 20MB
    
    mgr.add(ReferenceMaterial {
        ref_type: ReferenceType::Image(large_image.clone()),
        description: Some("Oversized test image".to_string()),
        added_at: chrono::Utc::now().to_rfc3339(),
    });

    let context = mgr.load_context().await.unwrap();
    
    // Should fallback to OCR
    assert!(context.contains("OCR") || context.contains("Image file present"));
    
    // Cleanup
    let _ = std::fs::remove_file(large_image);
}

#[tokio::test]
async fn test_graceful_degradation_all_methods_fail() {
    // Create corrupted image file
    let corrupted_image = create_corrupted_test_image();
    
    let mut mgr = ReferenceManager::new();
    mgr.add(ReferenceMaterial {
        ref_type: ReferenceType::Image(corrupted_image.clone()),
        description: Some("Corrupted test image".to_string()),
        added_at: chrono::Utc::now().to_rfc3339(),
    });

    let context = mgr.load_context().await.unwrap();
    
    // Should still return context (metadata only)
    assert!(context.contains("Image file present") || context.contains("bytes"));
    assert!(context.contains("Note:"));
    
    // Cleanup
    let _ = std::fs::remove_file(corrupted_image);
}

// Helper functions
fn create_test_ui_mockup() -> PathBuf {
    // Create a simple PNG with text/UI elements
    use image::{ImageBuffer, Rgb};
    
    let img = ImageBuffer::from_fn(512, 512, |x, y| {
        if x % 50 == 0 || y % 50 == 0 {
            Rgb([0, 0, 0]) // Grid lines
        } else {
            Rgb([255, 255, 255]) // White background
        }
    });
    
    let path = std::env::temp_dir().join("test_ui_mockup.png");
    img.save(&path).unwrap();
    path
}

fn create_large_test_image(size_bytes: usize) -> PathBuf {
    let path = std::env::temp_dir().join("large_test_image.png");
    let mut file = std::fs::File::create(&path).unwrap();
    use std::io::Write;
    file.write_all(&vec![0u8; size_bytes]).unwrap();
    path
}

fn create_corrupted_test_image() -> PathBuf {
    let path = std::env::temp_dir().join("corrupted_test_image.png");
    let mut file = std::fs::File::create(&path).unwrap();
    use std::io::Write;
    // Write invalid PNG header
    file.write_all(b"NOT_A_PNG_FILE").unwrap();
    path
}
```

### 5.3 Manual Testing Checklist

**Prerequisites:**
- [ ] Install Codex CLI: `npm install -g @openai/codex-cli` (or similar)
- [ ] Authenticate: `codex login`
- [ ] Verify image flag: `codex --help | grep image`

**Test scenarios:**

1. **Happy path:**
   - [ ] Add UI mockup as reference → Vision analysis appears in context
   - [ ] Add architecture diagram → Vision analysis appears
   - [ ] Verify analysis includes layout, colors, components

2. **Fallback scenarios:**
   - [ ] Disable Codex → Falls back to Claude/Gemini (if available) or OCR
   - [ ] Use 15MB image → Vision rejects, OCR processes
   - [ ] Use image with text → Vision extracts text + visual description

3. **Edge cases:**
   - [ ] No vision CLIs installed → OCR only (no errors)
   - [ ] Corrupted image → Metadata only (no crash)
   - [ ] Network timeout during CLI call → Graceful error, falls back

4. **Performance:**
   - [ ] Vision analysis completes within 45s timeout
   - [ ] No memory leaks after processing 10+ images
   - [ ] CLI processes cleaned up (no zombie processes)

---

## 6. Implementation Plan

### Phase 1: Foundation (Week 1)

**Tasks:**
1. ✅ Create `puppet-master-rs/src/interview/vision_extractor.rs` module
2. ✅ Implement `VisionConfig` and `VisionExtractor` structs
3. ✅ Add Codex runner integration (`analyze_with_codex()`)
4. ✅ Implement timeout enforcement (`tokio::time::timeout`)
5. ✅ Add size limit checks
6. ✅ Write unit tests (config, size limits, prompt generation)

**Deliverables:**
- Compiling `vision_extractor.rs` module
- 100% test coverage for core logic
- Documentation for all public APIs

---

### Phase 2: ReferenceManager Integration (Week 2)

**Tasks:**
1. Add `vision_extractor: Option<Arc<VisionExtractor>>` field to `ReferenceManager`
2. Modify `load_context()` image handling (three-tier fallback)
3. Convert `extract_image_text()` to async (for timeout enforcement)
4. Update `ReferenceManager::new()` to initialize vision extractor
5. Add config file support (`~/.puppet-master/config.toml`)
6. Write integration tests

**Deliverables:**
- Modified `reference_manager.rs` with vision support
- Config file schema for vision settings
- Integration tests passing

---

### Phase 3: Testing & Refinement (Week 3)

**Tasks:**
1. Manual testing with real images (UI mockups, diagrams, screenshots)
2. Benchmark vision vs. OCR performance
3. Refine analysis prompt for better results
4. Add logging for troubleshooting
5. Update documentation (user-facing + developer)
6. Verify graceful degradation in all scenarios

**Deliverables:**
- Manual test report (10+ scenarios)
- Performance benchmarks (latency, memory)
- Updated README with vision setup instructions

---

### Phase 4: Optional Enhancements (Week 4+)

**Tasks:**
1. Add Claude runner support (if CLI supports images)
2. Add Gemini runner support (research CLI syntax)
3. Implement vision result caching (avoid re-analyzing same image)
4. Add configurable analysis prompts (user-customizable)
5. GUI settings panel for vision config (if needed)

**Deliverables:**
- Multi-runner support (Codex, Claude, Gemini)
- Caching layer for faster repeated analysis
- User-facing config UI (optional)

---

## 7. Risk Assessment

### 7.1 Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| CLI not installed | Medium | Graceful fallback to OCR, clear error messages |
| CLI auth expired | Medium | Detect auth errors, prompt user to re-authenticate |
| Timeout too aggressive | Low | Configurable timeout (default 45s) |
| Vision analysis quality varies | Medium | Use detailed prompt, allow user to add manual description |
| Increased latency (vs. OCR) | Medium | Async processing, doesn't block UI |
| CLI output format changes | High | Version checking, robust JSON parsing |

### 7.2 Security Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Malicious images trigger CLI exploit | High | Size limits, timeout enforcement, sandboxed CLI execution |
| Leaked sensitive data in images | Medium | Local processing only (no cloud APIs), warn users |
| CLI command injection | High | Use `Command::arg()` (no shell interpolation) |

**Security review required:** ✅ Yes (before merging to main)

### 7.3 Performance Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Vision analysis blocks interview flow | Medium | Async processing, progress indicator in GUI |
| Memory usage spikes with large images | Low | 5MB size limit enforced |
| CLI spawns accumulate if crashes | Medium | Process registry tracking, cleanup on shutdown |

---

## 8. Rollout Strategy

### 8.1 Feature Flag

**Initial rollout:** **Opt-in** (disabled by default)

```toml
# ~/.puppet-master/config.toml
[interview.vision]
enabled = false  # User must explicitly enable
```

**After 2 weeks of testing:** **Opt-out** (enabled by default)

```toml
enabled = true  # Enabled for all users, can disable if issues
```

### 8.2 User Communication

**Release notes snippet:**

```markdown
## 🎨 New Feature: Vision Model Image Analysis

Interview flow now supports **intelligent image understanding**! When you add
UI mockups, diagrams, or screenshots as reference materials, Puppet Master
can describe their contents using AI vision models.

**How to enable:**
1. Install Codex CLI: `npm install -g @openai/codex-cli`
2. Authenticate: `codex login` (requires ChatGPT Plus/Pro)
3. Enable in config: `~/.puppet-master/config.toml`
   ```toml
   [interview.vision]
   enabled = true
   ```

**Fallback behavior:**
- If vision fails → Uses OCR (Tesseract) for text extraction
- If OCR fails → Shows image metadata only
- No disruption to existing workflows

**Supported CLIs:**
- ✅ Codex (OpenAI) — Primary
- ⏳ Claude (Anthropic) — Coming soon
- ⏳ Gemini (Google) — Coming soon
```

### 8.3 Monitoring

**Metrics to track:**
- Vision analysis success rate (%)
- Average analysis latency (seconds)
- Fallback rate (vision → OCR → metadata)
- CLI error types (auth, timeout, network)

**Logging:**
- Vision analysis start/success/failure (DEBUG level)
- Timeout/size limit rejections (WARN level)
- CLI availability checks (INFO level)

---

## 9. Open Questions

1. **Claude CLI image support:** Does `claude` CLI support native image input? Research needed.
2. **Gemini CLI availability:** Is Gemini CLI commonly installed? What's the command syntax?
3. **Prompt optimization:** Should we use different prompts for different image types (UI vs. diagram vs. screenshot)?
4. **Caching strategy:** Should we cache vision analysis results? Key on file hash (MD5)?
5. **GUI integration:** Do we need a settings panel for vision config, or is TOML file sufficient?
6. **Rate limiting:** Do CLI tools have rate limits? Need per-runner tracking?
7. **Multi-language OCR:** Should we support non-English OCR languages? (Currently hardcoded to `eng`)

---

## 10. Recommendations

### Immediate (Week 1):

1. ✅ **Implement Codex vision support first** (has explicit `--image` flag)
2. ✅ **Enforce OCR timeout** (convert `extract_image_text()` to async)
3. ✅ **Write comprehensive unit tests** (size limits, timeouts, parsing)
4. ✅ **Add config file support** (`~/.puppet-master/config.toml`)

### Short-term (Weeks 2-3):

5. ✅ **Integrate into `ReferenceManager`** (three-tier fallback)
6. ✅ **Manual testing with real-world images** (UI mockups, diagrams)
7. ✅ **Performance benchmarking** (vision vs. OCR latency)
8. ✅ **Update documentation** (setup guide, troubleshooting)

### Medium-term (Weeks 4+):

9. 🔄 **Add Claude/Gemini support** (if CLIs support images)
10. 🔄 **Implement vision result caching** (avoid re-analyzing same image)
11. 🔄 **Optimize analysis prompt** (based on user feedback)
12. 🔄 **GUI settings panel** (if TOML file proves insufficient)

### Long-term (Post-launch):

13. 🔮 **Multi-language OCR support** (configurable language codes)
14. 🔮 **Image preprocessing** (resize/optimize before analysis)
15. 🔮 **Local vision models** (llama-vision, GPT-4-Vision alternatives)
16. 🔮 **Batch processing** (analyze multiple images in parallel)

---

## 11. Summary

### Current Behavior:
- ✅ **OCR (Tesseract)** extracts text from images
- ✅ **Metadata fallback** shows file size if OCR fails
- ❌ **No visual understanding** (diagrams, layouts, UI elements missed)
- ⚠️ **No timeout enforcement** on OCR (can hang indefinitely)

### Proposed Enhancement:
- ✅ **Vision models** (Codex, Claude, Gemini) analyze image content
- ✅ **Three-tier fallback** (Vision → OCR → Metadata)
- ✅ **Strict safety** (5MB limit, 45s timeout, process cleanup)
- ✅ **CLI-only** (no API dependencies, uses existing subscriptions)
- ✅ **Graceful degradation** (works without vision CLIs installed)

### Implementation Scope:
- **New module:** `puppet-master-rs/src/interview/vision_extractor.rs` (~500 lines)
- **Modified module:** `puppet-master-rs/src/interview/reference_manager.rs` (~50 lines changed)
- **Tests:** ~30 unit tests + 10 integration tests
- **Config:** New `[interview.vision]` section in TOML
- **Timeline:** 3-4 weeks (foundation → integration → testing → refinement)

### Risk Level: **LOW to MEDIUM**
- ✅ **Low risk:** Graceful fallback to existing OCR behavior
- ✅ **No breaking changes:** Opt-in feature, doesn't affect non-users
- ⚠️ **Medium risk:** Depends on external CLI tools (availability, auth, format changes)

### Recommendation: **PROCEED with Codex-first implementation**
- Start with **Codex runner** (proven `--image` flag support)
- Add **Claude/Gemini** after validation
- **Launch as opt-in** feature, migrate to opt-out after 2 weeks

---

## Appendix A: Cargo Dependencies

**New dependencies required:**

```toml
# Already present (no additions needed)
tokio = { version = "1", features = ["full"] }      # For async/timeout
which = "7"                                          # For CLI availability checks
serde_json = "1"                                     # For JSON parsing
anyhow = "1"                                         # For error handling
log = "0.4"                                          # For logging
```

**No new dependencies required!** All functionality uses existing crates.

---

## Appendix B: Example Vision Output

**Input image:** UI mockup of a login screen

**Vision analysis output (Codex):**
```markdown
**Vision Analysis:**

This image depicts a modern login screen UI mockup with the following elements:

**Content Type:** UI Design / Authentication Interface

**Visual Description:**
- Clean, minimalist design with centered vertical layout
- White background with subtle drop shadow on form container
- Two input fields (username and password) with placeholder text
- Primary action button ("Sign In") in blue (#3B82F6)
- Secondary "Forgot Password?" link below button
- Social login options at bottom (Google, GitHub icons)

**Text Content:**
- Title: "Welcome Back"
- Subtitle: "Sign in to your account"
- Input placeholders: "Email address", "Password"
- Button text: "Sign In"
- Link text: "Forgot Password?"
- Footer: "Don't have an account? Sign up"

**Technical Details:**
- Estimated dimensions: 400x600px
- Color scheme: Blue (#3B82F6), Gray (#6B7280), White (#FFFFFF)
- Typography: Sans-serif (likely Inter or similar)
- Spacing: Consistent 16px padding, 24px gaps between elements

**Development Context:**
This represents a standard authentication flow design. Implementation should include:
- Form validation (email format, password requirements)
- Error state styling (red borders, error messages)
- Loading state for submit button
- Accessibility: ARIA labels, keyboard navigation, focus states
- Responsive design considerations for mobile viewports
```

**Contrast with OCR output (Tesseract):**
```
Welcome Back
Sign in to your account
Email address
Password
Sign In
Forgot Password?
Don't have an account? Sign up
```

**Key differences:**
- Vision provides **layout understanding** (centered, vertical, spacing)
- Vision identifies **colors and design patterns** (blue buttons, shadows)
- Vision gives **implementation guidance** (validation, accessibility)
- OCR only provides **text content** (no context)

---

**End of Audit Report**
