# Vision Model Enhancement - Documentation Index

**Project:** RWM Puppet Master  
**Feature:** CLI-only vision model integration for image reference analysis  
**Date:** 2026-02-03  
**Status:** 🟡 Proposed (awaiting approval)

---

## 📚 Document Roadmap

### For Decision Makers

**Start here:** [`VISION_MODEL_EXEC_SUMMARY.md`](./VISION_MODEL_EXEC_SUMMARY.md)
- **What:** High-level overview of the proposal
- **Why:** Problem statement, benefits, ROI
- **How long:** ~5 minute read
- **Key sections:**
  - Problem statement
  - Proposed solution
  - Risk analysis
  - Rollout strategy
  - Recommendation

---

### For Developers

**Implementation guide:** [`VISION_MODEL_QUICK_REF.md`](./VISION_MODEL_QUICK_REF.md)
- **What:** Quick reference for implementation
- **Why:** Step-by-step tasks, code snippets, testing checklist
- **How long:** ~10 minute read
- **Key sections:**
  - Architecture diagram
  - Files to create/modify
  - Platform runner details
  - Testing checklist
  - Implementation tasks (weekly breakdown)

---

### For Technical Deep Dive

**Full audit report:** [`VISION_MODEL_ENHANCEMENT_AUDIT.md`](./VISION_MODEL_ENHANCEMENT_AUDIT.md)
- **What:** Comprehensive technical analysis
- **Why:** Complete codebase audit, safety analysis, detailed design
- **How long:** ~30 minute read
- **Key sections:**
  - Current state analysis (920 lines of `reference_manager.rs`)
  - Platform runner capabilities (Codex, Claude, Gemini)
  - Proposed architecture (three-tier fallback)
  - Safety features (timeouts, size limits)
  - Testing strategy (unit, integration, manual)
  - Implementation plan (4-week timeline)
  - Risk assessment
  - Example outputs (vision vs. OCR vs. metadata)

---

### For Visual Learners

**Architecture diagrams:** [`VISION_MODEL_VISUAL.txt`](./VISION_MODEL_VISUAL.txt)
- **What:** ASCII art flowcharts and architecture diagrams
- **Why:** Visual representation of data flow and decision trees
- **How long:** ~15 minute read
- **Key sections:**
  - End-to-end processing flow (Tier 1 → Tier 2 → Tier 3)
  - Comparison: Vision vs. OCR vs. Metadata (side-by-side)
  - Safety features matrix
  - Implementation timeline
  - Decision tree (when to use vision vs. OCR)
  - Key metrics and targets

---

## 🎯 Quick Navigation

### By Role

| Role | Start with | Then read | Reference |
|------|------------|-----------|-----------|
| **Product Manager** | Exec Summary | Visual Architecture | Quick Ref (testing) |
| **Tech Lead** | Exec Summary | Full Audit | Quick Ref (tasks) |
| **Developer** | Quick Ref | Full Audit (Section 2.2) | Visual (flow) |
| **QA Engineer** | Quick Ref (testing) | Full Audit (Section 5) | Visual (comparison) |
| **Security Reviewer** | Exec Summary (risks) | Full Audit (Sections 3, 7) | Quick Ref (safety) |

### By Question

**"What problem are we solving?"**  
→ [`VISION_MODEL_EXEC_SUMMARY.md`](./VISION_MODEL_EXEC_SUMMARY.md) (Problem Statement)

**"How does it work?"**  
→ [`VISION_MODEL_VISUAL.txt`](./VISION_MODEL_VISUAL.txt) (Architecture diagrams)

**"What code needs to change?"**  
→ [`VISION_MODEL_QUICK_REF.md`](./VISION_MODEL_QUICK_REF.md) (Files to Create/Modify)

**"Is it safe?"**  
→ [`VISION_MODEL_ENHANCEMENT_AUDIT.md`](./VISION_MODEL_ENHANCEMENT_AUDIT.md) (Section 3: Safety Features)

