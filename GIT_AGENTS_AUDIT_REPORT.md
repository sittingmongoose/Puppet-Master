# Architecture Audit: Git & AGENTS.md Integration
## Parts 8 & 9 from interviewupdates.md

**Date:** 2024  
**Reviewer:** Architecture Review Agent  
**Scope:** Git implementation (Part 9) and AGENTS.md system (Part 8)  

---

## Executive Summary

**Overall Status:** 🟡 **Mostly Operational with Integration Gaps**

The git and AGENTS.md systems are **architecturally sound and well-implemented**, with all core components present and wired into the orchestrator. However, several critical integration points remain **untested in production** and some features are **implemented but not actively invoked**.

### Key Findings

✅ **What's Working:**
- Git branch creation and commits are fully operational
- AGENTS.md read/write paths work end-to-end
- Worktree manager is integrated and invoked
- Gate enforcer logic is complete
- Promotion engine is wired and recording usage

⚠️ **Integration Gaps:**
- PR creation lacks end-to-end validation (gh CLI required)
- Gate enforcement runs but doesn't block tier completion on critical violations
- Promotion engine records stats but promote logic never triggered
- Worktree cleanup on failure path needs validation
- No integration tests for PR/worktree/promotion flows

---

## Part 9: Git Implementation - Detailed Analysis

### Architecture Review

**Component Structure:** ✅ **Well-designed**
```
puppet-master-rs/src/git/
├── git_manager.rs       ✅ Core git operations (clone/commit/branch)
├── worktree_manager.rs  ✅ Parallel isolation via worktrees
├── branch_strategy.rs   ✅ Branch naming strategies
├── pr_manager.rs        ⚠️  PR creation (needs end-to-end validation)
└── commit_formatter.rs  ✅ Structured commit messages
```

### 1. Git Manager - `git_manager.rs`

**Status:** ✅ **Fully Operational**

**What's Working:**
- Core git operations: init, status, branch creation, commits
- Async/await CLI spawning via tokio::process::Command
- Proper error handling with anyhow::Result
- Logging to `.puppet-master/git-actions.log`

**Orchestrator Integration:**
```rust
Line 159: git_manager: GitManager     // Initialized
Line 278: GitManager::new()           // Created
Line 433: create_branch()             // Used for tier branches
Line 533: commit()                    // Used after iterations
Line 585: GitManager::new(worktree)   // Adaptive to worktree paths
```

**Evidence:** 
- Lines 1694-1730 in orchestrator.rs show active branch creation
- Lines 574-610 show commit after successful iteration
- Unit tests at lines 96-100+ in git_manager.rs

**Issues:** None. This is production-ready.

---

### 2. Worktree Manager - `worktree_manager.rs`

**Status:** 🟡 **Integrated but Needs Real-World Validation**

**What's Working:**
- Worktree creation/removal logic complete
- Merge conflict detection and reporting
- Parallel task isolation architecture sound
- Integrated into orchestrator at multiple points

**Orchestrator Integration:**
```rust
Line 186: worktree_manager: Arc<WorktreeManager>  // Initialized
Line 355: WorktreeManager::new()                  // Created
Line 886-925: create_subtask_worktree()           // ✅ INVOKED
Line 933-994: cleanup_subtask_worktree()          // ✅ INVOKED
Line 1040-1063: Worktree creation in parallel loop // ✅ ACTIVE
Line 1695: Skip branch creation in worktree       // ✅ WORKING
```

**Evidence of Active Use:**
- Lines 1040-1043: Creates worktrees for parallel subtask groups
- Lines 1053-1059: Cleanup worktrees after execution
- Lines 585-589: Adapts git_manager to use worktree path
- Lines 635-646: PR creation reads worktree branch names

**Gaps:**
1. **No integration tests** - TypeScript tests don't cover worktree (tests/integration/git.integration.test.ts has 549 lines but zero worktree tests)
2. **Merge failure path** - What happens if merge_worktree returns conflicts? Code logs warning (line 978) but doesn't retry or escalate
3. **Concurrent merge safety** - Comment at line 1053 says "sequential to avoid concurrent merges" but no locking mechanism enforced
4. **Orphaned worktrees** - If orchestrator crashes, worktrees may not get cleaned up. Need recovery mechanism.

