# Shard 061: W3A Forge event oracle planning, phase 1

Source: `Plans/Automated_Testing_System.md`

Source lines: L12273-L12340

Source SHA256: `a14faaeeff125d0ccc2775d3f1bcc4372b8ff689a01b632bcd508e52a2e5d14e`

---

## W3A Forge event oracle planning, phase 1

### ATS-1200 - Forge W3A oracle plan prepared contract

```yaml
plan_unit_id: ATS-1200
unit_type: validation_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Newly authored W3A criterion-12 oracle PLAN for the 35 separately defined Forge families
  FGI-1200..FGI-1234, CV-1200..CV-1234 and SP-1200..SP-1234. reports/event-authority-20261105/W3A-oracle-plan.json
  records each exact family, schema, positive bases and guard-level negative construction. Each negative has exactly
  one primitive predicate defect; regenerate all unrelated derived keys, mirrors, digests, full-value receipt and
  checkpoint/source commitments. Inventory every schema/prose assertion and each enforcement site independently;
  repeated sites are duplicates only for the same field AND predicate. Do not merge distinct predicates because they
  share a keyword, site or refusal. Phase 2 waits for reviewed NUMRULE and GUARDTOOL foundations, then adopts their
  helpers and proves each guard with the shared guard-isolation tool. Include current-writer replay_only refusal;
  exact CV-366 app key and project~ partition; SP-337 whole-value sizing; native source/receipt/storage-metadata
  joins; historical originals after live-state changes; compatibility/recipe dispatch; all wrong types/number forms
  and enforced timestamp profiles; failure result versus success status; complete global coverage, nine-field durable
  token, cursor/CAS and withdrawal. No local number/timestamp or proof machinery is authorized by this plan. Native
  execution NOT_RUN; criterion 12 PARTIAL, no fixture/test/depth/runtime PASS or readiness. Existing event-silent
  Forge command expected_event_types=[] and handler_unavailable remain unchanged.

  Phase 2 (W3-P2, 2026-11-13): scripts/pm_w3a_forge_events.py executes this plan for all 35 families in both scopes
  on the append, settlement, retry, publication, slot, retained-read, replay and withdrawal paths, including the
  current-writer projector_replay_only refusal, SP-286 first-receipt custody and SP-278 checkpoint generations,
  tokens, cursor and CAS. It refuses only through generated Method B guard tables (scripts/pm_w3a_forge_table_*.py
  from scripts/pm_w3a_forge_rows.py) that the gated tool 004bdedd63 checks in per-table runs
  (scripts/pm-w3a-guard-tables.py). Every reachable row has a single-defect witness in every family; a row no
  single-defect input can reach sits alone in its own table with its proof. Integer slots use the CV-1100/SP-1100
  shared calls, timestamps the CV-1101 date_time predicate with the event_record or storage_utc_z owner profile, and
  retained reads select their recipe only from the one SP-1101 receipt sealed for that exact original. Native
  execution NOT_RUN; results and limits are in reports/event-authority-20261105/W3A.md (Wave 3 phase 2).'
gui_related: false
gui_classification_reason: Planning-document and test-oracle requirements, not GUI work.
depends_on:
- FGI-1200
- SP-1200
unblocks: []
acceptance_criteria:
- Each of the 35 families has its own positive/negative oracle plan and independently expanded primitive guard inventory
  before phase-2 PASS.
- Phase 1 adds no oracle implementation; required shared number/format and guard-isolation foundations must pass
  review before phase 2.
validation_surfaces:
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: masked_negative_or_overclaimed_phase1_grade
reasoning_tier: high
context_scope: forge_wave3_phase1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1 and BRIEF-DRAFT.md standing checks 1..12/10a
preserved_exact_tokens:
- criterion 12 PARTIAL
- projector_replay_only
- SP-286
- SP-278
- CV-366
- SP-337
negative_constraints:
- Do not write oracle code or a lane-specific proof tool in phase 1.
```
