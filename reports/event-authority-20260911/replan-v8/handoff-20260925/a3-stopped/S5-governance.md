# S5-governance: the governance route for the `goal_run.stopped` registry-row revision (A3)

Scope: read-only scoping for Replan v8 Step 8(b) Group A, branch A3, family `goal_run.stopped` only.
Canon read as git objects of `origin/main` `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61` (fetched 2026-09-25). Pending context, not canon: `origin/plans/replan-v8-a0-20260925` (A0 report), `origin/plans/replan-v8-a1-20260925` (A1), `origin/plans/replan-v8-process-answers-20260925` `616f12bfd` (process answers). `/mnt/Cursor/...` does not exist in this container, so the depth42 `rubric.md`, the quote bundle and all answer files are unavailable. Everything below that depends on them is reconstructed from repository text and marked as such.

Registry facts at `origin/main`, recomputed here:
- `Plans/event_family_registry.json`: SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`, `registry_revision` `2026-09-11.2` (line 5), 42 families.
- `goal_run.stopped` is `#/families/5`, lines 242-283, `family_revision` `2.0.0`.
- Whole-row fingerprint: `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3`. The DL-077 recipe (sorted keys, `(',', ':')`, `ensure_ascii=False`) and the Browser-gate `fingerprint()` recipe give the same value, because the row is ASCII.

---

## 1. Findings in brief

1. **Where the record goes.** The Q-03 record must not be written to `reports/event-authority-20260911/admission-records/*.json`. The frozen seal check reads every `*.json` file in that directory:
   - `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py` line 269: `for path in (sorted(record_dir.glob("*.json")) ...`.
   - Line 294 then reports any record for a Known37 family: `"admission record for a family not registered beyond Known37 and August"`.
   - Lines 623-626 turn that into the depth-blocking failure `post_august_admission_incomplete`.
   - `goal_run.stopped` is Known37 (`Plans/.audits/event-authority-2026-08-12/known37/KNOWN37_FROM_PLANS.json` line 33).
   - So a record in that glob would be read by the seal check and would fail it. That contradicts the record's required first line, which says the seal check does not read it. The glob is not recursive, so a subdirectory or a sibling directory works. The path is an open question (OQ-1).
2. **DL-078 does not cover this landing.** Q-02 rules it out, and DL-078's text agrees (`Decision_Log.md` 1571: "Any other registry change still needs Jared's own checkpoint approval"). So each landing needs its own DL-036 checkpoint card, with the exact before and after rows and the registry SHA-256 before and after, and Jared's answer becomes a Decision Log entry with the after-SHA.
3. **Moving the PNC-019 constants is not mechanically needed, provided the revision label stays `2026-09-11.2`.**
   - The helper compares only the schema ID, schema version, `registry_revision` and the row count (`scripts/pm_pnc019_currentness.py` 273-290), not the SHA.
   - The certified v2-to-v3 precedent kept the label: `f6350caf2` changed one row, took the SHA from `1972a6aa…` to `0be54418…`, and left the label alone.
   - A same-label revision therefore moves neither `EVENT_FAMILY_REGISTRY_REVISION` (line 50) nor `..._KERNEL_ROW_COUNT` (line 51).
   - It does make the recorded checkpoint identity (`0be54418…` in the provenance comment at lines 43-49 and in `step-08-checkpoint-2026-09-11.2.json`) stale. A new checkpoint record is due.
   - `Contracts_V0.md` 1084 keys determinism on "registry revision" and calls a payload-schema change "a governed migration revision". Whether the label should be bumped is OQ-3. A bump would move line 50 and needs Jared's approval as part of the card.
4. **Fingerprints that re-freeze.** Rows 0-5 are inside every admission fingerprint, so a stopped revision re-freezes all of them.
   - There are 4 fingerprint values in 12 places, plus a new `REVIEWED_GOAL_SUCCESSORS` entry, 3 provenance fields and one readiness map entry (Section 7).
   - A0's list misses the sorted-upstream hash `b59cc61d…` in two tests, the provenance fields, the six-successor test set, and `EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS` in `scripts/pm-implementation-readiness.py` 494.
   - A0's line reference for `REVIEWED_GOAL_SUCCESSORS` (36-67) is stale. It is now at lines 45-79.
5. **The Browser gate limits what the successor row may change.**
   - Its historical reconstruction (`scripts/pm-browser-event-admission.py` 128-157) restores only six fields: `family_revision`, `semantic_owner_doc`, `payload_owner_doc`, `payload_schema_id`, `payload_schema_ref` and `source_refs`.
   - I simulated a successor that changes only those six fields. It reconstructs to exactly `8acbc249…`.
   - Adding a `run_id` identity pointer, which depth42 lists as a scope/identity gap, breaks the reconstruction. That would need a code change to the gate, not just a pin. See OQ-5.
6. **The single-family depth file must grade the revised row.** It cannot reuse depth42 (`ba9b84f9…`): its stopped row is at `family_revision` `2.0.0`, and the currentness rule needs the live revision (validator line 240-241 rule; Q-03).

---

## 2. The governance route, step by step (for one landing that revises `#/families/5`)

This is derived from Q-02 and Q-03, from DL-036, DL-077 and DL-078, from the certified precedent (landing record `landing-record-20260923.*`, checkpoint `step-08-checkpoint-2026-09-11.2.*`, re-freeze commits `d21679659`, `c7b136ad2` and `1cdf39074`), and from the Step 9 procedure (`step-09-procedure-20260924.md` 26-36).

