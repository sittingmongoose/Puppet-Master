# Source index — C-R1-P01-control investigator

IDs are stable handles referenced in `discovery.md` and `draft.md`. The map carries exact URLs, version/commit where available, locator, access UTC, observed operation, governing condition/default/exception, and applicability. Entries are not silently rebound. Full copyrighted pages are not mirrored; bounded notes and direct links are retained.

<a id="s01"></a>
## S01 — Grid (Interactive Tabular Data and Layout Containers) Pattern

- Exact URL: <https://www.w3.org/WAI/ARIA/apg/patterns/grid/>
- Version/commit: Live WAI-ARIA APG page; no numbered release shown (guidance, not a W3C Recommendation).
- Locator: Data Grids For Presenting Tabular Information; Keyboard Interaction; Editing and Navigating Inside a Cell; WAI-ARIA Roles, States, and Properties.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: The pattern treats an editable/interactive data grid as a composite widget with one tab-sequence entry and author-managed focus among cells. It gives arrow/Home/End navigation; Enter or F2 enters cell editing; Escape restores grid navigation and may undo; selection and sort states are separate properties. It warns Control+End may reach the last DOM row rather than the last backend row when rows are dynamically added.
- Governing condition/default/exception: Every data cell is focusable or contains focusable content; nonfunctional header cells need not be focusable. Arrow keys belong to grid navigation only outside edit/widget interaction. Use row/column counts and indexes when rows or columns are hidden or absent from the DOM.
- Applicability: Web accessibility authoring guidance; useful interaction model for a desktop grid, but a native app must map equivalent semantics through its platform accessibility API.

<a id="s02"></a>
## S02 — Accessible Rich Internet Applications (WAI-ARIA) 1.2

- Exact URL: <https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/>
- Version/commit: W3C Recommendation, 2023-06-06 (version-pinned URL).
- Locator: Roles grid and table; aria-rowcount / aria-rowindex / aria-colcount / aria-colindex; aria-selected; aria-sort; aria-readonly.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Normative web accessibility semantics distinguish interactive grid from noninteractive table; partial DOM rows/columns can expose full counts and logical indexes. aria-selected indicates selection; aria-sort indicates sort order on a table/grid header; aria-readonly indicates editability, not navigability.
- Governing condition/default/exception: For partial DOM, aria-rowcount/colcount represent full available totals (use -1 when unknown), with 1-based indexes for present rows/cells. aria-sort belongs on headers and should be on at most one header per grid. Apply only semantic states matching actual behavior.
- Applicability: Normative WAI-ARIA requirements for web content/host languages; not a direct native desktop API contract.

<a id="s03"></a>
## S03 — Web Content Accessibility Guidelines (WCAG) 2.2

- Exact URL: <https://www.w3.org/TR/2024/REC-WCAG22-20241212/>
- Version/commit: W3C Recommendation, 2024-12-12 (version-pinned URL).
- Locator: Success Criteria 2.1.1 Keyboard (A), 2.4.7 Focus Visible (AA), 3.3.1 Error Identification (A), and 4.1.3 Status Messages (AA).
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Normative criteria require keyboard operation for all functionality, a visible focus indicator, text identification of input errors, and programmatically determinable status messages when markup-based status updates do not receive focus.
- Governing condition/default/exception: WCAG is scoped to web content; the exact criteria are not asserted as the governing legal standard for this unspecified desktop app. Their user outcomes remain design checks; native API equivalents and applicable obligations need an owner/platform decision.
- Applicability: Use as a web-content target if that is the chosen delivery surface; otherwise treat as a useful baseline and verify OS accessibility contracts.

<a id="s04"></a>
## S04 — Understanding Success Criterion 3.3.1: Error Identification

- Exact URL: <https://www.w3.org/WAI/WCAG22/Understanding/error-identification>
- Version/commit: Living WAI Understanding document; no pinned edition shown; consulted 2026-10-12.
- Locator: Intent and error identification examples, especially lines/sections requiring the identity of the item in error and describing errors in text.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: WAI explanatory guidance says an error description should provide its nature and identity of the item in error; text can be supplemented by color or an icon. An error list, inline message, alert, or dialog can be suitable depending on the situation.
- Governing condition/default/exception: Informative explanation, not the normative WCAG text. HTML native validation may return focus to first invalid field but can show generic/nonpermanent messages and expose only the first error at a time.
- Applicability: Supports a record-and-field-addressable error summary plus inline field explanation; native desktop implementation should expose equivalent text and focus behavior.

<a id="s05"></a>
## S05 — Understanding Success Criterion 4.1.3: Status Messages

