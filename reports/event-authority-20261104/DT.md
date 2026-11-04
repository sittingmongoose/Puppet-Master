# DT-P2 — Event Authority technical closure, 2026-11-04

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. First-pass head: `713241763c90de78a7b8f8777da75d0bb05a3031`. Assessed implementation head: `d5cbc5d5d5a32a3dba2c398c158a9ac99e6b5d83`. The publication commit adds only reports; all source hashes in the self-grade identify the same final contracts. Worktree: `/home/sittingmongoose/pm-worktrees/DT-p2`, left for the lead.

**17 families now PASS every technical criterion.** Ten have 11/12 PASS and seven have 10/12 PASS. Every prepared family's membership stays ABSENT. The seven explicit retention markers stay PARTIAL for RT. `tool.custom_headless.skipped` stays product-blocked; DT drafts no duplicate of DS15. These are normative self-grades, not independent review, admission or native implementation evidence. Native execution is NOT_RUN throughout.

## Per-family before and after

| Family | Before PASS/12 | After PASS/12 | Remaining non-PASS cells |
|---|---:|---:|---|
| `approval.requested` | 8 | 11 | membership_version ABSENT |
| `approval.granted` | 8 | 11 | membership_version ABSENT |
| `approval.denied` | 8 | 11 | membership_version ABSENT |
| `approval.timeout` | 8 | 11 | membership_version ABSENT |
| `config.migrated` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `gate.evaluation_started` | 8 | 11 | membership_version ABSENT |
| `gate.failed` | 8 | 11 | membership_version ABSENT |
| `gate.passed` | 8 | 11 | membership_version ABSENT |
| `requirements.clarification_requested` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `run.background_enqueued` | 8 | 11 | membership_version ABSENT |
| `tool.denied` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `tool.execution_completed` | 8 | 11 | membership_version ABSENT |
| `tool.execution_started` | 8 | 11 | membership_version ABSENT |
| `tool.invoked` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `usage.event` | 5 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.created` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.deleted` | 7 | 10 | membership_version ABSENT; retention PARTIAL |
| `tool.custom_headless.skipped` | 1 | 1 | Product-blocked; exact cells below |

## Closed technical cells

Each of the 17 families has its own exact CV/SP owner text, source schemas, physical custody rows and fixture objects. There is no sibling-derived contract or shared multi-family admission. `Plans/dt_event_contracts.json` is the per-family route map; `Plans/dt_event_contracts.schema.json` closes payload, source and checkpoint values; `Plans/dt_event_contract_fixtures.json` contains the complete values, transitions, byte oracles and expected outcomes.

**Original source and producer.** Each actual producer now has a named `resolve_original` request/result contract and separate immutable prepared/completed source stages, with closed `before` prerequisites and completed `owner_result`. Preparing never guesses an outcome. SP-131 defines durable promotion; same-path changed bytes fence. The original owner commits its result under the allocated identity; a missing/uncertain result is unavailable, never a repeated external effect. Completed source durability precedes append, and SP-286/CV-339 full-value v2 plus SP-336/SP-347 barrier receipt precede dependent publication. Every original source, referenced outcome/body and first receipt joins one mandatory coherent backup closure. Older/incomplete restores fence mutation and disclose unavailable. Normal append/read explicitly adopts Case L-2/SP-026/SP-236 and SP-337's payload-store boundary. Payload refs resolve before schema/identity checks and unverified/changed bodies refuse.

**Identity and source codecs.** Project subjects use the existing Storage `project~base64url` partition and exact string-array identity recipe; integer subjects become unsigned decimal strings to preserve u64 identity. New `pm.dt.source.json.v1` defines exact sorted UTF-8 source bytes, finite plain decimal normalization and duplicate-key/Unicode/nonfinite refusal. Applicable application sources are distinct `.application.v1` siblings and reuse current CV-366 `WorkflowScopeV2`, actual server/original-operation identity, `application@1` keys and `pm.application.physical_messagepack.v1`; they do not silently share the Project recipe or relax a frozen Project resource. Actual app graph/role admission remains mandatory; unsupported roles are unavailable. The new source files are physical custody contracts, not an installed native service.

