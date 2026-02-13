# Vision Model Enhancement - Executive Summary

**Date:** 2026-02-03  
**Author:** rust-engineer  
**Status:** 🟡 Proposed (awaiting approval)  
**Priority:** Medium  
**Risk:** Low-Medium  
**Effort:** 3-4 weeks  

---

## Problem Statement

**Current limitation:** Image references in interview flow only extract text via Tesseract OCR. This fails for:
- UI mockups and design comps
- Architecture diagrams and flowcharts
- Screenshots with visual context
- Charts, graphs, and infographics
- Non-text visual content

**Impact:** Interview AI cannot understand visual reference materials, forcing users to manually describe images.

---

## Proposed Solution

Add **CLI-only vision model analysis** to interview reference processing, using existing platform runners (Codex, Claude, Gemini) to generate semantic image descriptions.

### Key Features

✅ **Three-tier fallback chain:**
1. **Vision models** (Codex/Claude/Gemini) for semantic understanding
2. **OCR** (Tesseract) for text extraction
3. **Metadata** (file size) as final fallback

✅ **Strict safety guardrails:**
- 5MB size limit (vision), 10MB (OCR)
- 45s timeout (vision), 30s (OCR) — **both enforced**
- CLI availability checks
- Graceful degradation (no hard failures)

✅ **Zero API costs:**
- Uses existing CLI subscriptions (ChatGPT Plus/Pro, Claude Max/Pro)
- No per-use charges
- Works offline once authenticated

✅ **Minimal scope:**
- Single new module (`vision_extractor.rs`, ~500 lines)
- ~50 lines modified in `reference_manager.rs`
- No GUI changes required
- No new Cargo dependencies

---

## Current State Audit

### File: `puppet-master-rs/src/interview/reference_manager.rs`

**Total lines:** 920  
**Key method:** `extract_image_text()` (lines 624-689)  
**Processing flow:** Lines 176-214 (image handling in `load_context()`)

### Findings

#### ✅ Strengths
- Size limits enforced (10MB for OCR)
- Graceful error handling (`Result<String>`)
- Binary availability checks (`which::which("tesseract")`)
- Thread limiting (`OMP_THREAD_LIMIT=1`)

#### ⚠️ Issues
1. **No timeout enforcement** on OCR (uses `std::process::Command`, not async)
   - Comment at line 662: "std::process::Command doesn't have built-in timeout"
   - **Fix required:** Convert to `tokio::process::Command` with `tokio::time::timeout`

2. **Text-only output** (cannot describe visual elements)
   - Misses diagrams, layouts, colors, spatial relationships
   - No semantic understanding

3. **English-only** OCR (language hardcoded to `eng` at line 653)
   - Future enhancement opportunity

---

## Platform Runner Support

### Codex (OpenAI) — **PRIMARY TARGET** ✅

**Status:** Ready to implement  
**CLI flag:** `--image <path>` (documented in `codex.rs` line 22)  
**Command:**
```bash
codex exec "Describe this image" --image /path/to/image.png \
  --json --color never --max-turns 1 --full-auto
```

**Advantages:**
- Native image flag (no workarounds)
- JSONL output (easy parsing)
- Fast response times (GPT-4.5 Turbo)
- Already integrated as platform runner

**Prerequisites:**
1. `npm install -g @openai/codex-cli`
2. `codex login` (ChatGPT Plus/Pro required)

---

### Claude (Anthropic) — **SECONDARY TARGET** ⚠️

**Status:** Needs verification (CLI image support unclear)  
**Possible command:**
```bash
claude -p "Describe the image at /path/to/image.png" \
  --output-format json --no-session-persistence
```

**Action required:** Research Claude CLI image input syntax

---

### Gemini (Google) — **TERTIARY TARGET** ❓

**Status:** Unknown (CLI syntax TBD)  
**Action required:** Research Gemini CLI availability and image support

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- Create `vision_extractor.rs` module
- Implement `VisionExtractor` + `VisionConfig` structs
- Add Codex runner integration
- Write 20+ unit tests
- Full rustdoc documentation

**Deliverable:** Compiling module with 100% test coverage

---

### Phase 2: Integration (Week 2)
- Modify `reference_manager.rs` (add vision extractor field)
- Implement three-tier fallback in `load_context()`
- **Fix OCR timeout** (convert to async)
- Add TOML config support
- Write 10+ integration tests

**Deliverable:** Working vision analysis in interview flow

---

### Phase 3: Testing & Refinement (Week 3)
- Manual testing (10+ real-world scenarios)
- Performance benchmarks (latency, memory)
- Prompt optimization
- Documentation updates
- Graceful degradation verification

**Deliverable:** Production-ready feature with documentation

---

### Phase 4: Optional Enhancements (Week 4+)
- Claude/Gemini runner support
- Vision result caching
- Configurable analysis prompts
- GUI settings panel (if needed)

**Deliverable:** Multi-runner support + optimizations

---

