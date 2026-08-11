# Build status — Opus 5 Assistant Chat concept workspace

`README.md` has always advertised this file. It did not exist until now. It records the exact
state of the Assistant Chat Update Packet v2 repair pass, including everything not yet done.

**Last full suite run: 912 assertions, 912 passed, 0 failed, 0 console errors, 0 console
warnings, 15.6 s, viewport 1900×900, pairing w1+t1.**

---

## 1. Complete and verified

### Two blocking bugs found during the audit and fixed first

**`ctx.services.scroll` threw on every call.** `shared/workspace.js` bound the service to
`global.PMXScroll`, which exports only `{ attach, resolveScroller }`; every per-container method
lives on the `ScrollCtl` instance `attach()` returns. So `jumpTo` and `preserveAcross` threw at
28 call sites. Because `search.js` called it inside a `setTimeout`, clicking a search result
navigated and then silently failed to jump, while `COVERAGE.md` and `TEST_REPORT.md` both
claimed that path passed.

- 27 thread call sites now use their own `this.scrollCtl` (every thread already had one).
- `shared/search.js` routes through `ThreadInstance.scrollToMessage()`, the contract's method
  for a module that owns no scroll container — reached via a new `ctx.thread` back-reference
  set by `compose.js`.
- `PMXScroll` now carries throwing stubs for the eight instance methods, so the same mistake
  names itself instead of disappearing into a callback.
- Verified: a search hit navigates, renders, highlights; `setExpanded` no longer throws.

**`changed.indexOf('ui')` never matched.** The store coarsens paths to at most two segments
before notifying, so `ui.theme` arrives as `'ui.theme'` and never as `'ui'`. Three subscribers
in `workspace.js` used exact-array matching and were dead for every real change.

- Fixed with a prefix match; `compose.js` now honours `_themeLock` on update as well as on
  mount, and calls `windowInst.setMount()`.
- Verified: the contact sheet holds **eight distinct themes** through a theme change and a
  width change. It previously collapsed to one the moment the Theme control was touched.

### Store v4

`session.threadHistory` is a four-state slice; `session.artifact`, `session.spell`,
`session.demo` and `session.favorites` are new; `session.selectors` is gone.

**Runtime selectors are now thread-local.** Canon requires provider/account/model, Persona,
effort, Normal/Fast, mode, access profile, Crew and worktree to apply to the current thread and
future turns only. They lived in global `session.selectors`, so choosing a model in one thread
silently retargeted every other thread. They now live in `view[threadId].runtime`, seeded from
`session.defaults`. Verified no-leak: `thread-01 → Sonnet 5` while `thread-02 → Opus 5`.

`view.surfaces` was replaced with a shape a concept can actually use
(`{expanded, openIds, phaseIndex}`); the previous five booleans were declared, named in
`CONTRACT.md`, and read by nothing.

### Pinned history — four states, real demotion

`shared/threadhistory.js` now resolves `state` (`closed | peek | pinned`) plus `density`
(`full | compact`) against each concept's own floors, returning an `effective` value and a
truthful `reason`.

The previous model was two booleans behind a single gate that hardcoded `chatW >= 800`
(a 520 px transcript floor plus a 280 px column). **Pinning was therefore impossible at the 520
and 750 presets in every concept** — half the widths this workspace exists to test — and when
it failed the surface simply vanished while the pin button still read pressed.

Measured ladder, w1 floors (`minChat 400 / full 280 / compact 56`):

| chat width | asked | effective | transcript | reason surfaced |
|---|---|---|---|---|
| 1200 | full | `pinned-full` | 920 | — |
| 975 | full | `pinned-full` | 695 | — |
| 750 | full | `pinned-full` | 470 | — |
| 520 | full | `pinned-compact` | 464 | "Not enough width for the full list. Showing the compact rail." |
| 520 | compact | `pinned-compact` | 464 | — |
| 420 | compact | `peek` | 420 | "Not enough width to keep history pinned. It opens over the conversation instead." |

Also fixed here: `setDocked()` is called rather than bypassed; the pin resolves on width change
(it previously went stale until an unrelated session mutation); density is reachable by
Alt-click and secondary click.

### Artifact workspace, left of Chat

New `shared/artifacts.js` (state machine), `shared/artifactpanel.js` (body renderer),
`shared/artifact.css`. `artifactHost` is a new optional region; the shell provides a fallback
host as a **sibling immediately before the chat host in flex order**, so the surface is
genuinely left of Chat and outside the message/composer rectangle.

Measured at 750 px chat: panel `[373, +460]`, chat `[833, +750]` — panel right edge meets chat
left edge exactly; `intersectsComposer: false`.

Verified states: `loading → ready`; `switch` without remounting the panel; `error → retry →
loading → ready` on the designated failing artifact; `update → ready` with the diff going from
3 rows to 4 in place. Transcript scroll and composer draft both preserved across opening.