1. **Owner prose first, then the companions** (CLAUDE.md, "How to compile a ledger"). The contract text for stopped lands in Goal_Runtime_System, Executor_Protocol, Orchestrator_Page and storage-plan. Then come the v3 payload schema and consumer resources, then the registry row edit, all on the A3 branch. Per Q-12, nothing may depend on D06 (`owner.executor.native.record_cancellation.v1` stays unbound; `Executor_Protocol.md` 7440 per the process answers).
2. **Freeze the after row and compute the SHAs** on the branch tip: the after row, its whole-row fingerprint and the registry after-SHA. The before-SHA is main's at card time; today that is `0be54418…` (see hazard H-1).
3. **Grade the depth.** Write a new dated single-family depth file for the revised row at its new `family_revision` (Section 6), graded on the branch tip and pinned by SHA-256.
4. **Write the card and freeze it.** Use the DL-036 form (Section 3), carrying the exact before and after rows, both SHAs and the revision label. Record the card's SHA-256; later rows use `frozen_card_sha256` (e.g. `decision-responses.jsonl` row for `EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001`: `"frozen_card_sha256": "193f481d…"`). Status `QUEUED_UNANSWERED`. The cloud thread does not present cards itself; the coordinator or host presents them.
5. **Jared answers** with exactly one of the four DL-036 responses (`Decision_Log.md` 365). Stopped is answered on its own line even if the card is batched with blocked (Q-02).
6. **Record the answer in the same landing:**
   - a Decision Log prose entry plus a PlanUnit (Section 4), naming `goal_run.stopped` and the after-SHA;
   - a `decision-responses.jsonl` row;
   - a new checkpoint approval record in the `step-08-checkpoint-2026-09-11.2.json` form (schema `pm.assurance.event_authority.checkpoint_approval.v1`), naming the new approved SHA and the approved predecessor `0be54418…`;
   - if the label is kept, an update to the PNC-019 provenance comment (Section 8).
7. **Write the DL-077-form record** (Section 5). Its first line says the seal check does not read it, and it lives outside the validator's glob.
8. **Re-freeze the fingerprints** (Section 7) in the same landing, after the row edit. Each re-freeze is its own commit, as `d21679659`/`c7b136ad2` were ("Kept as its own commit so it can be dropped"). Commit messages name the landed row commit (`pm_emit_only_event_contract.py` 15: "Re-freeze again only for landed, recorded changes").
9. **Regenerate** shards and `pm-plan-index.py generate` for every edited `Plans/*.md`. `buildability_gate_report.json` goes to the reseal (DL-078 D-07 clarification, `Decision_Log.md` 1571).
10. **Landing check and landing record.** Expected staleness (Section 9) goes with a reseal request. A local session lands under the lock; the cloud thread never lands (process answers, "Landing of `plans/replan-v8-*` branches").

---

## 3. The DL-036 checkpoint card: form and worked example

### 3.1 The form

- **DL-036 prose**, `Plans/Decision_Log.md` 357-378:
  - 364: each card is "built from the plain-language decision form: a plain name; the question in one sentence; why it came up; what you would get; what it costs; the options; the recommendation if there is one."
  - 365: the user answers with "exactly one of four responses: Approve; Deny; Deny with changes ...; Ask a question".
  - 369: dispositions are recorded "so agents do not ask the same question again".
- **Repository card files use this layout:**
  1. Title.
  2. `Card ID: \`…\``.
  3. `Status: **QUEUED_UNANSWERED**`.
  4. Owner, families.
  5. **Name**, **Question**, **Why**, **What you get**, **What it costs**, **Options** (numbered), **Recommendation**, **Answer:** `____`.
  6. "What this card does not do".
  7. Evidence with SHA-256 values.
  
  Examples: `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (Card 1b, which produced DL-080) and `step-10-validator-live-set-card-20260924.md` (a technical governance card that produced DL-077 and DL-078).
- **Added by Q-02:** the exact before and after rows, and the registry SHA-256 before and after, with one line per landing.
- **Precedent for a checkpoint answer** (`decision-responses.jsonl` row `EA-S8-CHECKPOINT-2026-09-11.2`): `"response": "Approved, separate branch; Live registry 0be54418; Step 4 precedent"`. That approval was given after the certified row had landed. Under Q-02, approval now comes before landing.

### 3.2 Worked example (a draft; the `<…>` values are fixed only when step 2 above freezes them)

The card ID is a proposal (OQ-9). It follows the earlier naming (`EA-S8-CHECKPOINT-2026-09-11.2`, `EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001`).

````markdown
# Checkpoint card: the goal_run.stopped registry row moves to its current contract

Card ID: `EA-A3-GOALRUN-STOPPED-ROW-001`

Status: **QUEUED_UNANSWERED**. Prepared <date> for the coordinator to present in Jared's card form, under the
process ruling Q-02 (2026-09-25). It records no answer and does not re-ask DL-080.

Owner: Orchestrator and Executor (Workflow run lifecycle), with Goal Runtime and Storage (event family registry).
Family: `goal_run.stopped` (`event-family-goal-run-stopped`, `#/families/5`).

**Name:** The registered stopped-run event moves to its current version.

**Question:** Should the registered `goal_run.stopped` row change from its old version 2.0.0 to the current
version <3.0.0> shown below, with the approved checkpoint moving from registry SHA-256 `0be54418…` to `<after>`?

**Why:** On 2026-09-24 you made `goal_run.stopped` a current event (DL-080). Its registered row still selects the
old v2 payload, which conflicts with the current Workflow run envelope (the Step 8 grading marked it CONFLICT).
The new contract (<units>) replaces it. Changing a row of the original 37 is not covered by the standing rule
for registrations (DL-078), so, as for the certified row on 2026-09-23, you approve it yourself.

**What you get:** Pause and Abort Run have a registered current event to write, named writer <…>, and the
run history can carry stopped rows (<GRS-085 successor>). Depth of the revised row: <n> of 12 criteria
(<depth file>, SHA-256 <…>); native execution NOT_RUN. It does not rely on the full original cancellation (D06).

**What it costs:** The registry hash changes, so the admission fingerprints for the older families are
re-frozen in the same landing (<list>), and the governance artifacts need the designated Plans agent's reseal.

