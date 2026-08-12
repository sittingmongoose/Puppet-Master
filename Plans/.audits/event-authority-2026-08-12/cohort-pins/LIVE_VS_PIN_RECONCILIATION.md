# Live vs pin reconciliation

**Generated:** 2026-08-12T11:20:00Z  
**Pin file (not rewritten):** `cohort-pins/IMMUTABLE_COHORT_PINS.json` (`pinned_at_utc=2026-08-12T03:59:03Z`)  
**Live sources:**
- `individual-disposition/LEDGER.jsonl` (321 rows, `COVERAGE.json` `generated_at_utc=2026-08-12T10:13:25Z`) — admitted equality ledger
- `census-adjudication/COVERAGE.json` + `LEDGER.jsonl` (528 rows, `generated_at_utc=2026-08-12T10:23:31Z`)
- `exclusion-revalidation/EXCLUSION_REVALIDATION_SUMMARY.json` + ledger (94 rows, `generated_at_utc=2026-08-12T07:41:47Z`)

Working buckets may change. These pins do not. This artifact records mechanical set arithmetic only. It does not apply owner decisions, admit families, or claim seal.

## Pin inventory (immutable)

Pin sets are pairwise disjoint. `|union| = 248+40+68+26+2+37 = 421`.

| Pin | Count | Live working home |
|---|---:|---|
| `july248_confirmed_persisted_unregistered` | 248 | `confirmed_persisted_unregistered` / census `persisted_unregistered_quarantine` |
| `july40_unresolved` | 40 | split: 28 remain `unresolved`, 12 rebucketed `alias` |
| `july68_exact_excluded` | 68 | census `exact_excluded` minus 5 auth.github reclass |
| `july26_non_exact` | 26 | census `non_exact_excluded` (equal) |
| `august2_live_beyond_known37` | 2 | indiv `august` / census `registered_keep` August-live |
| `known37` | 37 | census `registered_keep` (equal) |

## Count identities

```
live_cpu            = pin_j248 ∪ auth5                              = 248 + 5 = 253
J248_veto           = live_cpu \ {context.compaction.completed}     = 253 - 1 = 252
live_alias          = pin_j40 ∩ live_alias                          = 12
live_unresolved     = (pin_j40 \ live_alias) ∪ emit26               = (40 - 12) + 26 = 54
live_exact_excluded = pin_j68 \ auth5                               = 68 - 5 = 63
live_non_exact      = pin_j26                                       = 26
live_august         = pin_august2                                   = 2
live_registered     = pin_known37 ∪ pin_august2                     = 37 + 2 = 39
```

Census category counts match those identities (`partition_ok=true`, total 528 = 63+26+253+39+81+12+54). Individual-disposition buckets match the overlapping live sets (`alias=12`, `august=2`, `confirmed_persisted_unregistered=253`, `unresolved=54`; total 321). Exclusion revalidation covers `pin_j68 ∪ pin_j26` = 94 (`pass_count=92`, `fail_count=2`, `auth_github_reclass_count=5`).

`cohort_pins` on live rows still cover every pin member (`PARTITION.json` `immutable_pin_set_coverage.*.ok=true`). Multi-cohort rows count toward every listed pin.

---

## 1. `july248` vs live persisted-unregistered (253)

**Set equality:** `live_cpu = pin_j248 ∪ auth5`.

| Direction | Count | Members |
|---|---:|---|
| `pin_j248 − live_cpu` | 0 | ∅ |
| `live_cpu − pin_j248` | 5 | the auth.github reclass set (below) |
| `pin_j248 ∩ live_cpu` | 248 | entire pin |

### Mechanical delta A — 5 `auth.github.*` reclass into persisted-unregistered

These five are **not** in `pin_j248`. They are in `pin_j68`. Exclusion revalidation moved them `exact_excluded → persisted_unregistered_quarantine` (`RECLASSIFY_TO_UNREGISTERED_QUEUE`, `multi_cohort_reclass=true`, `cohort_pins=["july68","july248"]`). They are in the live CPU bucket as `NEEDS_OWNER_VETO`.

1. `auth.github.authenticated`
2. `auth.github.device_code.issued`
3. `auth.github.disconnected`
4. `auth.github.failed`
5. `auth.github.token.polling`

### Mechanical delta B — J248 veto is 252, not 253

`|live_cpu| = 253` and `|live_cpu ∩ NEEDS_OWNER_VETO| = 252` because **1 of 253** `confirmed_persisted_unregistered` is evidence-gap, not veto:

| event_type | Pin | Live bucket | Live disposition |
|---|---|---|---|
| `context.compaction.completed` | `july248` | `confirmed_persisted_unregistered` | `NEEDS_MORE_EVIDENCE` |

Arithmetic:

```
|pin_j248 ∩ cpu_veto| = 248 - 1 = 247
|cpu_veto − pin_j248| = |auth5| = 5
|J248-VETO-BATCH-252| = 247 + 5 = 252
```

