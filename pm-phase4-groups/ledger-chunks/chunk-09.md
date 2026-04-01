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
- orchestrator-subagent-integration.md body/addenda split-brain is the single largest remediation task — 424+ stale tier refs in body, addenda use entirely different execution model
- Tier→Node migration touches 8+ docs systemically — cannot be done doc-by-doc without coordination
- `usage_source_kind` 5-value enum appears in NO Plans doc — completely orphaned vocabulary
- Sensitivity-aware forwarding (part 7 of runtime contract) has zero coverage anywhere
- Terminal has no single SSOT — split across FinalGUISpec §5.1, FileManager §9A, storage-plan (7 keys)
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
- `wizard_status` is defined 5 times in chain-wizard-flexibility.md — first definition at L250 is missing `blocked`
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