**The change (exact):**
- Registry before: revision `2026-09-11.2`, 42 families, SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`.
- Registry after: revision `<2026-09-11.2 | bumped>`, <42> families, SHA-256 `<after>`.
- Row before (fingerprint `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3`): <verbatim JSON, 3.3>.
- Row after (fingerprint `<…>`): <verbatim JSON>.

**Options:**
1. **Approve the revision and the new checkpoint identity (recommended).** It lands with its re-freezes.
2. **Keep the old row.** The stopped contract cannot become current; DL-080's order stalls.
3. **Change the row first.** Say what.

**Recommendation:** Option 1.

**Answer:** ____________________

## What this card does not do
It registers or admits no family, keeps the family count, changes no validator, seal condition or
other row, and certifies nothing. Its DL-077-form record is not read by the seal check.
Evidence: <branch tip commit>, <depth file SHA-256>, <SHA256SUMS of the compact bundle>.
````

### 3.3 The exact before row (verbatim, `origin/main` `Plans/event_family_registry.json` 242-283)

```json
{"family_id":"event-family-goal-run-stopped","family_revision":"2.0.0","event_type":"goal_run.stopped","scope_policy":"project_only","semantic_owner_doc":"Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima","payload_owner_doc":"Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer","payload_schema_id":"pm.goal_runtime_event.goal_run_stopped.schema.v2","payload_schema_ref":{"path":"Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json","json_pointer":"#","schema_id":"pm.goal_runtime_event.goal_run_stopped.schema.v2"},"legacy":{"aliases":[],"admitted_extensions":[],"identity_json_pointers":{"project_id":["/payload/project_id"],"thread_id":["/payload/thread_id"]},"referenced_event_id_pointer":null,"redaction":{"mode":"reject_unhandled_secrets","transform_id":null,"transform_version":null}},"source_refs":["Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json#","Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima","Plans/Contracts_V0.md#cv-287---goal-runtime-event-schema-registration"],"retention_policy_ref":{"registry_schema_id":"pm.storage_value_registry.v2","policy_id":"RP-AUTHORITY-INDEFINITE","policy_version":"1.0.0"}}
```

In the file the keys are in the order shown, with indent 2. The card should show the pretty-printed bytes.

### 3.4 The after-row pattern from the precedents (what the A3 row can copy)

These are current rows at `origin/main`.
- **`goal_run.started` (`#/families/4`) and `goal_run.cancelled` (`#/families/1`):**
  - Anchors move to the new units: `"semantic_owner_doc": "Plans/Goal_Runtime_System.md#GRS-079"` and `"payload_owner_doc": "Plans/storage-plan.md#SP-311"`, and likewise GRS-080/SP-312.
  - The payload ref goes to a v3 file outside `event_payloads/goal_runtime/`.
  - `source_refs` keeps the three v2 refs and appends the new owner, schema and consumer refs.
- **`goal_run.certified` (`#/families/2`):** keeps the v2 anchors and replaces `source_refs` (diff of `f6350caf2`).
  - depth42 grades its `owner_doc` PARTIAL: "Both anchors are stale for v3 ... only the registry source_refs reach them".
  - So the started and cancelled pattern is the one that avoids a PARTIAL `owner_doc` for stopped.
- **All three precedents left these unchanged:** `scope_policy`, `legacy` (aliases, identity pointers, redaction) and `retention_policy_ref`. That is also what the Browser gate needs (finding 5, and Section 7).

### 3.5 The recipes for the card's hashes

- **Registry SHA-256:** `sha256sum Plans/event_family_registry.json`.
- **Row fingerprint:** `hashlib.sha256(json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()`. This is the same recipe as DL-077 `registry_row_sha256` and the Browser `fingerprint()` for an ASCII row.

---

## 4. The Decision Log entry that records Jared's answer: form and worked example

Q-02: "Jared's answer is recorded as a Decision Log entry with the after-SHA, as DL-068 to DL-075 were."

The 2026-09-23 certified checkpoint approval has no Decision Log entry. It lives only in `decision-responses.jsonl` (card `EA-S8-CHECKPOINT-2026-09-11.2`) and `step-08-checkpoint-2026-09-11.2.json`; `grep 0be54418` over `Decision_Log.md` finds nothing. So the entry form comes from DL-068 to DL-080 and DL-093, not from the certified record.

### 4.1 The form

Each entry has three parts.

**The prose section**, e.g. DL-080 at `Decision_Log.md` 1609-1637, or DL-068 at 1196-1224. Heading: `### DL-NNN: <sentence title>`.
1. `Answered on <date> by Jared, in conversation with <who>, from the card page: **Approve**, which selects option N on \`<card id>\`.`
2. **Name**, **Question**, **Why**, **What you get**, **What it costs**, **Options**, **Recommendation**, **Answer:** `Approve (option N).`
3. An effect paragraph: what it authorizes and what it does not.
4. `SourceRef: <answers file>, SHA-256 <…>; card <path>`.
5. `ContractRef: ContractName:…`.

**The PlanUnit**, under `## PlanUnits`, e.g. DL-080 at 6633-6694 or DL-093 at 7492-7549. Heading: `### DL-NNN - Title Case`. It is a YAML block with these keys:
- `plan_unit_id`, `unit_type: requirement`, `status: accepted`, `owner_doc: Plans/Decision_Log.md`
- `canonical_text`
- `gui_related: false`, `gui_classification_reason`, `split_recommended: false`
- `depends_on`, `unblocks`, `acceptance_criteria`, `validation_surfaces`
- `risk_class`, `reasoning_tier`, `context_scope`, `implementation_surfaces`
- `node_compile_hint: {mode: owner_decision_record, create_worknodes: false, create_nodeseeds: false}`
- `source_lineage`, `preserved_exact_tokens`, `negative_constraints`, `owner_hints`

**A `decision-responses.jsonl` row**, e.g. line 21 for DL-080. Its keys: `card_id`, `response_id`, `responded_by`, `recorded_at_utc`, `source`, `source_ref`, `source_sha256`, `response`, `selected_option`, `decision`, `card_status`, `authority_ref`, `card_ref`, `frozen_card_sha256` and `effect`.

Constraints that apply here:
- **Name the family.** The entry must name `goal_run.stopped` exactly if it is to be the record's `decision_ref` (validator 207-209: the event type must occur in the section, delimited, and the entry may not be DL-077 or DL-078).
- **Leave DL-077 and DL-078 untouched.** DL-077's prose is pinned by the post-August receipt (`authority_section_sha256`); DL-093 says "an edit to it would re-pin all three existing admission records".
- **Regenerate after editing.** Editing `Decision_Log.md` needs shard and index regeneration, and the migration run rows will change (see the coordination simulation, `step-09-coordination-prep-20260925.md` 285-289).

