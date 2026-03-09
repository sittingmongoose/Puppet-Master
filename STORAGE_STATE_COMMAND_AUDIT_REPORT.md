# STATE / STORAGE / COMMAND SUBAUDIT REPORT
**Audit Date:** 2026-03-09  
**Scope:** Planning Document Storage Models, Persistence Schemas, Lifecycle/Recovery Behavior, Command/Event Wiring  
**Context:** Large rewrite run introducing runtime scheduler scoring, wakeups, remediation lineage, safe points, retry taxonomy, and draft decomposition degradation contracts

---

## EXECUTIVE SUMMARY

This audit identified **10 critical gaps** in state models, persistence schemas, and lifecycle contracts across the planning documentation. The findings range from **BLOCKER-level** missing enum definitions that prevent implementation to **HIGH-priority** semantic ambiguities that will cause runtime inconsistencies.

**Key Risk Areas:**
- Missing enum value definitions for critical state transitions
- Undefined counter relationships creating audit trail ambiguities
- Edge case semantics for blocked episode transitions
- No explicit event ordering guarantees for concurrent producers
- Incomplete storage namespace isolation specifications

---

## DETAILED FINDINGS

### 1. SAFE-POINT RESTORE OUTCOME ENUM — **BLOCKER**

**WHAT:** `Contracts_V0.md` references a "restore outcome enum" for `safe_point.restored` events but **never enumerates the concrete values**.

**WHERE:**
- `Plans/Contracts_V0.md:636` — mentions `restore_outcome` field
- `Plans/Contracts_V0.md:1007` — specifies "restore outcome enum" requirement
- **NO DEFINITION FOUND** in any planning document

**EVIDENCE:**
```
safe_point.restored MUST carry:
- safe_point_id
- source_attempt_id
- resulting_attempt_id?
- restore outcome enum         <-- ENUM VALUES NOT DEFINED
- restore detail ref when applicable
```

**WHY IT MATTERS:**
- **Implementers cannot build the event payload** without knowing valid values
- **Projectors cannot classify restore outcomes** for recovery logic
- **UI cannot display restore status** (success/partial/failed)
- **Analytics cannot aggregate restore reliability metrics**
- **Scheduler cannot make correct recovery decisions** on restore failures

**MISSING DEFINITION (inferred from context, needs formal specification):**
```rust
enum SafePointRestoreOutcome {
    RestoredOk,           // Full restore succeeded
    RestoreFailed,        // Restore attempt failed
    PartialRestore,       // Some state restored, degraded
    RestoreAbandoned,     // User or system cancelled restore
    StateConflict,        // Local work conflicts with safe point
    SafePointCorrupted,   // Safe point data integrity failure
}
```

**SEVERITY:** **BLOCKER**  
Without this enum, `safe_point.restored` events cannot be implemented or validated.

**RECOMMENDATION:**
Add formal enum definition to `Contracts_V0.md` with:
- Complete value set
- Semantics for each value
- Mapping to failure_class when applicable
- UI display strings
- Retry policy per outcome

---

### 2. ATTEMPT TERMINAL STATE ENUM — **BLOCKER**

**WHAT:** `Contracts_V0.md` `attempt.completed` event references a "terminal state enum" but **never enumerates the values**.

**WHERE:**
- `Plans/Contracts_V0.md:979` — specifies "terminal state enum" requirement
- `Plans/Executor_Protocol.md:80` — mentions "done and failed are terminal states"
- `Plans/Run_Modes.md:258` — references `status` as `success | cancelled | failed`
- **NO CANONICAL ENUM DEFINITION** consolidating all terminal states

**EVIDENCE:**
```
attempt.completed MUST carry:
- run_id, thread_id, node_id, attempt_id
- terminal state enum         <-- ENUM VALUES NOT DEFINED
- failure_class?
- all counter fields relevant to the canonical matrix
```

**WHY IT MATTERS:**
- **Attempt lifecycle validation cannot be enforced** without canonical terminal states
- **Restart recovery logic** (`storage-plan.md:1125`) classifies `starting`/`running` as `interrupted_by_restart` but **unclear if this is a terminal state or failure_class**
- **Graph visualization** cannot display correct terminal node states
- **Retry policy decisions** depend on distinguishing terminal from retriable states