**"What are the risks?"**  
→ [`VISION_MODEL_EXEC_SUMMARY.md`](./VISION_MODEL_EXEC_SUMMARY.md) (Safety & Risk Analysis)

**"How do I test it?"**  
→ [`VISION_MODEL_QUICK_REF.md`](./VISION_MODEL_QUICK_REF.md) (Testing Checklist)

**"What will users see?"**  
→ [`VISION_MODEL_EXEC_SUMMARY.md`](./VISION_MODEL_EXEC_SUMMARY.md) (User Experience)

**"Which platforms support vision?"**  
→ [`VISION_MODEL_ENHANCEMENT_AUDIT.md`](./VISION_MODEL_ENHANCEMENT_AUDIT.md) (Section 1.2, 4)

**"When can we ship it?"**  
→ [`VISION_MODEL_QUICK_REF.md`](./VISION_MODEL_QUICK_REF.md) (Implementation Tasks)

---

## 📋 Key Findings Summary

### Current Behavior (Audited)

**File:** `puppet-master-rs/src/interview/reference_manager.rs`  
**Lines:** 920  
**Image handling:** Lines 176-214 (in `load_context()`)  
**OCR method:** Lines 624-689 (`extract_image_text()`)

**Strengths:**
- ✅ Size limits enforced (10MB for OCR)
- ✅ Graceful error handling
- ✅ Binary availability checks
- ✅ Thread limiting

**Issues:**
- ❌ No timeout enforcement on OCR (critical bug)
- ❌ Text-only output (misses visual context)
- ❌ English-only OCR (hardcoded language)

---

### Proposed Enhancement

**Architecture:** Three-tier fallback chain
1. **Vision models** (Codex/Claude/Gemini) — Semantic understanding
2. **OCR** (Tesseract) — Text extraction
3. **Metadata** — File size only

**Scope:**
- **New code:** ~500 lines (`vision_extractor.rs`)
- **Modified code:** ~50 lines (`reference_manager.rs`)
- **New dependencies:** 0 (uses existing crates)
- **Timeline:** 3-4 weeks

**Safety:**
- ✅ 5MB size limit (vision), 10MB (OCR)
- ✅ 45s timeout (vision), 30s (OCR) — **both enforced**
- ✅ CLI sandboxing (no shell injection)
- ✅ Graceful degradation (no hard failures)

---

### Platform Support

| Platform | Vision Support | CLI Flag | Status | Priority |
|----------|----------------|----------|--------|----------|
| **Codex (OpenAI)** | ✅ Yes | `--image <path>` | Ready | 🥇 Primary |
| **Claude (Anthropic)** | ⚠️ Unknown | TBD | Research needed | 🥈 Secondary |
| **Gemini (Google)** | ❓ Unknown | TBD | Research needed | 🥉 Tertiary |

**Recommendation:** Start with Codex (proven support), add others after validation.

---

### Risk Assessment

| Category | Level | Mitigation |
|----------|-------|------------|
| **Technical** | Low-Medium | Graceful fallback to OCR |
| **Security** | Low-Medium | Size limits, timeouts, sandboxing |
| **Performance** | Low | Async processing, configurable timeouts |
| **Usability** | Low | Opt-in initially, clear documentation |

**Overall risk:** ✅ **LOW** (safe to proceed)

---

### Success Criteria

**Functional:**
- [ ] Vision analysis works for UI mockups, diagrams, screenshots
- [ ] Graceful fallback when vision fails (no errors)
- [ ] Works without CLIs installed (falls back to OCR)

**Performance:**
- [ ] Vision completes within 45s (99th percentile)
- [ ] OCR completes within 30s (99th percentile)
- [ ] No memory leaks after 10+ images

**Safety:**
- [ ] Size limits enforced (5MB vision, 10MB OCR)
- [ ] Timeouts enforced (both tiers)
- [ ] No command injection vulnerabilities
- [ ] No zombie processes