### 4.2 Worked example (a draft; the number and SHAs are assigned at landing, see H-2)

````markdown
### DL-0NN: The registered goal_run.stopped row moves to its current version

Answered on <date> by Jared, in conversation with <coordinator/host>, from the card page: **Approve**, which
selects option 1 on `EA-A3-GOALRUN-STOPPED-ROW-001`.

**Name:** … **Question:** … **Why:** … **What you get:** … **What it costs:** … **Options:** … (copied from the
frozen card) **Recommendation:** Option 1. **Answer:** Approve (option 1).

The registry row `event-family-goal-run-stopped` (`#/families/5`) moves from 2.0.0 (fingerprint `8acbc249…`) to
<3.0.0> (fingerprint `<…>`). The registry moves from SHA-256 `0be544181eda…` to `<after>` at revision
`<label>` with <42> families, and the approved PNC-019 comparison checkpoint records `<after>` as its identity,
with `0be544181eda…` as its approved predecessor. This is Jared's own checkpoint approval for a registry change
that is not a Step 9 registration (DL-078), under the process ruling Q-02 of 2026-09-25. It registers, admits or
removes nothing, changes no other row, validator or seal condition, and certifies nothing. The family's
DL-077-form record is informational and is not read by the seal check.

SourceRef: <answers file or conversation>, SHA-256 <…>; card `reports/event-authority-20260911/replan-v8/<card>.md`,
frozen SHA-256 <…>; process answers `reports/event-authority-20260911/replan-v8/process-answers-20260925.md` (Q-02).

ContractRef: ContractName:Plans/Decision_Log.md#DL-080, ContractName:Plans/event_family_registry.json,
ContractName:Plans/Plan_To_Node_Compilation.md
````

PlanUnit notes:
- `depends_on: [DL-039, DL-078, DL-080]`.
- `preserved_exact_tokens`: the card ID, `goal_run.stopped`, the after-SHA and the revision label.
- `negative_constraints`: "Do not read this as extending DL-078 to row revisions" (Q-02 cites blind finding D-08); "Do not re-pin DL-077's records".
- `validation_surfaces`: `decision-responses.jsonl`, the shard check, `pm-plan-index.py validate` and `python3 -m unittest tests.test_pm_browser_event_admission tests.test_pm_emit_only_event_boundaries`.

---

## 5. The DL-077 admission record form, and how Q-03 adapts it

### 5.1 The form (receipt `reports/event-authority-20260911/step-10-post-august-admission-receipt.json`, `record_contract`)

- Location: `"file": "<record_dir>/<event_type>.json, one per family registered beyond Known37 and the two August families"`, with `record_dir` `reports/event-authority-20260911/admission-records` (validator line 85).
- `schema_id`: `pm.assurance.event_authority.post_august_admission_record.v1`.
- `event_type`, and `family_id`, which must equal the live row's.
- `implementation_receipt_sha256`: the SHA of the receipt. Today that is `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827`.
- `decision_ref` (`Plans/Decision_Log.md#DL-NNN`) and `decision_section_sha256`. The section runs "from its '### DL-NNN:' heading to the next heading of level 1 to 3".
- `registry_before` and `registry_after`: each `{revision, sha256, family_count}`, with "family_count exactly one more and a different sha256" (validator 221-222).
- `registry_row_sha256`: the canonical JSON of the live row.
- `depth_assessment`: `{path under reports/, sha256}`. Its `rows[]` entry must carry the live `family_id` and `family_revision` and all twelve criteria at PASS, each with at least one evidence path under `Plans/` (validator 225-255).
- Informational fields in the three existing records: `admission_landing {commit, record}`, `criteria_not_passing_at_recording`, `status_at_recording`, `recorded_by`, `recorded_at_utc` and `notes`. See `admission-records/browser.workspace.reset.json`: `"Written under DL-077. The seal check recomputes completeness from the pinned assessment; the two fields ending in _at_recording are informational only."`

### 5.2 The Q-03 adaptation for `goal_run.stopped`

Q-03 rules: write it "in the DL-077 form, one per family, each carrying a first line that says it is not read by the seal check because the family is an original-37 row revised under DL-080, not a post-August admission". The validator "is never edited to read these records". The depth part may not cite depth42 `ba9b84f9…`. The row is graded in a new dated single-family file, pinned by SHA-256.

Consequences:
- **Location (OQ-1).** It must be outside the glob `admission-records/*.json` (finding 1). Candidates:
  - `reports/event-authority-20260911/admission-records/original-37-revisions/goal_run.stopped.json`, a subdirectory the non-recursive glob does not match;
  - a sibling such as `reports/event-authority-20260911/revision-records/goal_run.stopped.json`.
  
  Neither `tests/test_event_authority_holding_bucket.py` 276 nor `tests/test_pm_coordination_events.py` 668 reads other paths.
- **"First line" (OQ-2).** JSON has no comments, and the pretty-printed first line is `{`. The nearest faithful form is a first key placed before `schema_id`, e.g. `"seal_check_note": "Not read by the seal check: goal_run.stopped is an original-37 row revised under DL-080, not a post-August admission (process answer Q-03, 2026-09-25)."`. It is written with insertion order kept and `indent=1`, as the existing records are.
- **`schema_id`.** Keeping `…post_august_admission_record.v1` gives form parity. Using a variant ID would make it plain that this is not a post-August record (OQ-2).
- **`registry_before`/`registry_after`.** Both carry the same `family_count`, with different SHAs. The DL-077 rule `registry_before_after_not_exactly_one_family` would fail by design, so the notes must say this is a revision.
- **`decision_ref`.** The new Q-02 Decision Log entry (Section 4), which names `goal_run.stopped`, or DL-080, which also names it and is Jared's product decision (OQ-4). DL-077 and DL-078 are excluded.
- **`depth_assessment`.** The new single-family file. Its row `family_revision` equals the after row's; its `registry.sha256` is the after-SHA.
- **`criteria_not_passing_at_recording` and `status_at_recording`.** These come from that file. Twelve of twelve is not required for the record to exist, because nothing reads it.
- **`admission_landing.commit`.** A same-landing record cannot contain its own commit (OQ-6). The admission-record precedents were written after their landings (`a33cf4702`, 2026-09-25). The Browser successor tuple cites the row-adoption commit instead of the pin commit (`f6350caf2…` in `pm-browser-event-admission.py` 77).

