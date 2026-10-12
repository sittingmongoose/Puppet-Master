# Brief-only discovery: accessible command selection

**Stage:** investigator, run B02-P01-control  
**Discovery basis:** the released user brief only, plus primary public references listed in source-map.json. The withheld plan was not sought, inferred, or read before this artifact was written.

## Problem boundary

The brief asks for a searchable chooser in an existing technical-writing editor, not a redesign of the editor. Its command inventory spans editing, document navigation, and extension actions. The interaction must work from a keyboard for Windows and Linux desktop users; preserve existing shortcuts; restore the editing position on dismissal; avoid execution on highlight; make unavailable commands and the reason understandable without color-only status; distinguish commands with same-name/different-scope; tolerate mistakes in the query; and handle extension add/remove while open. It also requires alternatives, a small integration plan, and validation that separates keyboard correctness from screen-reader compatibility.

No target editor repository, toolkit, API name, or caller list is identified in this brief or the input map. I therefore inspected two public, editor-like command systems as analogues (VS Code and Obsidian), along with their primary docs/tests and accessibility standards. Those repositories are not the target product. No claim below says they are. Product-specific code, callers, and current tests remain unknown until the owner names or supplies them.

## Useful models and source observations

### A command palette as a distinct, keyboard-first surface

VS Code documents Ctrl+Shift+P for Windows/Linux as its command palette entry point, with command names filtered as the user types and keyboard shortcuts shown on result rows [S17, S18]. In the pinned VS Code 1.137.0 code snapshot, Show All Commands also has F1 as a secondary binding. That is a useful discoverability precedent, not a binding recommendation: the target editor must check its existing keymap and preserve all ordinary typing and editing shortcuts [S08].

The VS Code provider collects editor and global command picks, waits once for extension registration or 800 ms, and then produces commands. It gets global actions through a context-scoped command-palette menu, filters out disabled actions, and prefixes labels with category text when present [S08]. This is a real implementation trade-off: hiding disabled actions keeps a palette concise, but it cannot tell a user why a relevant command is unavailable. It also does not satisfy the brief as written. The inspected provider has an initial extension-registration wait; I found no explicit live add/remove subscription in that provider. That observation is not proof of behavior in lower layers or proof that all live updates fail.

The quick-input command model keeps a stable command ID, an optional context condition, alias, description, and category. The search path checks contiguous-substring/word matches in names and aliases, exact ID matches, and a TF-IDF related-result fallback for queries of at least three characters. It disambiguates duplicate labels by surfacing IDs, sorts previously used results ahead of alphabetical results, and attaches keybinding text to the row's accessibility label. The handler executes from the pick's accept callback. This yields useful parts to reuse (IDs, aliases, category, shortcut, explicit accept), but a technical ID is not necessarily an intelligible scope and a tooltip is not a dependable explanation of unavailability [S09].

### Extension command registration and availability

Obsidian's published API types provide a writing-oriented comparison. A command carries a unique ID and human-friendly name; checkCallback can test whether it can run, and false/undefined hides it from the palette. editorCallback restricts a command to an editor and supplies the editor/view context. This shows a simple pattern for context-gated commands, but it also hides unavailable commands and defines no user-facing unavailability reason [S14, S15]. The API asks plugin authors for a command callback, which is command behavior; it does not require a plugin to draw custom chooser UI.

VS Code's command system likewise separates the command registration/handler from the palette's display. Its observed palette path uses declarative action metadata from a menu service rather than asking each extension to draw a chooser row [S08]. For the target, a built-in renderer plus a small command descriptor is a feasible boundary: stable ID, localized name, scope/category, aliases, shortcut lookup, availability state, short reason, and the registered command handler. An extension should contribute metadata through the host API/manifest and its operation handler through the normal command API; the chooser itself should own presentation and keyboard behavior. A short declarative reason or reason key is distinct from supplying executable UI.

Availability needs two different policies. A command that is relevant but temporarily unavailable (for example, requires a text selection) should remain findable and expose an explicit disabled state and reason. Commands irrelevant to the current product context can be hidden to control noise, but that policy needs an owner decision and must not turn a selection requirement into a silent disappearance. Recompute availability on state changes and recheck immediately before invocation; a stale highlighted row must never run after its extension is removed or its required selection disappears.

