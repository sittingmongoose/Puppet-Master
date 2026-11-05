# Card 1, 1b and 1c retention applied in Storage, 2026-11-04 (Event Authority stream E, worker CA-RET)

Branch `plans/ea-retention-cards1-20261104`, stacked on `origin/plans/ea-storage-retention-20261104` at `4d52bd2758` (lane B2's Storage retention rebuild, which carries `RP-CHAT-THREAD-LIFETIME@1.0.0` and the DL-083/DL-089 buckets). Pushed, not landed. It writes the Storage owner text for Jared's 2026-11-04 answers to E-CARDS-1 Card 1, 1b and 1c with the clock correction in review round 1 below. The 90-day object remains incomplete pending Jared; its 13 dependent names do not have closed retention.

**Source of the decisions.** Jared's verbatim answer "approve all except 4c B" (`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-1_20261104.md`) to the cards as presented (`E-CARDS-1.as-presented-578a6774.md`, SHA-256 `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`). The deciding Decision Log entries are DL-401 (Card 1 table, every group's Recommended column), DL-402 (1b-i A), DL-403 (1b-ii A) and DL-404 (1c A), written on `plans/ea-cards1-answers-20261104` (`b6332f391a`); the Card 2 retirements are DL-405 (2a), DL-407 (2c) and DL-408 (2d). Names and groups come from the RT survey: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/RT/RETENTION.jsonl` (SHA-256 `6b0e330f45f80b304488d3e3ba0bfaf362cf00f9eb86efae8903de6d46032bca`) and `TABLE.md` (`e3b1941dc015f98ebe12e967c8394d0f5b4ffab1bf61197135914400536e4c98`), both verified against their `SHA256SUMS`.

**What it does not touch.** No event family registry row, admission record, Decision Log entry, validator logic, frozen validator, Spec Lock, `Plans/.evidence/**`, `.gitignore` or `Plans/auto_decisions.jsonl`. It registers, admits and retires nothing. Original pre-review paths changed, besides regenerated shards and index (review round 1 restores the readiness and onboarding pins to B2): `Plans/storage-plan.md` (+73/-15), `Plans/storage_value_registry.json` (+22/-6), `scripts/pm-implementation-readiness.py` (+5/-1, census pin only) and `tests/test_pm_onboarding_phases.py` (+4/-2, named by `.gitignore` line 83 `!/tests/test_pm_onboarding_phases.py`).

## 1. Per group: the rule written and the name count

All 29 groups, 174 surviving names (185 open names, less `scheduler.pass`, which DL-401 records as already decided, and less the 11 names Card 2 retires). Every name on the branch was checked by script against `RETENTION.jsonl`: per group, per policy, no name missing and none extra (section 7). Storage line numbers remain current after review round 1; the 13 90-day assignments are approved terms with an incomplete policy, not closed retention.

| Group | What | Names | Rule written | Policy object | Line |
|---|---|---:|---|---|---|
| G01 | File and folder actions | 12 | Keep; paths only, never file contents | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17442 |
| G02 | Debug investigations | 9 | 7 years; bounded summaries kept for that period | `RP-OPERATIONAL-2555D@1.0.0` | 17458 |
| G03 | Memory note changes | 1 (`memory.gist_state_changed`) | Keep; refers to the note, never copies its text. The other 7 retired (DL-407) | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17443 |
| G04 | Memory maintenance runs | 12 | 7 years; counts and outcomes only; DL-402/DL-403 terms stated | `RP-OPERATIONAL-2555D@1.0.0` | 17459, 17487 |
| G05 | GitHub sign-in | 5 | 7 years in the app-wide bucket `app:github_sign_in`, 2,000,000 cap, refused past it | `RP-OPERATIONAL-2555D@1.0.0` | 17460, 23861-23883 |
| G06 | Alert responses | 4 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17444 |
| G07 | Personas | 6 | Keep, references only, never the persona's instructions | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17445 |
| G08 | Plugins | 8 | 5 (load, load failed, tool registered, tool collision, permission override): 7 years; 3 hook records: 90 days | `RP-OPERATIONAL-2555D@1.0.0`; `RP-TELEMETRY-90D@1.0.0` | 17461, 17477 |
| G09 | Orchestrator concerns | 7 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17446 |
| G10 | Browser sessions and shared page context | 8 | 3 context: Chat; 5 session events: Keep, metadata only. Navigated and resized retired (DL-405) | `RP-CHAT-THREAD-LIFETIME@1.0.0`; `RP-AUTHORITY-INDEFINITE@1.0.0` | 17471, 17447 |
| G11 | Catalog installs | 6 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17448 |
| G12 | Dev and preview sessions | 7 | 90 days | `RP-TELEMETRY-90D@1.0.0` | 17478 |
| G13 | Live sessions inside a run | 5 | Run year | `RP-RUNTIME-365D@1.0.0` | 17466 |
| G14 | Doctor custom headless checks | 2 | 7 years | `RP-OPERATIONAL-2555D@1.0.0` | 17462 |
| G15 | Chat thread actions | 14 | Chat (`chat.response_stop_requested` survives 2b) | `RP-CHAT-THREAD-LIFETIME@1.0.0` | 17472 |
| G16 | Planning-document notes and revisions | 9 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17449 |
| G17 | Planning Wizard and requirement questions | 5 | Keep, for the names that survive | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17450 |
| G18 | Scheduling | 14 | Keep; message text stays in the schedule record, by reference | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17451 |
| G19 | Named Plans | 6 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17452 |
| G20 | To-Do | 7 | Chat | `RP-CHAT-THREAD-LIFETIME@1.0.0` | 17473 |
| G21 | Docker Compose scenarios | 4 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17453 |
| G22 | Panel pop-out and return | 2 | Keep. `settings.updated`, `settings.theme.updated` retired (DL-408) | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17454 |
| G23 | Tool calls and gate checks | 7 | Run year | `RP-RUNTIME-365D@1.0.0` | 17467 |
| G24 | Worktree lifecycle | 2 | Worktree year | `RP-WORKTREE-TOMBSTONE-365D@1.0.0` | 17481 |
| G25 | Project origin | 3 | Keep | `RP-AUTHORITY-INDEFINITE@1.0.0` | 17455 |
| G26 | Editor and model-catalog signals | 3 | 90 days | `RP-TELEMETRY-90D@1.0.0` | 17479 |
| G27 | Subagent context resizing | 2 | Chat | `RP-CHAT-THREAD-LIFETIME@1.0.0` | 17474 |
| G28 | Safe points; plan-decomposition fallback | 3 | 2 safe-point records: Run year; `plan.decomposition_degraded`: 7 years, anchored on the commit of the fallback result | `RP-RUNTIME-365D@1.0.0`; `RP-OPERATIONAL-2555D@1.0.0` | 17468, 17463 |
| G29 | Goal continuation checks | 1 | With the Goal's chat, existing Goal text rule, no count cap | `RP-GOAL-THREAD-LIFETIME@1.0.0` | 17483 |

By policy: Keep 84, 7 years 34, Run year 14, Chat 26, 90 days 13, Worktree year 2, Goal chat 1; total 174.

The assignments follow the Case L-3 form of DL-075/DL-084/DL-085/DL-086 (`Plans/storage-plan.md:17439`): each name is assigned its policy "for the time its full contract is admitted"; a retention assignment only (no admission, registration, binding or policy value); each full contract carries the structured `retention_policy_ref`, names its anchor and reconciles deletion before admission; an assignment applies only while the name survives its owner's naming work. The card's content pattern for Keep groups (names, IDs and references only, never a file, document, persona or memory body; changes no earlier answer) and its legend (holds, recovery anchors, latest-25-run anchor, live references and backups override expiry; Settings may only lengthen) are stated once for all groups.

## 2. New policy object and buckets

- **Pending `RP-TELEMETRY-90D@1.0.0`** (owner text `Plans/storage-plan.md:17437`): 90 days (`ttl_seconds=7776000`), 2,000,000 per Project, expired unheld records only, no early drop, refusal when full. No clock is chosen. The registry schema requires `anchor_kind` and has no incomplete/pending variant (`Plans/storage_value_registry.schema.json:215`, `:248`; closed root and policy objects), so the incomplete object is documented in owner prose and withheld from `retention_policies`, rather than given a default or invalid placeholder. The registry and census pins retain B2's 28 complete policies. All 13 names (G08 hooks, G12, G26) remain explicitly incomplete for retention closure. The Ordinary telemetry class row retains the approved fail-closed terms. No schema or checker rule is relaxed.
- **`app:github_sign_in`** (DL-401, G05), the third application-wide count bucket of `RP-OPERATIONAL-2555D@1.0.0`, in SP-291's subsection "Application-wide count buckets under the operational policy (DL-083, DL-089, DL-401)" (`:23861-23883`): bucket list, assignment (registered `event_type` with `scope_kind=application`; DL-401 records that the five families belong to no Project), the shared count and overflow rule (2,000,000, refused past it, no borrowing, no eviction, no effect on other buckets) and the boundary (not registered, nothing counted today). The custody paragraph (`:23859`), SP-291's acceptance criterion (`:23946`) and negative constraint (`:23961`) name the DL-401 bucket. No policy value changes.
- **Chat** reuses B2's `RP-CHAT-THREAD-LIFETIME@1.0.0`, which the card's legend names as the Chat rule. Its "no other family" sentence (`:17425`) now reads that it is assigned only to the families of DL-084 and DL-092 and the names and records DL-401 and DL-404 give it.

## 3. 1c: collaborative run records (DL-404)

`Plans/storage-plan.md:17435`: a Crew, BrainStorm, Review or Chat Room run's run record (`CollaborativeRun`), participant records, transcript messages (`CollaborationMessage`), BrainStorm proposals (`BrainstormProposal`) and Review findings (`ReviewFinding`) are assigned `RP-CHAT-THREAD-LIFETIME@1.0.0` in Project and application chats, with the chat's holds and deletion deadlines (hidden at once, purged within 24 hours, backups within 30 days, holds delay purge only). In application scope this replaces SP-351's one-year rule: `collaboration_run_application`, `collaboration_participant_application` and `collaboration_transcript_application` now carry `RP-CHAT-THREAD-LIFETIME` in SP-351's table (`:29400-29402`) and in the registry (`retention_policy_ref` and `retention_compaction` only; six lines; rows at `Plans/storage_value_registry.json:119472`, `119583`, `119694`). The Project counterparts, proposals and findings have no registry family; each registration carries this policy. Shared artifacts, original receipts and separately kept records keep their own rules; deleting a card or message never deletes a shared artifact. The DL-092 paragraph (`:17433`) now points to DL-404 instead of keeping these records open. This settles B2's open question Q2.

## 4. 1b: memory maintenance (DL-402, DL-403)

Storage stated no memory maintenance behavior anywhere: a search of `Plans/storage-plan.md` for prune, monthly summary, dedup, activation, gist and memory maintenance found only an SP-229 lineage criterion ("Memory store and chat/session files have size/compaction policies", `:16647`) and the Working Notebook's own archive rule. So the terms are stated with the G04 assignment (`:17487`): monthly summary and prune only archive; a memory is deleted only by its user; summary originals stay archived with their evidence references; neither job archives or merges a pinned memory, and pins do not stop verification, index rebuilds or out-of-date marking; neither job runs, automatically or from the Memory panel, until cutoffs exist, the two buttons show as unavailable with the reason, and the memory owner's proposed age and score return to Jared; until then `memory.monthly_summary.*` and `memory.prune_archive.*` record nothing. The duplicate sweep stays open; G04 covers only its history.

**The memory owner's own text is a separate edit, not made here:** `Plans/assistant-memory-subsystem.md` section 7.2 (lines 398-406: "Dedup sweep ... (policy-driven ...)", "Monthly summarize/compress ... (policy-driven ...)", "Prune/archive: archive or delete very low-activation gists (policy-driven; never delete pinned)") still says "archive or delete" and "policy-driven".

## 5. Retired names given no rule

Eleven names, listed at `:17485`, get no rule because a retired name is never admitted:
- `browser.session.navigated`, `browser.session.resized` (G10): DL-405 retires them.
- `memory.gist.verification_requested`, `memory.gist.verified`, `memory.gist.verification_failed`, `memory.gist.updated`, `memory.gist.pinned`, `memory.gist.unpinned`, `memory.gist.discarded` (G03): DL-407 retires them once `memory.gist_state_changed`'s full contract covers successful edits, pins, discards and automatic changes.
- `settings.updated`, `settings.theme.updated` (G22): DL-408 retires them as superseded by `settings.layer.changed`; records already written under the older DRY-guard spelling stay readable, which this text does not change.

`scheduler.pass` is outside the groups (already Run year, DL-401).

## 6. Questions for Jared (counting bucket, not chosen)

DL-401's card says a 7-year group found to belong to no Project returns to Jared with G05's counting question. Owner text shows application-scoped records for these groups; the branch chooses no bucket, decides no count and defaults none into a bucket (`:17489`); their project-scoped records count per Project.

| Group | Rule | Owner text showing records with no Project |
|---|---|---|
| G02 debug investigations (9) | 7 years | Debug works in explicit application scope (`Plans/assistant-chat-design.md:183`, ACD-508), while the minimum payload of `debug.investigation.started` requires `project_id` (`Plans/Contracts_V0.md:1532`). No-project Debug investigations are already approved. Which counting rule applies to their history? The Debug owner reconciles the older project-required minimum payload as technical work; app Debug availability is not reopened. |
| G04 memory maintenance (12) | 7 years | No-project Assistant memory is a thread-only application-scope gist corpus and index view with the existing retention (`Plans/assistant-memory-subsystem.md:3063`, AMS-054); maintenance over it has no Project. |
| G08 plugin load, tool and permission records (5) | 7 years | Plugins load and run in application scope with `project_root=None` (`Plans/Plugins_System.md:60`, `256`, `4614-4616`). |

The same question exists for three **90-day** groups, because the approved terms of the pending `RP-TELEMETRY-90D@1.0.0` count per Project; the independent clock question also remains open. The card raised it only for 7-year groups (its G05 alternative "90 days (counted in the same app-wide bucket)" shows the same need); the lead decides whether it goes on the card:
- G08 hook records (3): same plugin evidence.
- G26: **only `model.catalog_refreshed`** has an established no-project counting question here. It comes from `cmd.model.refresh` with optional `project_id` (`Plans/UI_Command_Catalog.md:8578`).
- G12: **no-project preview history**, with owner scope mapping still needed, not all seven names. Browser previews in an application chat check their permitted folder instead of requiring a Project (`Plans/assistant-chat-design.md:183`). Storage lists three preview session events (`Plans/storage-plan.md:1309`); their application payload/adoption needs owner reconciliation. The four `dev.session.*` names require `project_id` (`Plans/UI_Command_Catalog.md:919`).

Checked and not a question: G14 reads the Project's `.puppet-master/config.json` (`Plans/newtools.md:504`); `plan.decomposition_degraded` requires `project_id` and Orchestrator needs a Project (`Plans/Contracts_V0.md:2665-2673`, `Plans/assistant-chat-design.md:183`); `lsp.server.lifecycle_changed` requires `project_id` (`Plans/Contracts_V0.md:948`). `format.applied` names no scope (`Plans/Formatters_System.md:69-83`); not listed.

**Observation for the lead, not a card question:** Run year (`RP-RUNTIME-365D`, 5,000,000 per Project) and Coordination also count per Project, and runs exist in application chats (DL-292; Agent mode, G13 and G23 tool calls). The card did not raise this, B2's DL-085 line reads SP-351's application bound as covering application coordination records (B2 Q1), and nothing here decides it.

## 7. Premise checks

| Premise | Today's text (branch base `4d52bd2758`) | Result |
|---|---|---|
| RT survey's names still name owner-text events | Each of the 174 names was searched in `Plans/*.md` and `Plans/**/*.json` outside `storage-plan.md`, shards, index and audits | holds: all 174 occur, in 1,214 files scanned (`checks/premise-name-presence.txt`) |
| None of the 174 is already registered | `Plans/event_family_registry.json` | holds: none occurs in the registry |
| The Chat object exists | `RP-CHAT-THREAD-LIFETIME@1.0.0` at `Plans/storage_value_registry.json:558` (B2) | holds |
| No 90-day object with the card's terms exists | 28 objects listed; the five 90-day ones differ (section 2) | holds |
| SP-351 still gives the three app collaborative rows one year | `RP-RUNTIME-365D` at `:29342-29344` (base lines) and in the registry | holds; replaced |
| Ordinary telemetry class has no object | class row `:17414`, no `policy_id` | holds |
| G24 and G29 objects exist with the card's terms | `RP-WORKTREE-TOMBSTONE-365D` (reference release, 365 d, 100,000/project, evict); `RP-GOAL-THREAD-LIFETIME` (explicit delete, no cap) | holds |
| The memory jobs are still "policy-driven" with no policy | `Plans/assistant-memory-subsystem.md:398-406` | holds |
| Collaborative records named by 1c exist | `Plans/Collaborative_Workflows.md` section 12 (`CollaborativeRun`, `CollaborationMessage`, `BrainstormProposal`, `ReviewFinding`); participant storage `collaboration_participant` in SP-351 | holds |
| G05 families belong to no Project | Card says so (DL-401); `Plans/Contracts_V0.md:1649-1668` (AuthEvent minima) has no `project_id`; only optional `run_id` and `thread_id` | holds as decided |
| `scheduler.pass` is already Run year | DL-401 records it as decided | holds; not written here |

B2's row citations keep their line numbers: `Plans/storage-plan.md:17427`, `:17429`, `:17431` are unchanged, and `Plans/storage_value_registry.json:558` is unchanged (the proposed telemetry object is withheld pending the clock answer). Two B2 lines changed one sentence each and keep their numbers: `:17425` (the "no other family" sentence) and `:17433` (the DL-092 paragraph's open-records sentence).

## 8. Representation and integration dependencies

- **Clock pending Jared.** The original `creation` anchor was unapproved and is removed in review round 1. DL-045 reserves this choice; DL-069 is the precedent that a duration does not choose its clock. Exact question: **Which event starts the 90-day clock? Proposed option: first durable record creation, with no reset on retry, replay or recovery.** No proposed event is selected as a default.
- **`RP-CHAT-THREAD-LIFETIME` for the 1c records**, not `RP-GOAL-THREAD-LIFETIME`. 1c says "as long as the chat exists ... with the same holds and deletion deadlines as chat history", and the legend's Chat rule is this object. It brings the 250,000-per-thread count with a linked successor (nothing dropped), which 1c does not mention. B2's reuse check already rejected the Goal object as the Chat content class.
- **Names:** `RP-TELEMETRY-90D` (class name, house pattern) and `app:github_sign_in` (house pattern of `app:storage_operational`, `app:platform_capability`). Neither occurs on `main` or any `origin/plans/ea-*` branch.
- **The class row amendment** adds the fail-closed overflow to the Ordinary telemetry row so the table and the object agree. Nothing else used that class.
- **SP-291 `depends_on` and `source_lineage` do not list DL-401.** Tried: `depends_on: [..., DL-401]` fails `pm-plan-index.py generate` and `validate` with `unresolved_dependency_references` (SP-291 to DL-401), because DL-401 exists only on `plans/ea-cards1-answers-20261104`. Add both at integration, once that branch is underneath.
- **Readiness and onboarding pins** are restored to B2's 28 because the incomplete policy is withheld; no check logic changed.

## 9. Follow-ups for other owners and lanes

- Memory owner: section 7.2 of `Plans/assistant-memory-subsystem.md` under DL-402/DL-403 (archive only; jobs unavailable until approved cutoffs; buttons show the reason; cutoff proposal back to Jared).
- Collaborative Workflows owner: fit the run settings sheet's "transcript retention" choice inside the chat lifetime (DL-404). Records DL-404 does not name (votes, question banks, Wonderer passes and leads, Review target packs) have no rule.
- 2a worker: `Plans/storage-plan.md:1312-1313` still lists `browser.session.navigated` and `browser.session.resized` under "Related events" of the preview records. That is a naming edit for the 2a owner work, not made here.
- Debug owner: reconcile `Contracts_V0.md:1532`'s project-required payload with ACD-508's already-approved application-scope Debug as technical work. Jared decides only its missing no-project counting rule.
- Integration: SP-291 `depends_on`/`source_lineage` gain DL-401 (section 8).
- Lane retention cells may cite section 1; the 13 90-day names must explicitly retain incomplete retention status until the clock answer and complete policy object exist.

## 10. Original pre-review checks (historical; round 1 results below)

Measured in this sparse worktree (`Plans scripts reports tests`) with the git-ignored currentness edition `Plans/.audits/event-authority-2026-08-13-currentness/` copied from the shared checkout (15 files, every SHA-256 equal) and the `tests/agent_packet_restrictions` symlink. Base comparisons ran in a detached sparse worktree of `4d52bd2758` with the same inputs. The ten other `Plans/.audits` landing inputs were not copied (B2 had them; see `lint-contractrefs`).

**Each Plans commit** (`0870a8083c`, `3ac5c69b01`, `449bb0d9f5`, `1fba3b8b0f`): `pm-shard-plans.py --generate --config Plans/sharding_config.json` 0, `pm-plan-index.py generate` 0, `pm-shard-plans.py --check --config Plans/sharding_config.json` 0, `pm-plan-index.py validate` 0 with top-level `status` `pass` (JSON parse), 0 failures, 7,421 PlanUnits and 29,932 acceptance units. Only the edited documents' shards (91 `storage-plan`; 630 `storage_value_registry` at the two registry commits, one renamed) and the six index files changed. Regeneration on the untouched base changed only four `generated_at_utc` values. The `depends_on: DL-401` trial (section 8): `pm-plan-index.py generate` 1 and `validate` 1 (`unresolved_dependency_references`), not committed.

**Branch verifier** `verify_branch_ca_ret.py 4d52bd2758 1fba3b8b0f RETENTION.jsonl`: exit 0, 29 of 29. It checks the allowed paths and no forbidden path (`.gitignore`, Spec Lock, `.evidence`, `.audits`, `auto_decisions.jsonl`, the event family registry, the Decision Log); only the two documents' shards; 28 base policies unchanged plus exactly the DL-401 object; family ids unchanged and exactly the three collaborative rows changed, in `retention_policy_ref` and `retention_compaction` only; no other registry key; the 174 surviving names each assigned exactly once and no retired name assigned; every retired name listed; the new ids absent at base; the census, readiness and onboarding pins at 29; B2's cited lines 17427, 17429 and 17431 unchanged; the three SP-351 rows.

**Validators and tests, tip `1fba3b8b0f` against base `4d52bd2758`** (outputs compared after normalizing hashes, timestamps and worktree paths):

| Check | Tip | Base | Comparison |
|---|---|---|---|
| `pm-plans-verify.py validate-new-contracts` | 1 | 1 | both `subprocess_timeout` at the default 180 s (machine loaded by another thread's landing check); rerun one at a time with `--subcheck-timeout-seconds 900`: tip 0 and base 0, `status` `pass`, 0 failures, equal |
| `validate-projects-refresh-contracts` | 0 | 0 | equal |
| `validate-browser-event-admission` | 0 | 0 | equal |
| `validate-testing-session-event-admission` | 0 | 0 | equal |
| `validate-github-project-integration` | 0 | 0 | equal |
| `validate-working-notebook-contracts` | 0 | 0 | equal |
| `validate-case-l-non-event-materialization` | 0 | 0 | equal |
| `validate-implementation-readiness` | 1 | 1 | equal modulo hashes |
| `verify-spec-lock` | 1 | 1 | equal modulo hashes (the three edited files were already stale at base) |
| `lint-contractrefs` | 1 | 1 | equal; the one failure is `Plans/00-plans-index.md:255` naming the git-ignored `Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`, absent from both sparse trees (B2's full tree had it: 0 and 0) |
| `pm-implementation-readiness.py validate` | 1 | 1 | the same 50 rows modulo hashes: `event_authority_currentness_source_drift` 22, `pnc019_source_hash_stale` 17, `event_denominator_unresolved` 2, `event_family_contract_depth_unresolved` 2, `storage_value_registry_spec_lock_hash_stale` 2, and one each of `buildability_gate_report_stale_or_not_canonical`, `event_legacy_fixture_root_mismatch`, `event_record_spec_lock_hash_stale`, `non_executable_closure_spec_lock_hash_stale` and `implementation_readiness_self_tests_failed`. No row names the census, the new object or the three rows: the census accepts 29 policies |
| `pm-implementation-readiness.py self-test` | 1 | 1 | equal modulo hashes (pre-existing) |
| `pm-implementation-readiness.py validate-case-l` | 0 | 0 | equal |
| `tests/test_event_authority_holding_bucket.py` | 1 | 1 | the same 2 of 34 (`PostAugustAdmissionTests`: `approval.chat_tool_requested`, `approval.chat_tool_resolved` and `settings.layer.changed` have no admission record) |
| `tests/test_pm_emit_only_event_boundaries.py` | 1 | 1 | the same 1 of 13 |
| `tests/test_pm_pnc019_currentness.py` | 1 | 1 | the same 1 of 9 |
| `tests/test_pm_coordination_events.py` | 1 | 1 | the same 14 of 50 |
| `tests/test_pm_onboarding_phases.py` | 1 | 1 | the same 1 of 47: `test_existing_family_and_retention_census_is_unchanged` stops at its 342-family pin (registry has 344) before the policy line, as B2 recorded. Its tail run on its own at the tip: 29 policies, `pm-onboarding-contracts.py` validation `[]`, onboarding storage gate no failures and 1 valid contract |

Tests ran with `python3 -m unittest` (no pytest on the VM). `pm-plans-verify.py` has no storage-registry subcommand of its own; the rows above are the validators that read the registry, as in B2's report.

**Not run:** the dry landing check (`pm-landing-check.py`); it refuses a sparse tree and was not in this task's list. The landing agent runs it.

## 11. Reseal request (carried to integration)

For the agent Jared assigns to the next reseal, from editing `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` (on top of B2's request for the same files): Spec Lock entries of the three files; plan-sharding bundle rows of the two documents and their shards (review round 1 restores the registry final shard to `628-lines-125218-125392.md`); PNC-019 source hash for the registry; a currentness edition covering both documents; run-002 `refresh-batch-hashes` and `refresh-final-summary`; the readiness gate report, and the landing agent's `snapshot-current` and baseline refresh after landing.

## 12. Original pre-review commits and hashes (historical)

| Commit | What |
|---|---|
| `0870a8083c` | DL-401 90-day rule: `RP-TELEMETRY-90D@1.0.0`, class row, policy paragraph, census line, readiness and onboarding pins |
| `3ac5c69b01` | DL-401 G05: `app:github_sign_in` in SP-291's bucket subsection and PlanUnit |
| `449bb0d9f5` | DL-404: collaborative run records, SP-351 rows, registry rows |
| `1fba3b8b0f` | DL-401 to DL-403: the Card 1 assignments, retired names, memory maintenance, records with no Project |
| this commit | This report |

| File | SHA-256 at base `4d52bd2758` | At `1fba3b8b0f` |
|---|---|---|
| `Plans/storage-plan.md` | `ca2e7162263b2f1e0c4f771d15d984f05adc4bc4db044f819033c70597ded32b` | `839267aa1e7a854caca95094cf758b3178980fb05f8aaacc2bb3bd555980e216` |
| `Plans/storage_value_registry.json` | `c52b6172362a34c10a4d23b9900e0cdb68831c97849f42c3b805e07c2c72bf87` | `286896cdb07485107e00c64bd82f75ea597d8fa6ea2e13fd197e39057a8c37b7` |
| `scripts/pm-implementation-readiness.py` | `53088b669262424e8c533f9d9f5e7a7cee547c087cd8147dac3af377b34a2501` | `c1e4ce1f33b2e36e371c4df25d00c0d541d237eef225162bcdfdf89f247331bd` |
| `tests/test_pm_onboarding_phases.py` | `cc1cceafbddd796fc5df0c762fbb6564283728d18b6fb9cc7147b1aa82bd2184` | `1bba1453c5953a8dfc6142d5913c9db7b71de1c1678d997413ebae96f9f57c15` |

The four Plans commits were built by staged scripts from one finished edit; the staged result is byte-identical to it (SHA-256 above).

## 13. Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET/` holds a copy of this report, the edit scripts (`edit_storage_plan_cards1.py`, `stage_storage_plan.py`, `edit_registry_cards1.py`, `regen_and_check.sh`, `run_validators.sh`), the name check output, the regeneration and index-validate output of each stage, and the tip and base validator and test output. `SHA256SUMS` covers every file there.


