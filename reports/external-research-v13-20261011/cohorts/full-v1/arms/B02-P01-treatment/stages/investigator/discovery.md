# Investigator discovery — accessible command selection

**Run:** B02-P01-treatment  
**Stage:** investigator  
**Brief source:** \`inputs/brief.md\` (read before research)  
**Discovery cut:** 2026-10-12 UTC. The exact plan has not been released or consulted.

## Scope and limits

The brief describes a technical writing editor but does not name the product, repository, toolkit, supported screen readers, or existing shortcut inventory. I therefore reviewed relevant first-party accessibility guidance and two product/code references (VS Code Quick Pick/command palette and CKEditor 5 command state). These are comparison material, not claims about the unnamed target. No target repository, caller, test suite, or issue tracker was supplied, so target-code review is unavailable; the source review below covers the references that can be established from the brief alone. I have not looked for or inferred the withheld plan.

## Governing and platform evidence

- WCAG 2.2’s stable version is the W3C Recommendation dated 12 December 2024. Its keyboard, no-keyboard-trap, focus-order, programmatic-name/state, color, and status-message criteria are relevant design checks ([S-WCAG22-REC], [S-WCAG-KEYBOARD], [S-WCAG-FOCUS], [S-WCAG-COLOR], [S-WCAG-STATUS]). Because the requested editor is desktop software, WCAG2ICT is the closer interpretation aid: it is an informative W3C Group Note, not a conformance standard or a guarantee that a native control is accessible ([S-WCAG2ICT]).
- For a command chooser, the concrete WCAG-aligned goals are keyboard operation without a trap, a meaningful focus order, a programmatically exposed name/role/state, and a non-color explanation of unavailable state. A “results updated” or “no results” announcement is a status; the changing result list itself is not necessarily a status message. Avoid making every keystroke a separate live announcement. If a shortcut uses printable characters alone, WCAG 2.1.4 requires a way to turn it off, remap it with a non-character modifier, or restrict it to a focused component. The brief’s stronger “do not steal ordinary typing shortcuts” constraint still calls for a real shortcut inventory and collision review.
- WAI-ARIA APG is web authoring guidance, not a native-widget guarantee. Its modal-dialog pattern moves focus inside on open, contains Tab/Shift+Tab within the modal, closes on Escape, and normally restores focus to the invoking control. Its editable combobox pattern keeps focus in the input while an active descendant tracks the popup option. However, combobox Enter normally accepts a suggested value; this chooser’s Enter would execute an action. Treat either pattern as a starting point and test the actual target/runtime/screen-reader pair ([S-APG-DIALOG], [S-APG-COMBO]).
- Windows UI Automation exposes an element tree, properties, control patterns, and events. Custom controls may need providers. GNOME documents AT-SPI as the application-to-assistive-technology route, and Orca works with applications/toolkits that support AT-SPI ([S-WIN-UIA], [S-GNOME-ACCESSIBILITY], [S-ORCA]). These describe infrastructure, not successful announcements for this chooser. Verify with NVDA on Windows and Orca on a supported Linux desktop against the shipped application; add Narrator/other supported combinations as product policy requires.

## Interaction alternatives

| Shape | Possible strengths | Costs and cases to validate |
| --- | --- | --- |
| Modal search dialog containing a search input and results | Obvious task boundary; conventional Escape dismissal and focus restoration; can expose result name, scope, shortcut, and disabled reason together. | Tab containment and return-focus logic add edge cases; modal semantics and search/results navigation must work in the app’s actual accessibility stack. |
| Search combobox with listbox popup | Keeps typing in one input and supports compact arrow-key browsing; APG documents both DOM-focus and active-descendant variants. | Command invocation differs from ordinary value selection. Never execute on highlight/active-descendant changes; test whether name, current result, and disabled reason are spoken correctly. |
| Search field plus ordinary result buttons/list | Simple control semantics and individually focusable actions may be easier to inspect in some toolkits. | Tab order grows with results, searching can move or remove the focused button, and a large command set costs many keystrokes. |
| Existing host quick-picker/palette | Reuses established keyboard and command infrastructure and can reduce integration size when its actual accessibility behavior meets the brief. | A familiar implementation is not proof of compatibility. Inspect its exact focus, disabled-command, extension-refresh, and speech behavior before reusing it. |

All shapes should open from an established keyboard route (menu command plus a conflict-reviewed binding where available), focus the search field, separate active/highlighted from accepted/executed, dismiss predictably, and restore the editor caret/selection on dismissal. Escape is the primary dismissal key; Tab behavior depends on the selected shape and must not create a trap. Do not steal ordinary typing keys or silently replace existing bindings. If no safe default chord is available, keep the menu path keyboard-operable and make rebinding explicit.

## Search alternatives

| Approach | Mistyped query behavior | Trade-off |
| --- | --- | --- |
| Prefix/substring matching | Poor for omissions, substitutions, and transpositions. | Predictable and fast; good for exact IDs/names and ranking the strongest match. |
| Fuzzy subsequence matching | Tolerates gaps in the query’s character sequence, but “fuzzy” does not itself promise correction of a mistyped character. VS Code documents fuzzy matching and its internal picker exposes fuzzy versus contiguous label matching ([S-VSCODE-SEARCH], [S-VSCODE-QUICKINPUT-SOURCE]). | Useful for shortened names; can rank surprising near matches. Keep ranking legible and deterministic. |
| Aliases plus bounded edit-distance fallback | Can catch a known user term or a small typo (for example, a one-character omission or adjacent transposition). | Better typo recall, but more false positives; constrain by token length, rank below exact/prefix matches, and expose aliases as command metadata rather than executable UI code. |
| Semantic/remote search | Could retrieve conceptually related commands when wording is unknown. | Less predictable and may add latency/privacy/network dependencies. It is not needed to satisfy the brief; compare only if the owner later makes that an explicit requirement. |

A feasible baseline to compare is deterministic local matching: exact/prefix and word-boundary matches first, then subsequence/substring, then a narrowly bounded typo fallback over command names and curated aliases. Include the visible name, common search terms, shortcut text, and scope in searchable metadata only where that does not create noise. Test typo cases, duplicate labels, no results, keyboard-layout variants, and tie-breaking. This is a proposal for comparison, not a user-tested winning algorithm.

## Command registry and extension lifecycle references

- VS Code’s command palette is a keyboard-first, general-purpose quick input; its official guide documents the palette shortcut and fuzzy command/file search ([S-VSCODE-UI], [S-VSCODE-SEARCH]). The extension API separates manifest metadata (\`contributes.commands\`, the discoverable label/ID) from \`commands.registerCommand\` (runtime handler). The handler is executable command logic; it is not extension-authored chooser UI ([S-VSCODE-EXT-COMMANDS]).
- At the pinned VS Code source snapshot, Quick Pick exposes a changing value event, item labels/descriptions/details/ARIA label, an item list, and fuzzy/contiguous label-filter modes. It also supports matching description/detail as separate options ([S-VSCODE-QUICKINPUT-SOURCE], [S-VSCODE-QUICKPICK-API]). Unit tests cover replacing item arrays and scroll/selection behavior; these are control tests, not screen-reader tests ([S-VSCODE-QUICKINPUT-TESTS]).
- The pinned command-provider code waits for extension registration or 800 ms before building a result set, includes labels/categories/aliases, and filters out disabled menu actions. That is evidence for registry timing and useful display metadata, but it does **not** meet this brief’s need to show unavailable commands with a reason. Nor does the one-time wait establish behavior when an extension adds/removes a command while the picker is already open. Do not inherit those gaps ([S-VSCODE-COMMANDS-SOURCE]).
- An open VS Code PR proposed a host-side \`reload()\` method that reruns filtering at the existing query when underlying items change, with tests for repeated reload and empty query. At retrieval it was an open PR, not a released contract; use it as a possible refresh shape, not as a dependency ([S-VSCODE-REFRESH-PR]).
- CKEditor 5 has a command collection where commands combine action and observable state; selection-dependent \`isEnabled\` is refreshed with document state, and other code can observe changes. Its keystroke handler can register callbacks and cancel/stop propagation ([S-CKEDITOR-ARCH], [S-CKEDITOR-COMMANDS], [S-CKEDITOR-KEYSTROKE]). This is a useful editor-oriented model for stateful commands, but the reviewed docs do not specify a searchable command palette or accessible chooser. Neither API alone supplies a user-facing unavailable reason.

A neutral host-owned data record worth evaluating is: stable namespaced command ID; localized display name; owner and scope; aliases; current shortcut(s); availability boolean plus concise reason; and a host-owned handler reference. Extensions may contribute declarative metadata and their command handler, but not UI markup/components. The host derives visible rows and accessibility text. Subscribe to registry and selection-state changes while open. Preserve query and focused item by stable ID on refresh; if that ID disappears, choose a documented next focus and announce the change once. Recheck availability at Enter time because selection/context may have changed since the row was rendered. Highlighting, sorting, opening, or refreshing must never invoke the handler.

## Consequential history and applicability

VS Code issue #152291 reports that NVDA did not regain/read focus properly when opening VS Code on Windows after an Electron upgrade. A maintainer could not reproduce on their VM; the reporter confirmed that launching with \`--disable-features=CalculateNativeWinOcclusion\` fixed the issue, the team said an Insiders build had the fix, and the reporter verified it. The issue discussion says the problem was specific to Microsoft’s Electron build/patch, not upstream Electron ([S-VSCODE-NVDA-ISSUE]). This is a narrow Windows/runtime example, not proof of a defect in other editors. It demonstrates why a standards checklist or UI Automation surface inspection cannot replace screen-reader validation on actual supported builds.
The Quick Input unit tests and refresh PR cover model/control behavior, not NVDA/Orca output. No local or target tests were run in this research stage.

## Initial owner questions (not resolved in discovery)

1. Which editor/repository and which command sources are in scope? What is the existing registry and selection-state contract?
2. Which keyboard entry route and shortcut inventory can be preserved? Is a default direct chord free on Windows and Linux?
3. Which surface shape and focus model is already supported by the target toolkit?
4. Which command metadata can extensions contribute safely, and can the host provide a concise availability reason for every disabled command?
5. Should scope mean editor/document/selection, extension owner, or both? Which current shortcut should be shown when bindings are contextual or multiple?
6. What minimum Windows/Linux screen-reader/runtime matrix does the owner support?

Discovery is research only. It contains proposals and comparison points, not a claim of implementation, conformance, usability testing, or a selected product/algorithm.
