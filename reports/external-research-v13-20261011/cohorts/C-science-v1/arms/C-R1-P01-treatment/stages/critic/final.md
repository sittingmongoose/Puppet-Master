# C-P01 — Final evidence-backed proposal

Run: C-R1-P01-treatment. Stage: critic/finalizer.

## Recommendation

Adopt a shared state, keyboard, and recovery contract before choosing a grid renderer. Evaluate a semantic paginated table and a row-windowed grid, including at least one maintained packaged grid, against the same realistic records and supported assistive-technology matrix. The evidence does not identify a universal winner: AG Grid 36.2 recommends pagination to expose all rows on the current page to screen readers, while MUI X v8.29.3 warns that disabling virtualization can sharply reduce performance [S04, S21, S22]. Those are vendor-specific constraints to measure against this product’s responsive large-result goal.

Treat the component as a view over an ID-keyed record model. Keep record identity, current filtered/sorted order, keyboard focus, selection, edit drafts, and validation/conflict state separate. No visible name or current row number may serve as durable identity. Do not select a grid, toolkit, accessibility API, or compatibility claim before target platforms and thresholds are known.

This is a proposal, not an implementation or product selection.

## Disposition of the released plan

| Released-plan proposal | Final disposition | Design boundary |
|---|---|---|
| Windowed grid with stable record keys and a logical focus position | **Retain and strengthen** | Use immutable domain IDs and stable field keys. Keep focus, selection, order, and drafts distinct. Keep windowing as one candidate, not the approved architecture. |
| Keyboard controller scrolls and focuses the logical target | **Retain with a focus-mode decision** | With direct cell focus, materialize and scroll the exact ID/key cell before focusing it. With aria-activedescendant, keep the reference valid and owned, draw a visible active indicator, and scroll the referenced item. Test both only if the target platform supports both modes. |
| Full logical-table accessibility information with a small rendered window | **Retain with strict data and AT conditions** | For sparse web grids, expose accurate counts and logical indices for the displayed result set, including header rows. Use -1 only if the total is genuinely unknown. Do not invent a server total or confuse it with loaded rows. Test what each candidate actually announces. |
| Inline edit draft survives sort/filter | **Retain with explicit session policy** | Store draft, base value/version, dirty state, validation state, and conflict state by record ID and field, outside the virtual row. Define when a sort-field edit commits or reorders. |
| Focus next visible row if the edited row disappears | **Revise** | Do not silently transfer focus to the row now occupying the old position. Move to a durable, keyboard-reachable pending-edit/recovery action, or deliberately keep the actual row mounted and test that choice. |
| Field error plus navigable summary | **Retain and strengthen** | Associate the error with record and field, identify row and column, and provide an action that reveals and focuses the actual field. Keep pertinent linked error text available. |
| One polite channel for validation and selection; silence background updates | **Revise** | Expose selection state separately from focus. Keep routine refreshes silent. Prefer field/error-summary relations, then test one coalesced user-triggered status where it helps. |
| Compare windowing with pagination or other bounded rendering | **Retain and broaden** | Compare semantic pagination, row-windowing, packaged grids, headless table plus replaceable virtualizer, and full semantic rendering only where realistic measurements permit. Canvas/custom rendering remains a fallback only after a demonstrated need and an accessibility-API prototype. |
| Determine whether counts and indices are sufficient | **Reject sufficiency; retain the investigation** | Metadata describes sparse structure but cannot prove usable navigation, editing, announcements, or AT interoperability. |
| Targeted tests and accurate test reporting | **Retain and expand** | Use the validation plan below. Clearly mark every item proposed until it is actually run. |
| Distinguish standards from compatibility claims | **Retain** | WAI-ARIA/APG/WCAG guidance applies to web content. A native or embedded desktop toolkit needs mapping and measurement through its actual platform accessibility API. |

## State and implementation boundaries

### Record and view state

Maintain an immutable unique record ID from the application data model. Keep a separate ordered list of IDs for the current sorted and filtered view. The grid row number and visible label are transient presentation, never identity. A maintained grid can use the domain ID internally, but the visible discriminator must be safe and meaningful under the product’s privacy rules. When names collide, expose approved additional context rather than relying on color or an ambiguous label.

Keep independent state for:

- active focus: record ID, field key, and navigation or editing mode;
- selection: a set of record IDs, or a separately chosen set of cell keys;
- each edit session: record ID, field key, base value/version, draft, dirty state, validation state, and conflict state;
- current filtered/sorted order and the update/version that produced it.

Stable identifiers help maintained grids preserve selection across data updates, but they do not supply application draft storage or conflict resolution [S06–S08, S12, S21]. Never overwrite a dirty draft silently when a refresh changes the backing record.

### Keyboard and focus behavior

Use an interactive grid only if its composite keyboard contract is implemented. Provide one predictable Tab entry; use arrows and documented Home/End behavior inside the grid; let Tab leave or move among editor widgets according to the chosen, documented mode. Enter or F2 may enter editing; Escape returns to navigation and follows an explicit cancel policy. In edit mode, keys needed by the editor must reach it. Define boundary behavior and test Page Up/Down and Ctrl+Home/End. APG notes that dynamic DOM rows can make Ctrl+End land on the last rendered row rather than the last data row [S02].