- Exact URL: <https://www.w3.org/WAI/WCAG22/Understanding/status-messages>
- Version/commit: Living WAI Understanding document; no pinned edition shown; consulted 2026-10-12.
- Locator: Intent and definition of status messages; distinctions between result-set content and brief search completion/status text.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Status updates that do not take focus may be exposed to assistive technology without moving focus. WAI distinguishes the actual result list from a brief message such as result count or search completion.
- Governing condition/default/exception: Applies to markup-language content. Do not treat every background record change as a status message; expose meaningful operation state/errors without flooding or interrupting the user.
- Applicability: Guides aggregate announcements for filter/save/error status; platform-native notification/event mechanism must be tested if this is a native desktop application.

<a id="s06"></a>
## S06 — DataGrid Control Type - UI Automation

- Exact URL: <https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdatagridcontroltype>
- Version/commit: Microsoft UI Automation platform documentation; no product release/version or last-updated date printed in this page body.
- Locator: Relevant Properties; Required Control Patterns; Required Events for DataGrid control type.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: For UIA-integrated frameworks, DataGrid exposes Grid; data items expose GridItem; a header-bearing grid should expose Table/TableItem; selection and scrolling patterns depend on the grid's actual behavior. Focus and structure-change events are listed.
- Governing condition/default/exception: These requirements apply when the UI framework/platform integrates UI Automation support for the control types and patterns; selection/scroll patterns are conditional on actual capabilities.
- Applicability: Windows native target only; use as an adapter contract and inspect actual provider output with UIA tooling.

<a id="s07"></a>
## S07 — VirtualizedItem Control Pattern - UI Automation

- Exact URL: <https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-implementingvirtualizeditem>
- Version/commit: Microsoft UI Automation platform documentation; last updated 2025-07-14.
- Locator: Implementation Guidelines and Conventions; Realize method.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: A virtual item may be represented by a placeholder in the UIA tree with some properties unavailable. Realize must expose full properties/patterns; it may bring the item into view. Offscreen nonvirtualized items should support ScrollIntoView.
- Governing condition/default/exception: This pattern is relevant when provider virtualizes items; it is not a claim that any particular framework implements it correctly.
- Applicability: Windows-specific mechanism for preserving access to virtualized rows; must be measured in the selected UI toolkit and screen-reader stack.

<a id="s08"></a>
## S08 — NSAccessibilityTable

- Exact URL: <https://developer.apple.com/documentation/appkit/nsaccessibilitytable>
- Version/commit: Current Apple Developer Documentation; no release/version label shown.
- Locator: Overview and Supporting Accessibility methods/properties, including accessibilityRows, accessibilityVisibleRows, accessibilitySelectedRows/cells, headers, and columns.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: AppKit's role-based protocol defines a table in the accessibility hierarchy and exposes row/column headers, rows, selected rows/cells, and visible rows. NSOutlineView and NSTableView are listed as conforming types.
- Governing condition/default/exception: Adopting custom classes must implement required methods and inherited requirements; standard controls may provide built-in accessibility.
- Applicability: macOS AppKit only; useful to identify native concepts, not proof of behavior for another UI framework or VoiceOver.

<a id="s09"></a>
## S09 — Atspi.Table

- Exact URL: <https://gnome.pages.gitlab.gnome.org/at-spi2-core/libatspi/iface.Table.html>
- Version/commit: AT-SPI API 2.0; library version 2.62.0.1; generated by gi-docgen 2026.2 (as shown on page).
- Locator: Interface description and NRows/NColumns, get row/column header, selected-row, cell lookup methods.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: AT-SPI Table represents a row/column container; NRows/NColumns include rows/columns outside the current viewport; it exposes headers and selected rows. The page notes row/column selection is not supported by all tables.
- Governing condition/default/exception: Cell methods return accessible elements by logical indices; selection support is conditional. This API docs page does not state how an unspecified toolkit maps its virtualized items.
- Applicability: Linux AT-SPI ecosystem only; measure using the selected toolkit and Orca rather than assuming table interface parity.

<a id="s10"></a>
## S10 — JavaScript Grid: Accessibility - AG Grid