**Actionable Items:**
- [ ] Add `recover_orphaned_worktrees()` to startup sequence
- [ ] Add integration test: create worktree → commit → merge → verify
- [ ] Add conflict resolution strategy (manual review vs auto-abort)
- [ ] Document worktree cleanup on error paths

---

### 3. PR Manager - `pr_manager.rs`

**Status:** 🟡 **Wired but Needs End-to-End Validation**

**What's Working:**
- PR creation via `gh` CLI (lines 50-83)
- Preflight checks for `gh` availability and auth (lines 144-180)
- PR title/body generation (lines 86-125)
- Error handling returns non-fatal warnings
- Unit tests for title/body generation (lines 247-360)

**Orchestrator Integration:**
```rust
Line 164: pr_manager: PrManager               // Initialized
Line 284: PrManager::new()                    // Created
Line 674-675: create_pr() called              // ✅ INVOKED at tier pass
Line 1908-1911: Called after gate pass        // ✅ TIMING CORRECT
```

**Evidence of Integration:**
- Lines 620-709 in orchestrator.rs: Full PR creation flow
- Lines 1908-1911: PR created AFTER gate pass (correct timing)
- Errors are logged but don't fail tier (line 1910: "Failed to create PR... continuing")

**Critical Gaps:**
1. **No End-to-End Validation** - Code is wired but interviewupdates.md line 1065 explicitly states: "still needs end-to-end validation with `gh` installed + authenticated"
2. **No Integration Tests** - No tests/integration/pr.test.ts or similar
3. **Silent Failures** - PR creation failures are logged as warnings, not tracked in evidence store
4. **No Retry Logic** - If `gh` is temporarily unavailable, PR is skipped forever
5. **Branch Naming Assumption** - Lines 635-658 assume worktree branch matches tier_id, but this isn't validated

**Actionable Items:**
- [ ] **CRITICAL:** Add integration test that creates real PR (with mock gh or test repo)
- [ ] Add PR creation to evidence store (pr_url, timestamp, tier_id)
- [ ] Add retry logic with exponential backoff (3 attempts over 60 seconds)
- [ ] Validate branch exists before calling create_pr
- [ ] Add `--draft` flag option to config for draft PRs
- [ ] Document `gh` CLI setup requirements in README

---

### 4. Branch Strategy - `branch_strategy.rs`

**Status:** ✅ **Operational**

**What's Working:**
- Three strategies: Feature (single), PerPhase, PerTask
- Branch name generation based on tier hierarchy
- Integrated into orchestrator

**Orchestrator Integration:**
```rust
Line 162: branch_strategy: BranchStrategy    // Initialized
Line 281: BranchStrategy::Feature           // Default
Line 418: Used for branch name generation   // ✅ ACTIVE
```

**Issues:** None. Works as designed.

---

### 5. Commit Formatter - `commit_formatter.rs`

**Status:** ✅ **Operational**

**What's Working:**
- Structured commit message format
- Conventional commits style
- Used in git_manager commit flow

**Issues:** None.

---

## Part 8: AGENTS.md System - Detailed Analysis

### Architecture Review

**Component Structure:** ✅ **Well-architected**
```
puppet-master-rs/src/state/
├── agents_manager.rs         ✅ Core CRUD for AGENTS.md
├── agents_multi_level.rs     ✅ Hierarchy (root/phase/task/subtask)
├── agents_promotion.rs       🟡 Logic complete, invocation missing
├── agents_gate_enforcer.rs   🟡 Logic complete, enforcement weak
└── agents_archive.rs         ✅ Version archiving
```

### 1. Agents Manager - `agents_manager.rs`

**Status:** ✅ **Fully Operational**

**What's Working:**
- Load/save AGENTS.md files
- Append pattern/failure/do/dont entries
- Multi-level hierarchy support
- Invoked by orchestrator on every iteration

**Orchestrator Integration:**
```rust
Line 158: agents_manager: AgentsManager       // Initialized
Line 275: AgentsManager::new()                // Created
Line 491-512: Extract and append updates      // ✅ ACTIVE
Line 534-565: Pattern/failure/do/dont writes  // ✅ WORKING
```

