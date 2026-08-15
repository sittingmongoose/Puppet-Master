# 5.6 Sol — corrected verification report

## Result

The current correction has passing state, render-contract, syntax, JSON, compact-data generator consistency, ConceptHub-structure, and diff checks. Firefox/browser verification is blocked before product assertions by this host's namespace policy. Native Slint and physical-hardware behavior were not tested.

No winner is selected. No production provider, filesystem, notification, backup, container, source-control, testing, cleanup, or Server operation was executed.

## 1. State contract

Command, from the repository root:

```bash
node --test "Concepts/settings-redesign-concepts/5.6 Sol/verify/state.test.mjs"
```

Final current result:

```text
22 tests
22 passed
0 failed
```

The suite verifies:

1. Home and compact search do not evaluate the detail module in a fresh process.
2. Compact search is exactly 148 rows, deterministically reaches 825 rows, caps results, and contains no manager payload.
3. Only the selected manager detail loads, and it loads exactly once.
4. The manager cache is bounded and inactive detail subscriptions release with reference counts.
5. Virtual windows mount at most 40 rows and retain the stable selected row.
6. Transient interaction causes zero persistence writes; durable changes batch and obey the byte limit.
7. `RuntimeResourceGovernor` is the sole projection owner and exposes all six exact outcomes.
8. `ObservableWork` preserves truthful wait/progress fields and never fabricates a determinate denominator.
9. ObservableWork cancel/retry/background transitions are capability-gated.
10. Cancelling manager-load work fences its late commit; retry starts a fresh generation.
11. Cancelling provider-refresh work fences late completion; retry dispatches a fresh generation.
12. Retrying failed or cancelled active flows restores an actionable active state.
13. Provider policy rejects every silent first-acquisition initiator.
14. Provider setup requires official-source review before consent, retains exact Host/Environment, and keeps installation/authentication separate.
15. Identical setup requests coalesce while stale continuations fail closed.
16. A compatible existing provider installation can be selected without acquisition or authentication.
17. The 100-installation fixture remains compact, deterministic, and detail-deferred.
18. Eight manager-state fixtures are isolated, deterministic, and idempotent for every manager destination.
19. All four 47-family coverage documents use the closed vocabulary and leave unresolved Server mutation fail-closed.
20. The compact model-prompt projection excludes raw provider, resource, and runtime state.
21. Theme/reduced-motion effective state is truthful and sound stop is idempotent.
22. Runtime fixtures remain explicitly simulated instead of becoming native certification.

This is state-contract evidence in Node. It is not rendered-browser, native Slint, or production-runtime evidence.

## 2. Syntax, JSON, structure, and diff

Commands:

```bash
find "Concepts/settings-redesign-concepts/5.6 Sol" -type f -name '*.mjs' -print0 \
  | sort -z | xargs -0 -n1 node --check

find "Concepts/settings-redesign-concepts/5.6 Sol" -type f -name '*.json' -print0 \
  | sort -z | xargs -0 -n1 jq -e .

python3 Concepts/ConceptHub/validate.py \
  "Concepts/settings-redesign-concepts/5.6 Sol"

git diff --check -- \
  "Concepts/settings-redesign-concepts/5.6 Sol"
```

Final current results:

```text
14/14 JavaScript modules pass node --check
23/23 JSON files parse with jq -e
compact-data generator consistency passes
ConceptHub structural validation passes
git diff --check passes
```

The 23 JSON files include the ConceptHub manifest, aggregate impact register, reference-review report, and five JSON candidate/coverage/impact artifacts in each of four concept directories.

## 3. Manager and candidate-artifact checks

Each concept directory contains:

```text
impact-register.json
manager-coverage.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
```

Current totals:

```text
4 concept directories
24 candidate/impact artifacts
20 candidate/impact JSON artifacts
4 Plan-owner Markdown deltas
47 classified source families per concept
188 total matrix cells
57 demonstrated
111 shared_grammar
12 deferred_named_owner
8 missing
```

The two missing rows per concept preserve source traceability for the original Future Server Module Shell and the corrected Server insertion. Their canonical owner is unresolved, so both are inspect-only, mutation-disabled, and fail closed; they do not create separate Server engines. Candidate command IDs remain provisional/`NOT_MINTED`; no candidate artifact is production wiring or canon.

