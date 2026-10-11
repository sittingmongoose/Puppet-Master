# Onboarding scenario repair — 2026-10-11

Published repair candidate on `fix/onboarding-scenarios-20261011`, implementation commit `a624f74b17`, rebased onto
main `62f37f65df` (including panels/terminal publish `e8daaa84f2`). The initial source-only checkpoint was `cea8720367`
with source commit `9a4f5a8eb0`; its rebased implementation is `b32b92014c`.
Coordinator: `home-redesign-planner`; Opus reviewer: `pm7-glyphs`. No landing has been attempted.

The unchanged suite reproduced **56/69 passing on main `618fd35e0e`**, with exactly the thirteen reported failures.
They share four stale harness expectations from the approved September 26 owner-consumer integration
(`b3dc95010be`). Supplying the required owner fixtures also exposed a real Server Ready rendering bug behind six
of those failures. The source fix and updated harness preserve the owner-result gates.

## Results and publication status

| Check | Main before repair | Initial private repair | Published candidate |
|---|---|---|---|
| All onboarding scenarios, Basic Dark | 56/69; the same thirteen failures | 69/69 | **69/69** |
| The thirteen repaired paths | 0/13 | 13/13 in the full regression | **13/13** |
| Server paths after the product fix | Blocked before Ready | 6/6, no page errors | **6/6, no page errors** |
| Tours `t1`–`t7`, Basic Dark | 7/7 | 7/7 | **7/7 in each of three runs** |
| Generator lint/build | Runs successfully | Runs successfully | `--publish-pm7` passes |
| Published `build.py --check` | Two stale-output failures before this work | Held for the publish rebase | Passes; byte parity verified |

The planner initially requested a source-only handoff while the panels/terminal publish was pending. Main at
`618fd35e0e` had stale embedded Settings data: its fresh-build difference was two JSON lines, including the Settings
count changing from 910 to 958 and the existing layout-reset description/default. This predates the repair.

The required publish is now on main. The branch rebased cleanly onto `62f37f65df`, preserving the rewritten tour
sources and runner: 20 steps, with `move_or_dock_chat` retired. Both HTML files were regenerated through
`build.py --publish-pm7`; `build.py --check` passes. Their identical SHA-256 is
`3c14f4c7ff39c68cd7f8d8e998cba4d133198a3c95b64d85cab4b830aebd2cb1`.

## Each failure

Every repaired case below passes in the published 69-case run. The suite retained the same scenario IDs; all 56
previously passing cases remain passing. The published scenario run recorded 414 assertions, zero browser errors,
zero refused commands, and process exit 0. The rewritten tours pass all seven cases in each of three full runs,
with 125 assertions, zero browser errors, and exit 0 per run. The tour runner does not export a refusal count;
its assertions verify no network requests and unchanged usage. The initial private tours passed with 118
assertions before the approved panels tour rewrite. The additional pending/rejection assertions are described below.

| ID | Observed main failure | Cause | Fix / disposition | After |
|---|---|---|---|---|
| `s01` | New Project not selected in the title bar | C1: literal `p-book-club-website` no longer identifies a new Project | Check the terminal `commit.projectId`, one matching menu row, and its selected state | PASS published |
| `s09` | Timeout waiting for commit settled on Creating | C2: no GitHub owner result; obsolete rename/resume expectation | Inject a bound failed-before-effect result, review/change the name, then adopt a fresh terminal creation result | PASS published |
| `s09b` | Timeout waiting for commit settled on Creating | C2: no GitHub owner result; obsolete in-place retry expectation | Explicit failed-before-effect network result, original-result replay check, new reviewed attempt and terminal result | PASS published |
| `v1` | Timeout waiting for `s-ready` on `s-confirm` | C3: missing claim/bootstrap/pair/trust results; latent Ready recursion once supplied | Staged fixtures and human identity confirmation; fix Ready rendering before continuing to the Project/Tailscale flow | PASS published |
| `b5` | Timeout waiting for kit on Protect | C4: recovery handoff now needs protected owner proof; DOM phrase expectation retired | Explicit export/test/policy fixtures with exact current protected context and postconditions | PASS published |
| `a1` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same staged Server helper and Ready fix; retain Project Later / access-only assertions | PASS published |
| `a4` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain Server folder location/history/online-copy assertions | PASS published |
| `a6` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain the assertion that returning to This computer clears Server references and trust | PASS published |
| `x2` | Exactly one Project expected; found zero | C1: fixed-name selector misses the unique Project ID | Check the published ID and exactly one selected row; reopening Creating must retain the original attempt key | PASS published |
| `b1` | Timeout waiting for kit on Protect | C4 | Same protected handoff helper; retain the one-SSH-key destination flow | PASS published |
| `b2` | Timeout waiting for kit on Protect | C4 | Same helper; retain bucket/access checks and the assertion that the secret is never stored | PASS published |
| `lc4` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain the assertion that the NAS uses the Server's keys | PASS published |
| `lc6` | Timeout waiting for `s-ready` on `s-confirm` | C3 | Same fix; retain restore ordering and remote-access preparation assertions | PASS published |

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
This thread’s runs used Nas1, at most four independent browsers concurrently, and no video or native desktop input.

