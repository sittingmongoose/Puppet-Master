# A-remote: remote PM7 parity

**Status:** remote harness implementation and the lead-authorized bounded follow-up are complete. **LeftRail is not fully covered.** The Mac matrix stopped with **ERROR after 162/1,160 rows**; the remaining 998 rows are unattempted. `codex-a0-parity` owns the full VM Rail run. No candidate parity or landing approval is asserted.

Branch: `concept/pm7-parity-remote-20261019`, based on `f9536abd6a`. Final implementation: `c1732b18a5a29dc1008ad41eba9a5bdcea1b2c07`. The lead owns integration and landing. This branch changes harness tooling and this report only; generated pages, product sources, Plans and governance artifacts are unchanged.

Scope decision: lead mail `1019055406-9198` stopped remote full matrices, assigned Rail to the VM, limited interception diagnosis to 30 minutes, and authorized N>=3 same-Mac controls with descriptors for the six layout rows after a fix. That instruction is retained in `scope-handoff.txt`. The optional Mac proof-copies matrix and the nine-row N8 pixel surveys were not run under this stop instruction.


## Mechanism

`--host windows|mac` opts into GPU Browser Fleet. Remote concurrency is 1..8; local remains 1..6 with default 4. Each worker gets its own Chrome process, and that same process renders both baseline and candidate. Every real document load gets a fresh context and the existing storage isolation audit. Rows retain host, GPU renderer, full Chrome version/revision, session, transport and document URL.

Input delivery preserves `file:///__pm7_parity__/input.html?o55=off&o55scenario=fresh&pm-warm=0`. CDP `Fetch.fulfillRequest` supplies the original input bytes. No browser filesystem/UNC access or content server is needed. The final implementation adds no rendering flags or TLS exceptions.

Remote CDP defaults to authenticated SSH. Windows forwarding from the controller was refused with `administratively prohibited`; Windows tests therefore use the explicit `--remote-cdp lan` option. Mac uses SSH. There is no automatic fallback. Session stop removes the explicit LAN exposure. Remote PID values are never looked up in local `/proc`; remote datasets report controller RSS only.

Remote navigation waits for the exact frame and loader returned by `Page.navigate`, including a matching load event received before the reply, and rejects failed/non-document navigation. Local navigation is unchanged. This guard did not cure the observed Windows control drift. Minute keepalives renew leases; normal completion, startup failure and signal paths stop and purge owned sessions. Native reports retain cleanup receipts.

Original DOM-only descriptions are extracted from the same native snapshot: every differing DOM-only path retains tag, ID, class and layout status. They are diagnostic metadata. The original full run did not serialize IDs/classes for paths with a layout style on either side; later descriptor snapshots are explicitly labelled fresh observations and do not reconstruct those missing original identities.

Final gate identity check passes against `f9536abd6a`: `compare`, `prepareCapture`, `capture` and `loadPreparedGroup` are byte-identical after excluding only the added row/browser/DOM metadata. No comparison, pixel-envelope or preparation code is excluded. The final remote-only marker blocking change is described below; default local network policy remains the original empty blocklist.


## Proofs and hosts

Final controller tests: **16/16 pass, no skips**. Windows Node **22.18.0** ran **15/15 tests** at `52ec1084f1`; the later URLPattern regression was not rerun as a Windows unit job. The four generator checks and four reference-page hashes pass against `91649c220f`; generated pages and generator inputs were unchanged after that proof.

| Dataset | Host / GPU | Chrome / transport | Result |
|---|---|---|---|
| PM7 six-state qualification + sensitivity | Windows / RTX 3090 | Chrome/155.0.8059.82 / LAN | FAIL; no concurrency qualifies |
| PM7 six-state qualification + sensitivity | Mac / Apple M3 | Chrome/155.0.8059.80 / SSH | PASS at 4 workers |
| LeftRail candidate, partial | Mac / Apple M3 | Chrome/155.0.8059.80 / SSH | ERROR; 162/1160 |
| Six layout-state controls, 3 fresh main loads | Mac / Apple M3 | Chrome/155.0.8059.80 / SSH | 18 captures; 1 raw pixel self mismatch; no layout drift |
| Proof-copies full main/main | Mac | not started | Not run after lead stop |

