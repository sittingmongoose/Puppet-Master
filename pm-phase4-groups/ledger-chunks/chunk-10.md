### Method
- 942 intents with full content_markdown extracted from 59 pipeline runs
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
- Subagent/crew event catalog — 1 run (r-20260323-192127-01). 21 subagent.* events, crew.* family, chat.subagent_* projection events. NEVER WRITTEN.

#### 4. Prompt_Pipeline.md — 1 unique MISSING anchor (MOST ATTEMPTED)
- `### 6.5 Effective resolution record` — **7 intents across 4 run-dates** targeted this anchor. Frozen requested/effective runtime identity snapshot, audit trail record. NEVER CREATED. Sonnet classified as SUPERSEDED (renumbered to §6.4) but content not present at §6.4 either.

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


### Phase 4 Collection Status (FINAL -- 92/100 collected, 8 GPT52/Sonnet stragglers)

**All 5 model families collected or nearly so:**
- **Opus 4.6:** 20/20 DONE
- **Sonnet 4.6:** 17/20 (g04, g17, g19 still running)
- **GPT 5.2:** 15/20 (g02, g05, g14, g15, g18 still running -- slowest model)
- **GPT 5.3 Codex:** 20/20 DONE
- **GPT 5.4:** 20/20 DONE

### Cross-Model Agreement Matrix

All 5 models converge on the same core MISSING set. No new MISSING anchors found since agent 70. The 8 remaining agents (covering groups already verified by 3-4 other models) will not change the picture.

| Item | Opus | Sonnet | GPT52 | GPT53 | GPT54 | Final Verdict |
|------|------|--------|-------|-------|-------|---------------|
| FinalGUISpec 7.4 Settings (Unified) | MISSING | MISSING | -- | MISSING | MISSING | **MISSING** |
| FinalGUISpec 7.16 Chat Panel (NEW) | MISSING | MISSING | -- | PARTIAL | PARTIAL | **MISSING** (heading never created) |
| FinalGUISpec 7.8 Usage (NEW) | MISSING | PARTIAL | -- | PARTIAL | PARTIAL | **PARTIAL** (some at 7.12) |
| Prompt_Pipeline 6.5 Effective resolution record | MISSING | SUPERSEDED | MISSING(0pct) | MISSING | MISSING | **MISSING** (6.4 has different content) |
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
