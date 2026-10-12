# C-P01 — Evidence-backed results-grid proposal

**Run:** C-R1-P01-control  
**Scope:** Reusable desktop intake grid for thousands of community-service records, with keyboard editing, selection, validation, and assistive-technology access. This is a design proposal, not an implementation or toolkit selection.

The brief and the exact released plan are addressed below. Source IDs are stable and link to the navigable [source index](sources/index.md); full source identities, access notes, conditions, and review dispositions are in [source-map.json](source-map.json).

## Recommendation

Build the grid around stable record and field identity, with focus, selection, edits, and issues held outside row and cell widgets. Measure a paged semantic grid first as the accessible navigation baseline. Keep a windowed grid as a candidate only if the selected native toolkit and supported assistive-technology combinations prove they can navigate to, reveal, focus, and describe offscreen records reliably. A page size or rendering window is not a cap on the total result set.

Do not treat ARIA counts, platform table patterns, or an accessibility declaration as proof that a particular toolkit and screen reader can find and operate a virtualized row. For a web renderer, partial-DOM counts and logical positions are the required semantic context; they still need interaction tests. For a native renderer, use and test the target OS accessibility APIs. These claims are conditional: the application toolkit and supported OS/AT matrix have not been selected.

## Disposition of every significant released-plan proposal

| Released proposal | Disposition | Final position and reason |
|---|---|---|
| “The provisional design uses a windowed results grid” | **Retain as a candidate; revise the default** | Windowing can bound rendered work for thousands of records. Start with a paged semantic grid as the comparison baseline and keep paging as a fallback unless windowed navigation and recovery pass the target platform matrix. [S02, S07, S10, S15] |
| “with stable record keys” | **Retain** | Use a unique, immutable application record key; use a stable field/column key as well. Never derive identity from a display name, row index, or current sort position. Maintained grid documentation uses unique row IDs to track rows and selection through updates. [S11, S14, S21] |
| “and a single logical focus position independent of the rendered row objects” | **Retain and make explicit** | Store the active location as record ID plus field ID, together with navigation/editor mode. Keep it in controller state even when the cell widget is recycled. Focus is independent from the selected-record set. [S01, S02, S13] |
| “A keyboard controller would move that position, scroll its target into view, and then hand focus to the visible cell” | **Revise** | Resolve the target by stable ID, realize it if the platform provider requires that, explicitly scroll or reveal it where needed, wait until the real target is available, and then transfer focus. Windows UIA’s Realize operation exposes the virtual item’s full properties and patterns but does not promise to bring it into view. If the record has disappeared, route focus to a deliberate recovery control instead of another record. [S01, S07] |
| “Accessibility metadata would describe the complete logical table while the view renders only a small region” | **Revise** | For a partial web DOM, expose accurate full row/column counts and logical positions; use an unknown count only when the count is genuinely unknown. These semantics are necessary, not sufficient. A native adapter must expose the target platform’s grid/table, header, selection, focus, and virtualization behaviors. Verify actual tree contents, navigation, and announcements. [S02, S06–S09] |
| “Editing would happen in an inline cell with a local draft keyed to the record and field” | **Revise while preserving inline editing** | Keep drafts, dirty fields, base record version, and validation outside the cell widget. Widget removal is not a commit or discard. On an external change, retain the draft and present an explicit conflict/reconciliation choice. This is product behavior to implement, not a guarantee made by the cited grids. [S16–S18] |
| “Sorting or filtering could proceed while the draft remains open” | **Revise into a defined transition** | Permit the query change only while preserving the same record/field draft and focus anchor, or move the draft into a discoverable recovery state. If editing changes the active sort/filter key, either defer reordering until explicit commit or preserve the editor through the move; choose after usability testing. Never commit or discard merely because the row projection changes. [S11, S14, S16–S18] |
| “If the record vanishes, the view would move focus to the next visible row” | **Reject as the default** | Automatic adjacency can direct typing or commands to the wrong record. Distinguish a filter exclusion from deletion or conflict. Retain the old focus anchor and move focus to a deliberate status/recovery control when necessary; move to another row only after explicit user navigation. [S01, S07, S16–S18] |
| “and keep the draft in a recovery list” | **Retain and strengthen** | Provide a keyboard-reachable unsaved-edits/issues list with an approved readable record label, changed-field/status information, and a return action. The action re-queries or temporarily reveals the record, mounts the real row once, and focuses the real editor. Restore the previous result view after recovery. [S02, S07–S09, S16] |
| “Validation errors would appear beside the field and in a navigable summary” | **Retain** | Key each issue by record and field; present a textual inline message and a summary entry naming the record, field, and problem. Its keyboard action reveals the correct record, focuses the offending field, and provides a route back to the prior results. An issue remains identifiable while filtered out. [S03–S05] |
| “The draft assumes the recovery list can explain the original record without exposing a detached or duplicate accessibility node” | **Revise; validate** | Do not insert a cloned row/cell into the grid tree. Use a separate recovery action with a stable model ID and owner-approved human-readable label; reveal and focus the one real row/cell. If the record was deleted, show a textual conflict/recovery action instead of a fake row. Inspect the actual tree and speech on every supported platform. [S06–S09] |
| “The initial approach reserves one polite announcement channel for validation and explicit selection changes” | **Revise and retain one channel** | Serialize or coalesce concise, user-relevant outcomes so concurrent updates do not speak over each other. Summarize range/select-all changes; do not announce every cell movement. Avoid repeating in the status channel a message already conveyed by focus. The exact rule requires AT testing. [S01, S03, S05] |
| “and suppresses routine background-update announcements” | **Retain** | Do not announce every changed background row. Announce meaningful outcomes such as result counts, save completion, validation attention, or a record becoming unavailable during an active draft. [S05] |
| “Compare windowing with pagination or other bounded rendering designs, including their consequences for navigation, edit persistence, and result-set orientation” | **Retain and complete** | Compare the alternatives below using the same workload. Keep server query/data loading separate from viewport rendering. Page size and overscan are measured choices, not total-record limits. [S02, S06–S10, S15, S20–S21] |
| “Investigate whether logical row counts and indices are sufficient across relevant implementations rather than treating semantic attributes as proof” | **Answer: no** | WAI-ARIA specifies counts and positions for partial web DOMs, while APG warns that an end-navigation key may stop at the last loaded DOM row. UIA has a virtual-item realization contract, and AG Grid documents a pagination/virtualization tradeoff. None proves behavior in an unspecified application toolkit or AT combination. [S01, S02, S07, S09–S10] |
| Return an explicit disposition for each significant proposal; propose tests for deletion focus, edit-during-sort, error-summary return, and long/missing labels | **Satisfied here** | Every significant clause is classified above. Targeted, unrun tests are specified below. |
| Separate performed checks from checks proposed for the future console | **Satisfied here** | Source review and plan review are recorded separately from proposed implementation, performance, and AT validation. No console, public example interaction, synthetic fixture, or assistive device was tested. |

