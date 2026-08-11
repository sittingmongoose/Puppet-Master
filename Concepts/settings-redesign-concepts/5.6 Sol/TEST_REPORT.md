# 5.6 Sol — Settings Bakeoff Test Report

Test date: 2026-08-05  
Scope: `Concepts/settings-redesign-concepts/5.6 Sol/` only

## Result

The concept-owned state suite, exhaustive served-browser verifier, focused functional and motion flows, and model-folder validator pass. No critical or high functional, motion, accessibility, responsive, or packet-fidelity defect remains open in this concept folder.

The shared ConceptHub unit suite has one unrelated repository-catalog expectation failure. The assignment forbids changing ConceptHub or other concept folders, so the external failure is recorded exactly and was not repaired here.

## Automated evidence

| Check | Result | Witnessed coverage |
|---|---|---|
| Semantic state tests | **PASS — 17/17** | Normalized hierarchy integrity; all value/exposure states; twelve scenario invariants; structured search targets; dispatch scopes/focus consumption; presentation bindings; future-only account selection; refresh deduplication, last-known-good and quarantine; capability/model gates; all eleven roles; Memory versions, restore and Undo; Terminal drafts; spelling actions/exclusions; persistent receipts; four distinct ten-intent motion blueprints. |
| Exhaustive browser matrix | **PASS** | 7,680 core rendered states: 4 concepts × 8 themes × 6 widths × 4 shell combinations × 2 motion modes × 5 representative surfaces. |
| Scenario matrix | **PASS** | 2,304 states: 4 concepts × 12 scenarios × 3 widths × 2 shell extremes × 8 themes. |
| Focused theme/responsive audit | **PASS** | 32 focused theme states and 100 focused responsive/shell states, including Home, workspace, Provider, Memory, Terminal, and surrounding-shell geometry. |
| Functional flows | **PASS — 4/4 concepts** | Search/deep link/focus; exact Provider → Usage handoff and heading focus; setting focus retention; stable jump/scrollspy; all five spelling actions; seven Provider areas and keyboard-operable tabs; visibly staged last-known-good refresh; future-only accounts; model gates; Memory immutable-version verification; Terminal draft/apply/diagnostics; domain-complete supporting-manager details and actions; narrow drill-in and Back focus restoration; Index House's medium evidence drawer and squeezed inline inspector. |
| Motion/reduction flows | **PASS — 4/4 concepts** | 40 witnessed semantic motion moments: all ten intents in each concept, verified through actual WAAPI calls and participant roles. Coverage includes keyed save/reorder targets, drawer open/close, rapid reversal, cancellation, resize/manual-scroll interruption, no focus-consumption animation, reduced-motion geometry parity, and the single permitted 80–120 ms opacity cue. |
| Specialized resilience | **PASS** | Forced-colors state, 200%-zoom-equivalent reflow, RTL, 35% text expansion, four coarse-pointer concepts with 44 × 44 px hit targets, comparison synchronization, root/canvas overflow and visible-control geometry. |
| Console/runtime audit | **PASS** | No browser console errors or unhandled page errors in the final concept-owned browser run. |
| Final packet reconciliation | **PASS** | Independent read-only recheck found no remaining critical/high gap; it directly witnessed Index House's medium drawer, squeezed inline equivalent, and closure of the original high-risk functional paths. |
| Shared ConceptHub unit suite | **15/16** | One out-of-scope live-catalog-count expectation failure; exact evidence below. |
| ConceptHub model-folder validator | **PASS** | `Concept validation passed: Concepts/settings-redesign-concepts/5.6 Sol` |

The exhaustive verifier starts the shared ConceptHub on an OS-assigned loopback port, uses isolated temporary browser and output directories, writes no retained screenshots or traces, stops only the server it started, and removes its temporary root. The final exhaustive run used OS-assigned port `53613`.

## Browser and shell matrix

Widths: 760, 900, 1280, 1700, 2200, and 2500 px.  
Shell combinations: rail closed/Assistant closed; rail open/Assistant closed; rail closed/Assistant open; both open.  
Themes: Friendly Dark/Light, Glass Dark/Light, Retro Dark/Light, Basic Dark/Light.  
Motion: normal and reduced.  
Representative surfaces: Home, ordinary Settings workspace, Provider Models, Memory, and Terminal.

For every matrix state, the verifier asserts the applied theme/scenario/shell/motion state, correct surface identity, settled animation state, readable visible-control geometry, no global or Settings-canvas horizontal overflow, no clipped or split essential text, no overlapping controls, non-collapsed main geometry, and no console failure. Structural fingerprints and concept-owned QA markers guard against the four concepts collapsing into one shared skin.

## Manual visual and accessibility review

### Chromium

The live shared-Hub pages were visually inspected in the Codex in-app Chromium browser at 760, 1280, and 2500 px. Review covered all four Home compositions, workspace navigation and scroll position, Provider, Memory, Terminal, a supporting MCP manager, open/closed surrounding shell, the comparison workspace, RTL, 35% text expansion, narrow list/detail drill-in, and Back focus restoration. Focus, hierarchy, text wrapping, quiet shell treatment, and concept divergence remained legible.