## 14. Review round 1: findings and responses

Reviewed input: `e1cb9166a6e8325c14ccf5328b2bd6ca6c975fe9`; reviewer `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-RET-sol/REVIEW.md`, read in full. Worker CA-RET-FIX1. Repair commit `5197dc998ed02e09eb6bb036d4c82e128647cbdf` (`fix(storage): leave telemetry clock pending and correct counting questions`). This report follow-up records the final check results.

1. **BLOCKING anchor — corrected in `5197dc998e`; product cell stopped for Jared.** `Plans/storage-plan.md:17437` preserves all approved 90-day terms, leaves `anchor_kind` unchosen and marks the proposed policy incomplete. The schema requires an anchor, closes both root and policy objects, and supplies no pending variant; therefore the unapproved object is removed from `Plans/storage_value_registry.json` rather than published with a default or invalid marker. Its pending definition lives in Storage owner prose. The 28 complete policies match B2 exactly. Census prose, readiness and onboarding pins return to B2's 28. `Plans/storage-plan.md:17476` leaves all 13 dependent names explicitly incomplete. **Exact question for Jared: Which event starts the 90-day clock? Proposed option: first durable record creation, with no reset on retry, replay or recovery.** DL-045 reserves the decision; DL-069 is the clock-choice precedent. No proposed anchor is operative.
2. **SHOULD FIX G02 — fixed in this report follow-up.** Section 6 asks only the missing counting rule for already-approved no-project Debug investigations (`Plans/assistant-chat-design.md:183`). `Plans/Contracts_V0.md:1532`'s older project-required payload is assigned to the Debug owner for technical reconciliation (section 9). Project-only Debug is not offered as an option.
3. **NOTE integration — carried, not claimed complete.** The answers branch and B2 must be integrated before application as decision canon. SP-291 still needs DL-401 `depends_on` and `source_lineage` once that decision is present. The landing agent re-reads current owner passages after rebase, regenerates, and runs the full-tree landing check. No governance reseal, admission, registry append, Decision Log entry or main push occurs here.
4. **No-project scope rulings — fixed in this report follow-up and the G12 scope clarification in `5197dc998e`.** G26's counting question covers only `model.catalog_refreshed`. G12 covers no-project preview history with owner scope mapping still needed, not all seven dev/preview names. `lsp.server.lifecycle_changed` and the four `dev.session.*` names remain Project-required; formatter scope needs affirmative owner evidence before another question is added.