When sort changes order, resolve focus by record ID and field key, scroll/materialize that item, then focus the correct control. Do not restore focus by old row index. If virtualization removes the focused node, explicitly manage focus so it stays visible and moves predictably; APG warns that unmanaged removal can return focus to the document body [S03]. Keep focus visibly distinct from selection. Arrow navigation alone must not silently select a row.

A read-only semantic table with ordinary page tab order remains a valid simpler option if interactive cell navigation is not needed. Do not apply a grid role without the behavior it represents [S01–S03].

### Sparse rendering and accessibility output

For web content, calculate row and column counts from the displayed logical table, not the unfiltered database. Indices must be one-based, ordered, complete for the rendered rows, and consistent with the count. Row counts include header rows. -1 represents a genuinely unknown total. In a partially loaded/server-backed view, report only a supported total; distinguish loaded window from total and do not invent either [S01, S17].

For noncontiguous virtual columns, expose valid column indices at the required row or cell level. Incorrect or missing indices can make assistive-technology table navigation skip rows or cells. These attributes describe structure; they do not prove that a particular browser, screen reader, webview, or native API will navigate it correctly [S17–S20].

AG Grid 36.2 documents that its default row and column virtualization can conflict with screen-reader assumptions about all elements being present and ordered. Its guidance recommends pagination for exposing the current page’s rows, and it documents memory/rendering cost when virtualization is disabled. It also documents limits on some focused-cell announcements and row-count announcements in server-side row-model cases [S04, S21]. MUI X v8.29.3 documents row-buffer behavior, horizontal overscan, browser scroll-container pixel limits, and version-specific virtualization limits [S22]. Neither vendor’s guidance settles behavior on the eventual platform.

For native or embedded desktop controls, map the same logical row, column, selection, focus, and error state through the target accessibility API. Do not assume HTML ARIA results transfer to a native toolkit.

### Draft, filtering, sorting, and recovery

A sort can move an active record without changing its identity. Keep the draft attached to the same ID and field, then restore focus after resolving the record’s new position. If the edited field participates in sorting, define whether reordering occurs on commit, after explicit user confirmation, or immediately with focus restored by ID. Test the selected rule.

If filtering or another view merely hides a dirty record, retain its draft and expose one keyboard-reachable pending-edit task. Do not create a fake grid row or duplicate set of grid cells. The task should identify the approved record context and field, and show dirty, invalid, or conflict state. Provide keyboard actions to:

1. return to the real record by temporarily revealing it or adjusting the filter;
2. continue to another pending edit;
3. retry or save after valid data is restored; or
4. discard only after an explicit choice.

If the record was deleted or concurrently changed, retain the local draft and open an accessible conflict/review surface. Offer compare/resolve/retry only where the server semantics support them, plus explicit discard. Whether drafts survive the session, how deletion is resolved, and whether filtering asks or moves immediately are owner decisions. MUI’s documented rejected-save behavior can keep a cell in edit mode, but does not address row loss through virtualization or filtering [S11].

### Validation and announcements

Bind every field error to the record ID and field key, not to the mounted cell object or row index. Provide visible, actionable error text by the editor and a keyboard-reachable summary that identifies both record and field. If a row is filtered out, the summary action first reveals or opens the record, then focuses its real editor. For web controls, pair aria-invalid with a pertinent aria-errormessage; keep the referenced text available while the error is relevant [S01]. WCAG 2.2 conditionally requires automatically detected errors to identify the item and describe the error in text, and known correction suggestions unless they would jeopardize security or purpose [S16]. These web requirements do not establish the applicable regulatory target for a native desktop console.

Do not mark an untouched required field invalid only because it is empty before validation is attempted. Keep routine background row updates quiet. Announce a concise user-triggered result only where testing shows it adds information beyond focus and field associations. For selection, expose selected state separately; test any coalesced polite selection summary rather than assuming every change should be announced [S01–S04].

## Architecture candidates

| Candidate | Strength | Cost or risk | Comparison boundary |
|---|---|---|---|
| Semantic paginated table | All rows on the current page can be present; simpler orientation and no row unmount within a page | Page navigation and cross-page focus, selection, and pending edits need explicit behavior | Keep the complete dataset available; test page controls, page transitions, recovery, and AT orientation. |
| Row-windowed semantic grid | Small DOM and responsive scrolling for large visible datasets | Mounted rows disappear; requires strict focus, edit recovery, count/index, and AT testing | Compare against pagination using identical rows, editors, keyboard scripts, updates, and target AT. |
| Packaged grid, including AG Grid or MUI X | Maintained models, sorting/filtering, keyboard support, editing, IDs, and extension points | Release/tier differences; documented accessibility limitations; custom editors and external updates need testing | Pin release, license/tier, OS, browser/webview, and AT. Test hidden-draft recovery, refresh while focused, and row-count behavior [S04–S07, S09–S12, S21–S22]. |
| Headless table plus virtualizer, such as TanStack Table plus TanStack Virtual | Separates table state from viewport measurement; virtualizer can be replaced | Application owns grid semantics, focus, editing, selection, validation, and recovery; client virtualization still requires client data | Pin exact packages and test the same state contract as the packaged candidate [S08]. |
| Full semantic rendering | Simple focus and mounting model | Large DOM and accessibility-tree costs may harm responsiveness | Consider only at the real maximum data/content size with the target AT; do not cap the product to make this pass [S04, S22]. |
| Canvas or custom low-level renderer | Potentially lower per-cell rendering overhead | Application owns the full semantic, focus, editing, selection, and accessible representation; parallel representations can diverge | Retain only if ordinary candidates fail a measured requirement and a platform accessibility-API prototype succeeds. |

