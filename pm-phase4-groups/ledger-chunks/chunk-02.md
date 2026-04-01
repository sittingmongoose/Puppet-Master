## Gaps / Problems Identified

### TIER 1 — SYSTEMIC: Tier→Node migration gaps (affects 8+ docs)
| # | Doc | Detail |
|---|-----|--------|
| 1 | orchestrator-subagent-integration.md | 174 tier-era refs; body still teaches Phase→Task→Subtask→Iteration; addenda have node model but body untouched |
| 2 | Prompt_Pipeline.md | Run envelope embeds `tier` and `mode`; no node/package/lane identity fields |
| 3 | WorktreeGitImprovement.md | 14 `tier_id` references in worktree helper APIs |
| 4 | Tools.md | ~6 tier-era refs ("tier/subagent overrides", "HITL at tier boundary") |
| 5 | newtools.md | ~5 refs (`TierTree::load_test_strategy`, "per-tier overrides") |
| 6 | interview-subagent-integration.md | ~8 refs (`get_subagents_for_tier()`, "orchestrator tier hooks") |
| 7 | chain-wizard-flexibility.md | ~6 refs ("tier worktrees", "per-tier worktree branches") |
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
| 39 | Decision_Policy.md | Governance defaults use old terminology |
| 40 | MiscPlan.md | Cleanup policy still tier-scoped |

### TIER 9 — CONTRACTS / CROSSWALK gaps
| # | Doc | Detail |
|---|-----|--------|
| 41 | Contracts_V0.md | Codex auth still lists OAuthDeviceCode (not ChatGPT-plan model); no surface-specific blocked-state for SC/GHA/Docker |
| 42 | Executor_Protocol.md | TierContext flagged as non-canonical but no named replacement contract |

### TIER 10 — USAGE gaps
| # | Doc | Detail |
|---|-----|--------|
| 43 | ALL docs | `usage_source_kind` vocabulary (5-value enum) absent from ALL Plans docs |
| 44 | usage-feature.md | `effective_auth_mode` missing from canonical UsageRecord |
| 45 | usage-feature.md | Line ~56 still says "Usage tab" instead of "Context Detail Pane" |

### TIER 11 — OTHER gaps
