# Onboarding scenario repair — 2026-10-11

Source-only review checkpoint on `fix/onboarding-scenarios-20261011`, source commit `9a4f5a8eb0`.
Coordinator: `home-redesign-planner`; Opus reviewer: `pm7-glyphs`. No landing has been attempted.

The unchanged suite reproduced **56/69 passing on main `618fd35e0e`**, with exactly the thirteen reported failures.
They share four stale harness expectations from the approved September 26 owner-consumer integration
(`b3dc95010be`). Supplying the required owner fixtures also exposed a real Server Ready rendering bug behind six
of those failures. The source fix and updated harness preserve the owner-result gates.

## Results and publication status

| Check | Main before repair | Repaired source |
|---|---|---|
| All onboarding scenarios, Basic Dark | 56/69; the same thirteen failures | **69/69 on the private build** |
| The thirteen repaired paths | 0/13 on main | **13/13 in the full regression** |
| Server paths after the product fix | Blocked before Ready | 6/6, no page errors |
| Tours `t1`–`t7`, Basic Dark | 7/7 | 7/7 on the private build |
| Generator source lint / private build | Runs successfully | Runs successfully |
| Published `build.py --check` | Two stale-output failures before this work | Deferred until the publish rebase |

The planner explicitly requested a source-only handoff, with both generated pages held. Main already has stale
embedded Settings data: the difference from a fresh build is confined to two JSON lines, including the Settings
count changing from 910 to 958 and the existing layout-reset description/default. This predates the repair.
The panels publish supersedes it. Neither published HTML file is included in this checkpoint.

After the planner supplies main's panels-plus-terminal publish SHA, this thread must rebase onto it, run
`build.py --publish-pm7`, run `build.py --check`, and rerun all 69 scenarios and tours before its final integration
handoff. The publish changes the tour from 18 to 20 steps and removes `move_or_dock_chat`; its rewritten tour
sources and runner must be preserved. Regenerate the pages from the composed sources during that rebase.

## Each failure

Every repaired case below passes in the final 69-case run. The suite retained the same scenario IDs; all 56
previously passing cases remain passing. The final scenario run recorded 414 assertions, zero browser errors,
and zero refused commands, with process exit 0. Tours recorded 118 assertions, zero errors/refused commands,
and process exit 0. The additional pending/rejection assertions are described below.

| ID | Observed main failure | Cause | Fix / disposition | After |
|---|---|---|---|---|
| `s01` | New Project not selected in the title bar | C1: literal `p-book-club-website` no longer identifies a new Project | Check the terminal `commit.projectId`, one matching menu row, and its selected state | PASS full suite |
| `s09` | Timeout waiting for commit settled on Creating | C2: no GitHub owner result; obsolete rename/resume expectation | Inject a bound failed-before-effect result, review/change the name, then adopt a fresh terminal creation result | PASS full suite |
| `s09b` | Timeout waiting for commit settled on Creating | C2: no GitHub owner result; obsolete in-place retry expectation | Explicit failed-before-effect network result, original-result replay check, new reviewed attempt and terminal result | PASS full suite |
| `v1` | Timeout waiting for `s-ready` on `s-confirm` | C3: missing claim/bootstrap/pair/trust results; latent Ready recursion once supplied | Staged fixtures and human identity confirmation; fix Ready rendering before continuing to the Project/Tailscale flow | PASS full suite |
| `b5` | Timeout waiting for kit on Protect | C4: recovery handoff now needs protected owner proof; DOM phrase expectation retired | Explicit export/test/policy fixtures with exact current protected context and postconditions | PASS full suite |
| `a1` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same staged Server helper and Ready fix; retain Project Later / access-only assertions | PASS full suite |
| `a4` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain Server folder location/history/online-copy assertions | PASS full suite |
| `a6` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain the assertion that returning to This computer clears Server references and trust | PASS full suite |
| `x2` | Exactly one Project expected; found zero | C1: fixed-name selector misses the unique Project ID | Check the published ID and exactly one selected row; reopening Creating must retain the original attempt key | PASS full suite |
| `b1` | Timeout waiting for kit on Protect | C4 | Same protected handoff helper; retain the one-SSH-key destination flow | PASS full suite |
| `b2` | Timeout waiting for kit on Protect | C4 | Same helper; retain bucket/access checks and the assertion that the secret is never stored | PASS full suite |
| `lc4` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain the assertion that the NAS uses the Server's keys | PASS full suite |
| `lc6` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain restore ordering and remote-access preparation assertions | PASS full suite |

## Shared causes and changes

### C1 — Read the unique published Project identity

The September 26 integration allocates a unique fixture destination and publishes it only at terminal completion.
The old `p-book-club-website` selectors incorrectly reported missing rows while creation and selection succeeded.
`assertPublishedProject()` reads the committed identity and checks one matching selected menu row. `x2` additionally
checks that reopening an in-flight creation retains its original idempotency key. No Product identity rule changed.