**Checkpoint and consumers.** Every existing exact consumer independently adopts SP-278/DL-076. Its full schema/value, nine-field durable token, null empty prefix, globally examined cursor, exact last match, source-proof row-set/count/range join, final source/admission/lease/access/deletion checks and whole-value CAS are explicit. Fixtures distinguish globally empty source from nonempty prefixes with no family match. Failed CAS, gaps, transplanted rows, unknown versions, changed frontier/source, withdrawal and missing retained source preserve the exact old checkpoint. Governed reinstall/rebuild is explicit; held generations never authorize source eviction.

**Semantic oracles.** The static checker passes 2,981 assertions across independent family fixtures, including original source stages and bytes, wrong/missing joins, all family-specific predecessor/outcome refusals, original full-value retry/conflict, crash boundaries, restore loss, concrete checkpoint publication/refusal, deletion/permission races, withdrawal and known/pending retention gates. Prepared/completed outcome separation and explicit lifecycle tables are independently stated for every family. The original-owner and SP-278 authentication adapters are assumed by the static models. The fixtures also name each concrete native crash/race obligation; they do not execute filesystem durability, seglog wire, redb CAS, provider/Git operations or native owner authentication.

**usage.event.** CV-614 now carries complete closed cost, provider minor-unit, per-bucket pricing, quota/window/reset/cooldown and display-policy slots, reusing the existing cost-usage artifact definitions and tightening their extension bags for the event wire. Flat cost fields are equality mirrors, not extra charges. `usage_event_ref` equals the computed event ID; original observation/hash, provider attempt, actual runtime attempt, account/billing/provider identity and parent/retry links and the actual parent_run_id join are tested. Unknown quantities remain null. Every source class and settlement state has concrete cases, including accepted partials, adjustment replacement, separate billed retries, inclusive/exclusive buckets, BYOK/subscription suppression and missing quota/cost. UF-108/SP-341 daily totals remain canonical, committed before detail expiry and preserved after derived loss; older restore discloses totals lost after backup. No live JSONL or raw-event page scan is introduced.

## Newly authored bindings and per-family searches

`DT-binding-search.json` retains the first-pass search and adds an independent current-source search for every family. Scope: live top-level Plans markdown/JSON/JSONL plus exact owners; generated shards, ledgers, audits/evidence and DT companions are excluded from recovered-binding evidence. The checked source/codec/publication roles were absent outside the DT draft. Existing SP-131, SP-278, SP-286/CV-339, SP-336/337/347 and CV-366 definitions are reused by name. This search is bounded evidence, not a claim about every archived package.

The 17 original append/consumer/checkpoint IDs from the first pass remain exact. New original-source bindings are listed below; each resolver is the exact producer method plus `.resolve_original`, with the closed request/result signature in its SP/CV unit.