---

## 🚀 Implementation Roadmap

### Week 1: Foundation
- [ ] Create `vision_extractor.rs` module (~500 lines)
- [ ] Implement `VisionExtractor`, `VisionConfig` structs
- [ ] Add Codex runner integration
- [ ] Write 20+ unit tests
- [ ] Documentation (rustdoc)

**Deliverable:** Compiling module with test coverage

---

### Week 2: Integration
- [ ] Modify `reference_manager.rs` (~50 lines)
- [ ] Implement three-tier fallback logic
- [ ] **Fix OCR timeout bug** (convert to async)
- [ ] Add TOML config support
- [ ] Write 10+ integration tests

**Deliverable:** Working vision analysis in interview flow

---

### Week 3: Testing & Refinement
- [ ] Manual testing (10+ scenarios)
- [ ] Performance benchmarks
- [ ] Prompt optimization
- [ ] Documentation updates
- [ ] Graceful degradation verification

**Deliverable:** Production-ready feature

---

### Week 4: Optional Enhancements
- [ ] Add Claude/Gemini support
- [ ] Implement vision result caching
- [ ] Add configurable prompts
- [ ] GUI settings panel (if needed)

**Deliverable:** Multi-runner support + optimizations

---

## 🔍 Code Locations

### Current Code (To Audit)

```
puppet-master-rs/src/interview/
├── reference_manager.rs      ← 920 lines, image handling at 176-214, OCR at 624-689
├── mod.rs                     ← Needs: pub mod vision_extractor;
└── [other interview modules]

puppet-master-rs/src/platforms/
├── codex.rs                   ← Line 22: --image flag documentation
├── claude.rs                  ← Check for vision support
├── gemini.rs                  ← Check for vision support
└── model_catalog.rs           ← Vision models: get_vision_models() method
```

### New Code (To Create)

```
puppet-master-rs/src/interview/
└── vision_extractor.rs        ← NEW: ~500 lines

puppet-master-rs/tests/
└── interview_vision_tests.rs  ← NEW: ~300 lines

~/.puppet-master/
└── config.toml                ← NEW: [interview.vision] section
```

---

## 📦 Deliverables Checklist

### Documentation
- [x] Executive summary (`VISION_MODEL_EXEC_SUMMARY.md`)
- [x] Quick reference guide (`VISION_MODEL_QUICK_REF.md`)
- [x] Full audit report (`VISION_MODEL_ENHANCEMENT_AUDIT.md`)
- [x] Visual architecture (`VISION_MODEL_VISUAL.txt`)
- [x] Documentation index (this file)

### Code (To Implement)
- [ ] `vision_extractor.rs` module
- [ ] Modified `reference_manager.rs`
- [ ] Integration tests
- [ ] Config file schema
- [ ] README updates

### Testing (To Execute)
- [ ] Unit tests (30+)
- [ ] Integration tests (10+)
- [ ] Manual test scenarios (10+)
- [ ] Performance benchmarks
- [ ] Security review

---

## 🎓 Learning Resources

### For Understanding Vision Models

**What are vision models?**  
→ [`VISION_MODEL_EXEC_SUMMARY.md`](./VISION_MODEL_EXEC_SUMMARY.md) (Comparison: Vision vs. OCR)

**See example outputs:**  
→ [`VISION_MODEL_ENHANCEMENT_AUDIT.md`](./VISION_MODEL_ENHANCEMENT_AUDIT.md) (Appendix B)

**Understand the flow:**  
→ [`VISION_MODEL_VISUAL.txt`](./VISION_MODEL_VISUAL.txt) (Architecture diagram)

### For Understanding Platform Runners

**What is a platform runner?**  
→ `puppet-master-rs/src/platforms/runner.rs` (BaseRunner implementation)

**How do we call external CLIs?**  
→ `puppet-master-rs/src/platforms/codex.rs` (Example: Codex integration)

