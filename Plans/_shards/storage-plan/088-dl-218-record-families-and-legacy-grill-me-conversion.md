# Shard 088: DL-218 record families and legacy Grill Me conversion

Source: `Plans/storage-plan.md`

Source lines: L28102-L28166

Source SHA256: `ebdbf218675862e2cace465e5fb4fc61121592eefbb143baedf44f9b73baceb9`

---

## DL-218 record families and legacy Grill Me conversion

WondererPass (pm.collaboration.wonderer_pass.v1) and WondererLead (pm.collaboration.wonderer_lead.v1) are the two new logical record families owned by CW section 12. A pass references its run, Wonderer slot, ordered pass number and one ordinary artifact, with its three to five lead IDs. A lead references its pass and run and retains the tether, sources, current disposition/reason/recorder and research evidence or set-aside reason. They share the collaboration identity and retention/reachability rules; they create no independent agent, transcript or artifact store. Artifact bytes and versions stay with the artifact owner. As CW section 12 requires, no physical key or writer is admitted until central storage and Event Authority adjudication closes; these rows describe shape only and remain requires_central_adjudication.

MIG-021 removes each legacy Grill Me spec from active definition/run rosters and sets grill_me_enabled true, retaining any existing true switch. An absent switch on a legacy definition with no such slot defaults false. The existing definition revision/currentness transaction and migration receipt fence retries and partial restarts; they record before/after hashes, removed slot references and quarantines, not a new public event. Do not resolve a dangling coordinator, provider, thread or project edge by guessing. Historical messages, Usage and attempts keep the removed slot's attribution; answers and question identity remain available to deduplication, and historical votes recorded under ordinary roles are unchanged. Current admission then validates the closed none | wonderer enum. Current Review, Crew Auto and scheduled-build configurations still reject specialists; preserving unsupported legacy provenance does not admit them. The grilling host keeps staged round answers and its agreement in its existing source-flow state; the new command request/result pairs add no physical family or second question counter.

### SP-334 - Wonderer Record Boundary And Grill Me Slot Migration

```yaml
plan_unit_id: SP-334
unit_type: migration
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-218 adds logical WondererPass and WondererLead families, pm.collaboration.wonderer_pass.v1 and pm.collaboration.wonderer_lead.v1,
  under CW section 12. Their run/pass/slot/lead and artifact references preserve the shared collaboration,
  transcript and artifact stores and existing retention reachability; physical keys and writers remain
  requires_central_adjudication. MIG-021 converts each legacy additive_role_kind grill_me spec into grill_me_enabled
  true and removes it from the active definition/run roster. No legacy slot means false when the switch
  is absent. The existing revision/currentness transaction and migration receipt make the conversion idempotent
  and recoverable; ambiguous identity is quarantined. Preserve message attribution, Usage, question answers
  and ordinary historical votes, never re-ask or rewrite them. Current Review, Crew Auto and scheduled-build
  specialist restrictions remain in force. Questionnaire grilling command envelopes reference existing
  host state and add no durable family or second counter. No EventRecord is admitted.
gui_related: false
gui_classification_reason: Defines record, migration or validation contracts.
depends_on:
- CWR-041
- CWR-042
- CV-363
unblocks: []
acceptance_criteria:
- MIG-021 repeated after a restart is a no-op on converted data.
- Transcript, Usage, answers and ordinary historical votes retain their attribution.
- Logical record shapes are not treated as physical registration.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: collaboration_migration_attribution
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/storage-plan.md
- Plans/collaborative_workflows_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md DL-218
- /mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce
preserved_exact_tokens:
- MIG-021
- grill_me_enabled
- pm.collaboration.wonderer_pass.v1
- pm.collaboration.wonderer_lead.v1
- requires_central_adjudication
negative_constraints:
- Do not drop legacy attribution or rewrite historical decisions.
- Do not guess an ambiguous identity or admit a new storage writer.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
