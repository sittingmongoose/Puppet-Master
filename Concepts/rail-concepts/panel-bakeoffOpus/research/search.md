# Search Side Panel — Design Brief

Column budget: 240px min / 380px default / 480px max (`Plans/FinalGUISpec.md:L551`, `Plans/FinalGUISpec.md:L555`, `Plans/FinalGUISpec.md:L628`, `Plans/FinalGUISpec.md:L968`).
Content width after 8px `MD` padding both sides (`Plans/FinalGUISpec.md:L609`): **224 / 364 / 464px**.

Ownership, verbatim: "Search owns content-search, find-in-files, replace-in-files, and grep-style results" (`Plans/FinalGUISpec.md:L705`). Everything else is somebody else's: command palette owns cross-page fuzzy search (`Plans/FinalGUISpec.md:L705`, `Plans/FinalGUISpec.md:L744-L746`), `FileManager.md §1` owns local structural tree search and type-ahead, `assistant-chat-design.md §10` owns `Chat History Search` / `chatsearch` / `logsearch`, `Tools.md` owns the project-scoped codesearch backend, `LSPSupport.md` owns `Go to symbol` / `Find references` (all `Plans/FinalGUISpec.md:L705`). **This panel must not host a quick-open file picker, a symbol jumper, or a chat-history box.**

---

## 1. Required regions, canonical order

| # | Region | Purpose | Default |
|---|---|---|---|
| 1 | **Header** (24px) | Label `Search`, drag-grip for detach + tooltip "Drag to detach, or double-click to pop out.", overflow menu | always visible (`Plans/FinalGUISpec.md:L820`, `Plans/FinalGUISpec.md:L950`) |
| 2 | **Query block** | Query field; regex / case / whole-word toggles; replace disclosure caret | **open**; the panel's `/open-focus` target is `focus: "query"` (`Plans/FinalGUISpec.md:L697`, `Plans/UI_Command_Catalog.md:L1147`) |
| 3 | **Replace row** | Replacement field + Replace / Replace All | **collapsed**; opened by caret or `Ctrl+Shift+H` (`Plans/FinalGUISpec.md:L791`) |
| 4 | **Scope row** | include / exclude globs, optional path/file scope | **collapsed** below 380px; open at 380px+ (`Plans/FinalGUISpec.md:L697`, `Plans/FinalGUISpec.md:L753`) |
| 5 | **Freshness strip** (one line) | `indexed` / `stale` / `unindexed` / `fallback` + inline rebuild | **open**, single row only — never a card (`Plans/FinalGUISpec.md:L699`) |
| 6 | **Results tree** — the panel | Virtualized file-group headers + match rows | **open**; consumes all remaining height (`Plans/FinalGUISpec.md:L697`) |
| 7 | **Result nav footer** | Prev / Next, match count, Replace / Replace All when replace is armed | open only when a query session exists |
| 8 | **Indexing control surface** | enable/disable index, rebuild/re-anchor, large-file threshold (default 10 MB), generated-file exclusion patterns, follow-symlinks, remote-cache evict | **collapsed** at 380px; overflow/sheet-only at 240px (`Plans/FinalGUISpec.md:L699`) |

**The current build inverts 5 and 6.** `Concepts/PMConcept7.html:15113-15119` spends ~130px on a four-row `Index / Engine / Documents / Last indexed` card plus a full-width Rebuild button *above* the query field. The spec puts build progress in the **status bar**, not the panel: `Building search index - first build may take several minutes`, shown only for work lasting >2s (`Plans/FinalGUISpec.md:L562-L563`). The panel's only freshness obligation is the "subtle `(unindexed)` annotation when a query truly fell back to raw ripgrep" (`Plans/FinalGUISpec.md:L567`). Region 5 is therefore **one line**, and the card dies.

---

## 2. Ranked feature inventory

**P0 — visible at 240px (224px content).** Query field. Regex / case / whole-word toggles (icon-only, 24px targets). Freshness strip. Virtualized results tree. Result count. Prev/Next. Open-result on Enter.

**P1 — appears at 380px.** Replace field + Replace / Replace All inline. Include/exclude scope row expanded. Per-file match counts on group headers. Expand-all / collapse-all. Object/record identity badge on Orchestrator-owned rows (`Plans/FinalGUISpec.md:L703`).

**P2 — overflow menu or sheet only, at any width.** Enable/disable indexing. Rebuild / re-anchor index. Large-file threshold (10 MB). Generated-file index-exclusion patterns. Follow-symlinks toggle. Remote-cache eviction. Index engine/document-count diagnostics. These are settings-shaped; they get a sheet, not panel real estate (`Plans/FinalGUISpec.md:L699`, `Plans/FinalGUISpec.md:L2089` — "all extras behind overflow menu" at 240px).