**Which models support vision?**  
→ `puppet-master-rs/src/platforms/model_catalog.rs` (get_vision_models())

### For Understanding Interview Flow

**How do reference materials work?**  
→ `puppet-master-rs/src/interview/reference_manager.rs` (Current implementation)

**What is the interview orchestrator?**  
→ `puppet-master-rs/src/interview/orchestrator.rs` (Interview coordination)

---

## 🐛 Known Issues & TODOs

### Critical (Must Fix)
1. **OCR timeout not enforced** (line 662 of `reference_manager.rs`)
   - Convert `extract_image_text()` to async
   - Use `tokio::time::timeout` wrapper
   - **Priority:** HIGH

### High Priority
2. **Claude CLI vision support unclear**
   - Research if `claude` CLI supports images
   - Test with `claude --help | grep image`
   - **Priority:** MEDIUM

3. **Gemini CLI availability unknown**
   - Research Gemini CLI installation
   - Check image input syntax
   - **Priority:** LOW

### Enhancement Opportunities
4. **Multi-language OCR** (currently English-only)
   - Make language configurable
   - Support common languages (es, fr, de, zh, ja)
   - **Priority:** LOW

5. **Vision result caching** (avoid re-analyzing same image)
   - Key on file hash (MD5)
   - TTL-based cache expiration
   - **Priority:** LOW

6. **GUI settings panel** (if TOML file insufficient)
   - Add vision config to settings UI
   - Enable/disable per-runner
   - **Priority:** LOW

---

## 📞 Contact & Support

**Questions about the proposal?**  
→ Tag `@rust-engineer` in PR comments

**Found issues in the audit?**  
→ Open issue: "Vision Model Enhancement: [Issue]"

**Ready to start implementation?**  
1. Review executive summary (5 min)
2. Read quick reference (10 min)
3. Create feature branch: `feature/vision-model-enhancement`
4. Start Week 1 tasks

**Need clarification on code?**  
→ See "Code Locations" section above, or ask in team chat

---

## 🏁 Decision Point

### Recommended Action: ✅ **APPROVE & PROCEED**

**Why approve?**
- ✅ High value (solves real user pain point)
- ✅ Low risk (graceful fallback, no breaking changes)
- ✅ Minimal scope (~500 lines new, ~50 modified)
- ✅ Zero new dependencies
- ✅ Safe (strict timeouts, size limits)
- ✅ Cost-effective (uses existing subscriptions)

**Why proceed now?**
- ✅ Clear implementation path (Codex first)
- ✅ Comprehensive audit complete
- ✅ Testing strategy defined
- ✅ Rollout plan established
- ✅ Fixes critical OCR timeout bug

**What's blocking?**
- ⏸️ Awaiting approval from tech lead / product owner

---

## 📊 Metrics Dashboard (Post-Launch)

Track these metrics after rollout:

```
Vision Analysis
├─ Success Rate: __% (target: >80%)
├─ Average Latency: __s (target: <45s)
├─ P99 Latency: __s (target: <45s)
└─ Memory Usage: __ MB (target: <100 MB)

Fallback Rate
├─ Vision → OCR: __% (target: <15%)
├─ OCR → Metadata: __% (target: <5%)
└─ Total Success: __% (target: >95%)

Errors
├─ CLI Auth Failures: __ (target: <1%)
├─ Timeout Exceeded: __ (target: <5%)
├─ Size Limit Rejected: __ (expected, not error)
└─ CLI Not Found: __ (expected, graceful)

User Adoption
├─ Vision Enabled: __% (target: >50% after opt-out)
├─ Images Analyzed: __ (total count)
├─ Average Analysis Quality: __/5 (user feedback)
└─ Manual Descriptions Added: __ (vision failures)
```

---

**Last Updated:** 2026-02-03  
**Status:** 🟡 Proposal complete, awaiting approval  
**Next Step:** Review executive summary → Approve → Create feature branch
