# STORAGE/STATE GAPS — IMPLEMENTER CHECKLIST

**Use this checklist to verify gaps are resolved before implementing affected components.**

---

## ☑️ BLOCKERS (Cannot start implementation until resolved)

### [ ] BLOCKER-1: SafePoint Restore Outcome Enum
**Component:** Safe-point recovery system  
**Question:** "What values can `safe_point.restored.restore_outcome` have?"  
**Resolution Required:**
- [ ] Enum values defined in `Contracts_V0.md`
- [ ] Semantics documented for each value
- [ ] Mapping to `failure_class` when applicable
- [ ] Retry policy per outcome documented

**Blocked Work:**
- `safe_point.restored` event emission
- Safe-point recovery projector logic
- UI restore status display
- Analytics restore reliability metrics

---

### [ ] BLOCKER-2: Attempt Terminal State Enum
**Component:** Attempt lifecycle validation  
**Question:** "What are all valid terminal states for an attempt?"  
**Resolution Required:**
- [ ] Complete enum defined in `Contracts_V0.md`
- [ ] Lifecycle validation rules documented
- [ ] Relationship to `failure_class` clarified
- [ ] State machine transitions specified

**Blocked Work:**
- `attempt.completed` event validation
- Executor lifecycle state machine
- Run graph visualization terminal states
- Retry policy enforcement

---

## ⚠️ HIGH-PRIORITY (Will cause bugs if not resolved)

### [ ] HIGH-3: Counter Semantics Relationship
**Component:** Attempt counter tracking  
**Question:** "Do the 4 policy counters sum to `retry_count`?"  
**Resolution Required:**
- [ ] Mathematical relationship documented in `storage-plan.md`
- [ ] Mutually exclusive vs independent clarified
- [ ] Decision matrix: `(wake_reason, prior_state) → counter_to_increment`
- [ ] Example scenarios provided

**Risky Work:**
- Counter incrementation logic
- Audit trail verification
- Analytics dashboard metrics
- Forensic debugging queries

**Self-Check Questions:**
```
❓ If attempt_count = 5 and retry_count = 4:
   - Does automatic_retry_count + prerequisite_resume_count + 
     manual_resume_count + remediation_retry_count = 4?
   - Can one attempt increment multiple counters?
   - Are there attempts that increment none of the policy counters?
```

---

### [ ] HIGH-4: blocked_sequence Edge Case
**Component:** Blocked episode tracking  
**Question:** "If blocked reason changes without unblocking, is it a new episode?"  
**Resolution Required:**
- [ ] Episode boundary semantics defined in `storage-plan.md`
- [ ] State machine diagram added
- [ ] Reason-change-while-blocked scenario documented
- [ ] Example transitions provided

**Risky Work:**
- `blocked_projection` record creation
- Blocked episode keying
- UI "Blocked N times" display
- Historical blocked episode queries

**Self-Check Questions:**
```
❓ Scenario: permission_denied → filesafe_blocked (no unblock)
   - Same episode (blocked_sequence unchanged)?
   - New episode (blocked_sequence incremented)?
   - Does node.unblocked emit when reason changes?
```

---

### [ ] HIGH-5: Event Ordering Guarantees
**Component:** Event stream ingestion and projection  
**Question:** "Can events from different producers arrive out of order?"  
**Resolution Required:**
- [ ] Single-writer vs multi-writer constraint documented
- [ ] Happens-before relationships specified
- [ ] Projector reordering behavior defined
- [ ] Acceptance criteria for deterministic replay added

**Risky Work:**
- Seglog appender implementation
- Projector event consumption
- Scheduler wakeup ordering
- Remediation lineage integrity
- Restart recovery

**Self-Check Questions:**
```
❓ If executor emits attempt.started and attempt.completed concurrently:
   - Are they ordered by global seq before projector sees them?
   - Can projector see completed before started?
   - What guarantees exist for prerequisite → unblock → wake ordering?
```

---

## 🟡 MEDIUM-PRIORITY (Will cause edge case failures)

### [ ] MEDIUM-6: Wizard Checkpoint Schema
**Component:** Wizard state recovery  
**Question:** "What is the complete redb key pattern and JSON schema for wizard checkpoints?"  
**Resolution Recommended:**
- [ ] Full schema added to `storage-plan.md` redb table
- [ ] Versioning policy documented
- [ ] Integration with `interview_session` clarified

