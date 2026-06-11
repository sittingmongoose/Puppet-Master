# Shard 026: PlanUnits

Source: `Plans/newtools.md`

Source lines: L1312-L1511

Source SHA256: `6ad7f74869a13a075ad4cd56057aed261f7509b73c671bcf54251e32e787eed9`

---

## PlanUnits

### N2-001 - GUI Testing Tools & Framework Options -- Implementation Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: N2-001
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Plans/newtools.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/newtools.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- GUI Testing Tools & Framework Options -- Implementation Plan
- Plan Document Status
- Rewrite alignment (2026-02-21)
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
- Route, view-state, and automation-default alignment
- DRY Method Compliance
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- DRY Requirements
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/orchestrator-subagent-integration.md'
- Table of Contents
- 1. Executive Summary
- 2. Relationship to Other Plans
- 3. Problem Statement
- 4. Goals
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation'
- 'ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md'
- 5. Design Overview
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring'
- 6. Framework & Tool Discovery (DRY)
- 6.1 Single source of truth
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2, PolicyRule:no_secrets_in_storage'
- 6.2 Research as input only (no research-only outcome)
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
negative_constraints:
- Tooling summaries must not let shell view commands become target identity owners. `cmd.source_control.switch_subview` is a `/view-state` command for Source Control subview selection; repo, worktree, and `/worktree/compare` target identity stays in the route/open contract and its runtime object envel
- 'Research (Context7 MCP, web search) may be used to **inform** the catalog or the build plan, but MUST NOT be presented as a standalone research-only outcome. Options:'
- 'Implementation MUST NOT offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan. For unknown frameworks, the user still gets: catalog options (if research populated the catalog) and/or the option to plan/build the full-featured cu'
- '- Agent web-search expectations are search, then read top results before answering; PM must not degrade LLM/web-research flows into search-only or instant-answer behavior by default.'
- '- Building a custom headless GUI tool is a substantial task. The plan frames it as **full-featured** from the start (headless runner, action catalog, full evidence: timeline, summary, artifacts), using Puppet Master''s automation as the reference. Prefer adopting or wrapping an existing runner (e.g. '
- '- The plan says "Tasks in the PRD" for obtaining tools and building the custom headless tool. The PRD is produced by the **start_chain** (from requirements), not directly by the interview. Implementation MUST inject these tasks via one of: (1) acceptance criteria or new subtasks in the Testing phase'
- '- Secrets (tokens/passwords/API keys) MUST NOT be written to:'
- '- The catalog table suggests "detection hints (e.g. Cargo.toml crate name, package.json deps)." For Iced, Puppet Master''s in-repo headless runner lives in `src/automation/` and is not a crate name; detection may need to scan for `headless_runner` or automation modules, or for a known path. Implement'
- '`doctor.registry.auth` is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.'
- '- repository workflow files under `.github/workflows/` / `github/workflows/` are the runtime source of truth after preview `/save` or apply; `generated-workflow` and generated required-secrets `/configuration` lists are historical hints and must not override current repo `/worktree` workflow `YAML`,'
- '- Namespace/repository discovery and repository creation MUST use the validated effective capability set; the app MUST NOT assume browser login or PAT implies full management access.'
- '- Publish requires `doctor.dockerhub.auth.capability` and `doctor.dockerhub.repo.access`; publish MUST NOT fail solely because compose validation is irrelevant to the selected publish path.'
- '- Do not treat DockerHub as a storage location for Unraid XML.'
compatibility_only_notes:
- '- for this task, deliverables remain **Plans-folder documentation updates for the Slint rebuild**; no legacy Iced runtime wiring is required'
- '| electron  | Playwright (Electron support), Spectron legacy | No when Playwright used |'
- '- Legacy `#8.2 GUI/settings alignment` references normalize to this section, with owner-routing back to `Plans/Tools.md` for provider stack, Firecrawl, and web-routing canon.'
- '- Legacy cited-search references, including the heading alias `### 8.2.1 Cited-search and search-provider note`, the `§8.2.1 cited web search` shorthand, and the `cited web search contract`, resolve to this now-written Cited-search landing; these aliases are cross-reference compatibility only, not a'
- '- Legacy TOC and ENTIRELY MISSING audit wording resolves to this now-written landing; keep that phrase as retired gap history, not active product canon.'
- '- DuckDuckGo/DDG is not treated as a first-party-style full web-search provider unless an official/public full-search API is available; practical DDG wrappers or scraping-based adapters are fallback/compatibility options, not the primary provider contract.'
- '**Test strategy JSON schema and backward compatibility**'
- '- The consumer of test-strategy.json is `NodeTree::load_test_strategy` in `core/node_tree.rs` (schema: `Plans/test_strategy.schema.json`). Implementation MUST extend additively: allow new `testType` values (e.g. `headless_gui`, `framework_tool`) and, if structured tool metadata is needed, add option'
- '**Version compatibility and platform churn**'
- '**Backward compatibility for existing projects**'
- '- Existing projects with test-strategy.md / test-strategy.json generated before newtools MUST continue to work: the loader in `node_tree` and the prompt builder MUST tolerate missing `headless_gui` / `framework_tool` items and optional tool metadata. No migration of old files is required; new fields'
- '- Keep evidence schema compatibility (`manifest/timeline/media`) across automation backends.'
stale_retired_dispositions:
- '- auth policy remains subscription-first, with Gemini API key as the explicit `key-exception` where the selected provider entry supports it; stale-canon one-provider `mixed-account` Gemini wording is retired in favor of Gemini Direct (`gemini`, key-only/API-key-backed) and Gemini CLI (`gemini_cli`, '
- '- `/retire` for this consumer section means stale PM/OpenCode terminology residue is rewritten into PM-native web tool / MCP framing, with repaired owner references to `Plans/Tools.md` and `Plans/MCP_Integration.md`; OpenCode remains reference/provenance only.'
- '- Legacy TOC and ENTIRELY MISSING audit wording resolves to this now-written landing; keep that phrase as retired gap history, not active product canon.'
- '`doctor.registry.auth` is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.'
- '| `doctor.gui_tool_catalog.freshness` | framework tool catalog | Base catalog version plus overlay `last_updated` metadata are present and readable | Keep run usable, but warn that tool recommendations may be stale and show the recorded snapshot date |'
- '- `doctor.registry.auth` is deprecated for DockerHub-specific flows and MUST be treated as an alias of `doctor.dockerhub.auth.capability` only until old references are removed.'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- Open-resolution and route focus are GUI consumer behavior. `Project_Output_Artifacts`, `Project_Output_Artifacts.md`, Plans/Section15_MVP_Promoted_Features_Spec.md, /Section15_MVP_Promoted_Features_Spec.md, Plans/Tools.md, /Tools.md, Plans/newtools.md, /newtools.md, Plans/Orchestrator_Page.md, /Orch
- Automation defaults are automation-first. `regular`, `visual_mode`, `visual_mode = auto`, Run_Modes, Run_Modes.md, optional HITL, and manual confirmations must map into one coherent mode policy where local visual runs are allowed but do not defeat the automation-first posture or `/HTE-by-default` mi
- '- **All platforms:** MCP-backed tools MUST be supported and configurable for **all supported providers** (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). Canonical MCP configuration lives in Puppet Master; per-platform files are **derived adapters only** where a platform requires them'
- This section is a consumer guide only. `Plans/MCP_Integration.md` is the current MCP SSOT.
- '### 8.1 Owner document'
- '- naming, availability, credential binding, config schema, and supported flows defer to that owner'
- This GUI/settings alignment section mirrors the linked owner contract and stays aligned with it.
- '- Legacy `#8.2 GUI/settings alignment` references normalize to this section, with owner-routing back to `Plans/Tools.md` for provider stack, Firecrawl, and web-routing canon.'
- '- This section is the consumer-only GUI/settings alignment landing for `Plans/newtools.md` §8; provider-capability canon lives in Plans/Tools.md sections 11 and 12, while MCP canon lives in `Plans/MCP_Integration.md`.'
- '- `/retire` for this consumer section means stale PM/OpenCode terminology residue is rewritten into PM-native web tool / MCP framing, with repaired owner references to `Plans/Tools.md` and `Plans/MCP_Integration.md`; OpenCode remains reference/provenance only.'
- This cited-search and search-provider note is non-normative consumer guidance.
- '- The MCP SSOT cross-reference and research session variant cross-reference remain consumer pointers to their owners, not local `newtools.md` canon.'
- '- MCP/web-tooling (`/web-tooling`) guidance in this section is consumer alignment only; owner canon remains `Plans/Tools.md` and `Plans/MCP_Integration.md`.'
- '- this section is non-normative consumer guidance, not the owner landing for search-provider canon.'
- '- **Full evidence output:** After each run, the tool MUST produce the **same depth of debug information** as Puppet Master''s GUI automation: **Timeline** (e.g. `timeline.jsonl`), **Summary** (e.g. `summary.md`), **Artifacts** (screenshots or state dumps per step), and the canonical manifest describe'
- '- The consumer of test-strategy.json is `NodeTree::load_test_strategy` in `core/node_tree.rs` (schema: `Plans/test_strategy.schema.json`). Implementation MUST extend additively: allow new `testType` values (e.g. `headless_gui`, `framework_tool`) and, if structured tool metadata is needed, add option'
- '- Canonical JSON Schema lives in `Plans/test_strategy.schema.json` (`SchemaID:pm.test_strategy.schema.v1`).'
- '- crew findings must be persisted through canonical event/storage structures, not `.puppet-master/memory/*` files.'
- Tool-discovery lifecycle and quality features must align with canonical child-run, crew, and blocked-state behavior.
- '- use canonical blocked payload fields and runtime taxonomy.'
- '- use canonical child-run or crew events instead of active-agent side files.'
- '- continuity for tool-discovery workers comes from handoff bundles and canonical state, not child-memory files.'
- '- targeted reroute, replacement, or cancellation must preserve canonical lineage.'
owner_hints:
- Plans/newtools.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

