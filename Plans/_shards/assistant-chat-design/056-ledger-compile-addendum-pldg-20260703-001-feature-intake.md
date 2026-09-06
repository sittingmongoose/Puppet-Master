# Shard 056: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/assistant-chat-design.md`

Source lines: L23650-L23715

Source SHA256: `6042b076a4835fecf4c2297bc51de70c98e5f604a4552c5ef425289124ebb4b7`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### ACD-432 - P0-SESSION-DRAFT-ATTACHMENT-ISOLATION

```yaml
plan_unit_id: ACD-432
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  P0-SESSION-DRAFT-ATTACHMENT-ISOLATION (P0) is compiled as canonical Puppet Master intent for Session draft and attachment isolation: Imported external-repo finding extrepo-20260703-0088 / P0-SESSION-DRAFT-ATTACHMENT-ISOLATION (P0). The preserved PM gap/delta is: Context/session plans need a GUI draft boundary with explicit draft/session/composer identity and state transitions. The observed external-repo signal remains source-lineage evidence: OpenCode Desktop issue: previous submitted text/images reappear in another session composer.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Submitted/cleared draft never appears in new session without explicit restore
- Attachments carry source_session and draft_id
- Crash/restart preserves isolation
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Submitted/cleared draft never appears in new session without explicit restore
- Attachments carry source_session and draft_id
- Crash/restart preserves isolation
risk_class: p0_multimodal_and_attachments_hardening
reasoning_tier: high
context_scope: multimodal_and_attachments
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p0_session_draft_attachment_isolation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0092
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0092
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0088/P0-SESSION-DRAFT-ATTACHMENT-ISOLATION@line=88
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0088/P0-SESSION-DRAFT-ATTACHMENT-ISOLATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0092
external_atom_id: extrepo-20260703-0088
source_row_id: P0-SESSION-DRAFT-ATTACHMENT-ISOLATION
priority: P0
finding_family: Session draft and attachment isolation
source_repos:
- OpenCode
preserved_exact_tokens:
- extrepo-20260703-0088
- P0-SESSION-DRAFT-ATTACHMENT-ISOLATION
- P0
- Session draft and attachment isolation
- OpenCode
negative_constraints: []
observed_signal: 'OpenCode Desktop issue: previous submitted text/images reappear in another session composer.'
pm_gap_or_delta: Context/session plans need a GUI draft boundary with explicit draft/session/composer identity and state transitions.
compile_disposition: create_new_planunit
```
