# Vision Model Enhancement - Quick Reference

**Status:** Proposed  
**Priority:** Medium  
**Risk:** Low-Medium  
**Timeline:** 3-4 weeks

---

## What & Why

**Problem:** Current image handling uses Tesseract OCR (text-only). Fails for UI mockups, diagrams, charts, and visual content.

**Solution:** Add CLI-only vision model analysis (Codex/Claude/Gemini) for semantic image understanding.

**Benefits:**
- Interview AI understands visual references (not just text)
- Zero API costs (uses existing CLI subscriptions)
- Graceful fallback (Vision → OCR → Metadata)

---

## Architecture

### Three-Tier Fallback Chain

```
Image Reference
    ↓
[1] Vision Model (NEW)
    ├─ Codex: codex exec --image <path>
    ├─ Claude: claude -p "..." (if supported)
    └─ Gemini: gemini --input <path> (TBD)
    ↓ (on failure)
[2] OCR (Existing)
    └─ Tesseract: tesseract <path> stdout
    ↓ (on failure)
[3] Metadata (Existing)
    └─ File size + extension only
```

### Safety Guardrails

| Feature | Vision | OCR |
|---------|--------|-----|
| Max size | 5 MB | 10 MB |
| Timeout | 45s (enforced) | 30s (**NOT enforced** - needs fix) |
| CLI check | ✅ `which::which()` | ✅ `which::which()` |
| Async | ✅ `tokio::time::timeout` | ❌ **Needs conversion** |

---

## Files to Create/Modify

### New File: `puppet-master-rs/src/interview/vision_extractor.rs`

**Purpose:** Isolated vision model integration  
**Lines of code:** ~500 (with tests)  
**Key structs:**
- `VisionConfig` — size limits, timeout, preferred runner
- `VisionExtractor` — main analysis logic
- `VisionRunner` — enum (Codex, Claude, Gemini)

**Key methods:**
- `analyze_image(&self, path: &Path) -> Result<String>` — Main entry point
- `analyze_with_codex(&self, path: &Path) -> Result<String>` — Codex integration
- `build_analysis_prompt(&self) -> String` — Optimized prompt

**Add to module tree:**
```rust
// puppet-master-rs/src/interview/mod.rs
pub mod vision_extractor;
pub use vision_extractor::{VisionConfig, VisionExtractor, VisionRunner};
```

---

### Modified File: `puppet-master-rs/src/interview/reference_manager.rs`

**Changes:**

1. **Add field to struct** (line ~43):
```rust
pub struct ReferenceManager {
    materials: Vec<ReferenceMaterial>,
    // ... existing fields ...
    vision_extractor: Option<Arc<VisionExtractor>>, // NEW
}
```

2. **Update constructor** (line ~60):
```rust
pub fn new() -> Self {
    let vision_extractor = VisionExtractor::new_if_available(); // NEW
    Self {
        materials: Vec::new(),
        // ... existing fields ...
        vision_extractor, // NEW
    }
}
```

3. **Modify image handling** (lines ~176-214):
```rust
ReferenceType::Image(path) => {
    context.push_str(&format!("**Image:** {}\n\n", path.display()));
    
    if path.exists() {
        if let Ok(metadata) = fs::metadata(path) {
            context.push_str(&format!(
                "*Image file present: {} bytes*\n\n",
                metadata.len()
            ));

            // NEW: Try vision model first
            if let Some(vision) = &self.vision_extractor {
                match vision.analyze_image(path).await {
                    Ok(desc) if !desc.trim().is_empty() => {
                        context.push_str("**Vision Analysis:**\n");
                        context.push_str(&desc);
                        context.push_str("\n\n");
                        continue; // Skip OCR
                    }
                    Err(e) => debug!("Vision failed: {}, falling back", e),
                    _ => {}
                }
            }

            // Existing: Try OCR
            match self.extract_image_text(path) {
                // ... existing OCR logic ...
            }
        }
    }
}
```

4. **Fix OCR timeout** (lines 630-689):
```rust
// OLD: fn extract_image_text(&self, path: &Path) -> Result<String>
// NEW:
async fn extract_image_text(&self, path: &Path) -> Result<String> {
    // ... size checks ...
    
    let tesseract_path = which::which("tesseract")
        .context("tesseract not found in PATH")?;
    
    // OLD: let output = Command::new(tesseract_path).output();
    // NEW:
    use tokio::time::timeout;
    use tokio::process::Command;
    
    let output = timeout(
        Duration::from_secs(self.ocr_timeout_secs),
        Command::new(tesseract_path)
            .arg(path)
            .arg("stdout")
            .arg("-l").arg("eng")
            .arg("--psm").arg("3")
            .arg("--oem").arg("3")
            .env("OMP_THREAD_LIMIT", "1")
            .output()
    )
    .await
    .context("OCR timed out")?
    .context("Failed to execute tesseract")?;
    
    // ... rest of existing logic ...
}
```

