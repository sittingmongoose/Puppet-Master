# PM7 parity

```sh
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs baseline.html candidate.html --concurrency 4 --out /absolute/evidence/run
```

Node 22+, GPU agent-browser and no npm dependencies. Remote controller mode also needs OpenSSL on PATH. Inputs are self-contained PMConcept7 or
LeftRailPMConcept7 HTML files. A pair stays in one Chrome/GPU process. Each input/load gets a fresh
browser context; source bytes are fulfilled unchanged at the same intercepted file URL. Relative
external assets are unsupported. HTTP(S), WebSocket and FTP requests are blocked.
Fetch interception checks actual schemes; CDP substring URL globs are avoided because they can
block SVG data URLs containing an HTTP namespace. WebSocket construction is blocked before connection.

```sh
git show 91649c220f:Concepts/PMConcept7.html > /absolute/evidence/baseline.html
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs /absolute/evidence/baseline.html Concepts/PMConcept7.html \
  --subset 'looks=glass-dark;pages=home;states=rest,theme-menu;motions=reduced;viewports=wide' \
  --out /absolute/evidence/iteration
```

`--concurrency` is the browser/worker cap, default 4, allowed 1..6 locally and 1..8 remotely. Each worker renders its baseline
sequence, then the identical candidate sequence. Respect the wave cap of four owned browsers.
Fresh contexts share that browser's GPU process. Normal completion and signals stop owned sessions.

Opt-in remote GPU sessions use `gpu-browser`; local invocation remains unchanged:

```sh
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs baseline.html candidate.html \
  --host windows --serve-host 192.168.50.179 --concurrency 8 --out /absolute/evidence/windows
```

Default remote CDP uses `gpu-browser connect` with authenticated SSH to loopback. A forwarding
restriction fails startup and cleans the session; it never falls back. If the trusted-LAN route is
authorized, `--remote-cdp lan` explicitly uses `gpu-browser connect --lan` and permits its remote
WebSocket endpoint. The Windows key on the P1000 currently forbids SSH forwarding, so that route
needs this explicit option. The LAN listener ends when the session stops.

The controller starts a temporary HTTPS input server on its LAN address (`--serve-host`, auto-selected
only with one non-loopback IPv4). Each worker has one unguessable document URL, shared by its two
inputs and inert storage probe. It serves exact source bytes with `no-store`; all other routes return
404. A one-day self-signed certificate is generated in a removed temporary directory;
certificate errors are ignored only in disposable remote browsers. This preserves native WebCrypto
without changing any hashing code. Only that exact top-level document is permitted through the existing request gate; all other
HTTP(S)/WebSocket/FTP requests remain blocked. Storage is still checked in every fresh context.
Relative external assets remain unsupported. Remote HTTPS and local file origins are recorded; no
cross-transport or cross-host parity claim is made.

Every row records the rendering host, GPU renderer, Chrome build, session and transport. Both sides
stay in one Chrome process. Remote sessions receive minute keepalives; completion, startup failures
and signals stop and purge owned sessions. Cleanup status appears per browser in the report.
Remote memory measurements cover only the controller, never unrelated local processes whose PIDs
match remote Chrome PIDs. Respect the assigned fleet limits; this worker's cap is eight on either host.

`--subset` accepts semicolon-separated looks, pages, states, viewports and motions filters. Quote
semicolons. Repeated filters union their IDs. Unknown IDs and empty selections fail. `--list` shows
the expanded matrix without browsers. `--matrix FILE` accepts extended state data.

## Style contract

Default native mode captures every standard computed property through DOMSnapshot, including
generated pseudo nodes, keyed by stable tag/ordinal DOM paths. It retains null style records for
nodes without layout objects. Their computed values and non-generated pseudo styles are unsampled.

Native mode also hashes custom properties the input JavaScript reads. Literal getPropertyValue calls
are unioned from BOTH inputs; concatenated/template prefixes expand against declared and root-enumerated
names. Current PM7 has about 60 literal names plus the `--lg-wall-` wallpaper family.
Dynamic property names actually read by page JS are recorded per document too; sampler reads are
excluded from that recorder. A newly observed name conservatively changes that state's hash.
Chrome rejects custom names in DOMSnapshot, so CSSOM samples these values on accessible layout elements and generated
pseudos. Any unmatched layout path fails that row as unsampled-custom-layout, even when both sides
skip it. Complete hidden closed-root sampling is not claimed. Other custom properties are excluded,
allowing removal of unused tokens.

The lead approved the native/exhaustive split in mailbox 1018235310-e6f8. Review correction adds the
JS-read token union; native mode does not claim exhaustive hidden/custom-property parity.

