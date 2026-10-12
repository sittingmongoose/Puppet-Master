# Accessible command selection in a desktop editor

**Run:** B02-P01-treatment  
**Stage:** critic/finalizer  
**Status:** research-backed software proposal; no implementation or deployment  
**Released plan:** `revealed-plan.md`, SHA-256 `5f7209870cdd7e5062b0c571bad89728eb5563c319118e78d65763d1127185b0`  
**Evidence:** [source index](sources/index.md), [source map](source-map.json).

## 1. Recommendation and scope

Build a host-owned, keyboard-operable chooser over the editor’s existing command boundary. Include built-in editing/navigation actions and extension-provided commands. No target editor, repository, toolkit, registry, callers, tests, keymap or supported reader matrix was supplied; VS Code and CKEditor 5 are comparison references only.

Extensions may contribute declarative command metadata and command logic, but not executable chooser UI. The host owns presentation, accessibility text, focus, search, availability and invocation. Each command needs a stable owner-namespaced ID, localized display name, aliases, owner/scope, current shortcut metadata, handler reference, live availability, and concise unavailable reason. Labels are not identity.

Keep unavailable commands discoverable and show their reason in text as well as the target’s programmatic state; color may reinforce but cannot be the only cue. Recompute selection-dependent state when context changes.

Opening, typing, filtering, sorting, highlighting, moving through results, hover and refresh must never invoke a command. A row is an active candidate until explicit Enter. On Enter, resolve the stable ID and live handler again, recheck current availability/context, then invoke at most once. If removed or newly unavailable, do not call stale code; present the current reason.

Capture editor/view/document identity and the caret/selection before moving focus. Escape dismisses without invoking and restores that position when it still exists. If the document/view closed, focus a documented logical target in the surviving workspace. The snapshot is for return focus, not stale command execution.

## 2. Small target integration plan

1. Inspect the actual command registry, extension registration/unregistration callers, selection-state updates, current keybindings, focus restoration, relevant tests and supported toolkits.
2. Confirm or add the smallest host-owned registry event for extension add/remove and availability changes. Keep extension command logic behind the existing host boundary; do not expose chooser UI code.
3. Add/derive stable descriptors: ID, localized label, aliases, owner/scope, shortcut(s), handler, enabled state and reason.
4. Add the chooser using an existing host surface only if its focus, unavailable-state, dynamic-update and screen-reader behavior pass. Subscribe while open; keep the query; refresh immediately; preserve active ID while it exists; otherwise move focus logically and coalesce one update.
5. Keep chooser activation separate from existing editing shortcuts. Re-resolve command and state at Enter.

Provide a keyboard menu route. Add a direct modifier chord only after the target keybinding inventory confirms it does not shadow typing, existing editor shortcuts, OS or reader commands; allow remapping where supported. No universal chord is assumed.

## 3. Interaction and announcement behavior

### Surface choice

| Surface | Benefit | Cost/decision |
| --- | --- | --- |
| Host-owned modal dialog/picker | Clear task boundary; supports focus-in, Escape and return to editor. | Tab containment, exit, accessible name and restoration must work in target toolkit. Modal behavior alone does not solve result semantics. |
| Non-modal host quick picker | May reuse existing editor command/search infrastructure. | Verify how it dismisses, returns focus, exposes unavailable reasons and handles registry changes. Familiarity is not accessibility evidence. |
| Reuse an existing host picker | Can reduce integration size if it already meets the requirements. | Inspect exact behavior and test it on actual supported screen readers first. VS Code is not the unnamed target. |

### Focus ownership

| Model | Benefit | Risk/conditional choice |
| --- | --- | --- |
| Search field retains keyboard focus; toolkit exposes a separate active result | One predictable typing location and few Tab stops. | Active-row changes may interrupt speech. Use only if shipped Windows/Linux paths expose name, scope, shortcut and unavailable reason reliably. A web active-descendant pattern is not assumed to exist in a native toolkit. |
| Actual keyboard focus moves through result controls | May be easier for some toolkits/readers to report. | Requires a clear return-to-search path; removal must not strand focus; many rows may add navigation cost. |

The surface and focus choices are independent. Compare both focus models in the target rather than assigning a generic role and assuming it exposes every description.

Filtering may update visible rows while typing, but do not expose each intermediate candidate as a separate interruption. Once the query settles, issue one coalesced current announcement containing result count and the current top candidate’s name/scope, shortcut and unavailable reason when present; announce no results when empty. Discard stale updates if the query or registry changes again. When the user navigates with the keyboard, announce the active row and relevant state once per deliberate move. Keep visual focus visible. No stage of filtering, highlight or refresh invokes a command.

The announcement channel and timing depend on the target toolkit/AT. This is a testable behavior requirement, not a promise that an accessibility API can force identical speech on every platform.

## 4. Released-plan dispositions