Windows renderer: `ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 (0x00002204) Direct3D11 vs_5_0 ps_5_0, D3D11-32.0.16.1088)`; revision `@c56fe5daef8be123f68808a4bb705ff378cd2019`. Mac renderer: `ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Version 27.2 (Build 26B5112a))`; revision `@43a195105613ac83c21d3f14de279f4a045c7da0`. Those identifiers are also recorded per native row. All baseline/candidate comparisons stay within one host/build. Windows qualification uses PM7 C9/C8; the full candidate run uses Rail 2a9/1efc. The VM PM7 comparison is a different variant, so these datasets cannot establish a host effect by comparison with it.


### Windows qualification

The six IDs are Basic Dark, Retro Light and NieR Dark; Home rest/theme-menu; 1600x900; reduced motion. The sensitivity candidate changes only the Retro Light Home tab font from 12px to 13px and adds 67 source bytes. Qualification requires exactly its two target rows to fail and all four controls to pass exactly. A probe validation PASS means that expected failure pattern, not parity of the mutation.

| Probe | Workers | Validation | Exact passes / 6 | Native failing IDs |
|---|---|---|---|---|
| self | 2 | PASS | 6 | none |
| mutation | 2 | FAIL | 2 | basic-dark--home--rest--wide--reduced, basic-dark--home--theme-menu--wide--reduced, retro-light--home--rest--wide--reduced, retro-light--home--theme-menu--wide--reduced |
| self | 1 | FAIL | 4 | retro-light--home--rest--wide--reduced, retro-light--home--theme-menu--wide--reduced |
| mutation | 1 | FAIL | 2 | basic-dark--home--rest--wide--reduced, basic-dark--home--theme-menu--wide--reduced, retro-light--home--rest--wide--reduced, retro-light--home--theme-menu--wide--reduced |

No concurrency qualified. In the final serial main/main fallback, Retro Light controls differ on 366 paths (354 DOM-only and 12 layout), with zero changed pixels. Earlier committed main/main at 3 passed 6/6, while its mutation failed controls. Independent controllers with six total sessions also failed controls. An earlier serial mutation had exactly the two intended failures. Those isolated successes do not override the capped sequence failure. The final descriptor-only diagnostic passed 6/6 and likewise does not negate prior failures.

Initial HTTP trials failed before comparison because native WebCrypto was unavailable. HTTPS and fulfilled-document trials showed intermittent hidden DOM ordinal shifts. Restoring the original virtual file origin preserves the contract but did not establish a cure. A four-load, one-browser Basic Dark diagnostic retained stable body order in that sample; it does not explain the broader drift. An equal-length mutation was proposed, rejected for qualification, and never executed. The cause of Windows instability remains unestablished; no full Windows Rail matrix started.


### Mac qualification

| Probe | Workers | Exact pass / fail | Validation |
|---|---|---|---|
| self | 4 | 6 / 0 | PASS |
| mutation | 4 | 4 / 2 | PASS |

Main/main passed 6/6. The sensitivity probe failed only `retro-light--home--rest--wide--reduced` and `retro-light--home--theme-menu--wide--reduced`, 3,662 raw pixels each; its other four rows passed exactly. Selected concurrency was 4. All eight qualification sessions stopped and purged.


## Interrupted LeftRail candidate

Baseline: `10b644d389845b28e2bdb3d39397f6eaf66c7b17`; candidate: `a6d9473cec4e67056a33886bc389786aee0ec624`. Both inputs are exact Git blobs of `Concepts/LeftRailPMConcept7.html`. The extracted inputs are pinned below.

| Input | Bytes | SHA-256 |
|---|---|---|
| baseline-pm7.html | 26877821 | `c9f36c8739680cb3c325a0d04bfe6d7cf937252991c1734c560db69be0afcd52` |
| baseline-rail.html | 27512368 | `2a9ca6fb46507be5ea482e578d79df4192b6348be88b5c3b9a138934c27c8a73` |
| candidate-rail.html | 26732219 | `1efcffa73c8d3adae6be57bcefb0f9282be78f6b59c37d87697b20774efc8681` |