Draft (field values `<…>` pending):

```json
{
 "seal_check_note": "Not read by the seal check: goal_run.stopped is an original-37 row revised under DL-080, not a post-August admission (process answer Q-03, 2026-09-25).",
 "schema_id": "pm.assurance.event_authority.post_august_admission_record.v1",
 "event_type": "goal_run.stopped",
 "family_id": "event-family-goal-run-stopped",
 "implementation_receipt_sha256": "dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827",
 "decision_ref": "Plans/Decision_Log.md#DL-0NN",
 "decision_section_sha256": "<…>",
 "registry_before": {"revision": "2026-09-11.2", "sha256": "0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842", "family_count": 42},
 "registry_after": {"revision": "<label>", "sha256": "<after>", "family_count": 42},
 "registry_row_sha256": "<after-row fingerprint>",
 "depth_assessment": {"path": "reports/event-authority-20260911/<single-family depth file>.json", "sha256": "<…>"},
 "revision_landing": {"row_commit": "<…>", "record": "<landing record path>"},
 "criteria_not_passing_at_recording": ["<…>"],
 "status_at_recording": "<complete_depth|incomplete_depth>",
 "recorded_by": "<agent task>",
 "recorded_at_utc": "<…>",
 "notes": [
  "A revision of registered row #/families/5, not an admission: family_count is unchanged, so DL-077's one-more-family rule does not apply.",
  "Checkpoint approval: <card id>, answered <date>, recorded as DL-0NN (process answer Q-02)."
 ]
}
```

One further check is possible. Run `admission_record_problems(record, live_row)` offline against a scratch copy of the validator. It should report only `registry_before_after_not_exactly_one_family`, plus `depth_incomplete:*` if the grade is short. That shows the record keeps the form without the validator ever reading it.

---

## 6. The single-family depth assessment: the twelve criteria and the grading rules, reconstructed

`rubric.md` (depth42 evidence, SHA-256 `81f1d8b2…`) is on `/mnt` and unavailable. The rules below are reconstructed from these sources:
- `step-08-depth42-assessment-20260924.md` ("Method", the lowered-cell rule table, "Harmonization") and `.json` (`status_meaning`, `dispositions_meaning`, `method`, the row and cell shapes);
- `step-08-browser-pair-depth-assessment-20260923.md` (the criterion table);
- the per-family supplements (`step-08-home-depth.json`, `step-08-hold-depth.json`);
- the coordination forecast (`step-09-coordination-prep-20260925.md` 89-118);
- the validator (`EVIDENCE_FIELDS` 32-46; PASS evidence under `Plans/`).

The per-criterion text below is my synthesis and should be checked against `rubric.md` when a local session has `/mnt` (OQ-7).

### 6.1 Statuses, dispositions and representations (verbatim, depth42 JSON)

**Statuses:**
- PASS: "Current owner text explicitly supports the criterion for this exact family at its registered version, including explicit adoption of any shared prerequisite it depends on. Never native or runtime proof."
- PARTIAL: "Some exact or listed evidence exists, but a required part is unbound, unadopted, or explicitly left open by owner text."
- ABSENT: "No binding for the criterion in the inspected owner surfaces; generic rules and broad labels do not count."
- CONFLICT: "The only exact contract conflicts with current owner precedence, and no current disposition resolves it."

**Dispositions:** CURRENT_WRITER, HISTORICAL_ONLY, UNDISPOSITIONED.

**Representations:** `registry_structured`, `exact_normative_owner`, `listed_only`, `absent` and `historical_only_disposition`.

**Native execution:** "NOT_RUN for every family, and that alone never lowers a grade" (depth42 md line 5).

### 6.2 The twelve criteria, in rubric order (validator `EVIDENCE_FIELDS`), with the PASS bar as applied

1. **`membership_version`.** The registry row at its registered revision, with its scope, aliases and extensions. `payload_schema_ref` resolves and its `$id` equals `payload_schema_id`; the Contracts roster agrees. "Membership says nothing about current emission."
2. **`owner_doc`.** `semantic_owner_doc` and `payload_owner_doc` resolve to text that governs the registered version. Clarification 1: a generic Storage persistence anchor (Case L-5) and a whole-document semantic anchor are acceptable. The grade is PARTIAL only if the anchor is "(a) ... stale for the registered version, or (b) ... explicitly disclaims the role", and the governing text cannot be reached from it. Certified is PARTIAL for exactly this reason.
3. **`producer`.** An exact emitter or writer, with its trigger and the ordering of commit, append and publication.
   - Stricter rule: "Producers pass only where recovery through the first receipt adopts SP-286 by name" (storage-plan 22035-22036 at `f1ce058ccd`; now 22079-22080: "CV-339 owns the exact shared shapes, digest bytes and caller interfaces").
   - The rule applies where publication or the returned result waits on the AppendReceipt (Section 15 11626-11628). It does not apply where visibility rests on a verified seglog marker (storage-plan 19298-19300 at `f1ce058ccd`).
   - For Workflow families, the depth42 stopped cell adds that "EP-118 refuses unlisted Workflow writers", so a writer listing is needed.
