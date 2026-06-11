# Shard 021: PlanUnits

Source: `Plans/LSPSupport.md`

Source lines: L1084-L1304

Source SHA256: `df1a9dcf0546d489cf8823a1592b6896ca423ee12a1274894bb0bd899a297278`

---

## PlanUnits

### L-001 - LSP Support -- Plan (Rewrite) Source-Preserving PlanUnit

```yaml
plan_unit_id: L-001
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Plans/LSPSupport.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/LSPSupport.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:LSPSupport-S0068
preserved_exact_tokens:
- LSP Support -- Plan (Rewrite)
- 1. Purpose
- 1.1 Feature specification (inputs, outputs, behavior)
- 'ContractRef: ContractName:Plans/LSPSupport.md'
- 2. LSP Basics (Reference)
- 3. How OpenCode Does It (Reference for Rewrite)
- 3.1 Summary from opencode.ai/docs/lsp/
- 3.2 Built-in LSP servers (full table)
- 3.5 Root discovery (per-server rules)
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md'
- 3.6 Extension conflicts (multiple servers per extension)
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md'
- 3.6.1 Effective server selection metadata
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
- 3.3 ESLint and ECMAScript/JavaScript (reinforced)
- 3.3.1 Slint LSP (slint-lsp)
- 3.4 Implementation (server.ts)
- 4. Rust Stack (Client Side)
- 5. Integration with Our Editor (FileManager / Rewrite)
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
- 5.1 Chat LSP
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
negative_constraints:
- 'Broad catalog support includes common config/docs/container families such as GraphQL, Dockerfile / Docker config, TOML, YAML, and Markdown. The catalog must not under-call broad support: `/discovery/config` tracks server discovery/config support, while `/bundles/manages` records which entries PM act'
- '- remote-mode projects use remote host roots and MUST NOT silently attach against a hidden local mirror'
- '- remote/degraded attach rules must be explicit; the client must not fabricate healthy capability state when a server is disabled, unavailable, or partially attached'
- '- Diagnostics integration is source-preserving; `diagnostics-integration` is the merge/presentation contract, not a storage-flattening rule. Store diagnostics per `(server_id, session/root, uri)` or its normalized `(session, uri)` equivalent; merge only in presentation surfaces such as Problems, edi'
- '- Protocol guardrails are conservative by default: initialize -> initialized -> normal traffic -> shutdown -> exit is the strict lifecycle, dynamic registration stays disabled until PM can handle `/unregister`, and over-advertising unsupported snippets, resolve support, progress, `/code-action/works'
- '- Tool subsystem enforcement distinguishes formatter-vs-LSP ownership, DAE non-triggering host writes, and overlapping formatter detectors. `Formatters_System.md`, `Plugins_System`, `Plugins_System.md`, `Formatters_System`, `tool.*` telemetry, plugin tool IDs, TOML namespaces, name-based policy keys'
- '- when LSP is unavailable, fallback navigation/index behavior is explicit and MUST NOT masquerade as healthy LSP state'
- '- When LSP is unavailable, Puppet Master falls back to code index/text search, `/regex` or heuristic outline where available, and optional `/download` or install hints. The fallback path must not claim diagnostics, semantic features, or healthy attached-server state.'
- '- The LSP indexing/autodetect seam is research-locked around distinct GUI state layers. PM must keep `detected_languages` / project badges, selected preset, requested LSP enablement and server overrides, effective attached LSP sessions, and code index freshness/health separate in product language an'
- '- Search remains text-first. The Search side panel consumes content-search / project code-search output with stable path, `/range/snippet`, and snippet identity, then routes open and `/highlight` through the same shell/editor path as chat, `/file-manager/LSP`, and LSP navigation opens. LSP symbol mo'
- '- Status-bar /search-language copy in `Plans/LSPSupport.md` (`/LSPSupport.md`) keeps symbol search and regex grep non-conflicting: LSP may report server health, symbol navigation, and fallback state, while `grep` and Search regex acceleration remain text-search vocabulary and must not be labeled as '
- '- Storage and runtime consumers must not lag the execution-core rewrite: `storage-plan` and `storage-plan.md` record families consumed by LSP evidence, diagnostics, and apply-edit flows use current execution identity rather than stale route-only or tier-only records.'
- '- rewrite-alignment references are routing inputs, not new LSP owners: `Decision_Log`, `Decision_Log.md`, `rewrite-tie-in-memo`, `rewrite-tie-in-memo.md`, `/packages/lanes/overseers`, `feature-list`, `feature-list.md`, `newfeatures.md`, projection-trust, `/effective`, promoted-feature, and tier-era '
- '- cross-doc LSP consumers must not inherit stale Orchestrator UI ownership: `Widget_System`, `Widget_System.md`, `Run_Graph_View`, `Run_Graph_View.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` references to `Tiers` or `/task/subtask` trees are compatibility inputs only; LSP-facing UI and diag'
- '- Project `/status` labels exposed beside LSP availability must not stay setup-centric. Project health/status, code-index state, LSP attach state, and runtime capability state remain separate so install/setup readiness does not masquerade as current project health or semantic intelligence.'
- '- Plans/FileManager.md (§6 out of scope, §10 editor navigation and fallback symbol search, §11 file-tree actions and presets)'
- '- The canonical remote working-folder identity is `user@host:remote/path`; `remote-host`, `working-folder`, and path authority are part of the project/runtime identity. Puppet Master must not create a hidden local `/mirror`, must not silently retarget `/multi-context` work to the local host, and mus'
- '- Remote mutation and availability modes are user-visible. Preview-worthy rename, multi-file code-action, and broad format operations require the same safe preview `/confirmation` path as other FileSafe edits; partial workspace-edit failure reports per-file results, and read-only, locked, unavailabl'
- '- Remote outages affect adjacent consumers without redefining them. Prior Search results may remain as stale snapshots, while new queries that need remote round-trips block or show unavailable; Source Control may expose stale status or `/diff` but must not silently fall back to local Git; Problems a'
- '- Browser and recovery residue must not be reintroduced through LSP wording: `Bottom Panel Browser tab (§7.20)`, `preview_mode = browser_panel`, and `preview_mode` are preview/browser migration tokens owned by FileManager/FinalGUISpec/storage-plan cleanup, while `recover-unsaved` remains an editor/s'
- '**Stale response policy:** When a response arrives for a document-scoped request (hover, completion, definition, references, signatureHelp), the client must check whether the document version has changed since the request was sent. Store the document version (from `DocumentState.version` for that UR'
- At open time, PM creates one canonical `DocumentUri` per document/host and reuses it consistently. The same physical file must not gain duplicate identities through case, `/slash/drive-letter`, URI spelling, `(session, uri)` pairing, or `/path/position` conversion differences. UI/editor surfaces sta
- '- Sync events are FIFO per session. A document-scoped request must not leave the queue until the target session is `Ready`, the prior `didOpen`/`didChange` work for that document in that session has flushed, and the document is no longer in pending-sync state.'
- '- A successful save may emit `didSave` for the current document version/content state. Failed save does not emit `didSave`, and stale-result handling must not make the UI look saved or synchronized.'
compatibility_only_notes:
- '- OpenCode-style registry findings are retained as implementation input without copying weak behavior. PM keeps built-in and custom server definitions, local stdio transport, lazy spawn, per-server root discovery, and diagnostics into Assistant context, while avoiding `/full-buffer-or-disk-resync`, '
- '- **For our implementation:** When adding LSP, include **eslint** in the server registry for JS/TS projects. Root discovery: nearest directory containing `package.json` (or `eslint.config.js` / `eslint.config.mjs` / `eslint.config.ts` for v10). Prefer ESLint v10 flat config when present (`eslint.con'
- '- Stale references to `FileManager.md §12.1.4`, `§12.1.4`, `§12.2.7`, `§12.4`, `§12.5`, `§12.6`, `§11`, `TOC`, and `Projects (§7.3)` / `§7.3` are legacy cross-reference residue. `FinalGUISpec` and FileManager consumers must route to the current FileManager §10 navigation/fallback contract or this LS'
- '- The FileManager editor-surface map is explicit for LSP consumers: `§10.1 Breadcrumbs / outline` owns the breadcrumb strip and outline, with LSP using `documentSymbol` and fallback using heuristic / regex outline; `§10.2 Go to symbol` owns command-palette and quick-open symbols, with LSP using `doc'
- '- Orchestrator consumers of LSP data use `Orchestrator_Page`, `Orchestrator_Page.md`, `/event`, `Seams`, and `/package/seam/lane-native` execution objects; `Tiers` and tier-keyed widgets or event rows are compatibility inputs only.'
- '- Widget layout compatibility is narrow: keep `widget_layout:v1:dashboard`, `widget_layout:v1:usage`, and `widget_layout:v1:orchestrator:progress`; deprecate or remove `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, and `widge'
- '- cross-doc LSP consumers must not inherit stale Orchestrator UI ownership: `Widget_System`, `Widget_System.md`, `Run_Graph_View`, `Run_Graph_View.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` references to `Tiers` or `/task/subtask` trees are compatibility inputs only; LSP-facing UI and diag'
- '- Runtime artifact and code-open consumers keep identity and location separate. `Runtime_Artifacts_Panel` / `Runtime_Artifacts_Panel.md` compatibility `task_id` vocabulary must resolve to `node_id`, package, seam, lane, and attempt identity before LSP evidence or diagnostics are attached; file/code '
- 5. Transition the record to `ready` or `failed` after handshake completion.
- '- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope. The canonical tool surface is nine read-only operations plus one write/approval-gated `rename`; the packetization label `10 read-only + 1 write-gated (lsp_rename)` is reconciled here by tre'
- '- Remote paths preserve the user-visible SSH authority: examples such as `user@host:/path/to/project` and `/path/to/project` describe the same remote project identity, not a local mirror. Remote LSP is MVP for remote edit intelligence and diagnostics, but remote run/debug remains outside FileManager'
- At open time, PM creates one canonical `DocumentUri` per document/host and reuses it consistently. The same physical file must not gain duplicate identities through case, `/slash/drive-letter`, URI spelling, `(session, uri)` pairing, or `/path/position` conversion differences. UI/editor surfaces sta
- LSP coordinates use the protocol's code-unit conventions at the boundary; the centralized conversion layer records whether a server uses UTF-16 code-unit offsets, another negotiated encoding, or compatibility fallback, so individual feature handlers never hand-roll code-unit math.
- '- **Keys:** `lsp.enabled` (bool, default true), `lsp.servers.<id>.disabled` (bool), `lsp.servers.<id>.command` (string array), `lsp.servers.<id>.extensions` (string array), `lsp.servers.<id>.env` (object), `lsp.servers.<id>.initialization` (object). **Decision:** Config namespace is `lsp.servers.<id'
stale_retired_dispositions:
- '| **Hover** | (URI, position), optional timeout | Tooltip (markdown or plain) | Tooltip at cursor | Timeout → show "Timed out", discard; stale (version changed) → discard; no server → no tooltip | `lsp.hoverTimeoutMs` | No hover; syntax-only if any |'
- '| **Autocomplete** | (URI, position, trigger), optional timeout | Inline completion list | List shows; select applies | Timeout → hide list, discard; stale → discard; no server → no LSP completions | `lsp.completionTimeoutMs` | Heuristic or no completion |'
- '| **Signature help** | (URI, position) in call | Popup with signature + param highlight | Popup visible | Timeout → hide; stale → discard; no server → no signature help | -- | No signature help |'
- '| **Request timeout/cancellation** | Per-request timeout; cancel on navigate/edit | -- | Stale work abandoned | Timeout → treat as failure for that request (show "Timed out" or discard) | `lsp.*TimeoutMs` (§14.4) | N/A (client-side) |'
- '- `LspHost`, `LspSession`, and `DocumentStore` are first-class implementation concepts: the host owns local/remote placement and `/backoff/eviction`, the session owns lifecycle and restart behavior, and the document store owns URI normalization, pending-sync state, stale-result checks, and authorita'
- '- feature requests are gated behind sync barriers so stale document versions do not leak into the UI'
- '- Stale references to `FileManager.md §12.1.4`, `§12.1.4`, `§12.2.7`, `§12.4`, `§12.5`, `§12.6`, `§11`, `TOC`, and `Projects (§7.3)` / `§7.3` are legacy cross-reference residue. `FinalGUISpec` and FileManager consumers must route to the current FileManager §10 navigation/fallback contract or this LS'
- '- The semantic requirements formerly named `§12.1.4 Symbol search without LSP` and `§12.2.7 Symbol index staleness` are retained here as live obligations: fallback symbol search supports regex / heuristic outline and optional indexed-symbol paths; stale index labels, rebuild expectations, and remote'
- '- Storage and runtime consumers must not lag the execution-core rewrite: `storage-plan` and `storage-plan.md` record families consumed by LSP evidence, diagnostics, and apply-edit flows use current execution identity rather than stale route-only or tier-only records.'
- '- cross-doc LSP consumers must not inherit stale Orchestrator UI ownership: `Widget_System`, `Widget_System.md`, `Run_Graph_View`, `Run_Graph_View.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` references to `Tiers` or `/task/subtask` trees are compatibility inputs only; LSP-facing UI and diag'
- '| **Symbol index staleness (without LSP)** | **FileManager:** fallback symbol navigation lives in §10.2. **When LSP present:** Diagnostics and symbols come from server. **When LSP disabled or unavailable:** Keep regex/heuristic symbol path (FileManager §10.2); optional install hint. **Client:** No a'
- '- `obl-064` owns this MVP LSP features summary and requires the missing-result envelope `status: ok | partial | unavailable | error`; stale aliases, short names, or ad hoc result envelopes are retired in favor of this section.'
- '- [LSP stale response / versioning](https://github.com/microsoft/language-server-protocol/issues/584)'
- '- **Hover:** textDocument/hover at cursor; show tooltip; timeout and stale discard (§1.1, §7). *Depends on: Document sync.*'
- '- **Completion:** textDocument/completion on trigger; render list and apply on select; timeout and stale discard. *Depends on: Document sync.*'
- '**Edge cases and fallback:** For each checklist item below, success/failure behavior, edge cases (timeout, server crash, stale response), and **fallback when LSP unavailable** are defined in §1.1 (Purpose), §5 (Editor), §5.1 (Chat), §8 (mitigations), and §13 (GUI). Config keys: §14.4.'
- '- [ ] Request timeout and cancellation; discard or re-request on stale document version.'
- '- The stale local-only phrase `(server_id, root)` is retained only as migration contrast. Live LSP attach/session keys are `(host_id, server_id, root_identity)`, and remote documents use host-scoped `/path-mapping` so a file-local URI on host A cannot collide with the same path on host B.'
- '- Remote outages affect adjacent consumers without redefining them. Prior Search results may remain as stale snapshots, while new queries that need remote round-trips block or show unavailable; Source Control may expose stale status or `/diff` but must not silently fall back to local Git; Problems a'
- 4. **User hovers** → Editor sends (uri, position) → Client sends `textDocument/hover` (with timeout) → On response, check document version; if stale, discard → Show tooltip.
- 5. **User triggers completion** → Client sends `textDocument/completion` with context → On response, filter/discard if stale → Show list; on select, apply and optionally `completionItem/resolve`.
- '**Stale response policy:** When a response arrives for a document-scoped request (hover, completion, definition, references, signatureHelp), the client must check whether the document version has changed since the request was sent. Store the document version (from `DocumentState.version` for that UR'
- '- A successful save may emit `didSave` for the current document version/content state. Failed save does not emit `didSave`, and stale-result handling must not make the UI look saved or synchronized.'
- '- `support_classification` (`supported-by-registry`, `default-managed`, `toolchain-bound/manual`, `experimental/degraded`, `deprecated/replaced`)'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`, `Plans/Tools.md`.'
- '- **Product boundary:** For MVP, PM is the LSP client and lifecycle owner, not a `language-analysis` engine and not a custom `language-server` for mainstream languages. Default servers such as rust-analyzer, pyright, gopls, clangd, and slint-lsp run as local stdio RPC processes by default; pylsp-sty'
- '**Official documentation:** [LSP Servers \| OpenCode](https://opencode.ai/docs/lsp/) -- canonical reference for built-in servers, config, and behavior.'
- '- Selection examples are canonical rather than illustrative placeholders: `selection_mode = standalone_primary` plus `selection_family = ts-js` for generic TypeScript, `selection_mode = contextual_primary` with `context_require = [deno.json, deno.jsonc]` for Deno, `selection_mode = supplementary_dia'
- '- OpenCode-style registry findings are retained as implementation input without copying weak behavior. PM keeps built-in and custom server definitions, local stdio transport, lazy spawn, per-server root discovery, and diagnostics into Assistant context, while avoiding `/full-buffer-or-disk-resync`, '
- '- Native `/client-architecture` is PM-owned. There is no Microsoft-blessed Rust equivalent of `vscode-languageclient` to wrap the desktop-client; official/community inventory is input, not a design owner. The baseline Rust stack is `lsp-types`, `tokio`, `serde_json`, `tokio-util`, `tokio-util::sync:'
- '- LSP never becomes the owner of Search, diff/review, or chat restore semantics'
- '- diagnostics feed editor markers and Problems, but Problems remains the owner of aggregated problem presentation'
- '- The FileManager editor-surface map is explicit for LSP consumers: `§10.1 Breadcrumbs / outline` owns the breadcrumb strip and outline, with LSP using `documentSymbol` and fallback using heuristic / regex outline; `§10.2 Go to symbol` owns command-palette and quick-open symbols, with LSP using `doc'
- '- Rewrite owner routing remains traceable before LSP consumers cite it: `Decision_Log`, `Decision_Log.md`, `Crosswalk.md`, and `/Crosswalk` provide the owner-traceability path for high-impact rewrite decisions, while LSPSupport records only how those decisions constrain language-intelligence consume'
- '- GUI `/placement` stays explicit: `/Problems` is the canonical multi-file diagnostics panel, the status-bar indicator owns current session/runtime health, and chat is a context/navigation consumer. Chat may show diagnostics summaries, `@ symbol` results, code-block hover, `/definition` and `/go-to-'
- 'Diagnostic-to-chat pipeline behavior is a context-packaging contract, not a second diagnostics owner. The `to-chat` payload uses the same diagnostic entry shape as §17.2 (`path`, `line`, `character`, `severity`, `message`, `source`, optional `code`) plus refs to the originating LSP session and URI; '
- This section defines the canonical contract for this surface.
- '- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope. The canonical tool surface is nine read-only operations plus one write/approval-gated `rename`; the packetization label `10 read-only + 1 write-gated (lsp_rename)` is reconciled here by tre'
- '- The LSP registry participates in the GUI Settings `/inspectors` pattern and the `two-level` Settings navigation model. Registry `/filtering` and `/filter/grouping` cover at least `/ecosystem`, language, source, requested state, effective state, support classification, and lifecycle state. Detail p'
- '- Search remains the owner of text search and replace-in-files'
- '- Problems remains the owner of aggregated diagnostics display'
- LSP sessions are keyed by `(host_id, server_id, root_identity)`. When a file belongs to a worktree rather than the main project root, the LSP root_identity MUST use the canonical on-host worktree path, not a raw path copied across hosts.
- '- Remote paths preserve the user-visible SSH authority: examples such as `user@host:/path/to/project` and `/path/to/project` describe the same remote project identity, not a local mirror. Remote LSP is MVP for remote edit intelligence and diagnostics, but remote run/debug remains outside FileManager'
- '- The canonical remote working-folder identity is `user@host:remote/path`; `remote-host`, `working-folder`, and path authority are part of the project/runtime identity. Puppet Master must not create a hidden local `/mirror`, must not silently retarget `/multi-context` work to the local host, and mus'
- '- `Settings > SSH` and GUI remote-editor surfaces expose remote capability, editor-state, and degraded copy, but they consume the SSH owner contract instead of redefining it. `file-editor`, FileManager, Terminal, Source Control, provider, `/debug`, and `/runtime` surfaces share the same `/read-only/'
- '- Diagnostics storage remains per `(server/session, uri)` and per `(session, uri)` and is merged only in presentation. Editor markers and `/gutter` are file-local projections; Problems owns `/merging`; Assistant/Interview and Search consume `/completion/definition/diagnostics`, `/symbols`, and statu'
- Canonical user/state names are `Starting`, `Initializing`, `Ready`, `RestartBackoff`, `Degraded`, `ShuttingDown`, and `Stopped`. Only `Ready` emits normal feature traffic; `Starting` and `Initializing` may queue sync work, `RestartBackoff` exposes countdown plus last error, and `Degraded` can mean p
owner_hints:
- Plans/LSPSupport.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