- Exact URL: <https://www.ag-grid.com/javascript-data-grid/accessibility/>
- Version/commit: AG Grid 36.2.0, explicitly shown on page.
- Locator: ARIA Attributes; Ensure DOM Element order; Disable Group Sticky Rows; Ensure all grid elements are always rendered; Known Limitations.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: AG Grid uses row/column virtualization for performance. Its guidance recommends DOM order, avoiding sticky group rows for consistent indices, and disabling row/column virtualization or using pagination to ensure screen readers can inspect all rendered grid elements; disabling virtualization can grow DOM and slow rendering. It reports differences between screen-reader interpretation and recommends testing combinations.
- Governing condition/default/exception: These are AG Grid vendor recommendations, not a universal ARIA rule. The 'disable virtualization' advice is explicitly balanced against performance and suggests pagination when needed.
- Applicability: Useful implementation evidence and a warning about AT behavior; not a direct dependency recommendation for a native desktop console.

<a id="s11"></a>
## S11 — JavaScript Grid: Row Data / Row IDs - AG Grid

- Exact URL: <https://www.ag-grid.com/javascript-data-grid/row-ids/>
- Version/commit: Current AG Grid documentation; row-ID page does not visibly declare a version in the retrieved page text.
- Locator: Row IDs section and getRowId guidance.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: AG Grid strongly recommends a pure getRowId function returning the same unique string for a given row; duplicate IDs are disallowed. Its update docs show selection/state is maintained across updates when IDs are supplied.
- Governing condition/default/exception: Without supplied IDs, some row data replacement paths rebuild state; behavior is specific to AG Grid's data update model.
- Applicability: Supports stable record keys across updates/sorting; does not determine the application's identity scheme.

<a id="s12"></a>
## S12 — JavaScript Grid: Keyboard Interaction - AG Grid

- Exact URL: <https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/>
- Version/commit: AG Grid 36.2.0, shown in search result/page release banner.
- Locator: Navigation, editing and full keyboard interaction tables.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: AG Grid documents arrow navigation and Enter/F2 to start editing when the cell allows editing; keyboard behavior can be customized.
- Governing condition/default/exception: The editor/cell's allowed state determines whether editing starts; arrow keys otherwise navigate. Custom navigation changes behavior and needs its own verification.
- Applicability: Implementation example only; APG is the primary interaction guide and platform testing is required.

<a id="s13"></a>
## S13 — Data Grid - Accessibility - MUI X

- Exact URL: <https://mui.com/x/react-data-grid/accessibility/>
- Version/commit: Current MUI X documentation; page has no explicit release label in the retrieved text.
- Locator: Row headers; Tab sequence; Keyboard navigation; renderCell tabIndex guidance.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: MUI recommends meaningful row-header columns and explicitly says not to use an arbitrary index as a row header. Row-header cells remain mounted while their column is horizontally virtualized. Only one focusable child should be in tab sequence; customized cell renderers must use the supplied tabIndex to keep inner controls out unless focused.
- Governing condition/default/exception: The mounted row-header behavior is specific to MUI X column virtualization. Custom cell renderers transfer tab-order responsibility to the application.
- Applicability: Useful maintained implementation behavior; does not establish native desktop support or screen-reader quality in the unknown app toolkit.

<a id="s14"></a>
## S14 — Data Grid - Row definition - MUI X

- Exact URL: <https://mui.com/x/react-data-grid/row-definition/>
- Version/commit: Current MUI X documentation; page has no explicit release label in the retrieved text.
- Locator: Row identifier section.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Every row needs a unique ID; by default MUI reads id, or getRowId points to another property. MUI uses the ID to track rows across row models and selection. It cautions generating an ID when no unique identifier exists.
- Governing condition/default/exception: The grid uses whichever configured ID function/property; keeping function and row-array references stable also avoids repeated sorting/filter work.
- Applicability: Supports an explicit stable-ID contract; identity should be in data/state, not derived from display label or current index.

<a id="s15"></a>
## S15 — Data Grid - Virtualization - MUI X v8

- Exact URL: <https://v8.mui.com/x/react-data-grid/virtualization>
- Version/commit: MUI X v8 documentation (versioned host path).
- Locator: Row virtualization and column virtualization sections.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Virtualization inserts/removes rows and columns; rowBufferPx is a hint that may not be honored at high scroll speed; row virtualization is limited to 100 rows and does not work with autoHeight. Column overscan of at least one can enable arrow-focus to the next offscreen column, while excessive overscan costs performance.
- Governing condition/default/exception: Specific to MUI X v8 component limits and implementation; different products and versions may differ.
- Applicability: Concrete perf/accessibility tradeoffs for virtualized renderer design, not a universal limit or recommendation.

<a id="s16"></a>
## S16 — Data Grid - Editing persistence - MUI X

