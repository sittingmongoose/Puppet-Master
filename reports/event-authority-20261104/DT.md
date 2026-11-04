# DT — tools, gates and approvals, 2026-11-04

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. Base: `be4766513ff71776346fc73b84f2542990f955af`. Worktree: `/home/sittingmongoose/pm-worktrees/DT` (left for integration).

**Result: 17 separate technical drafts, each PARTIAL and NOT READY for admission; one row blocked on Jared.** No registry membership or admission records were written. This does not meet the wave's full-contract completion bar: the specific technical gaps below must close before these can be called fully prepared. No exclusions were claimed.

The draft contracts live in `Plans/dt_event_contracts.json`, closed payload/checkpoint definitions in `Plans/dt_event_contracts.schema.json`, payload cases in `Plans/dt_event_contract_fixtures.json`, and `scripts/pm-dt-event-contracts.py`. Each family has its own CV and SP unit. `DT-self-grade.json` uses the twelve-cell grading format with exact current line/quote evidence; membership remains ABSENT. Native execution is NOT_RUN.

## Per-row disposition and grade

| Row | Outcome | Self-grade | Owner units | Retention |
|---|---|---|---|---|
| `approval.requested` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-600, SP-580, ATS-290 | RP-AUTHORITY-INDEFINITE |
| `approval.granted` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-601, SP-581, ATS-290 | RP-AUTHORITY-INDEFINITE |
| `approval.denied` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-602, SP-582, ATS-291 | RP-AUTHORITY-INDEFINITE |
| `approval.timeout` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-603, SP-583, ATS-291 | RP-AUTHORITY-INDEFINITE |
| `config.migrated` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-604, SP-584, ATS-292 | PENDING_RETENTION_DECISION |
| `gate.evaluation_started` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-605, SP-585, ATS-292 | RP-RUNTIME-365D |
| `gate.failed` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-606, SP-586, ATS-293 | RP-RUNTIME-365D |
| `gate.passed` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-607, SP-587, ATS-293 | RP-RUNTIME-365D |
| `requirements.clarification_requested` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-608, SP-588, ATS-294 | PENDING_RETENTION_DECISION |
| `run.background_enqueued` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-609, SP-589, ATS-294 | RP-RUNTIME-365D |
| `tool.denied` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-610, SP-590, ATS-295 | PENDING_RETENTION_DECISION |
| `tool.execution_completed` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-611, SP-591, ATS-295 | RP-RUNTIME-365D |
| `tool.execution_started` | Draft, not admission-ready | 8/12 PASS; 3 PARTIAL, 1 ABSENT | CV-612, SP-592, ATS-296 | RP-RUNTIME-365D |
| `tool.invoked` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-613, SP-593, ATS-296 | PENDING_RETENTION_DECISION |
| `usage.event` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-614, SP-594, ATS-297 | PENDING_RETENTION_DECISION |
| `worktree.created` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-615, SP-595, ATS-297 | PENDING_RETENTION_DECISION |
| `worktree.deleted` | Draft, not admission-ready | 7/12 PASS; 4 PARTIAL, 1 ABSENT | CV-616, SP-596, ATS-298 | PENDING_RETENTION_DECISION |
| `tool.custom_headless.skipped` | Blocked on Jared | 1/12 PASS; 3 PARTIAL, 8 ABSENT | N2-066 | PENDING_RETENTION_DECISION |

## Technical gaps before admission

- **Original producer/source custody:** exact producer/admission identifiers and first-receipt ordering are drafted, but the original immutable input/result source codecs and atomic source publication/adoption need exact per-source closure. A reference string alone does not prove it.
- **Checkpoint oracles:** the typed per-family checkpoint and explicit SP-278 adoption are drafted, but concrete full checkpoint values and positive/negative empty-prefix, coverage, withdrawal and restore fixtures remain to be authored.
- **Semantic oracles:** 445 static checks cover payload closure, identity isolation and retry/conflict models. Each family's transition/recovery/custody/retention obligations are named, but concrete vectors for those boundaries remain missing. The self-grade marks producer, consumers_checkpoints and positive_negative_oracles PARTIAL for every drafted row; native NOT_RUN alone is not the reason.

## Newly authored bindings and search evidence

`DT-binding-search.json` records an independent exact-name search for each drafted family, its current partial owners, negative evidence, and every new identifier. Scope: live top-level canonical Plans markdown/JSON/JSONL and exact referenced owners; generated shards, audits, ledgers, evidence and migration inputs were excluded. This scoped search is not a claim about every archived source package.

The following are **newly authored owner contracts under DL-045**, not discovered pre-existing identifiers. Version is 1.0.0 throughout. Identity recipes use per-family original subject values listed in the companion, scope partition and event type, with RFC 8785/SHA-256; SP-286/CV-339 full-value first receipts and SP-278/DL-076 durable tokens are explicitly adopted per family. No sibling binding is used as this family's evidence.