### C2 — GitHub terminal truth requires an owner result

`runGithubCommit()` intentionally leaves transport-only completion pending. The old scenarios supplied no owner
result and waited for a timer-produced failure/success that the approved integration removed. Canonical PJCT-007
and PJCT-008 also distinguish original-key replay, fresh reviewed creation after failure before an effect, and
resume of a verified remote effect. A network failure is not assumed to establish the remote verdict: the fixture
explicitly reports `failed_before_effect`.

The new GitHub cases first verify that transport alone publishes no Project or remote verdict. Deliberate results
bind the operation, request, nonce, draft/revision, terminal refs/digests, composition, and settled effects. The
original replay consumer is exercised as a source call that re-observes the retained result; the visible recovery
path is Review setup again, followed by the current controls. Fresh reviewed attempts must use a distinct original key. Only the owner-listed
Project identity may be published. Unknown/reconciliation and verified-remote resume semantics are unchanged.

### C3 — Missing Server owner results masked a real recursive render

Claim, durable bootstrap, a waiting PairingRun, human identity confirmation, and a ClientTrustRecord are separate
results (SRV-004/SRV-005). The old six paths expected the setup-code timer to advance through all of them.
`finishServerSetup()` supplies each result explicitly and verifies that missing results and a wrong Server target
confer no trust. A real click confirms the displayed identity; confirmation alone still grants no trust.

Once those gates were exercised, `v1` reached `s-ready` and threw `RangeError: Maximum call stack size exceeded`.
In [68-screens-server.js](../../Concepts/onboarding/opus-5.5/src/js/68-screens-server.js), `s-ready.mounted()` called
`O55.ui.refresh()` unconditionally. [60-ui-core.js](../../Concepts/onboarding/opus-5.5/src/js/60-ui-core.js)'s refresh
calls the current screen's `mounted()` synchronously, so the Ready view never settled and Continue could not advance.

The product fix polls/adopts guest results before drawing Ready's body. `mounted()` only arms the existing
one-second ticker. This removes recursive rendering while preserving the invite, pairing predicates, labels,
icons, and current result matcher. All six Server paths pass after the fix, with zero browser errors.

### C4 — Recovery Kit handoff is a protected owner flow

BRS-012/BRS-017 and the September 26 consumer integration replaced timer success and DOM phrase entry with explicit
export/test results and current one-time human-audience proof. The old helper clicked once, waited for a kit, then
tried to read `.o55-kitwords`. That expectation is stale; kit bytes must not appear in ordinary DOM/storage.

The repaired helper exercises the confirmation request and pending owner state, then injects a result bound to
the initiating Client, Project, Server, RecoverySet/generation, request and nonce. Export requires verified delivery
and saved acknowledgment; Test requires verified unlock and scratch proof; policy requires the matching Project
and `policy=on`. A result without current step-up proof is refused and completes no kit. The helper verifies that
there are no DOM recovery words or persisted step-up proof. No recovery credential is supplied by the fixtures.

### Harness operation and exit status

Both acceptance suites now use `agent-browser` through a small pipe-to-WebSocket adapter. It stops its exact session
and deletes the real profile before acknowledging Browser.close, because the existing CDP caller kills its launcher
as soon as close resolves. The shared CDP helper accepts an optional executable and rejects startup/pipe failures
instead of leaving pending commands hung; its default executable remains compatible with other callers. A missing
executable smoke check rejects immediately with ENOENT.

Both suites now return a failing process status when any reported scenario fails. Scenario count and the passing
cases' assertions are preserved; the fixes do not increase the old commit/Server/kit timeouts or suppress errors.
All runs used Nas1, at most four independent browsers concurrently, and no video or native desktop input.

## Reproduction and evidence

Main's unmodified `scenarios.mjs` and driver were loaded before any source edits, with `--page Concepts/PMConcept7.html`.
Only the browser transport was adapted through `CHROME` so the original runner used `agent-browser`. Baseline inputs
and their hashes are recorded in `baseline/inputs.json`. The main page's SHA-256 is
`3486e2ee39a40d0b9942d3ca50926bea985e2b6a1f1b3935d6527afc55d89fbb`.

The repaired private build uses the documented `build.py --out` path. Its retained standalone input is
`/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/inputs/fixed-private.html`, SHA-256
`fd69cc3e97eb6f3a53b041bd2b7ab69a523c5bb142714d5e087ca60307916399`. Reproduce its acceptance runs with:

```bash
node Concepts/onboarding/opus-5.5/tools/scenarios.mjs /abs/local-output/scenarios --page /mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/inputs/fixed-private.html
node Concepts/onboarding/opus-5.5/tools/tour_scenarios.mjs /abs/local-output/tours --page /mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/inputs/fixed-private.html
```