Executed harness head: `e49d5e0bb34b5ff37e3d9140c8f64c47dab5e33e`. Four Mac workers; baseline repeats requested 8; tolerance 0; max-diff-pixels 0; existing envelope caps channel span 8 and ceil(viewport pixels * 0.0005). No allowances were applied because every completed row has a strict style difference. Original verdicts and screenshots remain unchanged.

Native aggregate: **ERROR**, raw aggregate **ERROR**, 162 completed, 0 pass, 162 fail, one harness error; wall time 1149.35 seconds. There are 30 complete groups, zero partially recorded groups, 250 missing groups, and 998 unattempted cases. Completed rows include 153 zero-pixel rows, 9 pixel rows, and 6 layout-record rows. State, request, runtime-error and special-rule comparisons are equal in all completed rows; custom coverage is complete.

Worker 3 failed with `CDP -32602: Invalid InterceptionId.` during the Glass Dark / Projects / wide / reduced group. That original error did not preserve its request URI. All four matrix sessions stopped and purged. The bounded fixture below establishes a reproducible race class and fix, but cannot identify the missing URI or prove it caused this original interruption. The original run remains ERROR; no full rerun was made after the fix.


### Nine original pixel rows

Bounds are inclusive [xmin,ymin,xmax,ymax]. Raw and selected verdicts remain FAIL. N8 surveys/outside-envelope counts were not produced after the lead stop; none of these rows is reclassified as noise.

| State | Raw pixels | Max channel delta | Bounds | Raw exact | Selected |
|---|---|---|---|---|---|
| basic-dark--chat--focus--wide--reduced | 2 | 2 | [65,73,67,75] | FAIL | FAIL |
| basic-dark--projects--theme-menu--wide--reduced | 1 | 1 | [522,170,522,170] | FAIL | FAIL |
| basic-light--settings--nier-popover--wide--reduced | 1 | 1 | [65,75,65,75] | FAIL | FAIL |
| friendly-dark--settings--rest--wide--reduced | 1 | 37 | [862,752,862,752] | FAIL | FAIL |
| friendly-light--settings--focus--wide--reduced | 3 | 40 | [77,79,862,752] | FAIL | FAIL |
| friendly-light--settings--rest--wide--reduced | 1 | 40 | [862,752,862,752] | FAIL | FAIL |
| glass-dark--home--rest--wide--reduced | 10 | 1 | [1,122,1,137] | FAIL | FAIL |
| glass-dark--wizard--focus--wide--reduced | 1 | 1 | [63,115,63,115] | FAIL | FAIL |
| glass-dark--wizard--theme-menu--wide--reduced | 11 | 1 | [1,115,63,137] | FAIL | FAIL |


### Six original layout rows and authorized N3 controls

| Original state | Original DOM-only / layout | Fresh main samples | Style + behavior vs original baseline | Raw main-self pixel comparisons |
|---|---|---|---|---|
| basic-light--chat--chat-focus--wide--reduced | 355 / 18 | 3 | all exact | sample 2: 23 px, delta 1; sample 3: 0 px, delta 0 |
| basic-light--chat--chat-popover--wide--reduced | 355 / 18 | 3 | all exact | sample 2: 0 px, delta 0; sample 3: 0 px, delta 0 |
| basic-light--chat--focus--wide--reduced | 355 / 18 | 3 | all exact | sample 2: 0 px, delta 0; sample 3: 0 px, delta 0 |
| basic-light--chat--hover--wide--reduced | 355 / 18 | 3 | all exact | sample 2: 0 px, delta 0; sample 3: 0 px, delta 0 |
| basic-light--chat--rest--wide--reduced | 355 / 18 | 3 | all exact | sample 2: 0 px, delta 0; sample 3: 0 px, delta 0 |
| basic-light--chat--theme-menu--wide--reduced | 355 / 18 | 3 | all exact | sample 2: 0 px, delta 0; sample 3: 0 px, delta 0 |

