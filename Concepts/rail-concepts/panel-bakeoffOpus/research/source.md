# SOURCE CONTROL side panel — design brief

Redesign of `Concepts/PMConcept7.html:15239-15494` (256 lines, largest panel). Today: a three-level nest (accordion > `pm6-sp-card` > `pm6-sc-file` row) whose paths truncate, plus a native `<select>` branch switcher. Widths: **240 min / 380 default / 480 max**.

Panel identity is `source_control`; the activity bar must not expose a `Git` icon that opens GitHub Actions, and `Git (GitHub)` is a migration alias only (`Plans/FinalGUISpec.md:L711`, `Plans/GitHub_Integration.md:L86`). Owner boundary: **Source Control owns local repo/worktree; GitHub Actions owns hosted workflow/admin** (`Plans/GitHub_Integration.md:L86-L88`, `Plans/Crosswalk.md:L419-L437`). Worktree lifecycle correctness stays owned by `Plans/WorktreeGitImprovement.md` even when surfaced here (`Plans/Crosswalk.md:L427-L429`).

---

## 1. View inventory — canonical order and expansion defaults

`GI-004` enumerates the views verbatim: `Changes`, `History`, `Graph`, `Worktrees`, `Branches / Stash` (`Plans/GitHub_Integration.md:L344-L395`, prose at `:L90`). `cmd.source_control.select_tab` uses the same enumeration (`Plans/UI_Command_Catalog.md:L566`). **Display order = canonical order.** The current concept's Changes/Worktrees/History/Graph/Branches order is a deviation; promote Worktrees only through the user-controllable *pinned sections* mechanism, never by hard-reordering the canonical list.

`Plans/FinalGUISpec.md:L719-L725` requires progressive-disclosure defaults to **record** `default-open`, `default-collapsed`, pinned sections, remembered expansion state, and simplified-summary vs full-detail mode. Assignments below are the recorded values.

| # | View | Purpose | Default |
|---|---|---|---|
| 1 | **Changes** | staged / unstaged / untracked groups, conflict group, diff preview, staging, commit, sync, incoming/outgoing, active-worktree warnings (`:L90`, `:L154`) | **default-open**, remembered |
| 2 | **History** | commit list, `Open Review Mode` entrypoint, commit→first-parent compare (`:L90`, `Plans/WorktreeGitImprovement.md:L450`) | **default-collapsed** |
| 3 | **Graph** | branch/worktree lineage — *which worktree, run, or branch owns each branch tip*, ahead/behind/diverged badges, compact vs expanded density (`Plans/WorktreeGitImprovement.md:L447`); optional worktree overlay badge (`:L437`) | **default-collapsed** |
| 4 | **Worktrees** | first-class worktree topology rows: ownership, lifecycle, blocked/recovery, safe actions (`Plans/GitHub_Integration.md:L1179`, `Plans/WorktreeGitImprovement.md:L2512`) | **default-open**, remembered, pin-eligible |
| 5 | **Branches / Stash** | branch switch/create, stash list/create/apply/drop (`:L90`, `Plans/UI_Command_Catalog.md:L568-L569`) | **default-collapsed** |

Two structural rules bind the container:
- **Accordion headers are accessible buttons.** `accessible-role: button`, `accessible-label: "{section_name}, {item_count} items, {expanded|collapsed}"`, where `item_count` is the *current filtered* count (`Plans/GitHub_Integration.md:L92`). The concept's `<div class="sc-accordion-header">` fails this outright.
- **Two-level scroll model.** Expanded sections scroll internally under a max-height; the outer accordion scrolls when combined sections exceed the panel (`Plans/GitHub_Integration.md:L160`).

Each view is a list/tree and therefore owes the full keyboard model: Up/Down, Enter to activate, Escape to deselect/back, Home/End, plus type-ahead (`Plans/FinalGUISpec.md:L2133-L2134`). All controls ≥ 24px (`Plans/FinalGUISpec.md:L2146`). History and Graph additionally need `initial_window`, `page_size`, `max_live_rows`, `max_in_memory_rows`, load-older and filter-first rules on monorepos, and Graph needs a list/table equivalent with full keyboard and screen-reader parity — **the graph must never be the only path to the information** (`Plans/FinalGUISpec.md:L721`).

## 2. Ranked feature inventory

