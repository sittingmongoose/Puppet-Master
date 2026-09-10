# Shard 014: FABLE Residual Skills Invocation Cleanup Addendum - 2026-07-07

Source: `Plans/Skills_System.md`

Source lines: L2510-L2576

Source SHA256: `c556120cfe2b34b0692622237915e06e188c430a48073ebcd559d74ec2cd83b3`

---

## FABLE Residual Skills Invocation Cleanup Addendum - 2026-07-07

This addendum closes the residual FABLE Skills rows for invocation-time permission consent, timeout defaults, remediation command refs, and requested import package safety. Import hardening is included as a user-requested scope item, but the Critical/High closure set remains limited to the rows named in the FABLE registry.

### SS-035 - FABLE Residual Skills Invocation And Import Contract

```yaml
plan_unit_id: SS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Skills_System.md
canonical_text: >-
  Skill invocation uses a millisecond timeout with default 120000 and max 600000, reports timeout as
  skill.invocation_timed_out, and routes missing-permission invocation through the canonical Permissions ask
  flow using blocked_reason_code, approval_scope_key, permission_snapshot_id, and ordered allowed_action_ids.
  Remediation buttons resolve to stable command refs rather than prose-only labels. Manual archive import rejects
  path traversal, symlink escape, package-size overflow, expanded-size overflow, archive recursion overflow, and
  deterministic skill id/name collisions.
gui_related: true
gui_classification_reason: Skill cards, remediation actions, permission prompts, and import errors are visible management and invocation surfaces.
depends_on: [SS-011, SS-025, SS-027, SS-028, PS-041, PS-042]
unblocks: []
acceptance_criteria:
  - "`invoke_skill.timeout` is milliseconds, defaults to 120000, caps at 600000, and expires with cancellation plus `skill.invocation_timed_out`."
  - Missing permissions produce a blocked payload with `blocked_reason_code = permission_required`, `approval_scope_key`, optional `permission_snapshot_id`, and ordered `allowed_action_ids[]`.
  - "`Review permissions` routes to `cmd.permissions.review_request`; Skills does not define a local consent dialog."
  - Remediation commands are `cmd.skills.setup_dependency`, `cmd.permissions.review_request`, `cmd.skills.open_source_for_edit`, and `cmd.skills.review_tool_requirement`.
  - Archive import rejects zip-slip, absolute paths, symlink/hardlink escape, case-normalized duplicate paths, nested archive recursion above 2, package bytes above 52428800, and expanded bytes above 209715200.
  - Skill id/name collisions resolve as idempotent same-hash import, explicit Replace, explicit Keep Both with generated suffix, or Cancel; case-only collisions are rejected.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: fable_residual_skills_invocation_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Skills_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: residual_skills_invocation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1047
  - fablereport.md:1048
  - fablereport.md:1049
  - fablereport.md:1050
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "invoke_skill"
  - "timeout"
  - "Needs permission"
  - "Review permissions"
  - "Set up Context7"
  - "Edit skill"
  - "Review tool setup"
  - "zip/tar"
  - "zip-slip"
negative_constraints:
  - Do not treat this Skills repair as a UI wiring repair, runtime certification, implementation readiness, or buildability proof.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Skills_System.md
  - Plans/Permissions_System.md
```