`context.compaction.completed` stays on the evidence-gap pack (profile B / `COMPACT-001`), not in `J248-VETO-BATCH-252`.

---

## 2. `july40` vs live unresolved (54) and alias (12)

**Set equality:** `live_unresolved = (pin_j40 \ alias12) ∪ emit26`.  
`cohort_pins=["july40"]` still covers all 40 pin members (`icohort july40 == pin_j40`).

| Direction | Count | Meaning |
|---|---:|---|
| `pin_j40 − live_unresolved` | 12 | alias rebucket (still july40-pinned) |
| `live_unresolved − pin_j40` | 26 | emit evidence-gap, not in the July unresolved pin |
| `pin_j40 ∩ live_unresolved` | 28 | remaining `NEEDS_OWNER_VETO` (`J40-VETO-BATCH`) |

### Mechanical delta C — 12 alias rebucket

`unresolved 66 → 54`. All 12 are `RECLASSIFY_ALIAS`, `working_bucket=alias`, `rebucket_applied_at_utc=2026-08-12T10:13:25Z`. They are **not** in `J40-VETO-BATCH`. `alias − pin_j40 = ∅`.

| # | event_type | `alias_target` |
|---:|---|---|
| 1 | `chat.subagent_spawned` | `subagent.*` |
| 2 | `chat.thread.worktree_bound` | `chat.thread_worktree_bound` |
| 3 | `filesafe.snapshot_conflict` | Contracts-owned safe-point event contract |
| 4 | `filesafe.snapshot_created` | `safe_point.created` |
| 5 | `filesafe.snapshot_restore` | `safe_point.restored` |
| 6 | `lsp.server_crashed` | `lsp.server.lifecycle_changed` |
| 7 | `lsp.server_started` | `lsp.server.lifecycle_changed` |
| 8 | `run.node_blocked` | `node.blocked` |
| 9 | `run.node_unblocked` | `node.unblocked` |
| 10 | `run.remediation_completed` | `remediation.resolved` |
| 11 | `run.remediation_started` | `remediation.spawned` |
| 12 | `run.scheduler_analysis` | `scheduler.pass` |

### Mechanical delta D — 26 evidence-gap in unresolved

`emit_restore` / advisor-2 triple-bound emit merge. Disjoint from `pin_j40`. All 26 are `bucket=unresolved`, `disposition=NEEDS_MORE_EVIDENCE`, `cohort_pins=["emit_restore"]`.

1. `docker.host.access_open_requested`
2. `docker.host.instance_lifecycle_requested`
3. `docker.host.instance_retention_recorded`
4. `docker.host.preflight_requested`
5. `docker.host.profile_saved`
6. `docker.host.receipt_opened`
7. `docker.host.refresh_requested`
8. `docker.host.session_launch_requested`
9. `docker.hosts_route_opened`
10. `github.actions.dispatch_readiness_validated`
11. `github.actions.readiness_compared`
12. `github.repo.create_requested`
13. `health.route_opened`
14. `plan_compile.run_created_or_bound`
15. `planning.approval_cas_receipt.written`
16. `planning.plan_approved`
17. `prd_builder.approval_snapshot.created`
18. `prd_builder.prd_pack_approved`
19. `project.github_repo_bound`
20. `remote.reconnect.requested`
21. `testing.capability_policy.updated`
22. `testing.session.backgrounded`
23. `testing.session.opened`
24. `testing.session.redaction_inspected`
25. `testing.session.watch_started`
26. `testing.visibility_policy.updated`

### `pin_j40 \ alias12` — 28 remaining unresolved veto (exact)

1. `chat.message.submitted`
2. `chat.thread_title_generated`
3. `diag.compaction_immune_overflow`
4. `docker.auth.browser_login.cancelled`
5. `docker.auth.browser_login.device_code_issued`
6. `docker.auth.browser_login.polling`
7. `docker.auth.browser_login.started`
8. `docker.auth.browser_login.timed_out`
9. `docker.auth.capability_validated`
10. `docker.auth.failed`
11. `docker.publish.blocked`
12. `docker.publish.failed`
13. `docker.repository.create.confirmation_requested`
14. `filesafe.blocked`
15. `format.error`
16. `media.artifact_cleanup_required`
17. `node.prerequisite_resolved`
18. `provider.request_cancelled`
19. `provider.request_queued`
20. `runtime_continuity.actor_bound`
21. `runtime_continuity.redaction_applied`
22. `runtime_continuity.replay_checkpointed`
23. `runtime_continuity.route_resolved`
24. `skill.invocation_timed_out`
25. `subagent.parallel_group_failed`
26. `unraid.template.generation.completed`
27. `usage.cost_adjusted`
28. `usage.cost_clamped`

`unres_veto == pin_j40 \ alias12` is true. Census unresolved category equals this 54-set (28 veto + 26 evidence-gap).

---

## 3. `july68` vs live exact-excluded (63)

