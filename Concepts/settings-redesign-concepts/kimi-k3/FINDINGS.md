# FINDINGS — kimi-k3 settings bakeoff

Defects found during build/verification, and how each was resolved. All
fixes verified in-browser through ConceptHub; evidence in TEST_REPORT.md.

## Fixed during this pass

1. **Inbox rows were inert (shared shell).**
   `pm-shell.js` closed the title-bar inbox via a document outside-click
   listener and bluntly `stopPropagation()`-ed every click inside the
   panel. Concept pages attach their `data-notice-act` /
   `data-notice-dismiss` delegation at `document`, so inbox clicks never
   reached them — inbox notice actions did nothing in all four concepts.
   Fixed by containment-based outside-click (`panel.contains(target)`)
   with a detached-target guard (a row action may re-render the list
   mid-dispatch; a detached target means the click began inside). Dismiss
   now removes the row, the count chip drops, the panel stays open for
   continued triage, and outside-click still closes.

2. **(Withdrawn — was a misdiagnosis of #1.)**
   An early probe showed dismiss leaving the inbox visually unchanged and
   was first attributed to a missing repaint. In fact every concept script
   subscribes `PMStore.on("change", …)` to repaint both the inbox and the
   current view; the probe's empty store after the click proved the
   handler had never fired — the entire symptom was the shell propagation
   bug (#1). No concept-script change was needed.

3. **Vault retention timeline: selector/markup mismatch.**
   CSS targeted `.vlt-tl svg …` while markup rendered `.vlt-tl-row`, and
   the scrub indicator `<line>` had no stroke while a full-area hover
   `<rect>` carried the scrub class (would have painted a solid accent
   block on hover). Additionally the JS listener query still used the old
   selector after the first fix — caught by re-probe (a static "90 days"
   label had masqueraded as a successful scrub). All three sides
   (CSS/JS/markup) now agree; scrub shows "≈ N days at cursor" and
   restores on leave.

4. **Vault manager entry animation caused transient horizontal overflow.**
   `vlt-step-in` translated X +12px during the 220ms entry; matrix sweeps
   measured mid-animation and flagged `scrollWidth` inflation on manager
   views at widths 900–1700. Changed to `translateY(8px)` — same stepped
   signature, no horizontal effect. Re-sweep: 0 issues in 240 combos.

5. **Reduced-motion check false negative (probe bug, not product bug).**
   The shared kill switch collapses durations to `0.01ms`, which computes
   to `1e-05s`; an early probe compared against the wrong strings and
   reported failure. Verified properly: animation duration is `1e-05s`
   under `data-motion="reduced"`.

6. **Deep-link marker lag (shared scrollspy).**
   `PMSpy.jumpTo` applied the persistent `[data-spy-current]` marker only
   after the smooth-scroll settle poll (up to ~1.3s) AND the 600ms settle
   animation (900ms fallback) — up to ~2.1s total. The target is known
   synchronously at jump time, so the marker is now set immediately
   (measured ~80ms, i.e. one render cycle) and earlier markers are retired
   so exactly one row is "current". The settle animation, focus move, and
   accordion auto-open are unchanged. Verified on Concord and on Vault's
   diagnostic-row-in-collapsed-accordion deep link, full and reduced motion.

7. **Dependency-omission corrections (2026-08-13 correction packet).**
   The original packet omitted the Performance decision register; the
   build had absorbed only its principle-level summaries. Corrected and
   browser-verified: truthful ObservableWork projection grammar (phase,
   wait reason, real-denominator progress, source label, valid cancel) on
   provider updates and the index rebuild; scenario-driven lazy-hydration
   and offline/last-known-good states; domain-local refresh replacing
   whole-view repaints; 100-installation collapse fixture; resource
   policy rows (behavior profile incl. Legacy, background work, metered
   connection, cache ceiling); SCM install flows; four missing deferred
   insertion cards. See reference-review-report.json for the full
   provenance and evidence list.

## Deferred by design (per packet)

- **Servers module (Vault)** ships as an insertion shell only: six cards
  marked deferred with named canonical owners, insertion contract
  (manager module, deep links, status cards, command wiring), and the
  explicit note that WSL is optional and native Windows is complete. No
  backend state machine is invented.
- Huge families (e.g. Catalog/commands, Containers) use representative
  depth per packet 05: navigation + row grammar + at least one deep flow +
  critical states, not every row.

## Known limitations

- All mutating actions are simulated and receipt as simulated; candidate
  production wiring lives in each concept's `candidate-wiring-delta.json`.
- Demo state is per-browser-profile `localStorage`; the Demo scenarios
  drawer "Reset demo data" restores the seeded state.