**Affected Work:** Wizard recovery after restart, blocked wizard state persistence

---

### [ ] MEDIUM-7: replan_generation Lifecycle
**Component:** Replan invalidation logic  
**Question:** "When does `replan_generation` increment?"  
**Resolution Recommended:**
- [ ] Canonical trigger list documented
- [ ] Scope clarified (global run gen vs per-node)
- [ ] Relationship to `remediation_generation` specified

**Affected Work:** Attempt staleness validation, scheduler generation checks

---

### [ ] MEDIUM-8: interrupted_by_restart Classification
**Component:** Restart recovery classification  
**Question:** "Is `interrupted_by_restart` a `failure_class` or a terminal state?"  
**Resolution Recommended:**
- [ ] Taxonomy placement clarified in `Executor_Protocol.md`
- [ ] Retry policy documented
- [ ] Resume behavior specified

**Affected Work:** Restart recovery projector, attempt classification logic

---

## 🔵 LOW-PRIORITY (Quality of life issues)

### [ ] LOW-9: detail_ref Format
**Component:** Blocked payload detail references  
**Resolution Recommended:** Format specification added to `Contracts_V0.md`

**Self-Check:** "If I receive `detail_ref = 'xyz'`, is it an artifact ID, file path, or event ref?"

---

### [ ] LOW-10: safe_point Namespace Missing
**Component:** Safe-point storage  
**Resolution Recommended:** Add namespace to `storage-plan.md` redb schema table

**Self-Check:** "Where do I store safe_point records in redb? What's the key pattern?"

---

## 🎯 IMPLEMENTATION READINESS GATES

Before starting component implementation, ensure:

| Component | Blockers Resolved | High-Priority Resolved | Medium-Priority Reviewed |
|-----------|-------------------|------------------------|--------------------------|
| Safe-point recovery | ✅ #1 | ✅ #5 | ✅ #10 |
| Attempt lifecycle | ✅ #2 | ✅ #5 | ✅ #8 |
| Counter tracking | — | ✅ #3 | — |
| Blocked projections | — | ✅ #4, #5 | — |
| Wizard recovery | — | — | ✅ #6 |
| Scheduler validation | — | ✅ #5 | ✅ #7 |

---

## 📋 VERIFICATION QUESTIONS FOR CODE REVIEWS

**Safe-point recovery:**
- [ ] Does `safe_point.restored` event payload match the defined enum?
- [ ] Are all restore outcomes handled in the projector?

**Attempt lifecycle:**
- [ ] Does attempt terminal state match the canonical enum?
- [ ] Are invalid state transitions rejected?

**Counter incrementation:**
- [ ] Which counter is incremented for this wake_reason?
- [ ] Does the decision match the documented matrix?

**Blocked episodes:**
- [ ] Does reason-change-while-blocked create a new episode?
- [ ] Does blocked_sequence increment match the semantic rule?

**Event ordering:**
- [ ] Are concurrent events properly sequenced before projection?
- [ ] Does replay produce identical state regardless of timing?

---

## 🚀 QUICK START FOR NEW IMPLEMENTERS

**Step 1:** Read full audit report (`STORAGE_STATE_COMMAND_AUDIT_REPORT.md`)  
**Step 2:** Check this checklist for your component  
**Step 3:** If blockers/high-priority items are unresolved, **STOP and escalate**  
**Step 4:** If resolved, proceed with implementation referencing canonical specs  
**Step 5:** In code review, verify against this checklist

---

## 📞 ESCALATION

**If you encounter unresolved gaps during implementation:**

1. **Check audit report** for detailed findings and recommended fixes
2. **Tag in PR/issue:** @architect @storage-lead @runtime-lead
3. **Reference finding number** (e.g., "BLOCKER-1 still unresolved, cannot implement safe_point.restored")
4. **Do not proceed with guesses** — ambiguity will cause bugs

---

**Last Updated:** 2026-03-09  
**Audit Report:** `STORAGE_STATE_COMMAND_AUDIT_REPORT.md`  
**Executive Summary:** `STORAGE_AUDIT_EXECUTIVE_SUMMARY.md`
