# Assistant redesign — readiness

Generated 2026-09-03 from live report files. Every number below
was written by a harness run; nothing here is asserted by hand.

## 1. Concept verification suites

| Suite | Covers | Pass | Fail |
|---|---|---:|---:|
| `tests/goal-verify.mjs` | Simplified Goal runtime | 20 | 0 |
| `tests/assistant-plan-verify.mjs` | Assistant Plan / Deep Plan | 46 | 0 |
| `tests/todo-runtime-verify.mjs` | To-Do Runtime | 57 | 0 |
| `tests/collaboration-verify.mjs` | Crew / Chat Room / Review / BrainStorm | 87 | 0 |
| `tests/bsd-verify.mjs` | Back Seat Driver | 20 | 0 |
| `tests/attachments-composer-verify.mjs` | Attachments and composer | 44 | 0 |
| `tests/scheduling-verify.mjs` | Scheduling and quota resume | 49 | 0 |
| `tests/browser-capture-verify.mjs` | Browser capture and DevTools | 35 | 0 |
| `tests/restored-features-verify.mjs` | Teach / Teacher / ELI5 / Revert / Debug / title | 49 | 0 |
| `tests/provider-permission-verify.mjs` | Provider boundary and permission ceilings | 22 | 0 |
| `tests/correction-v4-verify.mjs` | Additive Correction v4 | 112 | 0 |

**Total across suites that ran: 541 passed, 0 failed.**

## 2. Existing concept audit (`tests/audit.mjs`)

**446 pass / 4 fail / 0 console errors / 0 page errors.**

Remaining failures, each classified:

| Failure | Classification |
|---|---|
| Plan decision is in flow above Activity Bar | Pre-existing. `[data-input="plan-feedback"]` is absent in the committed baseline build too — verified by running the same flow against `git show HEAD:index.html`. |
| Questionnaire persists and stays in flow | Pre-existing. The Ask Card questionnaire redesign removed the `Deployment questionnaire` header; the baseline build shows the same. |
| Matcher hygiene: no text assertion matched zero elements | Consequence of the row above, not a separate defect. |
| Orphan gate: every CSS selector can match something the JS emits | Down from **241 hard orphans to 10**. `goals.css` went 219 to 0 (the retired Goal phase/tranche/budget/role-cast rules, left behind when `goals.js` was rewritten), the ten `goal-compact-*` rules in `activity-bar.css`/`activity-panel.css` were purged or retargeted at the class that is actually emitted, and `collaboration.js` now writes whole class names instead of `prefix- + ternary` so its two badge rules are visible to a static analyser. The remaining 10 are all in `questions.css`, from the 2026-09-01 questionnaire wave — outside this scope and untouched. |

## 3. Generated output

```
Build check passed. Both deliverables match sha256 8cf9b5e75604c702.
```
- `index.html` — sha256 `2a545e14b92a74f6bc5b31c48f5c3e94966b1d49942ba2f379e9db28e780f931`
- `PM_Chat_Assistant_5.6_Pro_Standalone.html` — sha256 `2a545e14b92a74f6bc5b31c48f5c3e94966b1d49942ba2f379e9db28e780f931`

## 4. Requirement traceability

236 packet requirements, each mapped to a canonical owner document and a concept module.

- requirements whose named owner document is missing: **0**
- requirements whose named concept module is missing: **0**

Traceability at this granularity proves an owner and a module EXIST for every
requirement. It does not prove each individual sentence is implemented — the
per-assertion suites in section 1 are the evidence for that, and they cover the
behaviour the packet called out as needing proof rather than all 236 statements.

## 5. Canonical governance

`python3 scripts/pm-plans-verify.py run-gates` — **20 pass / 10 fail** of 30 gates.

