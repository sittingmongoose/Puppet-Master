# Shard 028: INV-023 -- Investigation lifecycle budgets are typed

Source: `Plans/Architecture_Invariants.md`

Source lines: L365-L375

Source SHA256: `6d940af76f0d50c6f92e8692ebc817938edcf6015f12a2072bc063517d7020f1`

---

## INV-023 -- Investigation lifecycle budgets are typed

**Rule:** Debug/investigation flows MUST record typed budget exhaustion rather than collapsing every stop into a generic failure or blocked state.

- Investigation lifecycle records may carry `budget_kind?` when a budget or loop guard contributes to stop, failure, cleanup, or attention-required handling.
- Allowed `budget_kind?` values are `target_discovery_attempts`, `prepare_attempts`, `instrumentation_passes`, `invasive_instrumentation_passes`, `fix_candidates`, `repro_attempts`, `verification_attempts`, `package_or_tool_installs`, `browser_scenario_branches`, `no_new_evidence_loops`, `active_temporary_instrumentation_lanes`, `cleanup_retries`, `attention_required_resume_cycles`, and `elapsed_wall_time`.
- Budget exhaustion keeps its own typed reason even when the visible lifecycle state becomes `failed`, `failed_cleanup`, or `attention_required`; retry, resume, and cleanup surfaces must preserve the exact `budget_kind?` that tripped.
- MVP default ceilings remain explicit in the investigation contract: `max_verification_attempts_per_fix_candidate = 2` and `max_package_or_tool_installs = 2` per investigation, with the named keys `max_verification_attempts_per_fix_candidate` and `max_package_or_tool_installs` persisted or exported when they affect stop/retry decisions.
- Only package or tool installs that persist beyond a single process lifetime count against `max_package_or_tool_installs`; ephemeral per-process installs may be logged as investigation context but do not consume the install budget.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md