**P0 — visible at 240px.** Context header (repo + branch + worktree identity, as a button, not a `<select>`); the multi-active SCM status strip (§5); the five accordion headers with filtered counts; Changes staged/unstaged/conflict counts; one-line file rows with status letter + basename; commit message field + Commit; conflict group when `conflict_file_count > 0`; blocked/ownership banner when the active worktree is blocked or owned elsewhere (`Plans/GitHub_Integration.md:L154`); Worktrees compact rows (glyph, branch, chevron, status + owner label).

**P1 — 380px default.** Sync row (Pull/Push/Fetch) with incoming/outgoing counts; per-row stage/unstage/discard actions; AI commit assist button; Worktrees filter bar `All | Threads | Orchestrator | Manual`; expanded worktree detail (Path, Base, Age) and its action row; History rows with sha + relative time + subject; Branches list; stash entries; compare-target label with its source (`Plans/WorktreeGitImprovement.md:L291` — "the `compare_target` source must always be labeled").

**P2 — overflow, sheet, or 480px only.** Graph rendering (list fallback stays P1); Review-mode compare-target pickers, ignore-whitespace, file filter, collapse-unchanged, generated-file visibility; AI commit-batch suggestions and per-batch accept; sort mode, `hide-stale`, ownership display mode; worktree `lock`/`unlock`/`reuse`/`release`/`focus_lineage`; PR create/merge; the GitHub Actions deep-link mirror strip; receipt lineage drilldown. Dense compares are not a side-panel problem at all — **Review mode may take over the editor area** while remaining a Source Control task mode (`Plans/WorktreeGitImprovement.md:L449-L450`).

## 3. Command list — all 65, grouped by view

All 65 exist in `Plans/Wiring_Matrix.production.json`, under `ui_location` "Source Control surface" (47), "Source Control graph surface" (2), "Source Control history surface" (1), "Source Control > GitHub Actions > *" (13), "Source Control panel > *" (2). Every one carries the identical contract shape: `state_selector = state.commands.<id>.availability`, `disabled_reason_projection = state.commands.<id>.disabled_reason`, `effect_kind: receipt` with a `<id>.dispatch_receipt` ref, no declared `expected_event_types`, and an `accessibility_contract` with `role_or_semantics` / `keyboard_access` / `focus_management` / **`disabled_announcement`** ("surfaces `state.commands.<id>.disabled_reason` to assistive technology when unavailable"). Acceptance checks are uniform per entry: registered in the UICommand dispatcher with typed args/result; projected state selector and disabled reason exposed *before* dispatch; dispatch evidence preserving `command_id`, `origin`, `correlation_id`, handler target, result, receipt/event effect; typed payload/result contract or explicit route/open no-persist disposition; and state-selector + disabled-reason + receipt + regression evidence before production certification.

**Chrome / cross-view (3)**

| Command | Trigger | Preconditions | Flag |
|---|---|---|---|
| `cmd.source_control.select_tab` | accordion header button | `source_control_visible` | view-only, no repo mutation |
| `cmd.source_control.select_worktree` | context header worktree chip | (matrix-only row) | selection |
| `cmd.source_control.toggle_generated_filter` | Changes/Review filter | `source_control_visible` | view-only |

**Changes (12)** — `Plans/UI_Command_Catalog.md:L551-L573`

| Command | Trigger | Preconditions | Flag |
|---|---|---|---|
| `cmd.git.diff_open` | file row | `git_available && compare_target_resolvable` | — |
| `cmd.git.open_diff` | worktree/row compare (alias) | same | — |
| `cmd.git.diff_toggle_mode` | diff header (`side_by_side`\|`unified`) | `diff_view_open` | — |
| `cmd.git.diff_set_compare_target` | compare chip (`head`\|`index`\|`merge_base`\|`branch`\|`commit`\|`parent`) | `git_available && compare_target_resolvable` | — |
| `cmd.git.diff_search` | diff-local search field | `diff_view_open && query_present` | scoped to active compare identity; **not** project Search (`Plans/storage-plan.md:L1882`) |
| `cmd.git.stage_hunks` | hunk gutter / row `+` | `git_available && hunk_ids_selected` | mutating |
| `cmd.git.unstage_hunks` | hunk gutter / row `-` | `git_available && hunk_ids_selected` | mutating |
| `cmd.git.discard_hunks` | row `x` | `git_available && hunk_ids_selected && discard_confirmed` | **DESTRUCTIVE — explicit confirmation** |
| `cmd.source_control.suggest_commit_batches` | composer overflow | `git_available && changes_present` | advisory only |
| `cmd.source_control.suggest_commit_groups` | alias | same | advisory only |
| `cmd.source_control.accept_commit_group` | batch card | `git_available && suggested_commit_group_selected` | not canonical until user commits |
| `cmd.source_control.generate_commit_message` | composer AI button | `git_available && diff_context_available` | advisory |