The final `c1732b18a5` source ran the entire original Basic Light Chat wide/reduced six-state sequence three times on fresh main contexts in one Mac Chrome process (18 retained captures). All 18 matched original baseline style hash, state, requests, runtime errors, special rules and custom coverage. All 12 main-self comparisons matched styles and those behavior checks. Eleven pairs were pixel-exact. Chat-focus sample 2 vs sample 1 had **23 raw pixels, max delta 1, bounds [742,232,742,254]**; sample 3 was exact. That mismatch is retained as a raw self failure. No N8 envelope or waiver was applied.

These controls did not reproduce layout drift. In all fresh observations, `/html[1]/body[1]/div[17]` was `div#pmh-probe`, class null, with layout. The first five retained `i` children had `data-pmh-kind` values `icon`, `ctl`, `tile`, `row`, `card`, null IDs/classes and layout. Descriptors were taken separately after the retained capture and checked against captured identities. Their owner was `script#pm-o55-js` at native script[19], content 2,003,518 bytes, SHA-256 `d09b5c1ea2bb0426dd08562c8f306d89cc56ea0117eca8c0d7f6e0b1cb573c73`. Software fallback probes were known/false, and `pmh-soft` was false in all 18 observations.

Original layout-parent IDs/classes were not serialized. The original captured DOM-only records do retain `button#fmCtxPaste.fm-ctx-item` at baseline div[18]/button[8] and candidate div[17]/button[8]. Fresh main descriptors cannot recover the original candidate parent identity or prove why its ordering differed. Static `ensureProbe()` text is identical between inputs (411 bytes; SHA-256 `671dc1af9720dbc9a113590395b8363ad2384af75eef9e0a5178927cebbf56bc`), while the enclosing pm-o55-js scripts differ. Native Worker and MessageChannel callbacks remain plausible ordering inputs, not a demonstrated cause.


## Bounded interception diagnosis and fix

**Where:** remote `configurePage` Fetch interception of synthetic `file:///__pm7_parity_asset__/` sampler markers. **Why:** a controlled fixture cancels a paused marker with `window.stop()` after document load and delays its controller reply by 100 ms; replying to the cancelled interception reproduces the exact -32602 error. The original 162-row error lacks URI evidence, so its precise attribution stays unproven. **Fix:** remote-only scheme-aware `Network.setBlockedURLs.urlPatterns` preblocks the already-excluded marker path before Fetch; every real request continues through the original guard, and every remaining interception error is still fatal.

| Controlled policy | Paused markers | Interception errors | SVG pixel | Real HTTPS blocked |
|---|---|---|---|---|
| original | 1 | 1 | [10,20,30,255] | True |
| legacy | 0 | 0 | [206,222,249,255] | True |
| urlpattern | 0 | 0 | [10,20,30,255] | True |

The legacy URL glob was rejected: it also blocked a valid data-SVG whose XML comment contains marker text, changing its rendered pixel. The final URLPattern preserved [10,20,30,255] and blocked the real HTTPS fixture request while avoiding a paused marker. The final fixture imports the actual committed policy. No catch-and-ignore path or verdict change was introduced. Richer remote error context now retains URL (hashing data URLs), resource type, network ID, cancellation and marker status. The policy uses the [official CDP Network BlockPattern contract](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json), verified on this Mac Chrome 155 build; other browser versions were not qualified.

A same-input Glass Dark Projects diagnostic before the fix completed seven states without an interception error: five exact passes, two 10-pixel/max-delta-1 failures with exact styles. It did not reproduce the original interruption. Diagnosis and the controlled fix finished within the authorized 30-minute window; no further full remote matrix was attempted.


## Distinct original DOM-only records

There are **355 distinct original records**, deduplicated by full baseline/candidate metadata. The table below preserves every path and its original tag/ID/class/layout description; row membership and exact JSON are in `rail-analysis.json`. A record occurs once per listed row. `absent` is an absent ordinal record, not an identifier-based deletion claim. Layout is false for both sides of every present DOM-only record.

The static input census identifies **pm7-settings-data** as the removed script ID. **wpk-js remains in both inputs.** Its absence at native script[30] is a script-ordinal shift, not removal of wpk-js. That distinction does not waive any strict style failure.

