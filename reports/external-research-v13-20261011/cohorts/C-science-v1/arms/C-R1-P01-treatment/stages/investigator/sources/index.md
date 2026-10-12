# Source index — C-P01 investigator

This is the bounded, navigable source index for discovery.md. Stable IDs and full records are defined in the parent stage's source-map.json; IDs must not be silently rebound. The JSON records exact URLs, version/commit or version uncertainty, locator, UTC access time, observed operation, governing conditions/defaults/exceptions, and applicability. Discovery references evidence by these IDs. Records summarize observations rather than reproducing source text. No public example was executed.

## Standards and interaction guidance

- **S01 — WAI-ARIA 1.2 Recommendation:** [official W3C specification](https://www.w3.org/TR/wai-aria-1.2/). Look up aria-activedescendant, aria-rowcount/aria-rowindex, aria-colcount/aria-colindex, aria-invalid, and aria-errormessage. Sparse rendering requires truthful full-table counts/indices (row totals include headers); unknown totals use -1; pertinent error text must remain available; a required-but-empty field is not automatically invalid before submission is attempted.
- **S02 — APG Grid Pattern:** [official W3C interaction pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/). Editable composite grid keyboard model, editing/navigation key mode, selection state, cell focusability, and the warning that dynamic DOM rows can make Ctrl+End target the last rendered row.
- **S03 — APG Keyboard Interface:** [official W3C keyboard and focus guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/). Focus versus selection, visible/persistent focus, roving tabindex, and aria-activedescendant tradeoffs.
- **S16 — WCAG 2.2 Recommendation:** [official W3C specification](https://www.w3.org/TR/WCAG22/). Conditional web baseline for keyboard use (2.1.1), text identification of detected errors (3.3.1), known correction suggestions (3.3.3), and error prevention for certain legal/financial/data submissions (3.3.4).

## Maintained implementations and architecture references

- **S04 — AG Grid accessibility, documentation 36.2.0:** [official accessibility guide](https://www.ag-grid.com/javascript-data-grid/accessibility/). DOM ordering, virtualization, pagination/full rendering tradeoffs, focused-state/announcement limitations, and server-side row-count caveat.
- **S05 — AG Grid keyboard interaction, documentation 36.2.0:** [official keyboard guide](https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/). Default navigation and custom keyboard handling for cells.
- **S06 — AG Grid row IDs:** [official row-ID guide](https://www.ag-grid.com/javascript-data-grid/row-ids/). Stable unique ID callback requirement; page version banner was not observed.
- **S07 — AG Grid row-data updates, documentation 36.1.0:** [official update guide](https://www.ag-grid.com/javascript-data-grid/data-update-row-data/). Stable IDs preserve selection when the row remains; removed rows are removed and updated rows can reorder.
- **S08 — TanStack Table + Virtual:** [official latest virtualization guide](https://tanstack.com/table/latest/docs/framework/react/guide/virtualization). Table model and virtualizer are separate; client virtualization does not remove data from client memory. Latest alias is not release-pinned.
- **S09 — MUI X Data Grid accessibility:** [official accessibility guide](https://mui.com/x/react-data-grid/accessibility/). One tab stop, custom-render focus responsibility, keyboard selection/navigation; exact page version not shown.
- **S10 — MUI X v8 virtualization:** [versioned v8 guide](https://v8.mui.com/x/react-data-grid/virtualization). Buffer/overscan and row virtualization behavior; v8 component limit is version-specific.
- **S11 — MUI X editing persistence:** [official editing persistence guide](https://mui.com/x/react-data-grid/editing/persistence/). Server validation rejection can preserve the active edit or restore the original row; exact page version not shown.
- **S12 — MUI X row identity:** [official row-definition guide](https://mui.com/x/react-data-grid/row-definition/). Unique row identifier is used to track a row across updates; exact page version not shown.

## Public failure and correction history

- **S13 — MUI X issue #8119:** [filter loses focus after incoming row update](https://github.com/mui/mui-x/issues/8119). Maintainer diagnosed a new default-filter ID per render; closed as completed in linked PR #8603. Exact historical package version and PR diff were not captured; reproduction was not run.
- **S14 — MUI X issue #1291:** [roving tabindex and focus report](https://github.com/mui/mui-x/issues/1291). Historical v4.0.0-alpha.23 report on keyboard entry/focus visibility; linked to PR #1575.
- **S15 — MUI X PR #1575:** [merged focus-style correction](https://github.com/mui/mui-x/pull/1575). Merged 2021-05-10, five commits reported; code diff and resulting release version were not inspected.

## Limits

These sources provide patterns and mechanisms, not a determination of which toolkit or OS accessibility API the community-service console uses. A browser/doc read is not a screen-reader interoperability test, and issue reports describe historical conditions rather than current defects.

## Plan-specific follow-up evidence (IDs appended after release)

- **S17 — APG Grid and Table Properties:** [official W3C guidance](https://www.w3.org/WAI/ARIA/apg/practices/grid-and-table-properties/). Explains row/column counts and indices for sparse DOM; warns inconsistent indices can make assistive-technology table navigation skip or stop.
- **S18 — APG Data Grid Examples:** [official W3C example page](https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/). Explicitly calls examples illustrative, not production-ready, and says browser/AT gaps require testing; demonstrates scrolling with row/column indices.
- **S19 — ARIA-AT interoperability report index:** [official ARIA-AT landing page](https://aria-at.w3.org/). Search-result excerpt showed its Oct. 2, 2026 snapshot's Minimal Data Grid Candidate rates across JAWS/Chrome, NVDA/Chrome, VoiceOver/Safari. Opening the page returned no extractable text, so only the index excerpt is recorded and underlying tests were not inspected or run.
- **S20 — W3C APG issue #3208:** [grid keyboard navigation issue](https://github.com/w3c/aria-practices/issues/3208). Discussion reports screen-reader mode differences for link/form controls inside grids and planned ARIA-AT coverage; it is an issue discussion, not a normative rule or completed result.