5. **Update `load_context()` signature** (line ~122):
```rust
// OLD: pub fn load_context(&self) -> Result<String>
// NEW:
pub async fn load_context(&self) -> Result<String>
```

---

## Configuration

### Config File: `~/.puppet-master/config.toml`

```toml
[interview.vision]
enabled = true                    # Enable/disable vision analysis
max_image_size_mb = 5             # Max image size (MB)
timeout_secs = 45                 # Analysis timeout (seconds)
preferred_runner = "Codex"        # Options: Codex, Claude, Gemini
disable_runners = []              # Optional: Skip specific runners
```

### Environment Variables

```bash
PUPPET_MASTER_VISION_ENABLED=false    # Disable vision
PUPPET_MASTER_VISION_TIMEOUT=60       # Override timeout
```

---

## Platform Runner Details

### Codex (OpenAI) — **PRIMARY**

**Status:** ✅ Ready (has `--image` flag)  
**Command:**
```bash
codex exec "Describe this image for software development" \
  --image /path/to/image.png \
  --json --color never --max-turns 1 --full-auto
```

**Prerequisites:**
1. Install: `npm install -g @openai/codex-cli`
2. Authenticate: `codex login` (ChatGPT Plus/Pro required)
3. Verify: `codex --help | grep image`

**Output:** JSONL event stream  
**Parsing:** Extract `content` or `text` field from JSON

---

### Claude (Anthropic) — **SECONDARY**

**Status:** ⚠️ Needs verification (no explicit `--image` flag in docs)  
**Possible command:**
```bash
claude -p "Describe the image at /path/to/image.png" \
  --output-format json --no-session-persistence --max-turns 1
```

**Prerequisites:**
1. Install Claude app (subscription-based auth)
2. Verify CLI: `claude --help | grep image`
3. Test image support

**Action:** Research Claude CLI image input syntax

---

### Gemini (Google) — **TERTIARY**

**Status:** ❓ Unknown (CLI syntax TBD)  
**Possible command:**
```bash
gemini --prompt "Describe this image" --input /path/to/image.png --format json
```

**Action:** Research Gemini CLI availability and syntax

---

## Testing Checklist

### Unit Tests (`vision_extractor.rs`)

- [x] Config defaults validation
- [x] Size limit enforcement (5MB)
- [x] Timeout enforcement (45s)
- [x] CLI availability checks (`which::which()`)
- [x] Runner priority/fallback logic
- [x] JSONL parsing (Codex output)
- [x] JSON parsing (Claude output)
- [x] Prompt generation

### Integration Tests (`tests/interview_vision_tests.rs`)

- [ ] Vision analysis with real image (requires Codex CLI)
- [ ] Fallback to OCR when vision fails (oversized image)
- [ ] Graceful degradation when all methods fail (corrupted image)
- [ ] Performance benchmarks (latency, memory)

### Manual Testing

**Prerequisites:**
- [ ] Install Codex CLI
- [ ] Authenticate (`codex login`)
- [ ] Verify `codex --help | grep image`

**Scenarios:**
- [ ] Add UI mockup → Vision analysis appears
- [ ] Add architecture diagram → Vision analysis appears
- [ ] Disable Codex → Falls back to OCR
- [ ] Use 15MB image → Vision rejects, OCR processes
- [ ] No CLIs installed → OCR only (no errors)
- [ ] Corrupted image → Metadata only (no crash)

---

## Implementation Tasks

### Week 1: Foundation
- [ ] Create `vision_extractor.rs` module
- [ ] Implement `VisionExtractor` struct + methods
- [ ] Add Codex runner integration
- [ ] Implement timeout enforcement (`tokio::time::timeout`)
- [ ] Write unit tests (config, size limits, parsing)
- [ ] Documentation for all public APIs

### Week 2: Integration
- [ ] Add `vision_extractor` field to `ReferenceManager`
- [ ] Modify `load_context()` image handling (three-tier fallback)
- [ ] Convert `extract_image_text()` to async (OCR timeout fix)
- [ ] Update `ReferenceManager::new()` to init vision extractor
- [ ] Add config file support (`~/.puppet-master/config.toml`)
- [ ] Write integration tests