`--deep` samples every actual element, hidden elements and open shadow roots, before/after, marker
and form placeholder with ALL enumerated standard/custom properties. Unused token removal fails
this mode. It can take several minutes per state; individual evaluation timeout is 20 minutes.
No failure automatically switches sampling modes.

Custom/deep CSSOM sampling temporarily interns large image data URLs, restores CSS in finally and
reconstructs original values before hashing. Values are deduplicated before hashing, avoiding huge
inherited wallpaper strings per element. Direct audits compare unmodified and reconstructed values:
eight records per custom pass and twelve elements/pseudos on the first deep capture. Screenshots
precede this transaction. No property is masked. Deep enumeration checks its cardinality and falls
back to complete enumeration when necessary.

Only actual CSS url(blob:...) references canonicalize opaque UUIDs to exact Blob-byte SHA-256 plus
MIME type, preserving fragments. Quoted URL-like text is unchanged. Unknown Blob references error.
Caret hiding is enabled ONLY for screenshots; both style samplers and diagnostics disable the
caret sheet so original caret-color values remain in the hash. Every accessible element/pseudo
resolves its caret value first, avoiding cached inherited values in DOMSnapshot. Caret-color
transitions caused by either toggle finish explicitly. Style resolution can expose deferred entry
animations, so this resolution and settled-animation preparation precede screenshots too. Finite
animations finish; infinite animations pause at zero; any unresolved animation fails capture.
Preparation counts are recorded per side without advancing the logical clock.

A separate CSSOM rule-text guard compares selection, webkit-scrollbar, webkit-slider and webkit-search
pseudo rules whose computed nodes are unavailable. Changes fail conservatively and report first rule
texts. Removed style/script/hidden nodes are labelled non-rendered DOM-only differences; they still
fail exact parity. Standard layout changes are reported separately.

## Pixels and measured variation

Exact mode requires zero differing RGBA pixels and equal styles, state, requests and special-rule
hashes. It never retries a candidate, masks pixels or increases tolerance. Explicit fixed tolerance:

```sh
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs baseline.html candidate.html \
  --tolerance 2 --max-diff-pixels 100 --out /absolute/evidence/tolerant
```

Raw counts are always retained. Styles remain exact. Raw differences always produce heat maps.
When raw pixels differ but that fixed gate passes, the verdict is PASS-TOLERANT.

Identical inputs can produce different GPU pixels despite stable styles and settled frames. The lead
accepted separate raw exact and measured-envelope verdicts in mailbox 1019010702-321f:

```sh
node Concepts/onboarding/opus-5.5/tools/pm7_parity.mjs baseline.html candidate.html \
  --baseline-repeats 8 --out /absolute/evidence/measured
```

Default repeats 1 leaves exact mode unchanged. Explicit 2..8 cannot combine with tolerance or deep.
Only raw pixel failures with exact styles/state/requests/rules trigger baseline replays. Every repeat
must retain the original exact style hash, clock/state, errors, request lists and special-rule hash.
Replays complete the group before their next navigation, retaining full overlay/paint history.
The original candidate proof capture is never retried or replaced; restoration captures are discarded.

Ranges belong to each individual pixel AND channel. An exactly repeating pixel has zero allowance.
Candidate pixels outside observed ranges fail. Baselines also fail as unstable above either cap:
channel span 8; variable pixels 0.05% of viewport (720 wide, 405 narrow). Explicit
`--noise-max-channel-span N` and `--noise-max-pixels N` override the recorded caps.

Accepted noisy rows/runs are PASS-MEASURED, never bare PASS. They retain rawExactVerdict=FAIL and
all raw heat maps, baseline captures, min/max PNGs, observed-noise heat maps and outside counts.
No envelope is reused across runs. A real change inside the observed ranges cannot be distinguished
by that measured gate; exact styles remain mandatory. Exit 0 means the SELECTED gate passed;
consumers requiring zero pixels must require rawExactVerdict=PASS.

## Deterministic preparation

- Date/performance/document timeline/event timestamps share a manual clock, epoch 1789000000000.
  Math.random uses seed 0x9e3779b9, reset before each document. Timers run by due time/registration;
  each explicit advance paints one synthetic rAF generation, with native double-frame barriers.
- CDP animation playback is zero; finite animations finish, infinite animations pause at zero,
  SVG clocks pause at zero. This checks settled visuals, not animation timing.
- Each motion axis sets both media preference and the persisted Reduce animations setting.
- Each load creates a fresh incognito context. An inert same-origin probe verifies empty IndexedDB,
  cookies, local/session storage, caches and service-worker registrations before real navigation.
  Unsupported file-origin storage APIs are recorded. Disposing the context removes previous data.
  Local/session storage is seeded before app code; PM_DEMO pauses when assigned.
