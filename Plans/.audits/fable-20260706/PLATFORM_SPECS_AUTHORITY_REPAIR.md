# Platform Specs Authority Repair - FABLE 20260706

Generated: 2026-07-07T18:49:00Z

## Decision Applied

Legacy `platform_specs` / `platform_specs.rs` is retired source-lineage from the removed Rust/Iced implementation. It is not the active provider/model capability SSOT.

Active authority is:
- `Plans/Models_System.md` for context-window fields, max-token fields, fallback-chain shape, capability provenance, and requested/effective model disclosure.
- `Plans/Contracts_V0.md` only for the cross-surface provider/model capability snapshot reference envelope.
- `Plans/assistant-chat-design.md`, `Plans/Provider_OpenCode.md`, and CLI bridge docs as consumers of those owners.

## Repairs

- Replaced Assistant Chat live `platform_specs` data-source claims with Models_System provider/model capability snapshot and resolver language.
- Repointed model-switch context repack from `platform_specs::context_window(provider)` to `context_window_tokens`, `max_input_tokens`, and `effective_context_window_tokens`.
- Repointed Auditor Validation fallback from `platform_specs::fallback_model_ids(platform)` to Models_System `fallback_chain[]`.
- Added Models_System capability snapshot fields, fallback-chain row shape, provenance requirements, and PlanUnit `MS-134`.
- Added Contracts_V0 capability snapshot reference envelope and PlanUnit `CV-311`.
- Confirmed Provider_OpenCode remains a consumer and preserves `platform_specs.rs` only as retired source-lineage.

## Negative Constraints

- Do not use `platform_specs::context_window(provider)` as active context-window authority.
- Do not use `platform_specs::fallback_model_ids(platform)` as active fallback authority.
- Do not treat Contracts_V0, Assistant Chat, Provider_OpenCode, or CLI bridge docs as replacement owners for provider/model capability fields.
- Do not close unrelated FABLE rows for FileSafe, tier vocabulary, broad Contracts_V0 gaps, Goal Runtime, Executor Protocol, UI command catalog, wiring matrix, missing docs, or broad PlanUnit boilerplate in this repair.

## Validation Scope

This repair closes `fable-20260706-p0-platform-specs-authority-drift` only. Broader FABLE P0/P1 rows remain represented by `currentness_check_report.json` and the buildability registry unless separately repaired by later bounded goals.