4. **`closed_payload_schema`.** The root is closed (`additionalProperties`/`unevaluatedProperties` false) and consistent with current precedence. Stopped v2 is CONFLICT today: it has "`expected_goal_revision` ... no Workflow revision fields", against the GRS-079/080 envelope.
5. **`scope_identity`.** The scope policy, identity pointers, envelope joins, and an exact event-ID and idempotency-key recipe. The rule table cites `Contracts_V0.md` 1008, 1016 and 1028 for this recipe (8 cells were lowered on it).
6. **`replay_idempotency`.** The same key and digest return the original with no second effect, and a conflicting digest yields `idempotency_conflict`. The lost acknowledgement is resolved through SP-286/CV-339 `resolve.v2`, and recovery never re-executes.
7. **`retention`.** A structured `retention_policy_ref` that resolves in the catalog, projection and checkpoint policies (`RP-PROJECTION-3GEN`), and "no open retention choice".
8. **`redaction_custody`.** The redaction mode and no-secret rules, plus custody: who holds the original, backup and restore coherence, and access and deletion checks at read. Clarification 3: "DL-076 applies to every stored token".
9. **`transitions`.** Exact state edges with ordering barriers. "Missing transition ordering barrier" is a lowering rule of criterion 9.
10. **`consumers_checkpoints`.** A named projector and readers, the checkpoint key, value schema and version, and SP-278 "by name with DL-076 nine-field token". A `none_required` checkpoint passes where the owner names each reader, adopts SP-278 and stores no token. The grade is PARTIAL where there are only generic consumers or where the owner flags a missing operating consumer. For GoalRun families, DL-080 requires extending the GRS-085 projection.
11. **`compatibility_withdrawal`.** Explicit compatibility with the predecessor version, plus an explicit withdrawal protocol: the writer is cut off, readers are fenced, and there is a rebuild. Started and cancelled are PARTIAL here: "state no withdrawal protocol".
12. **`positive_negative_oracles`.** Owner-authored or owner-pinned positive and negative cases that can test the boundary.
    - "Untestable boundary or prose-only oracles" lower the grade (10 cells were lowered on this rule).
    - Clarification 2: pinned external suites count unless a later amendment contradicts them.
    - DL-076 bars a persisted `redb_snapshot_id` in pinned suites.

### 6.3 Mechanics (depth42 "Method" and JSON shape) to reuse for one family

