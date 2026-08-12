# NEW residual classification (EXTRACT_SUMMARY)

**Generated:** 2026-08-12T11:04:49Z  
**Rule:** `DIRECT_EVENT_TYPE_BINDING_REQUIRED` (`admission/CENSUS_ADMISSION_RULE_V2.md`)  
**Universe:** EXTRACT_SUMMARY provisional classes `NEW_AUTH_CUE_CANDIDATE` (2913) + `NEW_LEXICAL_ONLY` (6904) = **9817**  
**Admission:** none. Census-adjudication ledger not appended. IndividualDisposition not written. Owner sheet not edited.

## Exact counts

| Class | Count |
|---|---:|
| `already_in_census` | **93** |
| `rejected_lexical` | **9724** |
| `emit_restore_candidate` | **0** |
| `needs_owner` | **0** |
| **Total** | **9817** |

### By provisional class

| Class | NEW_AUTH_CUE_CANDIDATE | NEW_LEXICAL_ONLY | Total |
|---|---:|---:|---:|
| already_in_census | 50 | 43 | 93 |
| rejected_lexical | 2863 | 6861 | 9724 |
| emit_restore_candidate | 0 | 0 | 0 |
| needs_owner | 0 | 0 | 0 |

Identity: `already_in_census` + `rejected_lexical` + `emit_restore_candidate` + `needs_owner` = 93 + 9724 + 0 + 0 = **9817**.

## Method

1. Read `extract/EXTRACT_SUMMARY.json` (provisional class counts), `extract/OCCURRENCE_LEDGER.jsonl` (exact tokens), `admission/CENSUS_ADMISSION_RULE_V2`, `rejected-lexical/REJECTED_LEXICAL_CANDIDATES.json` (81-row sink), `census-adjudication/LEDGER.jsonl` (528 rows), `admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` (v3 triple-bound / md_only / json_tokens), and `Plans/event_family_registry.json`.
2. For every NEW token, exact-token checks only:
   - census-adjudication `event_type` membership → `already_in_census` (no re-admit)
   - family-registry `families[].event_type` → persist/registry binding
   - JSON `event_type` field on EventRecord/producer/payload-contract objects across the 180 frozen inventory JSON/JSONL sources
   - markdown same-line EventRecord / `event_type` / seglog clauses across the 72 frozen MD sources
   - v3 triple-bound emit (`expected_event_types` ∧ `effect_kind=event` ∧ `receipt_or_event_refs`)
3. No nearby auth-cue / persist-cue promotion. No bulk register.

## already_in_census (93)

Already covered by census-adjudication; **not** re-sunk and **not** restored again.

### NEW_AUTH_CUE_CANDIDATE → unresolved (2) — prior emit restore

- `testing.capability_policy.updated`
- `testing.visibility_policy.updated`

These are the Advisor-2 false-lexical restores (`FALSE_LEXICAL_RESTORE.json`). Persistence remains open; `EMIT-PERSIST-026` already covers emit-without-persist. No ADMIT.

### NEW_LEXICAL_ONLY → unresolved (22) — prior triple-bound emit merge

- `docker.host.access_open_requested`
- `docker.host.instance_lifecycle_requested`
- `docker.host.instance_retention_recorded`
- `docker.host.preflight_requested`
- `docker.host.profile_saved`
- `docker.host.receipt_opened`
- `docker.host.refresh_requested`
- `docker.host.session_launch_requested`
- `docker.hosts_route_opened`
- `github.actions.dispatch_readiness_validated`
- `github.actions.readiness_compared`
- `github.repo.create_requested`
- `health.route_opened`
- `planning.plan_approved`
- `prd_builder.approval_snapshot.created`
- `prd_builder.prd_pack_approved`
- `project.github_repo_bound`
- `remote.reconnect.requested`
- `testing.session.backgrounded`
- `testing.session.opened`
- `testing.session.redaction_inspected`
- `testing.session.watch_started`

These 22 plus the 2 testing restores above are 24 of the 26 `UNRESOLVED_EMIT_CANDIDATE` rows. The other 2 emit candidates (`planning.approval_cas_receipt.written`, `plan_compile.run_created_or_bound`) are `NEW_AUTH_CUE_MIXED_NOISE` and out of this universe.

### NEW_AUTH_CUE_CANDIDATE → rejected_lexical_candidate (48)

Already in the 81-row rejected-lexical sink / census `rejected_lexical_candidate` category.

- `agent_coordination.rs`
- `analytics.scan_batch_size`
- `branching.assistant_auto_worktree`
- `chat.thread_worktree_`
- `chat.thread_worktree_pr_failed.phase`
- `context_capture.rs`
- `context_files.rs`
- `current_project.path`
- `dap_client.rs`
- `defs.event_record_1_0_0_compatibility_reader`
- `doctor.live_visualization`
- `doctor.live_visualization.evidence`
- `error.concurrent_edit_conflict`
- `file_manager.worktree_follow_thread`
- `goal.evidence_captured.payload.retention_policy_ref`
- `grid_texture.rs`
- `gui.use_plan_mode_all_tiers`
- `orchestrator.project_state`
- `payload_schema_ref.schema_id`
- `permissions.external_directory.pick`
- `pm.activity_bar_order`
- `pm.debug.launch_profiles`
- `projection_trust.status`
- `restore_point.expired.payload.retention_policy_ref`
- `run.qa_cycle_`
- `safe_point.sp`
- `self.build_tier_context`
- `self.log_blocked_command`
- `self.state_file.exists`
- `self.subagent_selector.select_for_tier`
- `source_control.accordion_state`
- `source_control.project_state`
- `source_control.worktree_filter`
- `tier.plan_mode`
- `tier_overrides.get`
- `tier_start.rs`
- `tool.execution_`
- `tools.custom_headless`
- `type_payload.restore_point_id`
- `ui.chat.in_memory_cap_messages`
- `widget.analytics_chart`
- `widget.budget_donuts`
- `widget.completed_prose`
- `widget.current_task`
- `widget.multi_account`
- `widget.progress_bars`
- `widget.quota_summary`
- `widget.tool_usage`

