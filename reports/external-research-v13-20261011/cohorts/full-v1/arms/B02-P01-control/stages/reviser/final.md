# Final proposal: accessible command selection in a desktop editor

**Run / stage:** B02-P01-control / reviser  
**Released plan:** revealed 2026-10-12T00:47:50.611Z; SHA-256 5f7209870cdd7e5062b0c571bad89728eb5563c319118e78d65763d1127185b0  
**Evidence index:** [sources/index.md](sources/index.md); stable source IDs S01–S18 and identity records are in [source-map.json](source-map.json).

## Proposal

Add a host-rendered, keyboard-first command chooser over the editor’s existing command system. Keep command behavior and extension handlers in that system. The chooser should use stable command identifiers and host-owned presentation; extensions may contribute declarative metadata and normal command handlers, but must not supply chooser UI or executable presentation code.

A descriptor should provide a stable ID, localized name, aliases, user-facing scope or category, shortcut lookup when available, current availability, a concise reason for relevant unavailability, and a reference to the existing handler. The host should evaluate availability through a cheap, side-effect-free check or cached context state. Do not execute availability callbacks while typing; recheck the current registry entry and its state immediately before accepting it. Whether an extension must provide an optional localized reason or the host can provide a generic fallback is an owner decision.

Keep relevant commands discoverable while unavailable. For example, an edit action requiring selected text should remain searchable with a textual unavailable state and a short selection-required reason. Hide only commands that an explicit owner-defined rule says are irrelevant in the current product context. A color or icon may reinforce state but must not carry its only indication. Same-name commands need visible and accessible distinctions such as Document, Selection, Application, or extension/provider name; do not rely on an opaque internal ID alone.

Search should rank deterministic exact, prefix, word, and substring matches before a bounded typo-tolerant tier. Search localized names, aliases, scope/category, and stable IDs. Preserve the user’s query and displayed localized spelling while normalizing matching separately; test case folding, Unicode normalization, and diacritic-insensitive behavior as distinct choices. A shortcut can be indexed if the real command inventory supports it. Compare typo recovery and false matches on real and localized command names before selecting a threshold. Semantic or TF-IDF related results and history-based ranking are optional alternatives, not first-release dependencies.

When the extension registry changes while the chooser is open, update it promptly. Remove disposed commands, cancel obsolete work, and use a generation token or equivalent to ignore stale search/availability results. Keep focus in the search control if the active row disappears, with a predictable remaining row or no active row. Before Enter invokes anything, resolve the ID again and re-evaluate availability. If the command disappeared or became unavailable, do not invoke it; update the row and explain the reason without losing focus.

Opening the chooser should capture the active editor/view identity, caret or selection anchor and head, scroll position, and prior focus destination. Focus the search control on open. Escape dismisses without invoking and restores that state if the original destination still exists. If the document or view was closed, restore focus to a documented logical workbench destination without reopening stale content. Enter is the explicit acceptance action. Highlighting, focus, and selection must never invoke a command. Preserve ordinary editor shortcuts and command bindings independently; choose a chooser shortcut only after checking the Windows and Linux keymaps. A menu route may supplement keyboard entry but cannot replace it.

### Surface decision: keep the alternatives open until tested

The released plan did not identify the chooser container. The final design therefore compares three explicit candidates instead of assuming that “command chooser” determines its semantics.

| Candidate surface | Behavior and benefit | Cost and selection rule |
| --- | --- | --- |
| Editable combobox with a simple result popup | Search remains an editable value; the popup can expose one-action results. Manual selection preserves typed text until a result is chosen. | Define how arrows, Enter, Escape, Tab, and text-editing keys work. APG’s combobox guidance describes web widgets; it does not establish native toolkit behavior. Keep options concise and noninteractive. If result rows need nested buttons or links, compare a grid or another model instead of using listbox semantics [S01, S03]. |
| Transient nonmodal dialog/palette | A temporary host-owned surface can provide search plus richer result detail while leaving the workbench usable outside it. | Define what Tab does and where focus goes if users can interact outside the surface. Do not expose modal semantics while outside content remains operable. |
| Modal dialog/palette | A contained interaction can make the chooser the only active task and keep Tab within it. | Use only if outside content is actually blocked for every user. Focus must enter the dialog, Tab and Shift+Tab stay inside, Escape closes it, and focus returns to the invoker or a logical destination if that invoker disappeared [S02]. |