Raw results/logs stay under `/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/`; no raw captures
are committed. `targeted` and `targeted-recheck` are intermediate diagnostic runs: they preserve the obsolete-button
pilot failures and the latent Ready exception, rather than presenting those pilots as the final regression.
The following immutable evidence records use absolute paths and SHA-256. The manifest also identifies every
retained intermediate log, draft, and the three diagnostic screenshots shown during investigation.

| Evidence | Path | SHA-256 |
|---|---|---|
| Baseline input hashes | [baseline/inputs.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/baseline/inputs.json) | `19272d18501eb334c441ea4f5816d9b06b8c4ab55a4a502411b3e99bbcf4aa08` |
| Main 56/69 result | [baseline/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/baseline/report.json) | `83e3a6b9f51f1944973719b835ab3836c99daa99b4fdb8ef6f970dc95e7255b5` |
| Main runner log | [baseline/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/baseline/runner.log) | `442f75fbb8d8ab73eb5292f27d4974c2af8239e92e16d79b596dfec04b021d4a` |
| Final 69/69 result | [all-private/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/all-private/report.json) | `386d2e8cef86756c71aff89f893d74d33ebdbf5a28285bba008eccad01c21033` |
| Final runner log | [all-private/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/all-private/runner.log) | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| Main tours result | [tours-before/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/tours-before/report.json) | `6c555a1ba10defdacacaf322f9f4da4196b3adad18aba9d17ab692b845ae6e71` |
| Main tours log | [tours-before/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/tours-before/runner.log) | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| Final tours result | [tours-private/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/tours-private/report.json) | `7cf6e59b26701b0668c38053fc7478e78ec4551d851cfe3091e203924406b773` |
| Final tours log | [tours-private/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/tours-private/runner.log) | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| Ready recursion diagnosis | [targeted-recheck/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/targeted-recheck/report.json) | `42d948edf226addc0e03264159dfc2bfda2e0323e43d15139313d0f2d50ed31b` |
| Six repaired Server cases | [server-private/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/server-private/report.json) | `59249a0f82abfae64eaf98e8a6d8b5528c50dc7aa35411843e7a13c1ca96c002` |
| Pre-existing output check failure | [diagnosis/build-before.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/diagnosis/build-before.log) | `a7a20edf36cc0a7b7cc78626371ca72e8c8e9e5198ed76362524887fc941e7c2` |
| Fixed private-build lint/output | [diagnosis/fixed-private-build.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/diagnosis/fixed-private-build.log) | `8ae601cb384c51df493502522391c7e5f225c6602be6d88e59d56ad7956da2e8` |
| Launcher failure smoke | [diagnosis/launcher-failure.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/diagnosis/launcher-failure.log) | `ea900f8c4ba7bfef33c176d53554ec58d4b31810baed4bfc0e5b18dee1315839` |
| Source/private-page input hashes | [diagnosis/private-inputs.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/diagnosis/private-inputs.json) | `464423e4a50abb955003ebb0bf0983c26e46a06edc7ec938108bfdd68ed60eff` |
| Before/after comparison | [comparison.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/comparison.json) | `f6c435cef91cdfce4af616a9478adcfb886b13afb8716c94fbfba7b6387cad6e` |
| Browser/profile/scratch cleanup | [diagnosis/cleanup.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/diagnosis/cleanup.json) | `07b9a64dfe3bd19b6fdbdfc425a6cfc2a11991288adde8acc12c2a9c8791f86d` |
| All retained evidence hashes | [evidence_manifest.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/evidence_manifest.json) | `cf178404386ebb3e6cab7da01fa18d17b62cca5a37f4b8aa4775a4f538b574ab` |

The classification follows the existing integration records
[Project recovery consumer](../packet-integration-completion-20260926/project-concept-consumer.md) and
[Server/Recovery Kit consumers](../packet-integration-completion-20260926/server-backup-consumers.md), checked against
live `Plans/Project_System.md`, `Plans/Server_System.md`, and `Plans/Backup_Restore_System.md`. Browser result adoption
uses deliberate fixtures; it does not certify native execution, protected authentication, or durable owner adapters.

## Review and composition handoff

No visual, copy, or design change is needed for these fixes. `pm7-glyphs` reviews the source/report checkpoint. The
only product JS edit is the Ready reentrancy fix in source68, outside its glyph call sites. Preserve glyph helpers
and status marks during composition; the harness does not depend on spinner classes, icon paths, or status text.
`pm7-no-pills`' CSS changes do not overlap this product fix.

The planner owns landing order. Pending work is the publish rebase, generated publication/check, and a repeat
of the whole 69 plus tours against that composed publication. Keep this branch/worktree for that continuation;
all test browsers and their profiles are stopped/removed, and local scratch is deleted. Only requested evidence
and the three posted diagnostic screenshots are retained outside the repository.