**Conflict group, inside Changes (5)**

| Command | Trigger | Preconditions | Flag |
|---|---|---|---|
| `cmd.source_control.open_conflict` | `Open Conflict Assistant` on conflict group / blocked worktree card | `git_available && conflict_present` | — |
| `cmd.source_control.open_merge_editor` | conflicted file row | `conflict_file_selected && merge_editor_available` | — |
| `cmd.source_control.resolve_conflict_side` | ours/theirs/base/manual | `conflict_file_selected && resolution_side_selected` | **approval-gated** — "after user confirmation"; must never auto-write a side (`Plans/WorktreeGitImprovement.md:L451`) |
| `cmd.source_control.mark_conflict_resolved` | conflict row | `conflict_file_selected && no_conflict_markers` | validated |
| `cmd.git.conflict_apply_resolution` | hunk-level `ours`\|`theirs`\|`both` | `conflict_file_selected && conflict_id_resolvable` | preserves `conflict_id` evidence |

**Review mode (5)** — `cmd.source_control.open_review` (`git_available && compare_target_resolvable`), `.review.open` (alias), `.review.swap` (`review_mode_open && compare_target_resolvable`), `.review.filter` (`review_mode_open`), `.set_compare_target` (`review_mode_open && compare_target_resolvable`). Entrypoints: `Open Review Mode` on **both** History and Worktrees (`Plans/WorktreeGitImprovement.md:L450`). None destructive.

**History (2)** — `cmd.source_control.history_open_commit` (`git_available && commit_resolvable`), `cmd.git.show_commit` (alias, `ui_location: Source Control history surface`).

**Graph (5)** — `cmd.source_control.graph.focus` (`git_available && graph_object_resolvable`), `.graph.filter` / `.graph.layout` (`source_control_graph_visible`), plus compat aliases `graph_focus` / `graph_filter` that must resolve to the canonical dotted IDs (`Plans/WorktreeGitImprovement.md:L447`). Filter/layout state is project-scoped. None destructive.

**Worktrees (17)** — `Plans/UI_Command_Catalog.md:L708-L725`

| Command | Trigger | Preconditions | Flag |
|---|---|---|---|
| `cmd.git.worktree` | family root | — | — |
| `cmd.git.worktree.list` | section open | `git_available` | includes stale/blocked ownership projection |
| `cmd.git.worktree.select` | row click | `git_available && worktree_row_available` | persists selection + filter per project |
| `cmd.git.worktree.open` | `Open` | `git_available && worktree_selected && worktree_path_resolvable` | — |
| `cmd.git.worktree.open_files` | `Open Files` | same | alias + File Manager focus |
| `cmd.git.worktree.compare` | `Compare` | `git_available && worktree_selected && compare_target_resolvable` | opens Review mode |
| `cmd.git.worktree.create` | `+ New Worktree` | `git_available && !worktree_limit_reached` | mutating |
| `cmd.git.worktree.remove` | `Remove` | `git_available && worktree_selected && worktree_clean && prune_policy_allows && lineage_gate_passed` | **DESTRUCTIVE + confirm** |
| `cmd.git.worktree.prune` | `Prune` | `git_available && worktree_selected && prune_policy_allows && lineage_gate_passed` | **DESTRUCTIVE + confirm** |
| `cmd.git.worktree.request_prune` | `Request prune` | `git_available && worktree_selected` | **approval-gated** alias |
| `cmd.git.worktree.reuse` | `Reuse` | `git_available && worktree_selected && ownership_resolvable && worktree_clean && lineage_gate_passed` | **ownership-changing + confirm** |
| `cmd.git.worktree.recover` | `Recover` | `git_available && worktree_selected` | marks `unknown ownership` if unresolvable |
| `cmd.git.worktree.focus_lineage` | `Lineage` | `git_available && worktree_selected` | non-mutating |
| `cmd.git.worktree.release` | `Release` | `git_available && worktree_selected && ownership_resolvable` | **ownership-changing** |
| `cmd.git.worktree.lock` / `.unlock` | row overflow | `git_available && worktree_selected` / `&& worktree_locked` | — |
| `cmd.git.worktree.switch` | compat | `git_available && worktree_selected` | select + open |