| Clause | Disposition | Resolution |
| --- | --- | --- |
| P1.1 Stable IDs, localized labels, scopes, shortcuts, availability callback | **Accept with refinement** | Use stable owner-namespaced IDs; label is display/search metadata. Include scope, applicable shortcut, live state and reason; recheck context at invocation. |
| P1.2 Extensions contribute descriptors through host boundary, not UI code | **Accept; verify target** | Host owns chooser UI; extensions supply metadata and command logic. Inspect actual registration lifecycle. |
| P1.3 Capture selection and focus destination | **Accept with explicit snapshot** | Capture editor/view/document and caret/selection; restore only if valid, otherwise use a documented logical fallback. |
| P1.4 Escape closes | **Accept** | Dismiss without invocation and restore prior editing context where possible; ensure keyboard users can exit. |
| P1.5 Enter invokes selected command after recheck | **Accept; clarify active state** | Treat the row as active candidate until Enter; resolve current handler/state and invoke once only if still available. |
| P1.6 Existing shortcuts remain registered | **Accept with conflict review** | Preserve all existing bindings; menu route plus optional conflict-reviewed/remappable modifier chord. |
| P2.1 Lowercase labels and simple edit-distance threshold | **Revise** | Rank exact/prefix/word-start, then substring/subsequence, curated aliases, then narrow typo fallback. Set locale/token rules and test false positives. |
| P2.2 Show shortcut text and scope | **Accept with accessible text** | Show current applicable shortcut and scope as text and expose them through the chosen accessibility path. Owner decides multiple/contextual binding presentation. |
| P2.3 Visually disambiguate duplicate labels by scope | **Partly accept** | Show scope visibly and accessibly; add owner/extension when scope also collides. Color alone is insufficient. |
| P2.4 Keep unavailable commands with reason | **Accept and strengthen** | Keep discoverable, expose state and reason, and prohibit activation. Match chosen widget semantics; do not assume menu rules fit a listbox/combobox. |
| P2.5 Keep removed extension row until next query | **Reject** | Refresh on registry change even if query is unchanged; preserve query and active ID only while it exists; remove stale handlers and re-resolve at Enter. |
| P2.6 Generic accessibility role exposes all descriptions | **Reject as assumption** | Select semantics matching actual behavior and target UIA/AT-SPI mapping. Role/tree presence alone does not prove useful announcements. |
| P3.1 Keep search focus while arrows move result | **Conditional option** | Compare with actual row focus; use only if supported readers report active result and details reliably. |
| P3.2 One delayed count announcement | **Accept coalescing goal; amend** | Coalesce settled count plus candidate/no-results; suppress per-character active-row interruptions; announce on deliberate row navigation and verify in real readers. |
| P3.3 Active-item speech and close-document focus unresolved | **Keep platform choice open; specify facts** | Expose name, scope/owner, shortcut, unavailable state/reason; choose surviving logical focus target if document closes. |
| P3.4 Research Windows and Linux separately | **Accept** | Treat Windows UIA and Linux AT-SPI as distinct and test supported shipped combinations separately. |
| P3.5 Validate cancellation, registry changes, duplicates, typos, rejection and SR navigation | **Accept and split** | Use separate keyboard/command and screen-reader validation in §7. |
| P3.6 No toolkit experiment or user session run | **Accept as executed status** | Still true; no implementation, AT tree, manual reader, user, or conformance test was run. |
| P3.7 Compare focus models and ranking | **Accept** | Alternatives are compared in §§3 and 5; implementation choice remains conditional. |
| P4 Provisional, source-based review, keep unanswered owner questions | **Accept** | Proposal only; unresolved target choices remain explicit in §9. |
| P5 Work under maximum; no minimum or waiting credit | **Accept** | Completed within available stage time; no minimum duration assumed. |
| P6 No deployment requested | **Accept** | No deployment or external product change proposed. |

## 5. Search alternatives

| Method | Strength | Limitation and proposed use |
| --- | --- | --- |
| Exact, prefix, word-start | Predictable for correct names and word beginnings. | Highest-confidence tier; does not repair typos. |
| Substring/subsequence fuzzy | Finds shortened names and character gaps. | “Fuzzy” does not itself correct spelling; deterministic second tier with stable ties. |
| Curated aliases | Supports alternate terms, abbreviations and extension vocabulary. | Requires localization and maintenance; map to same stable ID, below canonical-name matches. |
| Bounded typo fallback | Can recover an omission, substitution or adjacent transposition. | False positives, especially short/generic terms; last tier only. Initial test policy: Damerau-Levenshtein distance at most one for tokens of four or more characters. |