### Interaction patterns and trade-offs

| Candidate | Advantages | Costs and fit |
| --- | --- | --- |
| Search dialog with input and single-action result list | Clear entry point, dedicated search focus, space for name/shortcut/scope/reason, and a natural keyboard route for many commands. A true modal dialog can return focus to the invoker on Escape. | Requires correct focus containment, dismissal, editor-state capture/restore, and a screen-reader representation. Mark it modal only if all users are prevented from interacting outside it. |
| Editable combobox with list popup and manual selection | Familiar search-as-you-type interaction; APG manual-selection behavior keeps typed text as the input value until the user accepts an option. Escape can dismiss the popup without accepting it. | Arrow/Enter/Escape behavior competes with text editing; metadata-rich results can be difficult to represent; listbox options are not a place for nested interactive controls. Validate rather than assume the semantic mapping. |
| Hierarchical menu with categories and access keys | Uses expected menu navigation and can present shortcuts. | Poor fit for typo-tolerant search and a large extension-driven catalog; hierarchy/menus can add repeated navigation. |
| Always-visible command list plus separate search box | Simple structure and explicit content. | Consumes editor space and moves the feature toward an editor redesign. Not justified by the brief. |

WAI-ARIA APG is guidance for web widgets, not a guarantee for native Windows/Linux toolkits. It supports manual selection, describes Escape and arrow navigation, and emphasizes that choice/acceptance and focus/highlight are not always the same state [S01, S03]. Its modal-dialog pattern says focus starts inside, Escape closes, and focus returns to the invoker when it still exists; it also warns against claiming modality if outside content remains operable [S02]. These support a testable dialog/list interaction, not a universal requirement to use ARIA roles in a native toolkit.

For a single-action command row, keep the accessible item name concise. The listbox guidance warns that long option names are spoken as one unit and that nested interactive elements inside options are not accessible through the listbox model [S03]. A row can expose the command name as its identity and expose shortcut, scope, disabled state, and short reason as structured, perceivable detail. If the design adds row-level buttons, compare a grid or separate controls instead of pretending the row remains a simple listbox option.

## Search alternatives

1. **Normalized exact/prefix/substring and word-boundary matching.** Predictable and fast, with clear highlights. It fails when one character is mistyped. Add case-folding and Unicode normalization, then test diacritic-insensitive matching separately from spelling tolerance.
2. **Fuzzy/typo-tolerant scoring.** An edit-distance/Bitap-style search can find a misspelled name, but permissive thresholds create false positives and location-sensitive defaults may miss matches later in a command description. Fuse.js documents threshold, location, and distance as coupled controls and gives a concrete example of a default location-window miss [S16]. Tune against a real command inventory and rank exact, prefix, word, then fuzzy matches rather than putting fuzzy-only results ahead of clear matches.
3. **Semantic/related-result fallback.** VS Code's inspected command provider has a TF-IDF related-results path behind the ordinary name/alias matches [S09]. This may surface a command with different wording, but adds ranking opacity and is more than the brief requires. Treat it as optional, not a dependency or assumed winner.
4. **History/recent-use ranking.** The reference code gives recent commands priority [S09]. It can reduce keystrokes but may make results move after use and can bury lexical matches. Keep ranking deterministic within a query and make any history effect explicit/testable.

The minimum useful search fields are command name, aliases, and scope/category; shortcuts may be indexed but should remain visible as metadata. Stable IDs are valuable for exact query support and invocation but should not replace user-facing distinctions. Compare misspelling recovery and false-match rate with realistic English and localized labels, including commands with duplicate names.

## Scope, row text, and status

Rows need a human-readable distinction such as “Document” / “Selection” / “Application” plus extension/vendor name if relevant. The code reference disambiguates duplicates with command IDs, which demonstrates collision detection but not user-friendly scope [S09]. A visible shortcut is helpful, as both the VS Code docs and code show [S08, S17, S18]. Availability must be indicated by text/state as well as any color or icon, consistent with Windows guidance against color-only meaning and its requirement that controls expose names, properties, and events [S05].

