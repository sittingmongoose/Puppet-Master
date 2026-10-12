# Reviser source index — B02-P01-control

This index navigates the evidence IDs retained in [source-map.json](../source-map.json). Source IDs S01–S18 remain unchanged from the investigator and critic records. The source map carries the exact URL, version/commit (or explicit unknown), locator, access UTC, observed operation, governing condition/default/exception, applicability, and prior critic status for each ID. The reviser’s direct access window and checks are recorded separately; no raw captures were saved.

## Accessibility patterns and platform boundaries

- [S01 — WAI-ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — editable input, popup choices, manual selection, Escape and keyboard alternatives; web pattern only.
- [S02 — WAI-ARIA APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — modal inertness, focus entry/containment, Escape and return.
- [S03 — WAI-ARIA APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) — flat option names, long-name speech cost, nested-control limitation.
- [S04 — WCAG 2.2 Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) — non-focus status updates; criterion scope is markup-language content; no fixed delay.
- [S05 — Microsoft Accessibility Best Practices](https://learn.microsoft.com/en-us/windows/win32/winauto/accessibility-best-practices) — Windows keyboard focus, properties/events, and non-color status.
- [S06 — Microsoft UI Automation Control Types Overview](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-controltypesoverview) — required properties, patterns and events for a selected control type.
- [S07 — GNOME AT-SPI Architecture](https://gnome.pages.gitlab.gnome.org/at-spi2-core/devel-docs/architecture.html) — separate Linux toolkit-to-AT accessibility path.

## Comparative implementation, tests and history

- [S08 — VS Code 1.137.0 command palette provider](https://github.com/microsoft/vscode/blob/645f29cc3176500b4b5762ba887cf2a7f0ffdf2c/src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts) — pinned provider, one-time extension-registration wait and enabled-action filtering.
- [S09 — VS Code 1.137.0 command quick-input model](https://github.com/microsoft/vscode/blob/645f29cc3176500b4b5762ba887cf2a7f0ffdf2c/src/vs/platform/quickinput/browser/commandsQuickAccess.ts) — search, IDs, duplicate labels, shortcuts and explicit accept.
- [S10 — VS Code 1.137.0 quick-access tests](https://github.com/microsoft/vscode/blob/645f29cc3176500b4b5762ba887cf2a7f0ffdf2c/src/vs/workbench/test/browser/quickAccess.test.ts) — provider conditions, cancellation and editor/selection restore.
- [S11 — VS Code issue #268450](https://github.com/microsoft/vscode/issues/268450) — a command missing under a restrictive condition.
- [S12 — VS Code PR #268462](https://github.com/microsoft/vscode/pull/268462) — merged visibility-condition change.
- [S13 — VS Code 1.106 release notes](https://code.visualstudio.com/updates/v1_106) — release trace for the fix.

## API and search comparisons

- [S14 — Obsidian API command declarations](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) — original floating-master record is preserved; reviser also opened [the immutable 1.14.4 snapshot at commit 9abd9605ce081383674aae1ed111c456edde0688](https://github.com/obsidianmd/obsidian-api/blob/9abd9605ce081383674aae1ed111c456edde0688/obsidian.d.ts).
- [S15 — Obsidian API package metadata](https://github.com/obsidianmd/obsidian-api/blob/master/package.json) — original 1.13.2 observation retained; reviser confirmed version 1.14.4 at [the same immutable commit](https://github.com/obsidianmd/obsidian-api/blob/9abd9605ce081383674aae1ed111c456edde0688/package.json).
- [S16 — Fuse.js fuzzy-search guide](https://www.fusejs.io/fuzzy-search.html) — threshold/location/distance interaction and search tuning.
- [S17 — VS Code user-interface docs](https://code.visualstudio.com/docs/editing/getting-started/userinterface) — searchable command palette and product-specific shortcut precedent.
- [S18 — VS Code accessibility docs](https://code.visualstudio.com/docs/configure/accessibility/accessibility) — keyboard and screen-reader test precedent, not a target guarantee.

The critic independently reopened the entries marked in each source record. The reviser directly reopened S01–S04 and pinned S14–S15 to resolve the disputed surface, status-message scope, and source revision questions. S08–S13 and S16–S18 retain their existing investigator/critic provenance; the source map distinguishes direct reopens from carried evidence.
