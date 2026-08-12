# Full 180-Source Machine Contract Event Binding Scan v3

**Generated:** 2026-08-12T11:08:34Z

## Scope
- Inventory path: `Plans/.audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json`
- Inventory digest: `9cbd87e6637377845c91b60ccea3de45371e8402b413b6f6257de0d85b88583e`
- Inventory frozen_at_utc: **2026-08-12T09:00:00Z**
- `denominator_closed` on inventory: **false** (not sealed; freeze pin not rewritten)
- Frozen sources: **180** (107 JSON, 72 MD, 1 JSONL)
- Triple-bound recomputed from JSON `entries.*` only
- Markdown command catalog + Wiring_Matrix tables + JSON fences reconciled
- Missing tokens are **not** merged into individual-disposition

## Counts
- `md_tokens`: **41**
- `json_tokens`: **635**
- `triple_bound_tokens`: **77**
- `md_expected_event_binding` rows: **47**
- `md_only`: **31**
- `md_json_overlap`: **10**
- `json_only`: **625**

## vs previous 09:58:27Z scan
- Prior generated_at_utc: **2026-08-12T09:58:27Z**
- Prior digest: `b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56`
- Fresh digest: `9cbd87e6637377845c91b60ccea3de45371e8402b413b6f6257de0d85b88583e`
- `triple_bound`: **77** → **77**
- `md_only`: **31** → **31**
- `missing_from_census`: **0** → **0**
- triple_bound added: []
- triple_bound removed: []
- md_only added: []
- md_only removed: []
- missing_from_census added: []
- missing_from_census removed: []
- individual-disposition merge: **not performed**

## v2 triple_bound comparison
- v2 baseline triple_bound count: **77**
- v3 triple_bound count: **77**
- Count changed: **no**

## Census-adjudication LEDGER reconciliation
- Ledger `candidate_id` count: **528**
- Triple-bound in ledger: **77**
- Triple-bound missing from ledger (v3): **0**
- v2 baseline missing from ledger: **24** (merged before v3; scan does not merge rows)
- Ledger candidate_ids not in triple_bound scan: **451** (expected; ledger includes non-emit families)

## New tokens in markdown not present in JSON scan (`md_only`)
**31** documentation/catalog tokens surfaced via markdown reconciliation (recorded as `md_expected_event_binding`, not automatic emit candidates):
- `auth.github.disconnected`
- `chat.thread.created`
- `file.exported`
- `folder.deleted`
- `folder.exported`
- `folder.renamed`
- `git.clone.completed`
- `memory.dedup_sweep.completed`
- `memory.dedup_sweep.started`
- `memory.gist.discarded`
- `memory.gist.pinned`
- `memory.gist.unpinned`
- `memory.gist.updated`
- `memory.gist.verification_failed`
- `memory.gist.verification_requested`
- `memory.gist.verified`
- `memory.index.lexical.rebuild.completed`
- `memory.index.lexical.rebuild.started`
- `memory.index.semantic.rebuild.completed`
- `memory.index.semantic.rebuild.started`
- `memory.monthly_summary.completed`
- `memory.monthly_summary.started`
- `memory.prune_archive.completed`
- `memory.prune_archive.started`
- `memory.verification_sweep.completed`
- `memory.verification_sweep.started`
- `project.added`
- `project.created`
- `tool.denied`
- `wizard.deferred_payload.loaded`
- `wizard.opened`

## Validator receipt
- `Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json`

## Artifacts
- `MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` (schema v3)
- `MACHINE_CONTRACT_EVENT_BINDING_SCAN_DETAIL.json`
- Rerun: `python Plans/.audits/event-authority-2026-08-12/closed-world-census/admission/_run_full_binding_scan.py`