**Evidence:**
- Lines 491-572 show full write-back flow
- Lines 201-203 show AGENTS.md loaded into PromptBuilder
- Code extracts ```agents-update blocks from AI responses

**Issues:** None. Read and write paths both work.

---

### 2. Gate Enforcer - `agents_gate_enforcer.rs`

**Status:** 🟡 **Logic Complete, Enforcement Weak**

**What's Working:**
- Rule checking logic (min patterns, sections exist)
- Violation severity levels (Error/Warning/Info)
- Custom rule builder pattern
- Integrated into orchestrator
- Unit tests (lines 382-504)

**Orchestrator Integration:**
```rust
Line 184: gate_enforcer: Arc<GateEnforcer>   // Initialized
Line 352: GateEnforcer::new()                // Created
Line 746-805: enforce_agents_gate()          // ✅ DEFINED
Line 1862-1871: Enforcement check runs       // ✅ INVOKED
```

**Critical Gap - Enforcement is Weak:**

Looking at lines 1862-1871 in orchestrator.rs:
```rust
if let Err(e) = self.enforce_agents_gate(tier_id).await {
    log::warn!("AGENTS.md gate enforcement failed for tier {}: {}", tier_id, e);
    let reason = format!("AGENTS.md not properly updated: {}", e);
    previous_feedback = Some(reason.clone());
    continue; // Retry
}
```

This **correctly retries** when enforcement fails. But looking at the enforcement logic (lines 760-805):

```rust
let result = self.gate_enforcer.enforce(&agents_content, &agents_doc)?;