## State model and behavior

Keep these responsibilities independent of the viewport renderer:

- **Data and query:** canonical record IDs, stable field IDs, sort/filter/query state, result count or unknown-count state, and record revisions. A view index is only a position.
- **Grid controller:** active record/field, navigation or editor mode, requested page/window, and a reveal/scroll request. It maps keys to logical movement; the renderer reports when the real target can receive focus.
- **Selection:** a set of record IDs, separate from the active focus location. Filtering, sorting, paging, and virtualization must not silently retarget selected records. Communicate hidden selection where it matters.
- **Edit coordinator:** draft value, dirty fields, base version, save status, and conflict status keyed by record and field. It outlives cell widgets.
- **Validation and recovery:** issues keyed by record/field, readable messages, next/previous issue, recovery actions, and the prior query state.
- **Renderer/accessibility adapter:** visible widgets and geometry, platform table/grid semantics, focus/selection exposure, logical counts/positions where applicable, and realization/scroll behavior.
- **Persistence:** save, cancel, deleted-record, and external-conflict outcomes. A failed save must leave the draft recoverable; owners must decide how keep, reload, compare, merge, or discard are offered.

| Event | Required behavior |
|---|---|
| Sort moves the active record | Find it by record ID, retain the field and draft, reveal the new position, then focus the real cell. Keep selection keyed by record ID. |
| Filter hides a draft or issue | Preserve draft and issue; add a keyboard-operable recovery entry. Keep the filter/results context available. “Return” reveals the actual record and field without a duplicate grid node. |
| External update changes the record | Compare against the draft’s base version. Retain user text and show a conflict path; do not silently overwrite or discard. |
| External update deletes the record | Mark it unavailable, retain the draft, explain what happened, and focus a deliberate recovery/conflict action rather than an adjacent row. Resolution policy remains an owner decision. |
| Save succeeds or fails validation | On success, clear dirty state and report completion concisely. On failure, retain the draft and issue; preserve edit mode or offer a direct path back. MUI documents these as distinct persistence outcomes, not as a solution for a draft hidden by filtering. [S16] |
| User selects or deselects | Change the ID set and expose selected state distinctly from focus. Summarize bulk changes rather than announce each row. |