The first implementation comparison should exercise an editable input/list candidate and a transient dialog/palette candidate with the same command rows and actions. Decide between modal and nonmodal dialog behavior by observing whether outside interaction is genuinely blocked, not by appearance. Choose the platform semantics only after inspecting actual Windows UI Automation and Linux AT-SPI output and running the screen-reader sessions below. These web patterns guide the comparison; they do not require a particular native role or prove that a chosen role works.

For each viable surface, compare two focus models:

- **A — focus remains in search.** Arrow keys change the active result through the platform’s equivalent of active-descendant state. This keeps query editing close at hand. Prototype it, but accept it only if the active command name, scope, shortcut, availability and reason are reliably conveyed on both platforms.
- **B — focus moves into results.** Arrow keys move actual focus among options. This may announce the focused row more directly, but requires a clear route back to search and can interrupt typing.

Use whichever model works in real NVDA/Narrator and Orca sessions; use a platform-specific adapter if a single model does not work on both. Under either model, result highlight is never execution. APG’s web listbox guidance warns that option names are flat speech units, long names are harder to follow, and nested controls inside options are not operable through the listbox interaction model [S03].

### Search, status, and interaction alternatives

For ranking, compare: (1) exact/prefix/word/substring only, which is predictable but misses typos; (2) those tiers followed by bounded edit-distance or Bitap-style matching, which recovers mistakes but can produce false matches; and (3) optional TF-IDF or semantic related results, which can find differently worded commands but is less transparent and exceeds the minimum need. Keep exact lexical matches ahead of approximate results. Benchmark with the actual inventory, duplicate names, aliases, scopes and localized labels. Fuse’s documentation shows that threshold, location, and distance interact; its documented defaults can miss matches later in a long field, so do not adopt a library default without measurement [S16]. Recent-use ranking is also optional: it can shorten navigation but may move or bury lexical matches.

For result counts, no-results feedback, or a meaningful registry change, use one concise, cancellable, polite status update after the result settles. Cancel an outdated announcement when newer input supersedes it. Do not send an assertive interruption for every character or repeat the focused result unnecessarily. WCAG 2.2 SC 4.1.3 offers a useful rationale for non-focus status feedback and avoiding needless interruption, but its success criterion expressly applies to content implemented using markup languages. It is not a native desktop conformance claim and supplies no universal announcement delay [S04]. Tune content and timing during real assistive-technology sessions.

## Small integration plan

1. **Inspect the target seams before implementation.** Identify the actual command registry, built-in editing/navigation callers, extension registration and disposal events, shortcut resolver, editor/view snapshot API, accessibility adapter, and existing callers/tests. The target editor and its repository were not identified or supplied here, so no target seam or caller can be claimed as inspected.
2. **Add or adapt the command descriptor boundary.** Preserve stable IDs, existing handler ownership, extension registration, and disposal. Add localized name, aliases, scope/category, optional shortcut, availability state, and a concise reason. Prefer host-derived state; let extensions supply only optional plain-text reason metadata if owners approve it.
3. **Implement the chooser controller and host-owned renderer.** Capture editor state, open search, define navigation and Tab behavior for the selected surface, and make Enter the only invocation action. Escape restores state when possible. Keep the chooser’s keyboard binding separate from existing commands.
4. **Implement live registry and search behavior.** Subscribe to additions, removals, and relevant context changes; cancel stale work; preserve the active stable ID where possible; re-resolve ID and availability on acceptance. Benchmark deterministic tiers and a bounded typo fallback against real and localized commands.
5. **Pass independent release gates.** Report keyboard correctness and screen-reader compatibility separately. Keep product implementation, target tests, AT runs, and release as future work until those gates pass; none was performed in this research stage.

## Validation plan — proposed, not executed

**Keyboard/controller correctness, automated where possible and manual keyboard-only on Windows and Linux:** check that the chooser’s entry binding does not displace existing shortcuts; exercise typing, text editing, Home/End, arrows, result clearing, Enter, Escape, and the documented Tab route; prove highlighting never invokes; prove Enter invokes only the current live command; test unavailable reasons, no results, duplicate labels/scopes, extension addition/removal while open, cancellation of stale work, and disappearance or loss of selection between highlight and Enter. Verify restoration of editor/view, caret/selection, scroll and focus, plus the defined fallback after document closure. Include IME composition, non-US layouts, localized names, and high-contrast/color-independent status.

**Screen-reader compatibility, manual and reported as a separate evidence track:** inspect Windows UIA tree/properties/events and use NVDA and Narrator (JAWS where available); inspect Linux AT-SPI and use Orca. Check the chooser name and role, initial focus, current result name, scope, shortcut, disabled state and reason, result/no-result status, duplicate labels, dynamic registry changes, focus stability, Escape restoration, rapid typing, and whether status feedback interrupts or duplicates ordinary focus speech. Compare focus models A and B on each platform. A conforming or exposed API role is not itself a usability result.

