# Onboarding harness state waits — 2026-10-11

Coordinator: `home-redesign-planner`. Branch: `fix/onboarding-harness-waits-20261011`.
Tools implementation: `2668a76b2f04d39adeb2ed55707ce94802f65cec`.
The planner owns landing; this branch has not been landed.

## Scope and behavior

Against the tested main base, only `Concepts/onboarding/opus-5.5/tools/drive.mjs`,
`scenarios.mjs`, and this report change.
The 69 scenario IDs, assertions, owner-result fixtures, and seven tour cases are preserved.
There are no product JavaScript, CSS, copy, generated page, or visual edits.

The driver now waits for its APIs before setting the theme. Opening waits for a mounted,
open session and the active layer's `data-screen` to agree with the session screen. Input
waits for held/entering/outgoing layers, window opening/closing, view transitions, and
finite layer animations to settle. Descendant hover feedback is excluded: the selected
folder card can retarget a short transform every frame while Continue is already ready.
The next clicked control's geometry and hit test determine its readiness. Ambient loops
and spinners do not block input.
Controls must be visible, outside inert content, enabled, uncovered at their center, and
stationary across separate geometry probes before real CDP mouse input. Fields must be
present and read back the inserted value; existing field-log redaction is retained.
Primary clicks also wait for readiness. Screen waits require both state and rendered
content. Opening failures close the browser rather than leaving its profile behind.

Scenario-specific waits replace delays for folder checks, provider detection and key
verification, rejected/correct pairing and setup codes, resume chips, demo/Home/look menus,
reopening and replay, Guided Tour entry, public key lines, route changes, and scene motion.

Network discovery must finish before opening connection route choices: it can insert cards above More ways between a geometry
probe and the mouse event, turning a would-be control click into a click on plain text.
The harness then waits for the route controls to appear.
The cancellation case waits for the original owner operation to return at its cancelled
phase boundary before asserting there was no late pairing effect. Motion cases observe
the ambient bar transform, active finite entrances, and the selected hero's idle.

The only remaining fixed scenario sleeps are **170 ms between letters** and **900 ms of
the sign's response** in `m1`. Their measured typing cadence and observation duration are
the test itself, and the code comments explain this. Driver sleeps are bounded polling
intervals (150 ms for state, 60 ms for geometry), never readiness criteria. Ordinary
driver waits time out after 12 seconds; general scenario predicates default to 15 seconds,
with existing operation-specific bounds retained. Timeout messages identify the condition,
bound, session screen, rendered screen, root/layer state, and primary disabled reason.
Missing-control diagnostics also distinguish absent/inert, disabled, covered, and moving
controls. Older illustration tools' numeric `settle` arguments now request state settlement;
`settle: false` permits observing a transient entrance or measuring typing motion.

## Validation basis

Final comparisons on both machines use private local copies of **main `0d33a0c4d0489f7ecd11c595d2e65267710e6ecd`'s
`Concepts/PMConcept7.html`**, with identical SHA-256
`0a6bb00df744ecf8642c9173ea0a380c9525055f83b5b471af4a548f43b864b3`.
Before runs use that main revision's unchanged harness; after runs replace only the two
tools with the committed implementation. Input manifests record every copied file's hash.
No private product build, extra opening delay, or product override is applied.
Main advanced through `51c316e18b` (Usage Glass carry) and `e428bb3b31`
(Usage D43 and landing-check readiness inputs) during the repetitions. These results
remain pinned to the explicitly recorded `0d33a0c4d0` main page; they do not claim a test
of subsequent product landings. The planner integrates current main before landing.

Each suite starts independent `agent-browser` profiles through the repository's launcher
and closes them after each case. Basic Dark is tested at the suites' existing sizes:
1440 × 900 for onboarding and 1600 × 1000 for tours. P1000 renderer probes before each
suite report `ANGLE (NVIDIA Corporation, Quadro P1000/PCIe/SSE2, OpenGL 4.5.0)`.
Nas1 uses its documented plain virtio 2D software display. No recordings are made.
The two hosts run independently; repaired repetitions on a host run sequentially. A
baseline/diagnostic browser can overlap a repaired run. The planner requested a quiet
P1000 interval for `codex-d43-landing`; the active earlier-input suite was allowed to
finish, then an orchestration hold prevented any next renderer/browser startup until
that thread released the GPU. No test or product wait was changed for that interval.