---

## 3. Full command list

Trigger elements below; every row's `acceptance_checks` in `Plans/Wiring_Matrix.production.json` are the same 5-check production template (dispatcher registration with typed args, projected state selector **and disabled reason before dispatch**, dispatch evidence preserving `command_id`/`origin`/`correlation_id`/handler/result/receipt, typed payload-or-route disposition, and state-selector + disabled-reason + receipt + regression evidence before certification). All 11 sit in `ui_location: "Search surface"`; **all 11 have `preconditions: null` and `disabled_reason: null` in the matrix** — see §10.

| Command | `ui_element_id` | Trigger | Destructive / gated |
|---|---|---|---|
| `cmd.search.show` | `catalog.search_show` | activity bar, `Ctrl+Shift+F`, palette | no |
| `cmd.search.find_in_files` | `catalog.search_find_in_files` | query field Enter (debounced) | no |
| `cmd.search.set_scope` | `catalog.search_set_scope` | scope row commit | no |
| `cmd.search.open_result` | `catalog.search_open_result` | row click / Enter | no — routes via `route_target` + canonical `OpenFile` (`Plans/UI_Command_Catalog.md:L1150`, `Plans/UI_Command_Catalog.md:L1157`) |
| `cmd.search.next_result` | `catalog.search_next_result` | footer Next / `F3` | no |
| `cmd.search.previous_result` | `catalog.search_previous_result` | footer Prev / `Shift+F3` | no |
| `cmd.search.replace_in_files` | `catalog.search_replace_in_files` | replace row commit | **preview/apply flow** (`Plans/UI_Command_Catalog.md:L1149`) |
| `cmd.search.replace_selected` | `catalog.search_replace_selected` | row-hover Replace | **destructive**, single subject (`Plans/UI_Command_Catalog.md:L1151`) |
| `cmd.search.replace_all` | `catalog.search_replace_all` | footer Replace All | **destructive + confirm**; Search owner must validate the current result snapshot and mutation path first (`Plans/UI_Command_Catalog.md:L1152`) |
| `cmd.search.rebuild_index` | `catalog.search_rebuild_index` | overflow > Rebuild index | preserves `/replacement` routing (`Plans/UI_Command_Catalog.md:L1153`) |
| `cmd.search.evict_remote_cache` | `catalog.search_evict_remote_cache` | overflow > Evict remote cache | **confirmed eviction** (`Plans/UI_Command_Catalog.md:L1154`) |

Also canonical in the family, not yet in the wiring matrix (§10): `cmd.search.toggle_regex`, `cmd.search.toggle_case_sensitive`, `cmd.search.toggle_whole_word`, `cmd.search.clear_scope`, `cmd.search.expand_all`, `cmd.search.collapse_all`, `cmd.search.replace_one` (`Plans/FinalGUISpec.md:L752-L753`, `Plans/FinalGUISpec.md:L6994-L7044`).

Keyboard, mandatory on the results tree: Up/Down, Enter to activate, Escape to deselect, Home/End to first/last, plus type-ahead (`Plans/FinalGUISpec.md:L2131-L2134`). Every toggle and row action ≥24px (`Plans/FinalGUISpec.md:L2146`).

---

## 4. Row anatomy

Two row kinds. **File-group header** and **match row**. Do not merge them.

**File-group header.** Identity = repo-relative path. Worst realistic strings:

| String | chars |
|---|---|
| `src/routes/recipes.rs` | 21 |
| `src/services/import.rs` | 22 |
| `web/src/lib/Editor.svelte` | 25 |
| `puppet-master-rs/src/orchestrator/scheduler/safe_point.rs` | 57 |
| `crates/pm-core/src/storage/projection/search_projection.rs` | 58 |

At 224px content, 11px monospace (~6.6px advance) fits **~33 chars**. So 22-char paths fit; 57-char paths do not, ever. **Decision: middle-truncate the directory portion, never the basename.** `crates/…/search_projection.rs`. Basename plus extension is the only reliably identifying token; a right-ellipsis that eats `.rs` is useless. Metadata: match count `(3)`, collapse chevron. Row actions: expand/collapse, Replace-in-this-file (P1+).

**Match row.** Available metadata: line number, column, match context, highlight span, plus — for Orchestrator-owned content — object/record identity and a `/record` route target, which must be exposed rather than a bare text hit (`Plans/FinalGUISpec.md:L703`, `Plans/FinalGUISpec.md:L6524-L6571`). Worst realistic context strings:

| String | chars |
|---|---|
| `// mixed fractions: "1 1/2 cup" must not become quantity 11/2` | 61 |
| `    pub fn normalize_units(quantity: Qty, unit: Unit) -> Result<Qty, ParseError> {` | 82 |

