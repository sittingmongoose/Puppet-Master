# Shard 003: Impacts on existing Plans (deltas to keep consistency)

Source: `Plans/rewrite-tie-in-memo.md`

Source lines: L89-L140

Source SHA256: `8086676ed9f42bcf0af1756544bcf56a0444046613af1bf0b372647f30ef45a0`

---

## Impacts on existing Plans (deltas to keep consistency)

### Immediate contradictions to resolve in Plans (so requirements do not fight each other)


The following contradictions must be retired during reconciliation so the rewrite does not preserve parallel canon.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

- **Provider split:** retire any wording that treats Gemini direct and Gemini CLI as one mixed provider surface.
- **Direct-provider canon:** retire any wording that describes Codex or GitHub Copilot as CLI-driven runtime providers in PM.
- **OpenCode ontology:** retire `server` / `cli_launcher` language that obscures the canonical `Managed Server` / `Attach to Existing Server` server-profile model.
- **Runtime vocabulary:** keep `requested_platform` / `effective_platform` canonical and add family/runtime-platform/billing fields additively rather than minting a parallel primary vocabulary.
- **Skill and MCP ownership:** retire any wording that makes provider-native skill or MCP configuration the primary runtime path; PM-native skills and PM-native MCP remain canonical.
- **Cursor runtime boundary:** retire `--user-data-dir` as the CLI multi-account isolation contract; PM-managed `HOME` / `XDG_*` roots for `cursor-agent` are the canonical CLI boundary.
- **Terminal/editor GUI canon:** retire the older flat bottom-terminal strip, single editor dock slot, and separate command-log strip assumptions in favor of workgroups, subtabs, split-pane trees, multi-panel editor terminal stack, and explicit DnD semantics.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/assistant-chat-design.md
### Storage consistency
- All run/session/artifact/checkpoint persistence and event emission must align with **Plans/storage-plan.md** (seglog writer, redb schema, projector pipeline, analytics scan).
- When adding or editing plans that touch runs, sessions, settings, or artifacts, add a cross-reference to storage-plan.md and specify whether the plan assumes seglog events, redb tables, or both.
- **Plans/storage-plan.md** -- Canonical storage checklist (seglog, redb schema, projectors, analytics); other plans that persist state or emit events should reference it and call out seglog vs redb.
- Document annotation work reuses the existing bundle `/note` persistence and event model in **Plans/storage-plan.md** (`/storage-plan.md`); do not invent a second annotation storage path for the rewrite.

### Plans likely needing the most rewrite-aware edits


- `Plans/newfeatures.md`
  - keep treating it as historical/origin material only; promoted browser/debug/runtime behavior now lives in the reconciled owner docs
- `Plans/assistant-chat-design.md`
  - keep chat-mode UX and slash-command behavior, but reconcile the mode strip, Investigation Context, and visible-vs-hidden evidence ingress with the rewrite storage/prompt model
- `Plans/Run_Modes.md`, `Plans/Permissions_System.md`, and `Plans/storage-plan.md`
  - keep the rewrite runtime/persistence model authoritative and ensure Debug stays an overlay, not a fifth runtime enum or a hidden global permission profile
- `Plans/Prompt_Pipeline.md` and `Plans/Contracts_V0.md`
  - carry Investigation Context, event types, and bounded attachment semantics through the canonical prompt/event contracts rather than leaving them as UI-only ideas
- `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Runtime_Artifacts_Panel.md`
  - retire stale browser / bottom-panel / `Debug` wording, keep Debug Mode distinct from the classical debugger surface, and preserve the visible browser-evidence contract
- `Plans/Tools.md`, `Plans/newtools.md`, and `Plans/GitHub_Integration.md`
  - keep debug-capable tooling cross-surface, registry-driven, remote-authority-safe, and compatible with the shared artifact/doctor pipeline

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

### Plans that are still conceptually valid (but should be reworded)


- `Plans/FileSafe.md`
  - Safety/policy intent remains valid; implementation should target patch/apply/verify/rollback and centralized tool governance rather than UI-level/file-manager specifics
- `Plans/WorktreeGitImprovement.md`, `Plans/MiscPlan.md`
  - Worktree/cleanup correctness stays valid; hook/crew sections should point to a single shared lifecycle framework in the new agent-loop core

---

