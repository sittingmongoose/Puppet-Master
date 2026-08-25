# Wave 4 — Decisions (item 15a) — work log

Owner: `questions.js` + `questions.css` ONLY. Slot `questionSurface`, plus `PM56_EXT.action(...)`.
Audit invocation: `node tests/audit.mjs reports/audit.json ./tests` (writes JSON, prints nothing;
read `reports/audit.json` → `.summary`).

## Baseline captured before any edit (03:0x)
- `for f in *.js; do node --check; done` → all clean.
- `python3 build.py --check` → PASSES, sha256 `6225b219bc263e18`.
- `tests/audit.mjs` → **434 pass / 0 fail / 0 console errors / 0 page errors**.
- `styles.css` grep for `decision-evidence`: only **two** rules — the base
  `.decision-evidence{display:none;...}` (styles.css:242) and
  `.decision-host[data-variant="7"] .decision-evidence{display:block}` (same line).
  **The unscoped `@media` re-declaration the plan describes at styles.css:294 is GONE**
  (Wave 1B deleted it). The surviving narrow-width rule at styles.css:333 is
  `.decision-host[data-variant="7"] .decision-body{grid-template-columns:1fr}` — correctly scoped.
  Confirmed at pixel level later (step 9).

## Constraints read off the code before designing
- `renderDecisionHost()` (app.js:948) calls `extReplace('questionSurface', …)` **only when
  `state.decision` is set**; the empty case returns early. So the slot never has to render "no
  decision", and `.decision-host.empty` collapse still belongs to app.js.
- Six decision types reach the slot: `question`, `question-preparing`, `question-submitting`,
  `plan` (+`mode:'revise'`), `permission`, `conflict`. **8 concepts × 6 types = 48 combinations**,
  which is why this module is one derived model + eight renderers rather than eight copies.
- `tests/audit.mjs:122-128` pins three things I must not break:
  1. `.decision-host` bottom ≤ `.activity-wrap` top + 2 (decisions push, never cover) — for
     **plan** and **question**;
  2. `[data-action="close-decision"]` exists and is clickable;
  3. `getByText('Deployment questionnaire', {exact:true})` resolves to **exactly one** element.
     Any concept that lists the queue must therefore not repeat the active flow's title verbatim.
- `.decision-host` is `overflow:hidden; max-height:min(46vh,460px)`, so a tall concept is
  *clipped*, not scrolled. Every concept gets its own flex column + `min-height:0` scroll region.
  (Flex, not a fixed grid track — per the ORCHESTRATOR_NOTES fixed-track warning.)
- `--spring` bundles duration+easing: in `animation` shorthand use `--spring-ease` /
  `--spring-soft-ease`.

## Plan — one derived model, eight structures

| # | Name | Structure (what actually differs in the DOM) |
|---|---|---|
| 0 | Stable Card | centred card, single column: head / prompt / input / actions |
| 1 | Morphing Composer | no card at all — one composer-shaped bar, inline option chips, send button |
| 2 | Anchored Sheet | full-bleed sheet flush to the bottom edge, grabber, sticky footer bar |
| 3 | Side Inspector | narrow surface docked right, `<dl>` field list, prompt top / input bottom |
| 4 | Step Sequence | vertical spine, one node per question (or per decision stage), answers inline |
| 5 | Technical Decision | mono record table, `[n]` keyed option rows, evidence as record rows |
| 6 | Queue Stack | layered cards — the live decision on top, the other flows peeking behind |
| 7 | Evidence Split | two columns: decision left, persistent `.qs-evidence` pane right |

Cross-cutting (all 8): every question's `why` comes from the fixture (the stock surface printed
one hardcoded sentence for all five questions); the summary page derives from every answered
question rather than indices 0-2; the queue is `D.questionFlows`, so `2 queued` is a count of
rendered rows; `qs-goto-question` and `qs-open-flow` are new real actions.

**Evidence-pane rule (the 15a related bug):** only concept 7 emits `.qs-evidence`. The other
concepts express the same `model.evidence` inside their own structural elements
(`.qs-tech-row`, `.qs-dl`, `.qs-step-body`, `.qs-fold`) or not at all — so "the evidence pane is
option 7's differentiator" stays literally true at every width, and there is no shared
`display:block` for a media query to flip.

## Progress
- [x] 0. Baseline + reading (this section).

- [x] 1. **All eight takes implemented in one pass** (`questions.js` ~640 lines, `questions.css`
      ~430 lines). One `buildModel(ctx)` + eight renderers, so all six decision types get all
      eight structures. `build.py` PASSES (sha `fbf22a866b02705d`);
      `tests/audit.mjs` **434 pass / 0 fail / 0 console errors / 0 page errors**.
      Probe (`scratchpad/waves/qs_probe.mjs`): slot registered, 3 new actions
      (`qs-goto-question`, `qs-open-flow`, `qs-toggle-fold`), 0 console errors / warnings /
      page errors, **exactly one** element with exact text `Deployment questionnaire`
      (audit.mjs:128 needs that), **exactly one** `[data-action="close-decision"]` per take,
      node counts 42 / 42 / 68 / 70 / 86 / 81 / 62 / 52 with eight different root class names,
      and `.decision-evidence`/`.qs-evidence` painted **3 in take 7, 0 in the other seven**.
