# Shard 050: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7479-L7661

Source SHA256: `2d421142f01300ad9ff94fda4103b11c195c9f453c0e9b5921a45c0056e6913f`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### ATS-1116 - Goal update approval and complete original route oracles

```yaml
plan_unit_id: ATS-1116
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, U1-U7 and W1 define independent
  original provider capture/decision resolution, direct Save and approved agent mutation, full source/body/first-event/terminal
  recovery, current body/history versus retained event/input/audit/replay and every private helper/final fence.
  The executable scripts/pm_goal_own_c_oracles.py has bounded new-provider and five-family custody cases and
  lists every new guard/negative; full original inherited-root cases remain mandatory before claiming PASS.
  No local guard-removal engine is added.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- CV-1130
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- python3 scripts/pm_goal_own_c3_w12_successor_oracles.py
- Plans/goal_own_c_contracts/w12-successor-v2/approved-agent-source.v2.json
- python3 scripts/pm_goal_own_c_source_oracles.py
- Plans/goal_own_c_contracts/source-witness-inputs.json
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval and complete original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; the original source roots and historical banks stay byte-exact, while C3-W12 part 2 explicitly selects the versioned source/bank successors named in that protocol. This selection alone does not close W1 or W2.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1117 - Goal cancellation migration and three original route oracles

```yaml
plan_unit_id: ATS-1117
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M1-M9 and W2 define
  complete old Stop/association/pending/effect/receipt mapping, atomic enrollment/recovery/withdrawal and separate
  no-association, bound Plan and Workflow whole-value producer/current-inspection/immutable replay cases. Every
  missing, foreign, forged, stale, contradictory, unknown or changed-after-helper source is refused for its
  own defect; all dependent copies/hashes/keys stay coherent. Preserve earlier genuine effects. New adapter
  evidence is bounded; full inherited-root instantiation stays required.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- CV-1131
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- python3 scripts/pm_goal_own_c3_w12b_oracles.py
- Plans/goal_own_c_contracts/w12b-corpus-v1/coverage.json
- python3 scripts/pm_goal_dg_ca_oracles.py
- Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json
- python3 scripts/pm_goal_own_c3_w12_successor_oracles.py
- Plans/goal_own_c_contracts/w12-successor-v2/cancel-methods.v2.json
- python3 scripts/pm_goal_own_c_source_oracles.py
- Plans/goal_own_c_contracts/source-witness-inputs.json
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
- python3 scripts/pm_goal_dg_cb_oracles.py
- Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation migration and three original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; the original source roots and historical banks stay byte-exact, while C3-W12 part 2 explicitly selects the versioned source/bank successors named in that protocol. C3-W12b adds explicitly bounded no-association migration/cancellation witnesses and a per-method remaining inventory. Its complete inherited W2 tuple coverage remains NOT_COMPLETE. DG-CA (2026-11-11) executes the C1 authenticated no-association route as a complete TEST_ONLY original path on the shared owner adapters, with child-process crash cuts of its Event protocol, and maps every inherited method row in `Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json`; on 2026-11-12 it adds the complete bound-Plan route (C2) and the SP-305/SP-310 assignment admission with a newly authored SP-337 reference successor for the over-cap assignment audit; the Workflow D05/D06 route (C3) is lane DG-CA3 and the SP-313 v2 private inspection (C4) remains NOT_COMPLETE until that route exists. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

DG-CB (2026-11-12) executes C5 and C6 of M1-M9 as complete TEST_ONLY original paths on the shared owner adapters: the six pre-enrollment owners' issued source images are captured under an all-writer exclusion and authenticated byte for byte, every derived join is checked field by field (unavailable for missing or unsupported data, `blocked_unresolved` for unknown or contradictory effects), and enrollment, recovery, replay, withdrawal and reinstall run as single test-owner Storage transactions with child-process crash cuts. Its per-method map is `Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json`. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1118 - Three exact GoalRun producer and projector oracle suites

```yaml
plan_unit_id: ATS-1118
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. Separate W3 goal_run.started, W4 goal_run.cancelled
  and W5 goal_run.certified suites adopt original Start, positive D06 and v7/prepare.v2 coordinator identity/append/commit/release
  respectively. Each owns its full schema-realm tuple, actual original source and first receipt, global prefix,
  full row/checkpoint/token/CAS/stage/cutover, retained/current and withdrawal tests. Certified includes every
  ATS-057 CF-01..12 and passive P4-P8 obligation. The executable adapter reports bounded dispatch/custody/final-fence
  coverage separately from full original native-root specimens; native remains NOT_RUN and no full oracle grade
  follows from table-only checks.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- ATS-057
- EP-1130
- EP-1131
- EP-1132
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Three exact GoalRun producer and projector oracle suites). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json