## Keyboard and accessible presentation

Provide one predictable tab entry into the interactive grid and managed movement among cells. On the web, APG describes arrow/Home/End/Page navigation, Enter/F2 editor entry, and giving arrow keys back to a text editor while editing. Treat that as a web interaction reference, not a native contract; implement the equivalent expected by the chosen toolkit and its accessibility API. [S01]

Sorting, filtering, editing, save/cancel, selection, error navigation, and recovery must all work without a pointer. Keep focus visibly distinct from selection and expose both states separately. Give sortable headers keyboard access and the current sort state. Use row/column headers and meaningful accessible names. Long visual truncation must not truncate the accessible name; missing values need explicit text; duplicate-looking names need an owner-approved secondary label. Never expose an internal ID as the only readable record name. Do not use color alone for focus, selection, or errors.

For partial web rendering, counts and indexes describe the current logical grid represented to the user, including the filtered result set; they must not be the viewport’s mounted row count. Use the actual count or an unknown count when appropriate. Page controls should identify current page and result range/count without implying that the page is the whole dataset. Native implementations need equivalent platform behavior and measured tree/speech results. [S02, S06–S09]

## Rendering alternatives

| Approach | Benefits | Risks and required checks | Proposed role |
|---|---|---|---|
| Paged semantic grid/table | Bounded tree; every row on the current page can be exposed in order; clear result orientation | More page transitions; preserve selection, focus, drafts, and issue navigation by stable ID; query and sort must cover all results | First baseline and fallback. Tune page size; do not cap the full dataset. |
| Windowed rows and columns | Continuous navigation with bounded rendering; useful for large lists or many columns | Offscreen discovery, last-row commands, row headers, overscan, realization, rapid scrolling, focus restoration, and AT behavior vary by implementation | Keep as candidate only after platform validation. |
| Headless row model plus separate virtualizer | Separates query/row modeling from scroll measurement and rendering | Application owns focus, keyboard, semantics, editor, selection, and issue integration. Client virtualization does not perform server-side query work. | Architecture option if a native control is unsuitable; TanStack is a React reference, not a native component choice. [S20] |
| Render every record | Simple tree for genuinely small datasets | Rendering and memory can become costly for thousands | Consider only within a measured page/window, not as the only large-result mode. |
| Server-side query/pagination plus client window | Allows a dataset too large to load on the client and independently bounds the viewport | Must preserve true or explicitly unknown counts, query-wide sort/filter, stable identity, selection, and issue retrieval | Compatible data layer for either paged or windowed presentation. |

AG Grid’s current guidance recommends pagination to keep all elements for the rendered rows available to screen readers; disabling virtualization for scrolling raises memory use and should be measured. MUI X documents virtualization limits and overscan details specific to its v8 implementation. TanStack’s mutable latest guide separates its row model from a virtualizer and says client virtualization does not replace server-side operations. These are implementation references, not recommendations to adopt those web libraries in an unspecified desktop toolkit. [S10, S15, S20]

## Implementation boundaries and owner decisions

Keep query/data, controller focus, selection, edit/conflict state, validation/recovery, renderer/accessibility, and persistence as separate responsibilities. The renderer owns cell widgets, geometry, and platform-tree mapping; it does not own the only copy of edits or validation state. Validation owns rules and messages; the grid supplies keyboard routes to issues.

