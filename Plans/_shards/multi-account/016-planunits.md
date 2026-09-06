# Shard 016: PlanUnits

Source: `Plans/Multi-Account.md`

Source lines: L773-L832

Source SHA256: `d2a7eb5beb660e11a81cd2336f1430121ced46fcd02ea15970a91be3e4b9391a`

---

## PlanUnits

### MA-002 - Owner Requirements And Vocabulary Boundary

```yaml
plan_unit_id: MA-002
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Plans/Multi-Account.md is canonical live specification text for product, runtime, storage, UI, and governance
  account behavior. Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology
  in this document. The shared conversational/runtime boundary preserves Puppet Master naming, DRY compliance,
  deterministic defaults, implementation status, and source cross-references.
gui_related: true
gui_classification_reason: The unit preserves a source span that explicitly includes UI among the owner-section requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Compatibility-only vocabulary is not treated as live canonical terminology.
- The shared conversational/runtime boundary remains visible to downstream consumers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_owner_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: multi_account_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0004
preserved_exact_tokens:
- Canonical owner-section requirements
- Requested/effective account identity contract
- Shared conversational/runtime boundary
- Compatibility-only source vocabulary
- Puppet Master
- Plans/DRY_Rules.md
- Plans/Contracts_V0.md
- Plans/Decision_Policy.md
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Multi-Account.md owns the requested/effective account terminology used by this document.
- Cross-references remain source references and do not supersede owner documents.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The covered spans are narrow owner/vocabulary scaffolding and do not require further splitting.
```