`show-unsafe-actions` expert mode **may reveal disabled choices but must not make them executable** while active-run, blocked, safe-point, or lineage gates fail (`Plans/UI_Command_Catalog.md:L732`, `UCC-055` at `:L4267`).

**Branches / Stash (1)** — `cmd.source_control.stash` (`git_available`) opens the controls; `cmd.source_control.stash.*` is the compatibility family for list/create/apply/drop.

**Pull requests (2)** — `cmd.source_control.pr.create` (`github_auth_valid && github_remote_present`; deterministic disabled state for missing scopes, expired auth, or no GitHub remote) and `cmd.source_control.pr.merge` (`pr_open && merge_allowed && github_auth_valid`; **protected-branch mutation routes the `domain.git_destructive_remote` permission class**) — `Plans/UI_Command_Catalog.md:L8399-L8406`.

**GitHub Actions deep-link mirror (13)** — `cmd.github.actions.{open_run, open_job, open_step_logs, open_run_in_browser, open_related_diff, open_related_worktree, open_current_branch, open_in_github, settings.open, pin, unpin}` plus `cmd.github.connect` / `cmd.github.disconnect`. **Only the `open_*` pivots are legitimate here.** `GI-019` is explicit: "Rerun, cancel, pin, and workflow-admin controls stay in GitHub Actions unless Source Control is mirroring a deep link" (`Plans/GitHub_Integration.md:L1126`, prose `:L150`). See §10.

**Missing IDs.** `Plans/UI_Command_Catalog.md:L527` requires Source Control command coverage for "Git operations `/unstage/discard/diff/commit/push/pull/sync/fetch/branch/stash`", and `Plans/Crosswalk.md:L432` anchors `cmd.git.stage`, `cmd.git.unstage`, `cmd.git.discard` to `GitHub_Integration.md` — but **no canonical command row or wiring entry exists for commit, push, pull, fetch, sync, branch-switch, branch-create, stash-pop, or stash-drop.** The concept already dispatches invented IDs (`cmd.git.switch_branch`, `cmd.git.stash_pop`, `cmd.git.stash_drop`, `cmd.git.pull/push/fetch` at `PMConcept7.html:15256`, `15304-15306`, `15482-15483`). See §10.

## 4. Row anatomy per view

Budget math at 240px: 240 − 16 (panel padding) − 12 (chevron) − 24 (one 24px action target) ≈ **188px of text**, which at 12px proportional is ~30 characters and at 11px mono ~28. At 380px: ~328px ≈ 52 chars. At 480px with a 2-action cluster: ~404px ≈ 65 chars.

**(a) Changed-file rows — Changes.** Worst realistic identity is a monorepo-relative path: `packages/orchestrator-runtime/src/handlers/worktree_recover.rs` = **62 chars**; the concept's own worst is `web/src/lib/RecipeCard.svelte` = **29 chars**, with `src/services/image.rs` = 21. 62 chars does not fit at any width with actions attached. **Two-line row: basename (with status letter) on line 1, dimmed middle-truncated dirname on line 2**, full path in the accessible name. Metadata: status letter, +/− line counts, staged/unstaged/untracked group, generated-file flag, conflict flag. Status vocabulary is the group model in `:L90` — staged / unstaged / untracked, plus conflicted. Required actions: stage, unstage, discard (destructive), open diff. Hunk-level `stage`, `unstage`, `discard`, `apply`, `expand/collapse` are explicit review commands and live in the diff view, not the row (`Plans/WorktreeGitImprovement.md:L452`). Compare-target defaults are deterministic and must not be reinvented per row: unstaged → `index <-> working tree`; staged → `HEAD <-> index`; untracked → `empty <-> working tree`; from history → `selected commit <-> first parent`; conflicted → three-way review with `base`, `ours`, `theirs`, `result` (`Plans/GitHub_Integration.md:L94`).

**(b) Worktree rows — the crux.** Two quotes govern this.

> "The Source Control Worktrees section uses single-column expandable rows in narrow panes. A compact row shows the theme worktree glyph, branch name, expand chevron, and status plus owner label (`Thread: <thread_title>`, `Orch: <tier_label>`, or `Manual`); expanded rows add Path, Base, Age, and actions for Open Files, Compare, Merge, Remove, Create PR, and Open Thread/Open Lane as applicable. The Worktrees filter bar offers `All | Threads | Orchestrator | Manual`, defaults to `All`, persists `worktree_filter` per project, and does not share that filter across projects." — `Plans/GitHub_Integration.md:L160` (`GI-020` at `:L1179`)