**Not executed in this stage:** no target repository/caller/test inspection, build, implementation, GUI run, keyboard suite, screen-reader session, accessibility-tree inspection, command-inventory benchmark, or deployment. The work performed here was reading the assigned brief and stage artifacts and reviewing primary documentation and comparative public source records. Every validation above remains proposed.

## Owner decisions and external inputs

The unnamed target prevents this stage from inspecting target code, its callers/tests, toolkit, API, and keymap. Before implementation, provide the target repository and revision plus the relevant build/test path. Product owners must also decide: which commands are context-irrelevant versus relevant but unavailable; whether extension authors may supply a short localized reason or the host uses a generic fallback; the user-facing scope vocabulary; supported OS/toolkit/AT versions; the chooser shortcut after conflict review; whether shortcut text participates in search; acceptable typo false-match rates; the supported locale and command corpus; and the final surface/focus model after testing. These remain explicit unknowns, not inferred product facts.

## Disposition of the released plan

The complete exact released plan is preserved below. Each clause has an evidence-based disposition here. “Accept” means the requirement is retained in this proposal, not that it was implemented or validated.

| Clause | Disposition |
| --- | --- |
| Stable IDs, localized labels, scopes, optional shortcuts, availability callback | **Accept with refinement.** Use a reason-bearing, low-cost host availability evaluation; do not run an expensive or mutating callback on every keystroke. Stable IDs and callback patterns exist in comparative systems, not target evidence [S08–S09, S14]. |
| Extensions contribute descriptors at host boundary, not UI code | **Accept; target seam unknown.** Keep presentation and input host-owned; adapt the target registration boundary only after source inspection. |
| Opening captures selection and focus destination | **Accept and expand.** Also snapshot view identity and scroll. Restore only while that view exists. |
| Escape closes; Enter invokes only selected command after availability check | **Accept and specify.** Escape cancels; Enter is explicit acceptance after resolving ID and state again; stale/unavailable commands do not run. |
| Existing shortcuts remain registered independently | **Accept.** Audit conflicts for a new chooser binding; do not commandeer ordinary editing keys. |
| Lowercase labels plus simple edit-distance threshold | **Revise.** Compare lexical tiers before a bounded typo fallback; normalize Unicode/diacritics separately and tune only against real data [S16]. |
| Shortcut and scope beside results | **Accept and make scope human-readable and accessible.** |
| Duplicate labels visually disambiguated by scope; disabled commands show a reason | **Accept and extend to AT.** Include accessible scope/owner detail and textual unavailable state; keep spoken output concise [S03, S05–S07]. |
| Retaining a removed extension row until next query is safe | **Reject.** Remove on disposal, cancel stale work, and re-resolve before invocation. The analogues do not establish safety of stale rows [S08, S14]. |
| A generic accessibility role exposes all descriptions | **Reject as an assumption.** Surface and control semantics must fit behavior and pass actual UIA/AT-SPI and AT checks [S01–S07]. |
| Search focus remains while arrows move active result | **Retain as candidate A; compare with B.** Use A only when active-result details are reliably conveyed; otherwise use B or an adapter. |
| A single delayed result-count announcement reduces chatter | **Accept with qualification.** Use cancellable polite status feedback; timing is empirical. WCAG’s criterion is web-content scoped and does not specify a delay [S04]. |
| Active-item changes, unavailable reasons, shortcut speech unresolved | **Resolve as acceptance criteria.** Verify those details and rapid-typing behavior in the separate AT track. |
| Focus restoration after document closure; Windows and Linux researched separately | **Accept.** Use a logical fallback and independent UIA/AT-SPI checks. |
| Validation covers cancellation, dynamic registry, duplicates, mistyping, rejected invocation and screen-reader navigation | **Accept and separate evidence tracks.** All such checks remain proposed. |
| No toolkit experiment or user session has run | **Preserve accurately.** None was run here. |
| Compare focus models and ranking before settling interaction | **Fulfilled and expanded.** This proposal also compares editable combobox/list, nonmodal palette, and modal palette surfaces. No surface winner is assumed. |
| Provisional draft, not an endorsement | **Preserve.** This is a research proposal, not implementation or deployment approval. |
| Resolve assumptions with primary evidence; retain unanswered user data | **Fulfilled where evidence exists.** Target API, keymap, scope taxonomy, command corpus, and reason contract remain owner inputs. |
| No future deployment requested | **Preserve.** No deployment is proposed or performed. |
| Complete within the maximum elapsed allowance; finish early when ready; no minimum or credit for waiting | **Followed.** Work was completed within the assignment deadline without waiting to consume the allowance. |
| Deadline includes setup, queueing, tools, retries, handoffs, revision and delivery; output quality is independent of duration | **Followed.** No elapsed-time claim substitutes for scope or evidence. |

