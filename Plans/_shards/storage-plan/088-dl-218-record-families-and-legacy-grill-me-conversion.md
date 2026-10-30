# Shard 088: DL-218 record families and legacy Grill Me conversion

Source: `Plans/storage-plan.md`

Source lines: L28130-L28209

Source SHA256: `c836901e05afcb382d84b0d0377ab9e918d474d1df14a4484dafbb81a64713bc`

---

## DL-218 record families and legacy Grill Me conversion

WondererPass (pm.collaboration.wonderer_pass.v1) and WondererLead (pm.collaboration.wonderer_lead.v1) are the two new logical record families owned by CW section 12. A pass references its run, Wonderer slot, ordered pass number and one ordinary artifact, with its `outcome` (`leads` or `no_new_leads`) and zero to five lead IDs; three to five is a target and stop signals may end a pass earlier, including an empty delivery. A lead references its pass and run and retains the tether, sources, current disposition/reason/recorder and research evidence or set-aside reason. They share the collaboration identity and retention/reachability rules; they create no independent agent, transcript or artifact store. Artifact bytes and versions stay with the artifact owner. As CW section 12 requires, no physical key or writer is admitted until central storage and Event Authority adjudication closes; these rows describe shape only and remain requires_central_adjudication.

MIG-021 converts definitions for future runs and terminal runs (`completed`, `cancelled` or `failed`), removes each legacy Grill Me spec from those converted rosters and sets grill_me_enabled true, retaining any existing true switch. A run still in progress finishes under its recorded roster or quarantines; no active roster, voters, quorum or confirmation gate is swapped. A retained legacy reader is limited to that run and historical attribution and never admits a new Grill Me participant. An absent switch on a legacy definition with no such slot defaults false. The existing definition revision/currentness transaction and migration receipt fence retries and partial restarts; they record before/after hashes, removed slot references and quarantines, not a new public event. Do not resolve a dangling coordinator, provider, thread or project edge by guessing. Historical messages, Usage and attempts keep the removed slot's attribution; answers and question identity remain available to deduplication, and historical votes recorded under ordinary roles are unchanged. Current admission then validates the closed none | wonderer enum. Current Review, Crew Auto and scheduled-build configurations still reject specialists; preserving unsupported legacy provenance does not admit them. The grilling host keeps staged round answers and its agreement in its existing source-flow state; the new command request/result pairs add no physical family or second question counter.

### SP-334 - Wonderer Record Boundary And Grill Me Slot Migration

```yaml
plan_unit_id: SP-334
unit_type: migration
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-218 adds logical WondererPass and WondererLead families, pm.collaboration.wonderer_pass.v1 and
  pm.collaboration.wonderer_lead.v1, under CW section 12. A WondererPass stores outcome leads or
  no_new_leads and zero to five lead IDs, including truthful empty deliveries when stop signals end
  exploration early. QuestionBank retains pm.brainstorm.question_bank.v1 but is keyed by
  collaboration_run_id for BrainStorm and for Crew or Chat Room with Grill Me on, with
  baseline_limit 0 in the latter two and one shared charged/routed set. Their run/pass/slot/lead and
  artifact references preserve the shared collaboration, transcript and artifact stores and existing
  retention reachability; physical keys and writers remain requires_central_adjudication. MIG-021
  converts legacy additive_role_kind grill_me specs in definitions for future runs and terminal runs
  into grill_me_enabled true and removes them from those converted rosters. A run still in progress
  finishes under its recorded roster or quarantines; migration never swaps live voters, quorum or
  confirmation gates. Its compatibility reader cannot admit new Grill Me participants. No legacy
  slot means false when the switch is absent. The existing revision/currentness transaction and
  migration receipt make the conversion idempotent and recoverable; ambiguous identity is
  quarantined. Preserve message attribution, Usage, question answers and ordinary historical votes,
  never re-ask or rewrite them. Current Review, Crew Auto and scheduled-build specialist
  restrictions remain in force. Questionnaire grilling command envelopes reference existing host
  state and add no durable family or second counter. No EventRecord is admitted.
gui_related: false
gui_classification_reason: Defines record, migration or validation contracts.
depends_on:
- CWR-041
- CWR-042
- CV-363
unblocks: []
acceptance_criteria:
  - "MIG-021 repeated after a restart is a no-op on converted data."
  - "Transcript, Usage, answers and ordinary historical votes retain their attribution."
  - "Logical record shapes are not treated as physical registration."
  - "An in-progress legacy run is never hot-swapped: it finishes with the recorded roster or quarantines."
  - "Empty delivered passes retain no_new_leads and no lead IDs."
  - "Crew and Chat Room use the same keyed QuestionBank with baseline 0 and the extension as the whole maximum."
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
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
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


QA2 owner amendment (2026-10-30; DL-258; integration 7d586bad18): current requirements in this document’s amended units take precedence over earlier presentation descriptions. Q18: when a concept page has no usable storage at all (opaque-origin sandbox access throws), each existing owner store retains a secret-free, key-isolated memory record for that visit and exposes persistent:false. Home PMW.store.raw/get/set/remove and O55.store.get/set/clear/scrub remain their sole adapters; reload/new visit loses memory. Settings’ corresponding Project adapter must preserve Project isolation and ordinary owner admission. Available storage whose write/quota/readback fails still reports failure and rolls back: never silently switch a failing persistent store to memory. Visit-only success is fixture-local, non-authoritative and never native durability, a restored backup, verified credential or a native owner receipt; production Storage/Settings CAS/readback/rollback rules are unchanged. H5: the onboarding owner holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab open({screen}) invokes the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts out. Connect/NAS/online fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and seedCommit are lab-only: no native Project receipt, authentication, permission or completed owner work is inferred, no selected live input is overwritten, and no new product action/DTO field is admitted.