> "Worktree rows show owning package, lane, run, lifecycle, and blocked/recovery state while Source Control actions report results back through canonical lane/worktree records." — `W-014`, `Plans/WorktreeGitImprovement.md:L1520`; required row fields enumerated as owning package reference, `lane_id`, `run_id`, `worktree_id`, lifecycle state, blocked/recovery state at `:L190-L201`.

Worst realistic identity strings: path `.worktrees/lane-b-api` = **21 chars**, `.worktrees/lane-d-infra` = 23; branch `orch/lane-b-api` = 15, realistically `orch/pkg-recipe-import/lane-b-api-ingest` = **40**; owner label `Thread: Import worker debugging` = **31**, `Orch: lane-d infra` = 18. Compact row must therefore carry branch (40) + status pill + owner label (31) = ~75 chars of content into a 188px line. **This does not fit at 240px.** The compact row gets glyph + chevron + status pill + branch (middle-truncated at the segment boundary, never the tail); the owner label moves to line 2 of the compact row at ≥ 280px and into expanded detail at 240px. Path never appears compact — it is expanded-only, per `:L160`.

Status vocabulary, all required visible: `dirty`, `conflict`, `orphaned`, `stale` (`Plans/GitHub_Integration.md:L158`), plus lifecycle names which are **reserved words**: `reserved`, `active`, `blocked_preserved`, `released`, `orphaned` (`Plans/WorktreeGitImprovement.md:L297`). Flags `locked`, `prunable`, `dirty`, `repairable` drive action enablement (`:L439`). Lane lifecycle and worktree lifecycle are *related but non-identical* and must both be showable (`:L826`). Legacy `owner run/tier` labels are compatibility only; current rows expose owner run, package, lane (`:L840`).

Required row actions: `/open/recover/prune/lineage` preserved on every row, plus compare — and **recoverable lineage stays visible even when the row points to a historical or orphaned checkout** (`Plans/GitHub_Integration.md:L158`). Orch-owned rows show **`Open Lane`, not `Open Thread`** (`W-006`, `Plans/WorktreeGitImprovement.md:L1105`); the concept gets this right. `W-006` also fixes the compare semantics: row compare opens committed branch-to-branch review through `cmd.git.open_diff` with `compare_origin` set to the base branch ref.

Defaults for noisy projects: collapse stale groups and apply ownership filters (`Plans/WorktreeGitImprovement.md:L437`). If the repo is not git or worktrees are unsupported, **still show repo state with an explicit disabled reason** (same line).

**(c) Commit rows — History.** Identity: `abc12ef` (7) + subject. Worst realistic subject `feat(search): tantivy query endpoint + ranked results` = **53 chars**. Two-line row: sha + relative time + ahead/behind context on line 1, subject clamped to one line on line 2. Metadata: author, run/node linkage when the commit belongs to a known run (graph nodes deep-link to run history and run history focuses a graph node — `Plans/WorktreeGitImprovement.md:L447`). Actions: open commit, set compare target, Open Review Mode.

**(d) Branch rows.** Identity up to 40 chars as above. Metadata: current marker, ahead/behind, owning worktree, upstream. **A branch owned by an active worktree opens read-only** — that is an ownership consequence, not a cosmetic badge. Actions: switch (gated), create, compare.

**(e) Stash rows.** `stash@{0}: WIP image resize ladder` = **34 chars**; two-line (ref + count on line 1, message clamped on line 2). Actions: apply, pop, drop (destructive).

## 5. The multi-active SCM status strip (`W-018`)

`W-018` (`Plans/WorktreeGitImprovement.md:L1749`) makes this a **first-class shared projection**, not a panel-local summary: "`Progress > Current Task` and `Progress > Orchestrator Status` consume the same first-class SCM status strip instead of assistant-chat-local worktree summaries" (`:L295`). Source Control renders the same payload.

Payload fields (`:L295`): `repo_id`, `repo_root`, `worktree_id`, `worktree_path`, compatibility `worktree_id/path`, `worktree_status`, `branch_name`, `base_branch`, `upstream_remote`, `upstream_branch`, `head_commit_oid`, `baseline_commit_oid`, optional `compare_target`, `ahead_count`, `behind_count`, `dirty_file_count`, `conflict_file_count`, `owner_run_id`, `owner_node_id`, compatibility `owner_tier_id`, `owner_attempt_id`, optional `safe_point_id`, `requires_safe_point_restore`, optional `active_git_operation`. `worktree_id/path` and `owner_tier_id` are **compatibility fields over canonical IDs only** (`W-018` compatibility note).