## v2 scan delta
{
  "v2_triple_bound_token_count": 77,
  "v3_triple_bound_token_count": 77,
  "triple_bound_count_changed": false,
  "v2_missing_from_census_ledger_baseline": [
    "docker.host.access_open_requested",
    "docker.host.instance_lifecycle_requested",
    "docker.host.instance_retention_recorded",
    "docker.host.preflight_requested",
    "docker.host.profile_saved",
    "docker.host.receipt_opened",
    "docker.host.refresh_requested",
    "docker.host.session_launch_requested",
    "docker.hosts_route_opened",
    "github.actions.dispatch_readiness_validated",
    "github.actions.readiness_compared",
    "github.repo.create_requested",
    "health.route_opened",
    "plan_compile.run_created_or_bound",
    "planning.approval_cas_receipt.written",
    "planning.plan_approved",
    "prd_builder.approval_snapshot.created",
    "prd_builder.prd_pack_approved",
    "project.github_repo_bound",
    "remote.reconnect.requested",
    "testing.session.backgrounded",
    "testing.session.opened",
    "testing.session.redaction_inspected",
    "testing.session.watch_started"
  ],
  "v3_missing_from_census_ledger": [],
  "resolved_since_v2_merge": [
    "docker.host.access_open_requested",
    "docker.host.instance_lifecycle_requested",
    "docker.host.instance_retention_recorded",
    "docker.host.preflight_requested",
    "docker.host.profile_saved",
    "docker.host.receipt_opened",
    "docker.host.refresh_requested",
    "docker.host.session_launch_requested",
    "docker.hosts_route_opened",
    "github.actions.dispatch_readiness_validated",
    "github.actions.readiness_compared",
    "github.repo.create_requested",
    "health.route_opened",
    "plan_compile.run_created_or_bound",
    "planning.approval_cas_receipt.written",
    "planning.plan_approved",
    "prd_builder.approval_snapshot.created",
    "prd_builder.prd_pack_approved",
    "project.github_repo_bound",
    "remote.reconnect.requested",
    "testing.session.backgrounded",
    "testing.session.opened",
    "testing.session.redaction_inspected",
    "testing.session.watch_started"
  ],
  "new_missing_vs_v2_baseline": [],
  "extra_in_ledger_not_triple_bound_count": 451,
  "md_only_new_vs_v2_json_scan": [
    "auth.github.disconnected",
    "chat.thread.created",
    "file.exported",
    "folder.deleted",
    "folder.exported",
    "folder.renamed",
    "git.clone.completed",
    "memory.dedup_sweep.completed",
    "memory.dedup_sweep.started",
    "memory.gist.discarded",
    "memory.gist.pinned",
    "memory.gist.unpinned",
    "memory.gist.updated",
    "memory.gist.verification_failed",
    "memory.gist.verification_requested",
    "memory.gist.verified",
    "memory.index.lexical.rebuild.completed",
    "memory.index.lexical.rebuild.started",
    "memory.index.semantic.rebuild.completed",
    "memory.index.semantic.rebuild.started",
    "memory.monthly_summary.completed",
    "memory.monthly_summary.started",
    "memory.prune_archive.completed",
    "memory.prune_archive.started",
    "memory.verification_sweep.completed",
    "memory.verification_sweep.started",
    "project.added",
    "project.created",
    "tool.denied",
    "wizard.deferred_payload.loaded",
    "wizard.opened"
  ]
}

## vs 09:58:27Z scan delta
{
  "prior_generated_at_utc": "2026-08-12T09:58:27Z",
  "prior_canonical_digest_sha256": "b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56",
  "prior_source_inventory_path": "Plans/.audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.json",
  "prior_triple_bound_token_count": 77,
  "fresh_triple_bound_token_count": 77,
  "triple_bound_added": [],
  "triple_bound_removed": [],
  "prior_md_only_count": 31,
  "fresh_md_only_count": 31,
  "md_only_added": [],
  "md_only_removed": [],
  "prior_missing_from_census_count": 0,
  "fresh_missing_from_census_count": 0,
  "missing_from_census_added": [],
  "missing_from_census_removed": [],
  "individual_disposition_merge": "not_performed"
}
