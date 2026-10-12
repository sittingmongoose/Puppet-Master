# Independent critic: accessible command selection

**Run / stage:** B02-P01-control / critic  
**Review basis:** the exact brief, discovery, draft, source map/index, revealed plan, and plan-reveal record named in the critic input map. I also opened the listed primary references independently where noted in this stage's source map. No target-editor repository or caller/test paths were supplied.  
**Scope:** assessment only. This is not an endorsed implementation or a repaired final proposal.

## Overall assessment

The investigator package preserves the brief's accessibility, command-lifecycle, search, shortcut, and validation requirements. The draft distinguishes the unnamed target from VS Code and Obsidian analogues, and it separates proposed tests from work actually run. The enabled-only filtering and hidden-command patterns in those analogues are treated as counterexamples to the target's discoverability needs, not copied as requirements. I found no materially wrong technical claim among the consequential claims I checked.

One **material incomplete** point remains: the draft recommends a “command chooser” and offers a search dialog, hierarchical menu, and two focus models, but does not state whether the initial design is a modal dialog, a nonmodal dialog, or an editable combobox with a result popup. That choice determines focus containment, Tab/Escape behavior, how rows are represented, and whether modal semantics are truthful. The draft may keep this decision conditional; it should identify the actual candidate surfaces and the evidence that will select among them. WAI-ARIA APG is useful web guidance here, but its semantics do not establish a native Windows/Linux implementation [S01-S03].

Target-specific repository/caller/test inspection remains **honestly unresolved external input**. The brief asks for repository code, callers/tests, and history where consequential, while neither the brief nor the input map names a target repository. The investigator reports this limitation accurately and uses pinned comparative source and test material instead. Product owners must provide the target repository/ref and relevant test/build context before the target-code part can be completed; the current evidence cannot answer those questions.

A **minor locator/wording** clarification would help: WCAG 2.2's status-message explanation is scoped to content implemented using markup languages. It supports the general design goal of perceivable non-focus status feedback and avoiding unnecessary interruption, but it is not a native desktop conformance claim. The draft already disclaims a universal platform guarantee; keep that boundary beside the status-announcement recommendation [S04-S07].

## Findings

| ID / classification | Location and evidence | Assessment |
| --- | --- | --- |
| C-01 — **material incomplete** | Draft: “Recommendation” and “Alternatives compared”; discovery: “Interaction patterns.” Primary evidence: WAI-ARIA APG combobox, dialog, and listbox patterns [S01-S03]. | The final proposal explains input-focus versus result-focus, and compares a search dialog with a hierarchical menu. It does not explicitly compare an editable combobox/list popup against a dialog surface, nor name the container intended for its first prototype. A dialog's modal behavior has specific focus/containment and outside-interaction conditions; an editable combobox has a different composite keyboard model. This ambiguity affects keyboard correctness and the proposed accessibility contract. Keep the outcome conditional if product evidence is missing, but make the decision gate and tested candidate surfaces explicit. |
| C-02 — **honestly unresolved external input** | Brief: “Explore relevant primary documentation, repository code, callers/tests”; draft: “Small integration plan” item 1 and “Executed versus proposed.” | The target application is unnamed and no target source paths are in the input map. Public analogues are not target code. The draft discloses this and appropriately makes target seam inspection a pre-step. No target caller/test claim should be inferred from the analogues. |
| C-03 — **minor locator/wording** | Draft: first Recommendation section on status announcements; source-map S04-S07. | The status-message source is WCAG web-content guidance; its text says the criterion applies to markup-language content and explains that result-status messages can be communicated without focus and without needless interruption. This is sound design rationale, not proof of native desktop compliance or a specific debounce time. The draft correctly leaves timing for AT sessions. |
| C-04 — **minor locator/wording** | Investigator source-map S14; critic source-map records the mutable `master` URL and the critic's raw-file check. | The Obsidian API is a useful comparison for a false/undefined availability check hiding a command and for editor-scoped callbacks. Its checked URL is a floating branch; the exact commit was not pinned in the carried record. This does not undermine the recommendation because the draft labels Obsidian as comparative, but pin the API revision if the proposal is revised or used as a reproducibility artifact. |

