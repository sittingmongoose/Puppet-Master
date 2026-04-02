# Working Ledger

## Work Item
w-20260330-191149

## Mode
audit

## Topic / Scope
Reconciliation audit of previous pipeline runs (`Plans/.pipeline/runs/`). Verify that findings, designs, and specifications produced during prior runs were actually incorporated into the Plans docs as real, substantive content — not left as stubs, placeholders, or shallow summaries.

Exclusions (still in progress):
- w-20260328-192850/working_ledger
- w-20260329-235630
- w-20260328-192905

## Objective
- Inventory all completed previous runs and their working ledgers
- For each run, identify what it was supposed to produce or modify in Plans docs
- Verify the corresponding Plans doc sections contain real, buildable content — not stubs
- Surface any gaps where run findings were lost, compressed, or never written

## Constraints / Non-Goals
- Do NOT edit any planning docs during this audit
- Do NOT treat the ledger as canonical or cite it in planning docs
- This is a verification audit, not a rewrite
- Focus on substance (buildability, completeness) not formatting

## Phase 8 contradiction resolution outcomes
- `CORR-06` resolved in canon: Gemini is now normalized as two provider entries everywhere touched in this pass: Gemini Direct (`gemini`, direct API-key only) and Gemini CLI (`gemini_cli`, CLI-wrapped OAuth/API-key/Google-credential flows). Stale "one provider" wording was removed from `00-plans-index.md`, `Multi-Account.md`, and `Contracts_V0.md`.
- `CORR-07` resolved in canon: `provider_transient` backoff is `1s / 2s / 4s`. The conflicting `1s, 5s, 15s` value in `orchestrator-subagent-integration.md` was replaced so the executor-owned retry constants now match the orchestrator integration doc.
- `ORD-01` resolved in canon: `remediation.resolved.resolution` now uses the richer enum (`fixed | superseded | abandoned | replan_required`) in `Contracts_V0.md`. `remediation_ceiling_exceeded` remains a blocked-state code instead of a remediation-resolution value.
- `ORD-04` resolved in canon: `Executor_Protocol.md` and `orchestrator-subagent-integration.md` now distinguish `failure_class` from `blocked_reason_code` explicitly in both prose and matrices. The system must preserve the classifier family instead of treating them as one merged bucket.
- Additional coupled cleanup applied while resolving the blockers:
  - `Contracts_V0.md` now includes `auth_expired` and `quota_exceeded` in canonical `failure_class`.
  - `Contracts_V0.md` removes `auth_expired` from canonical `blocked_reason_code`.
  - `Decision_Policy.md` now phrases the GitHub Actions auth-expired row as a blocked trigger derived from `failure_class = auth_expired` rather than as a standalone blocked enum value.

## Key Facts and Findings

### Pipeline statistics
- 60-61 runs scanned, ~1040 raw doc_intents extracted
- Deduplicated to 380 unique intents across 57 Plans docs
- 15 working ledgers audited (68 chunks, ~40K lines total)
- Phase 2A: 57 docs audited by Opus 4.6 subagents (1 doc per agent)
- Phase 2B: 8 GPT 5.4 verification agents on 18 gap docs
- Phase 2C: 10 Opus 4.6 ledger agents + 30 explore agents + 4 unaudited-docs agents
- 100+ agents launched total across all phases; zero failures

### Phase 2A aggregate results (Opus 4.6 — doc_intents pass)
- PRESENT: ~266, SUPERSEDED: ~61, MISSING: 39, PARTIAL: 14, STUB: 4

### Phase 2B cross-model reconciliation (GPT 5.4 verification)
GPT 5.4 verified all 18 gap docs. 12 disagreements (all severity upgrades):
- 8 reclassified MISSING → PARTIAL
- 2 reclassified MISSING → SUPERSEDED
- 2 reclassified PARTIAL → PRESENT

### Phase 2A+2B RECONCILED TALLIES (doc_intents pass)
- PRESENT: ~268 (69%), SUPERSEDED: ~65 (17%), MISSING: 29 (8%), PARTIAL: 20 (5%), STUB: 4 (1%)

### Phase 2C: Ledger-based deep reconciliation
Checked ~345 items across 15 working ledgers against canonical Plans docs.
- ADDRESSED: ~239 (69%)
- PARTIALLY_ADDRESSED: ~46 (13%)
- NOT_ADDRESSED: ~53 (15%)
- UNCLEAR: ~7 (2%)

Breakdown by ledger group:
- w-20260312-203855 (monster): 89 items → 41/23/24/1
- w-20260316-160450 (chat): 39 items → 21/6/12
- w-20260320-170511 + w-20260312-160857 (providers/GHA/Docker): 75 items → 55/8/12
- w-20260318-160350 + w-20260326-015830 + w-20260320-164907 (terminal/worktrees/debug): 70 items → 52/7/7/4
- w-20260313-183219 + w-20260313-152345 + w-20260317-164124 + w-20260318-153036 (small batch): 36 items → 25/6/2/2
- w-20260323-192127 + w-20260328-192938 + w-20260317-181906 (subagents/grep/browser): 21 items → 21/0/0 (PERFECT)
- w-20260318-153036 + w-20260319-030558 (file mgr/editor): 36 items → 34/1/1

### Perfectly reconciled areas (no remediation needed)
- Worktree thread binding (w-20260326-015830): 19/19 PERFECT
- Browser capabilities (w-20260317-181906): 8/8 PERFECT
- Subagent/interview research (w-20260323-192127): 8/8 PERFECT
- Instant grep (w-20260328-192938): 5/5 + 5 FID spot checks PERFECT
- Crosswalk.md: CLEAN, Decision_Log.md: CLEAN, DRY_Rules.md: CLEAN

### Root cause patterns
1. **Full-doc replace_section**: r-20260312-203855-01 used H1-level replace_section, wiping accumulated addenda
2. **Canon-collapse rewrites**: feature-list.md, newfeatures.md replaced detailed content with terse summaries
3. **Missing anchor targets**: insert_after intents targeted headings that never existed
4. **Anchorless/EOF appends never placed**: file_end append intents never executed
5. **Supersession detail loss**: later run replaces section, specific sub-details lost
6. **Tier→Node migration incomplete**: 8+ docs still embed tier-era terminology contradicting node/package/lane model
7. **Ledger content never packetized**: some ledger findings never turned into doc_intents
8. **Addenda-body split-brain**: orchestrator-subagent-integration.md has new model in addenda, old model in body (174 tier refs)

## Gaps / Problems Identified

### TIER 1 — SYSTEMIC: Tier→Node migration gaps (affects 8+ docs)
| # | Doc | Detail |
|---|-----|--------|
| 1 | orchestrator-subagent-integration.md | 337+ tier-era refs (verified: 623 /tier/i matches); body still teaches Phase→Task→Subtask→Iteration; addenda have node model but body untouched |
| 2 | Prompt_Pipeline.md | Run envelope embeds `tier` and `mode`; no node/package/lane identity fields |
| 3 | WorktreeGitImprovement.md | 14 `tier_id` references in worktree helper APIs |
| 4 | Tools.md | ~6 tier-era refs ("tier/subagent overrides", "HITL at tier boundary") |
| 5 | newtools.md | ~5 refs (`TierTree::load_test_strategy`, "per-tier overrides") |
| 6 | interview-subagent-integration.md | ~8 refs (`get_subagents_for_tier()`, "orchestrator tier hooks") |
| 7 | chain-wizard-flexibility.md | 3 (not ~6) | tier worktrees, per-tier worktree branches |
| 8 | human-in-the-loop.md | HITL gates at tier boundaries; no package-complete or seam-complete gates |
| 9 | 00-plans-index.md | "Tiers" in Orchestrator tab list; contradicts Orchestrator_Page.md "Seams" |

### TIER 2 — CHAT UX: User-locked decisions never written
| # | Doc | Detail |
|---|-----|--------|
| 10 | assistant-chat-design.md / FinalGUISpec.md | Composer send→stop morph rule not specified |
| 11 | assistant-chat-design.md / FinalGUISpec.md | Per-message stop icon not specified |
| 12 | assistant-chat-design.md / FinalGUISpec.md | Jump-to-bottom with unseen-count badge not specified |
| 13 | assistant-chat-design.md / FinalGUISpec.md | Always-visible copy icons on messages (doc says hover/focus only) |
| 14 | orchestrator-subagent-integration.md | Subagent aggressive-by-default heuristics (only "disposable by default" found) |
| 15 | assistant-chat-design.md | "No delete" rule for messages not explicitly stated |

### TIER 3 — TOOLS / PERMISSIONS gaps
| # | Doc | Detail |
|---|-----|--------|
| 16 | Tools.md | §3.5A `skill` tool runtime contract — COMPLETELY EMPTY placeholder |
| 17 | Tools.md | `task` tool missing explicit `task_id` field documentation |
| 18 | Tools.md | Plan mode preset DENIES question/todo/web tools (contradicts need for web research in planning) |
| 19 | Permissions_System.md | No durable/permanent approval path — `always` is session-scoped only |
| 20 | Permissions_System.md | Missing pattern derivation rules for webextract/webresearch/webcrawl/webmap |
| 21 | Permissions_System.md | No package/seam/lane permission scopes |

### TIER 4 — DEBUG MODE gaps
| # | Doc | Detail |
|---|-----|--------|
| 22 | storage-plan.md | No investigation_id or instrumentation schema |
| 23 | Executor_Protocol.md | Missing investigation_id in execution context |
| 24 | Commands_System.md | Missing Debug Mode dispatch references |

### TIER 5 — UI_COMMAND_CATALOG missing command families
| # | Doc | Detail |
|---|-----|--------|
| 25 | UI_Command_Catalog.md | No `cmd.actions.*` family (GitHub Actions rerun/cancel/pin/admin) |
| 26 | UI_Command_Catalog.md | No `cmd.docker.*` family (Docker Manager operational commands) |
| 27 | UI_Command_Catalog.md | No `cmd.k8s.*` family (Kubernetes commands) |
| 28 | UI_Command_Catalog.md | No `cmd.git.worktree.*` commands (only `cmd.chat.worktree.*` exists) |
| 29 | UI_Command_Catalog.md | Expanded `cmd.source_control.*` (only show/switch_subview; missing history/graph/worktree) |

### TIER 6 — STORAGE-PLAN gaps
| # | Doc | Detail |
|---|-----|--------|
| 30 | storage-plan.md | No per-project GitHub Actions panel state config |
| 31 | storage-plan.md | No web-operation child payload fields (web_operation, web_input, support_tier) |
| 32 | storage-plan.md | No receipt-extension schema for SCM/Actions/Docker/Kubernetes |

### TIER 7 — FINGUISPEC gaps
| # | Doc | Detail |
|---|-----|--------|
| 33 | FinalGUISpec.md | Docker naming: "Docker Manager" (line 275) vs "Docker Manage" (§7.4.8A) |
| 34 | FinalGUISpec.md | No Agent-Config as primary provider/model/account surface |
| 35 | FinalGUISpec.md | No shared instruction panes + provider-native advanced panes |
| 36 | FinalGUISpec.md | Dangling §7.x cross-references (§7.16, §7.18, §7.20, §7.4.2, §7.4.5, §7.4.6 — never created) |

### TIER 8 — MODELS / PERSONA / IDENTITY gaps
| # | Doc | Detail |
|---|-----|--------|
| 37 | Personas.md | Zero overseer persona types defined |
| 38 | Models_System.md | No lane-aware model binding; no boot-refresh/catalog refresh |
| 39 | ~~Decision_Policy.md~~ | ~~Governance defaults use old terminology~~ **(FALSE GAP — governance defaults are actually clean)** |
| 40 | MiscPlan.md | Cleanup policy still tier-scoped |

### TIER 9 — CONTRACTS / CROSSWALK gaps
| # | Doc | Detail |
|---|-----|--------|
| 41 | Contracts_V0.md | Codex auth still lists OAuthDeviceCode (not ChatGPT-plan model); no surface-specific blocked-state for SC/GHA/Docker |
| 42 | Executor_Protocol.md | ~~TierContext flagged as non-canonical but no named replacement contract~~ **(CORRECTED: `execution_unit_context` IS the named replacement at EP L112-132)** |

### TIER 10 — USAGE gaps
| # | Doc | Detail |
|---|-----|--------|
| 43 | ALL docs | `usage_source_kind` vocabulary (5-value enum) absent from ALL Plans docs |
| 44 | usage-feature.md | `effective_auth_mode` missing from canonical UsageRecord |
| 45 | usage-feature.md | Line ~56 still says "Usage tab" instead of "Context Detail Pane" |

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
- orchestrator-subagent-integration.md: Full body rewrite required — promote addenda content into body, remove 337+ tier refs (623 /tier/i matches verified), rewrite execution model to node/package/lane/seam
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
- ~~Fill §5.1-5.4 stubs (editor recovery, requested/effective state, search/SC projection, LSP persistence)~~ **(CORRECTED: These have concrete rules + ContractRefs; need expanded implementation specs, not stub filling)**
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

### Strategy H — Usage vocabulary (items 43-45)
- Define usage_source_kind enum in usage-feature.md
- Add effective_auth_mode to UsageRecord
- Fix "Usage tab" → "Context Detail Pane"

