# Shard 004: Rewrite tie-in (2026-02-21)

Source: `Plans/00-plans-index.md`

Source lines: L178-L198

Source SHA256: `32e9ba5465d341e4e9834d8726f5123a53fddeb34221069cc2d8d6d333ed0ab5`

---

## Rewrite tie-in (2026-02-21)
The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:
- **Providers** behind one unified **event model**
- **Event-sourced storage**: `seglog` (canonical ledger) -> projections into `redb` (KV state/settings) + Tantivy (search)
- **Central tool registry + policy engine** and a patch/apply/verify/rollback pipeline
- **UI rewrite**: Rust + Slint (winit; Skia default)
- **Auth**: subscription-first; Gemini is modeled as two provider entries, not one stale-canon `mixed-account` provider: Gemini Direct (`gemini`, direct key-only/API-key-backed) and Gemini CLI (`gemini_cli`, CLI-wrapped OAuth/API-key/Google-credential paths). The Gemini API key remains the explicit `key-exception` where that path is selected. Requested/effective auth, account identity, account/plan UI, and quota/usage labels are mode-dependent and carry across storage, runtime, setup/health, media capabilities, and usage

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

See: `Plans/rewrite-tie-in-memo.md`, `Plans/Multi-Account.md`, `Plans/usage-feature.md`, and `Plans/FinalGUISpec.md`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### Provider/account canon reconciliation note (2026-03-20)

Provider and usage reconciliation spans `Plans/Models_System.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/rewrite-tie-in-memo.md`; concrete owner docs still carry behavior, while this index records the cross-doc impact map. Additional downstream reconciliation may touch provider-health / auth / doctor-related planning docs when those owner surfaces are expanded.

Provider / account / promoted-shell routing stays split by owner surface. `Plans/Multi-Account.md` and provider-specific docs own requested/effective account, auth, quota, and provider-health semantics; `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the promoted shell and promoted-feature behavior envelope; `Plans/FinalGUISpec.md` consumes that shell-surface canon for visible placement, settings, title-bar, attention, and recovery UI; `Plans/Orchestrator_Page.md`, `Plans/Run_Modes.md`, `Plans/Executor_Protocol.md`, and `Plans/storage-plan.md` own the run/package/lane/runtime records that the shell presents. Stale `pre-promotion` page, `/title-bar/recovery`, or feature-list/newfeatures shell wording is lineage or mirror cleanup input, not a live owner alternative.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md