### Opus review follow-up — Tour wait race and browser admission

`pm7-glyphs` accepted the product fix and fixture/expectation changes. Its independent P1000 composition onto
glyph branch `a39d20d5f9` applied cleanly and passed `build.py --check` and 69/69 scenarios. It found a separate
timing race: tours passed 6/7, with `t1` failing three times. The initial main/private tour passes had not exposed it.

`untilStep('review_parts')` returned as soon as the state changed, before `enter()` replaced the previous callout.
That callout already had Next. The DOM-only wait therefore succeeded with `part=0` and `partsDone=false`; the
product correctly ignores Next while entering. This is a harness bug, not a product, glyph, or design defect.

Tour step waits now require the matching step, `entering=false`, and that step's callout. The manual and Show Me
review waits additionally require `partsDone=true` and Next on the review callout. The swallowed timeout is removed;
the existing 20-second deadline remains. This also guards other step-dependent controls against stale callouts.

Browser start retries only the helper's explicit browser-cap error, every 15 seconds, up to 80 attempts. Other
launch errors fail immediately. An end-to-end admission smoke test injected two cap refusals, observed two real
15-second waits, then launched/evaluated/closed a real CDP browser. A permanent error failed on its first attempt
in 116 ms. All three full tour repetitions pass 7/7 with process exit 0; all 69 scenarios pass against the
published candidate, with no regressions.

## Reproduction and evidence

Main's unmodified `scenarios.mjs` and driver were loaded before any source edits, with `--page Concepts/PMConcept7.html`.
Only the browser transport was adapted through `CHROME` so the original runner used `agent-browser`. Baseline inputs
and their hashes are recorded in `baseline/inputs.json`. The main page's SHA-256 is
`3486e2ee39a40d0b9942d3ca50926bea985e2b6a1f1b3935d6527afc55d89fbb`.

The repaired private build uses the documented `build.py --out` path. Its retained standalone input is
`/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/inputs/fixed-private.html`, SHA-256
`fd69cc3e97eb6f3a53b041bd2b7ab69a523c5bb142714d5e087ca60307916399`. That input belongs to the initial
`9a4f5a8eb0` checkpoint and its 18-step tour runner. Reproduce the final published acceptance with the current
branch’s 20-step runner and page:

```bash
python3 Concepts/onboarding/opus-5.5/tools/build.py --check
node Concepts/onboarding/opus-5.5/tools/scenarios.mjs /abs/local-output/scenarios --page Concepts/PMConcept7.html
node Concepts/onboarding/opus-5.5/tools/tour_scenarios.mjs /abs/local-output/tours --page Concepts/PMConcept7.html
```

Raw results/logs stay under `/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/`; no raw captures
are committed. `targeted` and `targeted-recheck` are intermediate diagnostic runs: they preserve the obsolete-button
pilot failures and the latent Ready exception, rather than presenting those pilots as the final regression.
The initial immutable evidence records below use absolute paths and SHA-256. Their manifest identifies the
initial intermediate logs, drafts, and three diagnostic screenshots shown during investigation.

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
| Initial evidence hashes | [evidence_manifest.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/evidence_manifest.json) | `cf178404386ebb3e6cab7da01fa18d17b62cca5a37f4b8aa4775a4f538b574ab` |

### Published validation and Opus review evidence

The final manifest covers all retained raw files, including the cap-smoke fixture/client and independent
Opus review archive. Both suites tested the committed candidate without any source or input hash changes.

