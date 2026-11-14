# Shard 065: Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L13442-L13496

Source SHA256: `a14faaeeff125d0ccc2775d3f1bcc4372b8ff689a01b632bcd508e52a2e5d14e`

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
  The exact fifteen prepared W3F families each own a separate predicate inventory in Plans/w3f_event_oracle_plan.json. The plan itself is not fixtures or executable evidence; phase 2 below implements it. Every record names its positive baseline, one-defect negative construction and future shared proof obligation. Criterion 1 stays ABSENT; criterion 12 is graded in the lane report from the executable phase-2 evidence below. The four session-prompt retention cells are bound by DL-456 and the question-budget cell by DL-457 (CV-1459 and CV-1461..CV-1464 paragraph 7). Planning question-budget now has its own CV-1459/SP-1459 contract and oracle plan: the existing saved-result equivalence was not proved, so the exclusion is reversed. The three readiness spellings remain investigation questions; no new contracts or oracles admit them.

  Phase 2 starts only after the lead rebases onto both reviewed shared foundations. Adopt the shared number/time helper for every identity/preimage/schema/ref/physical-byte route, including uint64 above 2^53, signed zero and historical authenticated recipe dispatch. Use shared pm_guard_isolation.py for each field/predicate/site inventory, including all branches and outputs. Schema/runtime duplicate sites prove the same field and predicate; one site removed still rejects, all exact duplicates removed accepts. Sharing a refusal code or allOf does not merge predicates. Every compound rule is cut per field/clause with peers enabled. Recompute dependencies for each single-defect fixture and compare independently captured actual originals at the last pure guard. Missing guards, unisolated negatives, unresolved refs, failure oracles accepting exit zero and misleading PASS grades block review. No mutation of checker machinery, fixtures or phase-2 code is performed in phase 1. Static structural checks do not establish contract execution, native behavior, event admission, readiness, governance or PNC-019 certification.

  Phase 2 (2026-11-13). `scripts/pm_w3f_event_oracles.py` is the executable synthetic checker for all fifteen families over the append, retry, retained-history, schema-install and SP-1450 checkpoint paths. Every refusal is one named single-predicate row of a generated Method B table (`scripts/pm_w3f_table_*.py`, generator `scripts/pm-w3f-table-generate.py`); derivation computes one boolean per row and decides nothing. Rows no input can refuse first stay alone in their own `entailed_*` table with the proof naming the rows that refuse first. `Plans/w3f_event_fixtures.json` (builder `scripts/pm-w3f-cases.py`, `--check`) holds complete positives and one-defect negatives, each refused first at exactly its row; `reports/event-authority-20261105/W3F-phase2-plan-coverage.json` maps every plan entry to its witnesses. Check 11 is proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`. Retained reads resolve once through the shared RetainedDispatcher from Storage's sealed per-original receipt (`Plans/w3f_original_custody.json`); a missing, ambiguous or other-original receipt never selects a recipe and no receipt is created on read. `scripts/pm-w3f-number-corpus.py` runs the shared number corpus and the 4,400-digit integer routes through the complete checker. Native execution and admission stay NOT_RUN.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing owners.
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
- python3 scripts/pm_w3f_event_oracles.py
- python3 scripts/pm-w3f-cases.py --check
- python3 scripts/pm-w3f-table-generate.py --check
- python3 scripts/pm-w3f-guard-tables.py --out <dir>
- python3 scripts/pm-w3f-number-corpus.py
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