Normalize case and whitespace consistently; choose Unicode, accent and punctuation behavior with the target language policy while preserving displayed labels. The four-character threshold leaves 1–3 character typos to aliases or other match tiers; test these cases separately. Keep matching local and deterministic. Search names/aliases by default; shortcut/scope search is optional, though their display is required. Do not search hidden executable code or add remote/semantic search without a new requirement.

## 6. Command and lifecycle details

- A command requiring selected text stays listed with a reason such as “Select text first.” Recompute it when selection/context changes.
- Duplicate labels remain distinct by ID. Show scope; if that also collides, show owner/extension.
- Display the current effective shortcut for platform, layout and context. If several bindings apply, use a concise multiple-bindings cue with a documented way to inspect them.
- On extension add/remove, preserve query and refresh. Keep the active stable ID while present; if it disappears, move focus to a logical neighbor or search field and coalesce one update.
- At Enter, resolve current ID/handler/enabled state/context. Removed or unavailable commands make zero handler calls and expose a current reason.

## 7. Proposed validation — not run

### Keyboard and command correctness

- Open by keyboard through the menu route and any approved binding. Verify existing shortcuts continue to work and printable typing keys do not open the chooser.
- Check initial focus, visible focus, query editing, Escape, Tab/Shift+Tab exits and restoration of caret/selection.
- Confirm open, typing, filtering, ranking, hover, active-row movement and refresh never invoke a handler. Enter on an enabled command invokes exactly once; on unavailable/removed commands, zero times.
- Change selection/read-only/context between display and Enter and verify current state and reason.
- Add/remove extensions while open, including removal of the active row; check query preservation, focus movement, no stale handler and one coalesced update.
- Test duplicate labels across scopes/owners, platform layouts, contextual and multiple shortcuts.
- Measure match recall and false positives for exact, prefix, word-start, subsequence, aliases and typo fallback, including 1–3 character names, transpositions, generic terms, ambiguity and no results.

### Screen-reader compatibility, separate from keyboard automation

- Test each supported Windows build with NVDA and any other supported reader; test each supported Linux desktop/toolkit with Orca and any other supported reader. Record OS, runtime, toolkit and reader versions separately.
- Verify chooser/search names and instructions; count; active name, scope and shortcut; unavailable state/reason; focus visibility and return location through both tree inspection and speech/braille.
- Type a rapid multi-character query. Confirm no per-character active-row interruption; after settling, confirm one current count plus candidate/no-results. Navigate results and confirm one useful announcement per deliberate move.
- Add/remove extensions while open; check there is no stale row, handler, count, reason or announcement. Dismiss and confirm return focus or the stated fallback.
- Repeat after relevant toolkit/runtime changes. Automated keyboard success or a visible accessibility tree alone does not establish a usable spoken interaction.

## 8. Evidence and executed status

WCAG 2.2 is a dated W3C Recommendation with relevant web criteria for keyboard operation, traps, character-key shortcuts, focus, names/states, color and status messages. WCAG2ICT is an informative Group Note for non-web interpretation, not a non-web standard or guarantee. WAI-ARIA/APG describes web patterns: for example, combobox Enter normally accepts a value, not an editor command. Adapt and test patterns in the target.

Windows UI Automation documents providers, elements and control patterns. GNOME describes AT-SPI as the application-to-AT route; Orca works with applications/toolkits that support it. Neither API proves that the target’s screen reader speaks each row usefully.

The pinned VS Code Quick Input source distinguishes fuzzy from contiguous label matching and has separate description/detail flags. Its command provider waits for extension registration or 800 ms once and filters disabled menu actions; it therefore does not satisfy this brief’s unavailable-reason requirement and does not prove live add/remove behavior. Its Quick Input tests exercise control state/scroll, not screen-reader speech. A bounded VS Code issue records a build-specific Windows/NVDA focus regression and later Insiders verification; it is not target evidence. CKEditor 5 demonstrates observable command state separate from UI but does not specify this chooser. The indexed refresh PR was checked and found mismatched; it is excluded as evidence.

**Executed:** full package and plan review, plan-reveal hash check, independent primary-source/comparator code and history review, critique and final proposal.

**Not executed:** target repository/caller/test inspection was impossible; no implementation, keyboard test, UIA/AT-SPI tree inspection, NVDA/Orca session, user research or conformance evaluation was run.

## 9. Owner decisions before implementation

1. Target editor/repository, command sources, registry and extension lifecycle/caller contracts.
2. Editor/document/selection/extension scopes and concise reason for each unavailable command.
3. Menu route and optional shortcut after current keymap, OS and screen-reader conflicts are inventoried.
4. Supported Windows/Linux builds, toolkits, distributions and reader versions.
5. Focus model/surface that passes on those combinations and valid fallback if the original document closes.
6. Alias, locale-normalization and typo thresholds that fit the real command corpus.
7. Whether shortcuts/scope should also be searchable, beyond being displayed.

Until then, these remain conditional proposal decisions, not claims about the unnamed target.