## Exact original brief

> An existing technical writing editor needs a searchable command chooser for users who cannot reliably use a mouse. Commands include editing actions, document navigation and extension-provided actions. Some commands are unavailable until text is selected; others have the same display label but act in different scopes. Research the component's interaction, command registry and search behavior rather than redesigning the whole editor.
>
> Users must open the chooser from the keyboard, understand an unavailable command's reason, and return to their previous editing position when they dismiss it. Search should tolerate a mistyped query and expose command names, shortcut information and scope without announcing every keystroke as a separate interruption. Extension commands can be added or removed while the chooser is open. Assume Windows and Linux desktop use, including screen readers, but do not assume a particular UI toolkit. Do not steal ordinary typing shortcuts, invoke a command merely because it is highlighted, make color the sole indication of availability, or require extensions to supply executable UI code. Existing shortcuts must continue to work. Propose a small integration plan, a comparison of relevant interaction and search alternatives, and validation that separates keyboard correctness from screen-reader compatibility. We need documented trade-offs, not a claim that one accessibility API guarantees a usable interaction on all platforms.
>
> Produce a research-backed software proposal, not an implementation. Explore relevant primary documentation, repository code, callers/tests, and issue-to-fix or release history where consequential. Distinguish proposed validation from checks actually executed. The exact draft plan is withheld during brief-only discovery and released once at the declared comparison point.
>
> Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.

## Exact released plan

> The draft adds a registry of stable command identifiers, localized labels, scopes, optional shortcuts and an availability callback. Extensions contribute descriptors through the existing host registration boundary, not UI code. Opening the chooser captures the editor's current selection and focus destination. Escape closes it; Enter invokes only the selected command after checking availability again. Existing shortcuts remain registered independently.
>
> Search initially lowercases labels and uses a simple edit-distance threshold. Shortcut text and scope appear beside results. Duplicate labels are disambiguated visually by scope, and disabled commands stay in the list with an explanatory reason. The plan assumes that retaining list items after extension removal is safe until the next query and that a generic accessibility role can expose all descriptions; those assumptions need checking against host lifecycle and platform semantics.
>
> The proposed keyboard model keeps focus in the search input while arrow keys move an active result. A single delayed result-count announcement is intended to reduce chatter. The draft has not decided how active-item changes, unavailable reasons, and shortcut text reach assistive technology, nor whether focus restoration survives document closure. Windows and Linux support must be researched separately. Validation would cover cancellation, dynamic registry changes, duplicate labels, mistyping, rejected invocation and screen-reader navigation. No toolkit experiment or user session has been run. A recommendation should compare focus models and ranking approaches before settling interaction details.
>
> This is a provisional draft for review after the declared reveal, not an endorsed answer. Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources. No future product deployment is requested.
>
> Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.

## Source and inference boundaries

The reference systems are analogues only. The pinned VS Code 1.137.0 provider waits once for extension registration (up to 800 ms) and filters global actions to enabled menu actions; the quick-input model uses IDs, label/alias matching, ID matches, TF-IDF fallback, duplicate-ID text, and an accept handler. Its tests cover conditional providers, cancellation/disposal, and editor/selection restoration, not screen-reader behavior or this target’s live extension lifecycle [S08–S10]. A VS Code issue/PR/release trace records a useful command hidden by a restrictive setup precondition and a change broadening its visibility; it supports checking visibility rules, not a universal rule to show every command [S11–S13].

The Obsidian declarations are another comparator. The revisor reopened the immutable API snapshot at commit 9abd9605ce081383674aae1ed111c456edde0688 (package version 1.14.4): false/undefined check results hide a command from its palette, editor callbacks are scoped, and a plugin can manually remove dynamically registered commands [S14–S15]. This still does not describe live chooser updates or the unnamed target; the original source record’s earlier package 1.13.2 observation is retained separately in the source map.

The evidence supports design alternatives and test criteria, not a target implementation. Primary guidance, comparators, exact URLs, revisions, locators, access times, observed operations, conditions and applicability boundaries are recorded by stable source ID in [source-map.json](source-map.json). Revisor rechecks addressed C-01, C-03, and C-04 in the independent critique. Source identity was preserved; current Obsidian metadata was appended as a separately pinned reviser observation rather than silently replacing the earlier floating-branch record.