Degradation with >1 active context (`:L293`): the strip shows `primary_active_context` plus **`+N parallel contexts`** where N = `additional_active_context_count`. Primary selection order is fixed: explicit user-selected run/node/attempt → most recently state-changed running attempt → stable fallback. `+N` opens a drilldown listing **every** active worktree with `run_id + node_id + attempt_id`, worktree, branch, status, and a blocked/conflict indicator. Blocked CTA cards are episode-specific and stay tied to their blocked episode; `blocked_preserved` and safe-point-preserved worktrees stay reserved until explicit release.

Hard constraint: "The multi-context Source Control model never assumes a single repo context" (`GI-005` negative constraint, `Plans/GitHub_Integration.md:L397`, prose `:L100`). **This is what kills the native `<select>`** at `PMConcept7.html:15256` — a single flat branch list is exactly the single-repo-context assumption the spec forbids, it cannot express a per-option disabled reason bound to `state.commands.*.disabled_reason`, and it violates the type-ahead/Home/End keyboard model owed to every list (`Plans/FinalGUISpec.md:L2133-L2134`). Replace with a context header **button** opening a repo/worktree/branch picker.

At 240px the strip degrades to: status dot + branch (truncated) + `+N` + dirty/conflict counts as numerals. `+N` is never dropped — losing it silently flattens contexts.

## 6. Blocked / conflict / ownership-locked states

**Reason vocabulary.** Runtime blocked reasons routed to Source Control: `dirty_worktree` and `worktree_conflict`, both of which "route back to Source Control with the correct worktree in scope" (`Plans/WorktreeGitImprovement.md:L824`, `:L439`). Blocked-state copy uses a **`reason-family` translation layer with structured templates and typed placeholders for target identity, missing capability, blocked step, recovery action, and timestamp**; canonical families are **approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked**, and "every explainer derives from canonical reason/state keys instead of ad hoc English" (`W-019`, `Plans/WorktreeGitImprovement.md:L301`). Ordered `allowed_action_ids[]` is canonical; `allowed_actions[]` is compatibility only (`Plans/Crosswalk.md:L474`). The UI must distinguish **`blocked by policy` from `blocked by unresolved lineage`** (`:L439`).

**Reserved copy — verbatim, not synonyms.** "`Rebind`, `Start fresh`, retry, resume, recover, and restore are not interchangeable." Receipt nouns `Receipt`, `History`, `Evidence`, `Log`, `Ledger` are different surfaces; "a receipt row must not become generic History or Evidence by loose copy drift." Glossary terms `Repo`, `Worktree`, `Branch`, `Base branch`, `Compare target`, `Owner`, `Lineage`, `Safe point`, `Restore point`, `Orphaned` are reserved because each has both a Git-native and a Puppet-Master-specific meaning (`Plans/WorktreeGitImprovement.md:L299`). Source Control and Orchestrator wording must keep `safe point` distinct from `restore point` (`Plans/Crosswalk.md:L474`).

**Gates.** Manual prune/remove/reuse is **forbidden while the worktree is `active` or `blocked_preserved`** unless explicit override policy allows it *and records the override* (`Plans/UI_Command_Catalog.md:L730`, `Plans/WorktreeGitImprovement.md:L224`). `strong` actions — anything that discards local state, removes worktrees, revokes accepted state, or materially changes live execution — **show scope, consequence, and confirmation boundaries before execution** (`Plans/GitHub_Integration.md:L156`).

**The disabled-Remove problem.** `PMConcept7.html:15350` explains a disabled Remove only via `title="Owned by run #47 — remove unlocks when the lane releases it"`. That fails three contracts at once: the wiring row for `catalog.git_worktree_remove` requires the control to surface `state.commands.git_worktree_remove.disabled_reason` **to assistive technology** (`disabled_announcement`); `:L439` requires unsafe actions be "disabled with explanation rather than hidden"; and `:L441` requires a blocked worktree row to show **the exact worktree, affected files summary, safe-point relation, and recovery target** from the canonical blocked payload. **Required affordance:** an always-visible, non-hover reason line rendered inside the expanded row — reason-family label + templated sentence + the ordered `allowed_action_ids[]` as real buttons (e.g. `Open Lane`, `Focus lineage`, `Request prune`) — associated to the disabled control by `aria-describedby`. A `title` attribute is not keyboard-reachable, not announced reliably, and cannot carry action buttons. Any "partial lineage" badge must mean the repo/worktree/branch/head or receipt chain is genuinely incomplete, never hidden or synthesized (`:L441`).

