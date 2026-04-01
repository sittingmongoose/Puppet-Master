### TIER 11 — OTHER gaps
| # | Doc | Detail |
|---|-----|--------|
| 46 | (cross-doc) | No dedicated terminal SSOT document (split across Section15 + FinalGUISpec) |
| 47 | (cross-doc) | Terminal-specific Unicode/IME platform capability matrix not codified |
| 48 | (cross-doc) | Named terminal layout families (single, two_columns, etc.) not defined |
| 49 | Run_Modes.md / Prompt_Pipeline.md | Sensitivity-aware forwarding (part 7 of seven-part runtime contract) has no coverage |
| 50 | assistant-chat-design.md | Send-to-chat target routing algorithm not formalized |
| 51 | (cross-doc) | Remote degraded-state shared vocabulary not normalized (freshness × health × write-availability) |
| 52 | Progression_Gates.md | No package-complete or seam-complete gates defined |

### Previously identified (Phase 2A+2B) doc_intents-based gaps (31 MISSING + 20 PARTIAL + 4 STUB)
See Phase 2A+2B tallies above. Key items:
- storage-plan.md: 8 MISSING (container/docker/debug schemas)
- FinalGUISpec.md: 4 MISSING + 6 PARTIAL (agent config, views, chat panel)
- feature-list.md: 3 MISSING + 2 STUB (detailed feature paragraphs collapsed to bullets)
- Glossary.md: 3 MISSING (21 terms across 3 term groups)
- UI_Command_Catalog.md: 2 MISSING + 3 PARTIAL (command families)
- assistant-chat-design.md: 2 MISSING + 2 PARTIAL + 1 STUB (attachments, auto-retrieval, user actions)
- Tools.md: 1 STUB (skill tool contract empty)

### Cosmetic defects
- Plugins_System.md: duplicate section at L575-595
- Provider_Stream_Mapping.md: duplicate section at L343-361
- interview-subagent-integration.md: duplicate section at EOF
- Plugins_System.md: §9.3 misordered before §9.1/§9.2

## Candidate Fixes / Design Directions

### Strategy A — Tier→Node migration (items 1-9)
- orchestrator-subagent-integration.md: Full body rewrite required — promote addenda content into body, remove 424+ tier refs, rewrite execution model to node/package/lane/seam
- DELETE L6272-6660 (Autonomous QA Loop) entirely — incompatible with scheduler model
- Merge 4 near-identical addenda (L6961-7026) into single section
- Populate or delete empty `Tier-specific Persona defaults` header at L6683
- Other docs: targeted find/replace of tier_id → node_id, tier → node/package/lane with semantic review per instance
- Progression_Gates.md: define package-complete and seam-complete gates
- 00-plans-index.md: rename "Tiers" tab to "Seams"

### Strategy B — Chat UX controls (items 10-15)
- Write a `### Composer Behavior` subsection in assistant-chat-design.md with: send→stop morph, per-message stop, jump-to-bottom badge, always-visible copy, no-delete rule
- Cross-reference from FinalGUISpec.md §7.16 chat panel section
- Add `debug` to mode-overlay closed enum at L1966
- Collapse 4 blocked-state addenda (L2056-2184) into single "Unified" section
- Replace stale recovery action names with canonical `allowed_action_id` values
- Fill phantom §6 (Teach) and §7 (Attachments) or remove from TOC
- Define message taxonomy enum
- Add chat lifecycle state machine

### Strategy C — Tools/Permissions (items 16-21)
- Fill §3.5 per-tool contracts with I/O schema for bash, edit, read, grep, glob, create
- Fill §3.6 task tool with input schema, 42 subagent type enum, dispatch contract
- Fill §3.5A skill tool runtime contract with: input schema, capability_check, sandboxing, output contract, error semantics
- Add task_id field docs to task tool
- Fix plan mode preset contradiction (allow web tools or document why they're denied)
- Add durable-approval path in Permissions_System.md (AC-PM06 extension)
- Add web-op pattern derivation rules
- Add package/seam/lane permission scopes
- Write composition spec for the two permission algorithms (§2.4 vs §8)
- Add security/sandboxing section with threat model and trust boundaries

### Strategy D — Debug Mode (items 22-24)
- Add investigation_id + instrumentation schema to storage-plan.md
- Add investigation_id to Executor_Protocol execution context
- Add Debug Mode dispatch references to Commands_System.md
- Route debug mode through Crosswalk.md §3.8+

### Strategy E — UI_Command_Catalog (items 25-29)
- Add 5 missing command families: cmd.actions.*, cmd.docker.*, cmd.k8s.*, cmd.git.worktree.*, expanded cmd.source_control.*
- Source from Containers_Registry_and_Unraid.md, GitHub_Integration.md, WorktreeGitImprovement.md

### Strategy F — Storage schema (items 30-32)
- Add GHA panel state keys, web-operation payload fields, receipt-extension schemas
- DEFINE seglog wire format in §2.2 (currently zero concrete format)
- Resolve `attempt_record` key component count (4 vs 3)
- Resolve `blocked_projection` 3-way key shape conflict
- Resolve counter semantics conflict (L820 formula vs L941-944 sub-counters)
- Fill §5.1-5.4 stubs (editor recovery, requested/effective state, search/SC projection, LSP persistence)
- Reconcile terminal key references between storage-plan (7 keys) and FinalGUISpec §15.1 (1 key)

### Strategy G — FinalGUISpec (items 33-36)
- Normalize Docker naming to "Docker Manager" throughout (fix §7.4.8A "Docker Manage")
- Move Docker Manage addendum OUT of Persona §17 to proper location
- Renumber duplicate §17 — Persona Editor should be §19 or higher
- Collapse 6 blocked/recovery addenda into single section (keep L2050-2067 version with priority ordering)
- Add Agent-Config panel spec
- Add shared instruction pane description
- Create or stub the dangling §7.x sections (§7.16, §7.18, §7.19, §7.20)
- Either fill §8/§9/§10 or remove from TOC
- Reconcile §15.1 redb keys with storage-plan §2.3 (add 30+ missing keys or make §15.1 explicit subset reference)
- Fix Startup Restore to use migrated `widget_layout:v1:dashboard` key instead of deprecated `dashboard_layout:v1`
- Define or remove phantom `terminal_state:v1` key
- Add remaining settings tabs (21+ missing)
- Add remaining side-panel specs (3+ missing)