**PARTIAL REFERENCES FOUND:**
- `success` (Run_Modes.md:258)
- `cancelled` (Run_Modes.md:258, CLI_Bridged_Providers.md:207)
- `failed` (Run_Modes.md:258, Executor_Protocol.md:80)
- `done` (Executor_Protocol.md:80, CLI_Bridged_Providers.md:207)
- `interrupted_by_restart` (Executor_Protocol.md:479, storage-plan.md:1125) — **status unclear**

**SEVERITY:** **BLOCKER**  
Without a canonical enum, attempt lifecycle state machines cannot be validated.

**RECOMMENDATION:**
Define canonical `AttemptTerminalState` enum in `Contracts_V0.md`:
```rust
enum AttemptTerminalState {
    Success,              // Completed successfully
    Failed,               // Terminal failure (see failure_class)
    Cancelled,            // User/system cancellation
    InterruptedByRestart, // App restart during execution
    Abandoned,            // Explicit user abandonment
    Superseded,           // New generation invalidated this attempt
}
```
Clarify relationship to `failure_class` and `blocked_reason_code`.

---

### 3. COUNTER SEMANTICS RELATIONSHIP — **HIGH**

**WHAT:** `storage-plan.md` defines five independent counters but **does not specify their mathematical relationship**.

**WHERE:**
- `Plans/storage-plan.md:1066-1069` — defines counter family
- `Plans/storage-plan.md:1071` — states they are "independent policy counters and MUST NOT be inferred by subtracting from `attempt_count`"

**EVIDENCE:**
```
Counter families:
- attempt_count                    (total attempts)
- automatic_retry_count
- prerequisite_resume_count
- manual_resume_count
- remediation_retry_count

"The other counters are independent policy counters and 
MUST NOT be inferred by subtracting from attempt_count."
```

**WHY IT MATTERS:**
- **Audit trail verification cannot validate counter consistency** without a relationship spec
- **Sum of policy counters may or may not equal retry_count** (`retry_count = attempt_count - 1`)
- **Unclear if policy counters are mutually exclusive** (can one attempt increment multiple?)
- **Analytics dashboards cannot aggregate meaningful metrics** without understanding overlaps
- **Forensic debugging of attempt history** requires knowing if counters partition the attempt space

**QUESTIONS NEEDING ANSWERS:**
1. Does `automatic_retry_count + prerequisite_resume_count + manual_resume_count + remediation_retry_count = retry_count`?
2. Does `automatic_retry_count + prerequisite_resume_count + manual_resume_count + remediation_retry_count ≤ retry_count`?
3. Can a single attempt increment multiple counters (e.g., both `prerequisite_resume_count` and `remediation_retry_count`)?
4. Are there attempts that increment `attempt_count` but none of the policy counters (e.g., first attempt)?
5. How do these counters relate to `blocked_sequence` (which counts blocked episodes, not attempts)?

**SEVERITY:** **HIGH**  
Without the relationship, audit verification and metric aggregation will be inconsistent.

**RECOMMENDATION:**
Add explicit relationship documentation to `storage-plan.md`:
- State whether policy counters sum to `retry_count` or are independent dimensions
- Specify if counters are mutually exclusive per attempt
- Document which attempt types increment which counters
- Provide decision matrix: `(wake_reason, prior_state) -> which_counter_to_increment`

---

### 4. BLOCKED_SEQUENCE EDGE CASE — **HIGH**

**WHAT:** `blocked_sequence` is defined as incrementing "each time the node enters a new blocked episode **after not being blocked**", but **transition from one blocked reason to another without unblocking is undefined**.

**WHERE:**
- `Plans/storage-plan.md:1074` — defines `blocked_sequence` semantics
- `Plans/Contracts_V0.md:989` — specifies `node.unblocked` emission
- **NO SPECIFICATION** for reason-change-while-blocked scenario

**EVIDENCE:**
```
blocked_sequence is a per-node monotonic counter 
incremented each time the node enters a new blocked 
episode after not being blocked.
```

**SCENARIO:**
```
1. Node blocked: blocked_reason_code = permission_denied
2. User fixes permission but hits different guard
3. Node still blocked: blocked_reason_code = filesafe_blocked
4. Is this:
   a) Same episode (blocked_sequence unchanged)?
   b) New episode (blocked_sequence incremented)?
```