**Retention grades.** There was no self-grade file on the reviewed branch. `CA-RET.self-grade.json` records a retention-focused reassessment of the 22 affected names, not a twelve-criterion depth certification: the 13 dependent 90-day names are retrospectively CONFLICT at the reviewed head (unapproved anchor) → PARTIAL (clock explicitly pending); G02's nine names remain PARTIAL → PARTIAL (counting unanswered). Membership is ABSENT throughout. Other criteria are not reassessed. No family is admitted or upgraded to retention PASS. No IDs were minted; existing policy name `RP-TELEMETRY-90D` remains proposed only.

**Final no-project counting questions for Jared (none answered here):**

- **G02:** How should the nine already-approved no-project Debug investigation history names be counted under the seven-year rule?
- **G04:** How should the twelve memory-maintenance history names over a no-project thread-private memory corpus be counted under the seven-year rule?
- **G08 load/tool/permission:** How should these five no-project candidate history names be counted under the seven-year rule? Permission override remains a non-emitting candidate.
- **G08 hooks:** How should the three no-project hook candidate history names be counted under the approved 90-day terms?
- **G26:** How should no-project `model.catalog_refreshed` records be counted under the approved 90-day terms?
- **G12:** How should no-project preview history be counted under the approved 90-day terms, after the owner maps its scope and payload/adoption? This does not assert application scope for all seven names.

