# Shard 003: Purpose

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L15-L34

Source SHA256: `f378e678d5026f04ed7692d91e16bddcfecee234cc66a7af465f15b8ec2ad415`

---

## Purpose
Define the **Provider facade** used by Puppet Master to run **bridged providers** (CLI-bridged and server-bridged) with a single, uniform contract for:

- **Structured request envelopes** (deterministic, replayable runs)
- **Normalized streaming events** (one consumer; no UI special-casing)
- **Tool-call correlation + reconciliation** (CLI oddities tolerated)
- **Authentication / UX-state detection** (logged out, expired or invalid, rate limit, outage)
- **Stream resilience** (bounded retry, replay safety, and circuit breaking)

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

This document owns bridged-provider transport normalization only. PM-internal child orchestration, crew control, runtime ceilings, and parent/child lineage remain owned by `Plans/orchestrator-subagent-integration.md` and `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md

Canonical mapping SSOT for upstream external-framework and A2A bridge concepts is `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. That document is external-reference and future-interop guidance for adapter implementors. It MUST NOT be interpreted as approval to move PM-internal orchestration or child-run control onto A2A semantics.

ContractRef: ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/orchestrator-subagent-integration.md

A2A seam warning: A2A bridge packet verification keeps `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` in the highest-risk verify-only omission lane unless its intro and `/non-goal` framing still read as external-reference and `/future-interop` only; otherwise, it must be promoted out of `MUST VERIFY`. Adjacent docs rechecked and kept out of the packet for now are `Plans/Models_System.md`, whose current capability and compaction-threshold fields already match the narrowed owner set, and `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`, whose current intro/non-goal framing already keeps A2A external-only. Other `MUST VERIFY` watchers must confirm that `Plans/Section15_MVP_Promoted_Features_Spec.md` defers `terminate_session` / graceful shutdown to `Run_Modes.md`; `Plans/Runtime_Artifacts_Panel.md` keeps `cost_usage` and `reasoning_tokens` compatible with microdollars and usage canon; `Plans/Wiring_Matrix.md` terminal kill wiring and checksum-validation flows do not conflict with process-group kills or mandatory CRC recovery; `Plans/MiscPlan.md` SIGTERM, symlink, and multi-instance notes remain advisory and do not shadow the new SSOT; and `Plans/assistant-chat-design.md` concurrent-thread UI defaults are not misread as global subagent concurrency limits.
