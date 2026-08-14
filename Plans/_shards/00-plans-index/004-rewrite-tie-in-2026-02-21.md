# Shard 004: Rewrite tie-in (2026-02-21)

Source: `Plans/00-plans-index.md`

Source lines: L202-L222

Source SHA256: `d1d659cd51ca674c1e34c953ae8080b399b7d61ffed7f802998596f738d85c78`

---

## Rewrite tie-in (2026-02-21)
The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:
- **Providers** behind one unified **event model**
- **Event-sourced storage**: `seglog` (canonical ledger) -> projections into `redb` (KV state/settings) + Tantivy (search)
- **Central tool registry + policy engine** and a patch/apply/verify/rollback pipeline
- **UI rewrite**: Rust stable 1.96.1 + Slint 1.17.1 by owner decision on 2026-07-07 (Winit + Skia compiled/default on Windows/Linux/macOS; Winit + FemtoVG-wgpu fallback; Winit software emergency fallback; Slint/WASM canvas web GUI via trusted local daemon for OS capabilities; reverify official stable releases before runtime implementation)
- **Auth**: subscription-first; Gemini Direct (`gemini`, direct key-only/API-key-backed) remains active, while Gemini CLI (`gemini_cli`) is retired from active provider support and preserved only as source-lineage/compatibility terminology. Antigravity CLI is the active CLI-backed Google/agent route replacing the stale Gemini CLI route. Provider identity, requested/effective auth, account identity, account/plan UI, quota/usage labels, media capabilities, and setup/health are route-, account-, and model-dependent across direct providers, CLI-backed providers, coding-plan providers, and generated-media routes.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

See: `Plans/rewrite-tie-in-memo.md`, `Plans/Multi-Account.md`, `Plans/usage-feature.md`, and `Plans/FinalGUISpec.md`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### Provider/account canon reconciliation note (2026-03-20)

Provider and usage reconciliation spans `Plans/Models_System.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/rewrite-tie-in-memo.md`; concrete owner docs still carry behavior, while this index records the cross-doc impact map. Additional downstream reconciliation may touch provider-health / auth / doctor-related planning docs when those owner surfaces are expanded.

Provider / account / promoted-shell routing stays split by owner surface. `Plans/Multi-Account.md` and provider-specific docs own requested/effective account, auth, quota, and provider-health semantics; `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the promoted shell and promoted-feature behavior envelope; `Plans/FinalGUISpec.md` consumes that shell-surface canon for visible placement, settings, title-bar, attention, and recovery UI; `Plans/Orchestrator_Page.md`, `Plans/Run_Modes.md`, `Plans/Executor_Protocol.md`, and `Plans/storage-plan.md` own the run/package/lane/runtime records that the shell presents. Stale `pre-promotion` page, `/title-bar/recovery`, or feature-list/newfeatures shell wording is lineage or mirror cleanup input, not a live owner alternative.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md
