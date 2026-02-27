## Change Summary

- 2026-02-26: Added media generation and capability introspection requirements (§7): image attachment nuance (all platforms accept image attachments; image *generation* is Cursor-native or Google-key-backed), `capabilities.get` introspection rule, natural-language model override semantics (per-message only), and media-generation invocation model. SSOT: `Plans/Media_Generation_and_Capabilities.md`.
- 2026-02-25: Remediation alignment with `Plans/GitHub_Integration.md §B.3` — `/actions` and `/actions logs` outputs now require the same run/log summary fields and failure-state parity as the Actions panel.
- 2026-02-25: Hardened §26 settings/report consistency: clarified that per-pass provider/model settings remain app-settings-only while resolved values are mirrored into `validation_pass_report` payload fields (`provider`, `model`) for auditability (see `Plans/Project_Output_Artifacts.md §10.2`); added acceptance criterion for settings-to-report parity.
- 2026-02-25: Added §5.2 Git & GitHub Slash Commands and §23.X Git & GitHub parity note; cross-references Plans/GitHub_Integration.md.
- 2026-02-25: Added §26 Per-Pass Validation Model/Provider Settings UX: settings group for per-pass (Pass 1/2/3) provider+model selection for the Three-Pass Canonical Validation Workflow (Plans/chain-wizard-flexibility.md §12). Stored in app settings (not project artifacts). Deterministic defaults via platform_specs. DRY: reuses chat platform+model dropdowns.
- 2026-02-24: Aligned Interview/Assistant output surfacing with **canonical sharded plan graphs** under `.puppet-master/project/plan_graph/` (**index + node shards**). Outputs are **persisted canonically in seglog** and projected into `.puppet-master/project/...` for file-based review; `.puppet-master/project/plan.md` remains the human-readable plan view.
- 2026-02-23: Added Interview chat UX cross-reference to Contract Layer outputs and required `.puppet-master/project/*` artifact pack so interview completion is maximally AI-executable and verifiable (SSOT: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md` §5.7/§11).

**Date:** 2026-02-20  
**Status:** Plan document only  
**Cross-references:** Plans/FileManager.md (File Manager, IDE-style editor, click-to-open), Plans/storage-plan.md (seglog/redb/Tantivy, chat persistence and search), Plans/interview-subagent-integration.md, Plans/orchestrator-subagent-integration.md, AGENTS.md (DRY Method)
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/Contracts_V0.md`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/UI_Command_Catalog.md`.

---