**WHY IT MATTERS:**
- **Blocked projection keying** uses `blocked_sequence` — ambiguity breaks historical queries
- **UI blocked notice count** depends on episode boundaries
- **Wakeup semantics** may differ for same-episode vs new-episode transitions
- **Recovery UX** shows "Blocked N times" — user-facing count will be wrong
- **Analytics on blocked patterns** cannot distinguish sequential from overlapping blocks

**RELATED GAPS:**
- `Plans/assistant-chat-design.md:2085` says "blocked notice is scoped to one blocking episode" but doesn't define episode boundaries for reason-transitions
- `Plans/Executor_Protocol.md:508` says "emit `node.unblocked` for any cleared blocked episode" but doesn't specify if reason-change requires unblock/reblock

**SEVERITY:** **HIGH**  
Ambiguous keying will cause projection inconsistencies and user confusion.

**RECOMMENDATION:**
Add explicit semantics to `storage-plan.md`:
- **OPTION A (Recommended):** Blocked episode = continuous blocked state regardless of reason changes. `blocked_sequence` increments only on `blocked -> unblocked -> blocked` transitions. Reason changes within an episode append to history but don't create new episodes.
- **OPTION B:** Each `blocked_reason_code` change creates a new episode. `blocked_sequence` increments on both unblock and reason-change.
Document the chosen semantics with concrete state machine diagram.

---

### 5. EVENT ORDERING GUARANTEES — **HIGH**

**WHAT:** System uses event-driven wakeups and append-only seglog, but **no explicit ordering contract for events from different producers**.

**WHERE:**
- `Plans/storage-plan.md:1-863` — describes seglog as append-only canonical source
- `Plans/storage-plan.md:735` — mentions "ordering across segments" using global `seq`
- `Plans/Executor_Protocol.md:84` — requires "lifecycle ordering" but doesn't define inter-producer semantics
- **NO SPECIFICATION** for concurrent event streams or reordering

**EVIDENCE:**
```
seglog is the only canonical ledger. 

Ordering across segments: Use global seq (single writer) 
or per-segment seq + segment ordering by name/date so 
projectors and scans see a total order.
```

**WHY IT MATTERS:**
- **Projectors assume total order** but concurrent producers may interleave
- **Scheduler wakeup decisions** depend on prerequisite resolution order
- **Remediation lineage integrity** requires child attempts to see parent terminal state
- **Replay determinism** breaks if projectors see different event orders across restarts
- **Race conditions** in distributed scenarios (if multiple writers exist)

**QUESTIONS NEEDING ANSWERS:**
1. Is seglog single-writer or multi-writer?
2. If single-writer, what queuing/buffering ensures event producers don't block?
3. If multi-writer, how is total order established (vector clocks, Lamport timestamps, consensus)?
4. Can events arrive out of order at projectors?
5. How does the projector handle late-arriving events (append vs reorder)?
6. What guarantees exist for happens-before relationships (e.g., `attempt.started` before `attempt.completed`)?

**PARTIAL EVIDENCE:**
- Single writer implied by "seglog writer appends" (storage-plan.md:196)
- Global `seq` implies centralized sequencing
- No mention of event queues, buffering, or concurrent append protocols

**SEVERITY:** **HIGH**  
Without ordering guarantees, runtime correctness cannot be proven.

**RECOMMENDATION:**
Add explicit ordering contract to `storage-plan.md`:
- State single-writer constraint or document multi-writer protocol
- Specify happens-before guarantees for lifecycle events
- Document projector behavior for concurrent event streams
- Add acceptance criteria: "Projector replay produces identical state regardless of restart timing"

---

### 6. WIZARD CHECKPOINT SCHEMA — **MEDIUM**

**WHAT:** Storage addendum defines `wizard_status = blocked` with fields, but **full wizard checkpoint schema is not formalized**.

**WHERE:**
- `Plans/storage-plan.md:950-956` — lists required fields when `wizard_status = blocked`
- `Plans/chain-wizard-flexibility.md:156-250` — defines `ChainWizardState` Rust struct
- `Plans/storage-plan.md:914` — mentions `checkpoints -> wizard.{wizard_id}`
- **NO INTEGRATION SPEC** between wizard state struct and redb checkpoint schema