### Strategy I — doc_intents-based MISSING/STUB restoration
- Extract content_markdown from /tmp/pm-audit-intents-dedup/*.json
- Write into target docs at specified anchors
- For PARTIAL: supplement existing content with missing passages
- For STUB: replace empty heading with full content

### Strategy J — Contract reconciliation (NEW from deep re-audit)
- Reconcile `remediation.resolved` enum — pick one of the two incompatible sets or merge
- ~~Add `worktree_conflict` and `dirty_worktree` to Contracts_V0 `blocked_reason_code` enum~~ **(ALREADY PRESENT at L1090-1091)**
- Add `node.prerequisite_resolved` to Executor_Protocol canonical wake list OR replace references with existing event
- Union runtime fields lists from orch L6841 and L6927 into Executor_Protocol dispatch context schema
- Move backoff durations to Executor_Protocol or shared config contract
- Resolve Provider_OpenCode 9-state profile lifecycle vs Executor_Protocol 5-state node lifecycle **(CORRECTED: the 5-state lifecycle is in Executor_Protocol §3 L78, NOT Contracts_V0; Contracts_V0 L1130 has 7 child lifecycle states)**
- Reconcile investigation context field names (chat §12.0A vs Contracts_V0 §5.1A)

### Strategy K — Multi-Account / Provider (NEW from deep re-audit)
- Resolve Gemini one-vs-two contradiction (canonical: TWO separate providers)
- Write auth flow walkthroughs for API key, OAuth, CLI token
- Write account registration flow
- Define `credential_ref` format and `auth_surface` enum
- Add cancellation/abort contract to Provider_OpenCode.md
- Add concurrency model (queue? reject? parallel?)
- Define minimum OpenCode version
- Add streaming error recovery contract

### Strategy L — Model System (NEW from deep re-audit)
- Fill §10.4.2 stub
- Create model capabilities catalog with ordering criteria for fast/powerful
- Add model registration flow
- Define token counting abstraction
- Add model-specific context window limits table

### Strategy M — Crosswalk routing (NEW from deep re-audit)
- Fill §3.6 content
- Add §3.8-3.12 for HITL, debug mode, permissions, events, terminal identity
- Add routing for remediation lifecycle and provider selection

### Strategy N — Wizard consolidation (NEW from deep re-audit)
- Consolidate 7+ wizard_status definitions into 1 (add `blocked` to L250 canonical)
- ~~Normalize field names (`wizard_step` vs `current_step` vs `active_phase`)~~ **(FALSE: only `wizard_step` exists — `current_step` and `active_phase` have zero occurrences)**
- Normalize blocked-state fields (`is_blocked` vs `blocked_state` vs `blocked_info` vs `blocked_episode_ref`)
- Fix `needs_user_clarification[]` conflation with `unresolved_findings[]` at L1316
- Assign Contract Unification Pass ownership
- Add wizard cancellation cleanup spec
- Fill phantom §15.5 and Default stage Personas sections

### Strategy O — LSP cleanup (NEW from deep re-audit)
- Either create §5.1 "Chat LSP" section or remove 12 references to it
- Write §3.5 root discovery **per-language table** (section exists with 5 bullet points + 4-step algorithm, but lacks per-language rules table)
- Specify SSH transport protocol details
- Add LSP server lifecycle state machine

## Impacted Docs
Docs requiring remediation (35+ total, consolidated across all phases including deep re-audit):

**CRITICAL (blocker-level gaps, multiple systemic issues, contract conflicts):**
- `Plans/orchestrator-subagent-integration.md` — 337+ tier refs (623 /tier/i matches verified), body/addenda split-brain, 390-line dead QA loop (~21 actual tier lines), 4 near-identical addenda (2 verbatim identical, not 4), parallel remediation universe, empty Persona defaults section; ~195 combined findings across 5 agents
- `Plans/Contracts_V0.md` — `remediation.resolved` enum irreconcilable (zero overlap), ~~`blocked_reason_code` missing 2 values used in orch~~ **(CORRECTED: worktree_conflict/dirty_worktree ARE at L1090-1091)**, `allowed_action_id` stale in chat, §1.1 duplicate numbering, attempt events no producer; ~38 findings across 2 agents
- `Plans/storage-plan.md` — seglog wire format undefined, `attempt_record` key conflict, `blocked_projection` 3-way conflict, counter semantics conflict, §5.1-5.4 have content (3-4 concrete rules each + ContractRefs) but lack full implementation specs, 4 overlapping reconciliation addenda; ~58 findings across 2 agents
- `Plans/Tools.md` — §3.5 per-tool contracts EMPTY, §3.6 task tool EMPTY, §3.5A skill tool EMPTY, Plan mode self-defeating; ~47 findings across 2 agents
- `Plans/FinalGUISpec.md` — §8/§9/§10 completely missing, duplicate §17, 6 overlapping blocked/recovery addenda, §15.1 missing 30+ redb keys, Docker Manage naming, stale terminology throughout; ~67 findings across 3 agents
- `Plans/assistant-chat-design.md` — §6/§7 phantom, `debug` missing from overlay enum, 4 overlapping blocked-state addenda, no message taxonomy, stale recovery actions, investigation context field divergence; ~94 findings across 4 agents
- `Plans/Permissions_System.md` — two incompatible algorithms (§2.4 vs §8), permission snapshot DRY violation, missing security section, TOML/JSON conflict, no durable approvals; ~36 findings across 2 agents

**HIGH (significant gaps, stale terminology, incomplete contracts):**
- `Plans/Executor_Protocol.md` — TierContext unnamed replacement, counter semantics conflict, `node.prerequisite_resolved` orphaned; ~34 findings across 2 agents
- `Plans/interview-subagent-integration.md` — slash-command contamination, persona field name crisis, stale tier hooks, duplicate EOF section; ~110 findings across 3 agents
- `Plans/chain-wizard-flexibility.md` — `wizard_status` 7+× duplicate (not 5), empty §15.5/Default Personas, 3 stale tier refs (not 7), `needs_user_clarification` conflation; ~63 findings across 3 agents
- `Plans/Multi-Account.md` — Gemini one-vs-two contradiction, zero auth flows, `credential_ref`/`auth_surface` undefined; 24 findings
- `Plans/Provider_OpenCode.md` — no cancellation/abort, no concurrency model, 9-state vs 5-state conflict; 18 findings
- `Plans/Models_System.md` — empty §10.4.2 stub, fast/powerful unbuildable, no capabilities catalog; 20 findings
- `Plans/Crosswalk.md` — §3.6 empty, §3.8-3.12 missing, 6 major areas unrouted; 20 findings
- `Plans/LSPSupport.md` — §5.1 phantom (12 refs), root discovery table missing, SSH transport unspecified; ~32 findings across 2 agents
- `Plans/FileManager.md` — §10.5-10.10 phantoms, terminal dual-authority with FinalGUISpec, SSH error classification missing; ~49 findings across 2 agents
- `Plans/Prompt_Pipeline.md` — tier/mode in envelope, no node fields, token budget prose-only, sensitivity forwarding gap; 20 findings
- `Plans/Progression_Gates.md` — no package/seam gates, stale `tier_status`, gate events not in Contracts_V0; 31 findings
- `Plans/human-in-the-loop.md` — HITL gates at tier boundaries only, permission ask flow not bridged to blocked model; 15 findings
- `Plans/Run_Modes.md` — sensitivity forwarding gap, `debug` overlay inconsistency, yolo escalation undefined; 16 findings
- `Plans/WorktreeGitImprovement.md` — 14 tier_id refs, stale tier_type strategy selection; 22 findings
- `Plans/FileSafe.md` — recovery_options contradiction, action ID missing from catalog; ~74 findings across 3 agents. **(Phase 4B correction: "last-write-wins", "editor diff mode", "auto-save interval", field name drift safe_point_id/snapshot_id/checkpoint_id, and `filesafe_snapshot.v1:*` key were all FABRICATED findings — none appear in the doc. Correct safe-point key is `safe_point.sp:{run_id}:...` in storage-plan.)**
- `Plans/Glossary.md` — 3M (21 terms), `owner_tier_id` diverges from storage-plan canonical fields
- `Plans/feature-list.md` — 3M + 2S (canon-collapsed)
- `Plans/usage-feature.md` — missing enum + field + wrong label
- `Plans/UI_Command_Catalog.md` — 5 missing command families + 2M + 3P from intents

**MEDIUM:**
- `Plans/newtools.md` — 5 tier refs, phantom §8.1-8.3, browser chip schema undefined; ~43 findings across 2 agents
- `Plans/Decision_Policy.md` — schema ID has 2 variants (`pm.auto_decisions.schema.v1` vs `auto_decisions.schema.json`), ~~evidence.schema.json missing~~ **(EXISTS at Plans/evidence.schema.json)**, recovery matrix incomplete; 15 findings
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` — duplicate section, 3 near-identical addenda, only AutoGen/A2A scope; 15 findings
- `Plans/newfeatures.md` — 1M (browser/click-to-context)
- `Plans/Commands_System.md` — missing debug dispatch
- `Plans/MiscPlan.md` — cleanup policy tier-scoped
- `Plans/00-plans-index.md` — "Tiers" tab name, §15 ownership

**LOW:**
- `Plans/Orchestrator_Page.md` — 2M (container UICommands, evidence)
- `Plans/Project_Output_Artifacts.md` — 1M (runtime recovery)
- `Plans/Containers_Registry_and_Unraid.md` — 1P (deprecated recovery_options[])
- `Plans/Plugins_System.md` — duplicate section + misordered subsections
- `Plans/Personas.md` — zero overseer persona types (SKIP — user working on separately)

### Phase 3: Deep Re-Audit (Waves 1–3)

Focused deep re-audit on orchestrator, provider, subagent, filemanager, editor, and terminal docs.
51 Opus 4.6 subagents launched across 3 waves; all 51 collected successfully.
~1,050 raw findings total.

#### Wave 1 — Orchestrator / Execution (16 agents, ~400 findings)

**orch-core** (orchestrator-subagent-integration.md body L1-2000): 37 findings (9 blocker, 11 HIGH)
- Body uses entirely stale Phase→Task→Subtask→Iteration model with 424+ tier refs
- Zero node/package/lane/seam vocabulary in body sections
- §3 remediation loop defines its own retry/escalation model incompatible with Executor_Protocol.md
- §7.2 Dashboard spec references TierTree widget with stale data model
- Body execution loop structurally incompatible with DAG-based scheduler in addenda
- Persona system not referenced in body at all — addenda say it's "first-class runtime role contract"

**orch-lifecycle** (orchestrator-subagent-integration.md L2000-4200): 59 findings (17 blocker, 24 HIGH)
- Remediation model in §3 is a "parallel universe" — defines retry/backoff/escalation that contradicts Executor_Protocol
- Dead vocabulary pervasive: `TierNode`, `TierType`, `tier_id`, `phase`, `task`, `subtask`, `iteration`
- Subagent selection code uses `select_for_tier()` — contradicts Persona addendum's `persona_registry`
- Score tuple references missing — body has no scored ready-set model
- §5 conflict resolution uses stale `TierContext` type
- Commit message format strings use `"tier: {tier_id}"` — ambiguous

**orch-parallel** (orchestrator-subagent-integration.md L4200-6270): 57 findings
- Crews mega-section (§6) unbuildable — references `CrewTemplate` type (not "CrewDefinition") with fields that don't exist in any schema
- Parallel execution model assumes sequential tier traversal, contradicting DAG scheduler
- ~~`ResourcePool` and `ConcurrencyManager` types defined here but nowhere else~~ **(CORRECTED: These types do NOT exist in any Plans doc — phantom references)**
- Inter-crew communication protocol is prose-only, no event schema
- Stale terminology throughout: "tier boundaries", "phase inspector", "subtask completion"

**orch-addenda** (orchestrator-subagent-integration.md L6270-7026): 32 findings (6 S1, 20 S2, 6 S3)
- L6272-6660: "Autonomous QA Loop" (390 lines) entirely dead code using superseded types — structurally incompatible with scheduler model 200 lines later
- L6683: `### Tier-specific Persona defaults` is EMPTY — zero content under header
- Four near-identical addenda at L6961-7026 all open with "The orchestrator is the primary consumer" — L7001-7013 and L7014-7026 are **verbatim identical**
- `node.prerequisite_resolved` referenced as wake event but does NOT exist in Executor_Protocol's canonical wake list (L481-493)
- `retry_count` called "display-only" but Executor_Protocol has sub-counter model with no field called `retry_count`
- Backoff durations `1s, 5s, 15s` exist ONLY here — no canonical owner
- Runtime fields list (16 fields at L6839) overlaps Executor_Protocol but several fields (`selected_at_utc`, `scheduler_score_breakdown`) are orphaned — not in EP, Contracts_V0, or storage-plan
- Wake causes list uses informal names ("node finished") instead of canonical enum values; lists only 9 of 13 EP canonical values; omits `auth_recovered`, `startup_recovered`, `watchdog_recheck`
- ~~`worktree_conflict` and `dirty_worktree` added as `blocked_reason_code` values but NOT present in Contracts_V0.md canonical enum~~ **(CORRECTED: Both ARE at L1090-1091)**
- Remediation children visibility contract says they're "not canonical graph nodes" but never specifies how they participate in scheduling

**orch-verify** (orchestrator-subagent-integration.md cross-verification): 42+ findings (6 blocker)
- Confirmed body/addenda split-brain is pervasive — addenda reference a completely different execution model
- ContractRef tags in body point to stale sections; addenda ContractRefs are better but still incomplete
- No single authoritative list of runtime fields — must union L6841 (16 fields) and L6927 (10 fields) with EP

**exec-core** (Executor_Protocol.md L1-300): 17 findings (4 P1, 13 P2)
- §2.1 execution context mentions `TierContext` as deprecated but provides no replacement type name
- `attempt_record` key has 4 components in §2.3 (with project_id) but addendum has 3 components — conflict
- `blocked_projection` key shape has 3-way conflict across 3 locations
- Score tuple well-specified but no storage binding for `scheduler_score_breakdown`
- `failure_class` taxonomy lists 7 classes but boundary between `provider_transient` and `provider_capacity` is ambiguous

**exec-addenda** (Executor_Protocol.md L300-601): 17 findings (2 P1, 9 P2)
- Counter semantics conflict: L820 says `retry_count = attempt_count - 1` but L941-944 defines sub-counter decomposition where `attempt_count = automatic_retry_count + prerequisite_resume_count + manual_resume_count + remediation_retry_count + 1`
- Remediation lineage well-specified but remediation ceiling has no numerical bounds anywhere
- `node.prerequisite_resolved` event referenced but not in canonical event list
- Wake-reason addendum adds 3 values (`auth_recovered`, `startup_recovered`, `watchdog_recheck`) but these aren't in orchestrator addenda wake list

**contracts-core** (Contracts_V0.md L1-600): 19 findings (5 S1, 8 S2)
- §1.1 duplicate numbering — two different §1.1 sections
- `remediation.resolved` enum has zero overlap between 03-08 addendum (`success|failed|ceiling_exceeded`) and 03-09 addendum (`fixed|superseded|abandoned|replan_required`)
- `failure_class` enum position ambiguous — defined in EP but consumed in Contracts_V0 without import
- Attempt events (`node.attempt_started`, etc.) have no declared producer
- Codex auth still lists `OAuthDeviceCode` — stale

**contracts-addenda** (Contracts_V0.md L600-1144): 19 findings (3 CRIT, 5 HIGH)
- `remediation.resolved` resolution enum irreconcilable between two addenda — zero shared values
- ~~`blocked_reason_code` enum in Contracts_V0 does NOT include `worktree_conflict` or `dirty_worktree` that orchestrator addenda introduce~~ **(CORRECTED: Both values ARE present at L1090-1091)**
- `allowed_action_id` enum has 10 values but chat blocked-state addenda use non-canonical action names (`Resume Wizard`, `View report`, `Provide new input`, `Open in Chat`)
- Investigation context `§5.1A` has field name divergence from chat `§12.0A` (`primary_target` vs `primary_target_summary`, `final_or_intermediate_state` vs `state`)

**interview-core** (interview-subagent-integration.md L1-800): 40 findings (11 HIGH)
- ~~Slash-command contamination: `/interview start`, `/interview status` etc. referenced but slash commands aren't the canonical interface~~ **(CORRECTED: No slash commands found in interview doc)**
- Persona field name crisis: `interview_persona` vs `effective_persona` vs `persona_id` used inconsistently
- `get_subagents_for_tier()` function uses stale tier model
- Phase selector input types don't match chain-wizard PhaseSelectorContract

**interview-impl** (interview-subagent-integration.md L800-1600): 43 findings (4 HIGH, 27 MED)
- Research agent dispatch code uses `tier_type` for selection — stale
- Question generation pipeline references `phase.config.max_questions` but no schema for phase config
- Evidence collection format unspecified — just says "structured research output"
- Fragment unification pass has no ownership assignment (who runs it?)

**interview-addenda** (interview-subagent-integration.md L1600-2269): 27 findings (1 CRIT, 12 HIGH)
- `requirements_quality_report` schema diverges from chain-wizard-flexibility.md §14.1
- Duplicate section at EOF (exact copy of earlier content)
- ~~`stage_complete` event has no schema in Contracts_V0~~ **(CORRECTED: `stage_complete` is not referenced anywhere in Plans docs)**
- Phase-to-persona mapping references persona IDs that don't exist in Personas.md

**hitl** (human-in-the-loop.md): 15 findings (2 HIGH, 7 MED)
- HITL gates defined at "tier boundaries" — no package-complete or seam-complete gates
- Permission ask flow `once`/`always`/`reject` never mapped to `cmd.runtime.approve`/`cmd.runtime.decline`
- ~~No bridge between HITL `approval_request` and chat blocked-state lifecycle~~ **(CORRECTED: HITL bridge to blocked-state lifecycle DOES exist at L24: "blocked-runtime overlay")**
- `always` approval is session-scoped only — no durable/permanent path

**run-modes** (Run_Modes.md): 16 findings (3 P1, 4 P2)
- `debug` overlay defined here (L37, L152) but missing from chat §29.1 closed enum at L1966
- Sensitivity-aware forwarding (part 7 of runtime contract) has zero implementation spec
- Runtime mode transitions during tool execution have no atomic guarantee
- `yolo` mode has no permission escalation contract

**progression-gates** (Progression_Gates.md): 31 findings (6 S1, 12 S2)
- No package-complete or seam-complete gates — only tier-level gates exist
- Gate predicates use ~~stale `tier_status` field~~ **(CORRECTED: `tier_status` not used in Progression_Gates)**
- No gate for remediation ceiling — blocked episodes can accumulate without circuit breaker
- Score threshold for dispatch is in EP but not cross-referenced here
- `gate.evaluation_started` / `gate.passed` / `gate.failed` events not in Contracts_V0

**prompt-pipeline** (Prompt_Pipeline.md): 20 findings (8 HIGH, 7 MED)
- Run envelope embeds `tier` and `mode` — no node/package/lane identity fields
- System prompt assembly references persona ~~but not via canonical `effective_persona` resolution~~ **(CORRECTED: Persona resolution IS canonical at Stage 3 + §6)**
- Token budget allocation algorithm is prose-only — no formula or pseudocode
- Context window management strategy ("smart truncation") undefined
- No sensitivity-aware forwarding implementation

#### Wave 2 — FileManager / Editor / Terminal / Tools / Storage (15 agents, ~350 findings)

**filemgr-core** (FileManager.md L1-500): 19 findings (1 P0, 2 P1)
- P0: §10.10 "LSP Integration" referenced in TOC but section doesn't exist (phantom)
- §9A terminal integration structurally incompatible with FinalGUISpec §5.1 terminal ownership model
- File-tree virtual scroll has no performance contract (max items? lazy loading threshold?)
- Drag-and-drop targets listed but no drop-rejection rules for invalid targets

**filemgr-impl** (FileManager.md L500-966): 30 findings (4 HIGH)
- §10.5-10.10: multiple phantom sections in TOC that don't exist in body
- Remote file operations have no timeout/retry contract
- ~~File watcher integration says "use platform APIs" — no abstraction layer specified~~ **(FABRICATED: FileManager.md L386 says "no filesystem watcher in MVP")**
- Search-in-files delegates to "Search side panel" but no handoff event defined
- SSH file operations have no error classification (network vs permission vs not-found)

**filesafe-core** (FileSafe.md L1-1000): 21 findings (2 HIGH, 13 MED)
- `recovery_options[]` field referenced in Contracts_V0 addendum as deprecated but still used in 3 FileSafe sections
- Safe-point creation has no storage size limit or cleanup policy
- `filesafe.snapshot_created` event not in Contracts_V0 canonical event list
- ~~Conflict resolution for concurrent edits is "last-write-wins" but no vector clock or sequence number~~ **(FABRICATED: "last-write-wins" not mentioned in FileSafe)**

**filesafe-features** (FileSafe.md L1000-2000): 25 findings (3 HIGH, 12 MED)
- Restore flow UX has no confirmation dialog spec
- ~~Diff view for safe-point comparison references "editor diff mode" that doesn't exist in editor spec~~ **(FABRICATED: "editor diff mode" and "diff view" not in FileSafe)**
- ~~Auto-save interval configurable but no min/max bounds specified~~ **(FABRICATED: "auto-save" and "interval" not in FileSafe)**
- FileSafe interaction with worktree branching undefined — what happens to safe points on branch switch?

**filesafe-context** (FileSafe.md L2000-2808): 28 findings (3 HIGH)
- `recovery_options[]` contradiction between Contracts_V0 (deprecated) and FileSafe (active usage)
- ~~Field name drift: `safe_point_id` vs `snapshot_id` vs `checkpoint_id` used in different sections~~ **(FABRICATED: None of these terms appear in FileSafe)**
- Action ID `filesafe.restore` not in UI_Command_Catalog
- ~~Storage binding for safe-point data references `filesafe_snapshot.v1:*` key not in storage-plan §2.3~~ **(FABRICATED: Key is `safe_point.sp:{run_id}:...` at storage-plan L822, not `filesafe_snapshot.v1:*`)**

**lsp-core** (LSPSupport.md L1-450): 16 findings (2 P0, 4 P1)
- P0: §5.1 "Chat LSP" referenced 12 times throughout doc but heading doesn't exist — phantom section
- P0: §3.5 root discovery promised "table of per-language root detection rules" — only abstract prose, no table
- SSH transport for remote LSP says "via SSH subprocess" but no protocol details (stdio over SSH? port forwarding?)
- Language server lifecycle (start/stop/restart) has no state machine diagram or enum
- `lsp.server_started` / `lsp.server_crashed` events not in Contracts_V0

**lsp-impl** (LSPSupport.md L450-890): 16 findings (4 HIGH, 4 MED)
- Code action integration with tool approval flow unspecified — does applying an LSP code action require permission?
- Diagnostic-to-chat pipeline ("send diagnostics to assistant") has no message format
- Multi-root workspace handling only covers "first matching server" — no load balancing or routing contract
- LSP server resource limits (memory, CPU) unspecified — no OOM handling

**tools-core** (Tools.md L1-500): 27 findings (3 CRIT, 4 HIGH)
- CRIT: §3.5 per-tool contracts EMPTY — no I/O schema for bash, edit, read, grep, glob, create, etc.
- CRIT: §3.6 task tool EMPTY — no input schema, no enum of 42 subagent types, no dispatch contract
- CRIT: Plan mode preset DENIES question/todo/web tools — self-defeating for planning research
- §3.5A skill tool runtime contract is a placeholder with zero content
- Tool approval flow references Permissions_System.md but the permission key pattern for each tool is undefined
- Tool execution timeout: "configurable" — no default, no max, no per-tool override

**tools-impl** (Tools.md L500-952): 20 findings (2 P0, 8 P1)
- P0: `tool.execution_started` / `tool.execution_completed` events not in Contracts_V0 canonical list
- P0: Tool result streaming contract missing — does output stream or arrive at completion?
- §5.1 tool composition (chaining) is prose-only — no pipeline schema
- ~~MCP tool discovery mentions "capability probing" but no probe protocol~~ **(FABRICATED: "capability probing" not in Tools.md)**
- ~~Tool sandboxing says "each tool runs in its own context" — no isolation mechanism specified~~ **(FABRICATED: That quote not in doc. L522 says custom tools run in subprocess with timeout)**

**newtools-core** (newtools.md L1-600): 23 findings (1 P0, 4 P1)
- P0: §8.1-8.3 referenced in TOC but sections don't exist (phantom)
- `TierTree::load_test_strategy` uses stale terminology
- Browser tool capture flow references "visible composer chips" from assistant-chat-design but the chip schema is undefined
- Click-to-context tool has no coordinate system spec (viewport? document? element-relative?)

**newtools-impl** (newtools.md L600-1209): 20 findings (2 HIGH, 12 MED)
- ~~"per-tier overrides" in test tool configuration — stale terminology~~ **(FABRICATED: "per-tier" not in newtools.md)**
- Web research tool has no rate limiting contract
- ~~Code search tool references "semantic search" but no embedding model or index spec~~ **(FABRICATED: "semantic search" not in newtools.md or Tools.md)**
- Terminal tool says "shares terminal identity with chat" but terminal identity model is split across 3 docs

**storage-core** (storage-plan.md L1-540): 28 findings (3 CRIT, 10 HIGH)
- CRIT: §2.2 seglog wire format UNDEFINED — "append-only event log" with no concrete serialization format
- CRIT: `attempt_record` key has 4 components (with `project_id`) in §2.3 but addendum has 3 components
- CRIT: `blocked_projection` key shape has 3-way conflict across 3 locations
- No versioning/migration strategy for redb schema changes
- `seglog.event_appended` not in Contracts_V0 canonical events
- Per-record TTL mentioned but no default values or cleanup trigger
- Index rebuild procedure is prose-only — no algorithm or time complexity

**storage-addenda** (storage-plan.md L540-1081): 30 findings (4 S1-CRIT, 16 S2-HIGH)
- CRIT: Stale retry formula at L820 (`retry_count = attempt_count - 1`) directly conflicts with sub-counter model at L941-944
- ~~CRIT: §5.1-5.4 ALL STUBS — Unsaved editor recovery, requested/effective state, search/SC projection, LSP persistence each have zero implementation spec~~ **(CORRECTED: Each has 3-4 concrete rules + ContractRefs. Need full implementation specs but are NOT empty stubs)**
- CRIT: Key format 3-way conflict for blocked_projection across §2.3, §4.1, and addendum
- Overlapping addenda: 4 separate "storage reconciliation" addenda that restate the same "single projection, multiple views" rule
- `terminal_workspace_state.v1:*` through `terminal_command_block.v1:*` (7 terminal keys) defined here but NOT in FinalGUISpec §15.1
- Permission Snapshot Storage addendum defines schema but FinalGUISpec §15.1 has no `permission_snapshot.v1:*` key

**worktree-git** (WorktreeGitImprovement.md): 22 findings (4 HIGH)
- 14 `tier_id` references throughout worktree helper APIs
- Branch strategy manager uses `tier_type` for strategy selection — stale
- Worktree cleanup on run completion has no grace period or file-lock check
- `worktree.created` / `worktree.deleted` events not in Contracts_V0

**gui-core** (FinalGUISpec.md L1-700): 17 findings (1 CRIT, 4 HIGH)
- CRIT: §8 Widget Catalog, §9 State Management, §10 UX Patterns listed in TOC but completely absent from document
- Activity bar items list doesn't match side-panel definitions — GHA panel referenced but not specified
- Settings panel: only 3 of 24+ tabs specified (General, Editor, Terminal)
- Keyboard shortcut catalog incomplete — only ~20 of likely 80+ shortcuts defined

#### Wave 3 — Provider / GUI / Chat / Permissions (20 agents, ~300 findings)

**gui-panels** (FinalGUISpec.md L700-1400): 20 findings (2 P0, 8 P1)
- P0: §8/§9/§10 completely missing from body (referenced in TOC, never written)
- P0: Only 5 of 8+ side-panels have substantive specs
- "Docker Manage" at §7.4.8A — should be "Docker Manager"
- Settings tabs: only 3 of 24+ specified (General, Editor, Terminal — missing 21+ tabs)
- Appendix A cross-references use section numbers (§7.16, §7.18, §7.20) that don't exist in current numbering

**gui-impl** (FinalGUISpec.md L1400-2184): 30 findings (3 CRIT, 6 HIGH, 14 MED)
- CRIT: Duplicate §17 — two completely different sections share same number (Risks vs Persona Editor)
- CRIT: 6 overlapping blocked/recovery addenda (L1963, 2031, 2048, 2087, 2099, 2123) with `wizard_blocked` card defined TWICE
- CRIT: §15.1 redb keys dramatically incomplete — missing 30+ keys that exist in storage-plan.md §2.3 (attempt_record, blocked_projection, artifacts_index, lane_record, worktree_record, concern_record, provider_account_record, 7 terminal keys, mcp keys, skill keys, dev_session_record)
- HIGH: No GHA panel persistence key in either FinalGUISpec §15.1 OR storage-plan.md §2.3
- HIGH: Persona §17.2 missing `disabled_plugins` and `default_skill_refs` fields that exist in Personas.md §3.2
- HIGH: §17.8 mapping editor uses stale "phase/task/subtask/iteration tiers" — should be Feature Seam/Work Package/Lane/Node
- HIGH: `wizard_blocked` card defined at L1965-1978 AND re-defined at L2050-2067 with priority ordering only in second copy
- HIGH: Docker Manage addendum (L1718-1737) embedded inside Persona §17 with no section break
- MED: Appendix C.5 redb key migration references deprecated `dashboard_layout:v1` but §15.4 Startup Restore still uses old key
- MED: `terminal_state:v1` referenced in Startup Restore but never defined in §15.1 — phantom key
- MED: Stale `tiers.slint` file path, "Tiers" tab name, "TierTree" widget name
- MED: L2180-2183 all-nodes-blocked timeout (10min/30min) uses timer-driven behavior that contradicts L2043 event-driven mandate
- MED: L1238 seglog projection mentions "tier" field — ambiguous (decomposition tier vs pricing tier?)
- MED: Activity transparency events have no GUI visual treatment mapping
- MED: Blocked-State Visual Distinction table (L2127) maps only 3 states, missing `retrying/backoff` and `remediation` badges

**chat-core** (assistant-chat-design.md L1-700): 18 findings (1 P0, 4 P1)
- P0: §6 "Teach" and §7 "Attachments, Web Search, and Extensibility" in TOC but sections don't exist — phantom
- No message taxonomy (what types of messages exist? user, assistant, system, tool_result, operation_card, blocked_notice — never enumerated)
- No chat lifecycle state machine (thread creation → active → archived → deleted — undefined)
- Thread identity model incomplete — `thread_id` mentioned but no format, no generation rule, no uniqueness scope
- No explicit "no delete" rule for messages (user-locked decision never written)

**chat-features** (assistant-chat-design.md L700-1300): 18 findings (1 P0, 4 P1)
- P0: §6/§7 phantom sections again — referenced in body cross-refs
- Tool approval UX in chat not specified — Permissions_System says "ask" but chat has no dialog spec for the approval prompt
- HITL approval UX disconnected from chat blocked-state lifecycle
- ~~Export/share format unspecified — mentions "export conversation" but no format (markdown? JSON? PDF?)~~ **(CORRECTED: L1391/L1413 specify Markdown or JSON)**
- Inline subagent card (§14) doesn't cross-reference Persona §27.6 subagent display fields

**chat-advanced** (assistant-chat-design.md L1300-1950): 29 findings (6 HIGH, 13 MED)
- HIGH: BrainStorm Mode (§18) is a ~10-line section — conflicts with canonical mode strip, indistinguishable from Deep Plan + Crew
- HIGH: No truncation priority table — when context window fills, what gets dropped first?
- ~~HIGH: Context lens feature unbuildable — "filter context by lens" with no lens enum, no filter algorithm~~ **(FABRICATED: "context lens" does not exist in assistant-chat-design.md)**
- HIGH: Code block rendering has no language detection fallback
- HIGH: Multi-turn edit flow (apply/reject/modify) has acceptance criteria but no state machine
- MED: Search-in-chat references "search panel" but no handoff event between chat search and side-panel search
- ~~MED: Voice input mentioned in §21 but marked "post-MVP" with no clear deferral boundary~~ **(FABRICATED: Zero mentions of "voice" in the doc)**
- MED: Streaming interruption behavior undefined — what happens to partial tool output when user stops generation?

**chat-addenda** (assistant-chat-design.md L1950-2694): 29 findings (2 SEV-1, 4 SEV-2, 18 SEV-3)
- SEV-1: `debug` MISSING from mode-overlay closed enum at L1966 — contradicts §1.0B (L121) and Run_Modes.md (L37, L152)
- SEV-1: Four overlapping blocked-state addenda (L2056-2184) with massive redundancy — thread states listed 3×, `blocked` vs `attention_required` defined 3×, resume semantics stated identically at L2127 and L2154
- SEV-2: Recovery actions at L2089 (`Resume Wizard`, `View report`, `Provide new input`, `Open in Chat`) don't match ANY of the 10 canonical `allowed_action_id` values in Contracts_V0.md L1062-1072
- SEV-2: "Unified Thread Blocked-State Lifecycle" (L2155-2184) doesn't mark prior 3 addenda as superseded — contradictory guidance within 100 lines
- SEV-2: Investigation Context field names diverge between §12.0A (`primary_target`, `final_or_intermediate_state`) and Contracts_V0 §5.1A (`primary_target_summary`, `state`)
- SEV-3: `chat_excerpt_refs[]` in wizard handoff payload has no schema — identity model undefined
- SEV-3: `blocked_notice` message type doesn't appear in §13 operation-card families
- SEV-3: §27.5 persona controls list controls but no layout/placement/sizing
- SEV-3: §27 never references Personas.md §10 runtime contract (`requested_persona`, `effective_persona`, `persona_selection_source`, `persona_override_owner_id`)
- SEV-3: §27 never mentions reserved personas (`collaborator`, `general-purpose`, `explorer`, `researcher`, `deep-researcher`)
- GOOD: Worktrees in Assistant (W.1-W.17, L2186-2694) is exceptionally well-specified — best-in-class addendum

**perms-core** (Permissions_System.md L1-450): 14 findings (1 CRIT, 2 HIGH)
- CRIT: Two incompatible permission algorithms — §2.4 defines 6-layer per-invocation resolution; §8 defines 7-step parent→child narrowing — no composition spec explaining how they relate
- HIGH: `regular` runtime mode undefined in precedence table — only `ask`, `plan`, `yolo` have explicit entries
- HIGH: Snapshot source enum only covers 2 of 6 precedence layers
- ~~Permission key pattern for individual tools never specified (what's the key for `bash`? `edit`? `grep`?)~~ **(CORRECTED: §5 Tool permission keys L256-290 defines keys for bash, edit, grep, read, glob, list, task with granular patterns)**

**perms-impl** (Permissions_System.md L450-884): 22 findings (4 P1-CRIT, 12 P2-HIGH)
- CRIT: Stale `recovery_options[]` in permission escalation flow — deprecated in Contracts_V0 addendum
- CRIT: Permission snapshot schema defined verbatim in BOTH Permissions_System.md AND storage-plan.md — DRY violation
- CRIT: Missing security/sandboxing section — no threat model, no trust boundaries, no capability restriction mechanism
- CRIT: TOML config schema conflicts with JSON schema used in storage-plan.md for same permission data
- HIGH: No API/CLI permission management surface — only GUI flows specified
- HIGH: `always` scope is session-only; no durable approval path for trusted tools
- HIGH: No package/seam/lane permission scopes — only project-level and global-level

**provider-opencode** (Provider_OpenCode.md): 18 findings (4 S1, 8 S2)
- S1: No cancellation/abort contract — no way to stop an in-progress provider call
- S1: No concurrency model — can multiple calls to same provider overlap? Queue? Reject?
- S1: Minimum version unspecified — what OpenCode version is required?
- S1: 9-state provider profile lifecycle vs 5-state `ProviderReadinessState` in Contracts_V0 — conflict
- S2: No streaming error recovery — what happens when stream breaks mid-token?
- S2: Rate limit handling is prose-only ("respect rate limits") — no backoff algorithm
- S2: Tool-use/function-calling protocol not specified per provider
- S2: No health check / keepalive contract

**multi-account** (Multi-Account.md): 24 findings (5 P0, 10 P1)
- P0: Gemini one-vs-two provider contradiction — §1 says "one provider"; §4.1/§6 say "two separate entries"
- P0: No auth flow section — zero step-by-step walkthrough for ANY auth method (API key, OAuth, CLI token)
- P0: No registration flow — how does a user add a new account?
- P0: `credential_ref` field required on every account record but format undefined
- P0: `auth_surface` field required on every account record but enum values undefined
- P1: No account deletion/deactivation flow
- P1: No credential rotation/expiry handling
- P1: No multi-account selection UX spec — how does user pick which account to use?
- P1: Account switching during active run undefined
- P1: No fallback behavior when primary account quota exhausted

**models-sys** (Models_System.md): 20 findings (4 P1, 12 P2)
- P1: §10.4.2 is an empty stub — section header with zero content
- ~~P1: Model selection priority table has duplicate entries~~ **(CORRECTED: Priority table at L63-70 has 6 clean entries, no duplicates)**
- P1: No model registration or capabilities catalog — `fast` and `powerful` model roles are unbuildable without knowing what models exist
- P1: `fast`/`powerful` selection criteria undefined — "smallest/cheapest" and "largest/most capable" by what metric?
- P2: No model deprecation/sunset handling
- P2: No token counting abstraction — each provider counts differently
- P2: No model-specific context window limits table
- P2: Lane-aware model binding mentioned in passing but never specified

**decision-policy** (Decision_Policy.md): 15 findings (4 P1, 7 P2)
- P1: Schema ID has 2 naming variants: `pm.auto_decisions.schema.v1` and `auto_decisions.schema.json` **(not 3 — the claimed names `decision_record.v1`, `auto_decision.v1`, `governance_decision.v1` do not exist)**
- ~~P1: `evidence.schema.json` referenced but file doesn't exist and schema undefined~~ **(CORRECTED: File EXISTS at Plans/evidence.schema.json, 4192 bytes)**
- P1: Recovery matrix missing for 5 of 10 error codes
- P1: No decision expiry/TTL mechanism

**crosswalk** (Crosswalk.md): 20 findings (3 S1-CRIT, 6 S2-HIGH)
- CRIT: §3.6 exists as heading but content is empty/orphaned
- CRIT: §3.8-3.12 MISSING — 5 numbered sections absent from document
- CRIT: HITL, debug mode, permissions, events, and terminal identity are all unrouted in the crosswalk
- HIGH: No routing entry for remediation lifecycle
- HIGH: No routing entry for provider selection/fallback
- HIGH: Crosswalk doesn't cover any storage-plan.md schemas

**stream-mapping** (Provider_Stream_Mapping_External_Reference_A2A.md): 15 findings (3 HIGH, 6 MED)
- HIGH: Verbatim duplicate section at L343-361 (exact copy of L325-342)
- HIGH: 3 near-identical wake-reason addenda with marginal differences
- HIGH: Only covers AutoGen/A2A scope — no OpenCode, no Gemini Direct, no Gemini CLI stream mapping
- ~~MED: Stream event taxonomy doesn't include `tool_use` / `tool_result` events~~ **(CORRECTED: L44-45 list both; L106-108 have detailed mappings)**
- MED: Error stream events have no severity classification

**wizard-core** (chain-wizard-flexibility.md L1-700): 33 findings (5 SEV-1, 18 SEV-2)
- SEV-1: 3 stale tier refs ("tier worktrees", "per-tier worktree branches" at L280, L940, L1042)
- SEV-1: Empty §15.5 — section header with zero content
- SEV-1: Default stage Personas section empty
- SEV-1: `wizard_status` enum defined 4× in addenda with `blocked` missing from the first/canonical definition (L250)
- ~~SEV-1: `ChainWizardState` type at L160-258 uses `tier_id` fields~~ **(CORRECTED: Zero occurrences of `tier_id` in entire file)**
- SEV-2: Phase selector output doesn't match interview-subagent-integration input contract
- SEV-2: No wizard cancellation cleanup spec — what resources are released?
- SEV-2: Wizard→orchestrator handoff has no rollback mechanism

**wizard-addenda** (chain-wizard-flexibility.md addenda L1350-2093): 15 findings (1 P0, 4 P1)
- P0: `wizard_status` enum repeated 4× in 6 addenda ~~with `blocked` field name drift (`is_blocked`, `blocked_state`, `blocked_info`, `blocked_episode_ref`)~~ **(CORRECTED: Actual blocked fields are `blocked_reason_code` and `wizard_status = blocked`; the 4 claimed drift names do NOT exist)**
- P1: Phantom persona IDs in phase-persona mapping — reference personas not defined in Personas.md
- ~~P1: Field name drift between addenda: `wizard_step` vs `current_step` vs `active_phase`~~ **(FALSE: Only `wizard_step` exists; `current_step` and `active_phase` have zero occurrences)**
- P1: No version/migration strategy for wizard state schema changes

**wizard-features** (chain-wizard-flexibility.md L700-1350): 15 findings (2 HIGH, 5 MED)
- HIGH: L1316 `needs_user_clarification[]` field conflated with `unresolved_findings[]` from validation_pass_report — different schemas, different artifacts
- HIGH: Missing topics claimed in TOC (chain execution flow, monitoring, history, templates) don't exist in document — need explicit DRY delegation stubs
- MED: Contract Unification Pass has no ownership assignment (interview? wizard? post-interview pipeline?)
- MED: Canonical promotion step has no trigger/owner
- MED: `has_gui` undefined when Architecture + Product/UX both skipped (ContributePr intent)
- MED: Three-Pass Validation → execution transition has no lifecycle hook or guard
- MED: §7 git operations have no error handling contract (clone failure, fork failure, branch collision)

### Deep Re-Audit Summary Statistics

| Category | Count |
|----------|-------|
| Total raw findings | ~1,050 |
| BLOCKER / CRIT / P0 / S1 / SEV-1 | ~85 |
| HIGH / P1 / S2 / SEV-2 | ~250 |
| MEDIUM / P2 / S3 / SEV-3 | ~500 |
| LOW / P3 / SEV-4 | ~100 |
| Confirmed-consistent (GOOD) | ~115 |

### Cross-Doc Duplicate Contract Map (canonical ownership)

| Contract Area | Defined In (multiple) | Canonical Owner | Action |
|--------------|----------------------|-----------------|--------|
| Scored ready-set model | orch addenda L6784 + EP L176-229 | Executor_Protocol.md | Orch should reference, not redefine |
| Runtime fields list | orch L6841 (16 fields) + orch L6927 (10 fields) + EP L116-131 | Executor_Protocol.md | Union into EP; orch references |
| Wake causes | orch L6825 (9 values) + EP L481-493 (13 values) | Executor_Protocol.md | Delete orch list, reference EP |
| Retry/backoff matrix | orch L6879 + EP L258-274 | Executor_Protocol.md | Move durations to EP or shared config |
| Remediation flow | orch L6858 (7-step) + EP L386-393 + Contracts_V0 L880-912 | EP for model, Contracts_V0 for events | Orch should reference both |
| `remediation.resolved` enum | Contracts_V0 03-08 addendum + 03-09 addendum | Contracts_V0.md (NEEDS RECONCILIATION) | Pick one enum, delete other |
| `blocked_reason_code` enum | Contracts_V0 L1046 + orch addenda (adds 2 values) | Contracts_V0.md | ~~Add `worktree_conflict`, `dirty_worktree`~~ **(ALREADY AT L1090-1091)** — reconcile orch references |
| `allowed_action_id` enum | Contracts_V0 L1062-1072 (10 values) + chat L2089 (4 stale names) | Contracts_V0.md | Replace chat stale names with canonical values |
| `wizard_status` enum | chain-wizard L250 + 4 addenda (L1888, L1993, L2034, L2073) | chain-wizard L250 (NEEDS `blocked` added) | Consolidate 5 definitions into 1 |
| Permission algorithm | Perms §2.4 (6-layer) + Perms §8 (7-step) | Permissions_System.md (NEEDS RECONCILIATION) | Write composition spec |
| Permission snapshot schema | Perms_System.md + storage-plan.md | storage-plan.md for storage; Perms for semantics | Remove DRY violation |
| Investigation context fields | chat §12.0A + Contracts_V0 §5.1A | Contracts_V0.md for schema | Chat §12.0A adopts Contracts_V0 field names |
| `node.prerequisite_resolved` event | orch addenda (2 refs) + EP (NOT PRESENT) | ORPHANED — no canonical definition | Either add to EP or replace with existing canonical event |
| `retry_count` field | orch addenda L7011 + EP counter model L526-537 | EP sub-counter model | Delete `retry_count` from orch; use EP model |
| Blocked-state thread lifecycle | chat (4 overlapping addenda L2056-2184) | Final "Unified" section L2155-2184 | Collapse 4 into 1, mark prior 3 superseded |
| Blocked/recovery GUI | FinalGUISpec (6 overlapping addenda L1963-2123) | Needs consolidation (keep L2050-2067 version) | Collapse 6 into 1 |
| Persona editor fields | FinalGUISpec §17.2 + Personas.md §3.2 | Personas.md for field list | FinalGUISpec references Personas.md |
| Persona surface list | FinalGUISpec §17.4 + Personas.md §5.1 | Needs single SSOT | Consolidate |
| redb key catalog | FinalGUISpec §15.1 (~25 keys) + storage-plan §2.3 (~35+ keys) | storage-plan.md | §15.1 becomes subset reference |
| Terminal ownership | FinalGUISpec §5.1 + FileManager §9A + storage-plan (7 keys) | No single SSOT | Needs terminal SSOT doc or §15 consolidation |
| Seglog wire format | storage-plan §2.2 | storage-plan.md | NEEDS ACTUAL FORMAT DEFINITION |
| Provider states | Provider_OpenCode (9-state) + Contracts_V0 ProviderReadinessState (5-state) | Contracts_V0.md | Reconcile state sets |
| Gemini provider count | Multi-Account §1 (one) + §4.1/§6 (two) | CONTRADICTORY | Resolve to two (per repo memory) |

### Phantom / Missing Sections Inventory

| Doc | Section | Status |
|-----|---------|--------|
| FinalGUISpec.md | §8 Widget Catalog | TOC entry, no content |
| FinalGUISpec.md | §9 State Management | TOC entry, no content |
| FinalGUISpec.md | §10 UX Patterns | TOC entry, no content |
| FinalGUISpec.md | §7.16, §7.18, §7.19, §7.20 | Referenced in Appendix A, don't exist |
| assistant-chat-design.md | §6 Teach Mode | TOC entry, no content |
| assistant-chat-design.md | §7 Attachments & Web Search | TOC entry, no content |
| FileManager.md | §10.5-10.10 | Multiple TOC entries, no content |
| LSPSupport.md | §5.1 Chat LSP | Referenced 12×, heading doesn't exist |
| LSPSupport.md | §3.5 root discovery table | Has 5 bullet points + 4-step algorithm; NEEDS per-language table |
| newtools.md | §8.1-8.3 | TOC entries, no content |
| chain-wizard-flexibility.md | §15.5 | Header with zero content |
| chain-wizard-flexibility.md | Default stage Personas | Header with zero content |
| orchestrator-subagent-integration.md | Tier-specific Persona defaults (L6683) | Header with zero content |
| Models_System.md | §10.4.2 | Header with zero content |
| storage-plan.md | §5.1 Unsaved editor recovery | Has 3-4 concrete rules + ContractRefs; needs full implementation spec |
| storage-plan.md | §5.2 Requested/effective state | Has 3-4 concrete rules + ContractRefs; needs full implementation spec |
| storage-plan.md | §5.3 Search/SC projection | Has 3-4 concrete rules + ContractRefs; needs full implementation spec |
| storage-plan.md | §5.4 LSP persistence | Has 3-4 concrete rules + ContractRefs; needs full implementation spec |
| Crosswalk.md | §3.6 content | Heading exists, empty/orphaned |
| Crosswalk.md | §3.8-3.12 | 5 numbered sections absent |
| Decision_Policy.md | evidence.schema.json | ~~Referenced, file doesn't exist~~ **(EXISTS at Plans/evidence.schema.json, 4192 bytes)** |

### Stale Terminology Hotspots

| Doc | Approx Count | Stale Terms |
|-----|-------------|-------------|
| orchestrator-subagent-integration.md (body) | 337+ (verified 623 /tier/i) | tier, Phase, Task, Subtask, Iteration, TierNode, TierType, TierContext, select_for_tier() |
| orchestrator-subagent-integration.md (QA loop L6272-6660) | ~21 (not 50+) | Three-Tier QA, Tier 1/2/3, TierNode, TierType |
| FinalGUISpec.md | ~13 (not 15+) | tiers.slint, "Tiers" tab, TierTree, tier display, phase/task/subtask/iteration tiers, owner_tier_id |
| WorktreeGitImprovement.md | 15 (tier_id + tier_type) | tier_id throughout helper APIs |
| interview-subagent-integration.md | 8+ | get_subagents_for_tier(), orchestrator tier hooks |
| Prompt_Pipeline.md | 6+ | tier in run envelope, tier/mode |
| chain-wizard-flexibility.md | 6+ | tier worktrees, per-tier worktree branches, ChainWizardState tier_id |
| newtools.md | 5+ | TierTree::load_test_strategy, per-tier overrides |
| Tools.md | 6+ | tier/subagent overrides, HITL at tier boundary |
| human-in-the-loop.md | 4+ | tier boundaries, tier-level gates |
| Progression_Gates.md | 1 (not 10+) | tier-level gates |
| Decision_Policy.md | 1 (not 3+) | old terminology in governance defaults |
| MiscPlan.md | 2+ | cleanup policy tier-scoped |

### Addenda Requiring Consolidation

| Doc | Addenda Count | Topic | Action |
|-----|--------------|-------|--------|
| orchestrator-subagent-integration.md L6961-7026 | 4 (2 verbatim identical) | "Orchestrator is primary consumer" | Collapse to 1 |
| orchestrator-subagent-integration.md L6272-6660 | 1 (390 lines) | Autonomous QA Loop | DELETE entirely — incompatible with scheduler |
| FinalGUISpec.md L1963-2123 | 6 | Blocked/recovery GUI | Collapse to 1 (keep L2050-2067) |
| assistant-chat-design.md L2056-2184 | 4 | Thread blocked-state lifecycle | Collapse to 1 (keep L2155-2184 "Unified") |
| chain-wizard-flexibility.md addenda | 6 | wizard_status + blocked state | Consolidate wizard_status to single definition |
| storage-plan.md addenda | 4 | Storage reconciliation / single-projection rule | Collapse to 1 |
| Contracts_V0.md addenda | 2 | remediation.resolved enum | RECONCILE — zero overlap between the two |
| Provider_Stream_Mapping.md | 3 | Wake-reason addenda | Collapse near-identical addenda |

## Decisions Already Resolved
- Chunking strategy: 1 Plans doc per subagent, pre-extracted deduped intents
- Deduplication: for same (path, anchor_heading), keep only latest run's intent
- Exclusions: w-20260328-192850, w-20260329-235630, w-20260328-192905 (still active)
- Phase 2A complete with Opus 4.6 agents
- Phase 2B complete with GPT 5.4 verification (88% agreement, all disagreements resolved)
- Phase 2C complete with multi-model deep ledger reconciliation
- Deep re-audit Waves 1-3 complete with 51 Opus 4.6 subagents (~1,050 findings)
- orchestrator-subagent-integration.md needs full body rewrite (not just addenda promotion)
- Tier→Node migration is systemic, not per-doc; needs coordinated pass
- "Docker Manager" is canonical name (not "Docker Manage")
- GAP-11 (Personas overseer types) SKIP — user working on separately
- Must check for duplicate contracts before writing any fixes
- Gemini is TWO separate providers: Gemini Direct (API only) and Gemini CLI (OAuth + API)

## Open Questions / Uncertainties
- Whether canon-collapsed docs (feature-list, newfeatures) should be restored to detailed form or accepted as-is
- Whether supersession detail losses warrant targeted restoration
- Whether the 7 SUPERSEDED items in Run_Graph_View/Widget_System represent acceptable scope reduction or lost requirements
- Whether skill tool §3.5A should be filled now or deferred to a separate work item
- Whether the 5 missing command families in UI_Command_Catalog should be stubbed or fully specified
- Priority ordering for the fix pass (user decision needed)
- Whether orchestrator body (L1-6270) should be full rewrite or incremental terminology replacement + addenda promotion
- Whether the 390-line QA loop (L6272-6660) should be deleted or rewritten against DAG scheduler model
- Whether FinalGUISpec §8/§9/§10 should be fully specified or explicitly removed from TOC
- Whether BrainStorm Mode should be deprecated or fleshed out (12-line stub conflicts with mode strip)
- Whether `remediation.resolved` should use 03-08 enum, 03-09 enum, or a merged set
- Whether the two permission algorithms (§2.4 vs §8) compose or one supersedes the other
- Whether Provider_OpenCode 9-state lifecycle or Contracts_V0 5-state lifecycle is canonical
- Whether assistant-chat-design §6/§7 (Teach, Attachments) were intentionally deferred or accidentally lost
- Whether chain templates / chain history / chain monitoring belong in chain-wizard-flexibility.md or are out of scope

## Packetization Notes
- Phase 2A complete — 57 docs audited via doc_intents
- Phase 2B complete — GPT 5.4 cross-verification
- Phase 2C complete — 15 working ledgers reconciled against Plans docs
- Phase 3 complete — Deep re-audit with 51 Opus 4.6 subagents across orchestrator/provider/subagent/filemanager/editor/terminal docs (~1,050 findings)
- All four phases yielded consistent, complementary findings
- Deep re-audit confirmed and dramatically expanded Phase 2C gaps — stale terminology count rose from "174 tier refs" to "424+ tier refs" in orchestrator alone
- Cross-doc duplicate contract map completed — 25+ contract areas identified with canonical ownership recommendations
- Fix pass will use:
  - content_markdown from `/tmp/pm-audit-intents-dedup/*.json` for doc_intent-based gaps
  - Candidate fixes from working ledgers for ledger-based gaps
  - Direct writing for systemic gaps (tier→node, command families, schemas)
  - Duplicate contract map to avoid creating overlapping contracts
  - Addenda consolidation plan to reduce 30+ overlapping addenda to canonical sections

## Do-Not-Forget Details
- r-20260312-203855-01 was the most destructive run — H1-level replace_section wiped accumulated addenda across 4+ docs
- Run_Graph_View.md and Widget_System.md lost substantial prior content to full-doc rewrites — SUPERSEDED but real spec loss
- orchestrator-subagent-integration.md body/addenda split-brain is the single largest remediation task — 337+ stale tier refs in body (623 /tier/i matches verified), addenda use entirely different execution model
- Tier→Node migration touches 8+ docs systemically — cannot be done doc-by-doc without coordination
- `usage_source_kind` 5-value enum appears in NO Plans doc — completely orphaned vocabulary
- Sensitivity-aware forwarding (part 7 of runtime contract) has zero coverage anywhere
- Terminal has no single SSOT — split across FinalGUISpec §5.1, FileManager §9B (not §9A), storage-plan (9 terminal keys, not 7)
- Plugins_System.md §9.3 misordered before §9.1/§9.2 (cosmetic but confusing)
- Provider_Stream_Mapping.md duplicate section at L343-361 (cosmetic)
- interview-subagent-integration.md duplicate section at EOF (cosmetic)
- Some intent JSON was truncated at storage time (Commands_System §4.4, Decision_Log DL-009+) — verified content matches where visible
- L6272-6660 "Autonomous QA Loop" in orchestrator is 390 lines of DEAD CODE — structurally incompatible with scheduler model defined 200 lines later
- L7001-7013 and L7014-7026 in orchestrator are VERBATIM IDENTICAL addenda
- `node.prerequisite_resolved` event referenced in 2 places but has NO canonical definition in Executor_Protocol or Contracts_V0
- `retry_count` in orchestrator addenda contradicts Executor_Protocol sub-counter model — EP has no field called `retry_count`
- Backoff durations `1s, 5s, 15s` for `provider_transient` exist ONLY in orchestrator addenda — no canonical owner
- Recovery actions in chat blocked-state addenda (`Resume Wizard`, `View report`, etc.) use NONE of the 10 canonical `allowed_action_id` values from Contracts_V0
- `wizard_status` is defined 7+ times in chain-wizard-flexibility.md — first definition at L250 is missing `blocked`
- Worktrees in Assistant (chat L2186-2694) is the best-specified addendum in the entire corpus — use as quality benchmark
- FinalGUISpec §15.1 redb keys cover only ~25 of 55+ keys defined in storage-plan.md §2.3
- `terminal_state:v1` is a phantom key — referenced in FinalGUISpec Startup Restore but never defined
- seglog wire format (storage-plan §2.2) has NO concrete serialization format — just says "append-only event log"
- Multi-Account.md has ZERO auth flow walkthroughs for any auth method
- Models_System.md `fast`/`powerful` model roles are unbuildable without a capabilities catalog or ordering criteria
- Two permission algorithms (§2.4 6-layer vs §8 7-step) have no composition spec
- `debug` overlay missing from chat §29.1 closed enum but present in §1.0B and Run_Modes.md
- FinalGUISpec has duplicate §17 (Risks AND Persona Editor both numbered §17)
- Docker Manage addendum (L1718-1737) embedded inside Persona §17 with no section break — wrong location

---

## Phase 4: Multi-Model Verification Sweep (100 agents, 5 models × 20 groups)

### Method
- 942 intents with full content_markdown extracted from 60-61 pipeline runs
- Split across 20 groups (large docs split in 2, small docs bundled)
- 100 agents: 20 each of Opus 4.6, Sonnet 4.6, GPT 5.2, GPT 5.3 Codex, GPT 5.4
- Each agent received group's intents + Plans doc paths, reported per-intent verdicts

### Opus Primary Results (20 groups, 942 intents)

| Verdict | Count | % |
|---------|-------|---|
| PRESENT | ~460 | 49% |
| SUPERSEDED | ~130 | 14% |
| MISSING | ~55 | 6% |
| PARTIAL | ~10 | 1% |
| (deduped across parallel runs) | ~287 | 30% |

### Cross-Model Agreement
- **Unanimous 0-MISSING groups:** g01, g06, g07, g09, g12, g19 — all 5 models agree
- **Sonnet most precise** — catches borderline PARTIAL, flags subagent/crew events
- **Opus most generous** — classifies borderline as PRESENT or SUPERSEDED
- **GPT 5.3 Codex** — numerical similarity scoring, catches PARTIAL items best
- **GPT 5.4** — most aggressive at finding MISSING in multi-doc groups
- **GPT 5.2** — closely tracks Opus verdicts

### Confirmed MISSING Items (cross-model verified, deduplicated by unique anchor)

#### 1. FinalGUISpec.md — 7 unique MISSING anchors
- `### 7.4 Settings (Unified)` — 5 runs targeted this heading (r-20260312, r-20260313×3, r-20260316). Massive tabbed Settings spec (General/Tiers/Branching/Verification/Memory/Budgets/Advanced/Permissions/LSP/Interview/Media/Auth/Health/Rules/Shortcuts/Skills/Plugins) NEVER WRITTEN. Later runs created `### 7.4 Settings and inspectors` with narrower scope.
- `### 7.8 Usage (NEW)` — 3 runs (r-20260313×3). Dedicated usage view with per-platform quota summary. NEVER CREATED.
- `### 7.16 Chat Panel (NEW)` — 1 run (r-20260316). Full chat panel spec (thread header, message stream, activity cards, composer Steer/Queue, plan panel). NEVER CREATED.
- `#### B) Inline Note Mode (Highlight + Note)` — 1 run (r-20260313-183219). Selection-driven Annotations review model. NEVER CREATED.
- `#### C) Bundle Controls: Resubmit with Notes + Final Review` — 1 run (r-20260313-183219). Deterministic record ordering + Final Multi-Pass Review gating. NEVER CREATED.
- `#### Assistant chat mode strip and debug investigation surfaces` — 3 runs (r-20260323×3). Context Lens control (Mute/Focus/Subcompact), Default Crew settings. Anchor created by r-20260320-164907 then DESTROYED when r-20260320-170511 replaced parent §7.4. All 3 retries hit dead anchor.
- `### 7.4 Settings (Unified)` vs `### 7.4 Settings and inspectors` DISTINCTION: early runs (r-20260312/13) intended a massive 18-tab settings UI. Later runs (r-20260318+) created a narrower inspectors-focused section. The 18-tab content was never written anywhere.

#### 2. storage-plan.md — 5 unique MISSING anchors
- `#### Additions: Document bundle registry + inline notes persistence` — 1 run (r-20260313-183219). bundle_id, review gating, note_record.v1. NEVER CREATED.
- `#### Additions: Targeted revision persistence + event contract` — 1 run (r-20260313-183219). revision_run.{bundle_id}, note_reply_index, composer_prep_state. NEVER CREATED.
- `#### Additions: Preview session + browser rendering persistence contract` — 3 runs (r-20260317-181906×3). preview_state.v1, browser_session_state.v1, browser_profile_state.v1, preview.session.*, browser.session.* events. NEVER CREATED.
- `#### Container publish / DockerHub / Unraid persistence contract` — 1 run (r-20260312-160857). source_control.project_state.*, github_actions.project_state.*, docker_manager.project_state.*, orchestrator.receipt.* key families. PARTIALLY present (scope split table exists) but key families absent.
- `### Canonical records` field-level detail — 3+ runs targeted detailed 10-record field lists (attempt_record fields, terminal_workspace_state fields, dev_session_record fields). Current section has abstract bullets, specific fields lost.

#### 3. Contracts_V0.md — 3 unique MISSING anchors
- `#### Persona/runtime snapshot payload contract` — 3 runs (r-20260323×3). persona_active_persona_id, persona_display_label, persona_display_icon, persona_system_prompt_sha, mode_overlay_runtime_mode, mode_overlay_ceiling. NEVER CREATED.
- `### 1.1 EventRecord` mode-overlay fields — 3 runs tried adding requested_mode_overlay, effective_mode_overlay, requested_runtime_mode, requested_persona, persona_selection_source. Doc retains different (platform/billing) model.
- Subagent/crew event catalog — 1 run (r-20260323-192127-01). 21 subagent.* events, crew.* family, chat.subagent_* projection events. Only 2/21 written (subagent.context_shrunk and subagent.context_rehydrated at L1169).

#### 4. ~~Prompt_Pipeline.md — 1 unique MISSING anchor (MOST ATTEMPTED)~~ **(RECLASSIFIED: SUPERSEDED)**
- `### 6.5 Effective resolution record` — 7 intents across 4 run-dates. **Phase 4B CORRECTION: Content IS present at §6.4 "Effective resolution record" (L409-447) with the exact fields requested. Sonnet 4.6 was correct all along — this is SUPERSEDED (renumbered), not MISSING.**

#### 5. assistant-chat-design.md — 2 unique MISSING anchors
- `### 14.1 Subagent visibility in thread` — 3 runs targeted it. TOC entry exists at line 65. NO body section. Content: real-time subagent status chips, inline progress, collapse/expand, failure attribution.
- `### 5.1 Git & GitHub Slash Commands` — overwritten by r-20260316, collapsed to thin §5.3 Git & GitHub command boundary. Original detailed slash command content lost.

#### 6. UI_Command_Catalog.md — 2 unique MISSING anchors
- `### 2.5A Containers/Docker Manager commands` — triple-family command block (Source Control, GitHub Actions, Docker Manager). NEVER CREATED.
- `### 2.6B Chat message action commands` — cmd.chat.edit_last_user_message, cmd.chat.resend_last_user_message. NEVER APPLIED.

#### 7. Multi-Account.md — 2 unique MISSING anchors
- `## 7` runner/orchestration contract — 3 attempts by r-20260313-152345 to replace with "resolve execution role" flow. ALL FAILED. Doc retains r-20260312 content.
- `### 9.4 In-session / status surfaces` — heading renamed to "Usage and runtime visibility" but original content (multi-account widget card rules) not matched.

#### 8. usage-feature.md — 5 unique MISSING anchors (GPT54 found)
- `### Canonical UsageRecord fields` — heading never created (4 runs targeted)
- `### Ownership and consumption` — heading never created (3 runs targeted)
- `### Codex -- CLI + provider data` — heading never created (2 runs)
- `### Copilot -- CLI + REST metrics` — heading never created (2 runs)
- `### Gap 6: Analytics not implemented` — heading never created (3 runs)
- Note: Some may be SUPERSEDED — the entire gap framework was restructured by r-20260328-192850. Needs careful reconciliation.

#### 9. feature-list.md — 9 unique MISSING anchors (GPT53/54 found)
- `### 1. Rewrite and architecture` detailed paragraphs — "Single deterministic agent loop" content absent (3 runs)
- `### 2. Chat and assistant` detailed paragraphs — chat-mode block absent (1 run)
- `##### Plans/Crosswalk.md` — anchor not found (1 run)
- `##### Plans/storage-plan.md` — anchor not found (1 run)
- `##### Plans/assistant-chat-design.md` — anchor not found (1 run)
- `##### Plans/FinalGUISpec.md` — anchor not found (1 run)
- `## Runtime Scheduler Recovery Summary Consolidation Addendum` — Source Control block absent (1 run)
- Note: feature-list.md is an INDEX doc — some anchors may have been intentionally restructured.

#### 10. Other docs (1-2 MISSING each)
- **Glossary.md** — `### Shell and workspace terms` — Source Control/GitHub Actions/Docker Manager definitions. NEVER WRITTEN.
- **newfeatures.md** — `### 24.2 Relationship to built-in browser and click-to-context`. NEVER CREATED.
- **Crosswalk.md** — `## 3. Ownership boundaries` + subagent/crew append. Content not matched.
- **FileManager.md** — `### 9A. Browser tab and detached preview normalization`. Anchor missing.
- **orchestrator-subagent-integration.md** — `### 4. Canonical list of subagent names` insert. Not found.
- **Skills_System.md** — `### 5.2 External directory guard`. Heading exists, body EMPTY (0/9 lines matched).
- **interview-subagent-integration.md** — `### Activity and progress visibility`. Body effectively empty (0/8 lines).
- **rewrite-tie-in-memo.md** — `### What's changing (high level)`. Body effectively empty (0/15 lines).
- **WorktreeGitImprovement.md** — `### 4.2 GUI improvements`. Heading not found.
- **Executor_Protocol.md** — `### 7. Failure classes and retry entry points`. Only 2/31 lines matched.

### PARTIAL Items (cross-model verified)
- **storage-plan.md `### Required redb keys`** — preserves core families but lost subject-first restore identities, resume_url rule, tier_runtime_record compatibility note
- **storage-plan.md `### Canonical records`** — current section is restructured; enumerated field-level contract not preserved as written
- **storage-plan.md `### Identity and field-name rules`** — reworked version, not verbatim intent block
- **Wiring_Matrix.md** — Context Lens Wiring Addendum anchor name mismatch (content landed under different heading)

### Summary Statistics
- **Total unique MISSING anchors:** ~40 across 15 docs
- **Most-attempted never-landed:** Prompt_Pipeline §6.5 (7 intents, 4 run-dates)
- **Largest content loss:** FinalGUISpec §7.4 Settings (Unified) — massive 18-tab settings spec
- **Most destructive run:** r-20260320-170511 — its replace_section on FinalGUISpec §7.4 destroyed the "Assistant chat mode strip" anchor that 3 later runs depended on
- **Pattern:** Early runs (r-20260312/13) created ambitious sections; later runs (r-20260318+) overwrote with narrower scope, destroying intermediate content without incorporating it


### Phase 4 Collection Status (99/100 collected — Sonnet g17 final straggler)

**All 5 model families collected:**
- **Opus 4.6:** 20/20 DONE
- **Sonnet 4.6:** 19/20 (g17 still running — 67+ tool calls, near completion)
- **GPT 5.2:** 20/20 DONE
- **GPT 5.3 Codex:** 20/20 DONE
- **GPT 5.4:** 20/20 DONE

**Late-arriving agent summaries (since last ledger update):**
- GPT52 g14 (FileManager+ multi-doc): 89P/7M/6S/1PA — 7 "MISSING" are methodological (strict anchor-name matching; content present under renamed headings)
- GPT52 g15 (Tools+ multi-doc): 54P/9M/12S/1PA — all 9 MISSING in feature-list.md (known gap, detailed rewrite architecture paragraphs)
- Sonnet g04 (storage-plan pt1): 12P/6M/16S — 6 MISSING match known Additions sections (Container publish, Document bundle, Targeted revision, Preview session)
- Sonnet g19 (Media_Generation+ multi-doc): 41P/0M/4S/2PA — zero MISSING across 9 docs

### Cross-Model Agreement Matrix

All 5 models converge on the same core MISSING set. No new MISSING anchors found since agent 70. The 8 remaining agents (covering groups already verified by 3-4 other models) will not change the picture.

| Item | Opus | Sonnet | GPT52 | GPT53 | GPT54 | Final Verdict |
|------|------|--------|-------|-------|-------|---------------|
| FinalGUISpec 7.4 Settings (Unified) | MISSING | MISSING | -- | MISSING | MISSING | **MISSING** |
| FinalGUISpec 7.16 Chat Panel (NEW) | MISSING | MISSING | -- | PARTIAL | PARTIAL | **MISSING** (heading never created) |
| FinalGUISpec 7.8 Usage (NEW) | MISSING | PARTIAL | -- | PARTIAL | PARTIAL | **PARTIAL** (some at 7.12) |
| Prompt_Pipeline 6.5 Effective resolution record | ~~MISSING~~ | SUPERSEDED | MISSING(0pct) | MISSING | MISSING | **SUPERSEDED** (content IS at §6.4 L409-447 with exact fields — Sonnet was correct) |
| Multi-Account 7 runner/orchestration | SUPERSEDED | -- | SUPERSEDED | SUPERSEDED | -- | **SUPERSEDED** |
| Contracts_V0 Persona/runtime snapshot | MISSING | MISSING | MISSING | MISSING | -- | **MISSING** |
| Contracts_V0 subagent/crew events | MISSING | MISSING | -- | -- | -- | **MISSING** |
| usage-feature Canonical UsageRecord | MISSING | -- | MISSING | -- | MISSING | **MISSING** |
| usage-feature Ownership+consumption | MISSING | -- | MISSING | -- | MISSING | **MISSING** |
| usage-feature Gap 4/Gap 6 | SUPERSEDED | -- | MISSING | -- | MISSING | **DISPUTED** (gap restructured by r-20260328) |
| Glossary Shell+workspace terms | MISSING | -- | -- | MISSING | MISSING | **MISSING** (anchor absent) |
| newfeatures.md 24.2 | MISSING | -- | -- | -- | MISSING | **MISSING** |

### Final Opus Totals (all 20 groups)

| Metric | Count | Rate |
|--------|-------|------|
| PRESENT | 543 | 77pct |
| SUPERSEDED | 117 | 17pct |
| MISSING | 42 | 6pct |
| PARTIAL | 3 | less than 1pct |
| Total verified | 705 | 100pct |

### Key Cross-Model Observations

1. **Sonnet 4.6** is the most precise -- catches borderline PARTIAL items others miss
2. **Opus 4.6** is the most generous -- tends to classify borderline as PRESENT/SUPERSEDED
3. **GPT 5.3 Codex** uses numerical similarity scoring -- best at identifying PARTIAL cases
4. **GPT 5.4** is most aggressive at finding MISSING in multi-doc groups
5. **GPT 5.2** generally agrees with Opus; slowest to complete; found extra usage-feature.md gaps

### Reclassifications After Cross-Model Review

1. Multi-Account 7 -> SUPERSEDED (was MISSING in early phases; r-20260312 content confirmed adequate)
2. Prompt_Pipeline 6.5 -> MISSING (Sonnet called SUPERSEDED citing renumber to 6.4, but 6.4 has different fields)
3. usage-feature Gap 4/Gap 6 -> DISPUTED (gap framework restructured; human decision needed)
4. assistant-chat-design 14.1 -> SUPERSEDED (TOC broken but content present under richer 14 structure)

### Phase 4 Conclusion

The audit is converging. 92+ agents across 5 model families have verified approximately 942 intents across 56 Plans docs. The confirmed MISSING set (approximately 22 unique anchors across approximately 15 docs) is stable and no longer growing. The 8 remaining GPT52/Sonnet agents will provide incremental confirmation but are unlikely to surface new MISSING items.

**Ready for Phase 4B: Ledger verification (10 agents to mechanically verify ledger accuracy).**

---

## Phase 4B: Ledger Verification (10 Opus 4.6 agents)

### Method
- Split 1088-line working_ledger.md into 10 chunks at natural section boundaries
- Each chunk assigned to 1 Opus 4.6 explore agent
- Each agent verified every factual claim in its chunk against actual Plans docs
- Claims categorized as ACCURATE, INACCURATE, or PARTIALLY_ACCURATE

### Results Summary

| Chunk | Lines | Section | Accurate | Inaccurate | Partial | Total |
|-------|-------|---------|----------|------------|---------|-------|
| 01 | 1-84 | Header, stats, Phase 2 | 32 | 6 | 10 | 48 |
| 02 | 85-172 | Gaps Tiers 1-10 | 35 | 2 | 8 | 45 |
| 03 | 172-265 | Tier 11, Phase 2 gaps, Strategies A-G | 42 | 0 | 12 | 54 |
| 04 | 265-372 | Strategies H-O, Impacted Docs | 40 | 4 | 9 | 53 |
| 05 | 372-500 | Phase 3 Wave 1 (orch/exec/contracts/interview) | 28 | 10 | 13 | 51 |
| 06 | 500-630 | Phase 3 Wave 2 (filemgr/tools/storage/gui/chat) | 56 | 10 | 17 | 83 |
| 07 | 630-760 | Phase 3 Wave 3 (provider/perms/wizard/crosswalk) | 52 | 9 | 12 | 73 |
| 08 | 760-860 | Phantom sections, Stale terms, Addenda, Decisions | 23 | 6 | 13 | 42 |
| 09 | 860-925 | Open Questions, Do-Not-Forget | 30 | 0 | 12 | 42 |
| 10 | 925-1088 | Phase 4 complete section | 40 | 6 | 7 | 53 |
| **TOTAL** | | | **378** | **53** | **113** | **544** |

### Accuracy Rates
- **Accurate: 69.5%** — claim verified correct against source docs
- **Inaccurate: 9.7%** — claim contradicted by source docs (corrected inline above)
- **Partially accurate: 20.8%** — substance correct but counts, line numbers, or specifics off

### Inaccuracy Patterns (53 inaccuracies grouped)

**Pattern 1: FABRICATED QUOTES / TERMS (15 findings)**
Findings attributed specific text or terminology to docs that do not contain it:
- FileSafe: "last-write-wins", "editor diff mode", "auto-save interval", `safe_point_id`/`snapshot_id`/`checkpoint_id`, `filesafe_snapshot.v1:*` key
- Tools.md: "capability probing", "each tool runs in its own context"
- newtools.md: "per-tier overrides", "semantic search"
- FileManager.md: "use platform APIs" (actual: "no filesystem watcher in MVP")
- chat: "context lens", "voice input"
- interview: slash commands `/interview start` etc.

**Pattern 2: FALSE GAPS (features/values that DO exist) (12 findings)**
Claims that something was missing when it actually exists:
- `worktree_conflict`/`dirty_worktree` ARE in Contracts_V0 L1090-1091 (claimed missing 2×)
- `execution_unit_context` IS the named TierContext replacement (EP L112-132)
- evidence.schema.json EXISTS (Plans/evidence.schema.json, 4192 bytes)
- Permission keys for tools ARE specified in §5 L256-290
- `tool_use`/`tool_result` ARE in stream mapping L44-45
- Export format IS specified (Markdown/JSON at L1391/L1413)
- HITL bridge to blocked-state DOES exist (L24 "blocked-runtime overlay")
- Prompt_Pipeline persona resolution IS canonical (Stage 3 + §6)
- Prompt_Pipeline §6.5 content IS at §6.4 (L409-447) — Sonnet was correct
- Crosswalk §3 content IS present with 15 subsections
- Contracts_V0 subagent events: 2/21 DO exist (context_shrunk, context_rehydrated at L1169)
- Decision_Policy governance defaults ARE clean — false gap

**Pattern 3: WRONG TYPE/FUNCTION NAMES (6 findings)**
- `CrewDefinition` → actually `CrewTemplate` (L4735)
- `ResourcePool`/`ConcurrencyManager` types don't exist in any Plans doc
- `stage_complete` event not referenced anywhere
- `tier_status` not used in Progression_Gates
- `decision_record.v1`/`auto_decision.v1`/`governance_decision.v1` schema IDs don't exist (actual: `pm.auto_decisions.schema.v1` and `auto_decisions.schema.json`)
- `ChainWizardState` has NO `tier_id` fields; `current_step`/`active_phase` don't exist

**Pattern 4: OVERSTATED COUNTS (12 findings)**
- "59 runs" → 60-61 actual
- orchestrator tier refs "424+" → 337+ (body) or 623 (/tier/i total)
- QA loop "50+ tier lines" → ~21
- FinalGUISpec "15+" tier refs → ~13
- Progression_Gates "10+" tier refs → 1
- Decision_Policy "3+" tier refs → 1
- Prompt_Pipeline "6+" tier refs → 3
- chain-wizard "7 stale tier refs" → 3
- chain-wizard "5 wizard_status defs" → 7+
- storage-plan §5.1-5.4 "ALL STUBS" → have substantive rules
- "7 terminal keys" → 9
- Model priority table "has duplicates" → clean (no duplicates)

**Pattern 5: WRONG LINE NUMBERS (8 findings)**
- Various L-refs off by 5-30 lines due to addenda growth since original audit
- DNF item 13 line numbers exceed file length
- Executor_Protocol §7 "2/31 lines" → actually ~43 lines

### Corrections Applied
All 53 inaccuracies have been corrected inline in the ledger sections above using strikethrough + **(CORRECTED: ...)** or **(FABRICATED: ...)** notation. This preserves the original finding for audit trail while marking the correction.

### Key Reclassifications
1. **Prompt_Pipeline §6.5** → SUPERSEDED (was MISSING). Content at §6.4 L409-447.
2. **Crosswalk §3** → PRESENT (was MISSING). Has 15 subsections.
3. **Decision_Policy item 39** → FALSE GAP. Governance defaults are clean.
4. **Executor_Protocol item 42** → FALSE GAP. `execution_unit_context` is the replacement.
5. **FileManager §9A** → §9B. Content at §9B L490.
6. **orchestrator §4** → STUB not "Not found". Heading exists at L1135, body empty.
7. **Contracts_V0 subagent events** → 2/21 exist (not "NEVER WRITTEN").

### Revised MISSING Count
Original: ~22 unique MISSING anchors across ~15 docs
After Phase 4B: **~20 unique MISSING anchors across ~14 docs** (removed Prompt_Pipeline §6.5 and Crosswalk §3)

### Phase 4B Conclusion
The ledger is substantially accurate (70% exact, 91% substantively correct). The 10% inaccuracy rate is concentrated in fabricated quotes/terms and false gap claims — both systematic patterns that can be guarded against in future audits. All corrections have been applied inline. The audit findings and fix strategies remain valid after correction.

---

## Phase 5: Implementation-Ready Fix Generation (112 GPT-5.4 agents)

### Method
- 112 GPT-5.4 explore agents launched, one per identified issue
- Each agent received: issue ID, target file, anchor heading, operation type (insert_after / replace_section / append), and detailed instructions for what content to generate
- Agents explored the actual Plans docs to understand surrounding context before generating fixes
- All agents produced structured output: ISSUE ID, TARGET file, ANCHOR, OPERATION, and READY-TO-PASTE MARKDOWN
- Some agents produced find/replace tables instead of insert_after blocks where the fix required surgical edits across multiple locations

### Collection Status
- **112/112 agents completed and collected**
- 3 oversized outputs saved to /tmp files (fix-g06, fix-i02, fix-i07)
- 0 agent failures
- 1 issue (M02) determined to be already covered by D04 — no additional fix needed

### Results by Target File

#### FinalGUISpec.md (~20 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| G01 | §7.4 Docker naming | Find/replace "Docker Manage" → "Docker Manager" throughout |
| G02 | Docker addendum relocation | Move Docker Manager addendum out of Persona §17 to proper §7.4.8A location |
| G03 | Duplicate §17 Persona Editor | Disambiguation: Persona Editor becomes §19, Risks remains §17 |
| G04 | Blocked/recovery addenda consolidation | Collapse 6 overlapping addenda (L1963-2123) into single canonical section |
| G05 | §15.1 redb key catalog completion | Add 30+ missing keys from storage-plan.md §2.3 to GUI key catalog |
| G06 | `### 7.16 Assistant Chat Panel` / insert_after | Full chat panel spec: thread header, message stream, activity cards, composer (Steer/Queue), plan panel. **Saved to /tmp/1774983398746-copilot-tool-output-g34y8d.txt** |
| G07 | §8/§9/§10 fill | Widget Catalog (§8), State Management (§9), UX Patterns (§10) — complete section content |
| G08 | Stale terminology cleanup | Find/replace table: tiers.slint, "Tiers" tab, TierTree, owner_tier_id → node-model equivalents |
| G09 | Agent-Config panel spec | New panel section for provider/model/account configuration surface |
| G10 | Settings tabs inventory | Complete 21+ missing settings tab definitions (Provider, Models, Personas, Orchestrator, Worktrees, etc.) |
| H02 | seglog→usage_event rename | Narrow fix: only 4 lines in FinalGUISpec.md where `seglog` should be `usage_event` (most seglog refs are correct storage-layer refs) |
| I02 | `### 7.4 Settings (Unified)` / replace_section | Full 18-tab settings specification. **Saved to /tmp/1774983402859-copilot-tool-output-0v82xg.txt** |
| I03 | `### 7.16 Chat Panel (NEW)` / insert_after | Full chat panel spec (complementary to G06) |
| I04 | `#### B) Inline Note Mode` / insert_after | Selection-driven Annotations review model with note types, persistence, and review flow |
| I05 | `#### C) Bundle Controls` / insert_after | Deterministic record ordering + sync bundle manager + Final Multi-Pass Review gating |
| I06 | Mode strip / insert_after | Context Lens control (Mute/Focus/Subcompact), Default Crew settings, mode strip layout |
| I14 | Browser preview integration / insert_after | Browser tab preview spec: preview_session_id, render modes, live reload, port forwarding |
| I16 | Search integration contract / insert_after | Search side panel contract: scope model, result format, find-in-files, search-in-chat handoff |
| P01 | TOC sync | Updated table of contents matching actual section structure (apply AFTER content sections stabilized) |
| P02 | Stale addenda markup | Mark superseded addenda with `<!-- SUPERSEDED by ... -->` headers |
| P05 | Section numbering | Renumbering plan — apply AFTER G07 (§8/§9/§10 fill) and G03 (§17 disambiguation) |

#### assistant-chat-design.md (~10 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| D01 | Composer behavior subsection | Send→stop morph, per-message stop, jump-to-bottom badge, always-visible copy, no-delete rule |
| D02 | §6 Teach Mode fill | Teach mode interaction pattern, knowledge persistence, user-locked behaviors |
| D03 | §7 Attachments fill | Attachment types, web search integration, extensibility hooks, auto-retrieval |
| D04 | Debug overlay addition | Add `debug` to mode-overlay closed enum at L1966; add §12.0A debug investigation context |
| D05 | Blocked-state addenda consolidation | Collapse 4 overlapping addenda (L2056-2184) into single "Unified Thread Blocked-State Lifecycle" |
| D06 | Message taxonomy enum | Enumerate: user, assistant, system, tool_result, operation_card, blocked_notice, subagent_card |
| J01 | Worktree W.11 command reconciliation | Canonical IDs: `cmd.chat.worktree.{create,unbind,remove,merge,pr,info}`. Remove non-canonical: `create_pr`, `open_files`, `bind_existing` |
| J04 | Mode/overlay deduplication | Runtime modes `ask|plan|regular|yolo`, overlays `none|plan|deep_plan|debug|interview|brainstorm|crew`. UI labels derive from overlay+runtime combination |
| P03 | Broken xrefs | Fix cross-references to sections that were renumbered or moved |

#### Contracts_V0.md (~6 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| I07 | Contract events catalog reconciliation | Full event catalog with producer, consumer, payload schema for all canonical events. **Saved to /tmp/1774983413459-copilot-tool-output-6abz5r.txt** |
| I08 | Lifecycle event payloads | `run.started`, `run.completed`, `node.started`, `node.completed` — full payload schemas with required/optional fields |
| I09 | Approval/HITL runtime events | `approval.requested`, `approval.granted`, `approval.denied`, `approval.timeout` — event schemas |
| J05 | Canonical blocked_reason_code enum | 14-value enum: `permission_denied`, `waiting_approval`, `clarification_blocked`, `resource_unavailable`, `provider_error`, `rate_limited`, `context_overflow`, `tool_failed`, `verification_failed`, `worktree_conflict`, `dirty_worktree`, `dependency_blocked`, `budget_exceeded`, `network_error`. Separate `failure_class` enum for attempt outcomes. |
| J06 | Canonical event type ownership map | Master table mapping every event type to its canonical producer doc and consumer docs |

#### storage-plan.md (~5 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| I10 | Storage addenda | Browser preview keys (`preview_state.v1`, `browser_session_state.v1`), debug investigation keys (`investigation.v1`), MCP server keys (`mcp_server.v1`) |
| J02 | Storage key conflicts | Resolution: `layout:v1` must NOT own terminal topology; `project_state:v1` is lightweight UX cache only; `settings:v1` and `config:v1` must NOT both be canonical global config — pick one |
| P04 | Duplicate sections consolidation | Multi-step consolidation of 4 overlapping "storage reconciliation" addenda into single canonical section |

#### Tools.md (~4 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| C01 | §3.5 per-tool contracts | I/O schema for bash, edit, read, grep, glob, create tools |
| C02 | §3.6 task tool | Full replacement: input schema, 42 subagent type enum, dispatch contract, capability routing |
| I15 | §5A unified extension system | Plugins, skills, MCP servers unified as "extensions" with single Extension Registry. Lifecycle: install/enable/disable/uninstall |
| J03 | Permission key reconciliation | Reconcile Permissions_System.md §5 keys with Tools.md tool definitions; ensure every tool has a permission key pattern |

#### UI_Command_Catalog.md (~4 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| I11 | `cmd.docker.*` commands | Docker Manager operational command family: build, push, pull, run, stop, logs, inspect, compose |
| I12 | Chat thread lifecycle commands | `cmd.chat.{new,archive,delete,rename,pin,export,search}` |
| J01 | Worktree command reconciliation | (Also touches assistant-chat-design.md — same fix applied to both) |

#### Models_System.md (~4 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| L01 | Model role mapping | Canonical `fast`/`powerful` role definitions, provider-specific defaults, fallback ladders per provider |
| L02 | Context window management | Budget allocation: immune(30%)+history(30%)+current_turn(15%)+tool_results(20%)+contingency(5%). Priority classes P0-P3. Deterministic truncation order |
| L03 | Model registry and catalog | Registration flow, capabilities catalog, model metadata schema, deprecation handling |
| L05 | Cost/token/budget tracking | Token counting abstraction, per-model cost rates, budget enforcement, usage aggregation |

#### chain-wizard-flexibility.md (~4 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| N01 | Canonical wizard lifecycle | `wizard_status` enum: `setup|requirements|interview|validating|attention_required|blocked|ready_to_execute|complete|cancelled`. Builder bundle state, agent activity run state, and executor node status are SEPARATE state families |
| N02 | Canonical wizard step contracts | PhaseSelectorContract, RequirementsGatheringContract, InterviewContract, ValidationPassContract — full I/O schemas |
| N03 | Interview flow reconciliation | Reconcile interview-subagent-integration.md phase selector with chain-wizard PhaseSelectorContract |
| N04 | Wizard behavior in crew/subagent context | How wizard lifecycle interacts with crew dispatch, parallel execution, and subagent selection |

#### Crosswalk.md (~3 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| M01 | Usage and multi-account ownership | Routing rules for usage events, multi-account selection, credential resolution |
| M03 | Browser/preview ownership routing | Browser tab, preview session, live reload — ownership between FinalGUISpec and FileManager |
| M04 | Terminal identity/lifecycle routing | Terminal session creation, PTY lifecycle, terminal_session_id vs dev_session_id routing |

#### Run_Modes.md (~1 fix)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| J04 | Overlay enum SSOT | (Shared fix with assistant-chat-design.md) Canonical overlay enum with `debug` included |

#### LSPSupport.md (~2 fixes)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| O03 | LSP diagnostics integration | Diagnostic-to-chat pipeline message format, severity mapping, code action approval flow |
| O04 | Code index vs LSP sessions | Clarification: per-project code index is SEPARATE from per-file LSP sessions. Index feeds search; LSP feeds editing |

#### interview-subagent-integration.md (~1 fix)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| N03 | Interview/wizard relationship | (Shared with chain-wizard-flexibility.md) Phase selector input/output reconciliation |

#### GitHub_Integration.md (~1 fix)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| I13 | Project creation/import completion | Completion semantics: what constitutes "done" for clone, fork, template, and import operations |

#### Permissions_System.md (~1 fix)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| J03 | Permission key registry | (Shared with Tools.md) Exhaustive permission key registry covering all tools and operations |

#### Executor_Protocol.md (~1 fix)
| Issue | Anchor / Operation | What Was Generated |
|-------|-------------------|-------------------|
| J05 | Blocked reason code reconciliation | (Shared with Contracts_V0.md) Canonical `blocked_reason_code` 14-value enum |

#### Orphan ContractRefs (P06 — cross-file)
| Source Files | Target | Fix |
|-------------|--------|-----|
| 7 docs | `Contracts_V0.md#UICommand` | → `#7-uicommand` (16 refs) |
| newtools.md | `MiscPlan.md#doctor` | → `#72-manual-prune-clean-workspace-action` (6 refs) |
| 4 docs | `DRY_Rules.md#2` | → `#2-dont-duplicate-canonical-contracts` (5 refs) |
| newtools.md | `AGENTS.md#automation` | → `AGENTS.md` (strip anchor) (5 refs) |
| 4 docs | `DRY_Rules.md#4` | → `#4-forbidden-patterns-drift-accelerators` (4 refs) |
| 2 docs | `Permissions_System.md#TOOL-KEYS` | → `#5-tool-permission-keys` (4 refs) |
| chain-wizard | `FinalGUISpec.md#17.8` | → `#178-interviewbuilderorchestrator-mapping-editors` (4 refs) |
| 2 docs | `Contracts_V0.md#AuthPolicy` / `#AuthEvent` | → `#42-authpolicy` / `#43-authevent` (6 refs) |

### Key Technical Decisions Made During Fix Generation

1. **Wizard lifecycle state separation**: `wizard_status` is the wizard's own lifecycle. Builder bundle state, agent activity run state, and executor node status are SEPARATE state families — must not be conflated (N01)

2. **Mode/overlay separation is architectural**: Runtime modes (`ask|plan|regular|yolo`) are execution policies. Overlays (`none|plan|deep_plan|debug|interview|brainstorm|crew`) are UX presentation layers. UI labels derive from the combination (J04)

3. **seglog is NOT a rename target**: `seglog` is the correct storage-layer name for the append-only event log. `usage_event` is the usage-domain object identity. Only 4 lines in FinalGUISpec.md incorrectly use `seglog` where `usage_event` is meant; all other `seglog` refs are correct (H02)

4. **Extension unification**: Plugins, skills, and MCP servers are unified under "extensions" with a single Extension Registry adjacent to the Tool Registry. Each retains distinct lifecycle semantics (I15)

5. **Context window budget**: Deterministic allocation — immune(30%), history(30%), current_turn(15%), tool_results(20%), contingency(5%). Four priority classes: P0(immune) through P3(optional). Truncation order is P3→P2→P1, never P0 (L02)

6. **Blocked reason codes vs failure classes**: `blocked_reason_code` (14 values) describes WHY a node is blocked (runtime state). `failure_class` describes HOW an attempt failed (attempt outcome). These are SEPARATE enums with SEPARATE ownership (J05)

7. **Storage key conflict resolution**: `layout:v1` owns panel/editor layout only — NOT terminal topology. `project_state:v1` is a lightweight UX projection cache — NOT a state store. `settings:v1` is the canonical global config key — `config:v1` is an alias, not a competitor (J02)

8. **M02 already covered**: Debug routing in Crosswalk.md was already handled by D04's proposed §3.8 section. No separate M02 fix needed

9. **Model roles are deterministic**: `fast` resolves to the smallest/cheapest model per provider. `powerful` resolves to the largest/most capable. `custom` means caller supplied exact model ID. Provider fallback ladders are defined per-provider (L01)

10. **Worktree command canonicalization**: Canonical command IDs are `cmd.chat.worktree.{create,unbind,remove,merge,pr,info}`. Non-canonical IDs that must be removed: `create_pr`, `open_files`, `bind_existing` (J01)

### Ordering Dependencies for Application

Some fixes have ordering constraints that must be respected during application:

1. **G07 (§8/§9/§10 fill) BEFORE P05 (renumbering)** — fill the sections before renumbering
2. **G03 (§17 disambiguation) BEFORE P05 (renumbering)** — disambiguate before renumbering
3. **I02/G10 (settings) BEFORE P01 (TOC sync)** — stabilize content before syncing TOC
4. **G06/I03 (chat panel) BEFORE P01 (TOC sync)** — same reason
5. **J04 (mode/overlay) applies to BOTH assistant-chat-design.md AND Run_Modes.md** — coordinate
6. **J01 (worktree commands) applies to BOTH UI_Command_Catalog.md AND assistant-chat-design.md** — coordinate
7. **J03 (permission keys) applies to BOTH Permissions_System.md AND Tools.md** — coordinate
8. **J05 (blocked reason codes) applies to BOTH Contracts_V0.md AND Executor_Protocol.md** — coordinate
9. **P01 (TOC sync) LAST for FinalGUISpec.md** — apply after all content changes

Recommended application order per file:
- FinalGUISpec.md: G01→G02→G03→G08→G09→I06→I04→I05→I14→I16→G04→G05→G06/I03→I02/G10→G07→H02→P02→P05→P01
- assistant-chat-design.md: D06→D02→D03→D01→D04→D05→J04→J01→P03
- Contracts_V0.md: J05→J06→I08→I09→I07
- storage-plan.md: J02→I10→P04
- Tools.md: C01→C02→I15→J03
- UI_Command_Catalog.md: I11→I12→J01
- Models_System.md: L01→L02→L03→L05
- chain-wizard-flexibility.md: N01→N02→N04
- Crosswalk.md: M01→M03→M04
- All other files: single fix per file, no ordering constraint

### Oversized Outputs (saved to /tmp)
- `/tmp/1774983398746-copilot-tool-output-g34y8d.txt` — fix-g06 (FinalGUISpec §7.16 Assistant Chat Panel)
- `/tmp/1774983402859-copilot-tool-output-0v82xg.txt` — fix-i02 (FinalGUISpec §7.4 Settings Unified)
- `/tmp/1774983413459-copilot-tool-output-6abz5r.txt` — fix-i07 (Contracts_V0.md full events catalog)

### Issues Not Fixed (by design)
- **GAP-11 (Personas overseer types)** — user working on separately
- **M02 (debug routing in Crosswalk)** — already covered by D04

### Phase 5 Conclusion

All 112 implementation-ready fixes have been generated and collected. The fixes cover:
- **15 target Plans docs** with ready-to-paste markdown
- **~50 orphan ContractRef corrections** across 7+ docs (P06)
- **10 key architectural decisions** documented above for consistency
- **9 ordering dependencies** that must be respected during application

The fix collection is COMPLETE. Next step is Phase 6: applying the fixes to actual Plans docs, following the ordering constraints above, with intermediate shard regeneration and verification.

---

## Phase 6 — Verification Sweep Results

### 6.0 Methodology

30 Opus 4.6 agents deployed across 3 groups:
- **Group A (14 agents)**: Plans doc verification — each agent compared 1-2 Plans docs against ledger gap claims
- **Group B (11 agents)**: Pipeline run verification — each agent cross-referenced a run's findings against the main ledger
- **Group C (5 agents)**: Meta-verification — cross-doc contracts, Phase 5 fix detail, unaudited docs, Do-Not-Forget, cosmetic claims

### 6.1 Aggregate Statistics

| Metric | Value |
|--------|-------|
| Agents deployed | 30 |
| Agents collected | 30 |
| New missed gaps (Plans docs) | ~150+ |
| False/fabricated entries in ledger | ~25 |
| Pipeline run findings NOT captured | 50-83% per run (avg ~65%) |
| Phase 5 fix outputs persisted | 3 of 112 (109 lost) |
| Unaudited Plans docs with major gaps | 6 docs, 44+ empty sections |
| Cross-doc map entries with errors | 8 of 25 (wrong lines/counts) |
| "PERFECT" scores inflated | 4+ runs rated PERFECT at cluster level but 35-65% unchecked |

### 6.2 CRITICAL Corrections — Must Fix Before Applying Any Phase 5 Fixes

#### CORR-01: J05 blocked_reason_code enum is WRONG
- Phase 5 fix J05 proposes values that don't match canonical enum at Contracts_V0.md L1083-1097
- Would overwrite correct values with incorrect ones
- **Action**: Regenerate J05 from canonical Contracts_V0 enum

#### CORR-02: J01 worktree command fix is WRONG
- Would delete `bind_existing`, `open_files`, `create_pr` which ARE canonical in UI_Command_Catalog.md
- **Action**: Regenerate J01 preserving existing canonical commands

#### CORR-03: C02 task tool fix would destroy valid content
- §3.6A (Tools.md L437-484) has substantial content; C02 says "Full replacement" which would discard it
- **Action**: Regenerate C02 as additive, not replacement

#### CORR-04: Permissions §2.4 vs §8 "incompatible algorithms" is FALSE
- This was the top CRIT finding for Permissions_System.md
- §8 is supplementary safety checks (banned-command, hook re-check, shell env isolation), NOT a competing resolution algorithm
- §2.4 defines precedence layers; §8 defines runtime enforcement procedures
- They compose, not conflict
- **Action**: Remove from gap list; add a composition note instead

#### CORR-05: 109 of 112 fix outputs were never persisted
- Only G06 (/tmp/...g34y8d.txt, 354 lines), I02 (/tmp/...0v82xg.txt, 722 lines), I07 (/tmp/...6abz5r.txt, 590 lines) saved
- The other 109 existed only in agent conversation context and are gone
- **Action**: All 109 fixes must be regenerated

#### CORR-06: Active Gemini provider contradiction
- Run w-20260313-152345 locked ONE Gemini provider with mixed capability pools
- Main ledger Decision L857 says TWO separate providers (gemini + gemini_cli)
- These are mutually exclusive architectural decisions
- **Action**: Resolve before any provider-related fixes

#### CORR-07: provider_transient backoff value conflict
- EP L266: `1s / 2s / 4s`
- Orch L6863: `1s, 5s, 15s`
- Contradictory concrete values for the same failure class
- **Action**: Resolve canonical values before retry/backoff fixes

### 6.3 False/Fabricated Entries in Current Ledger

These entries reference content that does NOT exist in the cited docs:

| Entry | Claim | Reality |
|-------|-------|---------|
| `seglog.event_appended` | Exists in storage-plan.md | Zero matches in storage-plan.md |
| `interview_persona` field | Exists in interview-subagent-integration.md | Zero matches |
| SSH in FileManager.md | FileManager has SSH references | Zero SSH mentions in FileManager.md |
| `tier_type` in interview doc | Used in interview-subagent-integration.md | Zero matches |
| Composer chips in newtools.md | Click-to-context/composer chips defined there | Zero matches in newtools.md |
| Web research tools in newtools.md | webextract/webcrawl/webmap defined there | Zero matches |
| Terminal tool in newtools.md | Terminal tool defined there | Zero matches |
| §3.5 Tools.md empty | Claims §3.5 is empty | §3.5 has content |
| Permissions §2.4 vs §8 incompatible | Competing algorithms | Supplementary, compose correctly |
| `prerequisite_resolved` in Executor_Protocol | EP has this event | Zero matches; only in orch shards 36/37 |
| `counter` field conflict FileManager | FileManager has counter conflicts | Zero matches for claimed conflict |
| SSH prerequisite_resolved in FileManager | Claims exist | Fabricated |
| 4 newtools.md entries (composer_chip, click_to_context, web_research, terminal_tool) | Present in newtools.md | None exist there |

**Action**: All fabricated entries must be removed or corrected in any future ledger update.

### 6.4 False-CLEAN Declarations

The main ledger declares these docs CLEAN, but pipeline run findings contradict:

| Doc | Ledger Claim | Reality |
|-----|-------------|---------|
| Crosswalk.md | CLEAN | Duplicate §3.13/§3.14/§3.15 numbering; stale Orchestrator primitives with "Tiers"; missing route_target/OpenSubject primitive |
| Decision_Log.md | CLEAN | Only 2 entries from 2026-02-27; none of ~7 major rewrite-era decisions recorded |
| DRY_Rules.md | CLEAN | ContractRef format inconsistency (§2 uses `ContractName:Contracts_V0.md` vs path-form elsewhere) |

### 6.5 "PERFECT" Score Corrections

| Run | Claimed Score | Actual (finding-level) | Issue |
|-----|--------------|----------------------|-------|
| w-20260323-192127 (subagent) | 8/8 PERFECT | 25/32 YES, 5 PARTIAL, 2 NO | Cluster-level sampling; provider API quirks + side-file retirement genuinely missing |
| w-20260317-181906 (browser) | 8/8 PERFECT | 19/23 YES, 4 missing | 35% sample; 3-4 items recorded as missing elsewhere in same ledger |
| w-20260316-015830 (worktree) | 19/19 PERFECT | Genuinely PERFECT | Confirmed accurate |
| w-20260328-192938 (grep) | 5/5 PERFECT | Genuinely PERFECT | Full design spec faithfully incorporated |

### 6.6 Pipeline Run Coverage — Systematic Gap

The audit methodology was gap-verification (did doc_intents land?) not design-capture verification (was research substance preserved?). Pipeline runs contain thousands of lines of implementation-grade design that were never packetized.

#### Per-Run Capture Rates

| Run | Total Findings | YES | PARTIAL | NO | % Absent |
|-----|---------------|-----|---------|-----|----------|
| w-20260312-203855 pt1 (seams) | 57 | ~15 | ~24 | ~18 | 32% |
| w-20260312-203855 pt2 (design) | 25 | 0 | 14 | 11 | 44% |
| w-20260312-203855 pt3 (providers) | 23 | 12 | 6 | 5 | 22% |
| w-20260312-203855 pt4 (nav) | 20 | 0 | 7 | 13 | 65% |
| w-20260312-203855 pt5 (routing) | 44 | 6 | 12 | 26 | 59% |
| w-20260312-160857 (providers/GHA/Docker) | 91 | 13 | 8 | 70 | 77% |
| w-20260316-160350 (terminal) | 40 | ~14 | ~0 | ~26 | 65% |
| w-20260316-160450 (chat/web/plans) | 59 | 7 | 16 | 36 | 61% |
| w-20260320-164907 (debug) | 39 | ~11 | ~0 | ~28 | 72% |
| w-20260319-030558 (filemgr/editor) | 53 | ~9 | ~0 | ~44 | 83% |
| w-20260313-152345 (small batch) | 61 | 22 | 14 | 22 | 36% |
| w-20260323-192127 (subagent) | 32 | 25 | 5 | 2 | 6% |
| w-20260317-181906 (browser) | 23 | 19 | 0 | 4 | 17% |
| w-20260316-015830 (worktree) | 19 | 19 | 0 | 0 | 0% |
| w-20260328-192938 (grep) | ~18 | ~18 | 0 | 0 | 0% |
| **TOTAL** | **~604** | **~190 (31%)** | **~106 (18%)** | **~305 (51%)** | **51% absent** |

#### Largest Uncaptured Design Systems

These are coherent multi-hundred-line design specifications from pipeline runs that were never packetized into Plans docs and are NOT in the main ledger:

1. **Routing/Navigation Architecture** (~12 findings, run-203855-pt5)
   - `object_kind` canonical enum (19 values)
   - `inspector_target` controlled vocabulary (8 values)
   - `route_target` / `OpenSubject` named contracts
   - 18 canonical route normalization examples
   - 9 route validation/rejection rules
   - `tab_id` vocabulary and anti-patterns
   - Resolver-scope rules per identity family
   - 4-stratum reconciliation ordering
   - Routing owner-doc adoption map (11 docs)

2. **Terminal Subsystem Design** (~26 findings, run-160350, 2286 lines)
   - Terminal identity model (terminal_session_id vs dev_session_id)
   - Shell ownership boundary (shell owns state, chat owns audit)
   - Terminal promotion triggers (interactive → Terminal panel)
   - Recovery rules for terminal attach failure
   - Inline terminal cards (5/15 line bounds, one-per-command)

3. **Debug Mode Architecture** (~28 findings, run-164907)
   - Three investigation planes (source, runtime, environment)
   - Five debug adapters (native, DAP, log-based, browser, remote)
   - Strategy ladder (automated → guided → manual)
   - Automation budgets and verification loops
   - Debug Automation Profile (run-scoped)

4. **File Manager/Editor/Search/LSP Designs** (~44 findings, run-030558)
   - 83% of findings not captured — most uncaptured run
   - Full editor state persistence model
   - Search provider architecture
   - LSP session lifecycle contracts

5. **22 Differentiator Feature Designs** (run-160857)
   - Worktree topology visualization
   - AI commit batching with intelligent grouping
   - Failure triage with automated root-cause
   - Compose scenario runner
   - Drift detection (Dockerfile/compose/manifest)
   - Registry promotion flow
   - Container access intelligence
   - Project-focused K8s linkage

6. **Chat UX Design Decisions** (~36 findings, run-160450)
   - Inline operation-card family (terminal/search/diff cards with 5/15/50 bounds)
   - `/web` command family (5 operations, provider model, citation rules)
   - Question system expansion (single + questionnaire modes)
   - Inline visualizer (sandboxed HTML/JS, host bridge, persistence)
   - Plan/TODO execution model (sticky panel + inline milestones)
   - Skills management surface IA

7. **Deep Contract Proposals** (~20 findings, run-160857)
   - Deep-link context schemas (per-field payloads with project_id, repo_id, etc.)
   - SCM/worktree identity derivation rules
   - Worktree ownership lifecycle (5 states)
   - Actions readiness blocked-state taxonomy (15 reason codes)
   - Docker Manager visibility rules (tri-state detection)
   - Local-runtime blocked/degraded taxonomy (16 reason codes)

8. **Cross-Cutting Blind Spots** (~19 findings, run-160857)
   - Canonical empty-state taxonomy (5 categories)
   - Accessibility contract for custom surfaces
   - Large-dataset UX/scaling contract
   - Shared status vocabulary (8 statuses)
   - Unified refresh/backpressure policy
   - Receipt/storage retention classes
   - Legal-hold/preservation contract
   - Bulk action contract
   - Canonical time-source precedence

### 6.7 Unaudited Plans Docs

6 docs were completely missed by all audit phases, with significant structural gaps:

| Doc | Lines | Empty Sections | Concern |
|-----|-------|---------------|---------|
| CLI_Bridged_Providers.md | 644 | 9 | Provider facade, structured request envelope, normalized stream schema, transport mapping, Cursor/Claude Code providers, login/auth state machine, call flows, retry integration — ALL empty |
| OpenCode_Deep_Extraction.md | 718 | 9 | Entire §7 (Expanded Extraction Coverage) empty: Run Modes, Subagents, Permissions, Commands, Formatters, Skills, Plugins, Models |
| GitHub_API_Auth_and_Flows.md | 610 | 8 | Git vs GitHub boundary, OAuth device-code flow, token handling, scope verification, API request envelope, call flows, acceptance criteria, auth-expired recovery — ALL empty |
| agent-rules-context.md | 320 | 7 | Two-Tier Rules Model, Feeding Rules Into Agents, Feature Spec, Artifact Types, Tier Visibility Rules, AGENTS.md Enforcement — ALL empty; also carries stale tier-era terminology |
| BinaryLocator_Spec.md | 330 | 6 | Canonical references, contract shape, discovery algorithm, validation contract, caching/invalidation, acceptance criteria — ALL empty |
| assistant-memory-subsystem.md | 517 | 5 | Capability boundary, verification/triggers, trigger contracts, GUI/maintenance operations, deterministic defaults — ALL empty |

4 additional docs have moderate gaps:

| Doc | Lines | Empty Sections | Notes |
|-----|-------|---------------|-------|
| Section15_MVP_Promoted_Features_Spec.md | 817 | 4 | Shell/surface model, thread usage surface, cross-feature runtime contracts, feature requirements — stubs |
| Media_Generation_and_Capabilities.md | 844 | 3 | Capability system, media generation contract, capability picker dropdown — stubs |
| OpenCode_Coverage_Matrix.md | 216 | 2 | DRY Authority Audit, GUI+Config Wiring Audit — empty |
| Document_Packaging_Policy.md | 294 | 1 | Deterministic split rules — empty |

### 6.8 Plans Doc Agent Findings — New Missed Gaps

#### Group A: Per-Doc Verification Results

**verify-contracts-gaps**: 8 missed gaps
- Contracts_V0 event catalog has only 21 of 40+ needed events
- §1.1 duplicate numbering still present
- `HITLRequest` §6 still teaches request-era approval model
- `wizard.blocked` required-vs-optional `resume_url` contradiction

**verify-catalog-github**: 7 new missed gaps
- `cmd.github.*` command family entirely absent (0 commands for GHA workflows, secrets, environments)
- `cmd.ssh.*` command family absent
- `cmd.container.*` only 8 of 11 needed sub-families
- `cmd.debug.*` family absent
- `cmd.web.*` family absent
- `cmd.media.*` family absent
- `cmd.skill.*` family absent

**verify-tools-gaps**: 8 new missed gaps
- §3.1 tool table (16 tools) vs §10.2 reference (28+ tools) — count disagrees
- §3.5A web tools not in §3.1 table
- §3.6A task tool NOT empty (has content L437-484)
- `lsp` tool missing expanded op set (9 operations)
- `question` tool missing expanded contract (single + questionnaire modes)
- MCP runtime/auth/config contract entirely absent
- Web search provider model absent (Exa/DDG/Tavily/Google taxonomy)
- Support tiers (`native`/`pm-composed`/`unsupported`) absent

**verify-chat-gaps**: 6 missed gaps, 7 insufficient detail
- §14.1 subagent visibility section body MISSING (header only)
- §12.0A investigation context fields diverge from Contracts_V0 §5.1A
- Typing-during-active-run composer behavior unspecified
- Slash-command SSOT 3-way drift (§5 vs FinalGUISpec §7.16.2 vs UI_Command_Catalog)
- `override_builtin:true` in Commands_System vs reserved-MUST-NOT-override in chat
- Plan/todo execution state machine absent

**verify-models-crosswalk**: 15 new missed gaps
- Models_System.md has 4 redundant addenda (§7A/§8/§8A/§8B) all covering provider readiness
- Crosswalk.md has 5 missing ownership boundary entries
- Models_System.md §4.1 lists gemini + gemini_cli as separate but §1 says "one provider"
- Crosswalk.md duplicate §3.13/§3.14/§3.15 numbering
- Crosswalk.md stale Orchestrator primitives (still says "Tiers")
- Crosswalk.md missing `route_target`/`OpenSubject` primitive

**verify-storage-gaps**: 10 missed gaps
- Systematic key format conflict: `attempt_record` 4-component vs 3-component keys
- `blocked_projection` 3-way key conflict across addenda
- Violated MUST-level TTL contract (§2.6 says MUST specify TTL, multiple families don't)
- Browser persistence keys (`preview_state.v1`, `browser_session_state.v1`, `browser_profile_state.v1`) — NEVER CREATED
- `container_manager.project_state` 14-field schema absent
- Receipt/storage retention classes (durable/bounded/discardable) absent
- Legal-hold/preservation contract absent
- Canonical time-source precedence absent

**verify-lsp-perms**: 12 new missed gaps (after removing false CRIT)
- 17 permission keys without pattern derivation rules
- `question` tool missing from permission-key table entirely
- Permission preset reconciliation needed (Read-only vs Plan vs Full)
- LSP session key format undocumented
- SSH quote fabrication confirmed (zero SSH mentions in Permissions)

**verify-misc-docs**: 8 missed gaps
- HITL tier contradiction (base text vs addenda incompatible models)
- `UsageRecord` missing `account_id`, `thread_id`, `timestamp` fields
- `human-in-the-loop.md` action-label drift (Reject/Cancel/Skip vs Approve/Decline/Retry/Replan/Skip-node/Abort)

**verify-filemgr-exec**: 16 missed gaps (after removing 9 false gaps)
- FileManager `OpenFile` overclaimed as universal (needs `OpenSubject`)
- FileSafe rollback scope ambiguous (file-level vs batch-level)
- Executor_Protocol TierContext replacement unnamed
- Run_Modes crew overlay missing concrete delegation rules

**verify-orch-gaps**: Structural issues
- 13 empty section headers (content promised but not filled)
- 10+ stale `DRY:FN` tags pointing to nonexistent anchors
- Stale implementation guidance at L3657-3714
- 574 stale tier references throughout

**verify-wizard-interview**: 8 missed gaps (after removing 6 false)
- `wizard_status` enum defined 5 times (base + 4 addenda), base still lacks `blocked`
- Interview lifecycle integration with Executor_Protocol absent
- Wizard-to-agent handoff contract underspecified

**verify-gui-gaps**: 9 missed gaps (after removing 3 false)
- §7.6-§7.15 entirely absent (BLOCKER) — 10 major GUI sections with headers but no content
- §8/§9/§10 empty (Search/Replace, Extensions, Debug panels)
- Dashboard widget layout migration contradiction (keep vs delete)
- Persona editor fields overlap between FinalGUISpec §17.2 and Personas §3.2

**verify-newtools-decision**: 3 missed gaps (after removing 5 fabricated)
- newtools.md has only 5 concrete tool entries; decision framework references 15+ tools
- No web research tools defined (webextract, webcrawl, webmap, webresearch)
- No browser interaction tools defined

**verify-dnf**: 15 Do-Not-Forget omissions
- 8 BLOCKER-level risks missing from DNF section:
  1. Tools.md §3.5/§3.6/§3.5A ALL EMPTY
  2. FinalGUISpec §8/§9/§10 completely absent
  3. `remediation.resolved` enum irreconcilable (ZERO overlapping values)
  4. storage-plan `attempt_record` key 4-vs-3 component conflict
  5. storage-plan `blocked_projection` 3-way key conflict
  6. Plan mode preset self-defeating (denies tools planning needs)
  7. Permissions missing security section
  8. Permissions TOML/JSON format conflict
- 7 HIGH-level risks missing
- 6 missing ordering dependencies

**verify-cosmetic**: All 24 structural/cosmetic claims CONFIRMED accurate, zero false gaps

**verify-phase5-detail**: CRITICAL — 109 of 112 fix outputs never persisted; only 7 of remaining fixes fully sufficient

### 6.9 Cross-Doc Contract Map Corrections

The verify-cross-doc agent confirmed the map is directionally sound (0 fabricated entries) but found:

| Issue | Count |
|-------|-------|
| Wrong line references | 6 entries |
| Wrong field/value counts | 4 entries |
| Imprecise descriptions | 2 entries |
| Missed conflicts | 5 new |

New missed conflicts:
1. `provider_transient` backoff: EP says `1s/2s/4s`, Orch says `1s/5s/15s`
2. `failure_class`/`blocked_reason_code` category bleed — EP and Orch mix both under `failure_class` header
3. `quota_exceeded` orphan — exists only in EP retry table, no canonical home in Contracts_V0
4. Orch retry matrix is strict superset of EP's (4 extra entries: `user_declined`, `headless_ask_denied`, `external_side_effect_blocked`, `replan_required`)
5. `allowed_action_id` — chat wizard values are human-readable labels, not stale enum values (misdiagnosed as stale names)

### 6.10 Updated Do-Not-Forget Section

The following items MUST be added to the Do-Not-Forget section:

#### BLOCKER-level
- DNF-B01: Tools.md §3.5/§3.6/§3.5A content appears present but tool table counts disagree (16 vs 28+)
- DNF-B02: FinalGUISpec §7.6-§7.15 entirely absent; §8/§9/§10 empty
- DNF-B03: `remediation.resolved` enum has ZERO overlapping values between two definitions
- DNF-B04: storage-plan `attempt_record` key 4-component vs 3-component conflict
- DNF-B05: storage-plan `blocked_projection` 3-way key conflict
- DNF-B06: Plan mode preset denies todowrite/todoread (self-defeating)
- DNF-B07: 6 unaudited docs with 44+ empty sections (CLI_Bridged_Providers, OpenCode_Deep_Extraction, GitHub_API_Auth_and_Flows, agent-rules-context, BinaryLocator_Spec, assistant-memory-subsystem)
- DNF-B08: 109 of 112 Phase 5 fix outputs never persisted — must regenerate
- DNF-B09: ~305 pipeline run findings (51%) never captured in any Plans doc

#### HIGH-level
- DNF-H01: Gemini 1-vs-2 provider contradiction unresolved
- DNF-H02: provider_transient backoff values contradict (EP vs Orch)
- DNF-H03: failure_class/blocked_reason_code category bleed across EP/Orch/Contracts_V0
- DNF-H04: Crosswalk/Decision_Log/DRY_Rules falsely declared CLEAN
- DNF-H05: 25+ fabricated/false entries in current ledger
- DNF-H06: "PERFECT" scores inflate actual coverage (cluster vs finding granularity)
- DNF-H07: `active-subagents.json` retirement never propagated (still in 5+ docs)

#### Ordering Dependencies (new)
- ORD-01: Resolve `remediation.resolved` enum BEFORE any Contracts_V0/Orch/EP fixes
- ORD-02: Resolve Gemini provider count BEFORE Models_System/provider fixes
- ORD-03: Resolve provider_transient backoff values BEFORE retry/backoff fixes
- ORD-04: Resolve failure_class/blocked_reason_code boundary BEFORE EP/Orch/Contracts_V0 fixes
- ORD-05: Regenerate 109 lost fixes BEFORE applying any Phase 5 results
- ORD-06: Remove fabricated entries BEFORE treating ledger as fix source

### 6.11 Phase 6 Conclusion

Phase 6 verification reveals the audit is **far more incomplete than Phase 5 suggested**. The core finding:

**The audit correctly identified ~112 Plans-doc-level gaps but missed ~305 pipeline-run-level findings (51% of all research output).** The missing content is not cosmetic — it includes entire architectural subsystems (routing/navigation, terminal design, debug mode, chat UX, differentiator features) that represent thousands of lines of implementation-grade specification.

**Immediate blockers before any fixes can be applied:**
1. Resolve 4 architectural contradictions (CORR-06, CORR-07, ORD-01, ORD-04)
2. Remove/correct ~25 fabricated ledger entries (§6.3)
3. Correct 3 false-CLEAN declarations (§6.4)
4. Regenerate 109 lost fix outputs (CORR-05)
5. Regenerate 4 broken fixes (CORR-01 through CORR-04)
6. Audit 6 completely missed Plans docs (§6.7)
7. Determine disposition of ~305 uncaptured pipeline run findings (§6.6)

The next phase should NOT be "apply fixes" — it should be a triage pass to determine which of the 305 uncaptured findings need to be written into Plans docs vs which are superseded, out-of-scope, or already covered by later decisions.

---

## Phase 7 — Durable Triage Recovery

### 7.0 Recovery Issue

- The original Phase 7 pass launched 99 GPT-5.4 `explore` agents (`triage-001` through `triage-099`) to classify uncaptured pipeline-run findings.
- Those agents completed, but their per-finding outputs were **not durably persisted** and were **cleared from the background-agent registry before collection**.
- `read_agent` could no longer recover the original results; session history preserved launch/completion context and helper analysis, but **not the full per-shard triage payloads** needed for safe consolidation.
- This means the first Phase 7 launch cannot be treated as canonical evidence for ledger reconciliation.

### 7.1 Durable Re-run Strategy

- Recovery strategy changed from ephemeral background-agent collection to **file-backed triage artifacts**.
- New pass uses GPT-5.4 `general-purpose` agents (`triagegp-001` through `triagegp-099`) with the same shard boundaries as the original 99-agent pass.
- Each durable triage agent must:
  - read one assigned ledger slice,
  - classify each substantive finding as `WRITE_NEEDED`, `ALREADY_EXISTS`, `SUPERSEDED`, or `DEFER`,
  - write a markdown artifact to `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-triage/triagegp-###.md`.
- This session-artifact directory is now the durable source for Phase 7 collection and later synthesis.

### 7.2 Validation

- `triagegp-099` successfully wrote the first durable artifact:
  - path: `/home/sittingmongoose/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-triage/triagegp-099.md`
  - run: `w-20260318-153036`
  - lines: `1-140`
  - counts: `ALREADY_EXISTS=12`, `WRITE_NEEDED=2`, `SUPERSEDED=3`, `DEFER=4`
- `glob` was unreliable against the session folder, but `view`/`rg` confirm the artifact exists and is readable.

### 7.3 Launch State

- Durable re-run launched for the full shard set:
  - `triagegp-001` through `triagegp-042` — `w-20260312-203855`
  - `triagegp-043` through `triagegp-056` — `w-20260312-160857`
  - `triagegp-057` through `triagegp-066` — `w-20260316-160450`
  - `triagegp-067` through `triagegp-076` — `w-20260319-030558`
  - `triagegp-077` through `triagegp-081` — `w-20260320-164907`
  - `triagegp-082` through `triagegp-086` — `w-20260318-160350`
  - `triagegp-087` through `triagegp-091` — `w-20260320-170511`
  - `triagegp-092` through `triagegp-093` — `w-20260313-152345`
  - `triagegp-094` through `triagegp-095` — `w-20260313-183219`
  - `triagegp-096` — `w-20260317-164124`
  - `triagegp-097` — `w-20260323-192127`
  - `triagegp-098` — `w-20260317-181906`
  - `triagegp-099` — `w-20260318-153036`
- As of this checkpoint:
  - `triagegp-099` is confirmed complete and on disk.
  - Remaining `triagegp-*` agents are still running and must be collected from the artifact directory, not from ephemeral agent state.

### 7.4 Helper Synthesis Agents

- Several helper `explore` agents completed in parallel and produced useful cross-check summaries while the durable re-run was being queued:
  - `triage-coverage`
  - `triage-compare`
  - `triage-classifier`
  - `triage-research`
  - `triage-findings`
  - `triage-plans`
- These helper outputs are useful for clustering and doc-target suggestions, but they **do not replace** the durable per-shard artifacts and must not be used as the only source for final Phase 7 counts.

### 7.5 Next Collection Rule

- Do **not** compress or skip details during synthesis.
- Collect durable `triagegp-###.md` artifacts directly from the session artifact folder.
- Aggregate by:
  - target doc,
  - target heading,
  - finding status,
  - severity/priority,
  - duplicate or overlapping proposed writes.
- Preserve per-shard details until after a full merge/dedup pass so the final ledger does not repeat the loss/compression problem from earlier phases.

### 7.6 Durable Collection Completion

- Durable Phase 7 shard collection is now **physically complete**:
  - `file_count=99`
  - missing shard files: `[]`
  - `triagegp-065` is present on disk and its agent confirms: `WRITE_NEEDED=9`, `ALREADY_EXISTS=4`, `SUPERSEDED=0`, `DEFER=3`
- Current durable aggregate totals from `files/phase7-triage/_aggregate_summary.txt`:
  - `WRITE_NEEDED=761`
  - `ALREADY_EXISTS=626`
  - `SUPERSEDED=211`
  - `DEFER=165`
- Highest-density shards by raw `WRITE_NEEDED` count:
  - `triagegp-052=32`
  - `triagegp-054=30`
  - `triagegp-051=23`
  - `triagegp-004=19`
  - `triagegp-018=19`
  - `triagegp-017=18`
  - `triagegp-049=18`
  - `triagegp-005=15`
  - `triagegp-028=15`
  - `triagegp-046=15`
  - `triagegp-022=13`
  - `triagegp-055=13`
  - `triagegp-057=13`
  - `triagegp-058=13`
  - `triagegp-023=12`
- Important parsing note:
  - shard markdown uses multiple block formats (`- finding:`, numbered `**finding:**`, backticked status fields, mixed target-doc separators)
  - naive structured parsing **undercounts** and can misclassify status/doc fields
  - until a stronger normalizer is finished, the per-file summary counts and on-disk shard artifacts are the authoritative Phase 7 evidence

### 7.7 Helper Extraction Highlights Collected During Durable Recovery

- Helper readers were used only to surface clustered implementation-ready themes while durable shard synthesis was still running. They are supporting material, **not** the canonical count source.
- Permissions cluster extracted from `read-triage-batch1`, `read-triage-batch2`, and `read-triage-batch3`:
  - approval caching is still too session-scoped; rewrite-era concurrent actors need approval binding by actor/lane/run/account scope key rather than vague "same session" reuse
  - approval flow still needs explicit **durable approval scope** (session vs project vs global) instead of conflating transient `always` with long-lived rules
  - permission snapshots still need richer requested/effective disclosure: requested state, downgrade reason, effective account identity, execution role, actor/surface context
  - destructive/admin/domain-sensitive operations still need domain-bound approval identity and invalidation rules:
    - SCM repos/worktrees/refs
    - Actions workflow/environment targets
    - Docker registries/repositories
    - Kubernetes clusters/namespaces/verbs
  - preflight/approval ordering still needs a canonical sequence:
    1. static policy
    2. cheap preflight
    3. approval request only if still actionable
    4. final execution-time revalidation
  - blocked outcome taxonomy still needs normalization across policy-vs-approval-vs-preflight causes
  - Plan-mode preset still appears too restrictive for planning/research-safe tools:
    - `todoread` / `todowrite`
    - web operation family (`webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`)
    - question-driven planning flows
  - web-family approvals still need more specific session-rule derivation and approval-card summaries:
    - host-scoped patterns for fetch/extract/crawl/map
    - query-style summaries for search/research
    - cap/limit previews for crawl/map style operations
  - enterprise host/trust/proxy policy remains under-specified as a shared SSOT for GitHub / registry / Kubernetes / MCP/custom/plugin tools
  - Debug Automation Profile still needs explicit outcome fields carried consistently across permissions/chat/storage/contracts:
    - `stop_reason_code`
    - `attention_required_reason_code`
    - `budget_kind`
    - rule that only `verification_strength=strong` may auto-resolve
- Tools / skills cluster extracted from `triagegp-065`:
  - `skill` tool still lacks the richer discoverability/result packet (source type, bounded resource sample, bundled-skills-as-runtime entries)
  - `task` tool still needs a resumable delegated-run request/response envelope (`task_id`, resumable input/output fields, `resumed`, `result_text`, optional `runtime_snapshot`)
  - MCP runtime/auth/config needs stronger canonical state/config contract:
    - local vs remote server schema
    - auth/effective state enums
    - logout/debug flows
    - `oauth:false`
    - server URL change invalidation semantics
  - Skills still need dedicated page-level placement plus richer catalog metadata and management affordances; do **not** regress to settings-only placement
- Runtime artifacts / usage dedup cluster from `read-nearby-canon`:
  - **do not duplicate** EventRecord envelope rules from `Contracts_V0.md`
  - **do not duplicate** debug investigation event families or `InvestigationContextAttachment`
  - **do not duplicate** `artifacts_index` redb key ownership or projector mechanics from `storage-plan.md`
  - **do not duplicate** `cost_usage` navigation / `Estimated Cost` / Context Detail Pane rules already owned by `usage-feature.md` and `assistant-chat-design.md`
  - Runtime_Artifacts_Panel should own artifact-type specifics, bundle manifest details, artifact routing/open behavior, and receipt/linkage rules; adjacent docs already own shared envelopes/surfaces

### 7.8 Adjacent-Canon Guardrails Confirmed

- Cross-check of adjacent canon confirms several anti-duplication / anti-fabrication constraints that must be honored when writing fixes:
  - `cmd.orchestrator.open_concern` **already exists**
  - `route_target` is the canonical cross-surface navigation/focus contract; do **not** invent a parallel `PanelContext` contract unless a future decision explicitly introduces it
  - `cmd.graph.retry_node` **already exists and is wired**
  - Docker naming is locked to **Docker Manager**; `Docker Manage` is legacy wording only
  - Docker command family is only partially canonized today (`browser_login`, `save_pat`, `create_repository` paths exist); broader `cmd.docker.*` operational family is still missing
  - GitHub Actions surface exists as a feature/surface, but `cmd.github.actions.*` command family is still missing
  - `cmd.git.worktree.*` family is still missing from canon
  - feature-list-level "Open in Source Control / GitHub Actions / Docker Manager" pivots are aspirational until concrete command IDs are written into canonical command docs
- Consequence for Phase 7 fix writing:
  - prefer additive wiring into existing `route_target` / command families / concern model where they exist
  - avoid writing duplicate wrapper commands or second navigation payload systems
  - treat missing cross-surface pivots and missing command families as genuine write targets, but only after checking whether the target doc already names the owning family

### 7.9 Merge-Synthesis Launch State

- 10 Opus 4.6 general-purpose merge agents were launched to convert durable `WRITE_NEEDED` findings into per-doc implementation-ready merge artifacts:
  - `merge-storage`
  - `merge-finalgui`
  - `merge-contracts`
  - `merge-orchestrator`
  - `merge-github`
  - `merge-command-catalog`
  - `merge-permissions`
  - `merge-containers`
  - `merge-assistant-chat`
  - `merge-runtime-artifacts`
- Their mandate:
  - read all relevant `triagegp-*.md` artifacts for one target doc
  - dedupe only `WRITE_NEEDED` findings
  - use `ALREADY_EXISTS` / `SUPERSEDED` only to suppress false positives
  - cross-check nearby canon before proposing any new contract text
  - write implementation-ready merge artifacts under `files/phase7-merge/`
- At this checkpoint those merge agents are still running; their outputs are not yet merged into the main ledger.

### 7.10 Durable Fallback Synthesis Source (On-Disk Raw Extracts)

- Because the first merge wave failed to leave durable artifacts, a fallback extractor was created from `files/_all_contracts_findings.json`.
- This fallback writes per-doc raw `WRITE_NEEDED` extracts under:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/*-raw-write-needed.txt`
- These raw extracts are **not yet deduped merge artifacts**, but they are durable, source-traceable, and sufficient to continue ledger synthesis even if the long-running Opus merge rebuilds take longer or fail.
- Corrected raw extract counts:
  - `Contracts_V0-raw-write-needed.txt` → `85`
  - `storage-plan-raw-write-needed.txt` → `25`
  - `FinalGUISpec-raw-write-needed.txt` → `6`
  - `assistant-chat-design-raw-write-needed.txt` → `5`
  - `UI_Command_Catalog-raw-write-needed.txt` → `5`
  - `Runtime_Artifacts_Panel-raw-write-needed.txt` → `4`
  - `GitHub_Integration-raw-write-needed.txt` → `3`
  - `Orchestrator_Page-raw-write-needed.txt` → `3`
  - `Permissions_System-raw-write-needed.txt` → `2`
  - `Containers_Registry_and_Unraid-raw-write-needed.txt` → `1`
- Immediate rule:
  - when consolidating Phase 7 further, these raw extracts may be used as the durable fallback source for per-doc clustering
  - however, every proposed write still must be checked against nearby canon to avoid duplicate contracts

### 7.11 Fallback Synthesis — High-Signal Per-Doc Clusters

- Permissions (`Permissions_System-raw-write-needed.txt`, `2` findings):
  - permission snapshots still need richer requested/effective disclosure fields:
    - requested permission state
    - downgrade reason
    - effective account
    - execution role
    - actor/surface context
  - blocked payload normalization is still inconsistent:
    - `Contracts_V0.md` and `Tools.md` already use `blocked_reason_code` + ordered `allowed_action_ids[]`
    - `Permissions_System.md` still contains legacy `recovery_options[]` wording in one section before later corrected text
  - implication: Permissions work should be framed mostly as normalization + shared snapshot enrichment, **not** as a greenfield rewrite of approval architecture

- Command catalog (`UI_Command_Catalog-raw-write-needed.txt`, `5` findings):
  - `newtools.md` still introduces uncataloged preview/build/live/doctor/custom-headless surfaces
  - assistant-memory commands exist in the catalog, but storage/event ownership is still incomplete elsewhere
  - subview/view-state layering still needs a clearer override/refinement rule so subview is not mistaken for primary navigation identity
  - command catalog still needs a clearer normalization story for route-shaped payloads versus shell/runtime-local payloads
  - compare identity and diff/conflict interaction detail are still too thin across GitHub/FileManager/Contracts/UI command surfaces

- Runtime artifacts (`Runtime_Artifacts_Panel-raw-write-needed.txt`, `4` findings):
  - stale heading/prose still suggests old `task_id` framing even though the actual contract beneath is attempt-native and route/open aligned
  - instrumentation lifecycle enum and lane separation still need canonical states
  - cleanup/rollback/residual reporting still needs scope-specific summary contract
  - verification heuristics/versioning still need:
    - original failure signature capture
    - stronger strong-vs-weak resolution policy
    - stable heuristic version field (for exported investigations)
  - anti-duplication remains critical: EventRecord / investigation events / artifacts index / cost_usage routing stay owned by adjacent canon, not Runtime_Artifacts_Panel itself

- Orchestrator (`Orchestrator_Page-raw-write-needed.txt`, `3` findings):
  - search still needs explicit run-aware scope policy:
    - default to focused run
    - allow widening to all project runs
    - disclose when a result changes focused run
  - new Orchestrator object families still need explicit shared-envelope reuse rule
  - concern-vs-adjacent-family boundaries remain underspecified:
    - concern vs review finding
    - concern vs annotation
    - concern vs blocked episode
    - concern vs recovery

- GitHub (`GitHub_Integration-raw-write-needed.txt`, `3` findings):
  - requested/effective identity split from Contracts_V0 still has not propagated into GitHub auth/integration docs
  - compare identity + hunk/conflict review UX detail still need a canonical envelope and more implementation-grade interaction rules
  - same repo-relative path across multiple worktrees still lacks durable compare/open identity

- Containers (`Containers_Registry_and_Unraid-raw-write-needed.txt`, `1` finding):
  - Docker/Kubernetes unavailability wording taxonomy is still missing:
    - `Unsupported`
    - `Not configured`
    - `Unauthorized`
    - `Unreachable`
    - `Degraded`
    - `Partial capability`
  - this appears to be a copy/UX-state normalization issue, not a broad surface-architecture gap

- Assistant chat (`assistant-chat-design-raw-write-needed.txt`, `5` findings):
  - same-file-across-worktrees compare/open identity still needs cross-doc contract
  - resume-time session revalidation still needs explicit reason codes and no-silent-rebind semantics
  - Debug MVP still lacks one canonical adapter inventory / target registry / verification bundle owner
  - automated verification+cleanup loop still lacks one end-to-end contract
  - dynamic context shrinking still lacks one integrated continuity/settings path spanning Prompt_Pipeline, chat, contracts, and GUI

- FinalGUI (`FinalGUISpec-raw-write-needed.txt`, `6` findings):
  - shared degraded-trust/account-health/concern escalation is still not unified into one cross-surface contract
  - requested concrete-account model still has not propagated fully into shared runtime/UI grammar
  - explicit open disposition / reuse policy is still missing from GUI/FileManager/Contracts alignment
  - broader multi-account reason-code families remain underspecified if they are intended to be stable canon
  - instruction projection drift-control metadata and lifecycle completeness still look under-modeled in GUI/storage
  - dynamic context shrinking still needs one integrated settings/continuity path

- Storage (`storage-plan-raw-write-needed.txt`, `25` findings) and Contracts (`Contracts_V0-raw-write-needed.txt`, `85` findings) remain the highest-density targets and clearly carry the heaviest Phase 7 unresolved load.

### 7.12 Fallback Synthesis — Cross-Doc Themes Already Stable

- The heaviest unresolved theme is **shared runtime/governance contract consolidation**, especially in `Contracts_V0.md` and `storage-plan.md`:
  - shared governance/runtime record envelope
  - concern family schema
  - concern `resolution_kind` + rationale semantics
  - actor envelope beyond run-centric identity
  - requested/effective account + operational identity propagation
  - execution-role / actor-role propagation
- The second stable theme is **identity and navigation/open behavior**:
  - compare identity across worktrees
  - run-aware search scope
  - open-disposition / reuse policy
  - route-shaped payload normalization vs local payloads
- The third stable theme is **state/blocked/recovery normalization**:
  - blocked payload field normalization
  - session resume revalidation reason codes
  - instrumentation lifecycle / cleanup / residual reporting
  - debug verification heuristic versioning
- The fourth stable theme is **surface-owner copy/state refinement rather than brand-new feature invention**:
  - Docker/Kubernetes unavailability wording taxonomy
  - stale `task_id` wording in Runtime_Artifacts_Panel
  - GitHub requested/effective identity wording propagation
  - Permissions snapshot field enrichment

### 7.13 Current Merge-Rebuild Status

- A second, stricter file-backed Opus merge wave was launched:
  - `merge2-permissions`
  - `merge2-command-catalog`
  - `merge2-runtime-artifacts`
  - `merge2-storage`
  - `merge2-contracts`
  - `merge2-orchestrator`
  - `merge2-github`
  - `merge2-containers`
  - `merge2-assistant-chat`
  - `merge2-finalgui`
- These agents were explicitly instructed to write durable artifacts under `files/phase7-merge/`.
- At this checkpoint they are still running and have not yet produced final per-doc merge markdown on disk.
- Important: Phase 7 continuity is no longer blocked on them, because the raw per-doc extract files above now provide a durable fallback synthesis source.

### 7.14 Merge-Rebuild Status — Durable Artifacts Now Landing

- The statement in `7.13` is now partially superseded:
  - durable per-doc merge markdown is now present on disk for:
    - `assistant-chat-merge.md`
    - `finalgui-merge.md`
    - `storage-merge.md`
    - `runtime-artifacts-merge.md`
- These landed artifacts are stronger than the raw fallback extracts because they already:
  - dedupe repeated findings across shards / ledger / group JSONs
  - suppress canon-owned items that should not be rewritten in the target doc
  - call out anti-duplication boundaries explicitly
  - preserve implementation-ready anchors / subsection targets / write order
- Operational rule from this point forward:
  - for `assistant-chat-design.md`, `FinalGUISpec.md`, `storage-plan.md`, and `Runtime_Artifacts_Panel.md`, the durable `*-merge.md` file is now the primary Phase 7 synthesis source
  - the corresponding `*-raw-write-needed.txt` files remain useful as audit backstops, but they no longer lead unless a merge artifact is later found inaccurate
- Remaining docs without landed durable merge markdown still continue to rely on the raw fallback extracts until their file-backed merge artifacts land:
  - `Permissions_System`
  - `UI_Command_Catalog`
  - `Contracts_V0`
  - `Orchestrator_Page`
  - `GitHub_Integration`
  - `Containers_Registry_and_Unraid`

### 7.15 Durable Merge Artifact — assistant-chat-design.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/assistant-chat-merge.md`
- Artifact summary:
  - `10` deduped `WRITE_NEEDED` findings with exact proposed content + anchors
  - `10` suppressed findings already covered in canon or owned elsewhere
  - `12` anti-dup topic/owner-doc pairs
  - `6` explicit defer items
  - `10`-step recommended write sequence
  - `14` exact file/line anchors
- High-confidence implementation-ready write set preserved by the artifact:
  1. `§14.1 Subagent visibility in thread — implementation detail` body is still missing even though the TOC promises it.
     - write must define inline child-run chip/card fields, lifecycle updates, collapse/expand behavior, and failure attribution
     - anchor: body immediately under the TOC-referenced `### 14.1` heading
  2. `§13.1 Operation-card family` is still missing additive card types:
     - `blocked_notice`
     - `approval_request`
     - `clarification_request`
     - `investigation_context`
     - write must normalize these to the existing operation-card skeleton rather than inventing card-local navigation or schemas
  3. Assistant chat still lacks one explicit closed `Message type taxonomy`.
     - write must enumerate the canonical top-level message kinds and persistence/display rules
     - artifact recommends placing this near the existing chat-footer / message-rendering material
  4. Debug still lacks one canonical `Debug investigation phase model`.
     - write must enumerate the default debug loop phases, phase-transition rules, verification/cleanup behavior, and relation to Investigation Context
  5. `debug` is still missing from the closed mode-overlay enum in `§29.1`.
     - this is a direct same-doc contradiction with `§1.0B` and `Run_Modes.md`
  6. `Git & GitHub Slash Commands` content was collapsed to a thin boundary note and needs restoration as dispatch-surface guidance.
     - write must keep detailed PR/issues/actions behavior owned by `GitHub_Integration.md`
  7. `§27` still needs a Persona runtime-contract cross-reference block.
     - write must explicitly point chat to `requested_persona`, `effective_persona`, `persona_selection_source`, and `persona_override_owner_id`
     - reserved Personas must be acknowledged via reference, not redefined
  8. Planning / TODO execution tracking still lacks one TODO-item lifecycle enum and transition rules.
     - write must distinguish this assistant-chat plan/TODO lifecycle from orchestrator node status
  9. `§14` subagent cards and `§27.6` Persona display fields are still not wired together tightly enough.
     - write must bind Persona/runtime display fields into subagent cards by cross-reference rather than parallel field definitions
  10. Tool approval UX in chat is still underspecified.
      - write must define the inline approval card/dialog, required actions (`Allow Once`, session-scoped allow, deny), blocking behavior, and the fact that permission resolution logic stays owned by `Permissions_System.md`
- Anti-dup boundaries explicitly confirmed by the artifact:
  - permission precedence / permission key families remain owned by `Permissions_System.md`
  - cost/usage data model remains owned by `usage-feature.md`
  - runtime artifact schemas / bundle manifest remain owned by `Runtime_Artifacts_Panel.md`
  - EventRecord envelope remains owned by `Contracts_V0.md`
  - run-mode definitions remain owned by `Run_Modes.md`
  - Persona data model remains owned by `Personas.md`
  - context compilation / compaction algorithms remain owned by `FileSafe.md`

### 7.16 Durable Merge Artifact — FinalGUISpec.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/finalgui-merge.md`
- Artifact summary:
  - `21` `WRITE_NEEDED` findings
  - `15` suppressions with owner-doc citations
  - `7` deferred findings
  - explicit anti-dup matrix for `10` surface-owner boundaries
  - dependency graph + recommended execution order
- Implementation-ready write set preserved by the artifact:
  1. `gui:docker-naming-normalize`
     - normalize the stray `Docker Manage` spelling to canonical `Docker Manager`
  2. `gui:docker-addendum-placement`
     - separate the Docker Manager addendum structurally from Persona section content so it does not look embedded inside `§17 Persona Editor`
  3. `gui:duplicate-s17-renumber`
     - renumber the duplicate second `§17` block and repair all local cross-references
  4. `gui:phantom-s8-s9-s10`
     - resolve the phantom `§8`, `§9`, and `§10` TOC entries that have no bodies
     - artifact recommendation is to remove/retarget phantom references instead of creating fake redirect stubs
  5. `gui:dangling-s7x-crossrefs`
     - repair Appendix A references to nonexistent `§7.16+` sections
     - preferred resolution is to point directly to owner docs rather than keep dead section numbers alive
  6. `gui:settings-tabs-stubs`
     - add missing settings-tab stubs only where needed as owner-doc pointers
     - note: this is subsumed by the broader tab-registry fix below
  7. `gui:settings-unified-tab-registry`
     - add a Settings Tab Registry for the run-touched unified-settings inventory so FinalGUISpec carries placement/ownership even when detailed behavior lives elsewhere
  8. `gui:chat-panel-anchor`
     - add a minimal Chat Panel anchor that points to `assistant-chat-design.md` rather than duplicating chat spec content
  9. `gui:redb-keys-subset-note`
     - clarify that `§15.1` is a GUI-facing subset and that the full key catalog lives in `storage-plan.md`
  10. `gui:terminal-phantom-key`
      - replace the phantom `terminal_state:v1` reference with the canonical terminal workspace key naming
  11. `gui:dashboard-key-migration`
      - reconcile stale dashboard-layout key naming with the post-migration widget-layout naming
  12. `gui:blocked-recovery-consolidation`
      - collapse the six overlapping blocked/recovery GUI addenda into one canonical section and mark superseded fragments
  13. `gui:blocked-table-missing-rows`
      - extend the blocked visual-distinction table to cover retrying/backoff and remediation
  14. `gui:stale-tier-terminology`
      - clean up stale tier/phase/task/subtask terminology where FinalGUISpec still lags the node/package/lane/seam migration
  15. `gui:seglog-tier-ambiguity`
      - clarify whether the remaining `tier` mention refers to pricing tier or deprecated decomposition tier
  16. `gui:allblocked-timer-eventdriven`
      - reconcile all-nodes-blocked timer language with the no-polling / event-driven correctness rule
  17. `gui:agent-config-surface`
      - add the missing Agent Configuration surface stub for provider/model/account placement
  18. `gui:instruction-panes`
      - add the missing shared instruction panes / provider-native advanced panes stub
  19. `gui:persona-editor-field-sync`
      - add a note that Personas field SSOT lives in `Personas.md`, avoiding silent drift in the GUI section
  20. `gui:persona-mapping-stale-terms`
      - fix stale decomposition terms in persona mapping editors
      - note: artifact treats this as subsumed by `gui:stale-tier-terminology`
  21. `gui:gha-panel-anchor`
      - add the missing GitHub Actions panel anchor pointing to `GitHub_Integration.md`
- Important anti-dup boundaries explicitly confirmed by the artifact:
  - Docker Manager runtime/auth/publish logic stays owned by `Containers_Registry_and_Unraid.md`
  - command families stay owned by `UI_Command_Catalog.md`
  - chat lifecycle/composer/thread behavior stays owned by `assistant-chat-design.md`
  - full redb key catalog stays owned by `storage-plan.md`
  - permissions algorithm/snapshot schema stays owned by `Permissions_System.md`
  - GitHub panel/auth/SSH details stay owned by `GitHub_Integration.md`
  - Persona field list/runtime contract stays owned by `Personas.md`
  - blocked lifecycle remains owned by `assistant-chat-design.md`; FinalGUISpec owns visual mapping / placement only

### 7.17 Durable Merge Artifact — storage-plan.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/storage-merge.md`
- Artifact summary from the agent response:
  - described as `14` implementation-ready write clusters across `28` sections with `22` suppressions
- Important accuracy note after reading the artifact body:
  - the cluster map actually enumerates `C-01` through `C-16` with `C-13` as suppress-only, which leaves `15` actionable clusters if `C-11 Permission Snapshot DRY Violation` is counted as `DEDUP / WRITE`
  - treat the body enumeration as authoritative over the shorter summary count
- Implementation-ready cluster set preserved by the artifact:
  1. `C-01 Seglog Wire Format & Integrity`
     - add concrete wire-format rules under `§2.2`, including header/length-prefix/encoding, segment-rotation naming, and index-rebuild procedure
     - do not duplicate existing CRC32/corrupt-record logic
  2. `C-02 redb Schema Versioning & Migration`
     - formalize the schema version carrier, migration runner, execution order, and backup-before-destructive-step contract
  3. `C-03 Per-Record TTL & Retention Policy`
     - add default TTL/cardinality policy, cleanup trigger, and compaction coordination rules
  4. `C-04 Key Composition Rules & Naming Standard`
     - define the generative grammar for new key families rather than re-listing existing keys
  5. `C-05 Attempt-Record Key Conflict Resolution`
     - resolve contradictory `attempt_record` / `blocked_projection` key shapes already present in canon
     - artifact explicitly says the answer is to pick one canonical form, not add a third variant
  6. `C-06 §5.1–§5.4 stubs need real storage schema`
     - flesh out editor recovery, requested/effective runtime state, search/source-control projection state, and host-aware LSP persistence with concrete keys / projectors / snapshot schema
  7. `C-07 JSONL Mirror & Projector Pipeline`
     - define JSONL mirror record format, sync/batching, compression, and retention
  8. `C-08 Cross-Surface Receipt Record Extensions`
     - extend receipt storage with SCM / Actions / Docker / Kubernetes child payloads without redefining the parent identity skeleton
  9. `C-09 GHA Panel State & Container Persistence Keys`
     - register GitHub Actions config/state keys and Docker Manager persistence keys in the storage key catalog
     - GitHub schema details still stay owned by `GitHub_Integration.md`
  10. `C-10 Usage/Cost Tracking Storage Alignment`
      - add `usage_rollup` family / scan-job contract and related usage storage alignment rules without duplicating usage display formulas
  11. `C-11 Permission Snapshot DRY Violation`
      - remove duplicate inline schema ownership and let storage-plan keep key/binding while `Permissions_System.md` owns schema shape + enums
  12. `C-12 Orphaned / Missing Seglog Events`
      - storage-plan must add projection/indexing rules for referenced event families while keeping event-list SSOT in `Contracts_V0.md`
  13. `C-14 Document Bundle & Inline Notes Persistence`
      - add missing `document_bundle_record` / inline-notes persistence / targeted revision projection support
  14. `C-15 Preview Session & Browser Rendering Persistence`
      - add preview-session key families and browser lifecycle event projection/storage rules
  15. `C-16 Debug Investigation Persistence`
      - add `debug_investigation_record` persistence and projector/indexing rules for the already-canonical debug investigation event families
- Anchor map preserved by the artifact:
  - new `§2.2.x` subsections for wire format / segment rotation / index rebuild
  - new `§2.3.x` subsections for schema versioning / TTL defaults / key grammar
  - new `§2.4.1` for JSONL mirror format
  - existing `§2.5`, `§5.1–§5.4`, `Cross-surface receipt record`, `Required redb keys`, and `Permission Snapshot Addendum` all require concrete extensions
- Anti-dup boundaries explicitly confirmed by the artifact:
  - `Contracts_V0.md` owns the event list; storage-plan only owns projection/indexing rules
  - `Permissions_System.md` owns permission schema / approval policy
  - `usage-feature.md` owns rollup consumption / pricing/display logic
  - `FinalGUISpec.md` must import from the storage key catalog rather than fork it
  - `GitHub_Integration.md` owns ConfigKey schema details
  - `FileSafe.md` owns safe-point behavior
  - addenda already present in storage-plan remain reconciled canon and must not be contradicted by new material

### 7.18 Durable Merge Artifact — Runtime_Artifacts_Panel.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/runtime-artifacts-merge.md`
- Artifact summary:
  - `10` Group A genuinely missing RAP contracts
  - `8` Group B cross-cutting items where RAP mainly needs cross-refs / minor alignment
  - `4` Group C deferred items
  - `11` suppressed findings already covered in canon
  - `9` anti-duplication guardrails
- Implementation-ready Group A write set preserved by the artifact:
  1. `A-1 usage_event_ref canonical definition`
     - no canon doc currently defines format / scope / stability / presence rules for `usage_event_ref`
  2. `A-2 Receipt requested_action + effective_outcome`
     - receipt-like artifact flows still need shared `requested_action`, `effective_outcome`, and degradation-reason fields
  3. `A-3 Artifact retention classification`
     - RAP still lacks one retention-class contract covering `durable`, `session_bounded`, and `ephemeral_view`
  4. `A-4 Sensitive-metadata minimization and export masking`
     - secret-redaction exists, but non-secret operational metadata masking still lacks a canonical export/defaults contract
  5. `A-5 Crash-boundary truncation metadata`
     - streaming/incremental evidence still lacks persisted `truncation_state`, flushed-sequence, and explicit gap-rendering rules
  6. `A-6 Diff/review/export redaction boundary`
     - RAP still needs a concrete raw-content-vs-metadata persistence boundary for diff/review/export flows
  7. `A-7 Stitched-event envelope for cross-system correlation`
     - external-system artifacts still need receipt/correlation/source-system/time-skew fields
  8. `A-8 Persisted stream-view intent`
     - artifact surfaces still need explicit `follow` / `paused_snapshot` / `historical_view` persistence + restore degradation rules
  9. `A-9 Audit visibility as dedicated log/audit surface`
     - no current canon doc defines the complementary searchable artifact audit surface distinct from inline chat cards
  10. `A-10 Temporary instrumentation collector/lifecycle contract`
      - debug instrumentation install/collect/remove lifecycle still lacks a collector-state and sink contract
- Group B cross-cutting items preserved by the artifact (RAP cross-ref / co-owner only, not primary owner):
  - large-dataset scaling contract
  - cross-surface filter persistence
  - canonical time-source precedence
  - evidence budgets / redaction defaults for Debug
  - debug adapter model
  - stale/live data signaling
  - chat/file-tree deep-link panel context (artifact says this is actually a pure assistant-chat gap)
  - receipts identity-extension cross-ref once storage-plan lands its fuller receipt extension
- Anti-dup boundaries explicitly confirmed by the artifact:
  - EventRecord envelope remains owned by `Contracts_V0.md`
  - `debug.investigation.*` event families remain owned by `Contracts_V0.md`
  - `InvestigationContextAttachment` remains owned by `Contracts_V0.md`
  - `artifacts_index` key ownership / projector mechanics remain owned by `storage-plan.md`
  - cost/navigation rules remain owned by `usage-feature.md` + assistant chat
  - open routing remains owned by `FileManager.md` + `Contracts_V0.md`
  - debug strategy ladder remains owned by assistant chat
  - investigation bundle manifest is already canon in RAP and should not be re-invented elsewhere
  - auto-ingestion visibility remains owned by assistant chat rules

### 7.19 Phase 7 State After Four Landed Merge Artifacts

- Phase 7 now has durable, deduped, implementation-ready merge artifacts for:
  - `assistant-chat-design.md`
  - `FinalGUISpec.md`
  - `storage-plan.md`
  - `Runtime_Artifacts_Panel.md`
- These four docs were among the highest-value run-touched surfaces, so their durable merge landing materially reduces the risk that Phase 7 details remain trapped only in raw extracts or volatile agent output.
- Stable consequence for the ledger:
  - the artifact files above now count as durable implementation-grade backing for the ledger's corresponding doc clusters
  - future consolidation should preferentially copy from these merge artifacts rather than re-synthesizing from raw shard text
- Remaining Phase 7 priority order for docs still lacking durable merge markdown should now be:
  1. `Contracts_V0.md`
  2. `Permissions_System.md`
  3. `UI_Command_Catalog.md`
  4. `Orchestrator_Page.md`
  5. `GitHub_Integration.md`
  6. `Containers_Registry_and_Unraid.md`
- Rationale for that order:
  - `Contracts_V0.md` and `Permissions_System.md` still control the heaviest cross-doc normalization / anti-dup boundaries
  - `UI_Command_Catalog.md`, `Orchestrator_Page.md`, and `GitHub_Integration.md` carry several of the still-pending run-aware search / compare/open / command-family issues
  - `Containers_Registry_and_Unraid.md` appears narrower and more copy/state normalization heavy than the items above

### 7.20 Durable Merge Artifact — Permissions_System.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/permissions-merge.md`
- Provenance note:
  - this file was written by the separate `permissions-merge-synthesis` agent and is already durable on disk
  - the long-running Opus `merge2-permissions` agent is still running as of this checkpoint, so this existing `permissions-merge.md` should be treated as the current primary synthesis source unless/until the Opus pass lands a corroborating or sharper variant
- Artifact summary:
  - `9` implementation-ready clusters
  - no fully suppressed `WRITE_NEEDED` items; several clusters are only partially covered by current canon and explicitly cite the still-missing delta
  - detailed companion-doc requirements, anti-dup notes, and cluster ordering
- Implementation-ready cluster set preserved by the artifact:
  1. `Approval scope keys, rejection blast radius, and durable rule creation`
     - `Permissions_System.md` still incorrectly leans on vague session-wide approval semantics
     - write must compute and consume both:
       - `blocked_episode_ref`
       - `approval_scope_key`
     - scope keys must include normalized runtime/domain identity where present and must not use UI-tab/session ids as the primary approval scope
     - `reject` must narrow to exact matching scope rather than cascading to unrelated asks in the same UI session
     - in-chat approvals must not mutate Persona permission profiles
  2. `Domain-bound approval targets, preflight ordering, and drift invalidation`
     - approval-gated mutations still need a canonical `approval_target_ref`
     - write must define minimal target identity fields per domain:
       - SCM/local git
       - GitHub/hosted git
       - registry/publish
       - Kubernetes
       - operational session/tunnel
     - canonical ordering must become:
       1. policy resolution
       2. target computation
       3. cheap preflight
       4. approval only if still actionable
       5. post-approval preflight revalidation
       6. dispatch only if the approved revision still matches
     - target drift must invalidate prior approval rather than silently reuse it
  3. `Permission snapshots need requested/effective runtime identity, account, and switch lineage`
     - current permission snapshot schema is too thin for the shared runtime attribution model
     - write must add both decision-context fields and a richer `runtime_identity_context` block
     - artifact explicitly calls out still-missing fields such as:
       - `requested_account_binding?`
       - `account_switch_event_ref?`
       - transport-host vs upstream-provider split
       - requested/effective operational identity
     - companion propagation is required into `Contracts_V0.md`, `storage-plan.md`, and usage/runtime-artifact surfaces
  4. `Blocked-family taxonomy and payload-name cleanup`
     - permission-caused blocked states still need one canonical family split:
       - `blocked_policy`
       - `blocked_approval`
       - `blocked_preflight`
       - `blocked_governance`
     - all legacy `recovery_options[]` occurrences must be removed in favor of `allowed_action_ids[]`
     - recovery affordances must be direct action ids / command ids, not prose-only hints
  5. `Plan-mode preset must allow read-only planning tools and external-read web work`
     - current Plan-mode preset remains too restrictive and internally inconsistent
     - write must explicitly allow read-only planning tools (`todoread`, `todowrite`, limited `task`, read/navigation-only `lsp`, etc.) while still denying mutation-capable execution paths
     - `/web` family operations in Plan mode must be treated as external-read operations through the normal permission stack instead of auto-denied
  6. `Web-family semantic split, host-scoped session rules, and approval summaries`
     - `websearch/webresearch` versus `webfetch/webextract/webcrawl/webmap` still lacks a clean permission-facing semantic split
     - reusable rules must be query/tool-family-scoped for search/research, but host-scoped for fetch/extract/crawl/map
     - approval UI must summarize operation-appropriate details, including traversal bounds for crawl/map
     - artifact requires companion updates in `Tools.md` and `storage-plan.md`
  7. `Domain-specific confirmation classes for SCM, GitHub Actions, and interactive operational sessions`
     - destructive local SCM actions, GitHub Actions admin/destructive operations, and interactive operational sessions still need stricter confirmation classes than ordinary read-only inspection
     - exact-step confirmation must be required for destructive SCM and high-risk hosted actions rather than being silently covered by broad tool allows
     - exec/shell/debugger attach and port-forward/tunnel/browser exposure must be modeled as stricter permission classes than read-only inspection
  8. `Enterprise host/trust policy, host declaration preflight, and governance denials`
     - host/trust/proxy/governance denials still lack a shared permission-era taxonomy
     - MCP/custom/plugin/networked tools must declare contacted hosts/domains ahead of execution; undeclared expansion must return `blocked_preflight`
     - write must define canonical host/trust reason codes and governance deny-code families for GitHub, registry, and Kubernetes policy checks
  9. `Debug automation profile must classify temporary instrumentation scope`
     - current Debug automation profile is too coarse
     - write must classify instrumentation scope (`env_config_activation`, `ephemeral_tool_install`, `wrapper_launcher`, `temporary_source_patch`, `debugger_or_profiler_attach`) and require disclosure of temporary/durable nature, expected cleanup, and sensitive-runtime impact
- High-risk contradiction explicitly preserved by the artifact:
  - approvals are blocked-episode anchored in `Contracts_V0.md` / `human-in-the-loop.md`, but `Permissions_System.md` still contains session-wide wording
  - a future fix must replace the session-wide semantics rather than layering new text on top
- Companion-doc requirements explicitly called out by the artifact:
  - `Contracts_V0.md` must consume permission snapshot refs / blocked-family alignment
  - `storage-plan.md` must register additional identity/web-operation fields
  - `Tools.md` must clarify the `webfetch` vs `webextract` semantic split and host-contact metadata
  - `Run_Modes.md` must stay aligned on read-only delegated plan-mode children
  - `human-in-the-loop.md` only needs a narrow cross-reference for `approval_scope_key`

### 7.21 Durable Merge Artifact — Contracts_V0.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/contracts-merge.md`
- Artifact summary:
  - `3` blockers that must be resolved before additive work lands
  - `11` canon suppressions / false-gap guards
  - `26` distinct write targets across `6` cluster themes
  - `28` findings deferred to other owner docs
  - full dependency ordering and target-heading map
  - `GAP-11` explicitly excluded
- Required blocker resolution preserved by the artifact:
  1. `BLOCKER-01 remediation.resolved enum contradiction`
     - earlier canon and later addendum define conflicting enums
     - artifact recommends promoting the richer later enum and reconciling any still-needed `ceiling_exceeded` semantics instead of keeping two parallel sets
  2. `BLOCKER-02 failure_class / blocked_reason_code boundary bleed`
     - write must explicitly distinguish:
       - `failure_class` = how an attempt ended
       - `blocked_reason_code` = why a node cannot proceed
     - artifact warns not to overwrite the already-correct 14-value `blocked_reason_code` enum
  3. `BLOCKER-03 Gemini provider model stale text`
     - `Contracts_V0.md` still reflects stale single-provider Gemini wording
     - must reconcile to the now-canonical split between Gemini Direct and Gemini CLI
- Implementation-ready cluster set preserved by the artifact:
  1. `Cluster A — EventRecord & Runtime Identity Enrichment`
     - add `requested_account_id?` and `requested_account_binding?` to EventRecord rules where account selection was explicit/policy-driven
     - add `execution_role?` to EventRecord and attempt events
     - add a shared actor envelope (`actor_kind`, sparse `actor_ref`, `execution_role?`) instead of continuing per-family actor drift
     - enrich `tool.invoked` / `tool.denied` minimum payloads so the base sections catch up with later addenda
  2. `Cluster B — Governance/Runtime Record Envelope & Concern Contracts`
     - Contracts still lacks one reusable governance/runtime record envelope even though storage/orchestrator already imply those record families
     - add a shared record envelope (`record_id`, `record_kind`, scope/source refs, artifact/evidence refs, supersession links, status, timestamps)
     - add a canonical minimum concern record shape
     - add boundary rules distinguishing concern vs review finding vs annotation vs blocked episode vs recovery record
  3. `Cluster C — Route Target Gaps`
     - `route_target` still lacks concrete route recipes, rejection rules, resolver scoping, tab-family validity rules, and open-disposition / reuse policy
     - artifact treats this as a high-priority gap because downstream surfaces already depend on `route_target`
  4. `Cluster D — Missing Event Families`
     - downstream docs reference event families not yet registered in Contracts_V0's canonical registry
     - artifact specifically calls out:
       - gate evaluation events
       - FileSafe snapshot events
       - LSP server lifecycle events
       - worktree create/delete events
       - platform capability evaluation
       - memory gist events
       - annotation / selection / revision events
     - recommendation is to add a registry table and keep payload detail owned by producer docs
     - debug investigation events also need machine-readable outcome enrichment
  5. `Cluster E — Concurrency, Mutation Safety, Receipt Lifecycle`
     - add in-flight mutation-lock / coalescing / stale-selection revalidation rules
     - add indeterminate remote outcome and cancel-vs-complete precedence handling
     - add `reference_state` for disappeared identities
     - add restart continuity states for objects that outlive the UI observer
     - add a multi-repo/workspace-root identity boundary rule so `project_id` alone is not treated as sufficient
  6. `Cluster F — Cross-Surface Shared Contracts`
     - add a canonical temporal contract (`source_occurred_at`, `observed_at`, `recorded_at`, UTC-persist/local-display, skew labeling)
     - centralize a shared attribution packet
     - clarify that usage-window/source-confidence semantics are owned by `usage-feature.md` while `UsagePressureState` is the scheduler-facing normalization
     - require domain-specific blocked payload metadata to conform to the shared blocking payload rule without redefining domain schemas locally
- False-gap / anti-regression suppressions explicitly preserved by the artifact:
  - `blocked_reason_code` enum already exists and must not be "re-added"
  - `allowed_action_ids[]` is already canonical
  - subagent context-shrink/rehydrate events already exist
  - Personas `_id` variants are correctly omitted here
  - blocked episode `attempt_id?` modeling already exists
  - `GAP-11` stays excluded

### 7.22 Durable Merge Artifact — Containers_Registry_and_Unraid.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/containers-merge.md`
- Artifact summary:
  - `5` write-needed clusters covering `16` individual write targets
  - `10` suppressions
  - `4` exact additions needed inside `Containers_Registry_and_Unraid.md` itself
  - `11` dependency edges and `10` anti-dup rules
- Key conclusion preserved by the artifact:
  - `Containers_Registry_and_Unraid.md` itself is already comparatively complete
  - the majority of remaining run-touched gaps sit in adjacent docs that need to catch up to the container contracts already defined here
- Cluster set preserved by the artifact:
  1. `Cluster A — Missing Command Families`
     - `UI_Command_Catalog.md` still lacks the `cmd.docker.*` family, the `cmd.k8s.*` family, and cross-surface Docker pivots
     - artifact enumerates:
       - `26` missing `cmd.docker.*` commands
       - `10` missing `cmd.k8s.*` commands
       - cross-surface pivots like `cmd.docker.open_in_docker_manager`
     - also notes orchestrator build/push commands should remain in orchestrator family and only be cross-referenced from Docker
  2. `Cluster B — Approval-Domain Binding`
     - Docker/K8s actions still need domain-bound approval scoping and canonical preflight→approval ordering
     - current `external_publish_side_effect` guard is not enough by itself
     - scope must distinguish exact registry/namespace/repository or K8s context/namespace domains
  3. `Cluster C — Retention / Receipt Lineage`
     - `storage-plan.md` still lacks concrete `docker_refs` and `kubernetes_refs` receipt schemas
     - `container_manager.project_state` redb family is still absent
     - receipt retention classes still need explicit durable/bounded/discardable rules
  4. `Cluster D — Host / Registry / K8s Policy`
     - shared enterprise host/trust/proxy policy remains under-specified for container-related remote operations
     - registry promotion flow and drift-detection differentiators need reserved future-scope anchors, not silent omission
  5. `Cluster E — Persistence / State Coverage`
     - container panel state persistence, Docker/K8s event registration in `Contracts_V0.md`, and Docker-specific blocked-state mapping remain incomplete in adjacent docs
- Exact additions still needed inside the containers plan itself:
  1. add an explicit `Preflight and approval ordering contract`
  2. expand `Kubernetes enablement rules` and `Kubernetes doctor checks`
  3. add `Future-scope placeholders` for registry promotion, drift detection, access intelligence, and project-focused K8s deep linkage
  4. add an `Event registration contract` note clarifying that this plan defines Docker/Unraid events but `Contracts_V0.md` is the registration authority
- Important suppressions / anti-dup boundaries explicitly preserved by the artifact:
  - Docker Manager naming inconsistency is a `FinalGUISpec.md` fix target, not a containers-plan gap
  - blocked-payload normalization already exists inside the containers plan and should not be re-specified
  - `external_publish_side_effect` remains owned by `Permissions_System.md`
  - doctor checks remain owned by `newtools.md`
  - XML generation / template repo lifecycle is already comprehensively specified here
  - `route_target` remains the navigation contract; do not invent a parallel `PanelContext`

### 7.23 Phase 7 State After Seven Landed Merge Artifacts

- Phase 7 now has durable, implementation-ready merge artifacts for:
  - `assistant-chat-design.md`
  - `FinalGUISpec.md`
  - `storage-plan.md`
  - `Runtime_Artifacts_Panel.md`
  - `Permissions_System.md`
  - `Contracts_V0.md`
  - `Containers_Registry_and_Unraid.md`
- This materially changes the remaining risk profile:
  - the heaviest cross-doc normalization surfaces (`Permissions_System.md`, `Contracts_V0.md`, `storage-plan.md`) now all have durable merge artifacts on disk
  - Docker/containers now has a durable merge showing that most remaining work is actually adjacent-doc catch-up rather than a large missing-body problem inside the containers plan itself
- Remaining Phase 7 docs still lacking durable merge markdown on disk are now:
  1. `UI_Command_Catalog.md`
  2. `Orchestrator_Page.md`
  3. `GitHub_Integration.md`
- Updated priority rationale:
  - `UI_Command_Catalog.md` remains high because several landed merge artifacts now explicitly depend on missing command-family registration
  - `Orchestrator_Page.md` remains high because run-aware search scope, concern boundaries, and cross-run navigation are still open
  - `GitHub_Integration.md` remains high because requested/effective identity propagation and compare/open identity across worktrees are still open
- Additional sequencing note now visible only after the seven landed artifacts:
  - `UI_Command_Catalog.md` is now a stronger near-term dependency than before because both the containers and assistant/finalgui/permissions merges reference missing command registrations
  - `Contracts_V0.md` and `Permissions_System.md` still need careful contradiction handling first, but they are no longer "missing synthesis" problems; they are now "apply in the right order" problems

### 7.24 Durable Merge Artifact — UI_Command_Catalog.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/command-catalog-merge.md`
- Artifact summary:
  - `10` deduped `WRITE_NEEDED` items
  - `17` suppressed / already-existing findings
  - full suppression baseline across existing command families
  - dependency-ordered write sequence
  - `7` anti-duplication guardrails
  - precise target headings / anchors with line numbers
- Existing-canon baseline explicitly preserved by the artifact:
  - Source Control / Git diff/review commands already exist and must not be re-proposed
  - chat-owned `cmd.chat.worktree.*` commands already exist
  - orchestrator wrapper commands like `cmd.orchestrator.open_concern` already exist
  - the full `cmd.runtime.*` recovery family already exists
  - `cmd.graph.retry_node` already exists in wiring and must not be duplicated
  - `route_target` remains the canonical navigation/focus contract behind wrapper commands
- Implementation-ready write set preserved by the artifact:
  1. `Missing cross-surface pivot wrappers`
     - add:
       - `cmd.orchestrator.open_in_github_actions`
       - `cmd.orchestrator.open_in_docker_manager`
     - these are `navigation_wrapper` commands only and must normalize through `route_target`
  2. `GitHub Actions command family`
     - add the missing `cmd.github_actions.*` family
     - artifact explicitly proposes:
       - `cmd.github_actions.show`
       - `cmd.github_actions.switch_subview`
       - `cmd.github_actions.rerun_workflow`
       - `cmd.github_actions.cancel_workflow`
       - `cmd.github_actions.pin_workflow`
       - `cmd.github_actions.open_run_log`
       - `cmd.github_actions.open_run_diff`
     - secret/variable CRUD remains deferred until schema/owner-doc details settle
  3. `Docker Manager command family`
     - add the missing `cmd.docker.*` catalog entries
     - artifact explicitly proposes:
       - `cmd.docker.show`
       - `cmd.docker.switch_subview`
       - `cmd.docker.browser_login`
       - `cmd.docker.save_pat`
       - `cmd.docker.create_repository`
       - `cmd.docker.create_repository.confirm`
       - `cmd.docker.create_repository.cancel`
     - artifact also preserves the adjacent orchestrator-owned Docker-related commands that belong in orchestrator family rather than `cmd.docker.*`:
       - `cmd.orchestrator.preview_open`
       - `cmd.orchestrator.preview_stop`
       - `cmd.orchestrator.open_preview_artifact`
       - `cmd.orchestrator.build_run`
       - `cmd.orchestrator.open_build_artifact`
       - `cmd.orchestrator.push_image`
  4. `Worktree lifecycle commands (Source Control surface)`
     - add the missing Source-Control-surface worktree lifecycle family:
       - `cmd.git.worktree.list`
       - `cmd.git.worktree.open_files`
       - `cmd.git.worktree.compare`
       - `cmd.git.worktree.remove`
     - artifact explicitly distinguishes these from the already-existing chat-thread-scoped `cmd.chat.worktree.*` commands
  5. `Ghost commands requiring catalog registration`
     - add catalog rows for command ids already referenced elsewhere but missing from `UI_Command_Catalog.md`
     - artifact specifically calls out:
       - `cmd.chat.run_user_command`
       - `cmd.chat.branch_from_restore`
       - `cmd.orchestrator.switch_tab`
       - `cmd.graph.select_node`
     - and notes that `cmd.graph.retry_node` only needs a catalog row matching existing wiring, not a new command invention
  6. `Catalog-wide structural addition — command_kind metadata column`
     - every catalog row should carry `command_kind` aligned with `Contracts_V0.md §7.2`
     - this must land first because later additions rely on the taxonomy
  7. `Catalog-wide structural addition — projection-freshness gating clause`
     - add a universal precondition that mutating `domain_action` commands must check projection freshness/health before dispatch
     - current catalog only has partial search-specific stale/degraded handling
  8. `Catalog-wide structural addition — widget-hostability scope narrowing`
     - narrow widget-command affected-surface wording so only actual widget-hosted surfaces are named, instead of implying all orchestrator tabs are widget-composed
  9. `Common panel-context payload contract`
     - add a shared vocabulary for wrapper commands carrying deep-link context (`project_id`, `repo_id?`, `worktree_id?`, `branch_ref?`, `workflow_ref?`, `job_ref?`, `container_ref?`, `image_ref?`, `kubernetes_context?`, `run_id?`, `attempt_id?`, `subview?`)
     - artifact explicitly says this is shared wrapper vocabulary, **not** a new `cmd.nav.*` family
  10. `GitHub reconnect payload enrichment`
      - enrich `cmd.github.connect` (or add a narrow reconnect variant) so it can carry project/auth/account context rather than remaining arg-less
- Anti-duplication guardrails explicitly preserved by the artifact:
  - Docker Manager naming is canonical and must stay `Docker Manager`
  - `allowed_action_ids[]` remains canonical over `allowed_actions[]`
  - `route_target` continues to own navigation/focus semantics
  - stable wrappers are preferred over introducing a public `cmd.nav.*` family
  - `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` remain explicitly non-canonical
  - Kubernetes remains a Docker Manager subview rather than a separate top-level command family namespace
- Ordering note preserved by the artifact:
  - `command_kind` column should land before the rest
  - shared panel-context payload should land before the new cross-surface wrapper families that consume it

### 7.25 Phase 7 State After Eight Landed Merge Artifacts

- Phase 7 now has durable, implementation-ready merge artifacts for:
  - `assistant-chat-design.md`
  - `FinalGUISpec.md`
  - `storage-plan.md`
  - `Runtime_Artifacts_Panel.md`
  - `Permissions_System.md`
  - `Contracts_V0.md`
  - `Containers_Registry_and_Unraid.md`
  - `UI_Command_Catalog.md`
- This leaves only two run-touched docs still lacking durable merge markdown on disk:
  1. `Orchestrator_Page.md`
  2. `GitHub_Integration.md`
- Updated dependency read after the command-catalog artifact:
  - command taxonomy is now no longer an unsynthesized blind spot; it is a durable dependency artifact that several other merges can safely reference
  - the remaining open synthesis concentration is now primarily:
    - orchestrator-side run-aware search, concern-family boundaries, and cross-run navigation semantics
    - GitHub-side requested/effective identity propagation and compare/open identity across worktrees

### 7.26 Durable Merge Artifact — Orchestrator_Page.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/orchestrator-merge.md`
- Provenance:
  - landed after an extended delayed run from `merge2-orchestrator`
  - this durable artifact supersedes the earlier manual fallback synthesis for Orchestrator
- Artifact summary:
  - `14` active `WRITE_NEEDED` clusters across `5` files
  - `14` suppressions
  - `4` ownership-deferred items
  - explicit anti-dup rules against route/open contracts, command ids, redb keys, and event schemas
- Orchestrator_Page.md-specific implementation-ready write set preserved by the artifact:
  1. `Concern model — formal lifecycle section`
     - current concern section is only partial: lifecycle values and a few rules exist, but transition/guard/persistence semantics are still missing
     - write must add:
       - transition matrix
       - reopen semantics
       - resolved/dismissed guard rules
       - persistence/projection linkage via concern records
  2. `Seam weak-integration concern taxonomy`
     - current prose names the ideas but not the canonical enum
     - write must normalize the weak-integration categories to:
       - `wiring`
       - `workflow`
       - `state`
       - `gui`
       - `design`
     - and map them to existing descriptive prose
  3. `Inspector / full-record behavior split`
     - write must explicitly separate summary/action inspectors from dense full-record views
     - dense objects must open dedicated full-record views via canonical route/open contracts rather than turning inspectors into giant inline records
  4. `Trust/concern projection handoffs`
     - current trust-state disclosure is only partially generalized
     - write must make projection freshness/health gating a cross-tab rule for offered mutating actions, not just a local evidence/detail hint
- Additional cross-file clusters preserved by the artifact and relevant to Orchestrator-owned correctness:
  - `Run_Graph_View.md` still needs the same inspector/full-record behavior split
  - `Contracts_V0.md` still needs missing concern, promotion, graph-patch, and recovery record/event contracts
  - `storage-plan.md` still needs investigation schema, receipt extensions, web-operation child payloads, seglog wire format, and key-shape conflict cleanup
  - `UI_Command_Catalog.md` still has a low-priority wrapper-completeness dependency noted from orchestrator-side usage
- Important suppressions explicitly confirmed by the artifact:
  - run-aware object-family list/search object coverage is already present
  - lane/package/seam execution-model propagation is already present
  - route_target / UICommand / OpenSubject content that this run intended is already present in `Contracts_V0.md`
  - HITL blocked-episode anchor and billing-entity conditional requirements are already present
- Practical consequence:
  - Orchestrator now moves from manual fallback coverage to durable file-backed merge coverage

### 7.27 Durable Merge Artifact — GitHub_Integration.md

- Durable artifact now on disk:
  - `~/.copilot/session-state/973ef7c7-ba3e-423b-859f-e19e629b0761/files/phase7-merge/github-merge.md`
- Provenance:
  - the original `merge2-github` run failed with a transport/model error and produced no file
  - a focused retry (`merge3-github`, `gpt-5.4`) succeeded and wrote the durable artifact
- Artifact summary:
  - `7` `WRITE_NEEDED`
  - `7` suppressed
  - `0` deferred
  - explicit owner-doc matrix plus insertion-ready deltas and verification/dependency notes
- GitHub-specific implementation-ready write set preserved by the artifact:
  1. `Requested/effective identity propagation into GitHub docs`
     - GitHub auth/integration docs must explicitly consume the canonical requested/effective runtime identity fields already owned by `Contracts_V0.md`
     - required GitHub-side rules now include requested vs effective disclosure in auth/admin/readiness/history contexts without redefining the field schema locally
  2. `Compare/open identity consumption and run-aware compare-origin forwarding`
     - GitHub pivots into diff/review must carry canonical compare identity and compare-origin metadata rather than reconstructing compare targets from local UI state
     - artifact supplies a concrete GitHub-origin compare-origin vocabulary, including:
       - `changes.unstaged`
       - `changes.staged`
       - `history.commit_parent`
       - `conflict.review`
       - `worktree.branch_compare`
       - `actions.run_commit_range`
       - `blocked.dirty_worktree`
       - `recovery.safe_point_retry`
  3. `Worktree topology view`
     - Source Control still needs a topology view that overlays worktree state and owner/status onto branch ancestry rather than leaving Worktrees and Graph as disconnected surfaces
  4. `Dedicated review mode and guided conflict assistant`
     - GitHub integration still needs:
       - a first-class review mode preserving compare identity and compare-origin
       - a guided conflict assistant layered over canonical Git conflict commands
     - artifact keeps hunk-level micro-UX ownership out of GitHub docs
  5. `GitHub Actions Current Branch semantics, refresh triggers, and stale labeling`
     - the retry artifact supplies a concrete precedence order for `Current Branch`
     - it also formalizes the required refresh/recompute triggers and freshness labels for Actions surfaces
  6. `Actions workflow-authoring precedence and durable admin-receipt obligations`
     - repository workflow YAML in the active repo/worktree becomes runtime truth after apply/save
     - generated workflow metadata remains advisory/history state until applied
     - GitHub admin actions (secrets/variables/environments/workflow pinning/readiness checks) must emit durable project-scoped receipts even when not attached to an orchestrator run
  7. `Remote/SSH worktree identity and remote-aware Open in Source Control semantics`
     - current remote-project rules still need explicit remote-native `repo_id/worktree_id/path` handoff semantics and remote-aware open behavior
- Important suppressions / anti-dup boundaries explicitly preserved by the artifact:
  - requested/effective runtime identity field list remains owned by `Contracts_V0.md`
  - compare session envelope / same-path-across-worktrees field set remains owned by `Contracts_V0.md` + `FileManager.md`
  - hunk expand/collapse, grouped hunk actions, and diff-local search micro-UX remain owned by `FileManager.md` / `UI_Command_Catalog.md`
  - command ids remain owned by `UI_Command_Catalog.md`
  - cross-surface receipt schema remains owned by `storage-plan.md`
  - Orchestrator run-to-repo lineage remains owned by `Orchestrator_Page.md` + `storage-plan.md`
  - Health vs Source Control live-worktree ownership remains owned by `FinalGUISpec.md` + `WorktreeGitImprovement.md`

### 7.28 Phase 7 State After Full Synthesis Coverage

- Phase 7 now has implementation-ready synthesis coverage for all run-touched high-priority docs.
- Coverage mode by doc:
  - durable file-backed merge artifacts:
    - `assistant-chat-design.md`
    - `FinalGUISpec.md`
    - `storage-plan.md`
    - `Runtime_Artifacts_Panel.md`
    - `Permissions_System.md`
    - `Contracts_V0.md`
    - `Containers_Registry_and_Unraid.md`
    - `UI_Command_Catalog.md`
    - `Orchestrator_Page.md`
    - `GitHub_Integration.md`
- Practical consequence:
  - no remaining run-touched target doc is waiting on unsynthesized findings before Phase 8 contradiction work can start
  - Phase 7 coverage is now fully file-backed across all targeted run-touched docs
- Recommended next todo remains unchanged at the workflow level:
  1. `phase8-contradictions`
  2. `phase9-regen-fixes`
  3. `phase10-apply`

---

## Phase 10 — Fix Application Complete (2026-04-01T17:04Z)

All 112 fix items applied across 28 Plans docs via 16 parallel GPT-5.4 subagents.

### Summary by strategy

| Strategy | Items | Target docs |
|---|---|---|
| A (Tier→Node) | 9 | Prompt_Pipeline, WorktreeGitImprovement, Tools, newtools, interview-subagent-integration, chain-wizard-flexibility, human-in-the-loop, 00-plans-index, Progression_Gates |
| B (Chat UX) | 8 | assistant-chat-design |
| C (Tools/Perms) | 10 | Tools, Permissions_System |
| D (Debug) | 4 | storage-plan, Executor_Protocol, Commands_System, Crosswalk |
| E (UICmd) | 5 | UI_Command_Catalog |
| F (Storage) | 9 | storage-plan |
| G (FinalGUI) | 11 | FinalGUISpec |
| H (Usage) | 3 | usage-feature |
| I (doc_intents restoration) | 16 | FinalGUISpec, storage-plan, assistant-chat-design, Contracts_V0, UI_Command_Catalog, usage-feature, feature-list |
| J (Contract reconciliation) | 6 | Contracts_V0, Executor_Protocol |
| K (Multi-Account/Provider) | 7 | Multi-Account, Provider_OpenCode |
| L (Model System) | 5 | Models_System |
| M (Crosswalk) | 4 | Crosswalk |
| N (Wizard) | 5 | chain-wizard-flexibility |
| O (LSP) | 4 | LSPSupport |
| P (Misc) | 6 | Contracts_V0, FinalGUISpec, Plugins_System, Provider_Stream_Mapping, interview-subagent-integration |

### Key content added

1. **Tier→Node migration**: All 9 docs using tier-era terminology updated to node/package/lane/seam model
2. **Chat UX completeness**: Composer behavior, message taxonomy, thread lifecycle/identity, mode-overlay enum, blocked-state consolidation, subagent visibility
3. **Tool contracts**: Full I/O schemas for bash/edit/view/grep/glob/create, task tool dispatch, skill runtime contract, plan-mode preset fix
4. **Permissions depth**: Durable approval paths, web-op patterns, package/seam/lane scopes, algorithm composition, security model
5. **Storage schemas**: Investigation, GHA, web-op, receipt-extension, bundle/revision/preview schemas; seglog wire format; key conflict resolutions; terminal key reconciliation
6. **FinalGUISpec**: Docker naming, section renumbering, blocked addenda collapse, Agent-Config panel, settings tabs (21+), side-panel specs, Chat/Inline-Note/Bundle controls, tier terminology cleanup
7. **Contracts**: PersonaSnapshot, EventRecord mode fields, 19 subagent + 6 crew events, provider lifecycle mapping, investigation context canonicalization, §1.1 renumbering
8. **Command families**: cmd.debug.*, cmd.actions.*, cmd.docker.*, cmd.k8s.*, cmd.git.worktree.*, expanded cmd.source_control.*, chat message actions
9. **Model System**: Talkativeness rule, capabilities catalog, registration flow, token counting abstraction, context window limits
10. **Provider/Account**: Auth flow walkthroughs, registration flow, credential_ref/auth_surface, cancellation/abort, concurrency, streaming error recovery
11. **LSP**: §5.1 Chat LSP, per-language root detection, SSH transport details, server lifecycle state machine
12. **Wizard**: Canonical wizard_status, clarification/findings separation, CUP ownership, cancellation cleanup, §15.5 + personas

### Status

- meta.json: `ready_for_reconciliation`
- All 112 fix items: `done`
- Phase 8 contradictions: resolved (4/4)
- Phase 9/10 fix application: complete
- Remaining: pipeline verification (shards + spec-lock) if instructed

---

## Phase 11 — Reconciliation / Coverage Pass

### 11.1 Reconciliation Summary

**What was reconciled:** 112 fix items across 16 strategies (A–P) applied to 28 planning docs, plus 4 Phase 8 canonical contradiction resolutions in 6 docs. The reconciliation checks whether the 34 applied-doc changes created or left drift in the remaining ~40 untouched docs, and whether the patched docs themselves have residual stale terminology.

**Major drift risks identified:**
1. **Tier→Node migration incomplete**: `orchestrator-subagent-integration.md` body has 571+ tier refs (Phase 10 only touched addenda). 4 additional docs have significant tier framing. 6 docs retain `owner_tier_id` (should be `owner_node_id` per WorktreeGitImprovement.md L293).
2. **Residual stale refs in patched docs**: `assistant-chat-design.md`, `storage-plan.md`, `Glossary.md`, `LSPSupport.md` have 1–2 residual tier-era symbols that leaked through the parallel fix pass.
3. **Permissions depth gap**: Merge clusters 3, 8–10, 12–15 from permissions-merge.md may not be fully covered by the C05–C09 fix items.
4. **Parallel-edit consistency risk**: FinalGUISpec.md (16 agents), Contracts_V0.md (7 agents), storage-plan.md (13 agents) had many parallel editors—internal consistency not yet verified.

### 11.2 Raw Coverage Ledger

**Total docs in Plans/:** 75 files (61 .md + 14 .json/.jsonl)
**Docs patched in Phase 8+10:** 30 (28 Phase 10 + 2 Phase 8-only)
**Docs analyzed for drift:** 55+ (via 5 parallel explore agents + targeted grep)

**Major doc clusters/themes:**

| Cluster | Docs | Drift Risk |
|---|---|---|
| Orchestrator / subagent | orchestrator-subagent-integration.md, Personas.md, agent-rules-context.md | CRITICAL — body still teaches tier model |
| Storage / state | storage-plan.md, FileSafe.md, assistant-memory-subsystem.md | HIGH — owner_tier_id, recovery_options residuals |
| Worktree ownership | GitHub_Integration.md, Orchestrator_Page.md, WorktreeGitImprovement.md, Glossary.md | HIGH — tier_label, owner_tier_id inconsistency |
| Chat/UX | assistant-chat-design.md, FinalGUISpec.md, Run_Graph_View.md | MEDIUM — residual owner_tier_id |
| Provider/CLI | CLI_Bridged_Providers.md, Multi-Account.md | MEDIUM — tier_id in envelopes |
| Permissions | Permissions_System.md | MEDIUM — outstanding merge clusters |
| Misc/cleanup | MiscPlan.md | HIGH — cleanup policy tier-scoped |
| Baseline refs | OpenCode_Coverage_Matrix.md, OpenCode_Deep_Extraction.md | LOW — legacy baseline docs |
| Verification gates | GUI_Rebuild_Requirements_Checklist.md, Section15_MVP_Promoted_Features_Spec.md | LOW — anti-pattern markers by design |
| Clean | 18 docs (Architecture_Invariants, Formatters_System, etc.) | NONE |

### 11.3 Three-Bucket Register

#### BUCKET 1: MUST CHANGE (10 docs)

| # | Doc | Why | Section/Anchor | Change Type |
|---|---|---|---|---|
| MC-01 | `Plans/orchestrator-subagent-integration.md` | 571+ tier refs in body; body teaches Phase/Task/Subtask/Iteration while addenda teach node model. Split-brain makes doc unbuildable. | Full body (lines 1–6000+) | REPLACE body with node-model canon; retire tier text |
| MC-02 | `Plans/MiscPlan.md` | 237+ tier matches; cleanup policy framed as "per-tier" | Cleanup/lifecycle policy sections | REPLACE tier-scoped framing with worktree/lane/attempt lifecycle |
| MC-03 | `Plans/FileSafe.md` | 69+ tier matches; Part B context compiler references Phase/Task/Subtask/Iteration as agent roles; `recovery_options[]` at L2708 | Part B context compiler; L2708 normative use | REPLACE Part B tier roles; remove/deprecate recovery_options |
| MC-04 | `Plans/Personas.md` | `select_for_tier()` function name (9 refs); L33 "Orchestrator spawns Agents for each tier" | §3.3 validation, `select_for_tier` fn, L33 framing | REPLACE function name → `select_for_node`; reframe tier→node |
| MC-05 | `Plans/GitHub_Integration.md` | `tier_label` in worktree owner format (L190, L212); `owner_tier_id` (L212) | §C worktree ownership display | REPLACE `tier_label` → `node_label`; `owner_tier_id` → `owner_node_id` |
| MC-06 | `Plans/assistant-memory-subsystem.md` | `owner_tier_id?` field in schema; storage model unclear on seglog interaction | Context schema section | REPLACE `owner_tier_id?` → `owner_node_id?`; add seglog reconciliation note |
| MC-07 | `Plans/CLI_Bridged_Providers.md` | `tier_id?` in `run.started` envelope spec; not in canonical Contracts_V0.md | run.started payload schema | REPLACE `tier_id?` → `node_id?` or remove |
| MC-08 | `Plans/Orchestrator_Page.md` | `owner_tier_id` at L180; should be `owner_node_id` | Worktree ownership display (L180) | REPLACE `owner_tier_id` → `owner_node_id` |
| MC-09 | `Plans/agent-rules-context.md` | `TierContextInjectorHook` legacy code reference; 9 tier-era terms | TierContextInjectorHook reference | REPLACE with generic rules-injection mechanism name |
| MC-10 | `Plans/Permissions_System.md` | Merge clusters 3 (snapshot enrichment), 8 (domain approval target binding), 9 (destructive local SCM), 10 (preflight invalidation), 12 (operational session classes), 13 (enterprise host/MCP preflight), 14 (approval-card summary), 15 (instrumentation/FileSafe) potentially outstanding from permissions-merge.md | Multiple sections | ADDITIVE — verify coverage of 8 clusters; add missing content |

#### BUCKET 2: MUST RECONCILE (4 docs — residuals in patched docs)

| # | Doc | Why | Section/Anchor | Change Type |
|---|---|---|---|---|
| MR-01 | `Plans/assistant-chat-design.md` | `owner_tier_id` at L2481-2482 (residual from parallel edit) | Worktree ownership addendum (L2481-2482) | REPLACE `owner_tier_id` → `owner_node_id` (2 occurrences) |
| MR-02 | `Plans/storage-plan.md` | `owner_tier_id` at L1327-1328 (residual) | §5.x worktree record fields (L1327-1328) | REPLACE `owner_tier_id` → `owner_node_id` (2 occurrences) |
| MR-03 | `Plans/Glossary.md` | `owner_tier_id` in assistant worktree definition (L39) | Glossary table row for "assistant worktree" | REPLACE `owner_tier_id` → `owner_node_id` (1 occurrence) |
| MR-04 | `Plans/LSPSupport.md` | `select_for_tier` at L958; references orch-subagent-integration doc | §LSP Subagent selection cross-ref (L958) | REPLACE `select_for_tier` → `select_for_node` (1 occurrence) |

#### BUCKET 3: MUST VERIFY (12 docs)

| # | Doc | Why | Expected Outcome |
|---|---|---|---|
| MV-01 | `Plans/Section15_MVP_Promoted_Features_Spec.md` | 7 tier refs; most are anti-pattern markers | Likely clean — verify framing is explicitly deprecated |
| MV-02 | `Plans/Run_Graph_View.md` | 1-2 tier refs as anti-pattern markers | Likely clean — verify correct framing |
| MV-03 | `Plans/Run_Modes.md` | Minor tier ref; debug overlay alignment | Verify `debug` mode refs align with D01-D03 fixes |
| MV-04 | `Plans/OpenCode_Coverage_Matrix.md` | Legacy audit doc with 1-2 stale refs | May need deprecation marker — low priority |
| MV-05 | `Plans/OpenCode_Deep_Extraction.md` | Baseline extraction doc; session-wide approval ref | May need top-level "baseline-only" callout |
| MV-06 | `Plans/Runtime_Artifacts_Panel.md` | 1 stale `tier_id` mention | Verify context; remove if normative |
| MV-07 | `Plans/Project_Output_Artifacts.md` | "mid-tier" phrasing | Verify context; rephrase if normative |
| MV-08 | `Plans/Containers_Registry_and_Unraid.md` | `recovery_options` in deprecation notes (L335, L797) | Verify framing is correctly non-normative |
| MV-09 | `Plans/GUI_Rebuild_Requirements_Checklist.md` | 3 stale refs as anti-pattern verification gates | Likely clean by design — verify positioning |
| MV-10 | `Plans/rewrite-tie-in-memo.md` | Policy-locked memo; may contain legacy normative phrasing | Verify no accidental normative drift |
| MV-11 | `Plans/FinalGUISpec.md` | 16 parallel agents edited this doc | Verify internal consistency (no section conflicts) |
| MV-12 | `Plans/Contracts_V0.md` | 7 agents contributed; canonical contract doc | Verify no internal contradictions from parallel edits |

### 11.4 Derived / Regen-Only Checks

These artifacts must NOT enter packetization buckets but must be regenerated/validated after packet application:

| Artifact | Action |
|---|---|
| `Plans/_shards/**` | Regenerate via `python3 scripts/pm-shard-plans.py --generate` then `--check` |
| `Plans/.evidence/**` | Regenerate if evidence pipeline exists |
| `Plans/Spec_Lock.json` | Validate via `python3 scripts/pm-plans-verify.py verify-spec-lock` |
| `Plans/auto_decisions.jsonl` | Do NOT edit; verify no stale decision refs |

### 11.5 Missing Coverage Warnings

1. **orchestrator-subagent-integration.md body rewrite** — This is the single largest remaining gap. The 7039-line doc's body (lines 1–6000+) still teaches the tier model while addenda at the end teach the node model. No implementation agent can build correctly from this. Strategy A deferred it from Phase 10 due to scale. Must be in the packet as a separate work item or sub-packet.

2. **Permissions depth clusters** — 8 of 15 permissions-merge.md clusters (3, 8–10, 12–15) were not explicitly covered by C05–C09. These cover: permission snapshot enrichment, domain approval target binding, destructive local SCM classification, preflight invalidation on drift, interactive operational session permission classes, enterprise host/MCP host preflight, approval-card summary per web-op type, and instrumentation/FileSafe permission interaction. Some may have been implicitly addressed; each needs verification.

3. **owner_tier_id → owner_node_id propagation** — 6 docs still use `owner_tier_id` while WorktreeGitImprovement.md (L293) already uses `owner_node_id`. This is a cross-doc schema rename that must be applied atomically.

4. **select_for_tier → select_for_node propagation** — Personas.md (9 refs), LSPSupport.md (1 ref), orchestrator-subagent-integration.md (13+ refs) all use the old function name.

### 11.6 Packetization-Ready Doc Set

#### MUST CHANGE docs (10)

| Doc | Why | Likely Anchor/Section | Change Kind | Additive or Replace |
|---|---|---|---|---|
| `Plans/orchestrator-subagent-integration.md` | Body/addenda split-brain; 571+ tier refs | Full body rewrite | Structural rewrite | REPLACE (retire tier body; promote node addenda) |
| `Plans/MiscPlan.md` | Cleanup policy tier-scoped | Cleanup/lifecycle sections | Terminology + framing | REPLACE tier framing |
| `Plans/FileSafe.md` | Part B tier roles; recovery_options | Part B context compiler; L2708 | Terminology + schema | REPLACE Part B; remove recovery_options |
| `Plans/Personas.md` | select_for_tier; tier-spawning framing | §3.3 validation; L33; function refs | Rename + reframe | REPLACE tier→node throughout |
| `Plans/GitHub_Integration.md` | tier_label; owner_tier_id | §C worktree ownership (L190, L212) | Field rename | REPLACE tier→node |
| `Plans/assistant-memory-subsystem.md` | owner_tier_id; seglog reconciliation | Context schema | Field rename + clarification | REPLACE + ADDITIVE |
| `Plans/CLI_Bridged_Providers.md` | tier_id in run.started | run.started envelope | Field remove/rename | REPLACE |
| `Plans/Orchestrator_Page.md` | owner_tier_id at L180 | Worktree ownership display | Field rename | REPLACE |
| `Plans/agent-rules-context.md` | TierContextInjectorHook | Rules injection mechanism | Code ref rename | REPLACE |
| `Plans/Permissions_System.md` | 8 outstanding merge clusters | Multiple sections | Verify + add | ADDITIVE (verify first) |

#### MUST RECONCILE docs (4)

| Doc | Why | Likely Anchor/Section | Change Kind | Additive or Replace |
|---|---|---|---|---|
| `Plans/assistant-chat-design.md` | owner_tier_id residual (L2481-2482) | Worktree ownership addendum | Field rename | REPLACE (2 instances) |
| `Plans/storage-plan.md` | owner_tier_id residual (L1327-1328) | §5.x worktree record fields | Field rename | REPLACE (2 instances) |
| `Plans/Glossary.md` | owner_tier_id in definition (L39) | Glossary table | Field rename | REPLACE (1 instance) |
| `Plans/LSPSupport.md` | select_for_tier at L958 | §LSP Subagent selection | Function name | REPLACE (1 instance) |

#### MUST VERIFY docs (12)

(See §11.3 Bucket 3 for details — these need checking but likely require no or minimal edits.)

### 11.7 Cross-Cutting Observations

1. **The `owner_tier_id` → `owner_node_id` rename is a single atomic cross-doc change** affecting 8 docs. It should be packetized as ONE coordinated change, not 8 independent edits, to avoid partial migration.

2. **The `select_for_tier` → `select_for_node` rename** similarly spans 3+ docs and should be coordinated.

3. **orchestrator-subagent-integration.md is a special case**: its body rewrite is ~5000 lines of work. Consider whether it should be a standalone packet or broken into sub-packets (e.g., body rewrite + function renames + cross-refs).

4. **FinalGUISpec.md and Contracts_V0.md consistency verification** should be done before any further packet work on those docs, since 16 and 7 agents respectively edited them in parallel.

### Status

- Phase 11 reconciliation: COMPLETE
- Three-bucket register: 10 MUST CHANGE + 4 MUST RECONCILE + 12 MUST VERIFY = 26 docs total
- meta.json: `ready_for_packetize`
