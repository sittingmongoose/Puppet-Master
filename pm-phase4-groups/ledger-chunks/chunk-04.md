
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
- Add `worktree_conflict` and `dirty_worktree` to Contracts_V0 `blocked_reason_code` enum
- Add `node.prerequisite_resolved` to Executor_Protocol canonical wake list OR replace references with existing event
- Union runtime fields lists from orch L6841 and L6927 into Executor_Protocol dispatch context schema
- Move backoff durations to Executor_Protocol or shared config contract
- Resolve Provider_OpenCode 9-state vs Contracts_V0 5-state lifecycle
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
- Consolidate 5 wizard_status definitions into 1 (add `blocked` to L250 canonical)
- Normalize field names (`wizard_step` vs `current_step` vs `active_phase`)
- Normalize blocked-state fields (`is_blocked` vs `blocked_state` vs `blocked_info` vs `blocked_episode_ref`)
- Fix `needs_user_clarification[]` conflation with `unresolved_findings[]` at L1316
- Assign Contract Unification Pass ownership
- Add wizard cancellation cleanup spec
- Fill phantom §15.5 and Default stage Personas sections

### Strategy O — LSP cleanup (NEW from deep re-audit)
- Either create §5.1 "Chat LSP" section or remove 12 references to it
- Write §3.5 root discovery table (per-language root detection rules)
- Specify SSH transport protocol details
- Add LSP server lifecycle state machine

## Impacted Docs
Docs requiring remediation (35+ total, consolidated across all phases including deep re-audit):

**CRITICAL (blocker-level gaps, multiple systemic issues, contract conflicts):**
- `Plans/orchestrator-subagent-integration.md` — 424+ tier refs, body/addenda split-brain, 390-line dead QA loop, 4 verbatim-duplicate addenda, parallel remediation universe, empty Persona defaults section; ~195 combined findings across 5 agents
- `Plans/Contracts_V0.md` — `remediation.resolved` enum irreconcilable (zero overlap), `blocked_reason_code` missing 2 values used in orch, `allowed_action_id` stale in chat, §1.1 duplicate numbering, attempt events no producer; ~38 findings across 2 agents
- `Plans/storage-plan.md` — seglog wire format undefined, `attempt_record` key conflict, `blocked_projection` 3-way conflict, counter semantics conflict, §5.1-5.4 ALL STUBS, 4 overlapping reconciliation addenda; ~58 findings across 2 agents
- `Plans/Tools.md` — §3.5 per-tool contracts EMPTY, §3.6 task tool EMPTY, §3.5A skill tool EMPTY, Plan mode self-defeating; ~47 findings across 2 agents
- `Plans/FinalGUISpec.md` — §8/§9/§10 completely missing, duplicate §17, 6 overlapping blocked/recovery addenda, §15.1 missing 30+ redb keys, Docker Manage naming, stale terminology throughout; ~67 findings across 3 agents
- `Plans/assistant-chat-design.md` — §6/§7 phantom, `debug` missing from overlay enum, 4 overlapping blocked-state addenda, no message taxonomy, stale recovery actions, investigation context field divergence; ~94 findings across 4 agents
- `Plans/Permissions_System.md` — two incompatible algorithms (§2.4 vs §8), permission snapshot DRY violation, missing security section, TOML/JSON conflict, no durable approvals; ~36 findings across 2 agents

**HIGH (significant gaps, stale terminology, incomplete contracts):**
- `Plans/Executor_Protocol.md` — TierContext unnamed replacement, counter semantics conflict, `node.prerequisite_resolved` orphaned; ~34 findings across 2 agents
- `Plans/interview-subagent-integration.md` — slash-command contamination, persona field name crisis, stale tier hooks, duplicate EOF section; ~110 findings across 3 agents
- `Plans/chain-wizard-flexibility.md` — `wizard_status` 5× duplicate, empty §15.5/Default Personas, stale tier refs, `needs_user_clarification` conflation; ~63 findings across 3 agents
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
- `Plans/FileSafe.md` — recovery_options contradiction, field name drift (safe_point_id/snapshot_id/checkpoint_id), action ID missing from catalog; ~74 findings across 3 agents
- `Plans/Glossary.md` — 3M (21 terms), `owner_tier_id` diverges from storage-plan canonical fields
- `Plans/feature-list.md` — 3M + 2S (canon-collapsed)
- `Plans/usage-feature.md` — missing enum + field + wrong label
- `Plans/UI_Command_Catalog.md` — 5 missing command families + 2M + 3P from intents

**MEDIUM:**
- `Plans/newtools.md` — 5 tier refs, phantom §8.1-8.3, browser chip schema undefined; ~43 findings across 2 agents
- `Plans/Decision_Policy.md` — schema ID 3 variants, evidence.schema.json missing, recovery matrix incomplete; 15 findings
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