**EVIDENCE:**
```
storage-plan.md:
- checkpoints -> wizard.{wizard_id} includes blocked/attention 
  state and latest report refs

Required persisted fields when blocked:
- wizard_status = blocked
- clarification_round_count
- latest_quality_report_ref
- resume_url
- thread_id?
- blocked_reason_code
```

```
chain-wizard-flexibility.md:
pub struct ChainWizardState {
    pub intent: Option<WizardIntent>,
    pub wizard_step: u32,
    pub project_path: Option<PathBuf>,
    pub create_github_repo: bool,
    // ... many more fields
}
```

**WHY IT MATTERS:**
- **Wizard recovery after restart** requires complete checkpoint schema
- **Unclear which fields are persisted** vs transient
- **Integration with existing `checkpoints` namespace** not specified
- **Versioning and migration** undefined for wizard schema evolution
- **Blocked state recovery** lists 6 fields but wizard state has 15+

**GAPS:**
1. Does `checkpoints -> wizard.{wizard_id}` store the full `ChainWizardState` or just blocked fields?
2. What is the JSON schema version (e.g., `wizard_checkpoint.v1:{wizard_id}`)?
3. How do runtime fields (Table in chain-wizard-flexibility.md:247-250) map to redb keys?
4. Is wizard checkpoint separate from `interview_session` and `interview_checkpoint`?
5. Does wizard blocked state integrate with runtime `blocked_projection` records?

**SEVERITY:** **MEDIUM**  
Wizard can be implemented with inferred schema, but recovery edge cases will be fragile.

**RECOMMENDATION:**
Add formal wizard checkpoint schema to `storage-plan.md`:
- Define complete redb key pattern: `checkpoints -> wizard_state.v1:{wizard_id}`
- Document full JSON schema with all persisted fields from `ChainWizardState`
- Specify which fields are required vs optional
- Add migration policy for schema version bumps
- Clarify integration with `interview_session` and `interview_checkpoint`

---

### 7. REPLAN_GENERATION LIFECYCLE — **MEDIUM**

**WHAT:** `replan_generation` appears in 50+ locations but **lifecycle definition is scattered** — no single doc defines when it increments or what constitutes a "replan".

**WHERE:**
- `Plans/storage-plan.md:930, 989, 1007, 1020, 1082` — field appears in records
- `Plans/Executor_Protocol.md:173, 274, 320, 371, 431, 490` — used in validation rules
- `Plans/chain-wizard-flexibility.md:1997` — mentions "a new replan_generation begins"
- `Plans/human-in-the-loop.md:235` — defines "replan replaces retry when classification is replan_required"
- **NO CANONICAL DEFINITION** of replan triggers or increment rules

**EVIDENCE:**
```
storage-plan.md:1007:
- stale attempts from an older replan_generation must 
  remain queryable for history but may not be resumed

Executor_Protocol.md:371:
6. the node's replan_generation matches the active run generation

human-in-the-loop.md:235:
- replan replaces retry when classification is replan_required
```

**WHY IT MATTERS:**
- **Scheduler must validate generation** before resuming attempts
- **Unclear if replan invalidates entire graph** or only affected nodes
- **Relationship to `remediation_generation`** undefined (same concept? independent?)
- **UI must display "Plan changed, restarting"** but doesn't know replan boundaries
- **Audit trails will be confused** without clear generation boundaries

**QUESTIONS NEEDING ANSWERS:**
1. What events trigger `replan_generation` increment?
   - Graph integrity failure?
   - User edits to requirements?
   - Wizard re-runs Interview?
   - Permission scope changes?
2. Is `replan_generation` global per run or per-node?
3. How does `replan_generation` interact with `remediation_generation`?
4. Are there sub-generations (e.g., `replan_generation.subgeneration`)?
5. Can multiple nodes have different `replan_generation` values in one run?

**PARTIAL EVIDENCE:**
- `replan_generation` is a field in `attempt_record` (per-attempt)
- `human-in-the-loop.md:235` implies replan is a failure classification outcome
- `chain-wizard-flexibility.md:1997` implies wizard actions can start new generations

**SEVERITY:** **MEDIUM**  
Implementers can infer from context, but edge cases will cause inconsistencies.