| Family | Original producer / resolver prefix | Project source family | Additional app source family |
|---|---|---|---|
| `approval.requested` | `HITLBlockedEpisodeOwner.requested` | `dt_approval_requested_source` | `—` |
| `approval.granted` | `HITLBlockedEpisodeOwner.granted` | `dt_approval_granted_source` | `—` |
| `approval.denied` | `HITLBlockedEpisodeOwner.denied` | `dt_approval_denied_source` | `—` |
| `approval.timeout` | `HITLBlockedEpisodeOwner.timeout` | `dt_approval_timeout_source` | `—` |
| `config.migrated` | `SettingsMigrationCoordinator.branch_granularity` | `dt_config_migrated_source` | `dt_config_migrated_application_source` |
| `gate.evaluation_started` | `ProgressionGateRunner.evaluation_started` | `dt_gate_evaluation_started_source` | `—` |
| `gate.failed` | `ProgressionGateRunner.failed` | `dt_gate_failed_source` | `—` |
| `gate.passed` | `ProgressionGateRunner.passed` | `dt_gate_passed_source` | `—` |
| `requirements.clarification_requested` | `RequirementsQualityGate.request_clarification` | `dt_requirements_clarification_requested_source` | `—` |
| `run.background_enqueued` | `BackgroundRunQueue.enqueue` | `dt_run_background_enqueued_source` | `dt_run_background_enqueued_application_source` |
| `tool.denied` | `ToolDispatcher.denied` | `dt_tool_denied_source` | `dt_tool_denied_application_source` |
| `tool.execution_completed` | `ToolRunner.execution_completed` | `dt_tool_execution_completed_source` | `dt_tool_execution_completed_application_source` |
| `tool.execution_started` | `ToolRunner.execution_started` | `dt_tool_execution_started_source` | `dt_tool_execution_started_application_source` |
| `tool.invoked` | `ToolDispatcher.completed_invocation` | `dt_tool_invoked_source` | `dt_tool_invoked_application_source` |
| `usage.event` | `UsageTracker.normalize_finish_step` | `dt_usage_event_source` | `dt_usage_event_application_source` |
| `worktree.created` | `WorktreeLifecycleOwner.created` | `dt_worktree_created_source` | `—` |
| `worktree.deleted` | `WorktreeLifecycleOwner.deleted` | `dt_worktree_deleted_source` | `—` |

Each Project file key is `storage/event-sources/dt/<exact_slug>/{event_id}/{stage}.json`, with the family's own closed source definition; each app sibling uses the separate `.../<exact_slug>/application/{event_id}/{stage}.msgpack` and its own exact schema ID. The route map records every literal key/schema. The 24 new canonical source families have independent storage-registry recovery/restore/profile rows; no event-family registry row is appended. Their retention is the same event's co-retained dependency or explicit unresolved marker. None selects a new deadline/count/deletion policy. Existing 17 checkpoint rows change only their mirrored checkpoint schema's real empty-prefix nullability; their existing policy remains RP-PROJECTION-3GEN.

## Premise checks and DS15 overlap

- **DL-045:** every drafted exact name remains in the current approved 285-family scope, and its live semantic owner still specifies the behavior. The new identities, custody, checkpoint and recovery mechanics are technical definitions only.
- **CV-355/CV-366 and DL-300:** node/blocked-sequence approvals remain distinct from thread/tool/target chat-tool approvals. No duplicate chat-tool engine, alias exclusion or new approval decision is introduced.
- **CV-366:** the first pass's generic app recipe was insufficient. This pass reuses actual server/original-operation identity and a distinct app source/physical codec. It does not change CV-366 or enroll an unsupported app graph.
- **DL-076:** the current durable token still has nine fields; no persisted `redb_snapshot_id` is allowed.
- **Case L-3, UF-108/SP-341:** the existing approval/runtime classes and newer Usage/JSONL rules remain controlling. No old August/September retention answer is extended. No old decision answer failed its premise and was then applied.

**DS15 inspected:** `origin/plans/ea-w2-section15-newtools-20261104` at `e237aebb940767dbb323010fcf029a4df25391a5`, report `reports/event-authority-20261104/DS15.md`, contract N2-218. Its newly authored sentence selects only the first Doctor invocation per Project, including after key appearance/removal. Current `Plans/newtools.md:510` says only `Emit tool.custom_headless.skipped seglog event on first Doctor run`; the exact source phrase is backtick-quoted in canon. The per-Project reset/frequency selection is not settled by that existing sentence. N2-218 is a draft, not a recorded Jared answer. DT keeps the question and writes no second source/schema/fixture contract for this family.

**Exact outstanding question:** Is skipped eligible only on a Project's first-ever Doctor invocation, or on the first invocation that observes `tools.custom_headless` absent? If the first invocation has the key, may a later absence emit? What resets eligibility across a configuration revision, key removal/re-addition, Project import/clone or older restore? This chooses user-visible emission frequency and reset semantics, reserved to Jared by DL-045.

