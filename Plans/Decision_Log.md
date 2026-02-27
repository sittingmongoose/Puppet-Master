# Decision Log

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Purpose
Records decisions made during plan document updates that are not captured in `Plans/auto_decisions.jsonl` or `Plans/Decision_Policy.md`. Each entry is timestamped and final.

---

## Entries

### DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems
- **Date**: 2026-02-27
- **Context**: Expanding `Plans/OpenCode_Deep_Extraction.md` to cover 8 new subsystem categories (run modes, agents, permissions, commands, formatters, skills, plugins, models) required mapping each to a Puppet Master SSOT document.
- **Decision**: New SSOT targets were assigned as `Plans/Agent_System.md`, `Plans/Permissions_System.md`, `Plans/Commands_System.md`, `Plans/Formatter_System.md`, `Plans/Skills_System.md`, `Plans/Plugin_System.md`, and `Plans/Prompt_Pipeline.md`. These files do not yet exist; they are placeholder targets for future prompt pipeline execution.
- **Rationale**: Each OpenCode subsystem maps to a distinct concern in Puppet Master. Collapsing them into existing docs (e.g., Tools.md) would violate separation of concerns and make the mapping table ambiguous. Existing targets (`Plans/Provider_OpenCode.md`, `Plans/Orchestrator_Page.md`, `Plans/human-in-the-loop.md`, `Plans/orchestrator-subagent-integration.md`) were reused where they already cover the topic.

### DL-002: Section numbering shift in OpenCode_Deep_Extraction.md
- **Date**: 2026-02-27
- **Context**: The original file used sections 7 (contract mapping) and 8 (upstream notes). The expanded extraction needed a large new section for detailed coverage.
- **Decision**: Inserted section 7 ("Expanded Extraction Coverage") with subsections 7A-7H. Moved the original contract mapping to section 8 (upgraded with per-topic rows) and upstream notes to section 10. Added section 9 ("Baseline -> Puppet Master Delta Hooks").
- **Rationale**: The new section 7 is the core value of the extraction. The mapping table (now section 8) references section 7 topics. Delta hooks (section 9) provide the implementation bridge. This ordering follows the natural read flow: understand the baseline, then see where it maps, then see where it diverges.