**RECOMMENDATION:**
Add canonical definition to `Executor_Protocol.md` or `storage-plan.md`:
- Define "replan" as a runtime concept
- Enumerate triggers for generation increment
- Specify scope (global run generation vs per-node)
- Document relationship to `remediation_generation`
- Add state machine: `(event, current_gen) -> new_gen | same_gen`

---

### 8. RESTART RECOVERY — INTERRUPTED_BY_RESTART STATUS — **MEDIUM**

**WHAT:** `storage-plan.md` says on restart, classify `starting`/`running` attempts as `interrupted_by_restart`, but **unclear if this is a `failure_class`, a terminal state, or both**.

**WHERE:**
- `Plans/storage-plan.md:1125` — defines restart recovery rule
- `Plans/Executor_Protocol.md:479` — lists `interrupted_by_restart` under failure classifications
- `Plans/Executor_Protocol.md:80` — defines `done` and `failed` as terminal states
- **NO SPECIFICATION** of where `interrupted_by_restart` fits in taxonomy

**EVIDENCE:**
```
storage-plan.md:1125:
- classify any starting or running attempt with no terminal 
  event as interrupted_by_restart

Executor_Protocol.md:479:
Required classes:
- provider_transient
- structured_output_invalid
- ...
- interrupted_by_restart     <-- Listed with failure_class values
```

**WHY IT MATTERS:**
- **Attempt terminal state validation** needs to know if `interrupted_by_restart` is terminal
- **Retry policy** depends on knowing if this is retriable
- **UI display** needs consistent status (failed? interrupted? cancelled?)
- **Projector logic** must classify attempts correctly on restart
- **Analytics/metrics** will miscount if classification is ambiguous

**QUESTIONS NEEDING ANSWERS:**
1. Is `interrupted_by_restart` a value of `AttemptTerminalState` enum or `failure_class` enum?
2. If it's `failure_class`, what is the corresponding terminal state (`Failed`)?
3. Are interrupted attempts automatically retried on restart?
4. Do interrupted attempts preserve `safe_point_id` for resume?
5. Can user manually resume interrupted attempts or must scheduler re-dispatch?

**SEVERITY:** **MEDIUM**  
Implementers will make inconsistent choices without clarity.

**RECOMMENDATION:**
Clarify taxonomy in `Executor_Protocol.md`:
- If `interrupted_by_restart` is a `failure_class`:
  - Specify terminal state is `Failed` or new `Interrupted` state
  - Define retry policy (automatic resume vs manual)
- If it's a distinct terminal state:
  - Add to canonical `AttemptTerminalState` enum
  - Define how it maps to UI-visible status
- Document restart recovery flow: detection → classification → resume decision

---

### 9. DETAIL_REF FORMAT — **LOW**

**WHAT:** `detail_ref` appears in blocked payloads and events but **format is undefined** — unclear if it's a file path, artifact ID, or opaque reference.

**WHERE:**
- `Plans/Contracts_V0.md:575, 679, 897, 942, 1008, 1026` — appears in event payloads
- **NO SCHEMA DEFINITION** for `detail_ref` format

**EVIDENCE:**
```
node.blocked minimum payload:
- blocked_reason_code
- allowed_action_ids[]
- detail_ref?            <-- Format undefined
- recovery_options[]

safe_point.restored MUST carry:
- restore detail ref when applicable    <-- What format?
```

**WHY IT MATTERS:**
- **UI cannot render detail links** without knowing if it's a path, URL, or ID
- **Projectors cannot resolve references** to full detail
- **Inconsistent usage across producers** will break consumer expectations
- **Audit tools cannot validate reference integrity** without format spec

**QUESTIONS NEEDING ANSWERS:**
1. Is `detail_ref` an artifact ID (`artifact:<uuid>`)?
2. Is it a file path (`.puppet-master/state/details/<ref>.json`)?
3. Is it a seglog event reference (`event:<seq>`)?
4. Is it a report reference (`report:<type>:<id>`)?
5. Can it be null/omitted, or is it required for certain `blocked_reason_code` values?

**PARTIAL EVIDENCE:**
- Some events pair `detail_ref` with `report_ref` (suggesting different purposes)
- `restore detail ref when applicable` implies conditional presence
- No examples or schema fragments found in any doc

**SEVERITY:** **LOW**  
Implementers can choose a format, but inconsistency will cause integration issues.