### Week 3: Testing & Refinement
- [ ] Manual testing with 10+ real images
- [ ] Benchmark vision vs. OCR (latency, memory)
- [ ] Refine analysis prompt (based on results)
- [ ] Add logging/debugging support
- [ ] Update documentation (README, setup guide)
- [ ] Verify graceful degradation

### Week 4: Optional Enhancements
- [ ] Add Claude runner support (if CLI supports images)
- [ ] Add Gemini runner support (research syntax)
- [ ] Implement vision result caching (avoid re-analysis)
- [ ] Add configurable analysis prompts
- [ ] GUI settings panel (if needed)

---

## Key Decisions

### Why CLI-only (not API)?
- ✅ Zero per-use costs (uses existing subscriptions)
- ✅ No API key management
- ✅ Works offline once authenticated
- ✅ Consistent with existing platform runner architecture

### Why async?
- ✅ Enforces timeouts (via `tokio::time::timeout`)
- ✅ Non-blocking UI (vision analysis can take 10-45s)
- ✅ Enables concurrent processing (future enhancement)

### Why 5MB size limit (vs 10MB for OCR)?
- ✅ Vision models process faster with smaller images
- ✅ Reduces latency and memory usage
- ✅ Most screenshots/mockups are <5MB

### Why 45s timeout (vs 30s for OCR)?
- ✅ Vision models have API/network latency
- ✅ More complex processing than OCR
- ✅ Configurable per user needs

### Why Codex first?
- ✅ Explicit `--image` flag in CLI docs
- ✅ Already integrated as platform runner
- ✅ JSONL output (easier parsing)
- ✅ Fast response times (GPT-4.5 Turbo)

---

## Known Issues & Mitigations

| Issue | Mitigation |
|-------|------------|
| OCR has no timeout enforcement | Convert to async, add `tokio::time::timeout` |
| CLI auth can expire | Detect auth errors, prompt re-authentication |
| Vision analysis varies in quality | Use detailed prompt, allow manual descriptions |
| CLI output format may change | Version checking, robust parsing |
| Increased latency (10-45s) | Async processing, progress indicator (future) |

---

## Risks & Acceptance Criteria

### Success Criteria
✅ **Functional:**
- Vision analysis works for UI mockups, diagrams, screenshots
- Graceful fallback to OCR when vision fails
- No errors when no CLIs installed

✅ **Performance:**
- Vision analysis completes within 45s (or timeout)
- No memory leaks after 10+ images
- No zombie CLI processes

✅ **Safety:**
- Size limits enforced (5MB)
- Timeouts enforced (45s vision, 30s OCR)
- No command injection vulnerabilities

### Failure Criteria
❌ **Blocking issues:**
- Vision analysis crashes application
- CLI processes accumulate (memory leak)
- Breaking changes to OCR behavior

---

## Rollout Plan

### Phase 1: Opt-in (Initial release)
```toml
[interview.vision]
enabled = false  # Users must explicitly enable
```

### Phase 2: Opt-out (After 2 weeks)
```toml
enabled = true   # Enabled by default, can disable
```

### Monitoring
- Vision success rate (%)
- Average latency (seconds)
- Fallback rate (vision → OCR → metadata)
- CLI error types (auth, timeout, network)

---

## Quick Commands

### Install Codex CLI
```bash
npm install -g @openai/codex-cli
codex login
codex --help | grep image  # Verify image support
```

### Test Vision Analysis (Manual)
```bash
# Test Codex image flag
codex exec "Describe this image" --image test.png --json --max-turns 1

# Check output format
codex exec "What is 2+2?" --json --color never --max-turns 1
```

### Run Tests
```bash
cd puppet-master-rs

# Unit tests
cargo test vision_extractor

# Integration tests (requires Codex CLI)
cargo test interview_vision_tests

# All tests
cargo test
```

### Build & Run
```bash
cargo build --release
./target/release/puppet-master
```

---

## Resources

- **Full audit:** `VISION_MODEL_ENHANCEMENT_AUDIT.md`
- **Code location:** `puppet-master-rs/src/interview/`
- **Model catalog:** `puppet-master-rs/src/platforms/model_catalog.rs`
- **Platform runners:** `puppet-master-rs/src/platforms/{codex,claude,gemini}.rs`

---

**Next steps:**
1. Review audit report
2. Approve architecture
3. Create implementation branch
4. Start Week 1 tasks