The separate Run year/Coordination observation in section 6 stays an integration observation, not an added card question.

**Review custody:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-RET-sol/REVIEW.md`, SHA-256 `3f16860e9d61d6c7bd1b1c238d99e9a8ba65415fdb62c936afebfdf5b9812623`.


**Round-1 derived verification:** all four commands completed with exit 0 and parsed top-level `status=pass`: `pm-shard-plans.py --generate --config Plans/sharding_config.json`, `pm-plan-index.py generate`, `pm-shard-plans.py --check --config Plans/sharding_config.json`, and `pm-plan-index.py validate`. Shards: 99 sources/documents, 3,092 shards. Index: 7,421 PlanUnits, 29,932 acceptance units. Only `storage-plan` and `storage_value_registry` shard namespaces changed; the final registry shard returns to the pre-object length. The ignored 15-file currentness edition was copied and SHA-256 matched before generation. No WorkNodes or NodeSeeds were created; readiness remains `blocked_runtime_certification_incomplete`.

**Round-1 focused assertions:** `fix1/repair-checks.json` records pass: all 28 B2 policy objects unchanged; the only registry delta against the reviewed head is removal of the unapproved object; readiness and onboarding source files byte-identical to B2; the 13-name incomplete heading present; B2's cited lines 17427, 17429 and 17431 unchanged. The old branch verifier's mandatory 29-policy assumption is historical and superseded by these repair assertions, not claimed as a current passing check. No repository checker rule was changed.

| Current source | SHA-256 at repair commit `5197dc998e` |
|---|---|
| `Plans/storage-plan.md` | `860a4a568f9638b5b62b2f4d06f50796ccecee93d55176faa92d52c58d9ab79e` |
| `Plans/storage_value_registry.json` | `8676966b38668bcfc145e81c8e5593aefcab5cb1f056b234adad42b799c8dfc2` |

Round-1 logs and this report/self-grade copy live under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET/`; new command outputs are in `fix1/`. `SHA256SUMS` is refreshed after the report is final. The aggregate/full-tree landing check remains an integration obligation and was not run here.