- **Cells.** Every cell cites current line ranges with an exact quote. Quotes are checked mechanically as exact substrings; the SHA-256 of each cited range is stored as `excerpt_sha256`, and the quotes go in a bundle. With `/mnt` unavailable in the cloud, put the bundle under `reports/event-authority-20260911/replan-v8/a3/`, as A0 did (OQ-8). Every PASS carries at least one evidence path under `Plans/`, as the validator's `depth_pass_without_plans_evidence` rule requires.
- **Top-level keys**, mirroring depth42: `schema_id` (`pm.assurance.event_authority.step08_current_depth.v1`, or a single-family variant), `assessment_id`, `assessed_tree {commit}`, `registry {path, revision, sha256 = after-SHA, families}`, `supersedes`/`prior` (depth42 path and `ba9b84f9…`; only the stopped row is superseded), `status_meaning`, `dispositions_meaning`, `method`, `status_counts`, `native_execution`, `rows` (exactly one), `evidence`.
- **The row:** `event_type`, `family_id`, `family_revision` (the after row's), `registry_pointer` `#/families/5`, `disposition`, `pass_count`, `normative_depth_complete`, `native_execution`, `current_owner_units`, `cells`, `remaining_gaps`, `grading_batch`.
- **Each cell:** `status`, `representation`, `finding`, `prior {source, status}`, `change` (`carried`/`upgraded`/`downgraded`), `change_reason`, `evidence[{path, unit, line_start, line_end, excerpt_sha256}]`.
- **Priors are evidence to re-check, "never as answers".** Stopped's depth42 row (batch GC, 3 PASS): P P p C p p P p p A p p, i.e. membership P, owner P, producer p, schema C, scope p, replay p, retention P, custody p, transitions p, consumers A, compat p, oracles p. Its `remaining_gaps` name the owner work: v3 successor, EP-118 listing, SP-286 ordering, GRS-085/SP-312 reducer or an SP-278 consumer, and D-R21 versus GRS-075.
- **Rebase currentness.** Every cited excerpt must still be byte-identical at the landing base. If not, re-grade that cell, following the depth42 and handover practice (`step-08-depth42-handover-20260924.md` "Where I stopped").
- **What the file does not do.** It moves no PNC-019 "depth complete" flag (depth42 md, "What this does not do") and re-grades no other family (Q-03).

---

## 7. The admission fingerprints that re-freeze when rows 0-5 change

All values were recomputed at `origin/main` and match. "Recipe" is how each value is computed.

| # | Value (now) | Recipe | Where it is pinned (`origin/main` line) |
|---|---|---|---|
| F1 | `e2b5a433c668a36ffe3ffdc329f90a0f860b680bbc54fb9c596d1a302c6cd306` ("current39") | `fingerprint([rows whose family_id is in preexisting_family_ids], registry order)` | `Plans/browser_event_admission.json` 8 (`preexisting_family_rows_sha256`); `Plans/browser_event_admission.schema.json` 46 (`const`); `scripts/pm-browser-event-admission.py` 31 (`CURRENT39_SHA256`, compared at 207); `tests/test_pm_browser_event_admission.py` 185-187 (asserts the live fingerprint equals `CURRENT39_SHA256`) |
| F2 | `a27cf49b63d364ae0d6d6f62b0ebc8d3ebe9e66df6de8e58814d099194d81050` (prefix40 = upstream40) | `sha256(json.dumps(registry["families"][:40], sort_keys=True, separators=(",", ":")))` | `scripts/pm_emit_only_event_contract.py` 16 (`PREEXISTING_REGISTRY_ROWS_SHA256`; comment 10-15); `Plans/github_project_event_admission.json` 5; `Plans/testing_session_event_admission.json` 8; `tests/test_pm_emit_only_event_boundaries.py` 28 (`PREFIX_SHA256`, used at 130); `tests/test_pm_browser_event_admission.py` 67 (comment 65-66) |
| F3 | `b59cc61d0f6569d1389256157d29d80f88516644b70c029809d4543405be52ea` (upstream40 sorted by `family_id`) | `sha256(json.dumps(sorted(upstream, key=family_id), ...))` | `tests/test_pm_testing_session_events.py` 34 and `tests/test_pm_github_project_integration.py` 62 (comments 32-33 and 60-61). **Missing from A0's list.** |
| F4 | stopped successor pin (new) | tuple `(historical v2 fingerprint, successor fingerprint, adoption commit, owner anchor)` | `scripts/pm-browser-event-admission.py` `REVIEWED_GOAL_SUCCESSORS` 45-79 (A0 cites 36-67, now stale). The historical element is `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3` (simulated). The code reads only `[0]` and `[1]` (lines 140, 154, 222); `[2]` and `[3]` are informational. Also the "six owner adoptions" comment at 47. `tests/test_pm_browser_event_admission.py` `test_exact_six_complete_adoptions…` 116-127 pins the successor set to six IDs and must add `event-family-goal-run-stopped` (**missing from A0's list**). |
| P1 | provenance only | commit and registry SHA of the baseline | `Plans/github_project_event_admission.json` 6-10 and `Plans/testing_session_event_admission.json` 9-13 (`preexisting_registry_baseline_source`: `f6350caf2…`, `0be54418…`); `Plans/browser_event_admission.json` 51 (`known37_assignment_disposition`: "re-frozen on 2026-09-23 after six landed goal v3 adoptions"). Precedent `1cdf39074` (review finding R-12) updated these. It says "No script reads these fields". **Missing from A0's list.** |
| R1 | readiness map | `EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS["goal_run.stopped"]` | `scripts/pm-implementation-readiness.py` 494, currently `"Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json"`. If the v3 ref differs and this is not moved, readiness reports `event_family_registry_goal_payload_ref_mismatch` (3087) on `Plans/event_family_registry.json:families/5`: a new failure on a branch file that is not staleness, which would block the landing (exit 2). The certified landing carried this as an excused row under Jared's "Confirm, land it" (`landing-record-20260923.json` `kept_goal_payload_ref_rows`); `855eea9aa` later re-pinned the three v3 refs (comment 490-494). The self-test drift list at 5470-5473 may gain stopped. **Missing from A0's list.** |

**What each value guards, and what fails if it is not moved.**
- **F1:** `current_preexisting_manifest_hash_mismatch` and the test at 187.
- **F2:** `preexisting_registry_unchanged()` goes false, and the emit-only, testing-session and GitHub gates fail. So do `test_exact_six_absent_and_preexisting_forty_unchanged` and the synthetic all-prepared fixture (browser test 67).
- **F3:** the two tests.
- **F4:** without the new entry, the historical reconstruction sees an unreviewed changed row, and `preserved39`/`preserved40` fail with `historical_preexisting_baseline_mismatch` (lines 202-206).
- **What does not change:** `ORIGINAL39_SHA256` and `ORIGINAL40_SHA256` (lines 27-28) are historical and must stay. With a correct F4 entry, reconstruction still yields `f548a297…` and `4f701c95…`.

**The constraint on the successor row (confirmed by simulation).** `historical_preexisting_rows()` overwrites only six fields with the v2 values derived from the event type stem. For stopped these are the v2 path `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json`, the schema ID `…goal_run_stopped.schema.v2`, the anchors `#goal-and-goalrun-payload-minima` and `#sp-214---goal-runtime-persistence-consumer`, and the three `source_refs`. They reproduce the current v2 row exactly.
- A successor that changes only those six fields passes with the F4 entry.
- Any change to `legacy` (aliases, identity pointers, redaction), `scope_policy` or `retention_policy_ref` makes the historical pin unreproducible and raises `historical_preexisting_row_reconstruction`. That needs a gate code change and its own review (OQ-5).
- `Contracts_V0.md` 1084 separately calls such changes "a governed migration revision, never a silent reinterpretation".

**The re-freeze precedent (2026-09-23; all three are ancestors of `origin/main`).**
- `c7b136ad2`: "re-freeze the upstream event-row hash after six landed goal v3 adoptions". It changed F2 in the script, both manifests and the emit-only test, and F3 in both tests. Its message names every landed row commit: `3890d86c70`, `5fc9747b6f`, `1136661ddc`, `e686963ad5`, `a3c511657f` and `f6350caf27`.
- `d21679659`: the Browser manifest and schema `const` (F1) and the test's upstream40 (F2). "Kept as its own commit so it can be dropped without touching the rest of the branch."
- `1cdf39074`: review finding R-12, the provenance fields (P1).
- Related: `59ad4b3c2` added the certified successor tuple (F4 pattern); `33edfd71f` introduced `CURRENT39_SHA256` apart from `ORIGINAL39`.
- Registry SHA pins in `Plans/goal_certified_family_composition.json` 41, `Plans/goal_run_certified_consumer_contracts/owner-sources.json` 41 and `source-citations.json` 213 name `0be54418…`. No script or test reads them (grep over `scripts/` and `tests/` finds nothing), so they stay as dated source pins.

---

## 8. PNC-019 checkpoint pins: does a Jared-approved row revision move them?

- **What the helper checks.** `scripts/pm_pnc019_currentness.py` `pnc019_event_authority_failures_for_registry` (256-300) compares `{registry_schema_id, registry_schema_version, registry_revision, registered_kernel_rows}` with the constants at lines 41-42 and 50-51. A mismatch gives `event_authority_checkpoint_changed_requires_fresh_approval`. The registry SHA is not compared there.
- **Same-label revision (the certified precedent).** Neither constant moves. The count stays 42, or 42+k if coordination admissions land first. No test pins the label: the test pins in `test_pm_testing_session_events.py` 93 and `test_pm_github_project_integration.py` 265 are the count 42.
  - What goes stale is the provenance comment at lines 43-49, which names `0be544181eda…` as "the 42-family Step 8 comparison checkpoint".
  - Following the Step 8 precedent (the comment was rewritten when Jared approved `0be54418`; `3d391fd29` changed only the two AST nodes and the comment), the approved revision's landing updates that comment. It names the new SHA and the new checkpoint record, keeps `0be54418…` as the approved predecessor, and writes a new checkpoint approval record.
  - The file is Spec-Locked, so this adds one Spec Lock `stale_hash` staleness row (compare the coordination measurement: "Spec Lock +1, `scripts/pm_pnc019_currentness.py`, which is Spec-Locked").
- **Bumped label (OQ-3).** `EVENT_FAMILY_REGISTRY_REVISION` (line 50) moves in the same landing, and the card must say so, because this is a checkpoint move Jared approves. The count stays the same, and no test pin moves.
- **The live-registry SHA check.** It sits in the untracked currentness edition: `EVENT_FAMILY_DENOMINATOR_STATUS.json` `registry.sha256`, compared at line 177 as `event_authority_currentness_live_registry_drift`. The files under `Plans/.audits/event-authority-2026-08-13-currentness/` are absent from `origin/main` and come in "through an ignored local symlink" (`step-08-checkpoint-2026-09-11.2.json` `retained_currentness_inputs`).
  - At landing this gives staleness rows: the currentness drift for `Plans/event_family_registry.json` and the live-registry drift, "+2" by the coordination measurement (`step-09-coordination-prep-20260925.md` 285).
  - Those rows are resealed only by the designated Plans agent (CLAUDE.md "currentness edition written in place after a backup").
- **The PNC-019 receipt.** `Plans/.implementation_readiness/pnc019_certification_receipt.json` `source_hashes` has no entry for `Plans/event_family_registry.json`. The registry is therefore already inside the 17 pre-existing `pnc019_source_hash_stale` rows of the baseline, as far as I can tell, so no new row appears (unverified by a run).
- **Summary.** Jared's approval moves the checkpoint identity (SHA). It moves the helper constants only if the label is bumped.

---

## 9. Landing-check expectations, measured by precedent (not run here)

- **Staleness (not blocking).** Currentness drift for the registry and the live-registry drift (+2 readiness); Spec Lock `stale_hash` for edited Spec-Locked files (registry, the Plans owner docs, `pm_pnc019_currentness.py` if edited); stale owner and artifact evidence; readiness report; migration snapshot. Every one goes in a reseal request.
- **Blocking unless the branch handles it.** `event_family_registry_goal_payload_ref_mismatch` if R1 is not moved. Any failure in the Browser, emit-only, testing-session or GitHub gates if F1-F4 are not re-frozen. The landing check reads failures by branch path, and `Plans/event_family_registry.json` is a branch path.
- **Full tree.** The landing check refuses a sparse worktree (exit 3), so run it on the full tree.

---

## 10. Ordering hazards

- **H-1: the before-SHA may move.** The seven coordination admissions (Step 9 batch 2, DL-078 standing rule) each change the registry SHA, the revision label and the count. `Plans/coordination_event_admission.json` 7-12 is prepared against `0be54418…`. If any of them lands before stopped, the card's before-SHA and count go stale. Q-02 says cards are "frozen at the bytes he sees", so either re-freeze and re-present the card, or have the card approve the row change and state that its whole-registry before-SHA is the one at landing (OQ-10).
  - Coordination rows are appended after row 41, so they do not change F1, F2 or F3.
  - Stopped does not change the coordination checks: `pm_coordination_events.py` `registry_membership_failures` matches only coordination rows.
- **H-2: Decision Log numbers.** The next free number on `main` is DL-094. The coordination simulation uses "DL-094" (`tests/test_pm_coordination_events.py` 671), and each coordination admission adds its own entry. Assign the number at landing, after rebase.
- **H-3: A1 and A3.** A1 (`EP-127`, `GRS-089`) is pending context and does not touch the registry, `pm_pnc019_currentness.py`, `pm-browser-event-admission.py` or `Decision_Log.md` (empty `git diff --stat` for those paths). GRS-089 says the combined route has "no stopped or blocked Event" and EP-127 "appends no Event: no goal_run.stopped" (A1 `Goal_Runtime_System.md` 8267 heading, 8297, 8337). So the writer that the A3 card names is not A1's Stop route. That is S1's concern, but the card has to name the writer.
- **H-4: rebases change commit hashes.** The F4 tuple's commit element and the record's `row_commit` must be the post-rebase hashes. They are informational only.

---

## 11. Open questions (unresolved; not decided here)

- **OQ-1.** The path for the Q-03 record, outside `admission-records/*.json`: a subdirectory `admission-records/original-37-revisions/` or a sibling `revision-records/`? The coordinator decides. The Q-03 wording "every registry landing then uses the same form" does not name a path.
- **OQ-2.** How to meet "first line" in JSON: a first key such as `seal_check_note`, or a companion `.md`? And should `schema_id` stay the post-August one or become a variant?
- **OQ-3.** Keep `registry_revision` `2026-09-11.2` (the certified precedent) or bump it? `Contracts_V0.md` 1084 and storage-plan 17523 key determinism on the registry revision. A bump moves `EVENT_FAMILY_REGISTRY_REVISION` and must be on the card.
- **OQ-4.** The record's `decision_ref`: the new Q-02 Decision Log entry, or DL-080? D-02 (DL-093) is answered only for the seven coordination families.
- **OQ-5.** Will the stopped v3 row change anything outside the six reconstructable fields, for example a `run_id` identity pointer, which depth42 lists as a scope gap? If so, the Browser gate code must change as well as its pins, which is a scripts change needing review.
- **OQ-6.** The record's landing-commit field for a same-landing record: the row commit, the landing record path only, or a follow-up commit?
- **OQ-7.** The twelve-criteria text above is reconstructed. Confirm it against `rubric.md` (SHA-256 `81f1d8b2…`) from a local session.
- **OQ-8.** Where the single-family quote bundle lives when `/mnt` is unreachable: a compact bundle under `reports/event-authority-20260911/replan-v8/a3/`?
- **OQ-9.** The card ID and file location (under `replan-v8/`?), and whether the card should also report the depth grade of the revised row.
- **OQ-10.** If the registry moves between Jared's answer and the landing (H-1), is the answer tied to the row diff (both fingerprints) or to the whole-registry SHAs, which means re-presenting the card?
- **OQ-11.** Whether the landing may rely on moving R1 in `pm-implementation-readiness.py` (the scripts are in scope), or whether, as on 2026-09-23, the ref mismatch is carried as an excused row that needs Jared's "Confirm, land it".
- **OQ-12.** The answer source file: the precedents cite `/mnt/.../decision-card-answers-*/ANSWERS*.md` with a SHA-256. A cloud-presented card needs an equivalent source that the local landing session can pin.