## Every remaining non-PASS cell

- **membership_version — ABSENT for all 18 rows.** No membership/version admission is written. Batch integration owns it.
- **retention — PARTIAL for seven prepared families:** `config.migrated`, `requirements.clarification_requested`, `tool.denied`, `tool.invoked`, `usage.event`, `worktree.created`, `worktree.deleted`. Each retains `PENDING_RETENTION_DECISION`; RT owns the structured event/source assignment. Usage duration is already decided by UF-108/SP-341; its missing structured mapping is not a new duration question. Other pending candidates remain those cited by the first pass; this worker selects none.
- **tool.custom_headless.skipped — product-blocked:** `producer`, `replay_idempotency`, `transitions` remain PARTIAL; `closed_payload_schema`, `scope_identity`, `retention`, `redaction_custody`, `consumers_checkpoints`, `compatibility_withdrawal`, `positive_negative_oracles` remain ABSENT, in addition to absent membership. All depend on the single frequency/reset question above; DT does not manufacture them around an unapproved answer. `owner_doc` remains PASS. RT also owns this row's pending retention marker.

There are no other non-PASS cells. Counts: 181 PASS, 10 PARTIAL, 25 ABSENT across 216 cells. All evidence quotes/line ranges were revalidated mechanically against the implementation head. The report-only publication does not change those contract hashes.

## Shared-file hunks, IDs and validation

- **Contracts_V0.md:** extend only DT's CV-600..616, independently per family.
- **storage-plan.md:** extend only DT's SP-580..596 with independent custody, source codec, checkpoint, lifecycle and app sibling adoption.
- **Automated_Testing_System.md:** extend only DT's ATS-290..298, with separate exact-family paragraphs.
- **storage_value_registry.json:** mirror each existing DT checkpoint's legitimate null empty-prefix cursor; append 17 Project source and seven distinct app source rows plus matching physical profiles. Existing non-DT rows/profiles retain their values. No critical/MVP set or existing policy object is changed.
- **Derived files:** regenerated via repo scripts. Only `automated_testing_system`, `contracts_v0`, `storage-plan`, `storage_value_registry` shard groups changed; the whole plan index regenerated with the 15-file ignored currentness edition SHA-256 matched first. No unrelated source shard changed.

**IDs used remain SP-580..596, CV-600..616, ATS-290..298. No new PlanUnit IDs minted.** SP-597..599, CV-617..619 and ATS-299 remain unused. First-pass allocation evidence remains in the earlier report/search; no other lane's units are edited.

| Check | Exit | Result |
|---|---:|---|
| DT contract oracles | 0 | 2,981 assertions / 17 families PASS |
| Storage registry JSON Schema | 0 | PASS |
| Storage recovery self-test | 0 | PASS |
| Storage profile checker | 1 | Same 41 pre-existing missing profiles as first-pass head; zero new errors |
| Shard generation | 0 | PASS; four edited owner groups only |
| Plan index generation | 0 | PASS |
| Shard check | 0 | PASS |
| Plan index validation | 0 | Top-level JSON status PASS |
| Self-grade evidence check | 0 | All 216 cells' current quote/line evidence PASS |

Evidence and SHA-256 manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/`, with pass-2 logs under `pass2/`; exact paths and SHA-256 values are in `DT-evidence-sha256.json`. The first-pass report/self-grade are retained under `pass2/DT-before.*`. Aggregate landing checks, independent review and native execution are not claimed by these targeted draft checks.

No main push, landing lock, reseal, .gitignore edit, event registry append, admission record, Decision Log entry, auto-decision change, frozen validator edit, protected evidence edit, test-file edit, pm-mail or subagent. The branch is pushed to both configured origin destinations; the worktree remains for lead integration. Generated currentness/readiness does not confer governance clearance.
