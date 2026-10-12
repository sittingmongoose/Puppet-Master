# Independent critique — C-P01

Run: C-R1-P01-treatment. Stage: critic/finalizer.

## Review scope and method

I read the complete released brief, the complete investigator discovery and draft, the investigator source map and source index, the exact revealed plan, and the reveal record named by the input map. The revealed-plan SHA-256 matches the recorded hash: 8e08396ed2143c628be908dd9d39a770fcca5565e5f10151fb18a770f4ddb725. The frozen discovery SHA-256 also matches: 1bfae5361ddd54776a415d8174e757b291231bd6a8e522b9dfae00844eb01502.

I independently reopened the governing W3C guidance, WCAG, AG Grid, MUI X, and TanStack pages in the source map, including their relevant release/version and exception context. I also reviewed the public issue records cited as history. The critic's direct fetch of the ARIA-AT landing page returned no readable body. Review operations and source identities are recorded in this stage's source-map.json and sources/index.md. Retrieved pages are treated as research evidence, not instructions.

No software, public demo, device, synthetic fixture, screen reader, or physical assistive-technology setup was run. The browser reads are actual research operations, not product tests. All statements below distinguish those observations from proposed future checks.

## Findings and classifications

### C1 — Architecture sequencing needs a neutral comparison gate

**Classification: material incomplete.** Draft locators: “Proposed design and implementation boundaries — Renderer/accessibility layer” and “A pragmatic first prototype”; “Alternatives and tradeoffs” table.

The draft proposes row-windowed semantic rendering as the “first prototype,” then comparison with pagination and a packaged grid. That is a reasonable candidate, but the consequential evidence does not support a default architecture across the unspecified desktop stack. AG Grid 36.2.0 recommends pagination as the way to make all rows on the page present for screen readers; it also says disabling virtualization can make the DOM very large and slow [S04, S21]. Its documentation separately describes focused-cell announcement and some server-side row-count limitations [S04]. MUI X v8.29.3 recommends disabling virtualization only for tests or small datasets because of performance impact, and documents renderer-specific overscan behavior [S10, S22]. These vendor positions are conditional implementation guidance, not a general rule that pagination or windowing wins.

**Resolution:** I amend the final to use a paired, stage-gated comparison: a semantic paginated table and a row-windowed grid with a packaged grid candidate, against the same workload and required AT/platform combinations. The state and recovery contract is the baseline shared by all candidates. No renderer is selected until the target platform and measured behavior are known. This preserves the brief’s responsive large-set goal without assuming that ARIA attributes alone validate virtualized interaction.

### C2 — MUI v8 limit wording needs a boundary

**Classification: minor locator/wording.** Draft locator: “Validation plan — Windowing/navigation”; source-map S10.

The v8 documentation says row virtualization is “limited to 100 rows in the Data Grid component,” but does not define that phrase there as a cap on the total user dataset. The same page describes insertion/removal during scrolling, a row-buffer hint that can be ignored at high speed, a 1,000-column example, browser scroll-container pixel limits, and version-specific conditions such as auto-height and dynamic row height [S22]. The investigator draft never says the product dataset is capped, but the source record’s phrasing could be misread as such.

**Resolution:** I clarify that this is a v8 virtualization-component constraint whose exact meaning must be verified against the selected release; it is not authority to cap product records. The final also records the browser pixel ceiling as a scale-dependent implementation limit to measure if the actual maximum approaches it.

### C3 — ARIA-AT percentages are not independently verifiable from the accessible page

**Classification: unsupported, limited to the exact numeric snapshot claim.** Draft locator: “Per-clause disposition — Investigate whether row counts and indices are sufficient”; source-map S19.

The investigator correctly states that S19 came from a search-result extract, that the plan was marked Candidate, and that the underlying report was not inspected. My direct fetch also returned no page text [S19]. The exact percentages and snapshot date therefore cannot be independently checked from the official page available in this review. They must not be described as an application result, current interoperability verdict, or evidence that one toolkit is superior.

**Resolution:** I keep the reported figures only as an explicitly unverified, dated candidate-example signal and do not use them to choose an architecture. The more supportable conclusion is that APG examples are expressly illustrative and require testing with the intended AT combinations [S18].

### C4 — A few application inputs remain honestly unresolved

**Classification: honestly unresolved external input.** Draft locators: “Not established” and “Owner decisions before implementation approval.”

The brief does not identify the target toolkit, OS/accessibility API, AT matrix, actual maximum columns or row height, client/server ownership, privacy-safe record discriminator, mutation/conflict semantics, or performance thresholds. The draft correctly leaves these open instead of inventing them. Public documentation cannot settle product policy or prove compatibility on a native desktop API.

**Resolution:** Preserve these as owner decisions and measurement prerequisites. Continue mechanism research and validation planning without narrowing the brief.