### NEW_LEXICAL_ONLY → rejected_lexical_candidate (21)

- `accounts.empty.no_profiles`
- `agent_id.to_string`
- `attachments.is_empty`
- `effective_request.prompt`
- `message_id.to_string`
- `node_config.platform`
- `output_parser.rs`
- `request.context_files`
- `security_filter.check_file_access`
- `self.base.bash_guard.check_prompt`
- `self.base.execute_command`
- `self.build_args`
- `self.load_state`
- `self.state_file.with_extension`
- `self.store.append_coordination_event`
- `self.store.read_coordination_agents_by_file`
- `self.store.read_coordination_snapshot`
- `self.store.read_file_conflict_projection`
- `subagent_invoker.rs`
- `tier_node.tier_type`
- `widget.agent_terminal`

## emit_restore_candidate (0)

v3 scan: **77** triple-bound tokens, **0** missing from census-adjudication. This universe contains **24** triple-bound tokens; all 24 are already `unresolved` in the ledger (lists above). No additional emit-restore candidates. Do not ADMIT.

JSON machine-contract lexical hits that are **not** triple-bound: **537** NEW tokens (including **18** `refs_only` `cmd.*.dispatch_receipt` rows). Insufficient under the emit-binding amendment. Classified `rejected_lexical`.

## needs_owner (0)

No new irreducible product question. No family-registry member is in this universe and absent from census. Do not add owner-sheet rows.

Parent: none. Existing `EMIT-PERSIST-026` already covers the emit-without-persist stance for the 26 ledger emit candidates.

## rejected_lexical (9724)

Tokens with **no** exact-token EventRecord / family-registry / EventRecord-producer binding and **no** triple-bound emit binding, and not already in census.

| Provisional class | Rejected |
|---|---:|
| NEW_AUTH_CUE_CANDIDATE | 2863 |
| NEW_LEXICAL_ONLY | 6861 |
| **Total** | **9724** |

Verdict: `REJECTED_LEXICAL_CANDIDATE`. Sink: this artifact (not IndividualDisposition, not denominator, not census-adjudication append).

SHA-256 of newline-joined sorted rejected tokens: `a36c1bb3ad4b571a042f10e96ef7dd972e1dd29ca7744c876af47b2f5b704c05`

The 81-row `REJECTED_LEXICAL_CANDIDATES.json` is **unchanged** (focus83 universe, aligned to 81 census `rejected_lexical_candidate` rows). This file is the NEW-residual sink.

### Reviewed and insufficient (not emit-restore, not persist-bind)

`Plans/.implementation_readiness/non_executable_closure_evidence.json` `event_payload_contract_registry.payload_contracts` names five NEW_LEXICAL_ONLY tokens with a `producer` string and `payload_schema_id`:

- `plan_compile.stage_receipt.recorded`
- `executor.intake_report.recorded`
- `provider.stream.event_recorded`
- `testing.receipt.recorded`
- `goal.receipt.recorded`

Not direct EventRecord/seglog/`event_family_registry` binding: payload schema files are absent; `event_record.schema.json` `event_type` is a pattern not an enum; sibling rows in the same table that *are* triple-bound were restored as emit candidates, not persisted-family ADMIT; these five are not triple-bound. Disposition: `REJECTED_LEXICAL_CANDIDATE`.

Markdown EventRecord/seglog co-occurrence for NEW_AUTH_CUE_CANDIDATE tokens is filenames, redb keys, wildcards (`debug.investigation.*`, `chat.thread_worktree_*`), method/config identifiers, and schema paths — not `event_type=<tok>` binding clauses.

## Drift-pass token not in this universe

EXTRACT_SUMMARY `drift_census_pass` unique new full-lexical tokens: `cmd.workspace_layout.move_surface` (already NEW_LEXICAL_ONLY → rejected here), `home_workspace_layout.v1` (already NEW_AUTH_CUE_CANDIDATE → rejected here), `home.drop_target` (**absent** from OCCURRENCE_LEDGER / the 9817). `home.drop_target` has no EventRecord/registry/producer or triple-bound emit binding; if counted it would be `REJECTED_LEXICAL_CANDIDATE`. It is **not** included in the 9817 counts.

## Files touched

- `closed-world-census/rejected-lexical/NEW_RESIDUAL_CLASSIFICATION.md` (this file)
- `closed-world-census/rejected-lexical/NEW_RESIDUAL_CLASSIFICATION.json` (machine summary + full token lists)

## Files not touched

- `census-adjudication/LEDGER.jsonl` (no admission)
- `individual-disposition/**`
- `OWNER_DECISION_SHEET.md` / `.json`
- `rejected-lexical/REJECTED_LEXICAL_CANDIDATES.json` / `.jsonl` (81-row universe preserved)
- denominator / registry

## Non-claims

- Denominator remains `closed=false`
- No ADMIT / no bulk registration
- Nearby persistence/auth cues are not admission
- Triple-bound emit is not persistence proof