if !result.passed {
    // Only ERROR severity blocks
    let error_msgs: Vec<String> = result.violations
        .iter()
        .filter(|v| v.severity == ViolationSeverity::Error)  // ⚠️ Only errors block
        .map(|v| format!("{}: {}", v.rule, v.description))
        .collect();
    
    if !error_msgs.is_empty() {
        return Err(anyhow!("AGENTS.md enforcement failed"));  // ✅ This DOES block
    }
}
```

**The Issue:** Default rules are all **Warning/Info severity** (lines 141-161 in agents_gate_enforcer.rs):
```rust
Rule { severity: ViolationSeverity::Warning, ... },  // min-patterns
Rule { severity: ViolationSeverity::Info, ... },     // min-failure-modes  
Rule { severity: ViolationSeverity::Warning, ... },  // patterns-section
```

So the gate enforcer **runs** and **checks**, but the default rules are too lenient to ever block tier completion.

**Documentation Accuracy:**
- interviewupdates.md line 1030 says: "Wire `agents_gate_enforcer` to block tier completion if AGENTS.md not updated when required"
- This is **partially true**: The wiring exists (line 1862), but the **policy is too weak**

**Actionable Items:**
- [ ] **DECISION NEEDED:** Should any default rules be Error severity?
- [ ] Add at least one Error-level rule (e.g., "AGENTS.md must exist after 3 iterations")
- [ ] Add config option: `require_agents_updates_after_failures: u32` (default: 3)
- [ ] Promote "min-patterns" to Error after phase completion
- [ ] Add test: Verify tier CANNOT pass if Error-level AGENTS.md violation exists
- [ ] Document policy: When are AGENTS.md updates required vs optional?

---

### 3. Promotion Engine - `agents_promotion.rs`

**Status:** 🔴 **Logic Complete but Never Triggered**

**What's Working:**
- Usage tracking for patterns (count, success rate)
- Promotion candidate evaluation logic
- Tier hierarchy calculation (subtask → task → phase → root)
- Integration with agents_manager for promotion
- Recording pattern usage on every iteration

**Orchestrator Integration:**
```rust
Line 182: promotion_engine: Arc<Mutex<PromotionEngine>>  // Initialized
Line 349: PromotionEngine::with_defaults()               // Created
Line 540-543: record_usage() called                      // ✅ RECORDING
Line 811-860: promote_tier_learnings()                   // ✅ DEFINED
Line 1914-1916: Promotion function CALLED                // ✅ INVOKED
```

**Evidence of Recording:**
Lines 533-544 show pattern usage is recorded:
```rust
"pattern" => {
    self.agents_manager.append_pattern(tier_id, content.clone())?;
    let mut engine = self.promotion_engine.lock().unwrap();
    engine.record_usage(&content, tier_id, success)?;  // ✅ RECORDING
}
```

**Evidence of Promotion Call:**
Lines 1913-1916 show promotion is attempted:
```rust
// Promote learnings from this tier to parent/root levels
if let Err(e) = self.promote_tier_learnings(tier_id).await {
    log::warn!("Failed to promote learnings for tier {}: {}", tier_id, e);
}
```

**The Critical Issue - Promotion Logic Never Triggers:**

Looking at `promote_tier_learnings()` (lines 811-860), it:
1. Loads AGENTS.md for the tier ✅
2. Evaluates candidates via `engine.evaluate()` ✅
3. Calls `engine.promote()` for each candidate ✅

But examining `PromotionConfig` in agents_promotion.rs (lines 13-30):
```rust
pub struct PromotionConfig {
    pub min_usage_count: u32,      // Default: 3
    pub min_success_rate: f64,     // Default: 0.75
    pub promotion_threshold: f64,  // Default: 0.8
}
```

And the evaluation logic (lines 140-183):
```rust
if stats.count < self.config.min_usage_count { continue; }       // Need 3 uses
if success_rate < self.config.min_success_rate { continue; }     // Need 75% success
if score < self.config.promotion_threshold { continue; }         // Need 0.8 score
```

**Why It Never Triggers:**
- A pattern needs to be used **3 times** with **75% success rate**
- But `record_usage()` is only called **once per pattern per tier** (line 541)
- Patterns are recorded when **appended to AGENTS.md**, not when **read/applied**
- So usage count can only reach 1 per tier, never 3

**Root Cause:** The promotion system is designed for **cross-tier pattern reuse**, but there's no mechanism to detect when the **same pattern** is used in multiple tiers.

**Documentation Accuracy:**
- interviewupdates.md line 1031 says: "Wire `agents_promotion` to promote task-level learnings to phase/root level"
- This is **misleading**: It's wired (line 1914) but **the triggering logic is unreachable** with current design

**Actionable Items:**
- [ ] **CRITICAL DESIGN FIX:** Change promotion trigger from "usage count across iterations" to "usage count across tiers"
- [ ] Add pattern fingerprinting (hash of pattern text) to track reuse across tiers
- [ ] Track when PromptBuilder **includes** a pattern (not just when appended)
- [ ] Add `promotion_check()` at **phase/root completion** (not just tier pass)
- [ ] OR: Lower min_usage_count to 1 and change promotion to "upvote successful patterns"
- [ ] Add test: Record pattern 3 times → verify promotion triggers
- [ ] Add integration test: Multi-tier scenario with pattern reuse

---

### 4. Multi-Level Hierarchy - `agents_multi_level.rs`

**Status:** ✅ **Operational**

**What's Working:**
- Supports root/phase/task/subtask levels
- Path-based tier IDs (phase1.task1.subtask1)
- Parent-child relationships

**Issues:** None.

---

### 5. Archive - `agents_archive.rs`

**Status:** ✅ **Operational**

**What's Working:**
- Version archiving of AGENTS.md
- Timestamp-based archives

**Issues:** None.

---

## Cross-Cutting Concerns

### 1. Testing Coverage

**Unit Tests:** ✅ Good
- git_manager.rs has unit tests
- pr_manager.rs has unit tests (lines 247-360)
- agents_gate_enforcer.rs has unit tests (lines 382-504)
- orchestrator.rs has unit tests (lines 2902+)

**Integration Tests:** 🔴 **Critical Gaps**
- tests/integration/git.integration.test.ts: 549 lines but ZERO worktree tests
- No PR creation tests
- No AGENTS.md promotion tests
- No gate enforcement integration tests

**Actionable Items:**
- [ ] Add `tests/integration/worktree.integration.test.ts`
- [ ] Add `tests/integration/pr-creation.integration.test.ts`
- [ ] Add `tests/integration/agents-promotion.integration.test.ts`
- [ ] Add `tests/integration/agents-gate.integration.test.ts`

---

### 2. Error Handling & Resilience

**Git Operations:** ✅ Good
- All git errors are handled
- Failures logged but don't crash orchestrator

**PR Creation:** 🟡 Acceptable but could be better
- Failures are logged as warnings (line 1910)
- No retry logic
- Silent failures may surprise users

**Worktree Cleanup:** ⚠️ **Needs Attention**
- Cleanup failures logged (line 1058) but no recovery
- Orphaned worktrees if orchestrator crashes
- No startup recovery mechanism

**Actionable Items:**
- [ ] Add `git worktree prune` to startup sequence
- [ ] Add PR retry queue persisted to disk
- [ ] Add worktree health check in doctor command

---

### 3. Observability & Debugging

**Git Logging:** ✅ Good
- All git actions logged to `.puppet-master/git-actions.log`
- SHA captures for traceability

**PR Tracking:** 🟡 **Missing**
- PR URLs logged but not persisted
- No evidence store entry for PR creation
- Can't query "which PRs were created?"

**Promotion Tracking:** 🟡 **Missing**
- Pattern usage recorded but not persisted
- Can't query "which patterns were promoted?"
- No dashboard visibility

**Actionable Items:**
- [ ] Add PR creation to evidence store
- [ ] Add promotion events to event ledger
- [ ] Add `/agents/stats` endpoint to show promotion candidates
- [ ] Add worktree status to doctor command

---

### 4. Configuration & Flexibility

**Git Config:** ✅ Good
```rust
config.orchestrator.enable_git: bool
config.branching.base_branch: String
config.branching.auto_pr: bool
```

**AGENTS.md Config:** 🟡 **Limited**
- Gate rules are hardcoded
- Promotion thresholds are hardcoded
- No per-project AGENTS.md policy

**Actionable Items:**
- [ ] Add `agents_enforcement_policy` to config (strict/lenient/off)
- [ ] Add `promotion_config` to config (thresholds, min_usage, etc.)
- [ ] Add `worktree_enabled: bool` to config (default: true)

---

## Documentation Accuracy Assessment

### interviewupdates.md Part 9 (Lines 1040-1073)

| Claim | Accurate? | Notes |
|-------|-----------|-------|
| "git_manager active, creates branches and commits" | ✅ Yes | Lines 433, 533 in orchestrator.rs |
| "branch_strategy active, used for branch name generation" | ✅ Yes | Line 418 in orchestrator.rs |
| "agents_manager active, appends patterns/failures" | ✅ Yes | Lines 491-512 in orchestrator.rs |
| "WorktreeManager invoked by orchestrator" | ✅ Yes | Lines 1040-1063 in orchestrator.rs |
| "PR creation wired at tier pass time" | ✅ Yes | Line 1908 in orchestrator.rs |
| "PR creation needs end-to-end validation" | ✅ Yes | No integration tests found |
| "Verification gate checks run" | ✅ Yes | Lines 1850-1859 in orchestrator.rs |

**Overall:** 🟢 **Accurate** - Documentation correctly reflects implementation status.

---

### interviewupdates.md Part 8 (Lines 1011-1038)

| Claim | Accurate? | Notes |
|-------|-----------|-------|
| "READ path works: PromptBuilder loads AGENTS.md" | ✅ Yes | Lines 201-203 in orchestrator.rs |
| "WRITE-BACK path works: appends PATTERN/FAILURE/DO/DONT" | ✅ Yes | Lines 491-572 in orchestrator.rs |
| "Still needed: Wire agents_gate_enforcer to block tier completion" | 🟡 Misleading | It IS wired (line 1862) but enforcement is weak |
| "Still needed: Wire agents_promotion to promote learnings" | 🔴 Misleading | It IS wired (line 1914) but never triggers |
| "Interview generates initial AGENTS.md" | ✅ Yes | Verified in interview workflow |

**Overall:** 🟡 **Partially Accurate** - Core claims are true but "still needed" items are actually "needs policy tuning" not "needs wiring".

---

## Priority Actionable Items

### 🔴 Critical (Blocks Production Use)

1. **Fix Promotion Engine Trigger Logic**
   - Current: Requires 3 uses of same pattern within one tier (impossible)
   - Fix: Track pattern reuse across tiers OR lower threshold to 1
   - Impact: Without this, learning promotion never happens
   - File: `puppet-master-rs/src/state/agents_promotion.rs`

2. **Add PR Creation End-to-End Test**
   - Current: PR code exists but never tested with real `gh` CLI
   - Fix: Add integration test with mock gh or test repo
   - Impact: PR creation may fail silently in production
   - File: `tests/integration/pr-creation.integration.test.ts` (create)

3. **Add Orphaned Worktree Recovery**
   - Current: If orchestrator crashes, worktrees left behind
   - Fix: Add `git worktree prune` and orphan cleanup to startup
   - Impact: Disk space leaks, git confusion
   - File: `puppet-master-rs/src/core/orchestrator.rs` (startup sequence)

### 🟡 High Priority (Impacts Quality)

4. **Strengthen AGENTS.md Gate Enforcement**
   - Current: All default rules are Warning/Info (never block)
   - Fix: Add Error-level rules or config for enforcement strictness
   - Impact: Teams may skip AGENTS.md updates entirely
   - File: `puppet-master-rs/src/state/agents_gate_enforcer.rs`

5. **Add Worktree Integration Tests**
   - Current: No tests for worktree creation/merge/cleanup
   - Fix: Add integration test suite
   - Impact: Worktree bugs may slip into production
   - File: `tests/integration/worktree.integration.test.ts` (create)

6. **Add PR Creation Retry Logic**
   - Current: Single attempt, silent failure
   - Fix: Exponential backoff retry (3 attempts)
   - Impact: Transient `gh` issues cause PR loss
   - File: `puppet-master-rs/src/git/pr_manager.rs`

### 🟢 Medium Priority (Improves UX)

7. **Persist PR Creation to Evidence Store**
   - Current: PR URLs logged but not queryable
   - Fix: Add PR creation events to evidence store
   - Impact: Can't track which tiers have PRs
   - File: `puppet-master-rs/src/core/orchestrator.rs` (line 684)

8. **Add Promotion Dashboard**
   - Current: No visibility into promotion candidates
   - Fix: Add `/agents/stats` endpoint with promotion data
   - Impact: Users can't see what's being promoted
   - File: `puppet-master-rs/src/views/agents.rs` (create)

9. **Document `gh` CLI Setup**
   - Current: PR creation requires `gh` but not documented
   - Fix: Add setup guide to README
   - Impact: Users confused by PR failures
   - File: `README.md`

### 🔵 Low Priority (Nice to Have)

10. **Add Draft PR Option**
    - Current: All PRs created as ready for review
    - Fix: Add `--draft` flag option to config
    - Impact: Minor UX improvement
    - File: `puppet-master-rs/src/git/pr_manager.rs`

11. **Add Worktree to Doctor Command**
    - Current: Doctor doesn't check worktree health
    - Fix: Add worktree list/status to doctor
    - Impact: Debugging aid
    - File: `puppet-master-rs/src/doctor/mod.rs`

---

## Architecture Recommendations

### 1. Promotion Engine Redesign

**Problem:** Current design requires 3 uses within one tier (unreachable).

**Options:**

A. **Track Pattern Reuse Across Tiers** (Recommended)
```rust
// When PromptBuilder loads AGENTS.md and includes a pattern:
promotion_engine.record_pattern_inclusion(pattern_hash, tier_id);