The task's earlier glyph evidence reported 46/69 on unchanged main and 67/69 after an
opening-only scratch wait, leaving `s10` and `n11`. The first unchanged baseline here,
against the task's original main `3ad5e84b71`, is **6/69 on P1000** (60 `no primary on null`
errors) and **69/69 on Nas1**, with **7/7 tours on both**. Its page SHA-256 is
`3c14f4c7ff39c68cd7f8d8e998cba4d133198a3c95b64d85cab4b830aebd2cb1`.
The planner subsequently published main `0d33a0c4d0`'s density/Usage boot repair, so the
final baseline and all three repaired repetitions use that main page instead. Incoming
product files match that pinned main byte for byte; the repair's diff against that main is tools/report only.
The six-case smoke on that page passed `s10`, `n11`, `n13`, `m1`, `m2`, and `j2`.
A separate absent-field/false-condition smoke confirms bounded, contextual timeouts and
settled close, with zero page errors.

The commands are the repository runners, without scenario filters:

```sh
node Concepts/onboarding/opus-5.5/tools/scenarios.mjs <evidence-dir>/scenarios --page Concepts/PMConcept7.html
node Concepts/onboarding/opus-5.5/tools/tour_scenarios.mjs <evidence-dir>/tours --page Concepts/PMConcept7.html
```

Each repaired command pair is repeated three times per machine. `runs.json` records the
actual absolute commands, exit codes, and durations; input manifests record the pinned
main page and tool hashes. Targeted probes and interrupted earlier candidates are retained
separately and do not count toward those three repetitions. One Nas1 second-repetition
attempt ended between cases with `read ECONNRESET` in the existing CDP pipe after 19
passes. Its cause was not established; it is preserved under
`nas1/infrastructure-interruption-scenarios-2/`, and that attempt does not count as a
completed run. The first complete pair remains valid, and repetitions two and three
were rerun with unchanged harness/page hashes.

## Results and evidence

**Final implementation passed 69/69 onboarding scenarios and 7/7 tours three times on each host.**

| Host | Main 0d33 onboarding before | Tours before | Repaired round 1 | Repaired round 2 | Repaired round 3 |
| --- | --- | --- | --- | --- | --- |
| Nas1 | 69/69 | 7/7 | 69/69 + 7/7 | 69/69 + 7/7 | 69/69 + 7/7 |
| P1000 | 3/69 | 7/7 | 69/69 + 7/7 | 69/69 + 7/7 | 69/69 + 7/7 |

Each repaired onboarding run has **414 assertions**, zero captured page errors, and zero
owner refusals. Each repaired tour run has **125 assertions** and zero captured page errors. Across
the six repaired pairs, all **456 cases and 3,234 assertions** pass. All twelve suite
commands exit 0. Post-run input hashes match the starting manifests on both hosts.

The final unchanged P1000 baseline has 61 `no primary on null` errors, two
`no control pick existing on where` errors, and one each of a null `here` lookup,
`no primary on welcome`, and `no control pick server on look`. Nas1 remains 69/69.
The variability from the earlier glyph evidence is consistent with the old harness
depending on elapsed time; these before/after rows use the same pinned page.

Raw evidence root (`E` below): `/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-harness-waits-20261011/`.
Every retained file is listed by path and SHA-256 in `E/SHA256SUMS`;
`evidence-index.json` provides the same per-file mapping in JSON. The table below gives
the actual full-suite runner-log paths and hashes. Per-case assertions, commands, errors,
and refusal lists are in the sibling `report.json` files, indexed by that manifest.

