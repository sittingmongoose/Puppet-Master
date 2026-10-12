# Critic source index — C-R1-P01-control

Source IDs, titles, URLs, version/commit notes, locators, and original access timestamps are preserved from the investigator map. Critic rechecks occurred during the UTC window in source-map.json; individual page request timestamps were not separately captured. Reopened pages are marked below; S08 and S21 were not independently retrieved.

Every source ID links to its record in [source-map.json](../source-map.json).

<a id="s01"></a>
## S01 — [Grid (Interactive Tabular Data and Layout Containers) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

- Version/commit: Live WAI-ARIA APG page; no numbered release shown (guidance, not a W3C Recommendation).
- Locator: Data Grids For Presenting Tabular Information; Keyboard Interaction; Editing and Navigating Inside a Cell; WAI-ARIA Roles, States, and Properties.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed APG composite focus model, navigation/edit key split, and warning that an end command can stop at the last loaded DOM row.

<a id="s02"></a>
## S02 — [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/)

- Version/commit: W3C Recommendation, 2023-06-06 (version-pinned URL).
- Locator: Roles grid and table; aria-rowcount / aria-rowindex / aria-colcount / aria-colindex; aria-selected; aria-sort; aria-readonly.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed W3C Recommendation date and partial-DOM row count/index requirements; web semantics do not prescribe native APIs.

<a id="s03"></a>
## S03 — [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)

- Version/commit: W3C Recommendation, 2024-12-12 (version-pinned URL).
- Locator: Success Criteria 2.1.1 Keyboard (A), 2.4.7 Focus Visible (AA), 3.3.1 Error Identification (A), and 4.1.3 Status Messages (AA).
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed WCAG 2.2 SC 3.3.1 text identification requirement and web scope.

<a id="s04"></a>
## S04 — [Understanding Success Criterion 3.3.1: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)

- Version/commit: Living WAI Understanding document; no pinned edition shown; consulted 2026-10-12.
- Locator: Intent and error identification examples, especially lines/sections requiring the identity of the item in error and describing errors in text.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed WAI explanation requires nature and identity of the item in error; correction suggestions are a separate criterion.

<a id="s05"></a>
## S05 — [Understanding Success Criterion 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)

- Version/commit: Living WAI Understanding document; no pinned edition shown; consulted 2026-10-12.
- Locator: Intent and definition of status messages; distinctions between result-set content and brief search completion/status text.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed markup status messages can be announced without focus; no basis to map this directly to unspecified native APIs.

<a id="s06"></a>
## S06 — [DataGrid Control Type - UI Automation](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdatagridcontroltype)

- Version/commit: Microsoft UI Automation platform documentation; no product release/version or last-updated date printed in this page body.
- Locator: Relevant Properties; Required Control Patterns; Required Events for DataGrid control type.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed UIA DataGrid always supports Grid; Table/selection/scroll patterns are conditional as described.

<a id="s07"></a>
## S07 — [VirtualizedItem Control Pattern - UI Automation](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-implementingvirtualizeditem)

- Version/commit: Microsoft UI Automation platform documentation; last updated 2025-07-14.
- Locator: Implementation Guidelines and Conventions; Realize method.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed Realize supplies full properties/patterns; bringing a virtual item into view is allowed but not required.

<a id="s08"></a>
## S08 — [NSAccessibilityTable](https://developer.apple.com/documentation/appkit/nsaccessibilitytable)

- Version/commit: Current Apple Developer Documentation; no release/version label shown.
- Locator: Overview and Supporting Accessibility methods/properties, including accessibilityRows, accessibilityVisibleRows, accessibilitySelectedRows/cells, headers, and columns.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Inherited only; not independently retrieved
- Critic check: Not independently retrieved by critic; inherited source identity and claims preserved, with access limitation recorded above.

<a id="s09"></a>
## S09 — [Atspi.Table](https://gnome.pages.gitlab.gnome.org/at-spi2-core/libatspi/iface.Table.html)

- Version/commit: AT-SPI API 2.0; library version 2.62.0.1; generated by gi-docgen 2026.2 (as shown on page).
- Locator: Interface description and NRows/NColumns, get row/column header, selected-row, cell lookup methods.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed AT-SPI Table counts include off-viewport rows/columns and exclude programmatically hidden ones; selection support is conditional.

<a id="s10"></a>
## S10 — [JavaScript Grid: Accessibility - AG Grid](https://www.ag-grid.com/javascript-data-grid/accessibility/)

- Version/commit: AG Grid 36.2.0, explicitly shown on page.
- Locator: ARIA Attributes; Ensure DOM Element order; Disable Group Sticky Rows; Ensure all grid elements are always rendered; Known Limitations.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed AG Grid 36.2.0 guidance on pagination or disabled virtualization for full DOM availability and the rendering cost.