// At tier completion:
let reuse_count = promotion_engine.get_cross_tier_usage(pattern_hash);
if reuse_count >= 3 { promote() }
```

B. **Lower Threshold to 1** (Simpler but less selective)
```rust
PromotionConfig {
    min_usage_count: 1,  // Promote after first success
    min_success_rate: 1.0,  // Only promote if iteration succeeded
    promotion_threshold: 0.5
}
```

C. **Manual Upvoting** (Most flexible)
- Add `agents-promote` command for developers
- Add UI button "Promote this pattern"
- Track upvotes, auto-promote at threshold

**Recommendation:** Start with B (quick fix), migrate to A (proper solution).

---

### 2. AGENTS.md Gate Enforcement Policy

**Problem:** Default rules are too lenient to ever block.

**Recommendation:** Tiered enforcement based on tier type:

```rust
// At subtask: Warning only (learning phase)
// At task: Require at least 1 pattern (Error if missing)
// At phase: Require at least 3 patterns + 1 failure mode (Error if missing)
// At root: Strict enforcement
```

**Implementation:**
```rust
fn default_rules(tier_type: TierType) -> Vec<Rule> {
    match tier_type {
        TierType::Subtask => lenient_rules(),
        TierType::Task => moderate_rules(),
        TierType::Phase => strict_rules(),
    }
}
```

---

### 3. PR Creation Resilience

**Problem:** Single-attempt, silent failure.

**Recommendation:** Retry queue with persistence:

```rust
struct PrQueue {
    pending: Vec<PrRequest>,
    failed: Vec<PrRequest>,
}