**Safe-point retry confirmation** (`GI-007`, `Plans/GitHub_Integration.md:L504`, prose `:L112`): the confirmation names repo, worktree, branch, expected baseline/head, `safe_point_id`, affected-files summary, owner run/node/attempt, and the follow-up action (`restore_safe_point_then_retry`); **declining leaves the blocked episode unchanged.** This is a dialog, not a panel row.

## 7. The commit composer

Needs: multi-line message field (subject + body — `pm:` convention per `Plans/WorktreeGitImprovement.md:L404`), Commit button, AI generate (`cmd.source_control.generate_commit_message`), and access to advisory batching (`cmd.source_control.suggest_commit_batches` → `accept_commit_group`). Batching is **advisory, reviewable, never automatic**; nothing is canonical until the user accepts, and manual staging/commit remains the canonical fallback (`Plans/WorktreeGitImprovement.md:L448`). Amend and sign-off: **not specified anywhere** — see §10. Empty-commit state is a distinct, non-error condition and must not read as a failure (`:L419`).

Survival at 240px: the composer is the one thing that must stay reachable while scrolling changed files. **Dock it to the bottom of the Changes section body, outside the section's internal scroll container**, so the two-level scroll model (`Plans/GitHub_Integration.md:L160`) scrolls the file list *under* a pinned composer. At 240px it collapses to a single-line input + a single primary Commit button, with AI/batch/amend behind one overflow control; the message expands to 3 lines on focus. Draft persistence is guaranteed: `sc_projection.v1:{project_id}` stores "branch, diff state, staged files, and **commit message draft**" (`Plans/storage-plan.md:L1886`), so a collapsed composer never loses text.

## 8. Minimum viable 240px surface

`Plans/FinalGUISpec.md:L2089` is the ruling: at 240px, "all extras behind overflow menu". Ruthlessly:

1. **Context header (1 row, 28px)** — repo/branch/worktree as one truncating button + `+N` chip. Not a `<select>`.
2. **Blocked banner (conditional)** — reason-family sentence + one primary allowed action. Preempts everything below it.
3. **Five accordion headers (28px each)** — name + filtered count + expanded/collapsed state in the accessible label. Only Changes and Worktrees default-open.
4. **Changes body** — group header rows (`STAGED 2` / `UNSTAGED 1` / `CONFLICTS 1`) and two-line file rows: line 1 status letter + basename, line 2 dimmed truncated dirname. **One** inline action per row (stage or unstage, whichever applies); discard and diff move to the row overflow. Conflict rows show `Open Conflict Assistant` as the single action.
5. **Pinned composer** — one-line message + Commit. AI, batching, amend, sign-off in one overflow button.
6. **Worktrees body** — filter bar degraded to **icon-only controls with accessible labels preserved** (explicitly permitted: "below narrow widths, filter controls may degrade to icon-only controls while preserving accessible labels", `Plans/GitHub_Integration.md:L160`); compact rows = glyph + chevron + status pill + truncated branch. Owner label and path are expanded-only. Row actions collapse to a single overflow menu.

Everything else — sync row, incoming/outgoing, remote projection badges, graph, PR buttons, Actions mirror, stash actions, Set-compare-target — goes to overflow. Every overflow item still needs its own `disabled_reason` projection; hiding a command does not exempt it from `/disabled` states explaining "missing git, missing compare target, `stale-target`, absent conflict files, unavailable merge editor, or policy-restricted mutation rather than silently hiding the command" (`Plans/UI_Command_Catalog.md:L581`).

## 9. The 3 hardest layout constraints

**1. Three-level nesting inside a two-level scroll model.** The panel legitimately needs accordion → group → row (Changes) and accordion → row → expanded detail → action row (Worktrees), but the spec allows exactly **two** scroll levels: sections scroll internally under max-height, the outer accordion scrolls when combined sections overflow (`Plans/GitHub_Integration.md:L160`). Any third scroller (the current `pm6-sp-card` wrappers) creates scroll traps and breaks Home/End (`Plans/FinalGUISpec.md:L2133`). Fix: kill the card wrapper; groups become sticky headers *inside* the section's single scroller.