| Failing gate | Disposition |
|---|---|
| `lint_path_refs` | Pre-existing. Ten prose `implementation_surface` values in the generated `Plans/.plan_index/plan_units.jsonl` (`credential broker`, `observer`, `K3 Backup`, and similar). Three of the five owning PlanUnits belong to `Forge_Integrations.md`, `Cursor_Origin_Integration.md` and `Source_Control_System.md` -- documents this wave never opened. Hand-editing a generated index to silence it is exactly what `CDRY-019` forbids. |
| `validate_audit_closure` | Generated governance: `_semantic_closure_registry.jsonl` owner-evidence hashes trail the owner edits. |
| `validate_evidence` | Generated governance: same artifact-hash staleness as the plan graph. |
| `validate_implementation_readiness` | Generated governance: `buildability_gate_report.json` is refreshed by `scripts/pm-implementation-readiness.py generate`. It also reports `pnc019_source_hash_stale` -- PNC-019 is out of scope by standing instruction and was not touched. |
| `validate_plan_graph` | Generated governance: artifact hashes trail the owner-document edits until the index is refreshed. |
| `validate_plan_migration` | Pre-existing. Historical migration-run snapshots, untouched by this work. |
| `validate_pm7_gui_fixtures` | Pre-existing PM7 shared-runtime fixture failure, untouched by this work. |
| `validate_touch_closure` | The two sole-handler collisions the redesign introduced were fixed in the prior wave. What remains is the pinned denominator in `scripts/pm-touch-closure-verify.py`, which still expects 1066 wiring entries against the redesign's 1155. Additive Correction v4 added **no** new rows -- it revised 27 existing ones -- so the pin is unchanged by this wave, and moving a drift detector's expected value stays an owner decision. See `Plans/UI_Wiring_Rules.md`. |
| `validate_wiring_matrix` | **Caused by this wave, and fixed.** The catalog's new "deliberately NOT registered" list names five command ids the correction forbids creating (`build_as_goal`, `export_report`, `progress.set`, `add_folder_reference`, `component.recapture`). The validator scraped them as registrations and demanded wiring rows; adding rows would have asserted exactly the identities the correction forbids, so the five are recorded in `Plans/Wiring_Matrix.production.exclusions.json` with their reasons instead. Re-run standalone: **pass**, so a fresh full run is **21 pass / 9 fail**. |
| `verify_spec_lock` | Generated governance. Spec Lock is refreshed by its owner script after source stabilises, and `Plans/Spec_Lock.json` is protected from hand-editing by `.claude/CLAUDE.md`. |

Closed by the redesign wave: `lint_contractrefs` (three broken owner-document references in
`Plans/Back_Seat_Driver.md`) and `validate_wiring_matrix` (schema-invalid element ids,
an evidence kind outside the closed enum, a wildcard command family, sixteen
view-local rows that were never registered commands, and 48 catalog commands with
no production wiring row at all).

## 6. Readiness, stated separately

These are three different claims and only the first two have evidence here.

Section 8 below reports the Additive Correction v4 delta (245 further requirements)
under the same three headings; the counts here are the original v2 packet.

### Canonical (Plans) — reconciled

The packet's 84 commands, 50 settings, 67 events, 39 runtime records and its wiring
rows are registered in their owner documents, and every one of the 236 requirements
resolves to an owner document that exists. Five new owner documents carry the new
runtimes. What this proves is that the specification is written and internally
consistent — not that anything executes.

### Concept (5.6 Pro) — working, and fixture-backed

The concept runs, and the suites in section 1 drive its real controls and assert the
resulting state. Every control changes fixture state and renders a durable result;
none of them dispatches a native command, and each card's Details names the
unregistered command it would have called. The `Building…` progression is a
client-side interval, and the runtime spec is explicit that no client-local timer is
authoritative — so it is a projection, not a schedule.

### Native (Rust/Slint product) — NOT started, and nothing here suggests otherwise

No native code was written or touched. Specifically **unproven**:

- no adapter exists, so the twelve provider conformance tests in
  `Plans/CLI_Bridged_Providers.md` cannot be executed — they are specified, not run,
  and no adapter may be marked supported on documentation alone;
- permission interception, host tool execution, and control-tier disclosure are
  specified and have no runtime;
- restart, crash and cross-reload persistence are demonstrated against in-memory
  fixtures; `RT.*` is not a durable store and a reload re-seeds it;
- every `handlers::…` string in the wiring matrix names a FUTURE target. The rows say
  so themselves, and `handler_unavailable` / `command_not_registered` remain the
  correct availability answers until source-hashed native proof exists;
- concept tests are not native runtime certification, and this document is not a
  certification.

## 7. Defects found by driving the controls

None of these was visible in the source. Each was found by clicking something in
a real browser and asserting what happened next.

