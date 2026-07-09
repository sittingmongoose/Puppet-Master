# Shard 003: Change Summary

Source: `Plans/assistant-chat-design.md`

Source lines: L14-L29

Source SHA256: `bd5b0c5cb02bdd93fdb204ad9e14ff65d3beba8942c13f0fddbe799977c2971d`

---

## Change Summary

- 2026-02-26: Added media generation and capability introspection requirements (§7): image attachment nuance (all platforms accept image attachments; image *generation* is Cursor-native or Google-key-backed), `capabilities.get` introspection rule, natural-language model override semantics (per-message only), and media-generation invocation model. SSOT: `Plans/Media_Generation_and_Capabilities.md`.
- 2026-02-25: Remediation alignment with `Plans/GitHub_Integration.md §B.3` — `/actions` and `/actions logs` outputs now require the same run/log summary fields and failure-state parity as the Actions panel.
- 2026-06-18: Retired fixed Pass 1 / Pass 2 / Pass 3 validation model settings and active process stages in §26. Auditor cycle reports mirror the single Auditor validation loop provider/model resolved from the Auditor Model role; legacy pass_number and pass_name fields are compatibility aliases only.
- 2026-02-25: Added §5.3 Git & GitHub command boundary and §23.6 Git & GitHub parity note; cross-references Plans/GitHub_Integration.md.
- 2026-02-25: Added §26 Validation Model/Provider Settings UX for the invariant sweep. The original fixed per-pass selector model is retired by the 2026-06-18 Auditor loop update; stored app settings now resolve through the Auditor Model role rather than legacy pass-specific keys.
- 2026-02-24: Aligned Interview/Assistant output surfacing with **canonical sharded plan graphs** under `.puppet-master/project/plan_graph/` (**index + node shards**). Outputs are **persisted canonically in seglog** and projected into `.puppet-master/project/...` for file-based review; `.puppet-master/project/plan.md` remains the human-readable plan view.
- 2026-02-23: Added Interview chat UX cross-reference to Contract Layer outputs and required `.puppet-master/project/*` artifact pack so interview completion is maximally AI-executable and verifiable (SSOT: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md` §5.7/§11).

**Date:** 2026-02-20
**Status:** Plan document only
**Cross-references:** Plans/FileManager.md (File Manager, IDE-style editor, click-to-open), Plans/storage-plan.md (seglog/redb/Tantivy, chat persistence and search), Plans/interview-subagent-integration.md, Plans/orchestrator-subagent-integration.md, AGENTS.md (DRY Method)
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/Contracts_V0.md`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/UI_Command_Catalog.md`.

---
