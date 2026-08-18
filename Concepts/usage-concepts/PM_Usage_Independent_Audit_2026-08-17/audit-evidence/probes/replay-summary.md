# Independent replay of the U11 harness — does 80/80 green reproduce?

**Verdict: YES. 80 cases, 80 pass, 0 fail — every case name, status, and detail string
matches the concept's shipped report exactly. Nothing in the concept tree was touched.**

- Replay report: `audit-evidence/probes/replay-u11-verify-report.json`
- Replay stdout: `audit-evidence/probes/replay-u11-verify-stdout.txt` (exit code 0)
- Replay screenshots: `audit-evidence/screenshots/replay-*.png` (16 files)
- Replay harness + patch: `audit-evidence/harness/replay-u11-verify.mjs`, `replay-u11-verify.patch` (133-line diff)

---

## 1. How the replay was done

The concept tree (including `.verify/node_modules/playwright-core`) was copied to
`/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/replay-sandbox`.
Only the copy was modified. Five changes, all confined to plumbing:

| # | Change | Why |
|---|---|---|
| 1 | `executablePath` falls through Windows Chrome → Windows Edge → `/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome` | harness is Windows-pinned |
| 2 | launch args now `--headless --disable-gpu --no-sandbox --no-first-run --no-default-browser-check` | sandbox requirement |
| 3 | report output → `audit-evidence/probes/replay-u11-verify-report.json` | never write into the concept |
| 4 | screenshots → `audit-evidence/screenshots/replay-*.png` | never write into the concept |
| 5 | origin chosen at runtime: bounded 20 s probe of the harness's own `http://127.0.0.1:<port>/`, `file://` fallback | sandbox http hazard |

No assertion, selector, timeout, theme, width, or fixture was altered.

**The http fallback was not needed.** Contrary to the expected sandbox hazard, the harness's
own loopback static server on `127.0.0.1:8097` worked: `ORIGIN-PROBE: http reachable`. The whole
replay ran over the same http origin the original run used, so no `file://`-vs-`http://`
caveat applies to any result below.

## 2. Case-by-case comparison

Compared against `QwenUsageConcept/reports/visual-interaction-test-report.json`
(80 cases, 80 pass, ran 2026-08-13T22:40:12Z on Windows `chrome.exe`).

| | Claimed | Replay |
|---|---|---|
| cases | 80 | 80 |
| pass | 80 | 80 |
| fail | 0 | 0 |
| duration | 64.3 s | 78.7 s |

- **Cases with a differing status: 0.**
- **Cases that could not run: 0.**
- **Cases missing from the replay: 0. Extra cases: 0.** Names and order identical.
- **Cases with a differing `detail` string: 0.**

The detail strings match *byte for byte*, including relative-time text such as
`last used 13m ago` in case 55. The fixture clock is therefore pinned to the data, not to
wall-clock time — four days and a different OS/browser produced identical output. That is
strong evidence the shipped report was genuinely produced by this harness against this concept.

Rendering was confirmed visually, not just by counters: `replay-theme-friendly-dark-1700.png`
shows a fully composed page (15 rail items, live widgets, custom webfonts applied).

## 3. Note requested: is the font-CDN suppression (u11-verify.mjs:94-99) masking real errors?

**In this replay it masked nothing — it fired zero times.** Instrumented count:
`suppressed_console_errors: 0`. The page emitted **no console messages of any type**
(`console_count_by_type: {}`), and **no request failed** (`requestfailed: []`).

Cause: this sandbox has working egress to Google Fonts. The census in
`replay-assertion-soundness-probe.json` shows 5 external requests (1 `fonts.googleapis.com`
stylesheet + 4 `fonts.gstatic.com` woff2), all successful, `document.fonts.size == 122`. So
the three "zero console errors" claims (cases 46, 61, and `consoleErrors=0` in all 40 matrix
cases) are **genuine here, not laundered** — there was nothing to suppress.

Two residual weaknesses in the predicate remain, and they matter for runs on the offline
Windows box where the shipped report was produced:

1. **The text arm is over-broad.** `/fonts\.g(oogleapis|static)\.com/.test(msg.text())`
   discards any console error whose *message text* merely mentions those domains, regardless
   of where the error came from — a CSP violation report, a `FontFace`/`document.fonts`
   rejection, or any application error that logs the font URL in its message or stack would be
   swallowed as "just a remote font". The comment says "everything else counts", but the
   implementation counts by substring, not by origin.
2. **Network failure is not observable through this channel at all.** The harness only counts
   `msg.type() === 'error'` plus `pageerror`. Failed requests and console *warnings* are never
   collected. On a genuinely offline box the 5 font requests fail, and `consoleErrors=0` would
   still be reported — so `consoleErrors=0` in the shipped report must not be read as
   "no resource failed to load".

Neither weakness invalidates the 80/80 result as reproduced; both mean the "zero console
errors" cases are weaker than their names suggest.

## 4. Note requested: does any case pass vacuously (selector absent → zero-length check)?

**No case passes because a selector is missing.** A census of all 28 selectors the harness
asserts on (`replay-vacuity-and-console-probe.json`) confirms every selector resolves at the
moment it is used; the six that read zero at boot (`.rail-toast`, `.u11rd`,
`#u11PopList [data-scopeid="fam:openai"]`, `#u11SheetSprout [data-u11link="provider"]`,
`.u11w-capline.dim`, ledger `[data-att="ue-600"]`) are lazily created, and each case clicks or
waits for its element before asserting — the pass is what proves the element materialized.

