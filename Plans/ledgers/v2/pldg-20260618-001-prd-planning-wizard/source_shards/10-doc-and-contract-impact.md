# Canonical Document and Contract Impact

## SRC-IMPACT

Two new canonical owner docs are expected: Plans/PRD_Builder.md and Plans/Planning_Wizard.md. Legacy chain-wizard docs require semantic migration rather than blind rename. Consumers across Assistant Chat, Goal Runtime, ledgers, Plan docs, Plan Compile, testing, Executor, Orchestrator, personas/models, source control, permissions, contracts, commands, GUI, wiring, artifacts, and indexes require impact review.

Generated Plan indexes and governance artifacts are regenerated only after live canonical prose stabilizes. The bootstrap compile must not run the finished-product Plan Compile or create runtime WorkNodes.

## Accepted obligation inventory

### atom-0158: Create dedicated canonical owner docs

Create Plans/PRD_Builder.md and Plans/Planning_Wizard.md using the New Plan Authoring Profile and make them authoritative owners for their respective finished-product workflows.

- atom_type: `requirement`
- lane: `doc_migration`
- gui_related: `false`
- exact_tokens: ["Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "PlanProfile"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_Document_System.md", "Plans/00-plans-index.md"]

### atom-0159: Semantically migrate legacy wizard docs

Review, split, update, or retire Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md into the new PRD Builder and Planning Wizard owners, preserving still-valid requirements and explicitly retiring stale workflow concepts.

- atom_type: `requirement`
- lane: `doc_migration`
- gui_related: `false`
- exact_tokens: ["Plans/chain-wizard.md", "Plans/chain-wizard-flexibility.md"]
- negative_constraints: ["Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "Plans/00-plans-index.md"]

### atom-0160: Update every live consumer reference

Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.

- atom_type: `requirement`
- lane: `doc_migration`
- gui_related: `false`
- exact_tokens: ["doc-impact pass"]
- negative_constraints: []
- owner_hints: ["Plans/00-plans-index.md", "Plans/Crosswalk.md", "Plans/Wiring_Matrix.md"]

### atom-0161: Regenerate generated indexes and governance only after prose stabilizes

After canonical owner and consumer docs are stable, regenerate allowed PlanUnit indexes, then shards, evidence, Spec Lock, plan graph, and governance decisions in the established separate phases.

- atom_type: `requirement`
- lane: `doc_migration`
- gui_related: `false`
- exact_tokens: ["PlanUnit index", "governance seal"]
- negative_constraints: ["Do not hand-edit generated shards, evidence, Spec Lock, or plan graph during the conversational ledger phase."]
- owner_hints: ["Plans/Plan_Document_System.md", "Plans/Planning_Ledger_System.md", "Plans/00-plans-index.md"]