<a id="s11"></a>
## S11 — [JavaScript Grid: Row Data / Row IDs - AG Grid](https://www.ag-grid.com/javascript-data-grid/row-ids/)

- Version/commit: Current AG Grid documentation; row-ID page does not visibly declare a version in the retrieved page text.
- Locator: Row IDs section and getRowId guidance.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed current AG Grid docs recommend unique, stable string IDs and a pure getRowId function.

<a id="s12"></a>
## S12 — [JavaScript Grid: Keyboard Interaction - AG Grid](https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/)

- Version/commit: AG Grid 36.2.0, shown in search result/page release banner.
- Locator: Navigation, editing and full keyboard interaction tables.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed AG Grid keyboard docs allow Enter/F2 editing only where the cell is editable and document keyboard header sort.

<a id="s13"></a>
## S13 — [Data Grid - Accessibility - MUI X](https://mui.com/x/react-data-grid/accessibility/)

- Version/commit: Current MUI X documentation; page has no explicit release label in the retrieved text.
- Locator: Row headers; Tab sequence; Keyboard navigation; renderCell tabIndex guidance.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Reopened the current accessibility page and checked tab-sequence and keyboard navigation details; the row-header-specific claim remains as recorded in the inherited locator/observation.

<a id="s14"></a>
## S14 — [Data Grid - Row definition - MUI X](https://mui.com/x/react-data-grid/row-definition/)

- Version/commit: Current MUI X documentation; page has no explicit release label in the retrieved text.
- Locator: Row identifier section.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed MUI requires unique row IDs and uses them across row models and selection.

<a id="s15"></a>
## S15 — [Data Grid - Virtualization - MUI X v8](https://v8.mui.com/x/react-data-grid/virtualization)

- Version/commit: MUI X v8 documentation (versioned host path).
- Locator: Row virtualization and column virtualization sections.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed versioned MUI X v8 virtualization limits, buffer caveat, and one-column overscan behavior.

<a id="s16"></a>
## S16 — [Data Grid - Editing persistence - MUI X](https://mui.com/x/react-data-grid/editing/persistence/)

- Version/commit: Current MUI X documentation; page has no explicit release label in retrieved text.
- Locator: processRowUpdate and Server-side validation sections.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed MUI persistence behavior: rejection retains edit mode; resolving to original row exits without update.

<a id="s17"></a>
## S17 — [DataGrid Filter loses focus after updating rows - mui/mui-x issue #8119](https://github.com/mui/mui-x/issues/8119)

- Version/commit: Issue #8119 opened 2023-03-03; closed through PR #8603; environment/version not stated in issue details.
- Locator: Reproduction steps/current behavior and maintainer explanation; links to PR #8603.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed issue #8119 status and maintainer explanation tying filter focus loss to a changing placeholder item ID.

<a id="s18"></a>
## S18 — [Use stable ID for the placeholder filter item - mui/mui-x PR #8603](https://github.com/mui/mui-x/pull/8603)

- Version/commit: Merged 2023-04-17; merged commit 474cf13; fixes #8119.
- Locator: PR title, merge record, commit reference, and 'Fixes #8119'.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed PR #8603 merged and fixed #8119 with commit 474cf13.

<a id="s19"></a>
## S19 — [Multiple problems with discoverability of sortable columns, exposure of column headers - mui/mui-x issue #4124](https://github.com/mui/mui-x/issues/4124)

- Version/commit: Issue #4124 opened 2022-03-08; displayed open when reviewed; no release/commit attached.
- Locator: Reported JAWS/Windows behavior and expected sort/header announcements.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed issue #4124 remains open in the retrieved page and reporter limits the observation to one screen reader/browser combination.

<a id="s20"></a>
## S20 — [Virtualization (React) Guide - TanStack Table](https://tanstack.com/table/latest/docs/framework/react/guide/virtualization)

- Version/commit: Mutable latest documentation; page does not identify a fixed released version in retrieved text.
- Locator: Virtualization setup, separation of table and virtualizer responsibilities, when to use virtualization, row/column examples.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Reopened by critic
- Critic check: Confirmed current mutable TanStack guide separates row model from virtualizer and says client virtualization does not replace server-side operations; no fixed release is claimed.

<a id="s21"></a>
## S21 — [Row Selection Guide - TanStack Table v8](https://tanstack.com/table/v8/docs/guide/row-selection)

- Version/commit: Versioned TanStack Table v8 documentation.
- Locator: Useful Row Ids; Manage Row Selection State; manualPagination caveat.
- Original access UTC: 2026-10-12T02:41:14Z
- Critic status: Inherited only; not independently retrieved
- Critic check: Not independently retrieved by critic; inherited versioned source identity and claim preserved, with access limitation recorded above.