| Defect | Why it was invisible |
|---|---|
| `plans.js` rendered its four dialogs from a module-local flag, so Details, Export, Build With Crew and Build At… clicked and **no dialog ever appeared**. | `app.js` only reaches the `dialog` slot when `state.dialog` is set. The code read as correct. |
| The Plan dialog then rendered at the overlay's **top-left, unclickable**, because it set `position:relative` and never carried the base `.dialog` class. `#pmOverlayRoot` is `pointer-events:none`. | It looked like a styling preference. |
| A commit hook appending a transcript message **wedged the renderer** with no error and no console output. | `composer-state.js` infers "a send happened" from the message count growing while the composer is empty; a hook that appends re-enters that inference. Unbounded mutual recursion. Fixed with a re-entrancy guard, so any future hook is safe too. |
| The composer textarea **kept its text after Send** (this one predates the wave — it reproduces identically on the committed baseline). | `pmSyncAttrs` synced a control's value from its `value` **attribute**; a `<textarea>` has none. And the focus guard that stops a render fighting the caret also blocked the deliberate clear. |
| BSD's hold/reconfirm cycle and failure isolation had **registered actions but no control anywhere**, so the behaviour the packet most wanted demonstrated was unreachable. | Grep found the action names and would have called it implemented. |
| The BSD wand row opened a **real but empty sidecar** — `app.js` had no extension point for a module-contributed submenu. Added one. | The row rendered; only the panel behind it was empty. |
| The Goal pencil promised "Edit objective in Activity Detail" but the **default Activity layout has no editor**, and an agent-proposed Goal change raised an **approval host that was invisible** on the surface that raised it. | Both projections existed; neither was reachable from where the control lived. |
| The Plan's version disagreed with itself: the transcript card said `V5` while the editor pane header said `Version 4 / Ready`. | Two surfaces, two sources, both individually plausible. |
| A Chat Room run was seeded onto the one thread whose whole purpose is to prove an ordinary conversation renders **zero cards**. | It looked like a reasonable place for a fixture. |
| The "Title unavailable" chip **never reached the screen**, though the state layer recorded the outcome correctly. | Same nesting as the hang above: the repaint ran synchronously from a commit hook, inside a render that had not finished, and the outer pass overwrote it. Deferred by one turn of the event loop. |
| Three wand actions left the menu **open above the surface they opened**. After one of them, a real click on the newly-rendered button landed on a menu row instead — proven with `elementFromPoint`, not inferred. | The menu is transparent to a reader of the code and opaque to a mouse. |

Canonical defects found the same way, by running the gates rather than reading the docs:
three broken owner-document references; two commands bound to **two different handler
identities** each; **43 wiring rows naming a handler the catalog does not declare**
(derived from the command name instead of read from the register); a wildcard command
family; sixteen rows that were never registered commands; and 48 catalog commands with
no wiring row at all.

## 8. Additive Correction v4 (2026-09-03)

245 correction requirements. Every one names an owner document that
exists and now carries a correction section, and every one has at least one packet test.

- owner documents still missing a correction section: **0**
- correction requirements with no packet test: **0**
- concept suite assertions: **112**

### Concept coverage per family

`asserted` counts requirements whose id is named by an assertion in
`tests/correction-v4-verify.mjs`, driving the real surface in a real browser.
The remainder are canonical or native obligations with no concept surface to drive —
they are **not** counted as closed by anything in this file.

| Family | Asserted in the concept | Requirements |
|---|---:|---:|
| `BSTALE` | 8 | 12 |
| `CDRY` | 0 | 20 |
| `CONCEPT` | 1 | 20 |
| `FOLDER` | 4 | 8 |
| `GREPLAY` | 2 | 12 |
| `MODAL` | 3 | 18 |
| `PART` | 13 | 24 |
| `PDET` | 5 | 12 |
| `PFAIL` | 2 | 10 |
| `PGOAL` | 9 | 15 |
| `PPROG` | 9 | 18 |
| `PSCHED` | 3 | 14 |
| `QMAX` | 9 | 20 |
| `SMSG` | 9 | 18 |
| `TDG` | 9 | 16 |
| `WONV` | 2 | 8 |
| **total** | **88** | **245** |

### The three readiness verdicts, kept apart

| Level | Verdict | What it rests on |
|---|---|---|
| **Canonical** | correction applied | 31 owner documents carry an Additive Correction v4 section; 7 Settings values retuned in `settings_inventory.json` and `Settings_System.md`; 27 production wiring entries revised with correction acceptance checks and 48 correction test rows; 20 migrations recorded in `storage-plan.md`. Owner text agreeing with itself proves nothing about a running system. |
| **Concept** | correction demonstrated | The suites in section 1, driven in a real browser. Fixture-backed. It is not native handler, storage, provider, scheduler or recovery proof. |
| **Native** | not started | No Rust, Slint, service, adapter or persistence work exists for any correction requirement. Every `cmd.*` the correction touches is still `handler_unavailable`. |

### What the concept suite deliberately does not close

| Requirement area | Why a concept pass cannot close it |
|---|---|
| Scheduler dispatch (PSCHED-004, SMSG-006) | Needs a server-owned timer and a real message pipeline. |
| Provider degradation (PSCHED-007, SMSG-011, PART-024) | Needs a live provider adapter. The concept refuses substitution; it makes no provider call. |
| Modal zero-effect proof (MODAL-002) | Proved here against this module's own instrumented ledger, not against real provider and Usage subsystems. |
| Storage migrations (CDRY-014, CDRY-015) | No migration executes in a `file://` page. |
| Production wiring (CDRY-012) | Needs a source-hashed native dispatcher. |