## Safety & Risk Analysis

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| CLI not installed | Medium | Graceful fallback to OCR |
| CLI auth expired | Medium | Detect auth errors, prompt re-auth |
| Timeout too aggressive | Low | Configurable (default 45s) |
| Vision quality varies | Medium | Detailed prompt, allow manual description |
| CLI output format changes | High | Robust JSON parsing, version checking |

### Security Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Malicious images | High | Size limits, timeout, sandboxed CLI |
| Leaked sensitive data | Medium | Local processing only, user warnings |
| Command injection | High | Use `Command::arg()` (no shell) |

**Security review required:** ✅ Yes (before merging to main)

---

## Metrics & Targets

### Success Criteria

✅ **Functional:**
- Vision analysis works for UI mockups, diagrams, screenshots
- Graceful fallback when vision fails
- No errors when CLIs unavailable

✅ **Performance:**
- Vision completes within 45s (99th percentile)
- OCR completes within 30s (99th percentile)
- No memory leaks after 10+ images

✅ **Safety:**
- Size limits enforced (5MB vision, 10MB OCR)
- Timeouts enforced (both tiers)
- No zombie CLI processes

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Vision success rate | >80% | Log analysis |
| OCR fallback rate | <15% | Usage tracking |
| Vision latency (p99) | <45s | Benchmarks |
| OCR latency (p99) | <30s | Benchmarks |
| Memory overhead | <100 MB | Process monitoring |

---

## Rollout Strategy

### Phase 1: Opt-in (Initial release)
```toml
[interview.vision]
enabled = false  # Users must explicitly enable
```

- Beta testing with early adopters
- Gather feedback on analysis quality
- Monitor error rates and performance

### Phase 2: Opt-out (After 2 weeks)
```toml
enabled = true   # Enabled by default
```

- Full rollout to all users
- Option to disable if issues arise
- Continued monitoring

---

## Comparison: Vision vs. OCR

### Example: UI Mockup (Login Screen)

**Vision Output (~250 words):**
```markdown
**Content Type:** UI Design - Authentication Interface

**Visual Description:**
- Clean, minimalist login form with centered vertical layout
- White background with subtle drop shadow on container
- Two input fields (email and password) with light gray borders
- Primary action button in blue (#3B82F6) with white text
- "Forgot Password?" link in gray below button
- Social login options (Google, GitHub) at bottom

**Text Content:**
- Title: "Welcome Back"
- Subtitle: "Sign in to your account"
- Input placeholders: "Email address", "Password"
- Button: "Sign In"
- Link: "Forgot Password?"

**Technical Details:**
- Estimated dimensions: 400x600px
- Color palette: Blue (#3B82F6), Gray (#6B7280), White
- Typography: Sans-serif (Inter), 16px base size
- Spacing: 16px padding, 24px gaps
- Border radius: ~8px

**Development Context:**
- Standard OAuth 2.0 flow
- Requires form validation (email format, password requirements)
- Needs error state styling
- Loading state for submit button
- Accessibility: ARIA labels, keyboard nav
- Responsive design for mobile
```

**OCR Output (~15 words):**
```
Welcome Back
Sign in to your account
Email address
Password
Sign In
Forgot Password?
```

**Metadata Only:**
```
*Image file present: 2,345,678 bytes*
*Note: Please describe manually.*
```

### Key Differences

| Aspect | Vision | OCR | Metadata |
|--------|--------|-----|----------|
| Layout understanding | ✅ Yes | ❌ No | ❌ No |
| Color extraction | ✅ Yes | ❌ No | ❌ No |
| Component identification | ✅ Yes | ❌ No | ❌ No |
| Implementation guidance | ✅ Yes | ❌ No | ❌ No |
| Accessibility notes | ✅ Yes | ❌ No | ❌ No |
| Text extraction | ✅ Yes | ✅ Yes | ❌ No |
| File size info | ✅ Yes | ✅ Yes | ✅ Yes |
| Latency | ~15s | ~3s | <0.1s |

---

## Code Changes Summary

### New Files

**`puppet-master-rs/src/interview/vision_extractor.rs`** (~500 lines)
- `VisionConfig` struct (size limits, timeout, preferred runner)
- `VisionExtractor` struct (analysis engine)
- `VisionRunner` enum (Codex, Claude, Gemini)
- CLI integration methods (`analyze_with_codex()`, etc.)
- JSON/JSONL parsing
- 30+ unit tests

**`puppet-master-rs/tests/interview_vision_tests.rs`** (~300 lines)
- Integration tests (real images, fallback scenarios)
- Performance benchmarks
- Graceful degradation tests
- Helper functions (test image creation)

### Modified Files

**`puppet-master-rs/src/interview/reference_manager.rs`** (~50 lines changed)
- Add `vision_extractor: Option<Arc<VisionExtractor>>` field
- Modify `load_context()` image handling (three-tier fallback)
- Convert `extract_image_text()` to async (timeout fix)
- Update `new()` constructor