- Exact URL: <https://mui.com/x/react-data-grid/editing/persistence/>
- Version/commit: Current MUI X documentation; page has no explicit release label in retrieved text.
- Locator: processRowUpdate and Server-side validation sections.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: The persistence callback returns the row used to update internal state. On server validation failure, rejecting keeps the cell in edit mode; resolving with the original row exits edit mode without update; an error callback is available.
- Governing condition/default/exception: Describes MUI's callback lifecycle. It does not promise edit-draft retention when filter/sort removes a row.
- Applicability: Useful explicit state-machine example; the console must independently decide the safest hide/filter behavior for unsaved changes.

<a id="s17"></a>
## S17 — DataGrid Filter loses focus after updating rows - mui/mui-x issue #8119

- Exact URL: <https://github.com/mui/mui-x/issues/8119>
- Version/commit: Issue #8119 opened 2023-03-03; closed through PR #8603; environment/version not stated in issue details.
- Locator: Reproduction steps/current behavior and maintainer explanation; links to PR #8603.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Reporter observed focus in a filter input was lost after rows arrived. Maintainer explanation attributes it to a placeholder filter item's id changing on rerender.
- Governing condition/default/exception: Specific to MUI's filter panel and the reported dynamic-row update setup; do not generalize as a current MUI or all-grid bug.
- Applicability: Failure history illustrating that transient UI identities can destabilize focus when data changes.

<a id="s18"></a>
## S18 — Use stable ID for the placeholder filter item - mui/mui-x PR #8603

- Exact URL: <https://github.com/mui/mui-x/pull/8603>
- Version/commit: Merged 2023-04-17; merged commit 474cf13; fixes #8119.
- Locator: PR title, merge record, commit reference, and 'Fixes #8119'.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Maintainer merged a stable-ID change for the placeholder filter item, with the PR explicitly closing the reported focus-loss issue.
- Governing condition/default/exception: Historical fix in MUI's filter control; no claim that it resolves record-edit retention or every focus issue.
- Applicability: Supports stable identities for focus-bearing widgets across rerenders and narrows the issue-specific remedy.

<a id="s19"></a>
## S19 — Multiple problems with discoverability of sortable columns, exposure of column headers - mui/mui-x issue #4124

- Exact URL: <https://github.com/mui/mui-x/issues/4124>
- Version/commit: Issue #4124 opened 2022-03-08; displayed open when reviewed; no release/commit attached.
- Locator: Reported JAWS/Windows behavior and expected sort/header announcements.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: A reporter described difficulty discovering/operating sort headers and hearing sort state in a quick JAWS/Windows check, and explicitly limited the report to one screen-reader/browser combination.
- Governing condition/default/exception: A historical user report, not a maintainer-confirmed cross-platform result. Current MUI docs describe keyboard navigation and row headers but this issue page provides no demonstrated fix.
- Applicability: Treat sortable-header discoverability and sort-state announcements as validation risks to measure, not as a claim of present behavior.

<a id="s20"></a>
## S20 — Virtualization (React) Guide - TanStack Table

- Exact URL: <https://tanstack.com/table/latest/docs/framework/react/guide/virtualization>
- Version/commit: Mutable latest documentation; page does not identify a fixed released version in retrieved text.
- Locator: Virtualization setup, separation of table and virtualizer responsibilities, when to use virtualization, row/column examples.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: TanStack Table owns rows, columns, sorting/filtering state; TanStack Virtual owns scroll indexes and measurements; the renderer maps virtual indexes back to the current table row model. Virtualization bounds rendered DOM but does not replace server-side operations if data cannot fit client memory.
- Governing condition/default/exception: React guide; official examples use @tanstack/react-virtual but other virtualizers can be used. Recompute from the current row model after sorting/filtering/pagination.
- Applicability: Useful separable-architecture alternative; transfers accessibility, editor, and focus integration to the application renderer.

<a id="s21"></a>
## S21 — Row Selection Guide - TanStack Table v8

- Exact URL: <https://tanstack.com/table/v8/docs/guide/row-selection>
- Version/commit: Versioned TanStack Table v8 documentation.
- Locator: Useful Row Ids; Manage Row Selection State; manualPagination caveat.
- Access UTC: 2026-10-12T02:41:14Z
- Observed operation: Row selection is externally controllable; by default row ID is row.index, and getRowId can use a unique data ID. With manual pagination, the selected-ID state can contain IDs not present on the current page even though the selected row model only returns current-page rows.
- Governing condition/default/exception: The default index is unsuitable when identity must survive sort/filter/page changes; current-page model limitation under manual pagination is explicit.
- Applicability: A useful headless-state alternative and a concrete warning to key selection by stable identity.