- [x] 2. **Container tiers keyed on measured widths, not guessed ones.**
      `qs_width.mjs` measured `.decision-host` across 10 viewports x 3 editor splits:
      the real range is **238px … 916px**, and 916 needs the editor dragged to 30%. The
      default 1440 / 54% case is **457px**. So a fixed 300px evidence aside would have been
      most of the surface most of the time; it is `clamp(150px,40%,300px)`, and the stack
      tier is at 400px (not the 620px I first wrote, which fired on the DEFAULT layout and
      would have meant take 7 never actually split).
- [x] 3. **First screenshot review (dark + light, all 8, at the default 457px host).**
      Five real defects found by eye and fixed, all of the "present but unusable" kind:
      1. the head WRAPS (title + four pills does not fit), and the close control rode the wrap
         onto row two in six of eight takes — it is now pinned top-right;
      2. take 1's send button wrapped onto its own row: badge 26 + field 240 + controls 115 +
         gaps 16 = **397px in a 395px content box**. Back and Send are now one flex item and the
         field's basis is 170px;
      3. take 3 put its field list first and pushed **the actual answer control below the fold** —
         input first now, and the four stacked full-width buttons became one wrapped row plus a
         full-width primary;
      4. take 4 printed questionnaire vocabulary ("Answered", "Waiting") over a **plan's revision
         history**. Step words are type-aware now (Superseded / Under review / Newer);
      5. take 7 printed the rationale twice — once in the main column, once as the pane's first
         block. The main column now carries the queue instead (question flows only).
- [x] 4. **Suite written and run** — `questions-verify.mjs --file <html> [--json] [--reduced]`,
      **95 assertions**. All painted-pixel: `elementFromPoint` ownership plus an 8x8 luminance
      fingerprint decoded from a real screenshot crop inside a canvas. Clicks go through
      `clickPainted()` (page.click never becomes actionable against the 2s work tick).
      **95 pass / 0 fail / 0 console / 0 page errors.**
