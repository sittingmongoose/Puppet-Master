# Shard 002: Change Summary

Source: `Plans/00-plans-index.md`

Source lines: L7-L20

Source SHA256: `4f7a00b8f320df763318ced0a86857e641431318c743179a068ae776eccb14cb`

---

## Change Summary


  ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2
- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.
- 2026-06-11: Registered the PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, and bootstrap migration owner docs compiled from ledger `pldg-20260610-001-ledger-plan-system`.
- 2026-06-16: Registered `Plans/Goal_Runtime_System.md` as the canonical owner for native Goal Mode runtime/control-plane behavior compiled from ledger `pldg-20260616-001-goal-runtime-system`.
- 2026-06-16: Registered Orchestrator Goal Runtime Flow owner routing compiled from ledger `pldg-20260616-002-orchestrator-goal-runtime-flow`; an explicit governance seal may refresh generated governance artifacts after live Plans and allowed PlanUnit indexes stabilize.
- 2026-06-17: Registered semantic audit closure routing: `Plans/Planning_Ledger_System.md` owns the durable closure registry and reopen policy, `Plans/Plan_Document_System.md` owns deterministic finding keys and closure-matrix validation, and bootstrap prompt/workflow docs consume those owner contracts.
- 2026-06-17: Registered Plans-to-code handoff routing compiled from ledger `pldg-20260617-001-plans-to-code-handoff`; PlanCompile remains design-only/disabled, `Plans/Automated_Testing_System.md` is the automated-testing SSOT, `Plans/plans_to_code_handoff.schema.json` is a design-only schema draft, and no WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, production build tasks, or governance seal artifacts are authorized.

This index is a navigation + canonicalization aid for the `Plans/` folder.
It does **not** remove or override detail in any plan; it exists so implementation stays consistent and rewrite-aware.
