# Shard 003: Rewrite alignment (2026-02-21)

Source: `Plans/newtools.md`

Source lines: L16-L33

Source SHA256: `6ad7f74869a13a075ad4cd56057aed261f7509b73c671bcf54251e32e787eed9`

---

## Rewrite alignment (2026-02-21)
This plan remains authoritative for *what* tool discovery/testing support must exist, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- tool discovery, permissions, and validation live in the **central tool registry + policy engine** (not per-provider special cases)
- tool execution results normalize into the **unified event model** and store through seglog -> projections (redb/Tantivy)
- tool latency and errors from the unified event model feed analytics scan jobs and dashboard rollups
- UI wiring details should be re-expressed in Slint (not Iced) without changing feature semantics
- auth policy remains subscription-first, with Gemini API key as the explicit `key-exception` where the selected provider entry supports it; stale-canon one-provider `mixed-account` Gemini wording is retired in favor of Gemini Direct (`gemini`, key-only/API-key-backed) and Gemini CLI (`gemini_cli`, mode-dependent OAuth/API-key/Google-credential rows), with requested/effective auth/account identity kept consistent with the shared provider runtime
- for this task, deliverables remain **Plans-folder documentation updates for the Slint rebuild**; no legacy Iced runtime wiring is required

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

### Route, view-state, and automation-default alignment
Tooling summaries must not let shell view commands become target identity owners. `cmd.source_control.switch_subview` is a `/view-state` command for Source Control subview selection; repo, worktree, and `/worktree/compare` target identity stays in the route/open contract and its runtime object envelope. Stored `resume_url` fields in storage-plan and storage-plan.md remain valid resumability hints, but last-opened-view convenience state inside `project_state:v1:{project_id}`, project_state, and project_id must not become operational truth.

Open-resolution and route focus are GUI consumer behavior. `Project_Output_Artifacts`, `Project_Output_Artifacts.md`, Plans/Section15_MVP_Promoted_Features_Spec.md, /Section15_MVP_Promoted_Features_Spec.md, Plans/Tools.md, /Tools.md, Plans/newtools.md, /newtools.md, Plans/Orchestrator_Page.md, /Orchestrator_Page.md, and `/action` references remain adjacent owner or consumer docs; newtools summarizes only that concern-specific records, GUI open affordances, and `/open-resolution` focus must resolve through the shared object/surface route rather than through local tool prose.

Automation defaults are automation-first. `regular`, `visual_mode`, `visual_mode = auto`, Run_Modes, Run_Modes.md, optional HITL, and manual confirmations must map into one coherent mode policy where local visual runs are allowed but do not defeat the automation-first posture or `/HTE-by-default` migration rule. Surface rows should prefer one strong primary line, compact status chips, `/icons`, expandable `/detail`, deep-link pivots, canonical `/surface` target identity, and secondary `/sub-selection` focus rather than overloading the primary command.