Status vocabulary on rows: `(unindexed)` annotation when the query fell back to raw ripgrep (`Plans/FinalGUISpec.md:L567`); `stale` when served from a stale-but-valid snapshot (`Plans/FinalGUISpec.md:L565`). Row actions: open (default), replace-this-match, copy path:line.

---

## 5. Blocked / disabled / degraded states

Freshness vocabulary is exactly four values — `indexed`, `stale`, `unindexed`, `fallback` (`Plans/FinalGUISpec.md:L699`, `Plans/FinalGUISpec.md:L6511`). Plus indexing-disabled and mid-build cancellation.

| State | Strip copy (one line) | Behavior |
|---|---|---|
| `indexed` | `Indexed` + last-anchor commit | normal; no annotation on rows |
| `stale` | `Stale — refreshing` | results still served; **the UI must not imply Search is fully unindexed** (`Plans/FinalGUISpec.md:L565`) |
| `unindexed` | `Unindexed` | rows carry the subtle `(unindexed)` annotation (`Plans/FinalGUISpec.md:L567`) |
| `fallback` | `Fallback — raw ripgrep` | same annotation; slower, no ranking |
| indexing OFF | `Indexing off — grep only` + Enable | project-scoped; Settings holds global defaults but Search owns the project-scoped control and status copy (`Plans/FinalGUISpec.md:L699`) |
| cancel mid-build | `Index build cancelled` | turning indexing OFF during a build cancels via `CancellationToken`, removes partial generation state; re-enable starts a **fresh** build (`Plans/FinalGUISpec.md:L699`) |

Two negative constraints. **(a)** Remote freshness copy cross-references the `GitHub_Integration.md` SSH file-watcher channel; the regex-index dirty layer and the Tantivy code index subscribe to the *same* channel, so the panel "must not imply duplicate watcher setup" (`Plans/FinalGUISpec.md:L701`, `Plans/FinalGUISpec.md:L6516`). **(b)** Remote search acceleration is not a fallback path and `no-silent-local-fallback` is mandatory — if remote acceleration is unavailable, say so, do not quietly search locally (`Plans/GitHub_Integration.md:L1600`, `Plans/GitHub_Integration.md:L1630-L1631`).

Build progress is **not** a panel state. It belongs to the status bar, >2s threshold, disappearing on completion or cancellation (`Plans/FinalGUISpec.md:L559-L566`).

---

## 6. Rendering a code match in 224px — the decision

The math: 224px content, 11px monospace at ~6.6px/char = **33 characters**. Reserve a 28px line-number gutter and 29 characters remain. A realistic match line is 61-82 characters. **The line is always wider than the panel. Design for that, do not hope otherwise.**

**Decision — single-line, no-wrap, match-centered horizontal window with the line number inline, not in a gutter.**

1. **Row height is fixed at 24px, one text line, `white-space: nowrap`, `overflow: hidden`.** Fixed height is non-negotiable: rows are virtualized (`Plans/FinalGUISpec.md:L697`) and virtualization needs a constant row height. This alone kills the current build, where `Concepts/PMConcept7.html:15153-15161` lets the snippet wrap to 2-3 lines and reflow under a left-gutter line number, destroying alignment.
2. **Kill the left gutter.** A gutter costs 28px of the 224px — 12.5% of the panel — on every row, forever. Instead the line number is the row's leading inline token in dim monospace with a single space: `41 fn parse_quantity(raw…`. It scrolls with nothing because the row does not scroll; it is simply the first thing rendered.
3. **Window the source line around the match, not from column 0.** Trim leading indentation entirely, then take up to 8 characters of context before the match start and fill the remainder after. Prefix with `…` when characters were dropped on the left, suffix with `…` when dropped on the right. So line 58 of `src/services/import.rs` renders as `58 …must not become quantity 11/2` rather than `58 // mixed fractions: "1 1/2…` — which would show zero of the match.
4. **The match highlight is guaranteed visible.** If the match itself exceeds the available characters (long regex hits), truncate the *match* on the right and keep its left edge and highlight styling; never scroll it out.
5. **Full context lives elsewhere.** Hovering shows the untrimmed line in a tooltip; Enter opens the file at path+range through the canonical `OpenFile` flow shared with chat, File Manager, and LSP (`Plans/FinalGUISpec.md:L697`). The panel is an index, not a viewer.
6. **Non-color-dependent.** The highlight is background + weight, not hue alone (`Plans/FinalGUISpec.md:L1237`).

At 364px this yields ~50 characters and at 464px ~66 — the same renderer, a wider window, no layout change.

---

## 8. Minimum viable 240px surface