Before acceptance, owners need to choose: supported OS and toolkit; screen-reader/AT combinations and conformance obligations; a stable data-backed record key and approved disambiguating fields; whether selection is independent multi-select/range selection; save and conflict resolution policy; whether queries are client-side or server-side; whether the result count is known; representative row/column scale and latency/memory budgets; and whether paging or continuous scroll is the default.

## Disposition of the independent critique

I accept the critic’s findings that the draft has no material wrong claim, omission, or unsupported library guarantee against the brief and released plan. The final preserves all major proposals as conditional product behavior where the sources do not guarantee them. I accept the mutable-version caveat for S20 and record that the reviser saw a v9 Latest guide at its mutable URL; no release is implied. I retain uncertainty for S08 and S21 because neither page yielded usable content. S21 is not the sole basis for stable identity; the grid examples in S11 and S14 also document unique row IDs. The unresolved toolkit, platform/AT matrix, identity fields, query behavior, scale, and conflict decisions remain owner inputs.

## Failure history and evidence limits

MUI issue #8119 records filter-input focus loss after rows arrived; the maintainer attributed it to a placeholder filter item whose ID changed on rerender. PR #8603 merged a stable-ID fix. This supports testing identity of focus-bearing transient UI; it does not establish a current general MUI defect or prove edit persistence through filtering. [S17, S18]

MUI issue #4124 is a historical report about sortable-header discoverability/announcements in one JAWS/Windows/browser combination. It is a targeted test risk, not a claim about current cross-platform behavior. [S19]

Apple’s NSAccessibilityTable page did not yield usable content to either reviewer; its inherited record is retained but not independently verified here. TanStack’s versioned v8 row-selection page returned an internal retrieval error to both reviewers; its inherited claim is not used as sole support. Stable row-ID behavior is independently documented by AG Grid and MUI. The current TanStack virtualization URL is mutable; the browser showed a v9 latest guide during this review, so no fixed release is claimed. The source map preserves these limits and all original source IDs without rebinding.

## Validation plan — proposed, not run

1. **Keyboard-only path:** enter the grid, move among cells and headers, sort/filter, edit, save/cancel, select/deselect, change page/window, reach an issue, recover a hidden draft, and return to results. Every action must work without a pointer; verify focus and selection remain visually and programmatically distinct.
2. **Focus after filter and deletion:** create a dirty draft and then hide its record with a filter; expect retained text, a reachable recovery entry, and correct restoration. Repeat with a true external deletion; expect a distinct unavailable/conflict message and no silent move to the next row.
3. **Editing during sort:** edit a row and sort on a different column; verify the same record/field owns focus and draft after reorder. Repeat when editing the sort key and when an external update arrives; verify the chosen defer-or-preserve policy and selection persistence.
4. **Error-summary return:** create issues on multiple records, filter one out, reach its summary entry by keyboard, activate it, and verify correct record/field reveal, message, focus, preserved draft, next/previous issue, and return to the prior query.
5. **Long, missing, duplicate-looking labels:** inspect visual and accessible names for truncation, empty fields, and duplicate names. Verify full useful text, explicit missing-value wording, and approved disambiguation without reliance on row position or color.
6. **Virtualized accessibility:** inspect the accessibility tree at top, middle, and end; test arrows, Page Up/Down, Home/End, offscreen retrieval, row/column headers, and focus after recycle/update/high-speed scrolling. Compare paged and windowed modes on the same data. Check actual UIA VirtualizedItem/Realize and scroll behavior on Windows if supported; choose native AppKit/VoiceOver and AT-SPI/Orca checks if those platforms are supported. A platform API’s existence is not a pass result.
7. **Performance:** on minimum supported hardware, measure query time, key-response latency, scroll latency, and memory at representative and stress-scale row/column counts, long labels, variable row heights, and accessibility tooling enabled. Choose page size and overscan from those results; retain support for large total result sets.

**Actually performed:** reviewed the assigned brief, frozen discovery, investigator draft/source map, released plan and release record, independent critique/source map, and linked source index. Reopened primary-source pages as described in the source map. No application code, public example interaction, synthetic fixture, benchmark, accessibility-tree inspection, screen-reader run, or physical device test was performed. The validation items above are proposals only.