- All declared fonts receive an unmeasured font/paint preparation navigation before measurement.
  Fonts/images finish before capture; Home receives post-font layout work before routing away.
  Pointer position resets before navigation; CDP focus emulation removes window-activation variance.
- The existing pm-warm=0 test hook disables transient idle shader-prewarming DOM. Product UI and
  real Glass effects remain enabled. Timezone/locale are UTC/en-US. DPR is 1.
- Blocked/failed requests are recorded and compared. Synthetic image-interning requests are excluded
  from those diagnostics because they exist only inside the lossless capture transaction.

The local uncompressed WebSocket avoids Node 22's decompressed-message limit and the older pipe's
repeated large-message copies. It supports masking, fragmented UTF-8 and ping/pong, bounded at 512 MiB.
GPU rendering flags remain those of agent-browser; software renderers fail startup.

## State coverage

Ten looks: Basic/Friendly/Glass/Retro/NieR, dark/light. Viewports: 1600x900 and 900x900. The latter is
the smallest desktop width measured by FinalGUISpec F3-636; 390px cannot reach the whole desktop
Wizard/card states. Pre-existing overflow is not an assertion of responsive quality.

| Surface | Reduced-motion states | Full-motion subset |
|---|---|---|
| Home | rest, hover, focus, theme-menu, home-menu, onboarding-welcome (6) | rest, theme-menu, home-menu, onboarding-welcome (4) |
| Projects | rest, hover, focus, theme-menu, project-menu, project-hover, search-focus (7) | rest, theme-menu, project-menu (3) |
| Wizard | rest, hover, focus, theme-menu (4) | rest, theme-menu (2) |
| Orchestrator | rest, hover, focus, theme-menu (4) | rest, theme-menu (2) |
| Usage | rest, hover, focus, theme-menu, usage-hover, usage-menu (6) | rest, theme-menu, usage-menu (3) |
| Settings | rest, hover, focus, theme-menu, nier-popover dialog (5) | rest, theme-menu, nier-popover (3) |
| Chat | rest, hover, focus, theme-menu, chat-focus, chat-popover (6) | rest, theme-menu, chat-popover (3) |

Reduced: 38 x 10 x 2 = 760. Full: 20 x 10 x 2 = 400. Total: **1,160 comparisons** in 280 groups.
Chat is Home with its composer revealed. Hover/focus use the Theme control; specific states add card
and input coverage. Click/hover targets must be visible, enabled and pass actual hit tests. Keyboard
focus must reach its target AND match :focus-visible. Dialog/menu assertions identify their owning
surface/trigger. Unreachable states error, never skip. Focus primes keyboard modality without tabbing
through unrelated controls. Add declarative click/hover/focus/eval steps and ownership checks in JSON.

This is a starting interaction list. Removals touching other hover/focus, onboarding, Settings or
motion rule families must add states before claiming coverage. Full-motion hover/focus, high-DPI
media rules, offscreen scroll contents, child frames and complete closed-shadow sampling are not
covered. No cross-host pixel equivalence is claimed.

## Artifacts

Default output: timestamped directory in the wave's external A0-parity evidence folder. Existing
reports/progress are never overwritten. JSON includes source/input/matrix hashes, every state,
raw and selected verdicts, property/rule/DOM diagnostics, storage/request/state checks, wall time,
sampled RSS, Chrome/GPU details and session IDs. Markdown summarizes failures and measured states.
Every Markdown state row and CLI progress line distinguishes raw exact from the selected verdict.
PNG baseline/candidate captures are always retained; raw mismatches add diff PNGs. Measured states
add noise-baseline-N, low/high range and noise-heatmap PNGs, each with SHA-256 in the JSON.

`--first N` controls detailed differing elements/rules. Exit codes: 0 selected gate passed,
1 differences, 2 harness error. RSS is sampled every two seconds across harness/Chrome processes;
shared pages may count per process. It is not a kernel peak reading.

```sh
node --test Concepts/onboarding/opus-5.5/tools/pm7_parity.test.mjs Concepts/onboarding/opus-5.5/tools/cdp-websocket.test.mjs Concepts/onboarding/opus-5.5/tools/pm7_parity_remote.test.mjs
```

The opt-in GPU caret regression uses one browser at a time. Its unchanged control must pass;
caret-only mutations must fail with transition:all and with transitions disabled, with zero pixels.
It also exercises real PM7 onboarding welcome in both motion modes, requiring settled preparation
and exact styles. Any raw-pixel failure in that real-page preparation test remains in its report.
Set PM7_PARITY_REGRESSION_OUT to a new external directory to retain captures and validation.

```sh
PM7_PARITY_GPU_REGRESSION=1 node --test Concepts/onboarding/opus-5.5/tools/pm7_parity.caret.test.mjs
```