Five artifacts cover every category the packet names: multi-file diff, source file, image/test
screenshot (inline SVG, no binary asset), test report, structured document.

**Coexistence verified at 1200 px**: artifact `[113, 573]`, history `[574, 853]`, chat
`[573, 1773]` — left-to-right `artifact | history | chat`, no overlap between any pair.

`editorHost.openArtifact` was a registry that only fired a toast; it is now re-pointed at the
artifact workspace, so the seven existing call sites in `headertools.js` and t1–t4 do something.

### Demo harness

New `shared/demo.js` (`PMXDemo`) plus a **Director drawer** in the workspace chrome — outside
the fake product shell, collapsed by default, labelled as a review control. The packet forbids
demo triggers becoming permanent Chat toolbar buttons; nothing was added to the chat chrome.

27 triggers across `history`, `artifact`, `goal`, `decision`, `system`. **All 27 fire; zero
failures.** `system.reset` restores one known state (history closed/full, thread-01, artifact
closed, no pending decisions), verified. Also reachable as `PMXDemo.fire()` for probes and as
`#demo=family.event` for captures.

The harness injects questions, approvals, warnings and collisions but deliberately cannot
answer them — resolving one happens through the concept's own UI, which is the thing under
review.

### Windows migrated

- **w1 Ledger** — peek (scrimmed drawer) / pinned-full (docked column) / pinned-compact
  (56 px spine), suspend note, width resync, peek-only dismissal on thread switch.
- **w6 Docked Sheets** — migrated, plus a new `rail` detent for the compact pin, plus two real
  geometry fixes: the sheet was `bottom: 0` and therefore **overlapped the composer at every
  snap including the 56 px peek** (the overlap assertion missed it because the closed sheet is
  `height: 0`), and its thread-switch branch was unreachable dead code because
  `'session.activeThreadId'.indexOf('session') === 0` made the generic branch return first.

### Workspace hazard fixed

All four pages carried a frozen cache-buster (`?v=1785719893`), so edited modules were served
from cache and a page could silently run a mix of old and new code. Bumped, and a bump script
is the working practice until a build step replaces it.

---

## 2. Not done

The majority of the packet remains. Nothing below is started; none of it is half-built.

- **Compact pinned tier for w2, w3, w4, w5, w7, w8.** These six still use the compatibility
  shim, which reports `active` only for `pinned-full`. That is deliberate: an unmigrated window
  has no compact rendering, so reporting a compact resolution would make it draw a 280 px column
  into a 520 px chat. They behave exactly as they did before this pass.
- **Per-window artifact placement and switcher.** All eight currently share the fallback host.
  The eight distinct placements and switchers in the plan are not built.
- **Concept-specific question renderers.** Still eight hand-copied `_renderQuestionBody`
  implementations with ~5 % real variation, and `shared/reveal.js` still owns all entry/exit
  motion. The questionnaire service repairs (preparing/submitting phases, skip-on-last,
  `unskip`/`prev`/`goTo`, per-question validation, durable receipts) are not done.
- **Compact Goal/Todo/subagent/activity/diff compositions.** t5–t8 work surfaces are still
  inert `<div>`s; blocker detail is still unreachable in four of eight concepts; there is still
  no activity grouping, no in-place count morphing, and `motion.condense` is still unwired.
- **Demo content.** `thread-01` has not been rebuilt to the 18-event spine; the extension still
  adds no approvals, collisions, cross-thread requests or Crew records. The harness injects
  these onto the view slice at runtime instead.
- **Selectors, access, approvals, warnings, attachments.** Provider/account/model rework,
  favorites, Normal/Fast, the four access profiles, compact approval cards and the warning
  severity ladder are not built. `decision.*` triggers currently push records that no concept
  renders yet.
- **Context Lens routing, Compact Now, branch, rewind, cross-thread, Crew, capacity.**
  `Branch from here` and `Compact now` are still toast-only.
- **Passive spellcheck.** `autocorrect="on"` is still set in `shared/composer.js`.
- **New test suites, evidence capture, `concept-hub.json`, `IMPACT_REGISTER.json`,** and the
  documentation drift corrections listed in the plan's §A12.

---

## 3. Known limitations of the verification

- The existing 912-assertion suite is green, but **no new assertions were added for the new
  surfaces**. The artifact, history-ladder, thread-local-runtime and Director results in §1 were
  verified by direct measurement in the browser, not by a committed assertion. They will regress
  silently until the suites in the plan's §10 exist.
- The suite still runs one pairing per invocation. 56 of 64 pairings continue to receive only
  the mount smoke assertion.
- **The suite needs a viewport at least as large as the stage it measures.** At 439×431 the
  eight popup-anchor assertions fail with "no open popup to measure" — not a product bug, but
  the popup service correctly refusing to place against an off-viewport anchor. At 1900×900 they
  pass. Worth an explicit guard in the runner.
- `evidence/motion/` is still an empty generated-output folder and no capture set has been
  produced.
