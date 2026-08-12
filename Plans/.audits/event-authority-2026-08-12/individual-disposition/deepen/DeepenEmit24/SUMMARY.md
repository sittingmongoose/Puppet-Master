# DeepenEmit24 summary

- Input: 24 provisional `unresolved` triple-bound emit candidates from `TRIPLE_BOUND_EMIT_MERGE.json` (`merged_count=24`) plus 2 advisor-2 false-lexical restore tokens (`testing.*.updated`)
- Source overlays: `TripleBoundEmitMerge` and `FalseLexicalEmitRestore`
- Machine binding scan: `closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json`
- Rows individually adjudicated: **26** (6 prior + 20 new)
- Bucket: `unresolved` with cohort pin `emit_restore` on every row
- Dispositions: **26** `NEEDS_MORE_EVIDENCE`; 0 admissions or registry changes
- Owner vetoes emitted: 0 (persistence evidence gap; not yet at irreducible product-choice veto)
- Quality: every row has all 12 binding evidence fields with field-local citations; `inference_used=false`; `analogy_used=false`; `provisional=false`

## Disposition breakdown

| disposition | count |
|-------------|------:|
| NEEDS_MORE_EVIDENCE | 26 |
| KEEP_REGISTERED | 0 |
| NEEDS_OWNER_VETO | 0 |
| Other | 0 |

## Prior batch (6) — github/planning/health first wave

| # | event_type | wiring entry | command | overlay |
|---|------------|--------------|---------|---------|
| 1 | `github.actions.dispatch_readiness_validated` | `catalog.github_actions_validate_dispatch_readiness` | `cmd.github.actions.validate_dispatch_readiness` | TripleBoundEmitMerge |
| 2 | `github.actions.readiness_compared` | `catalog.github_actions_compare_last_success` | `cmd.github.actions.compare_last_success` | TripleBoundEmitMerge |
| 3 | `github.repo.create_requested` | `catalog.project_new_github_repo` | `cmd.project.new_github_repo` | TripleBoundEmitMerge |
| 4 | `health.route_opened` | `catalog.health_provider_setup_open` | `cmd.health.provider_setup.open` | TripleBoundEmitMerge |
| 5 | `plan_compile.run_created_or_bound` | `catalog.planning_wizard_approve_and_build` | `cmd.planning_wizard.approve_and_build` | TripleBoundEmitMerge |
| 6 | `planning.approval_cas_receipt.written` | `catalog.planning_wizard_approve_and_build` | `cmd.planning_wizard.approve_and_build` | TripleBoundEmitMerge |

## New rows batch A (10) — docker + planning.plan_approved

| # | event_type | wiring entry | command | overlay |
|---|------------|--------------|---------|---------|
| 7 | `docker.host.access_open_requested` | `catalog.docker_host_access_open_app` | `cmd.docker.host.access.open_app` | TripleBoundEmitMerge |
| 8 | `docker.host.instance_lifecycle_requested` | `catalog.docker_host_instance_restart` (+ start/stop) | `cmd.docker.host.instance.restart` (+ start/stop) | TripleBoundEmitMerge |
| 9 | `docker.host.instance_retention_recorded` | `catalog.docker_host_instance_retain` | `cmd.docker.host.instance.retain` | TripleBoundEmitMerge |
| 10 | `docker.host.preflight_requested` | `catalog.docker_host_preflight` | `cmd.docker.host.preflight` | TripleBoundEmitMerge |
| 11 | `docker.host.profile_saved` | `catalog.docker_host_profile_save` | `cmd.docker.host.profile.save` | TripleBoundEmitMerge |
| 12 | `docker.host.receipt_opened` | `catalog.docker_host_receipt_open` | `cmd.docker.host.receipt.open` | TripleBoundEmitMerge |
| 13 | `docker.host.refresh_requested` | `catalog.docker_host_refresh` | `cmd.docker.host.refresh` | TripleBoundEmitMerge |
| 14 | `docker.host.session_launch_requested` | `catalog.docker_host_session_launch` | `cmd.docker.host.session.launch` | TripleBoundEmitMerge |
| 15 | `docker.hosts_route_opened` | `catalog.docker_hosts_open` | `cmd.docker.hosts.open` | TripleBoundEmitMerge |
| 16 | `planning.plan_approved` | `catalog.planning_wizard_approve_and_build` | `cmd.planning_wizard.approve_and_build` | TripleBoundEmitMerge |

## New rows batch B (10) — canonical emit candidates 11–20

| # | event_type | wiring entry | command | overlay |
|---|------------|--------------|---------|---------|
| 17 | `prd_builder.approval_snapshot.created` | `catalog.prd_builder_approve_for_planning_wizard` | `cmd.prd_builder.approve_for_planning_wizard` | TripleBoundEmitMerge |
| 18 | `prd_builder.prd_pack_approved` | `catalog.prd_builder_approve_for_planning_wizard` | `cmd.prd_builder.approve_for_planning_wizard` | TripleBoundEmitMerge |
| 19 | `project.github_repo_bound` | `catalog.project_new_github_repo` | `cmd.project.new_github_repo` | TripleBoundEmitMerge |
| 20 | `remote.reconnect.requested` | `catalog.remote_reconnect` | `cmd.remote.reconnect` | TripleBoundEmitMerge |
| 21 | `testing.capability_policy.updated` | `catalog.testing_capability_policy_set` | `cmd.testing.capability_policy.set` | FalseLexicalEmitRestore |
| 22 | `testing.session.backgrounded` | `catalog.testing_session_background` | `cmd.testing.session.background` | TripleBoundEmitMerge |
| 23 | `testing.session.opened` | `catalog.testing_session_open` | `cmd.testing.session.open` | TripleBoundEmitMerge |
| 24 | `testing.session.redaction_inspected` | `catalog.testing_session_redaction_inspect` | `cmd.testing.session.redaction.inspect` | TripleBoundEmitMerge |
| 25 | `testing.session.watch_started` | `catalog.testing_session_watch` | `cmd.testing.session.watch` | TripleBoundEmitMerge |
| 26 | `testing.visibility_policy.updated` | `catalog.testing_visibility_policy_set` | `cmd.testing.visibility_policy.set` | FalseLexicalEmitRestore |

## Persistence adjudication (common result)

All 26 tokens have machine-contract emit bindings (`expected_event_types`, `effect_kind=event`, `receipt_or_event_refs`) in `Plans/Wiring_Matrix.production.json`. Checked Plans do **not** prove EventRecord/seglog persistence for any exact token:

- **20 docker/github/health/project/remote/testing.session tokens**: exact string appears only in `Wiring_Matrix.production.json` among searched Plans surfaces.
- **6 planning-family tokens** (`plan_compile.run_created_or_bound`, `planning.approval_cas_receipt.written`, `planning.plan_approved`, `prd_builder.*`, `remote.reconnect.requested`): also appear in `PMConcept_Control_Reconciliation.json` and/or `non_executable_closure_evidence` shards as wiring or closure payload tables — still no explicit EventRecord/seglog append proof for the exact event type.
- **2 testing policy tokens** (`testing.capability_policy.updated`, `testing.visibility_policy.updated`): restored from false lexical; `Automated_Testing_System.md` and `UI_Command_Catalog.md` name receipt families without this exact event string.

Persistence remains open; every row stays fail-closed with no ADMIT or registry append.

## Artifacts

- `LEDGER.jsonl` — 26 deepened rows (`provisional=false`)
- `rows/ROW_<event_type>.json` — per-row evidence with field-local citations
- `source_deepener`: `DeepenEmit24`