**Set equality:** `live_exact_excluded = pin_j68 \ auth5`.  
`ccohort july68 == pin_j68` (68) via multi-cohort `cohort_pins`.

| Direction | Count | Members |
|---|---:|---|
| `pin_j68 − live_exact_excluded` | 5 | auth.github reclass (same set as delta A) |
| `live_exact_excluded − pin_j68` | 0 | ∅ |

Exclusion ledger (94 = 68+26) split:

| actual_category | disposition | Count | Pin |
|---|---|---:|---|
| `exact_excluded` | `RECONFIRM_EXCLUDE` | 61 | july68 |
| `exact_excluded` | `OWNER_DECISION_REQUIRED` | 2 | july68 (`done.budget_exceeded`, `stop.identical_failure`) |
| `persisted_unregistered_quarantine` | `RECLASSIFY_TO_UNREGISTERED_QUEUE` | 5 | july68 ∩ live CPU (auth.github) |
| `non_exact_excluded` | `RECONFIRM_EXCLUDE` | 26 | july26 |

`61 + 2 = 63` live census `exact_excluded`. The 5 auth.github tokens are not missing exclusions; they are in the J248 owner-veto pack. `fail_count=2` is those two owner-pending rows, not a pin-coverage hole.

---

## 4. `july26` vs live non-exact (26)

**Set equality:** `live_non_exact == pin_j26` (empty both directions).

All 26 exclusion rows are `RECONFIRM_EXCLUDE` / `non_exact_excluded`. Census `non_exact_excluded=26`.

1. `File.Edited`
2. `account_pressure_episode`
3. `account_switch_event`
4. `approval.*`
5. `auth_state`
6. `chat.subagent_*`
7. `chat.thread_worktree_*`
8. `coordination.*`
9. `crew.*`
10. `diagnostic`
11. `done`
12. `error`
13. `gate.*`
14. `node.*`
15. `remediation.*`
16. `run.*`
17. `run.tier_*`
18. `safe_point.*`
19. `subagent.*`
20. `text_delta`
21. `thinking_delta`
22. `tool.execution_*`
23. `tool_result`
24. `tool_use`
25. `usage`
26. `worktree.*`

---

## 5. Two August + `known37`

**Set equality:** `live_august == pin_august2`.  
**Set equality:** `live_registered_keep == pin_known37 ∪ pin_august2`.

| Pin | Live | Diff |
|---|---|---|
| `august2` = {`terminal.workgroup_moved`, `workspace.layout_changed`} | indiv `august=2`, both `KEEP_REGISTERED` provisional | ∅ |
| `known37` (37) | census `registered_keep` ∩ `KEEP_REGISTERED` = 37 | ∅ |

Census `registered_keep=39` = 37 Known37 + 2 August-live (`KEEP_REGISTERED_AUGUST_LIVE`). No August token is in Known37; no Known37 token is in the August pin.

---

## Census vs individual-disposition (same sets, not a pin rewrite)

These equalities hold on **event-type sets**:

```
census.alias                              == indiv.alias                         == alias12
census.unresolved                         == indiv.unresolved                    == 54
census.persisted_unregistered_quarantine  == indiv.confirmed_persisted_unregistered == pin_j248 ∪ auth5
census.registered_keep                    == pin_known37 ∪ pin_august2
```

Intra-bucket **disposition** labels on the 253 CPU set still differ between census and indiv (census: 19 `NEEDS_MORE_EVIDENCE` + 229 `NEEDS_OWNER_VETO` + 5 `RECLASSIFY_TO_UNREGISTERED_QUEUE`; indiv: 1 `NEEDS_MORE_EVIDENCE` + 252 `NEEDS_OWNER_VETO`). That is not a pin-set delta. J248=252 uses the individual-disposition dispositions.

---

## Non-claims

- `IMMUTABLE_COHORT_PINS.json` is unchanged. Working-bucket membership is not a pin edit.
- No owner `chosen_option` is applied. `J248-VETO-BATCH-252` and `J40-VETO-BATCH` remain unanswered.
- No family is admitted. Alias rebucket is not registry admission.
- Seal is not claimed.

## Files

| Path | Action |
|---|---|
| `cohort-pins/LIVE_VS_PIN_RECONCILIATION.md` | **written** (this artifact) |
| `cohort-pins/IMMUTABLE_COHORT_PINS.json` | **not rewritten** |
| `cohort-pins/EVENT_TO_COHORTS.json` | read only |
| `individual-disposition/LEDGER.jsonl` | read only |
| `individual-disposition/COVERAGE.json` | read only |
| `census-adjudication/COVERAGE.json` | read only |
| `census-adjudication/LEDGER.jsonl` | read only |
| `census-adjudication/PARTITION.json` | read only |
| `exclusion-revalidation/EXCLUSION_REVALIDATION_SUMMARY.json` | read only |
| `exclusion-revalidation/EXCLUSION_REVALIDATION_LEDGER.jsonl` | read only |
| `exclusion-revalidation/EXCLUSION_COVERAGE_NOTE.md` | read only |
