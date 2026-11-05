# Shard 050: Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7239-L7287

Source SHA256: `396ebf00ee308bb868851f7bd59b9f4484895f4d5bae96a879aa8b480eab96bb`

---

## Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Newly authored owner contracts under deck 2 item 9.a A. This section adds no admitted family and enables no native writer. The per-family base search is recorded in `reports/event-authority-20261105/W3F-search.json`. Criterion 12 remains PARTIAL until the shared number/time rules and guard-isolation tool pass review and phase 2 runs.

### ATS-1250 - W3F Per-Family Oracle Plan And Phase Boundary

```yaml
plan_unit_id: ATS-1250
unit_type: interface_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  The exact fourteen prepared W3F families each own a separate predicate inventory in Plans/w3f_event_oracle_plan.json. It is an oracle plan, not fixtures or executable evidence. Every record names its positive baseline, one-defect negative construction and future shared proof obligation. Criteria 1 and 12 stay ABSENT and PARTIAL respectively; four session-prompt retention cells stay PARTIAL. Planning question-budget exclusion has its own positive proof from CV-323/QMAX records and negatives: no extra QuestionItem; no run failure; no automatic Grill confirmation; budget zero alone never disables Build; no duplicate budget event emitted. The three readiness spellings remain investigation questions; no new contracts or oracles admit them.

  Phase 2 starts only after the lead rebases onto both reviewed shared foundations. Adopt the shared number/time helper for every identity/preimage/schema/ref/physical-byte route, including uint64 above 2^53, signed zero and historical authenticated recipe dispatch. Use shared pm_guard_isolation.py for each field/predicate/site inventory, including all branches and outputs. Schema/runtime duplicate sites prove the same field and predicate; one site removed still rejects, all exact duplicates removed accepts. Sharing a refusal code or allOf does not merge predicates. Every compound rule is cut per field/clause with peers enabled. Recompute dependencies for each single-defect fixture and compare independently captured actual originals at the last pure guard. Missing guards, unisolated negatives, unresolved refs, failure oracles accepting exit zero and misleading PASS grades block review. No mutation of checker machinery, fixtures or phase-2 code is performed in phase 1. Static structural checks do not establish contract execution, native behavior, event admission, readiness, governance or PNC-019 certification.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1450
- SP-1450
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens: []
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```
