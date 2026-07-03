# Shard 002: Change Summary

Source: `Plans/00-plans-index.md`

Source lines: L7-L28

Source SHA256: `034fdea597bc7d8921857e14f7d779065a5af0442db53a5dd892ef438963fbe3`

---

## Change Summary


  ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2
- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.
- 2026-06-11: Registered the PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, and bootstrap migration owner docs compiled from ledger `pldg-20260610-001-ledger-plan-system`.
- 2026-06-16: Registered `Plans/Goal_Runtime_System.md` as the canonical owner for native Goal Mode runtime/control-plane behavior compiled from ledger `pldg-20260616-001-goal-runtime-system`.
- 2026-06-16: Registered Orchestrator Goal Runtime Flow owner routing compiled from ledger `pldg-20260616-002-orchestrator-goal-runtime-flow`; an explicit governance seal may refresh generated governance artifacts after live Plans and allowed PlanUnit indexes stabilize.
- 2026-06-17: Registered semantic audit closure routing: `Plans/Planning_Ledger_System.md` owns the durable closure registry and reopen policy, `Plans/Plan_Document_System.md` owns deterministic finding keys and closure-matrix validation, and bootstrap prompt/workflow docs consume those owner contracts.
- 2026-06-17: Registered Plans-to-code handoff routing compiled from ledger `pldg-20260617-001-plans-to-code-handoff`; PlanCompile remains design-only/disabled, `Plans/Automated_Testing_System.md` is the automated-testing SSOT, `Plans/plans_to_code_handoff.schema.json` is a design-only schema draft, governance registration is metadata-only, and no WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, dispatched GoalRuns, or production build tasks are authorized.
- 2026-06-18: Registered PRD Builder and Planning Wizard owner routing compiled from ledger `pldg-20260618-001-prd-planning-wizard`; bootstrap compile remains Plans/index-only and does not run finished-product Plan Compile or create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.
- 2026-06-21: Registered PRD/Planning runtime-contract repair: `Plans/prd_planning_runtime_contracts.json` and schema carry strict Native Ledger Service, ProjectContextSnapshot, stage-card, WorkNode, activation, testing, UICommand, clean-room, and retired-search-exclusion contracts; `scripts/pm-prd-planning-runtime-validate.py` is part of standard gates.
- 2026-06-21: Retired `Plans/chain-wizard.md` and `Plans/chain-wizard-flexibility.md` from active product canon. Their `CW-*` and `CWF-*` PlanUnits are compatibility/source-lineage only and must not be accepted/indexed as active current-product truth.
- 2026-06-26: Registered provider-update compile routing from ledger `pldg-20260624-001-provider-updates`: Gemini CLI is retired from active provider support, Gemini Direct remains API-key-backed, Antigravity CLI replaces Gemini CLI for the CLI-backed Google/agent route, Provider -> models catalogs are mandatory, media support splits input/output/generated-media routes, OpenAI/Codex subscription-backed image generation is mandatory alongside official OpenAI API-key image routes, and provider readiness stays route/model/account specific.
- 2026-06-27: Registered miscellaneous PM History, PM-native vision_bridge / see_image, and Teach/Teacher owner routing compiled from ledger `pldg-20260626-001-feature-name`; PMConcept.html remains non-final source-lineage only, and this compile creates no WorkNodes, NodeSeeds, executable queues, implementation files, or governance-seal artifacts.
- 2026-07-01: Registered containerized-hosts owner routing compiled from ledger `pldg-20260630-001-feature-intake`: `Docker/Hosts` is a native Slint routed page/lab reached from Docker Manager and cross-surface links, `docker_manager` remains the Activity Bar side-panel owner and command namespace, Coasts remains source-lineage inspiration only, runtime families are whole-MVP but capability-probed/gated, and this compile creates no WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, or governance-seal artifacts.
- 2026-07-02: Registered GUI / PMConcept implementation-readiness repair artifacts: `Plans/PMConcept_Control_Reconciliation.json` inventories PMConcept controls and dispositions, `Plans/Wiring_Matrix.production.json` is the schema-validated production wiring matrix, `Plans/Wiring_Matrix.production.exclusions.json` records parser/generic/compatibility exclusions, and PMConcept remains concept/source-lineage only rather than canonical implementation HTML/CSS/demo state.
- 2026-07-02: Refreshed Rust/Slint currentness routing: the active GUI/toolchain target is Rust stable 1.96.1 plus Slint 1.17.0 as verified from official stable release sources on 2026-07-02; PMConcept terminal transcripts and demo version strings are fixture/source-lineage only, and runtime implementation must reverify stable releases before code/build work.

This index is a navigation + canonicalization aid for the `Plans/` folder.
It does **not** remove or override detail in any plan; it exists so implementation stays consistent and rewrite-aware.
