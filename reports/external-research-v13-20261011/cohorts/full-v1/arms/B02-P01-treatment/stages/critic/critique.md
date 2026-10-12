# Independent critique — B02-P01-treatment

**Stage:** critic/finalizer. **Released plan:** SHA-256 `5f7209870cdd7e5062b0c571bad89728eb5563c319118e78d65763d1127185b0`, recomputed from `revealed-plan.md` and matched `plan-reveal.json`. See this stage’s [source map](source-map.json) and [source index](sources/index.md).

## Scope and overall assessment

I read the assigned brief and the complete predecessor package: discovery, draft, source map, revealed plan, reveal receipt, and source index. I checked every released-plan clause. I independently reopened primary W3C/WAI guidance, Microsoft UI Automation documentation, GNOME/Orca documentation, the pinned VS Code Quick Input and command-provider source/tests, the VS Code NVDA issue, the VS Code Quick Pick API, and CKEditor command-state documentation.

The draft preserves the core brief and is sound as a proposal: it separates command state from UI, keeps disabled commands discoverable with reasons, prevents invocation on highlight, rechecks at Enter, covers extension mutation, offers search/focus alternatives, and distinguishes keyboard from screen-reader validation. The target editor, repository, toolkit, callers, tests, keymap and support matrix are not supplied. Comparator references cannot be presented as target evidence.

Two substantive changes are required: one indexed refresh PR is mismatched, and the draft delays result-count speech without specifying how active-row changes during typing avoid per-keystroke interruptions. The final withdraws the bad PR pointer as evidence and defines a coalesced settled-query announcement policy, still subject to real target AT validation.

## Findings

| ID | Classification | Locator and evidence | Final resolution |
| --- | --- | --- | --- |
| C-01 | **Material wrong** | `discovery.md`, command registry/history discussion; `source-map.json`, `S-VSCODE-REFRESH-PR`. The exact PR URL resolves to an unrelated Quick Bar change; its linked commit page identifies a merge of main into main, not a Quick Pick refresh patch. | Preserve the ID/URL but mark mismatched; do not cite or silently rebind it. Keep live refresh because the brief and plan require it, as a proposal based on host registry events. Final §§4 and 8. |
| C-02 | **Material incomplete** | `draft.md`, P3.2, proposed default, and SR validation. Coalescing only the result count does not prevent a changing active row from being announced on each typed character by a toolkit/AT. | Keep visible filtering responsive, but coalesce accessible output until query settles; announce one current count plus candidate/no-results, and announce rows on deliberate navigation. Test speech on the shipped combinations. Final §§3 and 7. |
| C-03 | **Minor locator/wording** | `source-map.json`, `S-VSCODE-QUICKINPUT-TESTS`. At the pinned source, keep-scroll tests are around 2475–2485; the selected-items replacement test begins at 2489. | Preserve source identity and add the corrected independent locator. The general point that picker tests are not AT tests remains true. Final §8 and source map. |
| C-04 | **Minor locator/wording** | `draft.md`, interaction comparison. Modal/non-modal surface, focus ownership, and picker reuse are separate design axes, not mutually exclusive focus models. | Separate surface and focus decisions. Final §5. |
| C-05 | **Minor locator/wording** | `draft.md`, search recommendation and validation. The typo fallback excludes tokens shorter than four characters; current checks do not explicitly test typos for 2–3 character command names. | State the boundary and add short-token typo/false-positive cases. Final §6 and §7. |
| C-06 | **Honestly unresolved external input** | Brief and input map provide no target repository, caller/test set, toolkit, keyboard map, or support matrix. | Do not infer target facts. Retain specific owner questions and label all proposed tests as not run. Final §§2, 8 and 9. |

No other material false correction was found in the plan mapping.

## Brief obligation audit

- Keyboard opening and shortcut preservation: addressed by a menu route and optional conflict-reviewed binding; actual keymap remains unknown.
- Unavailable commands: keep discoverable, expose state and text reason, and never rely on color alone.
- Dismissal: capture view/document/selection and restore if valid; define a fallback after closure.
- Search and display: compare typo-tolerant alternatives; expose name, current shortcut and scope; disambiguate duplicate labels accessibly.
- Chatter: the draft’s count-only delay is incomplete; final policy coalesces query output and tests active-row announcements.
- Extensions: host-owned UI and live registry updates are proposed; target lifecycle events are unknown.
- Windows/Linux and no toolkit assumption: kept distinct; standards/APG are guidance, not an API guarantee.
- Integration, trade-offs, keyboard tests vs SR validation: retained in the final.
- Research depth: primary docs, pinned comparator code/tests and consequential issue history were checked. Target callers/tests were unavailable and are not claimed as inspected.

## Executed versus proposed work

**Executed:** full package/brief review; plan digest verification; independent source checks; critique and final proposal creation.

**Not executed:** target source review, implementation, keyboard automation, UIA/AT-SPI tree inspection, NVDA/Orca session, user session, or conformance evaluation. Validation in the final is proposed only.