No candidate is selected here. AG Grid and MUI X examples document different tradeoffs; they are evidence for the bakeoff, not product suitability findings. TanStack documents that its table model and virtualizer solve different concerns, client virtualization does not remove the need to hold client data, and ordinary rendering is simpler for small tables [S08].

## Proposed validation plan — not run

1. **Focus and deletion:** Put keyboard focus in an editable cell. Separately trigger filtering, deletion from another view, and a remote refresh. Verify the dirty draft remains tied to the original ID; focus reaches the recovery action; the same record is revealed when it still exists; deleted or stale rows open the conflict route; no later key edits the row that inherited the old screen position.
2. **Edit while sorting:** Edit an ordinary field and a current sort field. Change sort while dirty, commit/cancel, and receive an update during the edit. Verify the selected commit/reorder rule, focus by ID after movement, and explicit conflict behavior.
3. **Validation return:** Create multiple client and server errors, including one filtered-out row. Submit with keyboard. Check row and field context, text error details, suggestions when known, summary navigation, reveal-and-focus behavior, correction, and stale-error clearing. Confirm untouched required fields do not become invalid solely from being empty.
4. **Long, missing, and duplicate labels:** Traverse long names, blank fields, repeated display names, and duplicate-looking labels by keyboard and screen reader. Verify full values and safe distinguishing context are available; missing values are understandable; errors remain on the correct ID/field.
5. **Windowing and orientation:** At the actual supported scale, beginning with thousands of records, test arrows at overscan boundaries, Home/End, Ctrl+Home/End, Page Up/Down, horizontal navigation, rapid scrolling, sorting, filtering, column hiding, and noncontiguous columns if supported. Inspect all row/column counts and indices. Measure startup, input-to-paint latency, memory, DOM/accessibility-tree size, scroll stalls, and row/column-count announcements. Do not cap the product dataset for a passing benchmark.
6. **Focus, selection, announcements:** Move focus without selecting, select rows/ranges with separate commands, move focus out and back, and test high contrast. Verify selected state and visible focus differ. Test user-triggered status and silent background refreshes on every supported platform/AT combination.
7. **Platform and renderer bakeoff:** Run the same data, scripts, update stream, and acceptance criteria against semantic pagination, row-windowed rendering, and the packaged/headless candidates chosen for the spike. Record exact library release/tier and OS/browser/webview/accessibility API/screen-reader versions. Test representative target hardware. Use real supported AT; W3C APG says its examples are illustrative and need AT testing before production [S18].
8. **Recovery and data policy:** Verify the application’s real server behavior for concurrent change, deletion, retries, conflict resolution, and session retention before finalizing UI choices. Use an approved, non-sensitive record reference in test data.

### Executed checks and limits

**Executed for this review:** read the released brief and plan; inspected the complete investigator package; independently opened the cited primary specifications, maintained implementation docs, and issue records listed in the source map; verified the revealed discovery and plan hashes. The ARIA-AT index page itself returned no readable text, so its recorded candidate percentages remain unverified [S19].

**Not executed:** no application build, performance test, browser demo, code sample, downloaded code, synthetic fixture, device test, screen reader, accessibility tree inspection, or physical AT session. All items in the validation plan are proposals. No product compatibility, performance, or conformance result is claimed.

## Open owner decisions before implementation approval

1. Which GUI toolkit and supported OS versions are required? Is the console browser-based, embedded in a webview, or native, and which accessibility APIs and AT combinations are supported?
2. What are realistic and maximum row/column counts, row heights, data update frequency, and latency/memory budgets? Is the complete data set local, server-paged, or streamed?
3. When filtering hides an active dirty record, should it move directly to pending edits, or may the user keep/reveal it in place?
4. What are server semantics for changed/deleted records, retry, and conflict resolution? May an edit persist beyond the session, and under what security/privacy policy?
5. What non-sensitive record context may distinguish duplicate display names? Is selection row-based, cell-based, or both, and what selection persists across filtering, sorting, and pages?
6. Which conformance/regulatory target applies to this desktop delivery? Do any submission flows trigger data error-prevention obligations?

Do not settle these product choices from web-grid behavior alone.

## Evidence navigation

Stable source IDs S01–S20 are carried forward without rebinding from the investigator source map. This review adds S21–S22 for independently checked current version and focus context. Exact URLs, versions, locators, operations, access times, governing conditions, and applicability are in this stage’s source-map.json and sources/index.md.