**Round-1 validators and tests (all listed commands rerun):**

| Check | Exit | Result |
|---|---:|---|
| `pm-plans-verify.py validate-new-contracts --subcheck-timeout-seconds 900` | 0 | pass |
| `validate-projects-refresh-contracts`, `validate-browser-event-admission`, `validate-testing-session-event-admission`, `validate-github-project-integration`, `validate-working-notebook-contracts`, `validate-case-l-non-event-materialization` | 0 each | pass |
| `validate-implementation-readiness` | 1 | readiness remains blocked |
| `verify-spec-lock` | 1 | governance staleness; no reseal attempted |
| `lint-contractrefs` | 1 | same absent ignored audit report at `Plans/00-plans-index.md:255` |
| `pm-implementation-readiness.py validate` | 1 | same 50 normalized failure rows as recorded pre-review tip |
| `pm-implementation-readiness.py self-test` | 1 | same normalized failure as recorded pre-review tip |
| `pm-implementation-readiness.py validate-case-l` | 0 | pass |
| `test_event_authority_holding_bucket` | 1 | 34 tests, same 2 failing test names |
| `test_pm_emit_only_event_boundaries` | 1 | 13 tests, same 1 failing test name |
| `test_pm_pnc019_currentness` | 1 | 9 tests, same 1 failing test name |
| `test_pm_coordination_events` | 1 | 50 tests, same 14 failing test/subtest names |
| `test_pm_onboarding_phases` | 1 | 47 tests, same 1 failing test name: existing family census pin 342 vs 344; policy pin restored to 28 |

