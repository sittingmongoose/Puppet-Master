# Shard 008: PlanUnits

Source: `Plans/rewrite-tie-in-memo.md`

Source lines: L502-L664

Source SHA256: `86460f8f9a27a13d9b08a00fc8da3d2e1643b9c4de020784eccec267c64d7e99`

---

## PlanUnits

### RTIM-001 - Puppet Master Rewrite Tie-In Contract (Active) Source-Preserving PlanUnit

```yaml
plan_unit_id: RTIM-001
unit_type: requirement
status: accepted
owner_doc: Plans/rewrite-tie-in-memo.md
canonical_text: Plans/rewrite-tie-in-memo.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:rewrite-tie-in-memo-S0038
preserved_exact_tokens:
- Puppet Master Rewrite Tie-In Contract (Active)
- Provided memo (verbatim)
- What's changing (high level)
- Orchestrator rewrite canonicalization lock (2026-03-17)
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Crosswalk.md'
- The core reliability plan (what other features must align with)
- Provider + CLI integrations (what's being hardened)
- Gemini auth decision (locked)
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md'
- Future mobile/web clients (impacts architecture now)
- Implementation directives (required now)
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/agent-rules-context.md, ContractName:Plans'
- Impacts on existing Plans (deltas to keep consistency)
- Immediate contradictions to resolve in Plans (so requirements do not fight each other)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/assistant-chat-design.md'
- Storage consistency
- Plans likely needing the most rewrite-aware edits
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
- Plans that are still conceptually valid (but should be reworded)
- Suggested "single source of truth" rule for the rewrite
- Unified Document/Media Rendering Contract (2026-03-07)
- Locked architecture
negative_constraints:
- '- OAuth, API key, and Google/Vertex credentials are distinct Gemini auth surfaces / quota planes and MUST NOT be presented as the same plan or bucket.'
- '- Rewrite summaries must not encode stale Gemini canon as an API-key default UI, OAuth-as-optional-fallback, or subscription exception without auth-surface and `/account-policy` nuance.'
- '- Thin clients MUST NOT call providers, tool executors, or local patch pipelines directly. They consume streamed events/artifacts and send command requests to the desktop-owned core only.'
- '- UI updates must flow through the Slint event loop boundary and must not rely on delayed or ad-hoc polling paths.'
- '- The Slint rewrite MUST remove all per-platform experimental settings: Settings > Advanced MUST NOT include an "Experimental features" section or per-platform "Enable Codex/Gemini/Copilot Experimental" toggles, config schemas MUST NOT include per-platform `experimentalEnabled` (or equivalent) keys,'
- '- Assistant memory is an Assistant-only continuity capability and MUST NOT alter Provider spine contracts, unified event model ownership, or shared rules pipeline semantics; implementation is specified in `Plans/assistant-memory-subsystem.md`.'
- '- The architecture is **unified across chat, file editor, embedded document panes, detached preview windows, and browser surfaces**. Do not create separate ad-hoc rendering stacks for Markdown preview, Mermaid preview, and HTML preview.'
- '- `open_source` for message-backed Mermaid/Markdown MUST NOT silently invent a workspace file on disk.'
- '`OpenFile` remains the workspace-path and code-navigation command for real files when a canonical path is already known. It must not be stretched into a universal path-open contract for generated/runtime/preview-backed subjects, non-file artifacts, or artifact/report opens. The stale `OpenFile { pat'
- '- the app MUST NOT persist live DOM state or browser storage as part of `PreviewSession` state'
- '- Generated preview pages MUST NOT enable arbitrary remote script execution.'
- '- Generated preview pages MUST NOT reuse workspace-browser cookies/storage by default.'
- '- Full HTML/browser mode is a **separate trust tier** and must not inherit source-mutation privileges by default.'
- '- The preferred CEF integration starting point is lower-level bindings plus a PM-owned shim/bridge; `wef` must not become the architectural linchpin, and direct full custom CEF integration starts only if the lower-level binding path proves non-viable.'
- '- Any upstream experimental warning is treated as implementation risk requiring version lock, fallback/remediation, and runtime health checks; it must not reintroduce GUI experimental-feature toggles.'
- '- FinalGUI cross-check: `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` keeps the `editor-tab` browser as the primary normal browsing and preview host; the bottom panel may show browser-adjacent activity only and must not reintroduce a competing primary Browser tab.'
- '- browser runtime failure must use explicit user-facing remediation and MUST NOT silently swap to an unrelated legacy webview/browser model'
- '- Preview actions MUST NOT write directly to disk and MUST NOT bypass the normal save path.'
- '### Non-goals and prohibitions'
- '- blocked outcomes remain first-class and must not be flattened into generic failures in rewrite-era UI or storage'
compatibility_only_notes:
- '- **Renderer decision (locked):** default is **winit + Skia**, fallback GPU is **winit + FemtoVG-wgpu**, and we keep an emergency software fallback for compatibility; selection can be controlled via Slint''s backend selection mechanisms (e.g., `BackendSelector` and/or `SLINT_BACKEND`). [web:48][web:1'
- '- The Slint rewrite MUST remove all per-platform experimental settings: Settings > Advanced MUST NOT include an "Experimental features" section or per-platform "Enable Codex/Gemini/Copilot Experimental" toggles, config schemas MUST NOT include per-platform `experimentalEnabled` (or equivalent) keys,'
- '- Runtime identity carry-through treats legacy account-doc shorthand as retired: `Multi-Account.md` and the shared runtime contracts own `execution_role`, operational identity, handoff, and UI disclosure fields before feature-specific docs depend on them.'
- '- browser runtime failure must use explicit user-facing remediation and MUST NOT silently swap to an unrelated legacy webview/browser model'
stale_retired_dispositions:
- '- Stale-canon correction: Gemini is not one **DirectApi** `mixed-account` provider. Gemini Direct (`gemini`) and Gemini CLI (`gemini_cli`) are separate provider entries; the older one-provider mixed OAuth/API-key account-pool wording is retired.'
- '- Stale-canon retirement is explicit for this rewrite packet: do not preserve the old one-provider Gemini mixed OAuth/API model, CLI-first Codex/Copilot runtime language, `server` / `cli_launcher` OpenCode framing where `Managed Server` / `Attach to Existing Server` owns the meaning, `--user-data-di'
- '- Rewrite summaries must not encode stale Gemini canon as an API-key default UI, OAuth-as-optional-fallback, or subscription exception without auth-surface and `/account-policy` nuance.'
- The following contradictions must be retired during reconciliation so the rewrite does not preserve parallel canon.
- '- retire stale browser / bottom-panel / `Debug` wording, keep Debug Mode distinct from the classical debugger surface, and preserve the visible browser-evidence contract'
- '- Runtime identity carry-through treats legacy account-doc shorthand as retired: `Multi-Account.md` and the shared runtime contracts own `execution_role`, operational identity, handoff, and UI disclosure fields before feature-specific docs depend on them.'
- '`OpenFile` remains the workspace-path and code-navigation command for real files when a canonical path is already known. It must not be stretched into a universal path-open contract for generated/runtime/preview-backed subjects, non-file artifacts, or artifact/report opens. The stale `OpenFile { pat'
- '- `stale`'
- '- route, `/focus/open/reopen`, and recovery commands target the canonical `browser_session_id` / `preview_subject_id` pair rather than a generic preview tab or stale bottom-panel browser placeholder'
- '- Stale `workspace_browser`, `bottom_panel_browser`, `detached-only` guarantees, and WebView2/WebKitGTK runtime matrices are retired rewrite-baseline inputs; they do not override the PM-managed browser-session model, the editor-tab plus first-class detached-window contract, or the CEF `/pinned-runti'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- node graph is the canonical execution model'
- '- `route_target` and `OpenSubject` are canonical navigation/source-open primitives'
- '- **Storage rewrite (no SQLite):** storage becomes a multi-store design: `seglog` as the canonical append-only event ledger, `redb` for durable KV state/projections/settings, and Tantivy for full-text search over chats/docs/log summaries. [web:88][web:90][web:82]'
- '- The system must be reproducible: sessions/runs are replayable from a canonical event stream (seglog), with deterministic projections into redb/Tantivy and checkpointing for resumability after crashes. [web:88][web:90][web:82]'
- '- **Resume semantics (rewrite-level):** resumability means Puppet Master restarts from the last durable safe boundary recorded in canonical storage/projector state. It does not imply provider-process or transport-session reattachment.'
- '- **SSOT routing:** replay/checkpoint/rebuild semantics are owned by `Plans/storage-plan.md`; normalized provider-stream behavior is owned by `Plans/CLI_Bridged_Providers.md`; centralized tool-policy/result normalization is owned by `Plans/Tools.md`.'
- '- Stale-canon retirement is explicit for this rewrite packet: do not preserve the old one-provider Gemini mixed OAuth/API model, CLI-first Codex/Copilot runtime language, `server` / `cli_launcher` OpenCode framing where `Managed Server` / `Attach to Existing Server` owns the meaning, `--user-data-di'
- '- Packet candidates must include all `MUST CHANGE` docs, must include `MUST RECONCILE` docs or explicitly justify why a stronger overlapping owner doc eliminates drift risk, and should list `MUST VERIFY` docs as pre-emit checks rather than derived-only outputs. If a packet candidate omits `storage-p'
- '- Mobile/web clients will be "thin" and connect back to the desktop app (desktop acts like a local server), so the stable boundary is the unified event model + streaming API (runs/events/artifacts) and command API (start run, approve tool, cancel run), rather than direct access to providers/tools on'
- '- UI updates must flow through the Slint event loop boundary and must not rely on delayed or ad-hoc polling paths.'
- 'Note: Gist generation is artifact-driven (AutoRunBoundary/AutoMilestone) and remains Assistant-only; it does not change system SSOT ownership.'
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/agent-rules-context.md, ContractName:Plans'
- '- **OpenCode ontology:** retire `server` / `cli_launcher` language that obscures the canonical `Managed Server` / `Attach to Existing Server` server-profile model.'
- '- **Runtime vocabulary:** keep `requested_platform` / `effective_platform` canonical and add family/runtime-platform/billing fields additively rather than minting a parallel primary vocabulary.'
- '- **Skill and MCP ownership:** retire any wording that makes provider-native skill or MCP configuration the primary runtime path; PM-native skills and PM-native MCP remain canonical.'
- '- **Cursor runtime boundary:** retire `--user-data-dir` as the CLI multi-account isolation contract; PM-managed `HOME` / `XDG_*` roots for `cursor-agent` are the canonical CLI boundary.'
- '- **Plans/storage-plan.md** -- Canonical storage checklist (seglog, redb schema, projectors, analytics); other plans that persist state or emit events should reference it and call out seglog vs redb.'
- '- keep treating it as historical/origin material only; promoted browser/debug/runtime behavior now lives in the reconciled owner docs'
- '- carry Investigation Context, event types, and bounded attachment semantics through the canonical prompt/event contracts rather than leaving them as UI-only ideas'
- '- Provider contracts, unified event model, tool registry, and patch pipeline should be specified in one canonical plan (or one canonical spec section), and other plans should reference it instead of re-describing it'
- '- Chat surfaces distinguish chat-native tool result cards from shell-owned terminal/output surfaces and from true interactive terminal sessions. Chat may summarize or link to execution, but terminal/output ownership stays with the canonical shell/runtime surfaces.'
- '- The chat-widgets cluster includes code-block and `/diff` cards that can open in-app editor views with range-aware positioning, question chips/freeform paths, and Mermaid / `.mmd` native diagram rendering; owner details remain in `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md`.'
- '- Thread context/detail surfaces do not use `chat-shell` popouts or `/side-panel` detail panels as their canonical target; rewrite navigation opens or focuses the thread-scoped Context Detail Pane as an `editor-tab` surface, with product behavior owned by `Plans/assistant-chat-design.md` and `Plans/'
owner_hints:
- Plans/rewrite-tie-in-memo.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

