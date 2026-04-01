- Inline subagent card (§14) doesn't cross-reference Persona §27.6 subagent display fields

**chat-advanced** (assistant-chat-design.md L1300-1950): 29 findings (6 HIGH, 13 MED)
- HIGH: BrainStorm Mode (§18) is a 12-line stub — conflicts with canonical mode strip, indistinguishable from Deep Plan + Crew
- HIGH: No truncation priority table — when context window fills, what gets dropped first?
- HIGH: Context lens feature unbuildable — "filter context by lens" with no lens enum, no filter algorithm
- HIGH: Code block rendering has no language detection fallback
- HIGH: Multi-turn edit flow (apply/reject/modify) has acceptance criteria but no state machine
- MED: Search-in-chat references "search panel" but no handoff event between chat search and side-panel search
- MED: Voice input mentioned in §21 but marked "post-MVP" with no clear deferral boundary
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
- Permission key pattern for individual tools never specified (what's the key for `bash`? `edit`? `grep`?)

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
- P1: Model selection priority table has duplicate entries
- P1: No model registration or capabilities catalog — `fast` and `powerful` model roles are unbuildable without knowing what models exist
- P1: `fast`/`powerful` selection criteria undefined — "smallest/cheapest" and "largest/most capable" by what metric?
- P2: No model deprecation/sunset handling
- P2: No token counting abstraction — each provider counts differently
- P2: No model-specific context window limits table
- P2: Lane-aware model binding mentioned in passing but never specified

**decision-policy** (Decision_Policy.md): 15 findings (4 P1, 7 P2)
- P1: Schema ID has 3 naming variants across doc (`decision_record.v1`, `auto_decision.v1`, `governance_decision.v1`)
- P1: `evidence.schema.json` referenced but file doesn't exist and schema undefined
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
- MED: Stream event taxonomy doesn't include `tool_use` / `tool_result` events
- MED: Error stream events have no severity classification

**wizard-core** (chain-wizard-flexibility.md L1-700): 33 findings (5 SEV-1, 18 SEV-2)
- SEV-1: 7 stale tier refs ("tier worktrees", "per-tier worktree branches")
- SEV-1: Empty §15.5 — section header with zero content
- SEV-1: Default stage Personas section empty
- SEV-1: `wizard_status` enum defined 4× in addenda with `blocked` missing from the first/canonical definition (L250)
- SEV-1: `ChainWizardState` type at L160-258 uses `tier_id` fields
- SEV-2: Phase selector output doesn't match interview-subagent-integration input contract
- SEV-2: No wizard cancellation cleanup spec — what resources are released?
- SEV-2: Wizard→orchestrator handoff has no rollback mechanism

**wizard-addenda** (chain-wizard-flexibility.md addenda L1350-2093): 15 findings (1 P0, 4 P1)
- P0: `wizard_status` enum repeated 4× in 6 addenda with `blocked` field name drift (`is_blocked`, `blocked_state`, `blocked_info`, `blocked_episode_ref`)
- P1: Phantom persona IDs in phase-persona mapping — reference personas not defined in Personas.md
- P1: Field name drift between addenda: `wizard_step` vs `current_step` vs `active_phase`
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

