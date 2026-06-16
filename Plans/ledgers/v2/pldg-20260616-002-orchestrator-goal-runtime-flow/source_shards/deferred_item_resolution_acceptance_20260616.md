# Deferred Item Resolution Acceptance — 2026-06-16

Source: `chat:user-default-models-doc-builder-agrees`

User accepted the assistant's deferred-item recommendations with two clarifications.

## Accepted clarifications

1. Default model/provider choices cannot be hardcoded because they depend entirely on which providers, accounts, and model profiles the user has configured. Canonical Plans should define capability lanes and Settings bindings, not named model defaults.

2. Requirements Doc Builder uses the ledger system during the conversational requirements/design interaction. After the ledger is sufficiently complete, Doc Builder uses invisible Goal Mode to convert the ledger into requirements docs with audit/verification.

## Accepted recommendations

- Keep Orchestrator's existing six-tab spine and add GoalRun/WorkGraph overlays plus side drawers for subagents, verification findings, WorkNode details, and receipts.
- Keep capability lanes and role contracts instead of fixed tier-era language.
- Define the Orchestrator-facing GoalRun/WorkGraph/WorkNode runtime contract now while keeping executable NodeSeed/WorkNode generation gated by Plan_To_Node_Compilation.
- Preserve the verification repair loop: execute, verify, repair, verify again until clean or true blocker; repeated same defect signatures trigger strategy adjustment and adjudication/root-cause replan.
- Treat the snapshot backlink/doc-impact matrix as planning memory and rerun a live repo audit before canonical Plan edits.
- Treat Doc Builder invisible conversion as an invisible Goal consumer flow, not a default Orchestrator WorkNode flow.

## Compile consequence

No open product/design questions remain for this ledger before Plan compile. Direct code implementation still waits for canonical Plans, live repo audit during compile, and later executable compiler artifacts.
