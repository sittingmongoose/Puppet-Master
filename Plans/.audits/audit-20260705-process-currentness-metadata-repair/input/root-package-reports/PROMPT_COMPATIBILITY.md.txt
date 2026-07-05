# Prompt compatibility

The existing compact-state v2 Resume, ledger-to-Plans Compile, PlanUnit index, Governance seal, Deep Audit, and Repair flow remains compatible with the latest repository.

The package supplies ledger-local variants with these necessary changes:

1. The ledger ID is fixed to `pldg-20260618-001-prd-planning-wizard`.
2. Compile, deep audit, and repair contain a hard parallel gate. Required broad work must produce bounded read-only subagent assignment and result evidence; one broad agent is not an acceptable fallback.
3. The main/controller agent remains the sole canonical writer.
4. The compile phase explicitly creates no runtime Plan Compile, WorkNode, GoalRun, queue, implementation, or production-build artifacts.
5. The governance prompt validates this new ledger rather than only the original ledger-system bootstrap ledger.
6. Deep Audit and Repair retain closure-registry behavior and add zero-incomplete validation.
7. Canonical product terminology is PRD Builder, Planning Wizard, and Approve And Build.
8. Generated indexes and governance remain separate phases.

Use the prompt files under:

`Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/prompts/`

The Resume prompt is optional because the ledger has no open questions or blockers. The compile prompt can be run directly after installation and validation.
