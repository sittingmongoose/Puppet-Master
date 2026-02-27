## 11. User-Project Output Artifacts (Sharded-Only)

Interviewer/Wizard outputs for user projects MUST follow the canonical artifact, sharding, and persistence contract in `Plans/Project_Output_Artifacts.md`.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

This section is intentionally flow-specific and does not restate SSOT schema fields.

Flow-specific requirements:

- Uploads and builder output remain staging inputs under `.puppet-master/requirements/*`.
- Before Interview/start-chain execution, canonical promotion MUST write `.puppet-master/project/requirements.md`.
- Contract Unification Pass MUST materialize canonical outputs under `.puppet-master/project/` exactly per SSOT (contracts/index, `plan.md`, sharded `plan_graph/`, acceptance manifest, execution-time decisions/evidence, optional glossary).
- Canonical execution graph is sharded-only: `.puppet-master/project/plan_graph/index.json` + referenced `nodes/<node_id>.json` shards (optional `edges.json`).
- `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is optional derived export only (non-canonical; never required).
- When `has_gui` is true, generate `.puppet-master/project/ui/wiring_matrix.json` and `.puppet-master/project/ui/ui_command_catalog.json`, and ensure UI-scope nodes carry wiring-related `contract_refs`.
- Persist planning artifacts canonically in seglog; filesystem copies are regenerable projections.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### 11.1 Plan-Graph Handling (Flow-Specific)

- Validators and orchestrator MUST use only the canonical sharded graph for scheduling/execution inputs.
- Field-level schema requirements, deterministic node-ID rules, contract/acceptance coverage, and evidence requirements are defined in `Plans/Project_Output_Artifacts.md` and enforced by the dry-run validator.
- If `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is materialized, validate it only as a consistency export; never treat it as canonical input.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

### 11.2 Autonomy + HITL (deterministic ambiguity handling)

- **Deterministic defaults:** When ambiguity remains, apply deterministic defaults per Decision Policy and record each automatic decision to `.puppet-master/project/auto_decisions.jsonl` (and canonically in seglog) with `{node_id, decision_id, chosen, reason, contract_refs[]}`.
- **HITL optional:** Nodes may require approvals (`tool_policy_mode = ask`) without blocking the entire run; if a node is waiting on approval, the scheduler continues other runnable nodes whose dependencies allow.

---

