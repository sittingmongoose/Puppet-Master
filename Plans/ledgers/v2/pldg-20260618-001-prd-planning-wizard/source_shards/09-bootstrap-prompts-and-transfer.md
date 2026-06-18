# Bootstrap Resume, Compile, Index, Seal, Audit, and Repair Prompts

## SRC-PROMPTS

The user's existing compact-state v2 ledger prompts remain the baseline. The resume phase is conversational and updates the ledger every substantive turn. Ledger-to-Plans compilation is a Goal phase and writes canonical Plans through fine-grained PlanUnits. PlanUnit index generation remains non-executable. Governance sealing remains separate.

The hardened prompts in this ledger require many parallel read-only subagents with assignment/result evidence when thresholds are exceeded, keep the main agent as sole writer, validate this ledger ID during seal, exclude superseded experimental workflow machinery, and require complete closure-aware audit and repair evidence.

## Accepted obligation inventory

### atom-0162: Existing resume prompt remains structurally compatible

Resume Ledger continues to read compact state first, avoid full event and record scans unless referenced, use Collaborator behavior, update ledger after each substantive turn, and infer gui_related.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["Resume Ledger", "compact state first", "gui_related"]
- negative_constraints: []
- owner_hints: ["Plans/bootstrap/Codex_Prompts.md", "Plans/bootstrap/Bootstrap_Planning_Workflow.md"]

### atom-0163: Harden compile prompt with mandatory parallel enforcement

The ledger-to-Plans Goal prompt must require many bounded read-only subagents in parallel when atom, owner, or document thresholds are exceeded, require assignment/result evidence, and block rather than silently use one broad agent; main agent remains sole writer.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["HARD PARALLEL GATE", "main agent is the only writer"]
- negative_constraints: ["Do not reference or invoke superseded experimental planning-pipeline machinery."]
- owner_hints: ["Plans/bootstrap/Codex_Prompts.md", "Plans/bootstrap/Bootstrap_Planning_Workflow.md"]

### atom-0164: PlanUnit index prompt remains non-executable

The PlanUnit index/readiness Goal regenerates only allowed Plans/.plan_index outputs, reports exact blockers, and creates no WorkNodes, NodeSeeds, candidates, executable queues, implementation files, or production tasks.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["node_readiness_report", "no WorkNodes"]
- negative_constraints: []
- owner_hints: ["Plans/bootstrap/Codex_Prompts.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0165: Governance seal prompt validates this new ledger

The ledger-local governance seal prompt validates this ledger ID when present, seals only after Plans and indexes stabilize, and preserves runtime-disabled readiness unless runtime contracts were explicitly completed.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["pldg-20260618-001-prd-planning-wizard", "governance seal"]
- negative_constraints: []
- owner_hints: ["Plans/bootstrap/Codex_Prompts.md"]

### atom-0166: Deep Audit requires parallel read-only specialists

The deep-audit Goal uses many bounded read-only subagents in parallel for atom fidelity, reciprocal lineage, owner routing, changed-doc fidelity, ledger consistency, index/governance, forbidden artifacts, and validator mutability, with the main agent writing audit artifacts.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["Deep Audit", "many bounded read-only subagents in parallel"]
- negative_constraints: []
- owner_hints: ["Plans/bootstrap/Codex_Prompts.md", "Plans/Planning_Ledger_System.md"]

### atom-0167: Audit repair closes every finding

The repair Goal builds a complete closure matrix, repairs or adjudicates every finding/detail, updates the semantic closure registry, uses bounded read-only specialist subagents, and does not treat passing validators alone as completion.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["repair_closure_matrix.jsonl", "semantic closure registry"]
- negative_constraints: []
- owner_hints: ["Plans/bootstrap/Codex_Prompts.md", "Plans/Planning_Ledger_System.md"]

### atom-0168: Compile phase creates Plans only, not runtime artifacts

Ledger-to-Plans compilation writes or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.

- atom_type: `requirement`
- lane: `bootstrap_prompts`
- gui_related: `false`
- exact_tokens: ["ledger-to-Plans", "not runtime"]
- negative_constraints: ["Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime."]
- owner_hints: ["Plans/bootstrap/Bootstrap_Planning_Workflow.md", "Plans/Planning_Ledger_System.md", "Plans/Plan_To_Node_Compilation.md"]