**2. Identity strings exceed the line at every width.** A 62-char monorepo path, a 40-char lane branch, and a 31-char owner label all compete with a 24px action target (`Plans/FinalGUISpec.md:L2146`) in 188px. Truncation cannot be tail-only: `.worktrees/lane-b-api` and `.worktrees/lane-d-infra` differ only in the tail, and `packages/orchestrator-runtime/…/worktree_recover.rs` is unidentifiable without its basename. Middle-truncation at segment boundaries with the full string in the accessible name is the only correct answer, and it must never truncate `worktree_id`-bearing labels into ambiguity — display path "is display/navigation state" and is **never identity authority** (`Plans/WorktreeGitImprovement.md:L238`, `:L287`).

**3. Rows must carry ownership, lifecycle, blocked state, and safe-action enablement simultaneously.** `W-014` demands owning package + lane + run + lifecycle + blocked/recovery on every worktree row (`:L1520`); `GI-020` demands the compact row stay a single column with only glyph/branch/chevron/status/owner (`:L1179`). Those two are in direct tension at 240px. The resolution is that lifecycle and blocked state must be encoded in the **status pill's vocabulary** (`blocked_preserved` and `orphaned` are pill states, not extra chips), with package/lane/run in expanded detail — and the pill state must drive action enablement rather than being decorative.

## 10. Open questions / spec gaps

1. **No canonical command IDs for core git verbs.** `Plans/UI_Command_Catalog.md:L527` mandates coverage for commit/push/pull/sync/fetch/branch/stash; `Plans/Crosswalk.md:L432` anchors `cmd.git.stage` / `unstage` / `discard` to `GitHub_Integration.md`. Neither the catalog tables nor the 65 wiring rows contain them. The concept invents `cmd.git.switch_branch`, `cmd.git.pull/push/fetch`, `cmd.git.stash_pop`, `cmd.git.stash_drop`. **Blocking** — the panel cannot ship a Commit button without a wired command ID.
2. **Section display order not stated.** `GI-004` enumerates the five views but nothing declares render order or which are `default-open`; `Plans/FinalGUISpec.md:L719-L725` only requires the values be *recorded*. §1 records them; needs owner ratification.
3. **`Source Control > GitHub Actions > *` wiring contradicts `GI-019`.** 13 matrix rows sit under that `ui_location`, including `pin`, `unpin`, `settings.open`, `connect`, `disconnect` — which `GI-019` reserves to GitHub Actions "unless Source Control is mirroring a deep link" (`Plans/GitHub_Integration.md:L1126`) and `GI-003` forbids collapsing back (`:L293`). Only `open_*` pivots read as legitimate mirrors. Needs an owner ruling.
4. **Commit amend and sign-off are unspecified.** No plan text covers `--amend`, `Signed-off-by`, co-author trailers, or GPG signing UI, despite hosted governance blockers naming "required signed commits or `/tags` not satisfiable by the current flow" as a distinct blocked reason (`Plans/GitHub_Integration.md:L148`). Governance can block a commit for a signing reason the composer has no control for.
5. **`untracked` has a compare default but no group in the row spec.** `:L94` defines `empty <-> working tree` for untracked files, and `:L90` names untracked as a group, but no status letter or row treatment is specified alongside staged/unstaged.
6. **`Merge` and `Create PR` appear in the `GI-020` row action list but have no worktree-scoped command.** `:L160` requires "Merge" as a row action; the only merge commands are `cmd.source_control.pr.merge` (hosted) and the thread-scoped `cmd.chat.worktree.merge`. Local worktree merge has no canonical ID.
7. **Panel state key collision.** `Plans/storage-plan.md:L1886` names `sc_projection.v1:{project_id}`; `Plans/UI_Command_Catalog.md:L529` names `source_control.project_state.{project_id}`; `SP-071` (`Plans/storage-plan.md:L6390`) adds selected worktree, sort mode, `hide-stale`, ownership display mode, persisted filters and temporary Graph overlay badges without saying which key owns them; and `GI-020` requires `worktree_filter` per project. Three key names, one state set. Also unstated: whether remembered accordion expansion belongs to either.
8. **`W-018` strip has no width contract.** The payload is 23 fields; nothing says what survives at 240px or whether the strip is one row or two.
9. **`Merge` vs `Rebind`/`Start fresh` copy overlap.** `W-019` reserves `Rebind` and `Start fresh` as distinct action nouns (`:L1807`), but no view is assigned to surface them; the worktree row action list in `:L160` does not include either.