| Native path | Original baseline | Original candidate | Rows |
|---|---|---|---|
| /html[1]/body[1]/script[30] | script / id=wpk-js / class=None / layout=false | absent | 162 |
| /html[1]/body[1]/div[18]/div[1] | div / id=None / class=fm-ctx-item pmw-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[2] | div / id=None / class=fm-ctx-item pmw-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[3] | div / id=None / class=fm-ctx-item pmw-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[4] | div / id=None / class=fm-ctx-sep pmw-ctx-sep / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[1] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[1]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[1]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[1]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[1]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[1]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[2] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[2]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[2]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[2]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[2]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[5] | div / id=None / class=fm-ctx-sep / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6] | div / id=None / class=fm-ctx-wrap / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[1]/svg[1]/line[1] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[2] | i / id=None / class=pm-ico fm-ctx-caret / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[2]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/button[1]/i[2]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1] | div / id=None / class=fm-ctx-sub / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[1] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[1]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[1]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[1]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[1]/i[1]/svg[1]/path[2] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[1]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[2] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[2]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[2]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[2]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[2]/i[1]/svg[1]/circle[1] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[2]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3]/i[1]/svg[1]/line[1] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[3]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4]/i[1]/svg[1]/line[1] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[4]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5]/i[1]/svg[1]/rect[2] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[6]/div[1]/button[5]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/i[1]/svg[1]/line[1] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[3]/span[2] | span / id=None / class=fm-ctx-key d-na / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4]/i[1]/svg[1]/rect[2] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[4]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5]/i[1]/svg[1]/path[2] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[5]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[7] | div / id=None / class=fm-ctx-sep / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1]/svg[1]/circle[1] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1]/svg[1]/circle[2] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1]/svg[1]/line[1] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1]/svg[1]/line[2] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/i[1]/svg[1]/line[3] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[6]/span[2] | span / id=None / class=fm-ctx-key / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[7]/span[2] | span / id=None / class=fm-ctx-key / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8] | button / id=fmCtxPaste / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/i[1]/svg[1]/rect[2] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[8]/span[2] | span / id=None / class=fm-ctx-key / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8] | div / id=None / class=fm-ctx-wrap / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[2] | i / id=None / class=pm-ico fm-ctx-caret / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[2]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/button[1]/i[2]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1] | div / id=None / class=fm-ctx-sub / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[1] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[1]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[1]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[1]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[1]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[1]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[2] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[2]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[2]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[2]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[2]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[8]/div[1]/button[2]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[9] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[9]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[9]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[9]/i[1]/svg[1]/line[1] | line / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[9]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[9]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[9] | div / id=None / class=fm-ctx-sep / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10]/i[1]/svg[1]/circle[1] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[10]/span[2] | span / id=None / class=fm-ctx-key / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1]/svg[1]/circle[1] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1]/svg[1]/circle[2] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1]/svg[1]/circle[3] | circle / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/i[1]/svg[1]/path[2] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[11]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12]/i[1]/svg[1]/rect[1] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12]/i[1]/svg[1]/rect[2] | rect / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[12]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/div[10] | div / id=None / class=fm-ctx-sep / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13] | button / id=None / class=fm-ctx-item / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13]/i[1]/svg[1]/path[2] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[13]/span[2] | span / id=None / class=fm-ctx-key / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14] | button / id=None / class=fm-ctx-item destructive / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14]/i[1] | i / id=None / class=pm-ico / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14]/i[1]/svg[1] | svg / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14]/i[1]/svg[1]/polyline[1] | polyline / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14]/i[1]/svg[1]/path[1] | path / id=None / class=None / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14]/span[1] | span / id=None / class=fm-ctx-label / layout=false | absent | 6 |
| /html[1]/body[1]/div[18]/button[14]/span[2] | span / id=None / class=fm-ctx-key / layout=false | absent | 6 |
| /html[1]/body[1]/div[17]/div[1] | absent | div / id=None / class=fm-ctx-item pmw-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[2] | absent | div / id=None / class=fm-ctx-item pmw-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[3] | absent | div / id=None / class=fm-ctx-item pmw-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[4] | absent | div / id=None / class=fm-ctx-sep pmw-ctx-sep / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[1] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[1]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[1]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[1]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[1]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[1]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[2] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[2]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[2]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[2]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[2]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[5] | absent | div / id=None / class=fm-ctx-sep / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6] | absent | div / id=None / class=fm-ctx-wrap / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[1]/svg[1]/line[1] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[2] | absent | i / id=None / class=pm-ico fm-ctx-caret / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[2]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/button[1]/i[2]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1] | absent | div / id=None / class=fm-ctx-sub / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[1] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[1]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[1]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[1]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[1]/i[1]/svg[1]/path[2] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[1]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[2] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[2]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[2]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[2]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[2]/i[1]/svg[1]/circle[1] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[2]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3]/i[1]/svg[1]/line[1] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[3]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4]/i[1]/svg[1]/line[1] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[4]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5]/i[1]/svg[1]/rect[2] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[6]/div[1]/button[5]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/i[1]/svg[1]/line[1] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[3]/span[2] | absent | span / id=None / class=fm-ctx-key d-na / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4]/i[1]/svg[1]/rect[2] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[4]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5]/i[1]/svg[1]/path[2] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[5]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[7] | absent | div / id=None / class=fm-ctx-sep / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1]/svg[1]/circle[1] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1]/svg[1]/circle[2] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1]/svg[1]/line[1] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1]/svg[1]/line[2] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/i[1]/svg[1]/line[3] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[6]/span[2] | absent | span / id=None / class=fm-ctx-key / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[7]/span[2] | absent | span / id=None / class=fm-ctx-key / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8] | absent | button / id=fmCtxPaste / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/i[1]/svg[1]/rect[2] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[8]/span[2] | absent | span / id=None / class=fm-ctx-key / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8] | absent | div / id=None / class=fm-ctx-wrap / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[2] | absent | i / id=None / class=pm-ico fm-ctx-caret / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[2]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/button[1]/i[2]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1] | absent | div / id=None / class=fm-ctx-sub / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[1] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[1]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[1]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[1]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[1]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[1]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[2] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[2]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[2]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[2]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[2]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[8]/div[1]/button[2]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[9] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[9]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[9]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[9]/i[1]/svg[1]/line[1] | absent | line / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[9]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[9]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[9] | absent | div / id=None / class=fm-ctx-sep / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10]/i[1]/svg[1]/circle[1] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[10]/span[2] | absent | span / id=None / class=fm-ctx-key / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1]/svg[1]/circle[1] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1]/svg[1]/circle[2] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1]/svg[1]/circle[3] | absent | circle / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/i[1]/svg[1]/path[2] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[11]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12]/i[1]/svg[1]/rect[1] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12]/i[1]/svg[1]/rect[2] | absent | rect / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[12]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/div[10] | absent | div / id=None / class=fm-ctx-sep / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13] | absent | button / id=None / class=fm-ctx-item / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13]/i[1]/svg[1]/path[2] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[13]/span[2] | absent | span / id=None / class=fm-ctx-key / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14] | absent | button / id=None / class=fm-ctx-item destructive / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14]/i[1] | absent | i / id=None / class=pm-ico / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14]/i[1]/svg[1] | absent | svg / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14]/i[1]/svg[1]/polyline[1] | absent | polyline / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14]/i[1]/svg[1]/path[1] | absent | path / id=None / class=None / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14]/span[1] | absent | span / id=None / class=fm-ctx-label / layout=false | 6 |
| /html[1]/body[1]/div[17]/button[14]/span[2] | absent | span / id=None / class=fm-ctx-key / layout=false | 6 |