| Log path relative to E | SHA-256 |
| --- | --- |
| `nas1/final-before/scenarios/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `nas1/final-before/tours/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `nas1/final-after/scenarios-1/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `nas1/final-after/tours-1/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `nas1/final-after/scenarios-2/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `nas1/final-after/tours-2/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `nas1/final-after/scenarios-3/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `nas1/final-after/tours-3/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `p1000/final-before/scenarios/runner.log` | `a477898aeab3311d4f0d37f77d8553f21b473e430b3f45e5cbc8ede9cefba60c` |
| `p1000/final-before/tours/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `p1000/final-after/scenarios-1/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `p1000/final-after/tours-1/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `p1000/final-after/scenarios-2/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `p1000/final-after/tours-2/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| `p1000/final-after/scenarios-3/runner.log` | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| `p1000/final-after/tours-3/runner.log` | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |

Supporting artifacts (paths relative to E):

| Artifact | SHA-256 |
| --- | --- |
| `comparison.json` | `76358a8a2fbe2e0de8836d85687f3b9de0ef8a4a206a8ca6e1b8c7ba03b6cf77` |
| `scope.json` | `1316fab06dd530f9dd03174ec21f3131f0dcc68491fb76de5f9cc49ae90aabc2` |
| `nas1/final-after/inputs.json` | `1c67513b7cb6c112bce5e40b6b31785c3ad031cdcb23e741bf7222a63dae1bce` |
| `p1000/final-after/inputs.json` | `84af60bc6bd5d87cf33451ac3e2da30dac5a3c4a3961a942283bc0a2a78d07b5` |
| `nas1/final-after/post-inputs.json` | `47e94761c751ee5d5914a3764bac5963c47e7ecef33c2651bda6dd10c4575907` |
| `p1000/final-after/post-inputs.json` | `f8670d89465380103ef574a2e84ce24b5c1e27981590771535a57808e48f0651` |
| `p1000/c3-diagnosis.log` | `a460a6834e5d3508608d83110534e50ef46c7034ab6f62bd836e71970962c549` |
| `nas1/settle-diagnosis-2.log` | `fb7aa6a541875fd28761dd2006febf473e67fcacabc154c0306642bd6df09a1a` |
| `nas1/timeout-smoke.log` | `d5fbf2fcc38ac001397ae67ca772058a0e843340d24d7ac7a6f1d37c000b5639` |
| `nas1/infrastructure-interruption-scenarios-2/scenarios-2/runner.log` | `59fb49ac25b9be95d5e85a6d21895e5982db04946133eae3477fdfd9f998b7a1` |
| `cleanup.json` | `f13f3dd7d639ccfba44b2e5ee5950bb528a84e1010a47f4c679fd8cf647d7c50` |
| `evidence-index.json` | `8da74c7162b1f9ab4730607dd07365d397eca054b58ece5ddb6a525d59699130` |
| `SHA256SUMS` | `56e40631de87b9f3b1e8d4518c3b2ce39ace25c0f8801594eaafe076ede28e30` |

P1000 renderer logs for each of the six repaired suites confirm Quadro P1000 hardware
rendering. Original-main baselines, the hover diagnosis, route-check smoke results, and
the excluded transport interruption are retained separately; the manifest covers them.
The route-check smoke passed `c3/c4/lc1` three times on P1000 and once on Nas1.

## Cleanup and handoff

All task browsers are closed. The launchers removed their pipe profiles and private
Chrome profiles; a residual temporary Network Persistent State file from a completed
Nas1 tour profile was removed explicitly. Unneeded screenshots and discarded scratch
attempts were deleted. Private page/tool copies and orchestration scripts were removed
from both machines after their input hashes were verified. No recordings or dev servers
were started. Required raw logs, reports, input manifests, relevant probes, and cleanup
records remain under E; the unlanded worktree/branch remain for the planner.

Syntax checks for both tools, scenario-ID preservation, and `git diff --check` pass.
The branch is pushed to both configured remotes and mailed to `home-redesign-planner`.
No main landing or governance reseal was performed.