**RECOMMENDATION:**
Add format specification to `Contracts_V0.md`:
- Define format (e.g., `detail_ref = "artifact:<artifact_id>" | "report:<report_type>:<id>" | "file:<relative_path>"`)
- Document resolution rules (how consumers fetch detail content)
- Specify when `detail_ref` is required vs optional
- Add examples for common cases (blocked auth, filesafe denial, graph integrity failure)

---

### 10. SAFE POINT vs RESTORE POINT STORAGE ISOLATION — **LOW**

**WHAT:** `storage-plan.md` says safe points **MUST NOT** be in `restore_points` namespace, but **`safe_point.*` namespace is not defined** in redb key patterns.

**WHERE:**
- `Plans/storage-plan.md:935-936` — defines separation rule
- `Plans/storage-plan.md:515-516` — defines `restore_points` namespace
- `Plans/storage-plan.md:218-518` — redb schema section
- **NO `safe_point` NAMESPACE** defined in key patterns table

**EVIDENCE:**
```
storage-plan.md:935-936:
Storage MUST keep the following concepts separate:
- safe_point.* = runtime-internal retry/remediation recovery anchor
- restore_point.* = user-visible history/rewind anchor

Required rule:
- safe points MUST NOT be stored in the restore_points namespace
```

**TABLE INSPECTION (storage-plan.md:477-517):**
| Namespace | Key pattern | Purpose |
|-----------|-------------|---------|
| `settings` | `app.{key}` | App settings |
| `sessions` | `thread.{thread_id}` | Thread metadata |
| `runs` | `run.{run_id}` | Run metadata |
| `checkpoints` | ... | Projector positions |
| `restore_points` | `point.{project_id}.{restore_point_id}` | User restore points |
| **NO `safe_point` NAMESPACE** | ❌ | ❌ |

**WHY IT MATTERS:**
- **Implementers don't know where to store safe points** (checkpoints? runs? new namespace?)
- **Query logic cannot filter safe points** without knowing key pattern
- **UI must not expose safe points as restore options** but can't filter without namespace
- **Retention policies** may differ (safe points auto-pruned, restore points user-controlled)

**QUESTIONS NEEDING ANSWERS:**
1. Should safe points use `checkpoints` namespace (`checkpoints -> safe_point.{safe_point_id}`)?
2. Should safe points use `runs` namespace (`runs -> safe_point.{run_id}.{node_id}.{safe_point_id}`)?
3. Should safe points have a dedicated namespace (`safe_points -> {safe_point_id}`)?
4. What is the key pattern and schema for `safe_point_record` (defined in storage-plan.md:1019)?
5. How are safe points indexed for lookup by `attempt_id` or `remediation_root_id`?

**SEVERITY:** **LOW**  
Implementers will choose a pattern, but inconsistency with doc promises will cause confusion.

**RECOMMENDATION:**
Add `safe_point` namespace to redb schema table in `storage-plan.md`:
```
| Namespace | Key pattern | Value | Purpose |
| `safe_points` | `{safe_point_id}` | JSON safe_point_record | Runtime recovery anchors |
| `safe_points` | `by_attempt.{run_id}.{node_id}.{attempt_id}` | safe_point_id | Lookup safe point by attempt |
```
Document schema for `safe_point_record` including all fields from storage-plan.md:1019.

---

## CROSS-CUTTING CONCERNS