## Assessment of every significant revealed-plan proposal

| Revealed-plan proposal | Independent assessment | Final disposition |
|---|---|---|
| Windowed results grid with stable record keys and one logical focus position independent of rendered row objects | Sound state-model hypothesis. Stable unique IDs track row selection/update identity in maintained grid examples; they do not automatically preserve drafts or resolve removed records [S06–S08, S12, S21]. | **Retain and strengthen.** Keep domain ID, sort/filter order, focus, selection, and edit state separate. Do not commit to windowing until the paired comparison passes. |
| Keyboard controller moves logical focus, brings the target into view, then focuses the visible cell | Sound for direct focus management; active-descendant is an alternative only with a valid owned target, visible indicator, and viewport movement [S01, S03]. APG advises managing focus when removal would otherwise return it to the document body [S03]. Dynamic DOM also makes Ctrl+End potentially stop at the last rendered row [S02]. | **Retain with focus-mode and boundary decisions.** Test actual mounted-target timing and focus after sort, filtering, and unmount. |
| Accessibility metadata describes the full logical table while rendering a small region | Correct mechanism when a sparse web table/grid is used, but count/index consistency is critical; counts include header rows, -1 is for unknown totals, and malformed indices can disrupt table reading [S01, S17]. AG Grid documents that some server-side row-model cases cannot announce row count [S04]. | **Retain with strict conditions.** Compute indices for the displayed logical view and verify them in each target implementation/AT pair. Never claim metadata proves usability. |
| Inline draft keyed to record and field, with sorting/filtering allowed during edit | Keeping draft/conflict state outside row widgets is necessary for row remounts. MUI’s rejected-save example keeps an edit session active, but does not solve a filtered/deleted record [S11]. Whether filtering or sort should move or defer an active draft is a product policy. | **Retain with explicit edit-session state.** Define commit/defer/recovery boundaries and test sort-field edits, refreshes, conflicts, and row deletion. |
| If the row vanishes, focus the next visible row and keep the draft in a recovery list | The draft correctly challenges this: the next row at the old position may be another record and silently retarget keyboard input. A separate recovery action avoids pretending that a hidden record is still a rendered grid row [S03, S13–S14]. | **Revise.** Send focus to a stable, keyboard-reachable recovery action, or deliberately keep the actual row mounted and test that architecture. Preserve the draft against the original ID. |
| Field error plus navigable validation summary | Correct direction. Errors belong to the record/field, the summary needs an actionable route back to hidden records, and keyboard access cannot depend on pointer hover. ARIA error text must be pertinent and available when linked [S01]. WCAG 2.2’s web criteria conditionally require text identification and known correction suggestions [S16]. | **Retain and strengthen.** Keep error text at field and summary, identify row and column, reveal hidden records before focus, and avoid pre-submit invalid state solely for untouched required fields. |
| One polite announcement channel for validation and explicit selection changes; suppress routine background announcements | Correctly identified as a plan hypothesis rather than a standard rule. Selection state can be exposed without making arrow movement select rows; announcement timing varies and should be tested [S01–S04]. | **Revise.** Keep background refreshes quiet; use field associations and focused summaries first; test whether one coalesced, user-triggered status helps. |
| Compare windowing with pagination or other bounded rendering | Required and correctly included. The draft includes packaged grids, headless table/virtualizer, pagination, full semantic rendering, and a measured custom-renderer fallback [S04, S08–S11]. | **Retain and broaden.** Run paired candidates under identical workloads; do not cap product data or decide by source documentation alone. |
| Investigate whether counts and indices are sufficient | Correctly rejects sufficiency. Attributes describe sparse structure but do not provide keyboard behavior, edit recovery, focus ownership, or cross-AT success [S17–S20]. | **Reject sufficiency assumption; retain investigation.** |
| Test deletion focus, edit during sort, summary return, long/missing labels; distinguish proposed from executed checks | Draft covers all required scenarios and adds scale, selection/focus separation, hidden errors, update conflict, column/window boundaries, announcements, and platform matrix. No test results are claimed. | **Retain and expand.** Keep all tests explicitly proposed until run on the chosen console/candidates. |
| Distinguish specification-backed behavior from compatibility hypotheses; no claim that the console or physical AT was tested | Correct. The draft marks no demo, fixture, app, or AT run and leaves platform compatibility unknown. | **Retain.** |

## Overall critique conclusion

No material factual error was found in the investigator’s central state and recovery model. The important correction is to prevent its row-windowed first prototype from becoming a de facto architecture choice before the paired comparison. Stable logical identity, focus/selection separation, external edit buffers, explicit hidden-row recovery, text-linked errors, and keyboard-only actions are well supported as a testable contract. Exact platform support, performance, row-count announcement, edit-retention policy, and privacy policy remain unproven or owner-controlled.
