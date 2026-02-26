## Adaptive Interview Phases + Contract Layer Outputs (Cross-Plan Alignment)

The interview flow is responsible for producing **AI-executable, DRY, testable** outputs for downstream orchestration. This requires two additional responsibilities beyond Q&A collection:

1. **Adaptive phase selection** (intent + context → phase plan) so interviews scale appropriately with the user’s intent.
2. **Contract Layer output generation** so plans and execution nodes reference stable contract IDs rather than duplicating prose.

### 1) Adaptive phase selection (phase plan)

The Interview phase manager must support adaptive phase selection exactly as specified in `Plans/chain-wizard-flexibility.md` §6 (Phase Selector Contract, depth semantics, persistence, resume rules, and user override controls).

**DRY rule:** This plan does not restate the phase selector contract; it references chain-wizard SSOT for the structured input/output and fallback behavior.

### 2) Contract Layer output generation (fragments → unification)

The Interviewer/Wizard must produce canonical user-project artifacts under `.puppet-master/project/`, persisted canonically in seglog. **Do not assume user projects have a `Plans/` folder** (any `Plans/*` references here are Puppet Master internal only). The authoritative artifact/schema contract is `Plans/Project_Output_Artifacts.md`, and this file's canonical in-plan reference is §`User-Project Output Contract (Sharded plan_graph/ canonical)`.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, Primitive:Seglog

Implementation responsibilities (conceptual):

- **Per-phase contract fragments:** Each interview phase contributes contract fragments (interfaces, schemas, constraints, budgets, test contracts). These fragments are inputs to unification; they are not the canonical contract pack.
- **Contract Unification Pass:** At interview completion, run a deterministic unification step that dedupes fragments, assigns stable `ProjectContract:*` IDs, and materializes SSOT-defined canonical artifacts under `.puppet-master/project/` (contracts/index, `plan.md`, canonical sharded `plan_graph/`, acceptance manifest, execution-time decisions/evidence, optional glossary).
- **UI wiring artifacts (GUI projects):** When the interview detects the user project has a GUI (`has_gui = true` from Architecture or Product/UX phases), the Contract Unification Pass also generates `.puppet-master/project/ui/wiring_matrix.json` and `.puppet-master/project/ui/ui_command_catalog.json` from the Product/UX phase wiring fragments. The validation gate must verify schema conformance and "no unbound UI actions" (every interactive element has a bound command and handler).
- **Builder contract seeds:** When Requirements Doc Builder is used (chain-wizard §5), `.puppet-master/requirements/contract-seeds.md` is a staging input to the unification pass and must be reconciled with phase-derived fragments.
- **Quality gate (requirements-quality-reviewer):** Before the Contract Unification Pass reads the requirements artifact, the `requirements-quality-reviewer` MUST have run and produced a `requirements_quality_report` artifact (`SchemaID:pm.requirements_quality_report.schema.v1`). The Contract Unification Pass MUST check the `verdict` field: if `"FAIL"` the pass is blocked and the orchestrator transitions the wizard to `attention_required`; if `"PASS"` the pass proceeds, appending `auto_fixes_applied[]` entries to its change log as normative changes. The Contract Unification Pass MUST NOT re-review requirements quality — it only checks the `verdict` field.

  ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md

- **Validation gate:** Before execution begins, run the dry-run validator specified by `Plans/Project_Output_Artifacts.md` Validation Rules (including contract resolvability, acceptance-manifest coverage, canonical sharded graph validity, deterministic node IDs, and derived-export consistency when present).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

#### Plan graph sharding (sharded-only; minimal rules)

- Canonical entrypoint is `.puppet-master/project/plan_graph/index.json` with referenced node shards under `.puppet-master/project/plan_graph/nodes/<node_id>.json` (optional `edges.json`).
- `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is optional derived export only (non-canonical).
- Deterministic node-ID rules, required fields, schema versions, and validator behavior are defined in `Plans/Project_Output_Artifacts.md` and in this file's §`User-Project Output Contract (Sharded plan_graph/ canonical)`.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md, Primitive:SessionStore