| Family | Append admission | Operating consumer | Checkpoint key / value family |
|---|---|---|---|
| `approval.requested` | `storage.dt.approval_requested.append.v1@1.0.0` | `storage.dt.approval_requested.reader.v1@1.0.0` | `projector.checkpoint.dt.approval_requested:{storage_instance_id}:{scope_partition}` / `dt_approval_requested_checkpoint` |
| `approval.granted` | `storage.dt.approval_granted.append.v1@1.0.0` | `storage.dt.approval_granted.reader.v1@1.0.0` | `projector.checkpoint.dt.approval_granted:{storage_instance_id}:{scope_partition}` / `dt_approval_granted_checkpoint` |
| `approval.denied` | `storage.dt.approval_denied.append.v1@1.0.0` | `storage.dt.approval_denied.reader.v1@1.0.0` | `projector.checkpoint.dt.approval_denied:{storage_instance_id}:{scope_partition}` / `dt_approval_denied_checkpoint` |
| `approval.timeout` | `storage.dt.approval_timeout.append.v1@1.0.0` | `storage.dt.approval_timeout.reader.v1@1.0.0` | `projector.checkpoint.dt.approval_timeout:{storage_instance_id}:{scope_partition}` / `dt_approval_timeout_checkpoint` |
| `config.migrated` | `storage.dt.config_migrated.append.v1@1.0.0` | `storage.dt.config_migrated.reader.v1@1.0.0` | `projector.checkpoint.dt.config_migrated:{storage_instance_id}:{scope_partition}` / `dt_config_migrated_checkpoint` |
| `gate.evaluation_started` | `storage.dt.gate_evaluation_started.append.v1@1.0.0` | `storage.dt.gate_evaluation_started.reader.v1@1.0.0` | `projector.checkpoint.dt.gate_evaluation_started:{storage_instance_id}:{scope_partition}` / `dt_gate_evaluation_started_checkpoint` |
| `gate.failed` | `storage.dt.gate_failed.append.v1@1.0.0` | `storage.dt.gate_failed.reader.v1@1.0.0` | `projector.checkpoint.dt.gate_failed:{storage_instance_id}:{scope_partition}` / `dt_gate_failed_checkpoint` |
| `gate.passed` | `storage.dt.gate_passed.append.v1@1.0.0` | `storage.dt.gate_passed.reader.v1@1.0.0` | `projector.checkpoint.dt.gate_passed:{storage_instance_id}:{scope_partition}` / `dt_gate_passed_checkpoint` |
| `requirements.clarification_requested` | `storage.dt.requirements_clarification_requested.append.v1@1.0.0` | `storage.dt.requirements_clarification_requested.reader.v1@1.0.0` | `projector.checkpoint.dt.requirements_clarification_requested:{storage_instance_id}:{scope_partition}` / `dt_requirements_clarification_requested_checkpoint` |
| `run.background_enqueued` | `storage.dt.run_background_enqueued.append.v1@1.0.0` | `storage.dt.run_background_enqueued.reader.v1@1.0.0` | `projector.checkpoint.dt.run_background_enqueued:{storage_instance_id}:{scope_partition}` / `dt_run_background_enqueued_checkpoint` |
| `tool.denied` | `storage.dt.tool_denied.append.v1@1.0.0` | `storage.dt.tool_denied.reader.v1@1.0.0` | `projector.checkpoint.dt.tool_denied:{storage_instance_id}:{scope_partition}` / `dt_tool_denied_checkpoint` |
| `tool.execution_completed` | `storage.dt.tool_execution_completed.append.v1@1.0.0` | `storage.dt.tool_execution_completed.reader.v1@1.0.0` | `projector.checkpoint.dt.tool_execution_completed:{storage_instance_id}:{scope_partition}` / `dt_tool_execution_completed_checkpoint` |
| `tool.execution_started` | `storage.dt.tool_execution_started.append.v1@1.0.0` | `storage.dt.tool_execution_started.reader.v1@1.0.0` | `projector.checkpoint.dt.tool_execution_started:{storage_instance_id}:{scope_partition}` / `dt_tool_execution_started_checkpoint` |
| `tool.invoked` | `storage.dt.tool_invoked.append.v1@1.0.0` | `storage.dt.tool_invoked.reader.v1@1.0.0` | `projector.checkpoint.dt.tool_invoked:{storage_instance_id}:{scope_partition}` / `dt_tool_invoked_checkpoint` |
| `usage.event` | `storage.dt.usage_event.append.v1@1.0.0` | `storage.dt.usage_event.reader.v1@1.0.0` | `projector.checkpoint.dt.usage_event:{storage_instance_id}:{scope_partition}` / `dt_usage_event_checkpoint` |
| `worktree.created` | `storage.dt.worktree_created.append.v1@1.0.0` | `storage.dt.worktree_created.reader.v1@1.0.0` | `projector.checkpoint.dt.worktree_created:{storage_instance_id}:{scope_partition}` / `dt_worktree_created_checkpoint` |
| `worktree.deleted` | `storage.dt.worktree_deleted.append.v1@1.0.0` | `storage.dt.worktree_deleted.reader.v1@1.0.0` | `projector.checkpoint.dt.worktree_deleted:{storage_instance_id}:{scope_partition}` / `dt_worktree_deleted_checkpoint` |

