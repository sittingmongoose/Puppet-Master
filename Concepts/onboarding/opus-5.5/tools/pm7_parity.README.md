# PM7 parity

```sh
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs baseline.html candidate.html --out /absolute/evidence/run
```

Node 22+, `agent-browser` on PATH, and the host's GPU are required. There are no npm dependencies.
Inputs are self-contained PMConcept7 or LeftRailPMConcept7 file pairs. Both sides use identical
agent-browser launches, host, DPR 1, viewport, media, locale and timezone. The document bytes are
fulfilled unchanged at the same synthetic file URL in separate browsers. Relative external assets
are therefore unsupported; embedded data/blob assets work. HTTP(S)/WebSocket/FTP requests are blocked.

```sh
git show 91649c220f:Concepts/PMConcept7.html > /absolute/evidence/baseline.html
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs /absolute/evidence/baseline.html Concepts/PMConcept7.html \
  --subset 'looks=glass-dark,nier-light;pages=home,chat;states=rest,theme-menu;viewports=wide' \
  --concurrency 4 --out /absolute/evidence/iteration
```

`--concurrency` caps **browsers**, not pairs. Default 4 runs two pairs; 1 runs sequentially;
3/5 use 2/4 browsers. Values outside 1..6 are errors. Respect any lower per-worker cap (this
wave: 4). SIGINT/SIGTERM and normal completion close the owned agent-browser sessions and profiles.
No remote GPU mode is implemented.

`--subset` accepts semicolon-separated `looks=`, `pages=`, `states=` and `viewports=` filters.
Quote semicolons. Unknown IDs and empty selections fail. `--list` prints the selected matrix without
opening a browser. `--matrix FILE` accepts an extended state file with the same schema.

## Sampling and exactness

Default **native mode** calls `DOMSnapshot.captureSnapshot` once per side/state, with every standard
computed property enumerated from Chrome and `includeDOMRects: true`. Node hashes property names and
values from the returned string table by stable tag/ordinal DOM path, including generated pseudo
nodes. It retains DOM paths for nodes without layout objects. These paths have an explicit null
style record: their computed properties are **not sampled**. Non-generated pseudo styles are also
unsampled. Custom properties (`--*`) are excluded: unused token removal is an intended purge action.
This default was directed by the purge lead in mailbox message `1018235310-e6f8` after the exhaustive
sampler proved too slow. It does not claim exhaustive hidden/custom-style parity.

`--deep` uses the exhaustive CSSOM sampler: every element (including hidden elements and open shadow
roots), `::before`, `::after`, list `::marker` and input/textarea `::placeholder`, with **all** enumerated
properties including custom properties. Unused custom-property removal will fail this mode. It can
take several minutes per state on this 20,000-element page. Individual capture timeout: 20 minutes.
No sampling failure automatically switches modes.

Deep mode temporarily interns large CSS image data URLs during style capture, restores original CSS
text in `finally`, and reconstructs the original property strings **before** SHA-256 hashing. This
avoids repeatedly serializing about 4.8 MB of inherited wallpaper tokens per element. A direct audit
of the first 12 nodes/pseudos checks reconstructed values against unmodified CSSOM values on each
browser's first capture. Screenshots are taken before this transaction. Other properties are not
masked. A property-count check falls back to full enumeration whenever the fast name list is incomplete.

Both modes require equal style hashes. Screenshots compare every RGBA channel. Exact mode requires
zero differing pixels. Explicit later-work tolerance is available:

```sh
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs baseline.html candidate.html \
  --tolerance 2 --max-diff-pixels 100 --out /absolute/evidence/tolerant-run
```

The report preserves both raw differing-pixel counts and counts above the stated channel tolerance.
Style equality remains exact. Every raw pixel difference produces a heat-map PNG, even if tolerated.
There are no automatic retries, masks, learned baselines or silent tolerance increases.

## Determinism

- Date and performance use one manually advanced clock, epoch `1789000000000`.
- Math.random uses a fixed LCG seed, `0x9e3779b9`, reset before each group load.
- Timers run in due-time/registration order. Each explicit advance paints one synthetic rAF generation.
  Idle callbacks are scheduled on the same clock. Native double-rAF barriers allow layout to commit.
- CDP Animation playback rate is 0; finite animations finish, infinite animations pause at time 0,
  and SVG animation clocks pause at 0. This checks settled states, not animation timing.