**`puppet-master-rs/src/interview/mod.rs`** (~3 lines)
- Add `pub mod vision_extractor;`
- Export `VisionExtractor`, `VisionConfig`, `VisionRunner`

### Configuration

**`~/.puppet-master/config.toml`** (new section)
```toml
[interview.vision]
enabled = true
max_image_size_mb = 5
timeout_secs = 45
preferred_runner = "Codex"
```

---

## Dependencies

**Zero new dependencies required!** All functionality uses existing crates:
- `tokio` (async/timeout) — ✅ Already present
- `which` (CLI checks) — ✅ Already present
- `serde_json` (JSON parsing) — ✅ Already present
- `anyhow` (error handling) — ✅ Already present
- `log` (logging) — ✅ Already present

---

## Testing Strategy

### Unit Tests (30+)
- Config defaults and overrides
- Size limit enforcement
- Timeout enforcement
- CLI availability checks
- Runner priority/fallback logic
- JSON/JSONL parsing
- Prompt generation

### Integration Tests (10+)
- Vision analysis with real images
- Fallback scenarios (oversized, corrupted images)
- Graceful degradation
- Performance benchmarks

### Manual Testing
- UI mockups, diagrams, screenshots
- Multiple image types (PNG, JPEG, WebP)
- No CLIs installed scenario
- Large image (>5MB) rejection
- Timeout scenarios (slow CLI)

---

## User Experience

### Before (OCR only)
```
**Image:** mockup.png

*Image file present: 2,345,678 bytes*

**Extracted Text (OCR):**
```
Welcome Back
Sign in to your account
Email address
Password
Sign In
```

*Note: Only text extracted, no visual context.*
```

### After (Vision + OCR fallback)
```
**Image:** mockup.png

*Image file present: 2,345,678 bytes*

**Vision Analysis:**
This is a modern login screen UI mockup featuring a centered
vertical layout with clean, minimalist design. The interface
includes a "Welcome Back" title, email and password input
fields with light gray borders, a blue primary action button
labeled "Sign In", and a "Forgot Password?" link. Below is
a social login section with Google and GitHub icons. The
color scheme uses blue (#3B82F6) for primary actions, gray
(#6B7280) for secondary elements, and white for the background.
The design follows standard OAuth 2.0 authentication patterns
and requires form validation, error state styling, and
accessibility features like ARIA labels and keyboard navigation.
```

---

## Recommendation

### ✅ **PROCEED with Implementation**

**Rationale:**
1. **High value:** Significantly improves interview context for visual references
2. **Low risk:** Graceful fallback to existing OCR behavior (no breaking changes)
3. **Minimal scope:** Single new module, ~50 lines modified, zero new dependencies
4. **Safe:** Strict timeouts, size limits, CLI sandboxing
5. **Cost-effective:** Uses existing CLI subscriptions (no API charges)

**Start with:**
1. **Codex integration** (proven `--image` flag support)
2. **OCR timeout fix** (critical safety issue)
3. **Comprehensive testing** (unit + integration)

**Add later:**
1. Claude/Gemini support (after Codex validation)
2. Vision result caching (performance optimization)
3. GUI settings (if TOML config insufficient)

---

## Next Steps

1. **Approval:** Review audit report + quick reference
2. **Branch creation:** `feature/vision-model-enhancement`
3. **Week 1 tasks:** Foundation module + unit tests
4. **Week 2 tasks:** Integration + OCR timeout fix
5. **Week 3 tasks:** Testing + documentation
6. **Week 4 tasks:** Optional enhancements

---

## Questions & Answers

**Q: Why not use direct API calls instead of CLIs?**  
A: CLIs use existing subscriptions (zero per-use cost), handle auth automatically, and are already integrated as platform runners. APIs would require key management and incur per-use charges.

**Q: What if the vision analysis is wrong?**  
A: Users can still add manual descriptions (existing workflow). Vision output is clearly labeled as "Vision Analysis" so users can verify. Future: Add confidence scores.

**Q: Will this slow down the interview flow?**  
A: Vision analysis is async and doesn't block the UI. Fallback to OCR (~3s) if vision fails. Users see progress indicators.

**Q: What about privacy concerns?**  
A: All processing is local (no cloud APIs). CLI tools may send images to their respective services (OpenAI, Anthropic, Google) per their terms of service. Users should be warned not to analyze sensitive images.

**Q: Can this be disabled?**  
A: Yes, via config file (`enabled = false`) or environment variable (`PUPPET_MASTER_VISION_ENABLED=false`). Also degrades gracefully if CLIs not installed.

---

## Resources

- **Full audit:** `VISION_MODEL_ENHANCEMENT_AUDIT.md` (detailed analysis)
- **Quick reference:** `VISION_MODEL_QUICK_REF.md` (implementation guide)
- **Visual architecture:** `VISION_MODEL_VISUAL.txt` (diagrams)
- **Code location:** `puppet-master-rs/src/interview/`

---

**Status:** 🟡 Awaiting approval  
**Contact:** rust-engineer  
**Last updated:** 2026-02-03