- [x] 5. **Negative control: 66 of 95 go red** with `questions.{js,css}` blanked
      (`qs-negative-control.py`). The FIRST negative run exposed **40 vacuous passes**: every
      behavioural assertion was scoped to `.decision-host`, and app.js's stock surface also has
      one close button, one title and a choice grid — so the whole C group passed against a build
      with the module removed. Every C assertion is now scoped to the take's own root
      (`.qs-card`, `.qs-morph`, …), and one more vacuous pass was found in E2
      (`querySelectorAll` over an absent root returns an empty list, so "no infinite animations"
      passed by having nothing to look at).
      The **29** that still pass in the blanked build are classified, not excused:
      - 24 B-group width x take evidence assertions + B9 — a regression guard on behaviour
        **Wave 1B restored**, so it correctly holds with or without this module. B10 is the half
        only this module can satisfy (the pane carries the *fixture's* rationale) and it goes red.
      - A11 (crop has >100 colours) — a sanity companion to A10, true of the stock surface too.
      - E3 — a stock-baseline comparison; passes by construction when mine == stock.
      - E5 / E6 — zero console / page errors, exactly the two the brief exempts.
- [x] 6. **Reduced motion**: same suite, `reducedMotion:'reduce'` — **95 pass / 0 fail**.
- [x] 7. **Control build**: audits run on two FROZEN roots built from the same sources, one with
      the module and one with it blanked, because the shared `index.html` was rebuilt by another
      agent three times during this wave (sha `3c714038` -> `16c9b4ce` -> `580dada9` -> `b62f576f`).
      With the module: **443 pass / 3 fail**. Blanked: **441 pass / 3 fail**. Same three labels.
      **Failures unique to this module: none.**
      - `Phase compact and expand across all 24 working takes` — takes 1, 12, 16. Working
        Animation family.
      - `No page overflow at 1440 / 1280 across the editor split range` — `button.context-ring`
        +29px at editor 66-70%. Context ring / header.
      **The 434/0/0/0 target in my brief is stale**: the suite has grown to 446 tests (the orphan
      gate landed after my baseline) and the 3 failures pre-date this module.
      Orphan gate: **0 hard orphans**; 25 soft entries from `questions.css` (`softOwners:
      questions.js` — classes the gate's exercised states do not reach, the same category as
      activity-panel's 85). My own static pass finds 10 class names not present as literals in
      `questions.js`; all ten are built by concatenation (`'is-'+state`, `'qs-pill-'+tone`,
      `'qs-textarea-'+style`), the documented interpolation false positive.
      **Measurement error of mine, recorded:** an earlier live-vs-control pair appeared to show
      this module *fixing* the two overflow failures. It did not — the two runs measured two
      different builds while another agent was rebuilding. Freezing both roots dissolved it.
      A second one: the orphan gate reported a hard failure on the frozen root, which was
      `PM56_SRC` defaulting to a directory holding only `index.html`. Both are the same lesson
      the notes already carry, hit twice more.
- [x] 8. **All six decision types x all eight takes** (`qs_types.mjs`, `qs_submitting.mjs`):
      56 combinations, every one renders content, height > 20px, at most one close control,
      **0 console errors, 0 page errors**. `question-submitting` renders a painted progress bar
      and no close control in all 8 — matching app.js, which deliberately offers none there.
- [x] 9. **Second screenshot review, four themes** (basic-dark, basic-light, retro-dark,
      glass-light) x 8 takes, plus plan and permission decisions in basic-dark. Retro's
      `--font-ui: var(--font-mono)` does not break take 5 (which is mono by design) and glass's
      translucency does not swallow the evidence pane. No two takes look alike in any theme.
      One correction to my own earlier note: **`Conflict mediation` IS exposed** as a Demo Studio
      trigger — in the *Work lifecycle* group, not *Questions and decisions*. My first type probe
      used the neighbouring `Conflict resolution` trigger (which records the outcome receipt and
      closes the decision) and reported the conflict surface as unreachable. It is not. Retracted
      before it reached the report.

## FINAL STATE — WAVE 4 DECISIONS (item 15a) COMPLETE
`questions.js` 916 lines / `questions.css` 466 lines / `questions-verify.mjs` 574 lines.
Nothing else touched. `app.js` and `styles.css` **not opened**. Nothing committed; all three
files are untracked (`??`).

Closing gates on the shared tree:
- `python3 build.py --check` **PASSES**, sha `5a31a855faaa4ee9`, stable across two consecutive
  checks; `index.html` and the standalone byte-identical, **20,447 CRLF / 0 bare LF** each.
- `questions-verify.mjs` **95 pass / 0 fail**, and **95 / 0** again under
  `prefers-reduced-motion`. 0 console errors, 0 page errors.
- Negative control **29 pass / 66 fail**, every survivor classified above.
- `tests/audit.mjs` on the real tree: **445 pass / 1 fail**, 0 console, 0 page errors,
  **0 hard orphans**. The single failure is `Phase compact and expand across all 24 working
  takes` (Working Animation family), which also fails with this module blanked.
  Note the audit is now **446 tests**, not the 434 my brief names — the orphan gate landed after
  my baseline. The two `No page overflow ... across the editor split range` failures
  (`button.context-ring` +29px) appear on some runs and not others; they reproduce identically in
  the control when they appear, so they are not this module's and they are intermittent.

## FINDINGS FOR THE ORCHESTRATOR (not mine to fix)
1. **`DEFAULT.planRevision` is a literal `3`; `artifacts[plan-query].version` is `4`, and the
   fixture ships four revisions.** Two numbers for one quantity, and the stock plan surface
   printed only the first. My surface prints both (`Revision 3` + `Artifact at v4`) rather than
   picking a winner, but the real fix is one of `app.js` / `data.js`, neither of which is mine.
2. **`D.labels` has no host-state map** (it has ten others). `questions.js` declares
   `HOST_STATE = {online, degraded, offline}` locally so the permission surface does not paint a
   raw enum. It belongs in `data.js` beside `worktreeState`.
3. **`state.questionQueue` is still not a real reader.** The queue pill counts the rows this
   module renders from `D.questionFlows`, because a count must equal what is listed. The state
   field is consumed only as a delta ("+1 queued this session") when the demo trigger pushes it
   above the fixture's two. Item 15g can consider it half-closed at best.
4. **`qs-goto-question` does not gate on a required unanswered question.** Deliberate, and
   consistent with the stock `skip-question`, which also advances past one; `submit-questionnaire`
   remains the gate. Flagging it so a later reviewer does not read it as an oversight.

## HARNESS FILES LEFT FOR WAVE 5
| file | what it does |
|---|---|
| `5.6 Pro/questions-verify.mjs` | the 95-assertion painted-pixel suite; `--file`, `--json`, `--reduced` |
| `scratchpad/waves/qs-negative-control.py` | builds a copy with `questions.{js,css}` blanked |
| `scratchpad/waves/qs-full-build.py` | the same builder with nothing blanked — freeze a live root the other agents cannot rebuild under you |
| `scratchpad/waves/qs_probe.mjs` | fast boot + eight-take structural fingerprint (~30s) |
| `scratchpad/waves/qs_shots.mjs` | `<theme> <question\|plan\|permission\|conflict>` -> 8 cropped screenshots |
| `scratchpad/waves/qs_width.mjs` | measures the real `.decision-host` width across 10 viewports x 3 editor splits |
| `scratchpad/waves/qs_types.mjs` / `qs_submitting.mjs` | all decision states x all eight takes |
| `scratchpad/waves/qs-verify{,-negative,-reduced}.json` | the last three runs |