## Every completed LeftRail row

These 162 entries are the complete original dataset. The other 998 planned rows have no verdict. No completed row is silently removed or relabelled.

| State | Raw exact | Selected | Raw pixels | Max delta | DOM-only | Layout styles |
|---|---|---|---|---|---|---|
| basic-dark--chat--chat-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--chat--chat-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--chat--focus--wide--reduced | FAIL | FAIL | 2 | 2 | 1 | 0 |
| basic-dark--chat--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--chat--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--chat--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--home--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--home--home-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--home--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--home--onboarding-welcome--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--home--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--home--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--orchestrator--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--orchestrator--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--orchestrator--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--orchestrator--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--project-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--project-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--search-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--projects--theme-menu--wide--reduced | FAIL | FAIL | 1 | 1 | 1 | 0 |
| basic-dark--settings--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--settings--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--settings--nier-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--settings--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--settings--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--usage--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--usage--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--usage--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--usage--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--usage--usage-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--usage--usage-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--wizard--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--wizard--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--wizard--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-dark--wizard--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--chat--chat-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 355 | 18 |
| basic-light--chat--chat-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 355 | 18 |
| basic-light--chat--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 355 | 18 |
| basic-light--chat--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 355 | 18 |
| basic-light--chat--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 355 | 18 |
| basic-light--chat--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 355 | 18 |
| basic-light--home--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--home--home-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--home--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--home--onboarding-welcome--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--home--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--home--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--orchestrator--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--orchestrator--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--orchestrator--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--orchestrator--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--project-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--project-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--search-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--projects--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--settings--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--settings--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--settings--nier-popover--wide--reduced | FAIL | FAIL | 1 | 1 | 1 | 0 |
| basic-light--settings--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--settings--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--usage--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--usage--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--usage--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--usage--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--usage--usage-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--usage--usage-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--wizard--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--wizard--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--wizard--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| basic-light--wizard--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--chat--chat-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--chat--chat-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--chat--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--chat--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--chat--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--chat--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--home--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--home--home-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--home--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--home--onboarding-welcome--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--home--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--home--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--orchestrator--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--orchestrator--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--orchestrator--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--orchestrator--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--project-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--project-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--search-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--projects--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--settings--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--settings--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--settings--nier-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--settings--rest--wide--reduced | FAIL | FAIL | 1 | 37 | 1 | 0 |
| friendly-dark--settings--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--usage--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--usage--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--usage--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--usage--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--usage--usage-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--usage--usage-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--wizard--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--wizard--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--wizard--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-dark--wizard--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--chat--chat-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--chat--chat-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--chat--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--chat--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--chat--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--chat--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--home--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--home--home-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--home--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--home--onboarding-welcome--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--home--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--home--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--orchestrator--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--orchestrator--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--orchestrator--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--orchestrator--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--project-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--project-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--search-focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--projects--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--settings--focus--wide--reduced | FAIL | FAIL | 3 | 40 | 1 | 0 |
| friendly-light--settings--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--settings--nier-popover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--settings--rest--wide--reduced | FAIL | FAIL | 1 | 40 | 1 | 0 |
| friendly-light--settings--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--usage--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--usage--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--usage--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--usage--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--usage--usage-hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--usage--usage-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--wizard--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--wizard--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--wizard--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| friendly-light--wizard--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--home--focus--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--home--home-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--home--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--home--onboarding-welcome--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--home--rest--wide--reduced | FAIL | FAIL | 10 | 1 | 1 | 0 |
| glass-dark--home--theme-menu--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--wizard--focus--wide--reduced | FAIL | FAIL | 1 | 1 | 1 | 0 |
| glass-dark--wizard--hover--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--wizard--rest--wide--reduced | FAIL | FAIL | 0 | 0 | 1 | 0 |
| glass-dark--wizard--theme-menu--wide--reduced | FAIL | FAIL | 11 | 1 | 1 | 0 |


