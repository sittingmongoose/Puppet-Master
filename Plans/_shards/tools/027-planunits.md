# Shard 027: PlanUnits

Source: `Plans/Tools.md`

Source lines: L2252-L2527

Source SHA256: `ac31174ea0b530c0b68fb1114c81573d9a9c472889d41690c6487d387cb97b6c`

---

## PlanUnits

### T-001 - Adding Tool Support -- Research & Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: T-001
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Plans/Tools.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Tools.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Tools-S0113
preserved_exact_tokens:
- Adding Tool Support -- Research & Plan
- SSOT references (DRY)
- 1. Purpose and scope
- 1.1 GUI requirements
- 2. Permission model
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
- 2.1 Values and semantics (summary)
- 2.2 Config and precedence (summary)
- 2.3 Session vs run; subagents
- 'ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 2.4 Interaction with FileSafe
- 2.4.1 Central policy engine contract
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md'
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
- 2.4.2 Tool routing, blocked-packet, and audit carry-through
- 2.5 Cross-plan references
- 3. Built-in tools (target set)
- 3.1 Tool table
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md'
- 3.1A Debug-capable tool classification
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/newtools.md'
negative_constraints:
- Embedded document review is not a hidden tool mutation channel. The `embedded-document-pane` consumes the annotation and targeted revision contracts in `Plans/Crosswalk.md`, `Plans/FinalGUISpec.md`, and `Plans/assistant-chat-design.md`; Tools must not introduce direct `patch-apply` or `/suggested-ch
- Tool route activations are persistence-aware. A navigation to a historical-run result may update stored project-state such as `focused_run_id`, while hover previews, temporary comparisons, and transient pivots must not rewrite persistent view state.
- 'Tool and route audit records carry unresolved `exact_items` as explicit gap lineage until the owner docs close them. `gap-001` remains tied to the missing owner anchor `### 5.1B Persona/Runtime Snapshot Payload Contract`; `execution_unit_context` consumers must preserve `requested_account_binding`, '
- Tool export and side-effect records carry identity and trust detail rather than burying it in provider-specific payloads. Receipts, artifacts, and side-effect-bearing attempt/tool records include `/tool`, `operational_identity`, and `trust_state_at_export` when stale or `/degraded` projections affec
- 'Tool-facing widgets and command routing do not hide scope or identity mismatches. Progress and widget consumers distinguish page-global, app-global, project-scoped, and `/run-centric` layout/state before treating a view as authoritative. Catalog normalization treats missing `IDs` as structural, not '
- '- Ask/Plan presets must not carry inherited blanket-denies or a blanket-deny rule for `question`, `todowrite`, `todoread`, or the six web operation tools; the mode-dependent access matrix for plan-mode web tool access and Deep Plan mode availability must show these tools as available unless stricter'
- '- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.'
- '- For `webextract`, when both prompt and schema are provided, the prompt guides extraction and the schema validates output as a two-phase flow; schema validation must not silently rewrite the LLM prompt. With prompt only and no schema, free-form extraction is guided by prompt and output shape is pro'
- '- Operation-specific payload refs include `content_ref?` for fetched/extracted content, `map_ref?` for map output, and `answer_summary_ref?` for research summaries. `web_input` is the canonical structured routing/audit input; `web_input_preview` is derived display text only and must not replace stru'
- '- Provider-doc volatility must not make the web tool contract brittle. Implementation-safe canon keeps the user-facing and tool-facing (`/tool-facing`) contract stable for `/web`, `search`, `extract`, `research`, `crawl`, `map`, `Searching Web`, `Extracting Site`, `Researching Web`, `Crawling Site`,'
- '- `webfetch` is one non-search web primitive among extract/research/crawl/map/read paths, so web notes must not treat it as the only non-search operation. Provenance display follows stronger-evidence precedence, and `/web` UI, `/help/autocomplete`, and slash-command surfaces expose operation support'
- '- **Correctness model:** The index is only a candidate reducer. Final results always come from ripgrep verification on authoritative file content. Hash collisions, stale base snapshots, and broad dirty-layer candidate inclusion may increase candidate count, but MUST NOT change final correctness.'
- '- **Byte-level operation rule:** N-gram extraction and frequency counting operate on raw bytes. Implementers MUST NOT decode content to Unicode at any point in the indexing or query pipeline. ASCII-only lowercasing (`u8::to_ascii_lowercase()`, loop shorthand `u8::to_ascii_lowercase();`) is the only '
- '- **Errors:** structured failures include `invalid_source`, `permission_denied`, `filesafe_blocked`, `repo_too_large`, `clone_failed`, `auth_required`, `destination_exists`, and `network_unavailable`; failed imports must not leave a half-registered project/workspace root.'
- '- inherit the parent permission ceiling, write scope, requested/effective runtime and account restrictions, and remaining budget as hard upper bounds; the child MAY narrow them further but MUST NOT widen them.'
- '- a non-Copilot parent must not route into Copilot-native subagent semantics.'
- The `task` tool must not treat command subtasks, interview children, crew members, or orchestrator children as different runtime classes. They all enter the same canonical child-run model.
- '- delegated runs must not create a second mutation-capable investigation against the same project/worktree unless a higher-level owner flow explicitly isolates the work in another worktree or host context'
- '- GitHub CLI (`gh`) is forbidden for auth/status/repo/fork/PR operations (see Spec_Lock.json#github_operations).'
- '- slash-separated aliases are not canonical and must not remain live examples'
- Child-run tool dispatch inherits the parent run's tool policy, deadline, and MCP effective-availability snapshot unless the run envelope carries an explicit narrower override. The child tool set is resolved from the central tool registry plus effective MCP-discovered tools before policy filtering, s
- 'Tool dispatch consumes MCP-owned schema/OAuth facts without re-owning them. The `/OAuth/timeout` contract is: OAuth-required tool calls must fail fast with structured auth or timeout evidence when the MCP owner reports expired auth, missing client registration, callback/listener failure, or exhauste'
- OAuth callback listeners MUST use the configured loopback `bind-address` / `bind-host` from the auth owner contract; wildcard, public-interface, or tool-invented callback binds are callback/listener failures and must not silently widen the listener.
- '- invalid arguments MUST produce a structured tool result with `is_error=true`; PM MUST NOT execute the tool and then "best effort" repair the failure afterwards'
compatibility_only_notes:
- 'Tool/runtime recovery evidence is `node-native`: blocked episodes, `/evidence/runtime`, and tool-facing usage/evidence/runtime rollups align to graph `/node/package/seam/lane` identity. Any `tier-native` or `tier-aligned` fields survive only as compatibility/grouping projections, never as execution '
- '| **lsp** | **Promoted to MVP** (no longer experimental/feature-flagged). Agents can invoke the canonical read/navigation operation set: `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, `prepareCallHierarchy`, `incomingCalls`, and `outgoingCalls'
- 'Canonical operation inventory: the packetization summary phrase `10 read-only + 1 write-gated (lsp_rename)` reconciles to the live Part M operation set as nine read-only operations plus one approval-gated `rename` operation. `lsp_rename` is a legacy/source alias for canonical `rename` / `lsp.rename`'
- Short LSP lookup names `definition`, `references`, and `implementation` are compatibility aliases for `goToDefinition`, `findReferences`, and `goToImplementation`; the canonical operation names remain the long-form LSP actions above.
- '- `questionnaire` and `/questionnaire` mode use `options?: Array<{id, label, description?}>` for selectable answers; `string[]` options are backwards-compatible only for legacy `single_question` callers and must be normalized to object-array options before storage or multi-question rendering.'
- '- The v1 input envelope accepts `mode?: "single_question" | "questionnaire"`, `header?`, `prompt?`, `placeholder?`, `questions: Array<QuestionItem>`, `allow_other?: boolean` as a legacy alias for `allow_freeform`, and `allow_multi_select?: boolean` as a legacy alias for `multi_select`; each `Questio'
- '- Legacy `string-answer` and `answer: string` callers are compatibility-only; the already-decided canonical path is the multi-question envelope. Source shorthand `questions: [...]` is normalized to `questions: Array<QuestionItem>` before validation or question-card rendering.'
- '- Compatibility shorthand for source and adapter callers is `mode|header|prompt|questions[]`; the canonical item shape is `QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values}`.'
- '- `prompt` is envelope/header-only compatibility text; it is not the per-question field name, and each `QuestionItem` uses canonical `question` for the displayed prompt.'
- '- Clarification-request and question-resolution surfaces, including chain-wizard and progression gates, use the same question-flow rather than a parallel prompt format. Legacy single-question callers remain single-item syntactic sugar over `mode: "single_question" | "questionnaire"` with `header?`, '
- '- Minimal canonical input shapes are stable across adapters: `websearch` accepts `query: string`, `max_results?: number`, compatibility `limit?: number` for source-specific search-result caps, `adapter_hint?: string`, `sources?: ("web" | "news" | "images" | "code" | "academic")[]`, `categories?: ("g'
- '- `webfetch` accepts `formats?: Array<"markdown" | "html" | "rawHtml" | "screenshot" | "pdf" | "summary" | "links" | "images">` with default `["markdown"]`; provider slash shorthand such as `/html/rawHtml/screenshot/pdf/summary/links/images` and legacy `/PDF/summary` wording normalize to this typed '
- '- `webcrawl` accepts compatibility `formats?: string[]` with default `["markdown"]`; the same options as `webfetch` apply to each crawled page and normalize into the typed `formats` enum before dispatch.'
- '- Firecrawl `scrapeOptions.depth` is not a canonical PM mapping. The legacy `detail_hint -> scrapeOptions depth` / `detail_hint → scrapeOptions depth` mapping is explicitly removed as unconfirmed; `detail_hint` remains PM advisory input for provider/API-side extraction or PM-composed extraction unle'
- '- Operation-specific payload refs include `content_ref?` for fetched/extracted content, `map_ref?` for map output, and `answer_summary_ref?` for research summaries. `web_input` is the canonical structured routing/audit input; `web_input_preview` is derived display text only and must not replace stru'
- 'Site Reader is the default structured-reader engine for web-reading behind `Reading Site` / `webfetch`; plain `/raw` fetch is fallback behavior when the structured reader cannot produce a usable result. The structured-reader subsystem (`/subsystem`) is token-efficient and token-budgeted: it prefers '
- '- **External contract:** Same compatibility signature `{ pattern: string, path?: string, glob?: string }`, same `matches: Array<{ path, line_number, line }>` result shape for content-mode callers, same project scoping, same result limit (1000), same timeout (30s), and same read-only permission postu'
- '- Task I/O is resume-aware: resumes reuse the stable delegated session, surface `resumed: boolean` only as provider-facing compatibility metadata, and normalize returned text/artifacts back into PM''s canonical child-run result shape.'
- '- provider-facing compatibility output may expose `task_id`, `subagent_type`, `resumed: boolean`, `result_text`, and `runtime_snapshot?`, but PM normalizes those values back to the canonical child-run identity and user-facing result shape'
- 4. Apply provider-specific argument normalizers where the tool surface explicitly allows them, including concrete compatibility fixes such as GLM quoted-JSON unquoting and Qwen XML-wrapper stripping before schema validation.
- '- **Runtime identity alignment:** Blocked episodes and tool/runtime recovery evidence are `node-native`; tool-facing `usage/evidence/runtime` rollups MUST NOT remain `tier-native` execution authority. Consumers align those rollups to graph `/node/package/seam/lane` identity, and any `tier-aligned` o'
- For backward compatibility, the merged permission set is also projected to redb as `tool_permissions` in `config:v1`.
- '- `webmap` accepts `use_sitemap?: "include" | "only" | "skip"` with default `"include"`; the legacy shorthand `include|only|skip` maps to this enum.'
- '- Firecrawl change tracking maps PM `change_tracking: true` to a `formats` entry `{type:"changeTracking"}` where the provider route supports it. Legacy `cache_ttl` normalizes to `cache_policy.max_age_seconds`; PM exposes seconds while the Firecrawl adapter converts to provider `maxAge` milliseconds.'
stale_retired_dispositions:
- 'Tool and route audit records carry unresolved `exact_items` as explicit gap lineage until the owner docs close them. `gap-001` remains tied to the missing owner anchor `### 5.1B Persona/Runtime Snapshot Payload Contract`; `execution_unit_context` consumers must preserve `requested_account_binding`, '
- Blocked-packet consumers in Tools preserve `gap-005`, `/receipt/blocked/usage`, `blocked-attempt`, `blocked_notice`, `blocked-episode`, `/notification`, `report_ref`, `startup_recovered`, `escalation_level`, and `action_available` when a tool or route result exposes blocked runtime state. Runtime re
- Validation and project-state consumers keep the `validation-pass-report` lineage explicit without reviving the stale ask tuple `{ tool_name, invocation_summary, options }` as a canonical request shape. `gap-004`, `self-verdict`, `requirements_quality_report_ref`, `Plans/Project_Output_Artifacts.md`,
- Tool export and side-effect records carry identity and trust detail rather than burying it in provider-specific payloads. Receipts, artifacts, and side-effect-bearing attempt/tool records include `/tool`, `operational_identity`, and `trust_state_at_export` when stale or `/degraded` projections affec
- Runtime-governance tool policy keeps `DAE`, `/restart`, run-level strategy, attempt-level account `re-resolution`, `blocked_owner`, blocked-governance, `/governance`, account-aware ordering, and `pre-dispatch` interception visible before remote side-effect approval is enforced. Seams rollups may rem
- '| **grep** | Search file contents with regex; file pattern filtering. Transparently accelerated by the per-project sparse-n-gram index when available; the same backend also serves Search-panel regex mode | `grep` | Same limits and permission posture as existing grep. Respect .gitignore unless .ignor'
- '- when a debug-capable tool''s linked runtime identity is stale but recoverable, tool execution must enter `attention_required` with `attention_required_reason_code = session_reconnect_required` instead of silently resuming against stale sessions'
- '- Research sessions use a research-session action subset and may use read-only `automation_session` actions for web research: `navigate` navigates to a URL for reading; `back` returns to the previous page; `reload` refreshes a stale page; `snapshot` captures structured page state for extraction; `sc'
- '- Multiple extraction `formats` may be requested together. `screenshot` and `pdf` formats require browser runtime; when that runtime is unavailable, return a `capability_unavailable` warning rather than an error. `export_pdf` is retired as a browser/trace action for research access; callers request '
- '- Firecrawl PDF processing does not make `LlamaParse` PM canon. The source claim that Firecrawl uses `LlamaParse` for PDF handling is intentionally retired as unconfirmed; PM-owned PDF behavior stays on `pdf_mode?: "fast" | "auto" | "ocr"` and platform OCR / fallback text extraction.'
- 'Plans/Tools.md (`/Tools.md`) owns `grep` /fallback semantics, `/sparse-n-gram` index-acceleration behavior, tool-event field disclosure, filtering, and /degradation language: acceleration may narrow candidates, but raw ripgrep remains the visible fallback when the index is unavailable, disabled, inv'
- '- **Correctness model:** The index is only a candidate reducer. Final results always come from ripgrep verification on authoritative file content. Hash collisions, stale base snapshots, and broad dirty-layer candidate inclusion may increase candidate count, but MUST NOT change final correctness.'
- '- **Freshness model:** PM-mediated writes update the dirty layer synchronously before returning success. Dirty entries are generation-aware path records, not a second canonical search index. All dirty paths are unconditionally included in candidate verification, and deleted dirty paths suppress stal'
- '- **Stale-index rule:** There is no stale-threshold cutoff and no commit-count-based fallback threshold. When an index snapshot exists, it remains queryable while background refresh or re-anchor work runs; dirty-layer state tracks `SHA` / `HEAD` movement through re-anchor instead of making commit co'
- '- slash variants and mixed `_` / `/` examples are retired'
- '- PM emits a structured diagnostic containing `server_id`, `reason`, `last_healthy_at`, and whether a stale list is still available.'
- 14. **Addenda consolidation gate** -- Run the `FinalGUISpec` (22), `orchestrator-subagent-integration` (8), and `feature-list` (13) addenda through a `merge-and-dedup` owner pass so body-owned content lands in canonical sections and retired residue is not preserved as live implementation text.
- Tool-originated blocked payloads use `allowed_action_ids[]` only. Deprecated names MUST NOT appear in new tool contracts.
- 'Packet regeneration treats `## 10` as one coherent owner-section replacement unit: do not preserve a stale parent `## 10` owner body beside newer child `### 10.3` or `### 10.7` replacements for the same Firecrawl subtree.'
- 'Drift guard for `Plans/Tools.md#10 Firecrawl provider integration`: this section is the single owner-level Firecrawl subtree; packet repair must collapse two incompatible owner-level truths into the current provider capability/routing canon instead of keeping stale parent and child bodies as peer ca'
- '- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale '
- '- Firecrawl search does not map PM `include_domains` to `scrapeOptions.includeTags`; that source mapping is intentionally retired as unconfirmed. If the effective Firecrawl search route cannot enforce `include_domains` natively, PM applies the domain filter post-search before candidate-source select'
- '- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.'
- '- Legacy Firecrawl/browser `stealth` configuration is retired for PM web tools. `stealth` is not exposed as a PM tool input, not stored as provider routing policy, and not accepted as canonical Firecrawl configuration; adapter-internal provider behavior may surface only through capability disclosure'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '**Scope:** This document lives in `Plans/` only. It is the **canonical plan for tool support**: built-in tools, custom tools, **MCP** (integration with the registry and permission model), and the permission model (allow/deny/ask), aligned with [OpenCode''s Tools model](https://opencode.ai/docs/tools/'
- '## SSOT references (DRY)'
- '- Canonical contracts (events/tools/UI commands): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- **Permission system (allow/ask/deny semantics, precedence, granular rules, defaults):** `Plans/Permissions_System.md` (canonical SSOT)'
- '**Goal:** Define and configure the **tools** an LLM can use during runs (Assistant, Interview, Orchestrator). Tools let the agent perform actions in the codebase and environment. This doc is canonical for:'
- '- **Thin runtime tool contracts** -- This doc owns `question`, `todowrite`, `todoread`, `web*`, `skill`, `task`, and the richer `lsp` tool surface; chat-thread terminal/tool/search access resolves through these canonical tool/search (`/tool/search`) contracts rather than a parallel chat-thread-only '
- '> **SSOT:** The canonical specification for permission actions (`allow`/`ask`/`deny`), precedence layers, granular rules, wildcard syntax, special guards, ask-flow semantics, deterministic defaults, and resolution algorithm is **`Plans/Permissions_System.md`**. This section provides a summary for to'
- 'Canonical child-run identity fields:'
- 'Provider behavior may still differ. A canonical child run may map to:'
- Every agent-usable tool attempt MUST pass through one canonical policy engine that resolves permission, approval/HITL, FileSafe, execution, terminal binding when relevant, and result normalization.
- 'Canonical order:'
- '- `bash` and any canonical shell-backed execution path resolve through the terminal process-host contract when they create or bind shell state'
- '- non-interactive or hidden shell execution may suppress opening the terminal UI, but it still binds to canonical terminal-session state when execution actually occurs'
- 'Tool and route audit records carry unresolved `exact_items` as explicit gap lineage until the owner docs close them. `gap-001` remains tied to the missing owner anchor `### 5.1B Persona/Runtime Snapshot Payload Contract`; `execution_unit_context` consumers must preserve `requested_account_binding`, '
- Blocked-packet consumers in Tools preserve `gap-005`, `/receipt/blocked/usage`, `blocked-attempt`, `blocked_notice`, `blocked-episode`, `/notification`, `report_ref`, `startup_recovered`, `escalation_level`, and `action_available` when a tool or route result exposes blocked runtime state. Runtime re
- Validation and project-state consumers keep the `validation-pass-report` lineage explicit without reviving the stale ask tuple `{ tool_name, invocation_summary, options }` as a canonical request shape. `gap-004`, `self-verdict`, `requirements_quality_report_ref`, `Plans/Project_Output_Artifacts.md`,
- '| **Permissions_System.md** | Canonical SSOT for allow/ask/deny semantics, precedence, granular rules, defaults, resolution algorithm, GUI, and persistence. |'
- '| **assistant-chat-design.md** | YOLO/Regular (§3); canonical approval ladder alignment; bash audit trail and FileSafe. |'
- The following built-in tools are the **target set** for the central tool registry. Semantics align with [OpenCode's built-in tools](https://opencode.ai/docs/tools/#built-in). Mapping to each platform's native tools (Read/Edit/Bash, etc.) is a Provider/runner concern; the registry holds canonical nam
- 'OpenCode-compatible baseline evidence is adapter context, not a PM owner override: the registry includes `bash` and `grep`, permission outcomes stay `allow`, `ask`, and `deny`, plan agents ask before `bash` by default unless policy grants it, and IDE integration remains terminal-first (`opencode` sp'
- This `Plans/Tools.md` (`/Tools.md`) owner section classifies **debug-capable** tools as a cross-surface capability family rather than as an Assistant-only or chat-only silo.
- Providers map canonical tool names to platform-native equivalents (e.g. `edit` → Claude "Edit", Cursor edit tool, etc.). The registry and permission engine use **canonical names only**; platform_specs or runner code holds the mapping so that adding a new provider does not require changing permission
owner_hints:
- Plans/Tools.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

