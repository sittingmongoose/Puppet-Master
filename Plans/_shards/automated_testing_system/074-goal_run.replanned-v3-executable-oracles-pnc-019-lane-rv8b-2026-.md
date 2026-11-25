# Shard 074: goal_run.replanned v3 executable oracles (PNC-019 lane rv8b, 2026-11-14)

Source: `Plans/Automated_Testing_System.md`

Source lines: L15866-L15937

Source SHA256: `1e2a63acef6eab70e9cf9b5ad8a259f73598835f1f1617efecb1c246159e0a02`

---

## goal_run.replanned v3 executable oracles (PNC-019 lane rv8b, 2026-11-14)

### ATS-3100 - goal_run.replanned v3 owner and family oracle suite

```yaml
plan_unit_id: ATS-3100
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14). The executable oracle scripts/pm_goal_run_replan_oracles.py checks the goal_run.replanned v3 contract of GRS-3100/3101, EP-3100/3101, CV-3100/3101 and SP-3100..3102 over complete boundary inputs built from Plans/goal_run_replan_contracts/oracle-fixtures.json: the v8 source adoption (placed members, preimage, adoption digest), the cmd.runtime.replan command boundary with its unchanged typed args and closed codes, birth and writer admission, the closed v3 payload and owner predicates, identity, the twelve-member key recipe and every envelope and ProducerIntent copy join, D-R19 transitions with cancel routed to D06, append with the SP-286 first receipt under SP-336/SP-347 barrier durability, retry and lost acknowledgement, the unified reducer branch by birth profile, the closed projection value and nine-field-token checkpoint, sealed-receipt retained reads with a store snapshot, retention cells and custody. Every refusal is decided only by Method B guard rows in generated tables of at most eight rows (scripts/pm_grr_table_*.py from scripts/pm-grr-table-generate.py), each with a single-defect witness; the gated guard tool scripts/pm_guard_isolation.py proves every row through scripts/pm-grr-guard-tables.py. Integer slots use the shared exact-integer, storage_uint64, qualified RFC 8785 and physical-encoding calls of pm_event_numbers, and the shared number corpus Plans/event_number_recipe_corpus.json runs through the complete checker at every integer slot with expectations composed from the shared helpers alone; timestamps use pm_event_datetime.date_time with the CV-3101 profile per field (acknowledged_at_utc on the EventRecord profile). Copy rows have distinct values in every control and copy-swap witnesses. scripts/pm-grr-mutation-proof.py weakens one derivation clause at a time and counts a kill only when each declared detector shows exactly its declared outcome. A pinned recipe vector computed independently of the checker guards the key recipe. Native execution, installation, durability and runtime are NOT_RUN; a passing suite is owner-contract evidence only.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-3100
- GRS-3101
- EP-3100
- EP-3101
- CV-3100
- CV-3101
- SP-3100
- SP-3101
- SP-3102
- DL-045
unblocks: []
acceptance_criteria:
- python3 scripts/pm_goal_run_replan_oracles.py exits 0 with every positive accepted, every negative refused first at its named row, every row witnessed, the number corpus without mismatch and the correspondence checks clean.
- python3 scripts/pm-grr-table-generate.py --check reports no stale or unexpected table, and every table has at most eight rows.
- python3 scripts/pm-grr-guard-tables.py --out <dir> proves every row with the gated tool and reports no unproved row and no refused control.
- python3 scripts/pm-grr-mutation-proof.py --scratch <dir> kills every mutant under its declared detector outcome.
- The suite claims no native execution, installation, durability, admission or Event-depth evidence.
validation_surfaces:
- Plans/goal_run_replan_contracts/oracle-fixtures.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-grr-table-generate.py --check
- python3 scripts/pm-grr-guard-tables.py --out <dir>
- python3 scripts/pm-grr-mutation-proof.py --scratch <dir>
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_replanned_oracles
reasoning_tier: high
context_scope: goal_run_replanned_oracles
implementation_surfaces:
- Plans/Automated_Testing_System.md
- scripts/pm_goal_run_replan_oracles.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/PNC019-RUN.md (quality bar)
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption item 8)
preserved_exact_tokens:
- "scripts/pm_goal_run_replan_oracles.py"
- "scripts/pm_guard_isolation.py"
negative_constraints:
- No lane-local number, timestamp or guard-isolation engine.
- No claim of native, runtime, installation or admission evidence.
owner_hints:
- Plans/Automated_Testing_System.md
```

**What it covers, by Step 8 cell.** Producer and writer order (rows BI, CM, AD, AP), closed payload (PL01..PL21 and the static restriction-successor check), scope and identity (ID01..ID27, recipe vector), replay (RP01..RP06), retention (RT01..RT08), custody and redaction (CU01..CU05, RV01..RV07), transitions (AD03, AD08, TR01..TR06), consumers and checkpoints (RD01..RD12, CK01..CK08), compatibility and withdrawal (WD01..WD03, RD03, PL01 witnesses for v2, draft and alias), retained reads (RR01..RR06, RV05..RV06).

**Superseded pair.** The Known-37 prose oracles EA-UND-0019-GOAL-POS and -NEG (`NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`) describe v2 and stay as v2 history; this suite supersedes them for current writes.

**Not covered here (NOT_RUN).** Native installation and original issuer authentication, real redb and seglog transactions, codecs on disk, flush timing, interleavings, crash and restore runs, effect owners, full native cancellation and the bounded manager's real decisions. The checker models them as boundary facts so their contracts can be checked; it does not run them.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-3100, ContractName:Plans/Goal_Runtime_System.md#GRS-3101, ContractName:Plans/Executor_Protocol.md#EP-3101, ContractName:Plans/storage-plan.md#SP-3100, ContractName:Plans/Contracts_V0.md#CV-3100