Each family also has the distinct payload/checkpoint schema identifiers and references listed in `Plans/dt_event_contracts.json`. All 17 checkpoint values are derived, use MessagePack, the existing event_log derived budget and 16 KiB ceiling, RP-PROJECTION-3GEN, exact previous-value CAS and verified source coverage. Storage registry entries are contracts only, not installed native families.

## Retention and premise checks

- **Approval families:** current CV-366 explicitly preserves Orchestrator node/blocked_sequence approval events and separates thread/tool/target chat-tool approvals. CV-355 still binds tool_use_id to the actual waiting tool. Thus approval.requested/granted/denied/timeout are distinct exact families; no alias exclusion follows from DL-300's admission of chat-tool families. Case L-3 explicitly assigns Approval indefinite retention, bound to existing RP-AUTHORITY-INDEFINITE.
- **Runtime gate/run/tool execution:** Case L-3 explicitly names Runtime/run/node/attempt. gate.evaluation_started, gate.failed, gate.passed, run.background_enqueued, tool.execution_started and tool.execution_completed bind the existing RP-RUNTIME-365D class without changing limits or clocks. Project-native gates remain Project-only.
- **Pending:** config.migrated, requirements.clarification_requested, tool.denied, tool.invoked, usage.event, worktree.created and worktree.deleted retain PENDING_RETENTION_DECISION. The held custom-headless row also retains the marker. config.migrated's candidate is migration/recovery operational history, but application counting is unresolved; tool/worktree/clarification rows have runtime, authority/audit, operational or chat-content candidates (Case L-3). usage.event's window is already decided by current SP-341/UF-108 (ai.usage.usage-retention, 90-day default; daily totals forever), but the exact structured policy object is absent from today's retention_policies. RT owns binding it; DT creates no new policy and selects no cap or bucket.
- **DL-045 premise:** every one of the 17 drafted exact names is still in its current exact approved scope. Current live owners continue to require their underlying behaviors. This permits technical drafting only, not new product decisions.
- **DL-076 premise:** today's SP-278 adoption and durable token contract retain the nine-field persisted token and exclude redb_snapshot_id. DT preserves that current rule.
- **Older retention answers:** no August/September retention answer was extended or applied to a new family. No failed old-answer premise was silently reused. SP-341/UF-108's newer JSONL retirement and detailed-usage rules remain controlling.

## Question for Jared

**tool.custom_headless.skipped:** `Plans/newtools.md:494-513` says absent tools.custom_headless emits on the "first Doctor run". Does this mean once per Project lifetime, once per configuration revision, or once per absent-key episode? What resets eligibility after key/config removal or restore? This selects visible emission frequency; DT has not answered it, minted a binding for it or excluded it. No decision card or Decision Log entry is authored.

## Shared-file hunks and ids

- `Plans/Contracts_V0.md`: append CV-600 through CV-616, one separate payload/identity/compatibility contract per family.
- `Plans/storage-plan.md`: append SP-580 through SP-596, one separate producer/reader/checkpoint/custody contract per family.
- `Plans/Automated_Testing_System.md`: append ATS-290 through ATS-298; each names its individual family obligations.
- `Plans/storage_value_registry.json`: append 17 dt_*_checkpoint rows and 17 corresponding storage_profile.family_profiles entries; existing rows/profiles are preserved.
- Generated shards change only automated_testing_system, contracts_v0, storage-plan and storage_value_registry; generated .plan_index files update as a whole. No unrelated owner document changed.

Ids used: **SP-580..596, CV-600..616, ATS-290..298**. Unused assigned ids: SP-597..599, CV-617..619, ATS-299. No other prefixes minted. Before drafting, all fetched origin refs were checked for allocated SP-580..599/CV-600..619/ATS-290..299 plan_unit_id definitions: none existed. No mailbox or subagent was used.

## Checks and evidence

Check outputs are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/`. Exact SHA-256 values are in `DT-evidence-sha256.json` beside this report. `currentness-sha256.txt` confirms all 15 ignored currentness files matched the shared checkout before indexing.

- DT static checker: exit 0; 445 checks, 17 families, pass.
- Storage registry JSON Schema: exit 0; no errors.
- Storage recovery self-test: exit 0; pass.
- Storage profile checker: exit 1; 41 missing profiles on the base and the draft, zero new missing profiles. `profile-baseline-comparison.json` lists exact names and baseline commit. Other threads' missing profiles were not edited.
- Shard generation, index generation, shard check and index validation: see final machine-parsed statuses in `DT-checks.json`. Validation status is parsed from the top level.
- An initial index generation failed on missing ATS source_lineage metadata; fixed. An interim shard check failed because the registry changed after generation; regenerated. Neither interim result is presented as a final pass.

No main push, landing lock, reseal, registry append, admission record, Decision Log entry, frozen validator change, protected governance edit, .gitignore change or test-file edit. Branch remains for lead integration; governance currentness/readiness is not certified.