The one *explicitly* vacuous branch in the source does not fire:

- `u11-verify.mjs:220` — `return el ? /display:\s*none/.test(...) : true` would report
  "hidden at standard" for a **missing** element. Probed: `.u11-advonly` count = **1**, so the
  vacuous branch is never taken.

But the same case is **unsound for a different reason, and this is the one real finding**:

> **Case 42, `interaction disclosure Std→Adv toggles authority rail`, passes while the
> authority rail is still invisible at Advanced.**

Measured at Advanced, exactly as the harness leaves it
(`replay-assertion-soundness-probe.json`, `replay-advonly-visibility-probe.json`):

| state | inline `style` | computed `display` | offsetHeight | user-visible |
|---|---|---|---|---|
| standard, More closed | `display: none; --u11-ri: 14;` | none | 0 | no |
| **advanced, More closed** (harness's end state) | `--u11-ri: 14;` | **none** | **0** | **no** |
| advanced, More **open** | `--u11-ri: 14;` | flex | 52 | yes |
| standard, More open | `--u11-ri: 14; display: none;` | none | 0 | no |

The harness asserts only that the *inline* `display:none` string is gone
(`!/display:\s*none/.test(el.getAttribute('style'))`), with an in-source comment admitting the
box may still be collapsed. The element is
`<button class="u11-item u11-sub u11-advonly" data-tab="authority">Source authority</button>`
inside `<div class="u11-moregrp closed" id="u11MoreGrp">`, and
`u11-prism.html:99` says `.u11-moregrp.closed .u11-sub { display: none; }`. The disclosure
handler (`u11-prism.html:1061`) sets `el.style.display = ''`, which merely lets the stylesheet
rule reapply. The harness never expands the "More" group, so it never observes the visibility
its case name claims to test.

**This is a test-strength defect, not a concept defect.** With "More" expanded the feature
behaves correctly: visible (`display:flex`, 52 px) at Advanced, hidden at Standard. The
concept is right; the assertion is a proxy that cannot fail if the disclosure code merely
clears an inline property.

### Other absence-shaped assertions, checked independently

- **`guard unconfigured providers absent from DOM` (case 59)** — the check reads
  `document.body.innerText` while the *free* tab is active. That is 3,437 of 420,596 serialized
  DOM chars (0.8%); 12 of 13 panes are `display:none` and contribute nothing to `innerText`.
  The case would pass if the visible pane were empty, and it would not catch the names
  appearing in a hidden pane — the name says "DOM", the method says "currently visible text".
  Independently re-checked against `documentElement.outerHTML`: Mistral / Fireworks /
  OpenRouter / Cohere are absent from the real DOM too, so the **conclusion holds**; only the
  method is narrower than advertised. (They are present in `window.U11.unconfiguredCatalog`
  by design — fixture 18 asserts that catalog has 4 entries.)
- **`guard maintenance entries carry no token totals` (case 52)** — not vacuous: guarded by
  `cards.length > 0`, and in the harness's real state (ledger tab, advanced) all **8** op-cards
  are rendered with non-empty `innerText` (lengths 402/259/188/132/112/136/171/529), Codex card
  phase count 5. Genuine check.
- **`underscores === 0` in all 40 matrix cases** — not vacuous (paired with `page>=1`,
  `rail>=10`), but it inspects rendered text only and additionally rejects `[hidden]`
  subtrees. Scope measured: 7,001 chars of the overview pane out of 420,596 serialized DOM
  chars — the placeholder-underscore guarantee covers **~1.7% of the document, one pane of 13**,
  at every width.

## 5. What "80/80 green" actually covers

| block | cases | what is asserted |
|---|---|---|
| matrix (8 themes × 5 widths) | 40 | pane exists, ≥10 rail items (actual 15), 0 underscores in the overview pane, 0 console errors, `data-theme` attr |
| interactions | 6 | real clicks: scope picker, disclosure, settings sheet, export, refresh, console errors |
| new behavior / corrections / guards | 15 | mixed DOM + `window.U11` |
| fixtures 1-18 | 18 | **17 of 18 are pure `window.U11` object assertions** — no DOM, no render |
| context details | 1 | DOM text |

So 40 of 80 cases are the same five-counter smoke check repeated across theme×width, and 18
of 80 (17 fixtures + `guard cost identity`) assert only in-memory fixture data in a file named
`visual-interaction-test-report.json`. No case asserts layout integrity. I measured that
unasserted dimension myself (`replay-matrix-coverage-probe.json`): at 900/1280/1700/2200/2500 px
there is **no horizontal overflow and zero overflowing elements** — so the gap in coverage does
not hide a defect, but 80/80 green is not evidence about layout either way.

## 6. Integrity of the original

- All **80** baseline hashes in `scratchpad/baseline-concept-hashes.txt` re-verified after the
  replay: **identical**, zero mismatches (`scratchpad/final-concept-hashes.txt`).
- `find … -newermt "2026-08-17"` over `QwenUsageConcept/`: **0 files**. Nothing in the concept
  was created, modified, or deleted; its own `reports/visual-interaction-test-report.json` and
  `verify-shots/*.png` still carry their 2026-08-13 mtimes.
- No git write command, no build/assemble script, and the concept's own `u11-verify.mjs` was
  never executed in place.