**Material wrong:** none found in the independently checked consequential claims.  
**Unsupported:** none identified as a basis for the recommendation. The review does not treat inherited-only sources as newly verified evidence; see the critic source map.

## Brief and scope coverage

- **Keyboard entry, ordinary typing, and existing shortcuts:** preserved. Draft requires a conflict audit, an audited chooser binding, explicit acceptance, and independent shortcut registration. It does not pick a shortcut before target keymap inspection.
- **Unavailable commands and reason:** preserved and made more explicit. Relevant unavailable commands remain searchable; state and reason are textual and exposed to AT. Irrelevant-versus-unavailable visibility remains an owner decision.
- **Dismissal and editor state:** preserved and expanded to editor/view identity, caret/selection, and scroll state, with a logical fallback when the old destination has closed.
- **Search with mistyped queries:** preserved. Exact/prefix/word/substring ranking precedes a bounded approximate tier; thresholds remain contingent on the real command corpus and localization. Fuse.js's defaults support the warning that threshold/location/distance interact and should not be adopted blindly [S16].
- **Same-label commands and scope:** preserved. The draft asks for human-readable visible scope and an accessible distinction, not just an internal ID.
- **Extensions added or removed while open:** preserved. The draft rejects the stale-row assumption, removes disposed entries, cancels stale work, and resolves the ID plus availability again at accept time.
- **No extension-supplied executable UI:** preserved. Host-owned rendering and command handlers are kept separate.
- **Windows/Linux and assistive technology:** preserved as independent checks, including UIA inspection and Windows readers, AT-SPI/Orca on Linux, and keyboard correctness as a separate report. The draft explicitly rejects role selection as a usability guarantee.
- **Alternatives, small integration plan, and validation:** present. Search, focus, layout, and disabled-command alternatives are compared. The shell ambiguity in C-01 is the remaining gap.
- **No implementation/deployment:** preserved. Target builds, UI runs, AT sessions, benchmarks, and deployment are explicitly marked not executed.

## Audit of every released-plan disposition

The draft has a row for each released-plan statement. The following checks that none was silently lost or mistaken for target fact.