- Both OS reduced-motion media and the concept's persisted Reduce animations setting are enabled.
- Local/session storage is cleared and seeded before load. PM_DEMO's clock is paused when assigned.
- Fonts and images are awaited, caret is hidden, and timezone/locale are UTC/en-US.

GPU rasterization and native layout/font/image tasks remain browser implementation details. Exact
mode reports any resulting nondeterminism as a difference; it never relaxes the gate. Do not compare
screenshots produced on different hosts. Closed shadow roots, child-frame documents and offscreen
scroll contents are outside the current traversal/capture contract.

Glass creates fresh opaque Blob URL identifiers in each browser. Both samplers replace only actual
CSS `url(blob:...)` references with the SHA-256 of the exact Blob bytes plus MIME type, retaining any
fragment. Quoted text containing a URL is unchanged. Unknown Blob references are harness errors.
Reports retain the URL-to-content identities and original property strings for differing resources.
This canonicalizes resource identity without ignoring image content or changing pixels.

The shared pipe transport uses an uncompressed local WebSocket because Node 22's built-in client
rejects large decompressed PM7 protocol replies. The frame reader supports fragmentation, UTF-8,
masking and ping/pong, and bounds a message at 512 MiB. It does not change Chrome's GPU flags.
Parity uses the same agent-browser admission and CDP driver interface through a direct connection;
this avoids the old NUL-pipe parser's repeated copying of large snapshot replies.

## Default states

`pm7_parity_states.json` owns the list; no tour steps are included. Viewports are 1600×900 and
900×900. This is the smallest window width measured by the canonical Home centre-width ladder
(`Plans/FinalGUISpec.md`, F3-636). The whole desktop page cannot reach the Wizard and card hover states
at the onboarding-only state-shot tool's 390px width. The 900px case exercises the Home narrow ladder
and compact shell; pre-existing overflow is not an assertion of responsive design quality.

| Surface | States per look/viewport |
|---|---|
| Home | rest, hover, focus, theme-menu, home-menu, onboarding-welcome |
| Projects | rest, hover, focus, theme-menu, project-menu, project-hover, search-focus |
| Planning Wizard | rest, hover, focus, theme-menu |
| Orchestrator | rest, hover, focus, theme-menu |
| Usage | rest, hover, focus, theme-menu, usage-hover, usage-menu |
| Settings | rest, hover, focus, theme-menu, nier-popover (dialog) |
| Chat | rest, hover, focus, theme-menu, chat-focus, chat-popover |

Hover/focus use the title-bar Theme control; page-specific states add card/input coverage. Chat is
Home with its composer revealed. The ten looks are Basic/Friendly/Glass/Retro/NieR × dark/light.
Total: **38 states × 10 looks × 2 viewports = 760 comparisons**. Click/hover targets must be visible,
enabled, and pass a real hit test. Focus must reach its intended control. Unreachable states are
harness errors, never skipped cases. Add states as declarative steps: click, hover, focus or eval,
with an optional visibility assertion. Each group replays states in file order.
Focus primes keyboard modality with a Tab whose default traversal and product handlers are blocked,
then focuses the specified control; unrelated controls do not receive a preliminary focus event.

## Results

The default output is a timestamped directory under the wave's external A0-parity evidence folder.
Existing reports/progress files are never overwritten. Outputs:

- `report.json`: every state, input/matrix hashes, styles, pixel counts, differences, diagnostics,
  verdict, wall time, sampled peak aggregate RSS, Git head and executed source-file hashes.
- `summary.md`: short result and failing states.
- `progress.jsonl`: completed states as the run proceeds.
- `states/*.baseline.png`, `*.candidate.png`, and `*.diff.png` for raw pixel mismatches.

Artifacts have SHA-256 values in each row. `--first N` controls the first differing elements whose
property/value differences are included. Exit codes: **0 parity, 1 differences, 2 harness error**.
RSS is sampled every two seconds from the harness, adapter and Chrome process IDs; shared pages can
be counted once per process. It is a sampled upper aggregate, not a kernel maximum-resident-set reading.

```sh
node --test Concepts/onboarding/opus-5.5/tools/pm7_parity.test.mjs Concepts/onboarding/opus-5.5/tools/cdp-websocket.test.mjs
```