### A. ENUM CONSOLIDATION
Multiple docs reference state enums without consolidation:
- `AttemptTerminalState` (Finding #2)
- `SafePointRestoreOutcome` (Finding #1)
- `failure_class` (Executor_Protocol.md:479, partially defined)
- `blocked_reason_code` (scattered across multiple docs)
- `TemplateRepoStatus` (storage-plan.md:456, fully defined ✓)

**RECOMMENDATION:** Create `Plans/Enumerations.md` as canonical enum registry.

### B. COUNTER TAXONOMY
System defines multiple overlapping counter families:
- Attempt counters (attempt_count, retry_count, automatic_retry_count, ...)
- Episode counters (blocked_sequence, clarification_round_count)
- Generation counters (replan_generation, remediation_generation)

**RECOMMENDATION:** Add counter relationship matrix to `storage-plan.md`.

### C. REFERENCE FORMAT STANDARDS
Multiple reference types lack format specs:
- `detail_ref` (Finding #9)
- `report_ref` (mentioned but undefined)
- `artifact_ref` (mentioned but undefined)
- `blob_ref` (storage-plan.md:515)

**RECOMMENDATION:** Add reference format specification to `Contracts_V0.md`.

---

## PRIORITY MATRIX

| Finding | Severity | Impact | Effort | Priority |
|---------|----------|--------|--------|----------|
| #1 SafePoint Restore Enum | BLOCKER | Can't implement | Low | **P0** |
| #2 Attempt Terminal State | BLOCKER | Can't validate lifecycle | Low | **P0** |
| #3 Counter Semantics | HIGH | Audit inconsistency | Medium | **P1** |
| #4 blocked_sequence Edge | HIGH | Projection bugs | Low | **P1** |
| #5 Event Ordering | HIGH | Race conditions | High | **P1** |
| #6 Wizard Schema | MEDIUM | Fragile recovery | Medium | **P2** |
| #7 replan_generation | MEDIUM | Edge case bugs | Medium | **P2** |
| #8 interrupted_by_restart | MEDIUM | Inconsistent classification | Low | **P2** |
| #9 detail_ref Format | LOW | Integration issues | Low | **P3** |
| #10 SafePoint Namespace | LOW | Implementation confusion | Low | **P3** |

---

## REMEDIATION PLAN

### IMMEDIATE (P0 — Required for Implementation)
1. **Define SafePoint restore outcome enum** in `Contracts_V0.md` with complete value set and semantics
2. **Define Attempt terminal state enum** in `Contracts_V0.md` with lifecycle validation rules

### SHORT-TERM (P1 — Required for Correctness)
3. **Document counter relationships** in `storage-plan.md` with decision matrix for which counter(s) to increment
4. **Clarify blocked_sequence semantics** for reason-change-while-blocked scenario
5. **Add event ordering guarantees** to `storage-plan.md` with happens-before relationships

### MEDIUM-TERM (P2 — Required for Robustness)
6. **Formalize wizard checkpoint schema** with complete redb key pattern and JSON schema
7. **Define replan_generation lifecycle** with canonical trigger list and state machine
8. **Classify interrupted_by_restart** as terminal state or failure_class with retry policy

### LONG-TERM (P3 — Quality of Life)
9. **Specify detail_ref format** with resolution rules and examples
10. **Add safe_point namespace** to redb schema table with key patterns

### STRUCTURAL IMPROVEMENTS
- **Create `Plans/Enumerations.md`** — Canonical registry of all state enums
- **Add counter relationship matrix** — to `storage-plan.md` or `Executor_Protocol.md`
- **Define reference format standards** — in `Contracts_V0.md`

---

## ACCEPTANCE CRITERIA

This audit is resolved when:
1. ✅ All BLOCKER findings have formal enum definitions in `Contracts_V0.md`
2. ✅ All HIGH findings have normative specifications with no ambiguity
3. ✅ All counter relationships are explicitly documented
4. ✅ Event ordering guarantees are testable (can write acceptance tests)
5. ✅ Storage schemas include all referenced namespaces with complete key patterns
6. ✅ No enum or state is referenced without definition in at least one canonical doc
7. ✅ Implementer can answer "what values are valid?" for every enum field
8. ✅ Auditor can validate counter consistency without inferring relationships

---

## CONCLUSION

The storage and state model specifications are **80% complete** but have critical gaps in enum definitions and semantic clarity that will block implementation or cause runtime bugs.

**Key Strengths:**
- Comprehensive coverage of persistence requirements
- Clear separation of concerns (seglog, redb, projectors)
- Detailed field lists for most records

**Critical Weaknesses:**
- Missing enum value definitions (BLOCKER)
- Ambiguous counter semantics (HIGH risk for audit failures)
- Undefined edge cases in state transitions (HIGH risk for race conditions)

**Recommended Next Steps:**
1. Address P0 findings immediately (2-4 hours of documentation work)
2. Validate P1 findings with implementation prototypes
3. Schedule P2/P3 findings for next planning iteration

**Estimated Effort to Resolve All Findings:** 2-3 person-days of technical writing + 1 day of review/validation.

---

**Audit Completed By:** State/Storage/Command Subauditor  
**Sign-off Required From:** Architect, Storage Lead, Runtime Lead