Header (24px) · query field, full width (28px) · toggle strip: `.*` `Aa` `\b` at 24px each, left-aligned, plus an overflow `…` right-aligned (24px) · freshness strip, one line (16px) · results tree, everything remaining · footer: `7 in 3 files` with prev/next chevrons (24px each).

Total chrome: **116px**. Everything else is results.

Cut at 240px: replace row (reachable via `Ctrl+Shift+H`, which expands it in place and pushes results down), scope row (overflow), per-file counts (kept — 4 chars), expand/collapse-all (overflow), every indexing control (overflow sheet), engine/document diagnostics (deleted outright — they are not in any spec requirement).

---

## 9. Three hardest layout constraints

1. **The match line is 2-3x the panel width and cannot wrap.** Virtualization requires fixed row height (`Plans/FinalGUISpec.md:L697`); fixed row height forbids wrapping; forbidding wrapping means most of the match line is unrenderable. §6 is the whole answer, and it is the single highest-risk decision in the panel.
2. **Six controls compete for one 224px row.** Three flag toggles at 24px minimum (`Plans/FinalGUISpec.md:L2146`) = 72px, plus scope, plus overflow, plus a replace caret = 144px of a 224px row before any label. The native `<select>` at `Concepts/PMConcept7.html:15138-15143` must go — it cannot hit 24px reliably, cannot be styled per theme, and cannot express include/exclude glob pairs, which the spec requires (`Plans/FinalGUISpec.md:L753`). Scope becomes a chip that opens a row, not a dropdown.
3. **A settings-sized control surface has no home.** Enable/disable, rebuild, re-anchor, 10 MB threshold, exclusion patterns, follow-symlinks, remote-cache evict — seven controls Search owns outright (`Plans/FinalGUISpec.md:L699`) — cannot live inline without repeating the current 130px mistake, and cannot move to Settings because Settings only holds global defaults while Search owns the project-scoped control. A sheet is the only resolution.

---

## 10. Open questions / spec gaps

1. **Every Search wiring row has `preconditions: null` and `disabled_reason: null`** across all 11 `"Search surface"` entries in `Plans/Wiring_Matrix.production.json`, while each row's own acceptance check demands it "expose projected state selector **and disabled reason** before dispatch". Nothing tells the panel when to disable Replace All. Compare the Actions family, which carries real preconditions like `actions_panel_visible && selected_run` (`Plans/UI_Command_Catalog.md:L589-L602`).
2. **Seven canonical commands are unwired.** `toggle_regex`, `toggle_case_sensitive`, `toggle_whole_word`, `clear_scope`, `expand_all`, `collapse_all`, `replace_one` are canonical at the shell boundary (`Plans/FinalGUISpec.md:L752-L753`) but absent from both the Search Command Catalog table (`Plans/UI_Command_Catalog.md:L1145-L1154`) and the wiring matrix. Conversely `cmd.search.set_scope` and `cmd.search.previous_result` are wired but absent from the catalog table, and §4.2 spells the latter `cmd.search.prev_result`.
3. **No result-list scaling budget.** `Plans/FinalGUISpec.md:L721` names `initial_window`, `page_size`, `max_live_rows`, `max_in_memory_rows` as things dense surfaces must define — and lists Actions and Docker, but not Search. No document in `Plans/` assigns those four values a number for any surface. Search needs them for virtualization.
4. **No replace-preview surface is specified.** `cmd.search.replace_in_files` "Run replace preview or apply flow" (`Plans/UI_Command_Catalog.md:L1149`) and Search owns "replace preview/confirmation" (`Plans/FinalGUISpec.md:L753`), but nothing says whether the preview is inline in the result tree, a routed diff page, or a modal. At 240px this is decisive.
5. **`(unindexed)` is specified as "subtle" (`Plans/FinalGUISpec.md:L567`) with no rendering rule** — per-row, per-file-group, or once at the top of the result set. Per-row costs ~11 characters of a 33-character budget. Recommend once per result set, in the freshness strip.
6. **Object/record search rows have no row spec.** `F3-047` requires Orchestrator-owned hits to expose "object/record identity and a `/record` route target" (`Plans/FinalGUISpec.md:L6524-L6571`), but no field list, no badge vocabulary, and no statement of how such a row differs visually from a file match at 224px.
7. **Storage split is stated but not reconciled.** Three keys exist — `search_panel_state.v1:{project_id}` (`Plans/FinalGUISpec.md:L2309`), `search_query_state.v1:{project_id}:{query_session_id}` (`Plans/FinalGUISpec.md:L2350`), and `search_projection.v1:{project_id}` (`Plans/storage-plan.md:L1886`) — and the first and third both claim "last query, results, filter state, and scope". Which one restores the panel on reopen is undefined.