### Safari and VoiceOver

Safari 27.0 on macOS 27.0 was used against the same OS-assigned local ConceptHub. The comparison page rendered all four live same-origin previews with exact model identity at a 1280 px review width. Index House was also reviewed standalone: the global combobox opened, accepted `theme`, exposed an expanded combobox/listbox with an active option, and the keyboard deep link landed on **Start & Appearance → Appearance, motion & input → Theme**. The final Theme setting region received focus after disclosure and geometry settlement.

VoiceOver was enabled during the Safari review. The Safari accessibility tree exposed coherent headings, comboboxes, switches, buttons, lists, and description-list relationships for the inspected pages. The available targeted-key automation could not reliably drive or capture the VoiceOver rotor and spoken-output sequence, so a full auditory rotor traversal is **not claimed**. VoiceOver was turned off after review. This is a manual-coverage limitation, not an observed product defect.

## Exact command results

```sh
node --test 'Concepts/settings-redesign-concepts/5.6 Sol/verify/state.test.mjs'
node 'Concepts/settings-redesign-concepts/5.6 Sol/verify/browser-smoke.mjs'
python3 -m unittest discover -s Concepts/ConceptHub/tests -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python3 Concepts/ConceptHub/validate.py 'Concepts/settings-redesign-concepts/5.6 Sol'
```

- State tests: **17 passed, 0 failed**.
- Browser verifier: **passed** all 7,680 core states, 2,304 scenario states, 40 witnessed semantic motion moments, focused functional/accessibility/responsive audits, and comparison/coarse-pointer checks.
- Shared ConceptHub unit suite: **16 ran, 1 failed**. `test_live_catalog_inventory_and_authorship` hard-codes `{topics: 5, models: 18, cards: 54}`, while the live repository reports `{topics: 8, models: 25, cards: 90}`. This is outside the authorized model folder.
- Model-folder validator: **passed**.

## Defects found and repaired during the pass

- Replaced string render reasons with structured dispatch results and split persistent shell/local keyed render scopes.
- Converted deep-link focus from persistent state to a consumed one-shot request, eliminating edit-triggered snap-back.
- Centralized combobox state and completed keyboard, outside-dismissal, and `aria-activedescendant` behavior.
- Repaired the Usage search destination so it opens the exact Provider → Usage surface, focuses its labelled heading, and records an honest owner-handoff simulation rather than falling through to an undefined category.
- Corrected Provider tab focus targeting and verified click, Arrow, Home, and End behavior against the real tablist.
- Added scrollspy locking, stable offsets, interruption cancellation, and current-location synchronization.
- Separated category replacement from Home-to-workspace navigation so each gets the correct motion transaction.
- Mapped every concept blueprint role to mounted elements, added keyed save/reorder targeting, and witnessed all 40 concept/intent combinations through actual WAAPI calls rather than trusting stage markers alone.
- Added transaction cancellation and stale-callback invalidation for rapid motion reversal; semantic focus consumption now produces no decorative transaction.
- Bound Theme, Density, explicit motion reduction, and OS motion preference to effective presentation state.
- Made Provider refresh visibly progress through connection, catalogue, and readiness while last-known-good rows remain mounted and usable.
- Replaced generic supporting-manager facts and actions with domain-specific Context, Persona, Crew, MCP, LSP, extension/tool, and Media inventory/detail content.
- Reworked narrow managers to list/detail drill-in, added real dismissible navigator drawers, implemented Index House's medium evidence drawer with backdrop/focus restoration plus its squeezed inline inspector, and reflowed Ledger tables into labelled records.
- Removed an invalid native-list role mix in Ledger and verified drawer, tab, disclosure, current-location, and focus-restoration semantics.
- Fixed Switchboard effective-width overflow and raised all concept metadata to the required type floors.
- Added coarse-pointer hit areas, forced-colors behavior, RTL/directional handling, text expansion, and overlay containment.

## Known simulations and limits

- No real provider/platform login, installation, update, purchase, billing, model generation, provider call, usage refresh, external diagnostic, or support bundle was executed.
- No real shell command, filesystem mutation, CWD change, native Terminal diagnostic, operating-system dictionary write, or durable Memory/storage write was executed.
- Provider identities, capability evidence, usage, catalogue versions, and freshness timestamps are deterministic review fixtures, not current qualification evidence.
- System spelling and dictionaries are represented by a local stateful service preview; platform integration is not certified.
- The concepts validate web behavior and documented Slint portability; they are not a native Slint build, performance benchmark, or certification run.
- Full VoiceOver rotor/spoken-output traversal remains a manual coverage limitation as described above.

No screenshots, videos, frame captures, recordings, traces, downloads, coverage folders, browser profiles, or generated test-output directories were retained.