## Cleanup and handoff

**All 67 owned sessions stopped complete and purged** (50 Windows, 17 Mac); final fleet queries show zero task-owned sessions. The audit includes failed startup/transport trials, qualification, the interrupted matrix, fixtures and the N3 controls. No local VM browser or recording was started. All task content servers are closed. Temporary Windows/controller unit copies and unused follow-up drafts were removed; executed drivers and the private export-only layout harness are retained with their raw evidence for reproducibility. The assigned unlanded worktree and pushed branch remain for lead integration; no landing or scratch worktree was created.

A0 was told that remote Rail was incomplete and that the VM owns full coverage. This report completes the revised remote assignment. Full Rail parity, the optional proof-copies matrix and any N8 classification remain outside the finished remote scope. The partial native ERROR is evidence, not a replacement for the full VM run.


## Evidence paths and SHA-256

Every retained capture, input, JSON report, provenance file and log is indexed in the artifact below. Native reports additionally retain path/SHA-256 for each screenshot. Raw evidence stays outside Git. The evidence index excludes itself; its SHA-256 is pinned here. Relative names in this report resolve beneath `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote`.

| Path | SHA-256 |
|---|---|
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/evidence-index.json | `52e11deb79e4c0cf44d579889453d1ff39331aff53803a609dbad1869f4f72ac` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/inputs.json | `3dbace7ca03530369adc081ca71abe0b4d3d3ca5f8f7df0195fd503044ea0d2a` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/sensitivity-input.json | `7cf1f3f7ca823e20bce6c3bfd5fbf7270582fbd375fe9fca9608f7b761f63005` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/final-source-provenance.json | `e9dadfc2142f1c3953b396e58ab7111ecf1d150346fe819db3c8dbb7a3bb8636` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/gate-identity-c173.json | `89501465bffca000535b183901b5c406042494641d1d33fe27d2edb8d3b0ddef` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/unit-tests-urlpattern.log | `e7da0547504e65a45e4cb810f0dc95632ff84cad35986efe0f256d467d74df87` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/unit-tests-windows-52ec.log | `e405bcd89750f5e549169429617a3e94cdfa5b2160b0040c446b82b8eea5e053` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-test-provenance-52ec.json | `e3dc9a5438807178def2995ea8457df8a02cf736915995c573e4064e4e155f2c` |
| /mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/proof/A-remote-transport.json | `1be6cc12667216498edb6dc79c04932e7889e1428f7322e489ccb3db62b4225f` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/capped-proof/validation.json | `db2aeadc1ac47c443c70b9ac34981c0f18af46ac2979f9ce14a1a0f6c4c18d70` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-isolated-proof/validation.json | `5d1c4914d61aef3fb6007a4eb0ce6fc0ec95e705ff0284087c16c0696a09c3e2` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-descriptors/report.json | `ebc123582111c6f9368c177ab3cbe9acb6439bfaca7c277e9344e698bb31fae1` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/mac-capped-proof/validation.json | `32432001b7fddf45faa918946ae5deae7f5d6852a7294cc1163b79aa5a63e46f` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/landing-candidate/rail/report.json | `ac4f0150ddb5e0510cd8d66dc5cfc1d9b11e0ae094dbd8b093e3595b6afe0d6b` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/interrupted-rail-group-audit.json | `e75f5ad99ce8076e3d04b54fa6a9ede575f53d3c1ba2ddbb08f963514ec88739` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/rail-analysis.json | `afd55aa565e721c39b7ce78a7ed8e7070edb643d55cc53e592802a1ca8cb04ae` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/static-script-identity-census.json | `2ed672c1f52e015109fe60e06a5b6532987c50fd75142ef87bc283e8d8792021` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/probe-creator-fingerprints.json | `3d5ada90a7e360afb65cd61e2fcf93c44edd7d7b2985f91427b11af40a89e924` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/interception-context-self/report.json | `8394dc3fb8f6f48fb1c99ead8b0f3936af58b949a63a65267b0f79c7450ddb9f` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/interception-fixture-final.json | `a3612bfc4626b4b52b3c201945437e5e9bf38dbddc182a430fa8c59608c1eae4` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/layout-controls/provenance.json | `6ff92f67d1b2ecc032031894b7c99986d41d511388e60edd24ced2abd51a7919` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/layout-controls/report.json | `23fdce1b37c22101f7c6efcce89b734974d8f5ed8c598db4f4a5d2338eeff17b` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/layout-controls/classification-summary.json | `01bff9935634d72809a7b718010e035a0c8b28e20ba093267426956cde2d41d5` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/session-cleanup.json | `aaf9ec4d80fea01b57b0aece8c3fa1de3b27d990e6e1f98e380c05a75e215c4d` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/temporary-cleanup.json | `956f0388b1f0d3eba70a336a60309fb5b4cccce3a751613cb619f95ec09995a7` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-runtime-cleanup.json | `b0060057bebe9d26ebc682d9a9969a4cb8323fb3d4845e8b7cb761414b16f57b` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/scope-handoff.txt | `7a97f051391eb539a341995243aea2c91c4f56a86fc19bd48fe71027124d7144` |