| Evidence | Path | SHA-256 |
|---|---|---|
| Published page/harness inputs | [publish-rebase/inputs.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/inputs.json) | `5cce5a053684f50e1cd5cf8b9fa59fcbdf4d57200072e0ada8f2e3d1a9c65768` |
| Committed candidate and output parity | [publish-rebase/candidate.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/candidate.json) | `1331843505ad3343a6faebdf0cc57155de40b0c6a8df8716ebc70cdaeb99dfa5` |
| Publish pipeline log | [publish-rebase/build-publish.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/build-publish.log) | `1795e80283fd86fe3f372bda919733347acd6e0c0905cb658891bcee0f65a4a8` |
| Generator check log | [publish-rebase/build-check.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/build-check.log) | `245b7244bc573c5d763c2ccf876c3fc93a070dc569d5c322e5bc7c0a354b732c` |
| Cap retry and permanent-error smoke | [publish-rebase/start-retry-smoke.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/start-retry-smoke.log) | `4867bb6d1b26a0f9c78260937d096831a4b90c5435e0752f4d9918bc9a1b3645` |
| Published 69/69 result | [publish-rebase/all/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/all/report.json) | `d311029cdb06dc908dbdcea26c29d66a2a55a14b58789918684ec17155e44d27` |
| Published scenario runner log | [publish-rebase/all/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/all/runner.log) | `abb9c9703e4f896238d3edf7e89f90f13ea736e4f85261fec3ca5b559aef51b3` |
| Published tours, run 1 | [publish-rebase/tours-1/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/tours-1/report.json) | `93986a2bf9fd2175e49ba9aa83356683862e64b3ae14f09258140f3cc59dac67` |
| Published tours, run 2 | [publish-rebase/tours-2/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/tours-2/report.json) | `ca0613a56b6170c477ced671f358e9bd006d9df13de2eb344e90afa0e34b470e` |
| Published tours, run 3 | [publish-rebase/tours-3/report.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/tours-3/report.json) | `375fcdeca02e3a722a2d58f3640500b40337fd2479b132b4f73e04b0aa829058` |
| Tour runner log 1 | [publish-rebase/tours-1/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/tours-1/runner.log) | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| Tour runner log 2 | [publish-rebase/tours-2/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/tours-2/runner.log) | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| Tour runner log 3 | [publish-rebase/tours-3/runner.log](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/tours-3/runner.log) | `51d76a2d81aa19ecfbbd2c3682df7b1304e245d4b8d6b05b89caaeae9fadde84` |
| Opus review record | [review-glyphs/README.md](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/review-glyphs/README.md) | `92fb6fbd45f1cfb1fb0daae1decd8c28a82f16861a09082285fd740d996850d5` |
| Opus composition/probe evidence | [review-glyphs/compose-run.tgz](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/review-glyphs/compose-run.tgz) | `7378c9832266ca5d11be46b886d6af422820e555b0a682e08fa2d9aa331fba52` |
| Opus evidence hash list | [review-glyphs/SHA256SUMS](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/review-glyphs/SHA256SUMS) | `df4df4deca50fc9aedd211f54402cf06bdbcae9e920c0c5098aa931c9523aad7` |
| Final before/after comparison | [publish-rebase/comparison.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/comparison.json) | `f0f8b0c060ed270e6fa8388c65ea86228b228243327d141fddab58731438346c` |
| Final resource cleanup | [publish-rebase/cleanup.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/publish-rebase/cleanup.json) | `0e501cc25784b0592d1dd10567a21369e18c4ea58aaea1980a620dfa743b1ee8` |
| All retained evidence hashes | [evidence_manifest-publish.json](/mnt/Cursor/PuppetMaster-Evidence/tests/onboarding-scenarios-20261011/evidence_manifest-publish.json) | `63e6d80bb6d494079b156adbdaa231a473d7a1304d06b03255c20287f1e1cb0f` |

The classification follows the existing integration records
[Project recovery consumer](../packet-integration-completion-20260926/project-concept-consumer.md) and
[Server/Recovery Kit consumers](../packet-integration-completion-20260926/server-backup-consumers.md), checked against
live `Plans/Project_System.md`, `Plans/Server_System.md`, and `Plans/Backup_Restore_System.md`. Browser result adoption
uses deliberate fixtures; it does not certify native execution, protected authentication, or durable owner adapters.

## Review and composition handoff

No visual, copy, or design change is needed for these fixes. `pm7-glyphs` accepted the initial product and fixture
fixes; the harness follow-up is ready for its final review. The only product JS edit is the Ready reentrancy fix in
source68, outside its glyph call sites. Preserve glyph helpers
and status marks during composition; the harness does not depend on spinner classes, icon paths, or status text.
`pm7-no-pills`' CSS changes do not overlap this product fix.

The planner owns landing order. The publish rebase, generated publication/check, full 69-case run, and three
complete tour repetitions are finished. Glyph and no-pills composition remains with their owners and the planner;
preserve this branch’s source changes and regenerate during that composition. No landing was attempted.
All test browsers and their profiles are stopped/removed, and local scratch is deleted. The initial 171 and final
90 uncited screenshots were deleted; requested evidence and the three posted diagnostic screenshots remain outside
the repository. Keep this unlanded branch/worktree for the planner’s handoff.
