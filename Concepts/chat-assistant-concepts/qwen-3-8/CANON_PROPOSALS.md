# CANON_PROPOSALS — prepared, NOT applied

**Status: NOT APPLIED.** This isolated concept workspace is contractually forbidden to edit `Plans/**`, the UI Command Catalog, the Wiring Matrix, schemas, DRY Method contracts, `Concepts/PMConcept7.html`, or the parallel Usage-page redesign (see the handoff's isolation rules and `AGENTS.md`). The items below are the concrete fixes that *would* resolve the record-only gaps in `SPEC_GAPS.md`, drafted so they can be applied verbatim in a future governance / canon phase. Nothing here was written into canon; the prototype only *demonstrates intent* for these (typed `uncataloged` command events, faithful stubs, fidelity rendering). Each proposal cites its source gap and the PlanUnit / command evidence from `Plans/.plan_index`.

---

## Command Catalog additions (`Plans/UI_Command_Catalog.md`)

Propose new typed UICommand IDs (namespace + intent; wire fail-closed per `UI_Wiring_Rules` Rules 1–2). Producers/consumers are suggestions consistent with the verified PlanUnits.

| Proposed ID | Intent | Producer | Consumer / owner | Source gap |
|---|---|---|---|---|
| `cmd.questionnaire.answer` | record an answer to one question | chat questionnaire card | question runtime / chat store | GAP-001 (ACD-027..031) |
| `cmd.questionnaire.navigate` | move prev/next within a questionnaire | chat questionnaire card | chat store | GAP-001 |
| `cmd.questionnaire.skip` | skip the current question | chat questionnaire card | chat store | GAP-001 |
| `cmd.questionnaire.submit` | submit the active questionnaire | chat questionnaire card | question runtime | GAP-001 |
| `cmd.questionnaire.cancel` | cancel the whole questionnaire | chat questionnaire card | question runtime | GAP-001 |
| `cmd.chat.thread.duplicate` | duplicate a thread | chat kebab | thread lifecycle (ACD-074) | GAP-002 |
| `cmd.chat.thread.rename` | rename a thread (title edit) | chat title editor | thread lifecycle (ACD-074) | GAP-002 |
| `cmd.composer.draft.restore` | restore a draft revision | composer draft-history popup | composer state (SP-106) | GAP-007 |
| `cmd.composer.draft.discard` | clear the current draft | composer | composer state (SP-106) | GAP-007 |
| `cmd.chat.message.expand` / `cmd.chat.message.collapse` | toggle a long message | message collapse control | chat view state (ACD-241) | GAP-008 |
| `cmd.chat.context_lens.set_mode` | set Mute/Focus/Subcompact/Off | lens control | lens state (ACD-192..195) | GAP-009 |
| `cmd.chat.context_lens.select` | toggle a message in the lens selection | message lens toggle | lens state | GAP-009 |
| `cmd.chat.context_lens.apply` | apply a Subcompact selection (≤25) | lens apply | lens state | GAP-009 |
| `cmd.goal.view` / `edit` / `pause` / `resume` / `stop` / `clear` | goal actions from the chat goal card | chat goal card | Goal Runtime events (GRS-005/006/007) — must NOT duplicate scheduler truth | GAP-009 / GRS |
| `cmd.goal.show_tasks` / `show_subgoals` / `show_evidence` | reveal goal facets | chat goal card | chat view state | GAP-009 |
| `cmd.editor.open_artifact` | open an artifact in an editor tab | artifact card | FileManager (F-024) | GAP-014 |
| `cmd.browser.open_session` | open a browser session in an editor tab | browser card | Section15 (SMPFS) | GAP-014 |

Note: the canonical thread-lifecycle set in ACD-074 (`commit_first_message`, `discard_empty_draft`, `suspend`, `restore`, `archive`, `unarchive`, `delete`) should be confirmed as the single namespace; the `cmd.chat.*` vs `cmd.chat.thread.*` split (GAP-002) should be collapsed to `cmd.chat.thread.*`.

## Wiring Matrix rows (`Plans/Wiring_Matrix.md`)

Add producer→consumer rows for every ID above, each marked fail-closed. Priority rows currently absent: the questionnaire family (no wiring today), the context-lens selection/apply rows, and the goal-card → Goal-Runtime-event rows (these must route to GRS events, with a guard that the chat projection never becomes executor truth per GRS-002).

## Canon-text / PlanUnit edits (`Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`)

- **GAP-005 (retire left accent bars):** in ACD-444 and F3-469, replace the selected/active thread-row "colored left-side accent border" treatment with "tinted fill + hairline ring + bolder title"; mark the old treatment text as retired (this enacts the 02 §5 supersession that the prototype already follows).
- **GAP-003 (Context Ring detail):** add a cross-reference in ACD-441 and F3-418 stating the Context Detail destination and usage-record presentation are owned by the parallel Usage redesign; the chat surface renders only the 15 px ring entry point.
- **GAP-010 (tool_calls vs operation_card):** add a clarifying paragraph across ACD-072 and ACD-101 distinguishing message-embedded `tool_calls[]`, the inline `operation_card` activity family, and the separate `subagent_card` / `blocked_notice` types, with their rendering boundaries.
- **GAP-013 (subagent card anatomy):** add an ACD PlanUnit specifying the chat-side subagent card anatomy (fields → layout, collapsed counts, expanded rows, full-detail destination), cross-referencing the OSI registry.
- **GAP-017 (composition seam):** add a FinalGUISpec PlanUnit for the window-chrome vs thread-transcript composition seam — one thread state source, named chrome sockets, docked/pop-out equivalence — so the 8×8 concept mapping has a canon anchor (partially prefigured by F3-420 / F3-131).

## Governance / fixture proposals

- **GAP-015 (GUI acceptance fixtures):** propose a visual-regression fixture set keyed to PlanUnits as a governance artifact; this workspace's matrix (`verification/`) and contact sheets can seed it.
- **GAP-016 (lineage note):** propose adding `Concepts/chat-assistant-concepts/*` to the `UI_Wiring_Rules` §0.1 concept-lineage note as lineage-only entries (explicitly not owners), per UIW-005.

## Data proposal (no canon change)

- **GAP-018:** recommend normalizing the appended older-history block timestamps in the canonical demo data so `sentAt` is monotonic across the splice seam at `t09-m0021`. The prototype renders the inversion as-is for fidelity.

---

The remaining `SPEC_GAPS.md` rows (GAP-004/006/011 applied supersessions; GAP-019/020/022 data; GAP-021 prototype metric) are already enacted in the prototype and need no canon proposal beyond the notes above.

## Revision-2 pass proposals (GAP-023 … GAP-031)

- **GAP-023 (access axis):** add `cmd.access.set` with payload `{profile, scope: thread|session}` to the UI Command Catalog; add an "Assistant access profiles" entry to the Settings inventory listing the four profiles, their effect limits per mode, and the "Full Access never bypasses FileSafe/org deny/sandbox" invariant.
- **GAP-024 (approvals):** add a `cmd.approval.{resolve}` family plus a DRY Method contract for the compact approval card (one question, one scope line, immediate actions, Details disclosure; Details carries exact commands/files/domains/persistence/safer-alternative).
- **GAP-025 (pinned governor):** canonize the geometry contract: pinned history is a sibling region; states closed/transient/pinned-compact/pinned-full; demotion order dashboard → history form → (never) chat width; chat readability floor 520 px; pinned surfaces never overlay transcript/composer/scrollbars.
- **GAP-026 (artifact workspace):** add a FileManager/ACD PlanUnit for the left artifact workspace: state machine loading/ready/update/error+retry/switch/close; coexistence rule with pinned history (both full ≥975 px stage budget; history demotes first below); artifact links may originate from messages, activity, diffs, goals, results.
- **GAP-027 (renderer registry):** specify questionnaire semantics (oldest-first queue, one visible, Skip-one vs Cancel-whole, required gating, durable receipt) as state contract, and declare presentation concept-scoped (renderer registry), forbidding a single shared visual renderer in canon mocks.
- **GAP-028 (rewind/branch):** catalog `cmd.chat.rewind {restore_point}`, `cmd.chat.thread.branch {source_thread, message_id, model?}`, `cmd.chat.turn.redirect {text}`; note rewind hides later messages from active context without erasing usage; branch preserves source and ancestry with independent future settings.
- **GAP-029 (spellcheck):** add Settings inventory entries for personal/project spelling dictionaries and a thread-overflow disable; add a DRY contract for a Slint-portable passive spellcheck service (underline + suggestion menu; skip code/paths/URLs/identifiers/known names; never autocorrect).
- **GAP-030 (model catalog):** adopt the provider → accounts → models catalog shape (capability-driven Fast, per-account disabled reasons, requested-vs-effective route, favorites/recents) as the settings-redesign data contract; CLI-owned OAuth profiles (Claude CLI, Antigravity CLI) must not appear as PM-direct connections.
- **GAP-031 (trigger lineage):** add to UI_Wiring_Rules §0.1 that `pm-trigger` / `__pmDemoTrigger` are concept-harness vocabulary, explicitly non-production, with no catalog IDs.
