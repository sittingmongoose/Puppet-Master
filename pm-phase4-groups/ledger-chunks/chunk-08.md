
| Contract Area | Defined In (multiple) | Canonical Owner | Action |
|--------------|----------------------|-----------------|--------|
| Scored ready-set model | orch addenda L6784 + EP L176-229 | Executor_Protocol.md | Orch should reference, not redefine |
| Runtime fields list | orch L6841 (16 fields) + orch L6927 (10 fields) + EP L116-131 | Executor_Protocol.md | Union into EP; orch references |
| Wake causes | orch L6825 (9 values) + EP L481-493 (13 values) | Executor_Protocol.md | Delete orch list, reference EP |
| Retry/backoff matrix | orch L6879 + EP L258-274 | Executor_Protocol.md | Move durations to EP or shared config |
| Remediation flow | orch L6858 (7-step) + EP L386-393 + Contracts_V0 L880-912 | EP for model, Contracts_V0 for events | Orch should reference both |
| `remediation.resolved` enum | Contracts_V0 03-08 addendum + 03-09 addendum | Contracts_V0.md (NEEDS RECONCILIATION) | Pick one enum, delete other |
| `blocked_reason_code` enum | Contracts_V0 L1046 + orch addenda (adds 2 values) | Contracts_V0.md | Add `worktree_conflict`, `dirty_worktree` to canonical enum |
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
| LSPSupport.md | §3.5 root discovery table | Promised but only abstract prose |
| newtools.md | §8.1-8.3 | TOC entries, no content |
| chain-wizard-flexibility.md | §15.5 | Header with zero content |
| chain-wizard-flexibility.md | Default stage Personas | Header with zero content |
| orchestrator-subagent-integration.md | Tier-specific Persona defaults (L6683) | Header with zero content |
| Models_System.md | §10.4.2 | Header with zero content |
| storage-plan.md | §5.1 Unsaved editor recovery | Stub — zero implementation spec |
| storage-plan.md | §5.2 Requested/effective state | Stub — zero implementation spec |
| storage-plan.md | §5.3 Search/SC projection | Stub — zero implementation spec |
| storage-plan.md | §5.4 LSP persistence | Stub — zero implementation spec |
| Crosswalk.md | §3.6 content | Heading exists, empty/orphaned |
| Crosswalk.md | §3.8-3.12 | 5 numbered sections absent |
| Decision_Policy.md | evidence.schema.json | Referenced, file doesn't exist |

### Stale Terminology Hotspots

| Doc | Approx Count | Stale Terms |
|-----|-------------|-------------|
| orchestrator-subagent-integration.md (body) | 424+ | tier, Phase, Task, Subtask, Iteration, TierNode, TierType, TierContext, select_for_tier() |
| orchestrator-subagent-integration.md (QA loop L6272-6660) | 50+ | Three-Tier QA, Tier 1/2/3, TierNode, TierType |
| FinalGUISpec.md | 15+ | tiers.slint, "Tiers" tab, TierTree, tier display, phase/task/subtask/iteration tiers, owner_tier_id |
| WorktreeGitImprovement.md | 14 | tier_id throughout helper APIs |
| interview-subagent-integration.md | 8+ | get_subagents_for_tier(), orchestrator tier hooks |
| Prompt_Pipeline.md | 6+ | tier in run envelope, tier/mode |
| chain-wizard-flexibility.md | 6+ | tier worktrees, per-tier worktree branches, ChainWizardState tier_id |
| newtools.md | 5+ | TierTree::load_test_strategy, per-tier overrides |
| Tools.md | 6+ | tier/subagent overrides, HITL at tier boundary |
| human-in-the-loop.md | 4+ | tier boundaries, tier-level gates |
| Progression_Gates.md | 10+ | tier_status, tier-level gates throughout |
| Decision_Policy.md | 3+ | old terminology in governance defaults |
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