| Released-plan clause (short locator) | Critic result | Evidence / condition |
| --- | --- | --- |
| Stable IDs, labels, scopes, shortcuts, availability callback | **Accept with refinement.** | Add a user-readable scope and a reason-bearing state; avoid a costly or side-effecting per-keystroke callback. VS Code and Obsidian are analogues only [S08-S09, S14]. |
| Extension descriptors through host boundary, no UI code | **Accept; target seam unresolved.** | Host-owned chooser UI fits the brief. The actual registration/disposal API is unknown until target code is supplied. |
| Capture current selection/focus destination | **Accept; snapshot expansion is useful.** | Restore only if the saved view exists; fallback after closure is appropriate. The cited analogous test covers editor/selection restore, not scroll or AT behavior [S10]. |
| Escape closes; Enter invokes after availability check | **Accept.** | Highlight remains separate from invocation; re-resolve registry identity and availability at acceptance. |
| Existing shortcuts independent | **Accept.** | Conflict audit is needed before selecting the chooser binding; keeping existing routes satisfies the brief. |
| Lowercasing plus simple edit-distance threshold | **Revise, correctly.** | Fields, normalization, ranking, and false matches need measurement. Fuse defaults' location window demonstrates a concrete long-field edge case [S16]. |
| Shortcut and scope beside results | **Accept.** | Visible, accessible, localized scope is more informative than an opaque ID. |
| Duplicate labels disambiguated visually by scope | **Accept and extend to AT.** | Duplicate identity must survive in accessible output without an excessively long flat label; exact same-scope collisions need owner/category context. |
| Disabled commands with reason | **Accept for relevant unavailable commands.** | Textual state/reason fits the brief; visibility boundary and extension reason ownership remain explicit decisions. |
| Keep a removed extension row until next query | **Reject, correctly.** | Live removal and accept-time resolution prevent stale execution; generation/cancellation handling is sensible. |
| Generic role exposes all descriptions | **Reject as an assumption, correctly.** | UIA control types have associated requirements; AT-SPI is a separate Linux path; listbox option names are flat and do not support operating nested controls [S03, S05-S07]. |
| Search retains focus while arrows move active result | **Keep as candidate A; compare with B.** | A preserves text entry but must prove announcements in actual platform/AT sessions. B also needs a clearly documented route back to search. This is a conditional test plan, not an accessibility guarantee. |
| One delayed result-count announcement | **Accept with cancellable, polite policy.** | A settled result/no-results message can avoid per-keystroke chatter. No source supplies a native universal delay; timing stays an empirical choice [S04]. |
| Active item, unavailable reason, and shortcut speech unresolved | **Resolve as acceptance criteria.** | The draft specifies required content and separate AT runs. It should test rapid typing, duplicate names, and registry changes as proposed. |
| Document closure and separate Windows/Linux research | **Accept.** | Logical fallback and independent platform checks answer the plan concern without reopening stale content. |
| Validation covers cancellation, registry, duplicates, typos, rejected invocation, AT | **Accept and split.** | Keyboard/controller and manual AT evidence tracks are separate; all remain proposed rather than executed. |
| No toolkit experiment/user session | **Preserve accurately.** | The draft says no target GUI, keyboard, screen-reader, tree inspection, or benchmark ran. |
| Compare focus and ranking before settling interaction | **Largely fulfilled; see C-01.** | Focus and ranking alternatives are explicit. The chooser container itself remains undercompared/unnamed. |
| Provisional draft, not endorsement | **Preserve.** | The proposal is not an implementation or deployment approval. |
| Resolve assumptions by primary evidence; retain unresolved user data | **Accept with boundary.** | Standards and comparative code/history support general constraints. Target API, command inventory, scope taxonomy, reason contract, and supported AT matrix remain external decisions. |
| No future product deployment requested | **Preserve.** | No deployment is proposed or performed. |

## Discovery, sources, and validation quality

The discovery is useful and sufficiently skeptical about transfer. The pinned VS Code provider evidence supports the reported one-time extension-registration wait and enabled-action filtering; the quick-input model supports IDs, label/alias matching, ID matching, TF-IDF fallback, duplicate-ID descriptions, keybinding labels, and execution from an accept handler [S08-S09]. Those observations do not establish dynamic plugin removal behavior or native screen-reader behavior. The VS Code issue-to-PR-to-release chain supports the narrower lesson that a restrictive visibility condition can hide a useful command [S11-S13]. The Obsidian API check also confirms that its false/undefined condition hides commands, which is exactly why the draft does not adopt that policy for relevant unavailable actions [S14].

Primary standards/platform evidence is used with reasonable limits: APG patterns supply web-widget alternatives; Microsoft describes keyboard focus, color alternatives, and UIA control-type requirements; GNOME explains the toolkit-to-AT-SPI path to Orca; WCAG's status discussion does not define the target's timing. These sources support testable design constraints, not universal success [S01-S07]. The critic source map retains all source IDs and distinguishes independently reopened material from sources carried in the investigator package only. No raw capture was saved.

Validation is cleanly separated from completed research. The draft's keyboard suite, screen-reader runs, tree inspection, inventory benchmark, and build remain proposals. The actual work was document/source research and plan disposition review only. That distinction is accurate and materially important.

## Handoff

Keep C-01 visible as the unresolved surface decision and C-02 as a dependency on target-repository access. The remaining plan dispositions are well reasoned within the available brief and public evidence. This critique does not select a universal interaction pattern, reduce the requested scope, or authorize implementation.
