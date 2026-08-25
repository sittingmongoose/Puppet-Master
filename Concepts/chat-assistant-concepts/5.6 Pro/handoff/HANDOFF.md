# HANDOFF — 5.6 Pro chat assistant repair wave

**Written 2026-08-25 by the outgoing session, which is out of usage.**
You are picking this up on a different machine and account. Everything you need is in this
folder — nothing lives in `/tmp` any more.

---

## 0. COMMITTED AND PUSHED — the work is safe

Commit **`b72727f2b5`** — 1018 files, scoped to `Concepts/chat-assistant-concepts/5.6 Pro/` only
(nothing from other sessions' in-flight work). Pushed to **both** remotes:
`origin` (github.com/sittingmongoose/Puppet-Master) and the TrueNAS mirror at
`ssh://192.168.50.200/mnt/Storage/PuppetMasterGit/PuppetMaster.git`. Clone or pull from either.

---

## 0b. *** REQUIRED CLEANUP — the user has asked for this explicitly ***

**This wave added ~96MB of evidence, film, screenshots and per-agent harnesses. Delete them.**
Do it in the order below; some of it is still needed to finish Wave 5.

### DELETE NOW — superseded, nothing depends on it (~80MB)
```bash
cd "Concepts/chat-assistant-concepts/5.6 Pro"
git rm -r --quiet handoff/w4orbit handoff/w3 handoff/hfilm handoff/hshots handoff/ab \
  handoff/shots-goals handoff/shots1b handoff/qsshots handoff/shots handoff/qs-live \
  handoff/qs-control handoff/wave3-debug handoff/apshots handoff/real_shots handoff/real_cards
git rm -r --quiet reports/context-verify
git rm --quiet handoff/BASELINE_standalone.html handoff/FRESH_standalone.html \
  handoff/FRESH2.html handoff/CURRENT_lf.html handoff/INDEX_lf.html handoff/DELTA.diff
```
The `02-collapse.png` eye-check those sheets existed for is **settled** (CDP frame-ordering) —
they are dead weight.

### DELETE AFTER Wave 5 is finished — needed to resume (~5MB)
```bash
git rm -r --quiet handoff/w5 handoff/w5v2          # the motion rig + verifier scripts
```

### DELETE LAST — when the concept is signed off (~1MB)
```bash
git rm --quiet history-verify.mjs orbit-verify.mjs questions-verify.mjs
git rm --quiet tests/{context-verify,lens-independent,threadops-verify,transcript-verify}.mjs
git rm -r --quiet handoff                          # logs, plan, notes
```

### KEEP PERMANENTLY
- `tests/audit.mjs` — the gate (446 assertions) — and `tests/orphan-gate.mjs`, which is what
  catches the defect class this whole wave existed to fix.
- `build.py`, all `*.js` / `*.css` sources, both generated deliverables.
- `reports/audit.json`, and the pre-existing `evidence/screenshots/` (8 theme shots, tracked
  before this wave).

### Be honest with the user about what deleting achieves
**Removing these files in a later commit does NOT shrink the repository.** The blobs stay in git
history forever; `.git` is already **3.6GB**. A later commit only stops them occupying the
*working tree* (~96MB). If the user actually wants the repo smaller, that needs
`git filter-repo` / BFG and a force-push — a separate, deliberate operation they must authorise,
not something to fold into a cleanup commit. **Say this plainly rather than implying the delete
reclaimed space.**

---

## 1. Where things stand

| | |
|---|---|
| `python3 build.py --check` | **PASSES** — sha256 `9315f951fa40a938`, both deliverables byte-identical, CRLF preserved |
| `node tests/audit.mjs reports/audit.json ./tests` | **446 pass / 0 fail / 0 console errors / 0 page errors** |
| Items 1–15 of the approved plan | **all implemented** |
| Wave 5 (final verification) | **INCOMPLETE — this is your job** |
| Cleanup of ~96MB of evidence/media | **REQUIRED — see §0b, the user asked for it explicitly** |

**Your job, in order:** (1) delete what §0b marks DELETE NOW; (2) finish Wave 5 — the two
confirmed defects below and the two-thirds of the video inspection never filmed; (3) delete the
rest per §0b as each stage stops being needed.

The approved plan is `handoff/APPROVED_PLAN.md`. The running decision log — read it before
touching anything — is **`handoff/ORCHESTRATOR_NOTES.md`**.

### Build mechanics (non-negotiable)
`PM_Chat_Assistant_5.6_Pro_Standalone.html` and `index.html` are **generated**. Edit the sources
and run `python3 build.py`. `build.py --check` is the gate and is *already* the fresh-build
byte-compare — don't reimplement it (two agents wasted time doing so).

Correct audit invocation — the space in "5.6 Pro" breaks other forms:
```
node tests/audit.mjs reports/audit.json ./tests
```

---

## 2. What Wave 5 still owes

Two agents were mid-flight when the session ended. Both were told to flush their logs:

- **`WAVE5_MOTION_LOG.md`** — the video inspection. **Got through ~1/3 of its brief** and found
  the two defects above. Resume with `handoff/w5/06-hist-cross.mjs`; the rig (`handoff/w5/rig.mjs`)
  is reusable and works.
  **NOT FILMED AT ALL — treat as unknown, not clean:** Menus (including the `close-contact-sheet.png`
  opacity eye-check), Goals, Transcript, Context, all 8 Decisions takes, the nine history status
  indicators, reduced motion, and the 8-theme sweep. Two captured sheets (`hist-02-pin.png`,
  `hist-03-threadpin.png`) were never read.
  **CLOSED POSITIVELY:** phase-trail crispness is now measured on **all 24 takes** (1.583px
  current / 1.342px resting, uniform across the 22 shared-chrome takes; take 8 at 1.622/1.350;
  zero `.wa-track` clipping). Wave 4 Orbit had measured 4 and inferred the rest. All 24 takes
  animate and are visually distinct.
  **METHODOLOGY — this bit others:** screencast frames must be sorted by **capture timestamp,
  never arrival**. `metadata.timestamp` disagreed with arrival order on 3 of 6 captures. That
  ordering artefact *is* the "opens, vanishes, reopens" mystery in `w4orbit/02-collapse.png` —
  **that eye-check is now settled**; re-sorted, the same capture shows DEFECT 1 instead.
  **Discard `trace-hist-pin.json`** — it was traced by clicking pin on already-pinned state. The
  pin-in-place claim is unverified in either direction. Note two pin controls exist and a naive
  `/pin/i` selector grabs the wrong one.
- **`WAVE5_VERIFY2_LOG.md`** — adversarial second verification (232 lines, RESUME HERE at top;
  scripts in `handoff/w5v2/`, snapshot sha `fa9cc44aa39d9453`).
  **SETTLED:** (a) the `02-collapse.png` anomaly is CDP delivering screencast frames **out of paint
  order** — proved by painting a rAF-driven counter into each frame as an RGB colour and decoding
  it back out of the captured pixels. 7 of 8 runs showed 1-4 inversions per ~34 frames, the
  later-arriving frame stamped 10.4-14.9ms *earlier*; the in-page rAF trace was non-monotonic in
  **0 of 8**. Fix is free: sort by `metadata.timestamp`, which every film script here discards.
  (b) History's clip-path CONFIRMED by a stronger method — `inset(0)` vs `box-shadow:none` differ
  by **-0.007**, i.e. clipping is pixel-equivalent to deleting the shadow, with an A/A noise floor
  of 0.000 and a far control. The first verifier's conclusion was right but its 16.14-vs-19.34 was
  a bare delta with no noise floor and no scale.
  (c) The shipped guard at `history-verify.mjs:409-434` toggles the *shadow*, not the *clip*,
  despite its comment — but it does still go red (delta 4.03 -> 0.00 against a >1 threshold).
  **NOT REACHED:** items 12 Orbit, 15a Decisions, 13 Thread Ops, most of its Task 3.
  **Item 9 Lens was attempted and its instrument broke** (0.37 relative A/A noise floor, saw only
  21 of 26 messages, own positive control failed) — **all 7 of its reds are unsafe and none were
  reported as findings.** Diagnosis (`.transcript{scroll-behavior:smooth}` + rects read after the
  screenshot) and a four-step repair are in its section 04.
  **STILL OWED:** `PM56_EXT.collisions` was verified `[]` in one direction only; the
  "make it go non-empty on purpose" half is not done.

### *** TOP PRIORITY — DEFECT 1, found by Wave 5 Motion, NOT FIXED ***

**The working card lurches ~271px in a single frame, on every Orbit expand AND collapse — and it
is systemic, not Orbit-specific.**

Root cause, located: **`app.js` `flipHeights()` (~line 1185)** reads the FLIP target height with
`getBoundingClientRect()` *immediately after the patch*, before the take's own CSS transitions
have moved a pixel. So it animates toward the incoming animation's **first frame** — backwards —
clipping real content under `overflow:hidden` for ~320ms, then releases and snaps.

Measured: content grows 160.8 -> 431.8px while the box *shrinks* 273.8 -> 233.8px, then jumps to
504.8px in one frame; the next sibling's top goes 811 -> 540 in that frame. Two independent
instruments agree.

**`data-flip` sits on `.working-body` for every one of the 24 takes**, so this affects all of
them. This is the single most visible motion defect left in the concept and the user's top-pick
animation is one of its victims.

*Not fixed because the outgoing session ran out of usage and would not have been able to verify a
change to shared FLIP machinery to its own standard.* Fix candidates: defer the target
measurement by one frame, or skip FLIP while the subject has running transitions. Verify with
`handoff/w5/rig.mjs`.

### DEFECT 2 — history drawer entrance, one step from confirmed
The drawer's entrance starts **306px left of its resting position — squarely over the editor
pane** (`translateX(-102%)` of 300px, settling at the transcript's left edge). Geometry is
certain; whether it *paints* there is unfinished (the contact sheet was clipped to the wrong
x-range). **The script that answers it is written and unrun: `handoff/w5/06-hist-cross.mjs`.**
Same trace shows the drawer does not exist for ~58ms after the click, and settles at ~324ms
against a claimed 240ms.

### Still open (from ORCHESTRATOR_NOTES, in priority order)
1. **Pinned activity panel collapses to ~1px at 1100px viewport.** Overflow is gone but the panel
   is effectively invisible. Needs a container query on `.assistant-pane`; deferred because
   `container-type:inline-size` implies `contain:layout` and History was mid-flight on
   `.history-flyout`. **That blocker is now gone — it is safe to attempt.**
2. `.wa-count` clipped ~9–10px at editor splits of 70–75%. Cosmetic.
3. Item 9 (Context Lens) and item 15a (Decisions) each had exactly **one** harness — their
   author's. The two-harness rule is not satisfied for them.
4. Eye-checks nobody settled: `handoff/w4orbit/02-collapse.png` (a sheet appears to show the
   panel opening, vanishing, reopening while the rAF trace says clean monotonic 0→260px), and
   History's clip-path A/B.
5. **A capability was deliberately dropped**: the pinned history drawer has no resize handle.
   Traded for the invariant that drawer width and transcript gutter are one expression. The user
   has been told; it is reversible if they want it back.

---

## 3. Rules that were paid for in real defects — keep them

- **`actionAfter()` was the last fix** (after Verify2 found it): still a silent last-wins
  assignment after `action()`/`chainAction()` were repaired — the same defect one function over,
  latent only because `_after` has 0 keys today. Both handlers now run; an undeclared duplicate is
  recorded as `after:<name>`. **CONFIRMED GREEN after it landed: 446/0/0/0, build sha
  `9315f951fa40a938`.**
- **A staleness trap caught the outgoing session at the very last step**, and it is the same one
  documented above: re-reading `reports/audit.json` showed **444/1 with an orphan-gate failure**
  while the audit process's own stdout said **446/0**. Two runs had written that file
  concurrently. **Trust a process's own output over re-reading shared state** — the file is
  written by whoever finished last, not by whoever you asked.
- **Serialize shared-file edits.** `app.js` and `styles.css` go through one owner. Modules use the
  `PM56_EXT` registry (20 slots declared / 19 emitted / 0 orphaned — keep that parity).
- **`action()` vs `chainAction()`**: `action()` = I own this; an undeclared duplicate is recorded
  in `PM56_EXT.collisions`. `chainAction()` = I deliberately extend and will `return false`.
  `PM56_EXT.collisions.length === 0` is a true invariant — keep it green.
- **`--spring` / `--spring-soft` bundle DURATION + easing.** Never put them after an explicit
  duration in **either** `animation` or `transition` — the token becomes the DELAY. Use
  `--spring-ease` / `--spring-soft-ease`. This silently added 440–520ms delays to 27 rules.
- **Assert painted pixels.** `elementFromPoint()` + a screenshot-crop colour read. Never a
  bounding box; it lies about clipped and in-flight elements.
- **Build a negative control before trusting a green.** Blank your module into a temp build; every
  assertion must go red. This found 40 vacuous passes in one agent's harness, 7 in another, 6 in
  another.
- **Never measure a toggle by toggling it** — a probe click desynchronises state.
- **Contact sheets are not timing evidence** — Playwright's click round-trip adds a phantom
  ~200ms. Use in-page rAF traces for timing, frames for appearance.
- **The author cannot certify their own green.** Eleven broken instruments were found this run,
  across every participant including the orchestrator. Not one was caught by its own builder
  except where the result was *implausible on its face*.

---

## 4. The recurring failure mode, stated once

> **The failure presents one layer above where it lives**, and underneath it is always an easy
> proxy standing in for the thing itself.

Encoding looked like a build failure. A byte delta looked like a foreign write. A 440ms animation
delay looked like the app being slow. A broken instrument looked like broken content. A selector
matching nothing looked like a measured zero. DOM structure looked like "visibly different".

This is why the shipped suite once reported **434/434 PASS while twelve defects were live**.

---

## 5. Evidence in this folder

`ORCHESTRATOR_NOTES.md` (the decision log), `APPROVED_PLAN.md`, `FIXTURE_SCHEMA.md`,
`DATA_HANDOFF.md`, one `WAVE*_LOG.md` per agent, plus their harnesses, screenshots and contact
sheets (~35MB, 897 files). `w4orbit/`, `w3/`, `wave3-debug/` hold film and control builds.