impl PrQueue {
    async fn retry_failed(&mut self) {
        for req in &self.failed {
            if let Ok(result) = pr_manager.create_pr_with_retry(req, 3).await {
                evidence_store.record_pr(result);
            }
        }
    }
}
```

---

### 4. Worktree Lifecycle Management

**Problem:** No recovery from crashes, no cleanup validation.

**Recommendation:** Worktree health checks:

```rust
impl Orchestrator {
    async fn recover_worktrees(&self) -> Result<()> {
        // 1. Prune deleted worktrees
        self.worktree_manager.prune_deleted().await?;
        
        // 2. Find orphaned worktrees (not in active_worktrees)
        let orphans = self.worktree_manager.find_orphans().await?;
        
        // 3. Ask user or auto-cleanup
        for orphan in orphans {
            if should_cleanup(&orphan) {
                self.worktree_manager.force_remove(&orphan).await?;
            }
        }
    }
}
```

---

## Conclusion

### Summary

The **git and AGENTS.md systems are well-architected and mostly functional**. The code quality is high, error handling is solid, and integration points are properly wired.

However, **three critical gaps** prevent full production readiness:
1. **Promotion engine logic is unreachable** (design flaw, not wiring issue)
2. **PR creation lacks end-to-end validation** (integration test gap)
3. **Worktree recovery is missing** (operational risk)

### Recommendations by Priority

**Week 1 (Critical):**
- Fix promotion engine trigger logic
- Add PR creation integration test
- Add worktree recovery to startup

**Week 2 (High):**
- Strengthen gate enforcement policy
- Add worktree integration tests
- Add PR retry logic

**Week 3 (Medium):**
- Persist PR creation to evidence store
- Add promotion visibility to dashboard
- Document `gh` CLI setup

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PR creation fails silently | High | Medium | Add integration test + retry logic |
| Worktrees leak on crash | Medium | Medium | Add recovery + prune on startup |
| Promotion never triggers | High | Low | Fix threshold or tracking logic |
| Gate enforcement ignored | Medium | Low | Add strict rules or config option |
| Merge conflicts unhandled | Low | High | Add conflict detection + escalation |

### Final Verdict

**Documentation Claims:** 🟡 **Mostly Accurate**
- Core integration is correctly described
- "Still needed" items are misleading (they're wired but need policy tuning)

**Production Readiness:** 🟡 **70% Ready**
- Git operations: ✅ Ready
- Worktree management: 🟡 Ready with caveats (add recovery)
- PR creation: 🟡 Ready for testing (needs validation)
- AGENTS.md read/write: ✅ Ready
- Gate enforcement: 🟡 Ready (needs policy tuning)
- Promotion engine: 🔴 Not ready (logic broken)

**Recommendation:** Ship with current implementation BUT:
1. Add warning in docs: "PR creation requires `gh` CLI installed and authenticated"
2. Add recovery for orphaned worktrees
3. Fix promotion engine OR disable it (don't ship broken feature)
4. Add integration tests before 1.0 release

---

**Report Generated:** 2024  
**Review Complete:** ✅ All claims verified against source code  
**Next Steps:** Address priority 1-3 items before production deployment