For result counts and registry changes, use a concise, polite status update only when the result settles or meaningful catalog membership changes. The typed value and focused result already provide feedback; do not fire an assertive interrupt for each character, and avoid duplicating a screen reader's normal focus announcement. WCAG's status-message guidance specifically frames the need as informing users without moving focus and without unnecessary interruption [S04]. The exact debounce/announcement policy is a design parameter for AT testing; the research does not establish a universal millisecond value.

## Integration shape to investigate

A small integration boundary can be evaluated after the plan is released:

1. **Command registry adapter:** merge built-in editing/navigation actions and extension actions into one stable descriptor shape. Give commands unique IDs, localized names, aliases, category/scope, shortcut resolution, and runtime availability/reason. Keep executable handler behavior in the existing command system; do not permit extensions to supply chooser UI.
2. **Chooser controller:** open on a documented, non-conflicting keyboard binding and optional existing menu route; capture current editor/view, caret/selection, and enough state to restore the editing position. Search starts in the input. Arrows change highlight; Enter explicitly accepts; Escape dismisses without executing and restores the snapshot. Tab behavior should be deliberate and documented.
3. **Search/index service:** use deterministic exact/prefix/word/substring ranking first, plus a measured typo-tolerant fallback. Retain IDs so updates preserve selection. Do not silently rewrite query text.
4. **Live registry and context updates:** subscribe to add/remove and relevant availability changes. Recompute results with cancellation/generation guards; preserve the active result by ID when it remains, otherwise keep focus in the input and move to a predictable remaining result. Recheck availability at accept time; report the reason instead of invoking stale/unavailable commands.
5. **Renderer/accessibility adapter:** render visible name, shortcut, scope and disabled reason without color-only coding; expose equivalent accessible name/state/detail in platform semantics. Keep live announcements concise and polite, and do not announce every keystroke as an interruption.
6. **Tests:** keep unit tests for normalization/ranking and registry state separate from controller keyboard tests and real screen-reader checks. Use real AT and OS/toolkit combinations after implementing, since UI Automation/AT-SPI semantics do not guarantee a usable experience by themselves [S05-S07].

The VS Code quick-access tests are useful patterns: they verify conditional provider visibility, cancellation/disposal when a new provider replaces an old one, and restoration of the active editor/selection after transient editors [S10]. They are not screen-reader tests and do not test a command chooser's dynamic plugin lifecycle. The target should add distinct tests for those cases rather than treating generic quick-access tests as coverage.

## Issue and release history

A VS Code issue reported that “Chat: Learn How to Hide AI Features” was missing from the palette because its precondition excluded users who had already completed chat setup. The fix removed that restrictive precondition so the action appeared in more situations; it merged as PR #268462 and is listed in VS Code 1.106 release notes [S11-S13]. This history shows a real discoverability failure caused by visibility gating. It supports separating “irrelevant/hidden” from “relevant but unavailable with a reason”; it does not by itself decide which target-editor commands belong in each state.

## Validation candidates, not executed checks

**Keyboard correctness (automatable plus manual keyboard-only runs):** open from the configured shortcut on Windows and Linux; confirm the existing shortcut map still resolves every pre-existing action; type, edit, select, clear, move results, Home/End, Enter, Escape, and Tab according to the written model; prove highlight never invokes; prove Escape restores active document, caret/selection, and relevant scroll/view state; test unavailable-with-reason, identical labels with different scopes, no-results, and extension add/remove while the chooser is open; test that a command becoming unavailable or removed cannot be invoked; include IME composition and non-US keyboard layouts.

**Screen-reader compatibility (manual AT runs, reported separately from the keyboard suite):** on supported Windows configurations, inspect the exposed control hierarchy/properties with a UIA inspection tool and run NVDA plus Narrator (JAWS where available); on Linux, inspect AT-SPI and run Orca. Check the chooser's name/role, initial focus, command name, keybinding, scope, disabled state/reason, result count/no-results feedback, catalog update announcements, focus stability, Escape restoration, and spoken behavior while typing quickly. Repeat relevant cases with high contrast and keyboard-only input, but treat visual focus/contrast checks as their own observations. VS Code itself lists NVDA, JAWS, and Orca among tested screen readers; that is a useful test precedent, not evidence the proposed target will work with them [S18].

**Not executed:** no target repository code, target caller/tests, build, GUI, keyboard run, screen-reader run, timing measurement, or accessibility API inspection was performed. Findings are research and test proposals only.
