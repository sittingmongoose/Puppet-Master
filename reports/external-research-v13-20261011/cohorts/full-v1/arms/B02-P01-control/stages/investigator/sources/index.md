# Sources index

This is the bounded investigator evidence index for B02-P01-control. Source IDs are stable across discovery.md, source-map.json, and the eventual draft; do not silently rebind them. The target editor is unnamed, so repository code entries are comparative references, not target code. Access time and version/commit, operation, condition/default/exception, and applicability are recorded in ../source-map.json.

## Accessibility patterns and platform contracts

- [S01 — WAI-ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — manual vs automatic selection, key behavior, Escape.
- [S02 — WAI-ARIA APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — focus entry/containment/return and true modality condition.
- [S03 — WAI-ARIA APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) — keyboard model, accessible option names, limitations for long/nested content.
- [S04 — WCAG 2.2 Understanding 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) — non-focus status and interruption goal.
- [S05 — Microsoft Accessibility Best Practices](https://learn.microsoft.com/en-us/windows/win32/winauto/accessibility-best-practices) — UIA exposure, keyboard focus, no color-only status.
- [S06 — Microsoft UI Automation Control Types Overview](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-controltypesoverview) — control type property/pattern/event/tree requirements.
- [S07 — GNOME AT-SPI Architecture](https://gnome.pages.gitlab.gnome.org/at-spi2-core/devel-docs/architecture.html) — toolkit-to-AT-SPI-to-screen-reader boundary.

## Product and implementation references

- [S08 — VS Code command palette provider](https://github.com/microsoft/vscode/blob/645f29cc3176500b4b5762ba887cf2a7f0ffdf2c/src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts) — pinned provider, shortcut, extension-registration wait, enabled-action filtering.
- [S09 — VS Code command quick-input model/search/accept](https://github.com/microsoft/vscode/blob/645f29cc3176500b4b5762ba887cf2a7f0ffdf2c/src/vs/platform/quickinput/browser/commandsQuickAccess.ts) — IDs, metadata, matching, duplicate labels, ranking, accept handler.
- [S10 — VS Code quick-access tests](https://github.com/microsoft/vscode/blob/645f29cc3176500b4b5762ba887cf2a7f0ffdf2c/src/vs/workbench/test/browser/quickAccess.test.ts) — conditional provider behavior, cancellation, editor/selection restore.
- [S11 — VS Code issue #268450](https://github.com/microsoft/vscode/issues/268450) — command hidden by precondition.
- [S12 — VS Code PR #268462](https://github.com/microsoft/vscode/pull/268462) — merged fix removing a restrictive precondition.
- [S13 — VS Code 1.106 release notes](https://code.visualstudio.com/updates/v1_106) — release entry for #268462.
- [S14 — Obsidian API command types](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) — command ID/name, check callback, editor-scoped callback.
- [S15 — Obsidian API package metadata](https://github.com/obsidianmd/obsidian-api/blob/master/package.json) — API types package version 1.13.2.
- [S16 — Fuse.js fuzzy-search guide](https://www.fusejs.io/fuzzy-search.html) — edit-distance/Bitap threshold, location, distance defaults and trade-offs.
- [S17 — VS Code User Interface documentation](https://code.visualstudio.com/docs/editing/getting-started/userinterface) — command palette overview and Windows/Linux shortcut.
- [S18 — VS Code Accessibility documentation](https://code.visualstudio.com/docs/configure/accessibility/accessibility) — keyboard use and tested screen-reader list.

No external page snapshots or raw captures were saved; this index plus source-map evidence notes are the bounded research record.