## 4. Render-contract suite

Command:

```bash
node --test "Concepts/settings-redesign-concepts/5.6 Sol/verify/render-contract.test.mjs"
```

Final current result:

```text
12 tests
12 passed
0 failed
0 skipped
0 cancelled
0 todo
```

The suite checks compact Home strings and raw-identity exclusion; workspace and assigned-manager loading-before-ready strings; all eight state semantics; provider source-review/consent/install/auth ordering; human provider summaries plus isolated Advanced Details; bounded installation windows; truthful ObservableWork strings; retained cached values for offline/degraded state; all eight theme token scopes; reduced/hidden/paused motion CSS; declared responsive width regimes; and text-expansion, RTL, escaping, and selected accessibility semantics.

This suite is pure state-to-string and CSS source-contract evidence. It does not create a viewport or accessibility tree, execute a browser, test native Slint, measure performance/network behavior, or exercise physical hardware. No browser conclusion is inferred from its pass.

## 5. Firefox W3C harness

`verify/browser-smoke.mjs` implements a direct W3C WebDriver client using Node built-ins. It does not create a Playwright product/runtime dependency. It uses OS-assigned ConceptHub/WebDriver ports, a unique temporary Firefox profile and output root, process-group cleanup, and fail-closed counts.

The final current focused attempt recorded in `reference-review-report.json` reached this boundary:

```text
ConceptHub bound: 127.0.0.1:45343
geckodriver bound: 127.0.0.1:41003
POST /session: timed out
Firefox diagnostic: Sandbox: CanCreateUserNamespace() unshare(CLONE_NEWPID): EPERM
harness assertions attempted: 1
harness assertions passed: 0
harness assertions failed: 1
browser product assertions: 0
cleanup completed: true
```

Because no WebDriver session was created, no concept page was reached. No Firefox claim is made for startup, render matrix, manager routes/states, provider policy, runtime/performance fixtures, motion, keyboard/focus, accessibility, RTL, overflow, clipping, or console behavior. The full Firefox matrix was not run.

Old pre-correction Chromium/Playwright and browser-pass counts are superseded and intentionally absent from this current report.

## 6. Evidence boundaries

| Surface | Current status | What it can support | What it cannot support |
|---|---|---|---|
| Node state suite | 22/22 pass | Deterministic module/data/state contracts, including cancellation/retry generation fencing. | Browser rendering, Slint, production runtime, hardware. |
| Node render-contract/CSS/static | 12/12 pass | Pure state-to-string and CSS source contracts asserted by the suite. | Viewport, accessibility tree, Firefox behavior, native Slint, performance/network, OS/physical hardware. |
| ConceptHub validator | Pass | Manifest, route/file, and structural registration. | Visual or interaction correctness. |
| Firefox W3C harness | Environment-blocked; 0 product assertions; cleanup true | Harness startup failure and cleanup behavior. | Any product/browser pass. |
| Native Slint 1.17.1 | Not run | Nothing current. | Native layout, focus, accessibility, rendering, motion, startup, memory, input. |
| Physical hardware/network | Not run | Nothing current beyond deterministic fixture semantics. | Ivy Bridge/Xeon/modern Intel/AMD/Apple Silicon, CPU/RAM, Low Power/thermal, slow disk, poor network, process-tree behavior. |

Deterministic pressure profiles are review fixtures, not hardware certification. Node renderer and CSS evidence do not substitute for a real Firefox session. Browser prototype evidence, if later obtained, will still not substitute for native Slint or physical hardware.

## 7. Named residuals

- **Server owner:** exact canonical owner unresolved; inspect-only and mutation-blocked.
- **Firefox host:** `unshare(CLONE_NEWPID): EPERM` blocks session creation; 0 product assertions.
- **Native Slint:** no current port/runtime evidence.
- **Physical systems:** no current old-CPU, RAM/pressure, thermal/Low Power, disk, network, or process-tree evidence.
- **Production integration:** deterministic concept operations do not prove real admission, cancellation, installation, authentication, mutation, receipt, rollback, or recovery behavior.

The valid conclusion is bounded: the corrected deterministic state/structure checks pass, while rendered/browser/native/hardware claims remain limited to the exact lanes above.