The first automated invocations of `verify-spec-lock` and `lint-contractrefs` exited 2 because the harness passed an unsupported timeout argument. Both were rerun without that argument; the table reports those completed runs. `fix1/validators/rerun-exit-codes.txt` and the two `*-rerun.txt` outputs preserve them. All test files ran with `python3 -m unittest`. Normalized readiness comparisons and failing-test-name comparisons are in `fix1/baseline-comparison.json` and `fix1/test-comparison.json`; the comparison baseline is the previously recorded pre-review tip outputs, not a fresh full-tree baseline. No runtime proof or aggregate landing certification is claimed.


## Batch 1 integration citation update (2026-11-05; CA-RET review)

The reviewed lane state above remains historical. The integration includes the answers branch: DL-401 is at `Plans/Decision_Log.md:4414` and DL-404 at `:4534`. SP-291 now carries DL-401 in both `depends_on` (`Plans/storage-plan.md:23934`) and `source_lineage`; the incomplete telemetry clock and every no-project counting question remain unchanged. B2's three row-assignment citations (`Plans/storage-plan.md:17427`, `:17429`, `:17431`) and policy-object citation (`Plans/storage_value_registry.json:558`) are still accurate. The current SP-349/SP-351 unit headings are `Plans/storage-plan.md:29094` and `:29294`. Dated check claims and original source hashes above refer to the named lane commits, not the integrated tree.


## Batch 1 review F1: frozen model-refresh citation

The historical model-refresh premise at line 86 retains `Plans/UI_Command_Catalog.md:8578`, read at `16acf7594a3fe8559af89491b895f440b314b99e`. Its separate current locator is `BATCH1_CURRENT:Plans/UI_Command_Catalog.md:8581` at `3304fae93ef11246717134e80a0ddcbc6221d8a6`; both excerpts are byte-identical. See `reports/event-authority-20261105/BATCH1-citation-locators.md` and its revision-keyed JSON for all 25 restored citation occurrences and all 273 rechecked mapping records (272 byte-identical live spans and one removed source-only row).
