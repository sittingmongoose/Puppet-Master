# STORAGE/STATE/COMMAND AUDIT — EXECUTIVE SUMMARY

**Date:** 2026-03-09  
**Status:** 🔴 **2 BLOCKERS, 3 HIGH-PRIORITY GAPS FOUND**

---

## CRITICAL ISSUES (MUST FIX BEFORE IMPLEMENTATION)

### 🚫 BLOCKER #1: Safe-Point Restore Outcome Enum UNDEFINED
**Location:** `Contracts_V0.md:1007`  
**Issue:** Event payload requires "restore outcome enum" but **values are never listed**  
**Impact:** Cannot implement `safe_point.restored` events  
**Fix:** Add enum definition to Contracts_V0.md (2 hours)

### 🚫 BLOCKER #2: Attempt Terminal State Enum INCOMPLETE
**Location:** `Contracts_V0.md:979`  
**Issue:** "terminal state enum" referenced but **no canonical value set exists**  
**Impact:** Cannot validate attempt lifecycle state machines  
**Fix:** Define complete `AttemptTerminalState` enum (2 hours)

---

## HIGH-PRIORITY GAPS (WILL CAUSE RUNTIME BUGS)

### ⚠️ HIGH #3: Counter Semantics Relationship UNSPECIFIED
**Location:** `storage-plan.md:1066-1071`  
**Issue:** Five counters (automatic_retry, manual_resume, etc.) defined but **mathematical relationship unknown**  
**Impact:** Audit trail verification cannot validate consistency  
**Fix:** Document counter relationship matrix (4 hours)

### ⚠️ HIGH #4: blocked_sequence Edge Case AMBIGUOUS
**Location:** `storage-plan.md:1074`  
**Issue:** Blocked reason changes without unblocking—**same episode or new episode?**  
**Impact:** Projection keying breaks, UI counts wrong  
**Fix:** Clarify episode boundary semantics (2 hours)

### ⚠️ HIGH #5: Event Ordering Guarantees MISSING
**Location:** `storage-plan.md` (throughout)  
**Issue:** Append-only seglog but **no contract for concurrent event streams**  
**Impact:** Race conditions, non-deterministic replay  
**Fix:** Document ordering guarantees and projector behavior (6 hours)

---

## MEDIUM-PRIORITY ISSUES (WILL CAUSE EDGE CASE FAILURES)

| # | Issue | Location | Impact | Effort |
|---|-------|----------|--------|--------|
| 6 | Wizard checkpoint schema not formalized | `storage-plan.md:914` | Fragile recovery | 4h |
| 7 | replan_generation lifecycle scattered | Multiple files | Edge case bugs | 4h |
| 8 | interrupted_by_restart classification unclear | `storage-plan.md:1125` | Inconsistent state | 2h |

---

## LOW-PRIORITY ISSUES (QUALITY OF LIFE)

| # | Issue | Location | Impact | Effort |
|---|-------|----------|--------|--------|
| 9 | detail_ref format undefined | `Contracts_V0.md` (6 refs) | Integration confusion | 2h |
| 10 | safe_point namespace missing from redb schema | `storage-plan.md:477-517` | Implementation confusion | 1h |

---

## QUICK STATS

- **Total Findings:** 10
- **Blocker:** 2 (cannot implement without fixes)
- **High:** 3 (runtime bugs likely)
- **Medium:** 3 (edge case failures)
- **Low:** 2 (quality issues)

**Estimated Effort to Resolve All:** 2-3 person-days

---

## IMMEDIATE ACTION REQUIRED

1. **TODAY:** Add enum definitions for:
   - `SafePointRestoreOutcome` (Blocker #1)
   - `AttemptTerminalState` (Blocker #2)

2. **THIS WEEK:** Document:
   - Counter relationship semantics (High #3)
   - blocked_sequence edge case rules (High #4)
   - Event ordering contract (High #5)

3. **NEXT SPRINT:** Formalize:
   - Wizard checkpoint schema (Medium #6)
   - replan_generation lifecycle (Medium #7)
   - interrupted_by_restart classification (Medium #8)

---

## FILES REQUIRING UPDATES

| File | Updates Needed | Priority |
|------|----------------|----------|
| `Plans/Contracts_V0.md` | Add 2 enum definitions | **P0** |
| `Plans/storage-plan.md` | Add counter relationships, ordering guarantees, namespace | **P1** |
| `Plans/Executor_Protocol.md` | Add replan_generation lifecycle | **P2** |
| `Plans/chain-wizard-flexibility.md` | Add checkpoint schema integration | **P2** |

---

## RISK ASSESSMENT

**Without fixes:**
- ❌ Implementation blocked on 2 critical enums
- ❌ Runtime bugs in counter tracking and audit trails
- ❌ Non-deterministic behavior in concurrent scenarios
- ❌ Fragile recovery after restarts
- ❌ User confusion from inconsistent blocked episode counts

**With fixes:**
- ✅ Clear implementation path
- ✅ Auditable counter semantics
- ✅ Deterministic event ordering
- ✅ Robust recovery contracts
- ✅ Consistent user experience

---

## RECOMMENDATIONS

1. **Create `Plans/Enumerations.md`** — Consolidate all state enums in one canonical registry
2. **Add counter relationship matrix** — Visual decision tree for "which counter to increment?"
3. **Define reference format standards** — Unified spec for detail_ref, report_ref, artifact_ref
4. **Write acceptance tests** — For event ordering, counter consistency, state transitions

---

**Full Report:** See `STORAGE_STATE_COMMAND_AUDIT_REPORT.md` for detailed findings, evidence, and remediation plans.

**Sign-off Required:** Architect, Storage Lead, Runtime Lead
