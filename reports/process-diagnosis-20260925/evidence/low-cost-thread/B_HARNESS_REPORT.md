# Task B — harness changes for a fast, accurate seal on OMP

Agent: Claude Opus 5. Started 2026-09-16 ~20:30 UTC, stopped at the ~3-hour mark.

Hard constraints honoured: successor-10 was read only and is unmodified;
`/mnt/Cursor/PuppetMaster` untouched; no existing run directory, archive or
`~/.omp` profile modified (run profiles are derived into temporary directories
from `~/.omp/harness-probe-20260916` the way `_profile()` does);
`~/.local/bin/omp` not repointed; no credential printed or copied; no seal
validator changed and no custody hash removed; no candidate run, no review, no
experiment subject frozen.

---

## 0. What is verified, and what is not

This report is long and most of it is green. A reader skimming it should not
take that as evidence that the seal path works end to end. It does not, yet.

**Verified by measurement:** the direct-mode transport launches and reads its
model, effort and settings back; the host-owned seal runs synchronously with no
polling; `full19` is equivalent to the archived Q07 arm and `plan_layer` is an
exact fifteen-operation subset (task C); the packager is deterministic and
withholds nothing the dependency graph names; the OpenRouter route answers at a
real `xhigh`; custody clears and the command plan executes on a real
materialized workspace; R6-A reached a **passing nineteen-operation measurement
in 58.4 minutes** (task E).

**Never run, on any live run:** `finalize`, the Git commit, the amendment
release, the second measure, the second finalize, the second commit — on either
profile. Both B6 closing lines are "no".

**Known open, not closed:** egress. `launch.json` records
`network_egress_enforced: false`, there is no capture, and four auto-QA
grievance reports executed across E's two runs against a default-on
`qa.omp.sh` endpoint. `tools.xdev: false` and the dispatch guard should prevent
a recurrence; that is an expectation, not a measurement.

**The pattern worth carrying forward:** on this effort's own record, most of the
blocking defects were found by a live run or its transcripts, not by tests — the
probe stopped at custody, the archive replay at `shards_check`, and every
finalize test used a fake runner, so the finalize wiring was broken for four
rounds while the suite stayed green. E-1, E-5, E-7, E-9, E-10 and E-11 each
needed something real to surface them. Where this work is untried, assume the
next defect is there rather than in what has been exercised.

---

## 1. Successor-11 created

`/home/sittingmongoose/PM-Experiments/planning-workflow-successor-11-development/`

Copied from
`/home/sittingmongoose/PM-Experiments/planning-workflow-successor-10-development/`:
`README.md`, `pwflow/`, `tests/`, `docs/`, `fixtures/`, `operations/`.
`runtime/` was **not** copied (per the brief); `__pycache__` trees were dropped.

Lineage manifest of the copied tree, written before any edit, at
`.lineage/copied-tree-manifest.json`:

```
schema           pwflow.successor11-lineage-manifest.v1
file_count       23378
total_bytes      1321476458
manifest_sha256  b731da2f985d2e02ad4185cefc0438e3b6066b7435c3ebce25508fc38b39cefc
```

The lineage is also stated at the top of successor-11's `README.md`, and every
change is listed with its files in `CHANGES.md` at the successor-11 root.

---

## 2. Direct-mode OMP transport — DONE

**`pwflow/transports/omp_direct.py`** (new, ~480 lines).
**`pwflow/transports/omp.py`** (changed: `_profile()` gained an `overlay`
parameter whose default is the unchanged job-stream overlay).

What it does:

* **Runtime.** `runtime_version` is a launch setting, default `18.2.2`;
  `runtime_path` defaults to
  `/mnt/Cursor/PM-Experiments/omp-runtimes/omp-18.2.2-linux-x64/omp-linux-x64`.
  `--version` is read back and a mismatch fails the launch. The job-stream
  transport's `PINNED_VERSION = "18.1.12"` assertion does not apply here; that
  module is otherwise untouched, so the existing lane is unaffected.
* **Profile.** Derived per run into a temporary directory by the job-stream
  `_profile()`, from `~/.omp/harness-probe-20260916` by default, with
  `pwflow/omp_profile.py`'s overlay as `config.yml`. `--profile` is not used;
  the directory is passed through `PI_CODING_AGENT_DIR`, as task A found.
* **Tools.** OMP's native `read, bash, write, edit, grep, glob`. No host job
  tools, no trusted bridge extension, no job socket. `task`, `web_search`,
  `browser` and `computer` are refused by config validation.
* **Launch.** Goal mode through a pty, exactly as the job-stream transport
  drives it, because task A established goal mode exists only in an interactive
  pty (print mode does not parse slash commands; the RPC catalogue has no `goal`
  command). Readiness is the bracketed-paste cue plus a screen that has stopped
  repainting for 2 s, with the onboarding strings refused — the session file
  does not exist until the first turn runs, so it cannot be the signal (see §8,
  finding 1). The objective is submitted once as a bracketed paste of
  `/goal <objective>`, and `composer-readiness.json` records the signal used.
* **Completion** is observed from the records (`goal-completed` custom record /
  `mode_change` goal status), reusing `project_records`.
* **Readback, all hard failures:** any `model_change` whose `model` differs from
  the requested model, any `resolvedModelIsFallback: true`, any
  `thinking_level_change` whose `thinkingLevel` differs from the requested
  effort, and any effective setting that differs from the overlay's asserted
  values. The last one matters: a run that quietly reverted to 300-line pages
  would produce plausible but differently-informed work, so it fails at launch
  rather than running.
* **Stop endpoint kept:** `notify_host_stop` is still called on cancellation,
  and shutdown is still `\x04` followed by SIGTERM to the exact verified native
  child.

Evidence retained per run (full table in `docs/direct-omp-mode.md` §4):
`launch.json`, `launch-settings.json`, `version.stdout.raw`,
`effective-overlay.yml`, `config-list.stdout.raw`, `effective-settings.json`,
`prompt.json`, `session.raw.jsonl`, `response-measurements.json`,
`final-response.raw.txt`, `artifacts/` (spilled tool output),
`seal-calls.jsonl`, `seal-config.json`, `governance-reports/`, `tui.raw`,
`termination.json`, `manifest.json`.

`manifest.json` carries `evidence_columns`: model, thinking level, responses,
tool calls by tool, bytes of tool output, compactions (from
`contextSnapshot.compactionEpoch`), input / cached input / output / total
tokens, elapsed, and the seal calls — every one read back from the records, not
from the request.

**Honest gap.** The provider request trace is *not* available in direct mode. It
came from the trusted bridge extension via `PWFLOW_REQUEST_TRACE`, and loading
that extension would restore the four job tools the direct design exists to
remove. The result records
`provider_request_capture: "not_available_direct_mode_no_bridge_extension"`
rather than claiming a capture that does not exist. If the trace is required,
the bridge would have to be split into a trace-only extension — that is a design
decision, not something I should have quietly assumed.

---

## 3. Host-owned seal — DONE

**`pwflow/host_seal.py`** (host service) and **`pwflow/seal_client.py`**
(the standalone workspace client, installed as `<workspace>/.pwflow/governance.py`).
**`pwflow/scoped_governance.py`** changed: added `SKIPPABLE_OPERATIONS` and a
`skip_operations` parameter on `command_plan` and `execute_sandbox_governance`,
both defaulting to omitting nothing.

Model-facing contract, one bash call each, no compound command:

```
python3 -B .pwflow/governance.py measure       --declaration d.json --census c.json
python3 -B .pwflow/governance.py finalize      --declaration d.json --census c.json --dispositions p.json
python3 -B .pwflow/governance.py validate_json --declaration empty.json --prospective Plans/x.json=new.json
python3 -B .pwflow/governance.py read_file     --path Plans/00-plans-index.md
```

The client is standard-library-only and imports nothing from pwflow (asserted by
a test), so it runs inside the bwrap sandbox, which mounts only the workspace
and the private directory. It connects to a unix socket inside the workspace,
sends one length-prefixed frame, blocks, prints one JSON object, exits. **There
is no job id, no background handle and nothing to poll.**

`measure` returns one compact object **under 20 KB** — chosen to sit far below
OMP's 50 KB bash-elision threshold, so the answer is never middle-elided on its
way into the transcript:

* `status`, `artifact_checks`, `global_status`, `revision_id`, `elapsed_seconds`
* `operations`: every operation of the profile, in `command_plan` order, with
  `status`, `elapsed_seconds`, `returncode`, `timed_out`; an operation the run
  never reached is reported as `not_reached` rather than omitted
* `failing_checks`: `failure_id`, `operation`, `check`, `error_codes`,
  `reported_count`, `detail_completeness`, `coverage_required`, and
  `evidence_paths` (the `.report.json`, `.stdout` and `.stderr` on disk)
* `full_report_path` plus `measurement_binding` (path + sha256)
* `synchronous: true`, `polling_required: false`

If the failing-check list will not fit, it is cut from the tail and
`failing_checks_truncated` plus `failing_checks_note` state the full count and
the on-disk path of the complete census. A reader can never mistake the
projection for the whole thing.

**Profiles.** `full19` (all nineteen, in `command_plan` order) and `plan_layer`
(the fifteen that are not `run_gates`, `audit_governance`, `migration_snapshot`,
`migration_validate`). The profile is bound into the service at construction,
written into `launch-settings.json` and `seal-config.json`, and a request
carrying a `profile`, `skip_operations` or `run_global_checks` field is
**refused** — the model cannot select how much of the seal runs.

**Validators unchanged.** A profile decides which whole operations run. Every
operation that runs keeps its exact argv, allowed writes and report path from
`scoped_governance.command_plan`. `SKIPPABLE_OPERATIONS` is a two-element
frozenset (`migration_snapshot`, `migration_validate`) and `command_plan` raises
on anything else; `run_gates`/`audit_governance` are omitted through the
pre-existing `run_global_checks` switch. Nothing was relaxed and no custody hash
was removed. `plan_layer` is a narrower seal, not a weaker one: what it does not
run, it does not claim.

Every seal call is appended to `evidence/seal-calls.jsonl` with the answer's
byte length, its SHA-256 and elapsed time.

---

## 4. No paging — DONE, with a measured caveat

### 4.1 Codex: `response_cap_bytes` is a launch setting

**`pwflow/response_pages.py`** (new; ported from the frozen 100 K runtime
`context-100k-package-001/candidate/baseline/response_pages.py`) and
**`pwflow/transports/codex.py`** (`validate_config` now admits
`response_cap_bytes`; `response_cap_setting()` writes
`evidence/response-cap-setting.json` and sets `result['response_cap_bytes']`).

| | before | after |
|---|---|---|
| value | frozen `16384` | launch setting |
| default | — | **262144** |
| floor | — | **262144** (below it is refused, not clamped) |
| ceiling | — | 4194304 (implausibility guard) |

`admit_response_cap()` replaces the frozen
`c['response_cap_bytes'] == 16384` assertion at
`context-100k-package-001/launcher/admission.py:66`. A configuration that would
page is now a launch failure rather than a slow run.

**Custody is unchanged and still whole-response.** `retain()` writes the entire
logical answer to disk and hashes those exact bytes; every page carries
`response_sha256` and `response_bytes` for the whole response plus
`payload_sha256` for the delivered interval; a page is still only accepted
against the whole-response digest; a tampered retained response is still
refused. Tests assert all four.

### 4.2 OMP: the profile overlay, and what it actually bought

**`pwflow/omp_profile.py`** (new). Raised in the overlay and asserted after
launch against `omp config list`:

| setting | stock | direct mode |
|---|---|---|
| `read.defaultLimit` | 300 | 5000 |
| `tools.outputMaxColumns` | 768 | 100000 |
| `tools.artifactSpillThreshold` | 50 (KB) | 2048 (KB) |
| `bash.autoBackground.enabled` | true | **false** |
| `bash.autoBackground.thresholdMs` | 60000 | 86400000 |
| `tools.maxTimeout` | 0 | 0 (no host ceiling) |
| `retry.modelFallback` | false | false |
| `retry.waitForUsageReset` | — | false |

**Verified by a real read**, `omp read` on the 431,648-byte / 5,967-line
`plans-index.md` with the 18.2.2 binary
(`/home/sittingmongoose/PM-Experiments/harness-latency-20260916/probe-workspace/g2/plans-index.md`,
sha256 `83cef828f5301d3ebddd286da84a3c9ff0776c0769f3fcf6e37ffd6483086926`,
longest line 3,829 chars):

| profile | stdout bytes | lines | footer | line cut | elision |
|---|---|---|---|---|---|
| stock defaults | 69,668 | 309 | `[Showing lines 1-300 of 5967. Use :301 to continue. Some lines truncated to 768 chars]` | **yes** | yes |
| direct overlay | 303,086 | 3,011 | `[Showing lines 1-3000 of 5967. Use :3001 to continue]` | **no** | **no** |

So the overlay removes both correctness hazards — the 768-character line cut and
the ~50 KB middle elision are gone — and cuts the read from ~20 pages to 2.

**But the file does not arrive whole.** There is a **hard 3000-line page ceiling
on the read tool that `read.defaultLimit` cannot raise.** Measured across eight
combinations: `defaultLimit` 5000 and 20000 × selectors `(none)`, `:1-5967`,
`:raw:1+5967`, `:raw:1+20000` — every one returned
`[Showing lines 1-3000 of …]`. This is a new finding; task A's addendum expected
the three settings to be sufficient.

**So the brief's fallback was implemented**, exactly as specified ("if it
truncates, provide a `read_file` equivalent through the same host command
pattern as the seal, returning byte ranges up to 512 KB with the file's
SHA-256"):

```
python3 -B .pwflow/governance.py read_file --path Plans/00-plans-index.md
```

**Superseded by finding E-9 — see §B5.** This section originally reported that a
431 KB canon file "reads whole in one call". That was true of what the host
produced and false of what the model received: the answer crosses to the model
through the `bash` tool, which cut its `text` field at `tools.outputMaxColumns`
and elided the rest into an artifact. The host now spills an oversized answer to
a workspace file and returns the path and digest instead of claiming
completeness. Up to 512 KB per call still holds for the host-side read, and the
whole-file digest on every range still holds; the "whole in one call" claim does
not.

The effective settings and the measured 3000-line ceiling are both recorded in
each run's `evidence/effective-settings.json`
(`native_read_page_ceiling_lines: 3000` with the measurement note).

### 4.3 Compaction — explicit and recorded

`compaction.thresholdTokens` and `thresholdPercent` are real settings, both `-1`
(auto) by default. Direct mode sets them explicitly:

```
compaction.enabled            true
compaction.thresholdTokens    240000     (was -1 / auto)
compaction.thresholdPercent   -1
compaction.keepRecentTokens   60000      (was 20000)
compaction.supersedeReads     false      (was true)
compaction.idleEnabled        false
compaction.autoContinue       true
```

`supersedeReads: false` is the one that addresses the 100 K run's diagnosis —
that setting is what threw away pages the model had already read. The whole
block is written to `evidence/effective-settings.json` under `compaction`, and
every compaction that actually fires is counted from
`contextSnapshot.compactionEpoch` into `evidence_columns.compactions`.

Auto-background for bash is off, per the brief; the seal runs synchronously with
its own long timeout and `tools.maxTimeout = 0` means no host ceiling.

**Bash compound commands.** Task A reported `bash.allowCompoundCommands = false`.
What that means concretely: one command per tool call — no `&&`, no `;`, no
pipelines, no subshells. The seal invocation is written to work under it: a
single `python3 -B .pwflow/governance.py …` with all inputs as file arguments,
no `cd` prefix (the tool's working directory is the workspace root) and no
piping of the JSON answer. The client's module docstring says so, and the task
text in the smoke repeats it.

---

## 5. Topic-scoped input packager — DONE

**`pwflow/topic_inputs.py`** (new).

```
python3 -B -m pwflow.topic_inputs --workspace <w> --subject Plans/GitLab_Integration.md
```

`TOPIC_INPUTS.md` contains, in order: provenance (subject + both index files
with SHA-256, unit counts, `deterministic: true`), the size budget line, the
subject's own PlanUnit rows in full, every declared dependency edge, every
declared consumer edge, the **full canonical text of every unit those edges
name**, the owner passages the subject's ContractRefs name (heading blocks
matched by PlanUnit identity or SchemaID token), and a bounded-lookup section
naming exactly what is not inlined and the commands that fetch it.

* **Nothing the graph names is withheld.** If a graph edge names a unit the
  index cannot supply, the packager raises rather than shipping an incomplete
  packet (tested).
* **Deterministic.** No timestamps, no host paths, stable sort; two runs produce
  byte-identical files (tested, and confirmed by hashing the real output twice).
* **Self-describing size.** The budget line states the file's own byte count,
  computed to a fixed point.

Measured on the repaired GitLab subject
(`repaired-subject-001/workspace`, main 4d9d21297d with DL-044):

| | |
|---|---|
| subject units | 5 (GLI-001..005) |
| units the graph names | 9 (FGI-001, FGI-003..008, PDS-003, SCS-005) |
| dependency edges / consumer edges | 25 / 17 |
| packet size | **44,910 bytes** |
| replaces | a 431,648-byte index that cost 16 read calls and 522,992 characters of tool output |

The task text points the model at `TOPIC_INPUTS.md` instead of
`Plans/00-plans-index.md`; everything else in `BASELINE_TASK.md` /
`BASELINE_GOVERNANCE.md` keeps its substance, only the tool contract changes.

---

## 6. Tests — 67 new, all passing

unittest style, no network, no model calls.

| file | tests | covers |
|---|---|---|
| `tests/test_topic_inputs.py` | 10 | packager on a small synthetic index: subject selection, all graph-named units present with canonical text, both edge directions, ContractRef owner passages, unreachable unit excluded, byte-identical output, budget line = written size, absent-unit refusal, empty-subject refusal |
| `tests/test_host_seal.py` | 19 | profile membership (19 / 15 / the exact four omitted), compact result shape, per-op status and elapsed, `not_reached`, failing checks with evidence paths, 20 KB bound with truncation notice, socket round trip, profile-in-request refused, unknown operation refused before anything runs, audit log, `read_file` whole/range/limit/escape, client standalone + config pins the profile |
| `tests/test_response_cap_setting.py` | 14 | cap default/floor, 16384 refused, larger admitted, type guards, whole-response custody preserved, response that paged at 16 K now arrives whole, wrong-hash and tampered-response refusals, codex `validate_config` admission |
| `tests/test_omp_direct.py` | 24 | config validation (defaults, launch settings, job tools refused, agent/network tools refused, unknown profile, live repo paths, evidence inside workspace, control chars), launch-settings block, profile derivation with the direct overlay + job-stream overlay unchanged + symlink refusal, fake runtime binary (version readback, pin mismatch, settings drift), canned 18.2.x record stream (goal projection, model/effort readback, fallback detection, tool-output bytes, compaction count, evidence columns) |

```
$ python3 -B -m unittest tests.test_topic_inputs tests.test_host_seal \
      tests.test_response_cap_setting tests.test_omp_direct
Ran 67 tests — OK
```

**Pre-existing suite.** `tests.test_scoped_governance`, `tests.test_codex_stage`,
`tests.test_omp_stage`, `tests.test_structure` → 71 tests, **2 failures**, both
in `tests/test_omp_stage.py`
(`test_bridge_admissions_and_socket_operations`,
`test_context_replacement_preserves_current_tool_causality`). Both need
`runtime/omp/bridge.ts`, which the brief said not to copy; both pass unchanged
in successor-10. This is a consequence of the copy scope, not a regression —
nothing in this change set touches them, and direct mode does not use the
bridge. Remedy if the job-stream lane is to run from successor-11: copy
`runtime/omp/bridge.ts` across.

---

## 7. Models

**union-alpha retried once at the end of the work**, with task A's section 8.1
command (18.2.2 binary, `~/.omp/harness-probe-20260916`, `--thinking xhigh`,
`-p "Reply with exactly: PONG"`, stdin closed), 2026-09-16 ~23:2x UTC:

```
{"provider":"opencode-go","model":"union-alpha","stopReason":"error",
 "errorStatus":500,"errorId":135168,
 "errorMessage":"500 Internal server error\nInternal server error (type=error)",
 "duration":16210.24}
```

Identical signature to task A's five attempts — HTTP 500, errorId 135168, ~16.2 s,
zero tokens. `opencode-go/union-alpha` is **still unavailable at the provider**.

Everything in this change set is model-agnostic: model and thinking level are
launch settings, validated as non-empty strings, recorded in the evidence and
read back from the records. `modelFallback: false` and `retry.enabled: false`
are in the overlay, so no substitution can happen inside a run.

## 8. Smoke

Throwaway copy of the repaired subject at
`/home/sittingmongoose/PM-Experiments/harness-latency-20260916/smoke-direct-001/workspace`
(the frozen `repaired-subject-001/workspace` was copied, never modified). Task:
"run the seal measure with plan_layer, then report the failing checks", no
edits. Fallbacks attempted in the addendum's order, starting with
`opencode-go/deepseek-v4.1-flash` at `max`.

**Model used: `opencode-go/deepseek-v4.1-flash` at thinking `max`** — the first
fallback in the addendum's order, and it answered on the first attempt.

Run result (`smoke-direct-001/evidence-opencode-go_deepseek-v4.1-flash/manifest.json`):

```
status                      completed
process_exit_code           0
effective_runtime_version   omp/18.2.2
duration_seconds            44.26
native_goal                 created_observed true, completed_observed true,
                            goal_id 15823987813e17a7, identity_conflict false
session_id                  01a0abb0-b69c-74a5-a60d-557ed11c04e9
effective_settings_drift    []          <- the raised read/bash/compaction settings all took
evidence_columns.model              ["opencode-go/deepseek-v4.1-flash"]   (read back)
evidence_columns.thinking_level     ["max"]                               (read back)
evidence_columns.responses          8
evidence_columns.tool_calls_by_tool {"bash": 2, "glob": 2, "goal": 1, "grep": 1, "read": 4}
evidence_columns.tool_output_bytes  8509
evidence_columns.compactions        0
tokens                      input 9571, cached input 71424, output 5034, total 86029
evidence files retained     16
```

What the smoke establishes:

* **The pty goal launch works on 18.2.2.** `mode_change` carried an active goal
  with the submitted objective, and `goal-completed` records closed it.
* **Model and effort read back clean.** `model_change` reported
  `opencode-go/deepseek-v4.1-flash` with `resolvedModelIsFallback: false`,
  `thinking_level_change` reported `max`. No drift, no fallback.
* **The profile overlay took effect in a live run:** `effective_settings_drift`
  is empty, so the raised read limits, the disabled bash auto-background and the
  explicit compaction settings were all in force.
* **The seal ran as one synchronous call, no polling.** The model issued the
  command once, in a single bash call, and got one answer. Its own words: "the
  seal is single-shot and returned exactly once". `seal-calls.jsonl` records one
  call, 245-byte answer, 0.001 s.
* **The host refused it, for the right reason.** As anticipated in §9.7, the
  repaired subject is not a governance sandbox:

  ```json
  {"schema": "pwflow.host-seal-result.v1", "operation": "measure",
   "profile": "plan_layer", "accepted": false, "status": "refused",
   "reason": "missing or escaped file: .pwflow-sandbox.json",
   "synchronous": true, "polling_required": false, "elapsed_seconds": 0.001}
  ```

  That is `scoped_governance._roots`'s real precondition surfacing through the
  new command unchanged. The model verified it independently (globbed for the
  marker, found nothing), reported the refusal, and **made no edits** — it
  explicitly declined to fabricate the missing marker.

Two findings from the smoke, both already fixed or recorded:

1. **Composer readiness (fixed).** My first readiness gate waited for a
   `session` record in the session file before typing the objective. OMP does
   not create the session file until the first turn runs, so a perfectly healthy
   composer sat at the prompt and the run died with
   `TimeoutError: OMP input readiness timeout` after 90 s without ever
   submitting. Replaced with: bracketed-paste cue seen, onboarding strings
   absent, and the terminal screen unchanged for 2.0 s
   (`READY_SETTLE_SECONDS`). `composer-readiness.json` records the signal used.
   The second run submitted the objective immediately. This was found only
   because the smoke ran; it is exactly the class of defect a smoke exists for.
2. **Task text, not code.** My objective ended the command sentence with a
   full stop, and argparse read the trailing `.` as an unrecognised positional
   (exit 2, client-side, never reached the socket). The model diagnosed it
   correctly, read the client's own docstring and reran without it. Worth
   remembering when writing the real task text: with
   `bash.allowCompoundCommands = false` the command line is taken literally, so
   do not put a command inline in a sentence that ends in punctuation.

Not established by this smoke: the fifteen real operations of `plan_layer`
executing end to end. That needs a workspace with the `.pwflow-sandbox.json`
fixture marker, which is task C's ground.

---

## 9. Open issues

1. **The native read tool keeps a hard 3000-line page.** `read.defaultLimit`
   cannot raise it. Whole-file canon reads must go through the host `read_file`
   command. Worth confirming against a later OMP release, and worth telling the
   model plainly in the task text (the docs do).
2. **No provider request trace in direct mode** (§2). Would need a trace-only
   extension that does not carry the job tools.
3. **`plan_layer` is a narrower seal.** Fifteen of nineteen operations. It must
   never be described as a full repository seal, and the compact answer says so
   (`profile`, `profile_operations`, and a `semantic_judgment` of
   `caller_owned_host_does_not_certify_semantics`).
4. **The 100 K launcher's frozen admission line is not edited.**
   `context-100k-package-001/launcher/admission.py:66` still asserts
   `response_cap_bytes == 16384` — it is inside an existing run directory, which
   the brief forbids touching. successor-11 carries the replacement admission
   (`response_pages.admit_response_cap`), and any new package built from
   successor-11 should call it instead of re-freezing a constant.
5. **union-alpha is still down** (§7). A launch configuration for it exists and
   is correct; it cannot be smoked until the provider answers.
6. **Two pre-existing bridge tests fail** because `runtime/` was not copied (§6).
7. **The seal has not been exercised against a real governance sandbox** in this
   task. Confirmed empirically by the smoke: the repaired subject carries
   `Plans/` and `scripts/` but no `.pwflow-sandbox.json` fixture marker, so
   `scoped_governance._roots` refuses it (`missing or escaped file:
   .pwflow-sandbox.json`). The service, the client, the socket protocol, the
   profile binding, the compact projection and the whole live path from bash
   call to host answer are covered; the end-to-end run of fifteen real
   operations needs a workspace with that marker, which is task C's ground.
8. **Write the task text so a command is never inline in a sentence**
   (§8, finding 2). With compound commands disabled the model copies the line
   literally, and a sentence-ending full stop becomes an argparse positional.

---

## B2 — provider key files for the OpenRouter route (follow-up)

**Setting: DONE.** `pwflow/transports/omp_direct.py` gained `provider_key_files`,
a launch setting mapping an environment variable name to an absolute file path.
Tests: `tests/test_provider_keys.py` (24). Docs: `docs/direct-omp-mode.md` §3
("The OpenRouter route, and `provider_key_files`") and the §4 evidence table.

### What it does

`validate_provider_key_files()` checks the shape at config time: the variable
name must match `[A-Z][A-Z0-9_]{0,63}` and the path must be absolute. Nothing is
opened yet.

`read_provider_keys()` runs at launch, **before** the runtime starts, and
refuses — failing the whole launch — a key file that is:

| refusal | why |
|---|---|
| a symlink | the target is not what the launch declared |
| missing | run without the credential and blame the provider: no |
| empty, or whitespace only | same |
| group- or world-readable (`mode & 0o077`) | owner-only, as specified |
| larger than 4096 bytes | that is not a key |

The trailing newline (and CRLF) is stripped. The value goes into the child
environment dict and nowhere else.

### The value does not reach the evidence

* `launch.json` now writes `redacted_environment(env, secret_names)`, so the
  variable appears as `"OPENROUTER_API_KEY": "<redacted>"`, alongside
  `environment_redacted_variables`. This was the one place the transport
  serialised the environment, and it was serialising it verbatim.
* `evidence/provider-keys.json` (new) records, per key: `variable`, `path`,
  `file_sha256`, `file_bytes`, `value_recorded: false`,
  `value_scope: "omp_child_environment_only"`.
* `launch-settings.json` lists `provider_key_files` as variable/path pairs with
  `provider_key_values_recorded: false`.
* The stage result carries `provider_key_variables` (names only).
* No refusal message quotes the value; a test asserts that too.

### Test evidence

`tests/test_provider_keys.py`, 24 tests, no network and no model call. The
secret is a literal test string in a temporary file; no real credential is read
by the test module.

The load-bearing one runs the transport far enough to write its evidence, using
a fake runtime that dumps the environment it was handed (the transport builds a
minimal environment from scratch, so the fake reads its canned data from paths
beside itself rather than from inherited variables):

* `test_child_environment_carries_the_value` — the dump contains
  `OPENROUTER_API_KEY=<value>`.
* `test_no_evidence_file_contains_the_value` — **every file** under the evidence
  directory is read as bytes and asserted not to contain the secret.
* `test_launch_json_shows_the_variable_redacted`,
  `test_provider_keys_evidence_records_the_file_not_the_value`,
  `test_launch_settings_name_the_key_files_without_values`,
  `test_result_names_the_variables_only`.
* `test_a_bad_key_file_fails_the_launch_before_the_runtime_starts` — a
  world-readable key file fails with `owner-only` in the reason and the runtime
  never starts (the env dump does not exist).

Full new-test count: **93 passing**
(`test_topic_inputs` 10, `test_host_seal` 19, `test_response_cap_setting` 14,
`test_omp_direct` 26, `test_provider_keys` 24).

### Live verification of the route

Ran the real route through the transport's own key plumbing (key read by
`read_provider_keys`, never printed), 2026-09-16:

```
key receipts: [{"variable":"OPENROUTER_API_KEY",
                "path":"/home/sittingmongoose/.config/omp/secrets/openrouter.key",
                "file_sha256":"1051f8d0dc5927c84f128878d859ad8f11f99665692d24b3eddbdb5ecaf8707c",
                "file_bytes":73, "value_recorded":false}]
exit 0, wall 12.2 s
model_change:          openrouter/stealth/union-alpha, fallback false
thinking_level_change: null
assistant:             provider openrouter, model stealth/union-alpha,
                       stopReason stop, duration 7532 ms, text "PONG"
```

So the route works and union-alpha answers. `opencode-go/union-alpha` retried
separately in §7 is still HTTP 500.

### One finding the live check turned up

**The OpenRouter route declares no thinking ladder, and the transport was right
to notice.** `omp models ls --json` returns **zero** `openrouter` models — the
selector resolves as a passthrough, not a catalogue entry — so the session
records `thinkingLevel: null` whatever `--thinking` asked for. A direct-mode run
configured with `effort: 'xhigh'` therefore **fails its own readback** with
`effort drift: requested xhigh, records report None`.

That is the correct outcome: a run that asked for `xhigh` and silently got no
reasoning tier is exactly the substitution the readback exists to catch, and
quietly accepting a null level would have made the check worthless for every
other route too. So rather than loosen it, I added an explicit reserved value:

```python
'model':  'openrouter/stealth/union-alpha',
'effort': omp_direct.NO_THINKING_LADDER,   # == 'none'
```

With `'none'` declared, a null level is *required* and any other level is drift;
without it, `xhigh` still fails. The check stays strict in both directions and
the launch decision is explicit and recorded. Two tests cover both directions.

If Jared wants union-alpha at a real reasoning tier rather than at whatever
OpenRouter's passthrough default is, this route cannot supply it, and the
fallbacks that do (`zai/glm-5.3-flash` max, `opencode-go/deepseek-v4.1-flash`
max, `muse-code/muse-spark-1.3-contributor` xhigh) answer from the profile's own
auth with no key file at all. That is a model choice, not a harness defect.

### Residual exposure, stated plainly

bwrap does not clear the environment for the sandboxed process, so the model's
`bash` tool can read `$OPENROUTER_API_KEY` inside a run. OMP 18.2.2 obfuscates
credential-shaped tokens (Bearer tokens, API keys) before they reach a
transcript, which limits but does not eliminate this. There is no way to hand
OMP a provider key without it being in OMP's environment, so the mitigations are
operational: use a key scoped to this purpose, and treat `tui.raw` from a run
with untrusted task text as sensitive. Nothing the transport writes contains the
value.

Constraints honoured: the probe profiles, successor-10, the archives and the
product repository were not modified; the key value was never printed, copied or
committed; `~/.local/bin/omp` was not repointed.

---

## B3 — the OpenRouter route as a custom provider, with a thinking ladder

**Setting: DONE.** `custom_providers` in `pwflow/transports/omp_direct.py`, with
`build_mount_plan(..., extra_readonly)` in `pwflow/transports/omp.py` (default
empty, job-stream lane unaffected). Tests in `tests/test_provider_keys.py`.
Docs: `docs/direct-omp-mode.md` §3, "Preferred: `custom_providers`…".

This replaces the B2 passthrough for union-alpha. B2's finding was that
`openrouter/stealth/union-alpha` is not in OMP's catalogue, so it records
`thinkingLevel: null` and a run asking for `xhigh` fails its own readback.
Declaring the same model as a custom provider fixes the cause rather than the
symptom: the ladder is declared, so the runtime records a real level.

### Live readback result — **PASSES at xhigh**

Run through the transport, `b3-live-001/evidence/manifest.json`:

```
status                      completed          process_exit_code 0
effective_runtime_version   omp/18.2.2
effective_models            [{"model": "openrouter-union/stealth/union-alpha",
                              "fallback": false}]
effective_efforts           [{"effort": "xhigh"}]
evidence_columns.model           ["openrouter-union/stealth/union-alpha"]
evidence_columns.thinking_level  ["xhigh"]          <-- the B3 acceptance criterion
native_goal                 created true, completed true, identity_conflict false
provider_key_variables      []                 <-- no key in the child environment
final response              "PONG"
elapsed                     61.4 s (2 responses, 16,399 tokens)
```

`readback_violations` returned nothing: the model matches, `fallback` is false,
and the effort is a genuine `xhigh` rather than `NO_THINKING_LADDER`. The
`'none'` literal added in B2 stays for the bare passthrough, but this route does
not need it.

### What the setting does

`validate_custom_providers()` checks **shape only** — provider names against
`[a-z0-9][a-z0-9._-]{0,63}`, mapping structure, a 64 KB ceiling — plus one hard
rule enforced recursively over the whole block: a credential field (`apiKey`,
`token`, `secret`, `password`, `authorization`, `auth`, `bearer`, at any depth)
must be **either an environment-variable name or a `!command`**. A literal value
fails the launch, and the refusal message does not quote it. The harness never
opens the key file on this route; OMP runs the `!cat` itself.

`merge_models_yaml()` merges at provider level into the run profile's
`models.yml`: a provider the block names replaces that provider's whole entry,
every other provider in the file is kept. Written with `yaml.safe_dump`, so the
`!command` string stays a quoted scalar and is never read as a YAML tag.

`provider_key_paths()` extracts the absolute paths a simple `!cat /abs/path`
credential reads, and those paths are passed to `build_mount_plan` as
`extra_readonly`.

### Evidence

`evidence/custom-providers.json` from the live run:

```json
{"schema": "pwflow.omp-direct-custom-providers.v1",
 "credential_fields": "reference_only_env_var_name_or_command",
 "secret_values_recorded": false,
 "key_files_mounted_readonly": ["/home/sittingmongoose/.config/omp/secrets/openrouter.key"],
 "model_bash_can_read_mounted_key_files": true,
 "effective_models_yml_sha256": "0b4b52b9089bc3fc6e2106066b8ee3544a667d7a5cdba67466f83b8119a0750b"}
```

with `providers.openrouter-union.apiKey` recorded verbatim as
`!cat /home/sittingmongoose/.config/omp/secrets/openrouter.key` — a path, not a
value. `launch.json` carries `--ro-bind <keyfile>` in its argv (asserted
positionally by a test) and lists the mounted paths;
`launch-settings.json` carries the block and
`custom_provider_secret_values_recorded: false`.

Leak scan after the live run: the key file's actual contents appear in **no**
file under `b3-live-001/`, successor-11, or `reports/`.

### The exposure, stated plainly

The key file is mounted into the sandbox because the runtime has to run `!cat`
inside the namespace. **The model's `bash` tool can therefore read it**
(`cat <keyfile>` works). The transport cannot hide this; it records it instead,
as `model_bash_can_read_mounted_key_files: true`. Mitigations, in order of
durability, and all four are in the docs:

1. Use a **spend-capped key** dedicated to experiments, so the worst case is a
   bounded bill rather than an open account.
2. The durable design is OMP's **`auth-gateway` with transport `pi-native`**,
   which keeps the credential outside the sandbox and hands the runtime a
   brokered connection. This setting is the working arrangement until then.
3. OMP 18.2.2 obfuscates credential-shaped tokens before they reach a
   transcript, limiting leakage into `tui.raw` and the session records without
   preventing a determined read.
4. `provider_key_files` (B2) remains as the fallback. It avoids the mount but
   puts the value in the child environment, where `bash` can also read it, and
   it loses the thinking ladder — so it is a fallback, not an improvement.

### Tests

`tests/test_provider_keys.py` is now 47 tests (5 skipped: inherited
`provider_key_files` assertions that do not apply to the `!cat` route, each
skipped with its reason). New in B3:

* `CustomProviderValidationTest` (8) — the measured union block is accepted with
  its ladder intact; a literal `apiKey` is refused and the message does not
  quote it; a literal nested in `headers.authorization` is refused; env-var
  references in all three spellings are accepted; bad provider names and
  non-mapping configs refused; key paths extracted for the mount plan; an
  env-var reference contributes no mount.
* `MergeModelsYamlTest` (3) — existing providers survive the merge, merging into
  an empty file works, and the `!command` stays a plain string.
* `CustomProviderEvidenceTest` (4 active) — the load-bearing one writes a
  temporary key file with a distinctive secret and a `models.yml` block using
  `!cat` on it, runs the transport, and asserts **every file** under the
  evidence directory is free of the file's contents. The others assert the block
  is recorded verbatim with the command, the key file is `--ro-bind` in the
  launch argv, and the merged `models.yml` keeps the source providers.

Full new-test count: **116 passing, 5 skipped**
(`test_topic_inputs` 10, `test_host_seal` 19, `test_response_cap_setting` 14,
`test_omp_direct` 26, `test_provider_keys` 47).

Constraints honoured: neither probe profile was modified (`harness-probe-20260916`
is read as a source and copied into a temporary run profile;
`harness-probe-20260916b` was read once and not written); successor-10, the
archives and the product repository are untouched; the key value was never
printed, copied or committed; `~/.local/bin/omp` was not repointed.

---

## B4 — fixes from task C's archive tests

C proved the design: `full19` matched the archived Q07 arm on 19 of 19 return
codes and statuses, `plan_layer` is an exact fifteen-operation subset with
byte-identical argv, allowed writes and report paths, and the projected first
seal drops from 62.1 to 38.4 minutes. Nine items follow, in C's priority order.

### Item 1 — C-2a, blocking: the seal socket path. **Done.**

`AF_UNIX` caps the whole socket path at 107 bytes (`sun_path`), and a real
campaign workspace path exceeds that on its own; C's run died at 116 characters.
The socket no longer lives in the workspace.

* `omp_direct.run_stage` binds it at `<private>/seal.sock` — the run's temporary
  directory, ~34 characters, owner-only, and **already bind-mounted into the
  sandbox**, so the client can still reach it. The transport then asserts the
  effective path fits and that it is inside the mounted private directory.
* `host_seal.SealService.start()` is defensive for callers that construct it
  directly (C's harness did): a path that does not fit is relocated into a fresh
  owner-only `mkdtemp(prefix='pwflow-seal-')` under `$XDG_RUNTIME_DIR` or
  `/tmp`, recorded in `relocated_socket`, and the directory is removed on stop.
* The path is published in `.pwflow/seal.json`, which the client already read.
  **Nothing model-facing changed.**

Five tests in `LongSocketPathTest` build a workspace path of at least 150
characters and assert: the workspace socket path genuinely does not fit; the
service relocates and still serves a request end to end over the socket; the
client config publishes the relocated path and it fits; a short path is left
exactly where it was asked for; the relocated directory is `0700` and gone after
`stop()`.

### Item 2 — C-4a: `runtime/`. **Done.**

Copied from successor-10 (420 files, 4,171,468 bytes) and hashed into
`.lineage/copied-tree-manifest.json`, which now carries an `addenda` entry
naming the reason. `runtime/omp/bridge.ts` sha256
`53b2a880c9fde46fffac3c04430cbbd7bb9473d62700d662371830134e32a93a`, 8,648 bytes.
Manifest: 23,798 files, 1,325,647,926 bytes, sha256
`165b14d50bb8ea54937729021bddc451e58dfa761417b85d8e6d8e62cefe0d4e`.

`tests/test_omp_stage` is now 13 of 13 OK, and `tests/test_pipeline` drops from
2 errors to 1 — the same single pre-existing error successor-10 has.

### Item 3 — C-3a: the ContractRef parse. **Done.**

`CONTRACT_NAME` was `ContractName:\s*([^,\s]+)`, which swallowed the trailing
quote the index stores and any `#anchor`. It now stops at the delimiters the
index actually uses (whitespace, comma, semicolon, quote, backtick, bracket),
strips stray trailing punctuation without eating `.md`, and **splits the anchor
into its own field**. `owner_passages` matches an anchor against the heading
first and the body second, and reports `delivered_anchors`.

New in the packet: **section 6b, per-ContractRef delivery** — one row per
ContractRef with `delivered` and a `delivery` reason (`anchor_passage`,
`named_passages`, `heading_map_only`, `anchor_not_found`, `document_absent`).
The receipt carries `contract_refs_delivered` / `contract_refs_total`.

Measured on `Plans/Run_Modes.md`, the subject C used:

| | before (C's run) | after |
|---|---|---|
| malformed parsed names | 9 of 34 | **0** |
| documents reported `document_absent` | 9 | **0** |
| ContractRef rows delivered | not reported | **309 of 342** |

The remaining 33 undelivered rows are genuine `heading_map_only` cases — the
document is present and named, but nothing in it is reachable from this subject
— and each one now says so in the packet rather than being implied.

Nine tests: four on the parse itself (trailing quote, anchors, backtick/bracket/
semicolon delimiters, extension preserved) and five on a synthetic subject with
real-shaped ContractRefs including an anchored one, asserting no document is
reported absent, the anchored passage is delivered and its neighbour is not,
every row reports its delivery, and the receipt counts them.

### Item 4 — C-4b: composer readiness in the docs. **Done.**

`docs/direct-omp-mode.md` §3 step 6 now describes what the code does — the
bracketed-paste cue plus a screen unchanged for `READY_SETTLE_SECONDS` (2.0 s),
onboarding strings refused — and says why record-based readiness cannot work
(OMP writes no session file until the first turn runs, so it deadlocks at a
healthy prompt), naming it as the defect that killed the first smoke.

### Item 5 — C-2b: the host owns `revision_id`. **Done.**

The model cannot guess `<prefix>-NNN`, and the old refusal said only "explicit
current scope census required".

* `install_client` writes `census_revision_id` into `.pwflow/seal.json`.
* `seal_client.fill_revision_id` copies it into the census whenever the field is
  empty, and leaves a value you set yourself alone.
* `host_seal.publish_revision_id` rewrites just that field after each
  measurement, so a finalize uses the measurement's id and a second measurement
  gets a fresh one.
* A mismatch is refused with the field name, the expected value, the shape and
  the file to re-read:

  ```
  census.revision_id must be exactly 'ompdirect-001' (shape 'ompdirect-NNN',
  assigned by the host and published in .pwflow/seal.json as census_revision_id);
  received 'guessed-42'. Read .pwflow/seal.json and copy that value verbatim.
  ```

  Re-measuring an already-measured revision gets a refusal that assigns and
  republishes a fresh id, so it self-corrects in one round trip.

Six tests, including that the refusal reaches the model through the service.

### Item 6 — C-3b: the packet byte budget. **Done.**

`budget_bytes` launch setting (`--budget-bytes`), default **200,000**. Priority
is fixed and enforced: the subject's own units, then every graph-named unit's
canonical text, then ContractRef passages. **Only the passages may be reduced.**
A reduced document keeps a marker naming every cut passage with heading, line
and byte size, plus the single `read_file --path <document>` command that
fetches the whole file. When the packet is over budget anyway, the heading maps
are dropped too (a heading map can be larger than the passages it replaced) and
section 6b is reduced to the undelivered rows, both stated in the text.

Nothing graph-named is ever withheld. If graph-named content alone exceeds the
budget the packet is still complete and reports `over_budget: true`.

Measured on `Plans/Run_Modes.md` (52 subject units, 45 graph-named units):

| | bytes |
|---|---:|
| C's unbounded packet | 619,515 |
| first budgeted attempt (heading maps kept) | 1,069,408 |
| **shipped** | **499,614** |
| graph-named floor that may never be cut | 355,516 |
| the index it replaces | 431,648 |

`over_budget: true`, `heading_maps_dropped: true`, 16 documents and 112 passages
cut, 2,856,067 bytes of passages not inlined. The GitLab subject is unaffected
at 45,045 bytes with nothing cut. The receipt records size, cut list, cut byte
count and the over-budget flag.

Eight tests: under budget nothing is cut; over budget the cut list and the
`read_file` command appear; **graph-named content is never cut** at any budget;
an impossible budget reports `over_budget` with canon still present; the receipt
carries the budget and cut list; the default is 200,000; a silly budget is
refused; packing is deterministic.

### Item 7 — C-4c / C-4d: undocumented surface. **Done, documented not removed.**

All ten client options are now in a table in `docs/direct-omp-mode.md` and in
the client's own module docstring (the model's `read` target), including the
`--offset`/`--limit` mechanism for a file larger than 512 KB, and a warning that
`--timeout-seconds` plus a retry runs the seal twice.

The result fields are documented with `operations_detail_dropped` called out
first and in bold: **a short answer carrying that flag is a cut answer, not a
short seal.** `failing_checks_truncated`, `detail_completeness`,
`full_report_note` and `profile_operations` follow; the `read_file` fields
including `paged_by_host`, `next_offset` and the always-empty
`required_operations` / `receipts` / `failure_census` are explained as the shared
envelope shape.

Nothing was removed: every one of these is either load-bearing
(`--offset`/`--limit`, `operations_detail_dropped`) or harmless, and removing a
flag the model might already reach is a worse trade than describing it.

### Item 8 — C-4e: `ALLOWED_TOOLS`. **Done, narrowed.**

`ALLOWED_TOOLS = frozenset(DEFAULT_TOOLS)` — exactly `read, bash, write, edit,
grep, glob`. `lsp`, `python` and `notebook` are gone: a planning seal has no use
for a language server or a second interpreter, and a tool a launch can admit but
the docs do not describe is a contract the model cannot read. The docs say so
explicitly.

### Item 9 — the 25/25 edge figure. **Done.**

§5 of this report now reads **25 / 17**, which is what the index, the packet and
C's independent recomputation all give.

### Tests

The five new modules, after B4:

| module | tests |
|---|---:|
| `tests/test_topic_inputs.py` | 27 (was 10) |
| `tests/test_host_seal.py` | 30 (was 19) |
| `tests/test_response_cap_setting.py` | 14 |
| `tests/test_omp_direct.py` | 26 |
| `tests/test_provider_keys.py` | 47 (5 skipped) |
| **total** | **144, OK (skipped=5)** |

Full suite, `python3 -B -m unittest discover -s tests`:

| | successor-11 | successor-10 |
|---|---:|---:|
| tests run | 987 | 843 |
| **passed** | **891** | 752 |
| failures | 4 | 4 |
| errors | 68 | 68 |
| skipped | 24 | 19 |
| **failing names** | **72** | **72** |

**The failing sets are now identical.** Diffing the failing test names both ways:

```
in successor-11 but not successor-10:  (none)
in successor-10 but not successor-11:  (none)
```

C's three extra failures are gone:
`test_bridge_admissions_and_socket_operations`,
`test_context_replacement_preserves_current_tool_causality` and
`test_complete_current_storage_jobs_fit_recorded_limits_without_provider` all
pass now that `runtime/` is present. The remaining 72 are successor-10's
pre-existing set, untouched by any of this work.

(Counts differ from C's figures because 28 tests have been added since C
measured — B2's provider keys, B3's custom providers and B4's fixes.)

### Constraints

successor-10, the archives, both probe profiles and the product repository were
not modified; no secret was printed, copied or committed; `~/.local/bin/omp` was
not repointed. The only new file outside successor-11 is this report.

---

## B5 — direct-mode closure custody (task E's blocking findings)

Task E reported that a direct-mode model can never complete `measure`, measured
on a live materialized workspace with no model involved. I reproduced all of it
independently before changing anything, on my own copy of E's probe workspace
(`/home/sittingmongoose/pm-b5-verify`, successor-11's own `fixtures/` — whose
`manifest.json` hashes to the same `429854ce…` E's marker pins — plus a copy of
E's probe workspace; E's package was read, never written):

```
1. no governance config, no custody   -> status capability_gap, 0 operations run
   gaps: [{"operation": "development_subject_custody",
           "reason": "explicit development-only existing-plan configuration required"}]
2. governance config only             -> RAISED KeyError: 'stage_result'
3. governance config + direct custody -> past custody, executing the command plan
```

E-1 and E-2 are both real, and step 2 is the wall: the frozen custody gate.

### E-1, blocking — a direct run has no StageRunner stage to point at

`scoped_governance._candidate_decision` reads `proof["stage_result"]`
unconditionally, and `execute_sandbox_governance` calls it on the **measure**
path. A direct declaration therefore dies with `KeyError: 'stage_result'` before
any command runs. This is pre-existing in successor-10; what is new is that
direct mode exposes the seal to a model that structurally cannot satisfy it,
while the docs promise a working answer.

**New `pwflow/direct_custody.py`**, following the pattern the frozen 100 K direct
runtime already used: substitute `_candidate_decision` and
`_fresh_inspection_identity` in a copy of the frozen function's globals.

* The **code objects are unchanged** —
  `direct_custody.measure.__code__ is sg.execute_sandbox_governance.__code__` is
  asserted by a test, as is that `command_plan` and `_closed_checks` still
  resolve to the real ones. No validator, no census check, no artifact-hash
  staleness check and no custody hash was altered or removed.
* `same_goal` replaces `_fresh_inspection_identity`. The job-stream rule demands
  a *fresh* agent and Goal for inspection because that lane gives each step its
  own; a direct run is one Goal by construction, so the correct invariant is the
  inverse — the identity must not change between measure and finalize.
* **The host writes the proof, never the model**, from the request it received:

  ```
  declaration.json  schema, candidate {adapter, model, effort}, input_sha256,
                    native_identity, request_sha256, answer,
                    written_by: host_seal_service_from_received_request
  native-event.json schema, native_identity, request_sha256, session_id,
                    goal_id, tool_call {id, name, command}
  ```

  Both are hash-bound with `file_binding`, so editing either afterwards is
  refused as a stale binding (a test confirms `_bound` catches it first, which is
  stricter than the field comparison behind it).

* A seal is **refused** when the run's native identity is not yet observable in
  the session records, or when no bash tool call invoking
  `.pwflow/governance.py` is observable. The host does not seal without custody.

**What it proves, and what it does not.** It proves the measured declaration is
exactly the bytes that arrived over this run's seal socket, during this session,
with this goal active, while a model tool call to the seal client was running.
It does **not** prove a model turn composed the JSON: anything inside the sandbox
can write the declaration file and invoke the client. The job-stream journal is
stronger there. A direct-mode seal is evidence that this run produced the
declaration, not that the model reasoned its way to it. That limitation is in the
module docstring and in `docs/direct-omp-mode.md`, not buried here.

### E-2, blocking for `existing_plan_current` — the missing config

`run_stage` never passed a `config` to `sandbox_runner`, so
`capability_report` returned `explicit development-only existing-plan
configuration required` and every measure came back `capability_gap` before a
command ran. `governance_config` is now a launch setting, validated as a mapping
and recorded in `launch-settings.json` with its lane.

### E-5, blocking — the output root and the proofs must be inside the experiment

My own step-3 verification hit this before E's message arrived, twice:
`ValueError: measurement output root must be strictly inside the experiment`,
and `file_binding` refusing a proof path outside the experiment root. E is right
that it also makes finalize impossible, since
`finalize_scoped_governance` re-reads every receipt through
`_file(experiment, ...)`.

* `governance_output_root` is a launch setting defaulting to
  `<experiment_root>/.pwflow-governance-runs/<evidence name>`, validated to be
  strictly inside the experiment root and outside `fixtures/` and the workspace.
* Closure proofs default to `<experiment_root>/.pwflow-closure-proofs/`, **one
  folder per attempt** (`closure-measure-<revision>-NNN`) — a refused measure
  that already wrote one must not block the retry, which keeps the same revision.
* The end-of-run copy into `evidence/governance-reports` is unchanged.

### E-3, model-facing

* A `capability_gap` or `precondition_missing` answer now carries `capabilities`
  (status, profile, gaps, limitations), a top-level `gaps`, any `required`
  fields, and an `actionable` note saying these are host preconditions and not
  findings in the plan.
* An unexpected exception reaches the model as `Type: message` rather than a
  bare `KeyError`. These are host-side governance errors, not provider payloads.
* A `capability_gap` measure no longer sets `state['measurement']`, so a
  following finalize gets `finalize requires a completed measure in this run`
  instead of a confusing deep refusal.

### `plan_layer` can measure but cannot finalize

`finalize_scoped_governance` requires both global checks with valid reports and
`plan_layer` omits them by definition, so a finalize on that profile is now
refused up front naming the reason and pointing at `full19`. E found this
independently; I did not weaken the requirement.

### E-6 — the closure-proof folder was not namespaced per run

Found live by R6-A, not by either of us in testing. The folder name was
`closure-<operation>-<revision_id>-<attempt>` under a shared experiment-level
directory, and none of those three parts is unique to a run: E's 21:29 seal
smoke wrote `closure-measure-ompdirect-001-001`, and R6-A's first measure at
21:56 asked for the same name and was refused with a bare

```
FileExistsError: [Errno 17] File exists:
  '<experiment>/.pwflow-closure-proofs/closure-measure-ompdirect-001-001'
```

It self-corrected — the attempt counter incremented, the model reran, `-002`
was free — at about four minutes of candidate time. Two things were wrong with
it anyway. Any two runs sharing an experiment root collide on their first
measure, which is the shape of a two-arm campaign; R6-A and R6-B would have
collided with each other. And the refusal names an absolute path in the
experiment root, which is **not mounted in the sandbox**, so there was nothing
the model could read or act on: it recovered because rerunning happened to take
a different path, not because it was told what to do. Same class as E-3, one
layer further in.

Fixed both ways:

* The proof folder defaults under `governance_output_root` when that is inside
  the experiment root. That is already a per-arm launch setting, so namespacing
  one namespaces both; the experiment-level directory stays as the fallback for
  a caller whose output root is elsewhere, because `file_binding` cannot express
  a path outside the experiment.
* The folder name carries the sandbox digest, derived the way
  `_measurement_output` derives its own path
  (`payload_sha256(sandbox.relative_to(experiment))[:16]`), so two sandboxes
  cannot collide even under one output root.
* The host **takes the first free attempt number** instead of refusing a taken
  one, so the collision never reaches the model at all. The only remaining
  refusal is the pathological 999-attempt case, and it says plainly that this is
  host-side state the model cannot clear and it should stop and report rather
  than retry.

Two tests: two runners in one experiment root produce two distinct proof folders
and never raise `FileExistsError`; two sandboxes differ in the digest segment,
not merely the attempt number.

### E-7 — finalize was handed the outcome where it wanted the binding

Blocking, found by R6-A at 23:07 UTC after a measurement that actually passed,
which is the only way to reach the line.

`execute_sandbox_governance` returns the measurement binding as a *field* of its
outcome (`{**result, "measurement": file_binding(...)}`), and
`finalize_scoped_governance` opens with `_bound(experiment, measurement)` and
later reads `measurement["sha256"]` — it wants the `{path, sha256}` binding
itself. `sandbox_runner` stored the whole outcome in `state['measurement']` and
passed that. Every finalize died on `KeyError: 'path'`.

The outcome stays in state, because `compact_result` and the revision check both
read it; the binding is dereferenced at the call. A stored measurement with no
binding now produces a `SealRefused` saying this is host-side state and **not**
a problem with the model's declaration or dispositions — R6-A spent its recovery
re-reading its own JSON for a `path` field that was never the issue, which is
E-3's class of defect a second time.

**No test could have caught this.** Every finalize path in `test_host_seal` uses
a fake runner, so the wiring between the two real `scoped_governance` functions
had never been exercised, and reaching it needs a measurement that passes: E's
probe stopped at custody, my verification stopped at `shards_check`, and only a
live run got far enough. Two tests now capture the third positional argument
rather than running a 900-second seal — one asserts the binding and not the
outcome reaches finalize, one asserts the missing-binding refusal is in the
model's terms. I verified the first is not vacuous by reverting the fix: it
fails with the whole outcome arriving, and passes once restored.

### E-9 — `read_file` claimed completeness for bytes the model never got

The most serious defect in this work, because it was silent. Found by R6-A2,
the first run to put a large file through the real path: task C called
`host_seal.read_file` directly in Python, and every smoke before it read the
16 KB subject document.

The answer reaches the model through the `bash` tool. On
`Plans/00-plans-index.md` (431,648 bytes, answer 431,333 bytes) the model
received:

```
Showing lines 1-15 and 15-29 of 29; 0 middle lines (48.4KB) elided.
Read artifact://1 for full output
```

while the answer inside it said `complete: true, elided: false`. Two mechanisms,
both mine. The answer is one long JSON line, so `tools.outputMaxColumns` cut the
`text` field at 100,000 characters — **the setting I raised from 768 to stop
line cuts is itself a line cut, just at a larger number**, and a single-line
431 KB JSON is exactly its shape. The output then spilled into `artifact://1`
whatever `tools.artifactSpillThreshold` says. This is the silent-drop hazard
`read_file` was written to prevent, reappearing one layer out, with the host's
own flags asserting it had not happened.

Fixed by making the answer describe **delivery**, not host-side success:

* A `DELIVERY_BUDGET_BYTES` (32768, well under the ~50 KB that survives). An
  answer that fits is delivered inline with `delivered_inline: true` and
  `complete` meaning what it says.
* An answer that does not fit is **not truncated**. The host writes the bytes
  into `.pwflow/reads/<name>.<sha12>.txt` in the workspace and returns
  `delivered_inline: false`, `complete: false`, `spilled_to`, `spill_bytes`,
  `spill_sha256`, a `reason` naming the mechanism, and a `next_step` telling the
  model to read the file with the native tool and check it against
  `spill_sha256`.
* There is no shape in which the model is handed part of a file and told it is
  complete.

Verified on the real 431,648-byte canon file: `delivered_inline false`,
`complete false`, spill byte-identical to the source with
`spill_sha256 == file_sha256`, answer 1,428 bytes against the 32,768 budget.

Five tests, and one existing test corrected rather than quietly edited:
`test_whole_file_comes_back_complete_with_its_digest` used a 360 KB body and
asserted `complete` — that assertion *was* the E-9 claim, and it is now a small
file with a comment saying so.

`docs/direct-omp-mode.md` and §4.2 of this report both said a 431 KB file reads
whole in one call. Both are corrected; §4.2 carries a superseded notice rather
than a silent rewrite.

### E-8 — a mid-run modal can deadlock the pty, and auto-QA is on by default

R6-A2's model called `report_issue`, an OMP affordance outside the six tools,
and OMP raised a modal consent dialog in the pty. The composer blocked, the
session stopped advancing, and the run was heading for an `idle_limit` death
that would have been recorded as a slow model rather than a deadlocked terminal.

Checking the settings turned up more than the dialog:

```
dev.autoqa            = true        (default: ON)
dev.autoqaConsent     = unset       -> this is what raises the modal
dev.autoqaPush.token  = (not set)
dev.autoqaPush.endpoint = https://qa.omp.sh/v1/grievances
```

So by default a candidate that hits a tool problem is offered a dialog that, if
granted, **sends tool-issue reports to a third-party endpoint from inside a
measured experiment**. That is an egress path and a contamination route nobody
authorized, quite apart from the deadlock.

Fixed: the profile overlay sets `dev.autoqa: false` and
`dev.autoqaConsent: denied`, both added to `ASSERTED_SETTINGS`, so a run whose
profile did not take fails at launch. Verified by readback: `False` and
`'denied'`, drift `[]`. (`parse_config_list` also needed to strip an enum's
option list, `denied (unset|granted|denied)`, or the assertion would have
false-fired.)

Also: the blocking-dialog strings are now refused **mid-loop**, not only at
startup, and a modal with no session progress for 10 s ends the run as a
transport error naming the dialog, instead of expiring on `idle_limit` half an
hour later. The host still never answers the dialog — E declined to type into
the child's pty to unblock R6-A2, on the grounds that a run that only completed
because the operator typed into it is not a run, and the harness holds the same
line.

### R6-A's measurement, and what is still unexercised

R6-A produced the first complete direct-mode measurement: **nineteen operations,
artifact checks pass, `classification_pending` in 910.8 s, a 12,915-byte
answer**, on the known-defect subject. That is the first figure that prices a
full pass — the 363.5 s and 99.82 s above are floors ending at `shards_check`.

**The finalize path and the Git commit remain unexercised on a live run.**
Nothing has reached them: not my verification, not E's smoke, not R6-A. E-7 was
the first defect on that path and it is unlikely to be the last, because the
code has still never run end to end. Any claim that direct mode can complete a
seal is, at the time of writing, a claim about code that has measured but never
sealed.

### `session_identity` robustness (E's smaller point)

Requiring exactly one `*.jsonl` would refuse every seal in a run if the runtime
ever dropped a sidecar. It now takes the most recently modified file and records
`session_file` and `session_file_count` in the proof, so the choice is auditable.

### Live verification

Re-run after the fixes, same real workspace:

```
3. governance config + direct custody
   closure proof written:
     .pwflow-closure-proofs/closure-measure-ompdirect-001-001/declaration.json
     .pwflow-closure-proofs/closure-measure-ompdirect-001-001/native-event.json
     candidate {adapter: omp-direct, model: openrouter-union/stealth/union-alpha,
                effort: xhigh}, native_identity [session, goal],
                written_by host_seal_service_from_received_request
   capabilities: supported, gaps []
   status artifact_checks_failed | artifact_checks fail | 10 operations | 363.5 s
   compact answer 3,370 bytes (bound 20,000)

     register_owners        pass     1.4 s
     migration_snapshot     pass   189.1 s
     migration_validate     pass    72.0 s
     index_generate         pass    29.7 s
     index_validate         pass    29.1 s
     readiness_generate     pass     2.3 s
     audit_status_generate  pass     1.9 s
     audit_status_validate  pass     2.3 s
     shards_generate        pass     3.1 s
     shards_check           FAIL     8.3 s  rc=1
```

**A direct-mode measure now runs the real command plan to a real measurement
result.** Nine of ten operations passed and the tenth failed on a genuine
content finding, which is where `execute_sandbox_governance` stops on a
non-global failure. That is the seal working, not the harness breaking: the
answer is `artifact_checks_failed` with `capabilities: supported, gaps []`, and
the failure names its own repair:

```json
{"error": "missing_or_stale_root_shard_index_row",
 "path": "Plans/00-plans-index.md", "source": "Plans/GitLab_Integration.md",
 "expected": "| `GitLab_Integration.md` | [`Plans/_shards/gitlab_integration/00-index.md`](…) |"}
```

`shards_generate` regenerated 2,148 shards across 99 documents and
`shards_check` found one stale root index row — the subject document has no
shard-index row in `Plans/00-plans-index.md`. That is a legitimate first repair
for a candidate, and task E has been told so they can decide whether their
package prep should have supplied it instead.

Before this change the same call raised `KeyError: 'stage_result'` with zero
operations run.

**These timings are floors, not the cost of a seal.** `measure` stops at the
first artifact-check failure, so the 363.5 s above ends at `shards_check` and
prices ten of nineteen operations. Task E's independent `plan_layer` smoke on
their own probe workspace ends at the same place: one `measure` call, no
polling, **99.82 s**, a 2,860-byte answer, `artifact_checks_failed` after eight
operations, with model and effort read back as
`openrouter-union/stealth/union-alpha` / `xhigh` and no settings drift. Neither
figure prices a *complete* fifteen- or nineteen-operation pass; a real first
seal costs the repair work plus a full pass on top. Correction owed to E, who
caught that both numbers were being read as seal costs.

E also verified the custody path independently, reading `direct_custody.py` in
full before running on it: their proof bound `request_sha256 fc83ba82…` to
session `01a0ac1f-f890-7434-b88b-98b0e12d3d6f`, goal `15825558036c2faf` and a
bash tool call whose recorded command is exactly the client invocation.

**The `shards_check` failure is the frozen subject's own state**, settled at
source by E rather than assumed by either of us: neither
`fixtures/development/gitlab-small-v1/snapshot/Plans/00-plans-index.md` nor
`fixtures/support/Plans/00-plans-index.md` contains the row, and
`Plans/_shards/gitlab_integration/` does not exist while ~99 other documents are
sharded. Materialization copies the 265 files byte for byte (265 of 265 verified
equal to the frozen bytes), so there was nothing for prep to supply, and
repairing it host-side would have changed the subject that R3 and the 100 K run
share — breaking the comparison it exists for. It is a legitimate first repair
for the candidate.

### Tests

`tests/test_direct_custody.py`, 23 tests: the defect itself
(`KeyError: 'stage_result'` from the frozen gate), the shared code object, a
host-written proof accepted, and refusals for a different candidate, a different
frozen input, a tampered answer, an event bound to another request, a mismatched
request digest, a missing tool call, a tool call that did not invoke the client,
an incomplete identity, and a StageRunner-shaped proof offered to the direct
gate. Plus `same_goal` both ways, five `session_identity` cases, and three
runner-level cases proving the refusals reach the caller and the proof is
written.

New-module totals: **171 passed, 5 skipped**
(`test_topic_inputs` 27, `test_host_seal` 30, `test_response_cap_setting` 14,
`test_omp_direct` 29, `test_provider_keys` 47, `test_direct_custody` 24).

Constraints: E's package, successor-10, the archives, both probe profiles and
the product repository were not modified; the verification copy lives in
`/home/sittingmongoose/pm-b5-verify`. No custody was stubbed and no proof was
fabricated: the one thing I would not do is pass a `seal_runner` that skips the
gate, which is exactly what E declined to do as well.

---

## B6 — plan-layer finalize, dispatch containment, report reachability

Nine items across the B6 brief and its addendum. **Seven landed, three did not**,
and the three that did not are the ones needing live model runs. I am reporting
that plainly rather than leaving the yes/no lines ambiguous. The coordinator has
accepted the E-11 and E-10 shapes; items 2, 4 and the egress measurement remain
owed.

### Item 1 — `plan_layer_finalize`. **Done.**

`finalize_scoped_governance` gained `permit_omitted_global_checks`, default
empty, so the requirement is byte-identical unless a launch opts out — the same
shape as `skip_operations` on `command_plan` in B4. `plan_layer_finalize`
(default `true`) is the launch setting; with it off, a plan-layer finalize is
refused **before** the run spends a measurement finding out, which is a
launch-configuration fact and should not wait on run state.

A partial seal is labelled in every artifact:

| field | full19 | plan_layer |
|---|---|---|
| `seal_profile` | `full19` | `plan_layer` |
| `omitted_operations` | `[]` | the four names |
| `full_repository_qualified` | `false` | `false` |
| `repository_gates_status` | `ran_in_this_seal` | `not_run_in_this_seal` |
| `seal_scope` | `full_profile` | `partial_profile_named_omissions` |
| `seal_claim_boundary` | absent | names what it did not run |

**Plan-layer seals are production seals — decided 2026-09-17: production seal;
repository-wide gates at landing.** The four repository-wide operations run at
landing on `main` and on a schedule rather than in every seal, so
`plan_layer_finalize` defaults to `true`; a launch can still set it `false`.

What makes that default safe is the labelled record above, not the decision: a
plan-layer closure states which operations it did not run and claims nothing
about them, so it cannot be read as a full-profile seal.

### Item 6 (E-10) — dispatch containment. **Partly done.**

**Done:** `tools.xdev: false` in the overlay, asserted after launch (verified by
readback: `tools.xdev -> False`, drift `[]`), plus a transport guard that fails
the run as `unapproved_dispatch` on any `write`/`edit` whose path is not an
ordinary relative workspace path. It catches `xd://` dispatch, absolute paths
and parent traversal, and passes ordinary writes:

```
xd dispatch  unapproved_dispatch: tool call write targeted a path that is not an
             ordinary workspace path: 'xd://report_issue'  (+ the xd:// rule)
absolute     unapproved_dispatch: ... '/etc/passwd'
traversal    unapproved_dispatch: tool call edit ... '../outside.md'
ok write     []
```

The guard reads the raw records rather than `projection['tool_calls']`, because
the recorded tool name is `write` — a name-based allowlist cannot see this.

**Not done:** proving through a real model that OMP itself refuses an
`xd://report_issue` write under the overlay, and settling egress by
measurement. Both need a live run I did not have the budget for. **The egress
exposure therefore stands documented, not closed:** `launch.json` records
`network_egress_enforced: false`, there is no egress capture, and E's finding
that three of four grievance reports executed against a default-on
`qa.omp.sh` endpoint is unrefuted. `tools.xdev: false` should prevent the
dispatch, and the guard should fail any run where it happens anyway, but
*should* is not *measured*.

### Item 7 (E-11) — the report the answer names. **Done, differently from the brief.**

The brief asked for the reports to be copied into
`<workspace>/.pwflow/reports/<revision>/<measurement>/`. **I measured that this
breaks finalize and did not do it.** `repository_support.inventory()` hashes
every file under the sandbox, and `finalize_scoped_governance` refuses when
`payload_sha256(inventory(sandbox)) != measured["output_digest"]`. Copying
reports into the workspace after a measurement changes that digest, so the
finalize that needs them would fail with "sandbox changed after measurement;
reseal required". The same reasoning applies to my own E-9 spill, which I have
moved out of `.pwflow/reads/` in the workspace into a mounted host directory for
exactly this reason.

What I did instead meets the requirement — every path the answer names is
openable from inside the run — without that conflict:

* the governance report root is bound **read-only** into the sandbox;
* `read_file` accepts it as a published root beside the workspace, and refuses
  anything else with a message naming the published roots;
* `.pwflow/seal.json` carries `readable_roots` so the model knows them;
* `reports-manifest.json` beside the reports digests every file the answer can
  cite, so the model can verify what it opened.

Read-only is deliberate: the host writes the receipts, the model reads them, the
seal verifies its own copies host-side, and there is no path by which a run
edits the evidence it is judged on.

Four tests, including one that takes a measure answer, walks
`full_report_path` and every `evidence_paths` entry, and opens each one through
`read_file` — asserting the answer never cites a path that does not exist.

**This is a deviation from an explicit instruction and the coordinator should
overrule me if the workspace copy is wanted anyway** — but it would need
finalize's sandbox-digest check changed, which is not mine to change.

### Item 3 — the source map as a harness step. **Done.**

`pwflow/source_map.py`, written at workspace preparation before the runtime
starts. One entry per `source_files` row of the frozen subject descriptor, keyed
`source/<path>` (the spelling the 100 K map used, so a census written against
either binds the same identities), each carrying the experiment-root-relative
`path` and `sha256` that `_census` binds plus the `workspace_path` the model can
open. Every working copy is hashed against the frozen bytes and drift **fails
the preparation** — a workspace that has drifted from its snapshot is not one
you can seal against.

Measured against the real subject: **265 entries, 265 working copies verified**,
matching E's hand-built map entry for entry. Running it against a workspace I
had already sealed reported exactly one drifted file,
`Plans/sharding_config.json` — which `register_owners` writes. That is the check
working, and it is why the step runs before the first measure rather than after.

Ten tests on a synthetic subject: entry count and prefix, experiment-root-relative
bindings that resolve, the working-copy path, verification count, drifted and
absent copies refused, a non-subject descriptor refused, determinism, and the
receipt matching the bytes written.

### Item 5 — docs and defaults. **Done.**

`read_file`'s contract, the plan-layer seal wording, the report-reachability
rule and the source map are all in `docs/direct-omp-mode.md` and `CHANGES.md`.
The `--limit` default stays 512 KB — it bounds one host-side read — but the
docs now say plainly that the **delivery budget**, not that cap, decides whether
the model gets bytes or a path.

### Items 2, 4 and 6b/6c — **not done.**

* **Item 2, the live two-seal path on a repaired subject.** Not run. This is the
  substantive gap: measure → finalize → commit → amendment release → measure →
  finalize → commit, on `full19` and then `plan_layer`. E's runs put the first
  passing measurement at 58.4 minutes; two full paths is several hours of model
  time beyond what remained.
* **Item 4, spilled-file proof through a real model.** Not run. The host side is
  verified (spill byte-identical to the 431,648-byte source,
  `spill_sha256 == file_sha256`); what is unverified is that the native `read`
  tool delivers those 5,967 lines and 98 `### ` headings to a model whole under
  the overlay.
* **Item 6b/6c**, above.

Nothing in items 2, 4 was stubbed or simulated. They are simply not done.

### Item 2 is also the live confirmation of E-8 through E-11

This bears stating on its own, because four fixes now sit in the tree with only
unit tests behind them:

| finding | fixed | confirmed live |
|---|---|---|
| E-8 auto-QA modal deadlock, `dev.autoqa` on by default | yes | **no** |
| E-9 `read_file` claiming completeness it did not deliver | yes | **no** |
| E-10 `xd://` dispatch through `write` | yes | **no** |
| E-11 report paths unreachable from the sandbox | yes | **no** |

Each was found by a live run or its transcripts. Each is fixed against tests
written after the fact by the person who wrote the defect. Item 2 is the run
that would confirm them, and it has not happened — so the honest status of all
four is *fixed and untried*, not *resolved*.

On this effort's record, six of eight blocking defects surfaced only from a live
run or its transcripts: the probe stopped at custody, the archive replay at
`shards_check`, and every finalize test used a fake runner, so the finalize
wiring stayed broken for four rounds while the suite stayed green.

### Per-stage elapsed table

**Not available.** It comes from item 2, which did not run. The only live
figures remain E's, and they stop short of a seal:

| stage | full19 | plan_layer |
|---|---|---|
| first measure | 910.8 s (19 ops, artifact checks pass, R6-A) | 99.8 s (8 ops, stops at `shards_check`) |
| finalize | never run live | never run live |
| commit, amendment, second seal | never run live | never run live |

### Tests

258 passed, 5 skipped across the seven new modules plus `test_scoped_governance`
and `test_omp_stage`. successor-10 untouched; no secret in any tracked file.

---

**full19 two-seal path completed live: no.**
**plan_layer two-seal path completed live: no.**
**Tests: 258 passed, 0 failed (5 skipped).**

---

# B7 — the finalize path, completed and then proved live

Agent: Claude Opus 5, 2026-09-17, starting from task G's six findings. Written
incrementally.

Constraints honoured: only successor-11 was edited; task G's package was written
only under `candidate/baseline/b7-*` and `candidate/.pwflow-governance-runs/b7-*`
(new run workspaces) and its `candidate/pwflow` is byte-identical to what G left;
no archive, no other package, no `~/.omp` profile (the run profile is derived into
a temporary directory as `_profile()` has always done), no successor-10 and
nothing under `/mnt/Cursor/PuppetMaster` was touched; no credential was printed or
copied; one run at a time; no retry, no resume, no stubbed custody on a live run,
and nothing typed into a candidate except the host's own release continuation,
which is a launch setting and is recorded in `evidence/release-prompt.json`.

## 0. What changed, in one paragraph

All four blockers on the direct-mode finalize are closed, the two steps direct
mode never had are in the package, the root shard-index row is derived rather
than discovered, and egress is now measured rather than argued. The ordering
matters: G-5 had to land before a six-tool run could survive its first edit;
G-6, G-7 and G-9 sit in a stack on the finalize and all three had to go; G-4 is
what makes a second seal reachable at all.

## 1. G-5 — the dispatch guard. **Done.**

`omp_direct.dispatch_violations` read `arguments['path']` on every `write` and
`edit`. OMP's hashline `edit` carries no `path`; the target is the `[path#hash]`
header of `input`. So `ordinary_workspace_path(None)` was false and G-1 died at
390 s with `unapproved_dispatch: ... None` — after twenty healthy responses, on
an ordinary in-workspace edit of the subject document. Worse than noisy: because
the key was absent, **the guard had never inspected an edit target at all**, so a
hashline edit of `../outside.md` would have been reported with the same `None`
for the wrong reason.

`write_targets(arguments)` resolves the target from every field OMP uses
(`path`, `file_path`, `filePath`, `target`, `file`, `filename`, `fileName`) plus
the hashline header — the leading one, and any header occupying a whole line, so
a `+`-prefixed body line containing brackets is not mistaken for a target.
`dispatch_report(records)` returns two lists:

* `violations` — a target that resolves to a pseudo-path, an absolute path or a
  parent traversal, or `xd://` anywhere in the argument blob. These end the run,
  and the message now names which rule was broken.
* `unresolved` — `dispatch_target_unresolved`, **recorded, never fatal**. OMP's
  `tool_execution_start` record for an `edit` carries no `args` key at all
  (checked against the real records), so every healthy hashline edit produces
  one. The `xd://` scan reads the whole blob and does not depend on a target
  resolving, so dispatch containment does not weaken.

`dispatch_violations` remains, returning the run-ending subset, so the transport
guard and any existing caller are unchanged.

**Tests: `tests/test_dispatch_guard.py`, 21.** Built from the verbatim records in
`gitlab-g-live-confirmation-20260917-v1/candidate/baseline/prepared-g1-001/evidence/session.raw.jsonl`
— the `write` tool call `{i, path, content}`, its execution record `args {path}`,
the `edit` tool call `{i, input}` whose input begins
`[Plans/GitLab_Integration.md#E37C]`, and the `edit` execution record with no
`args` key. `test_the_records_that_ended_g1_now_pass` is the regression. The
refusal side is tested per rule, including a hashline edit of `../outside.md`,
which is now reported as a parent traversal naming the path rather than as
`None`.

## 2. G-6 — the governed tree, and one scratch area. **Done.**

`finalize` requires `--dispositions FILE` with one row per `failure_id` in the
measurement's own census, so the file cannot exist before the measure; and the
frozen check hashed **every** file under the workspace. Writing the file the
contract demanded invalidated the measurement it was written for. G-1b was
refused twice with `sandbox changed after measurement` and paid a second
986-second measure for it.

**The governed tree is now defined**: every file in the workspace whose first
path component does not begin with `.pwflow`. That is the materialized subject —
`Plans/`, `scripts/`, `tests/fixtures/`, `Concepts/` as materialized, `AGENTS.md`,
`.gitignore` — plus the task text, `SOURCE_MAP.json` and anything the run's own
work adds beside them. It is a denylist rather than an allowlist on purpose: an
unanticipated path stays governed, which is the safe direction.

`direct_custody.governed_inventory` filters the real
`repository_support.inventory`, so the whole-tree symlink rejection is kept, and
the name `inventory` is rebound in the direct variants' globals — the same
mechanism that already rebinds `_candidate_decision` and
`_fresh_inspection_identity`, and for the same reason. **`scoped_governance` and
the job-stream lane are untouched**: `_roots` and `_run` are separate function
objects and keep their own `inventory`, so the symlink rejection and the
per-command forbidden-write check are byte-identical to what they were.

`.pwflow/scratch/` is the model's one writable area outside the measured tree.
`install_client` creates it and publishes `scratch_dir`, `measured_tree` and the
rule in `.pwflow/seal.json`; the client resolves a relative `--declaration`,
`--census`, `--dispositions`, `--failure-decisions` or `--prospective` path there
first, and an argument file found elsewhere still works with a `client_notes`
line in the answer saying where it belonged. The task text says the same thing.

**The refusal stays.** Any governed-tree change still refuses the finalize with
`sandbox changed after measurement; reseal required` — the direct path now lists
the paths that differ and names the scratch rule, instead of leaving the model to
rediscover G-6 the way G-1b did.

Tested both directions in `tests/test_direct_seal_path.py`: writing
`dispositions.json`, a `review_failures.py` helper and notes into the scratch
area and finalizing successfully; and editing `Plans/storage-plan.md`, or adding
`declaration.json` at the workspace root, and being refused with the path named.

## 3. G-7 — the preclosure proof at finalize. **Done.**

The frozen body compares `payload_sha256(candidate_closure)` against the recorded
`candidate_closure_sha256`. In direct mode the host writes a fresh proof per seal
call in a folder named for the call, so the `{path, sha256}` bindings differ by
construction and the payload can never hash-equal. G-2 sent byte-identical
declarations at measure and finalize (`request_sha256 38b94683…` both times) and
was still refused. No declaration a model can write makes them equal.

In the job-stream lane the preclosure stage is literally the same stage at both
calls, which is what that comparison models. `direct_custody.finalize_scoped_governance`
now wraps the frozen body and compares the two things the rule is about:

* the **declaration digest** — the submitted proof's `request_sha256` must equal
  the one the measurement's proof recorded, so the declaration is the bytes that
  were measured (and its `candidate` and `input_sha256` must match too); and
* the **goal identity** — `same_goal` against the measurement's recorded
  `preclosure_native_identity`.

It then passes the frozen body the measurement's **own recorded proof**, read
back from `<measurement output>/candidate_closure.json`, which the body
re-authenticates in full through `_candidate_decision` — the declaration and
native-event files are re-read, re-hashed, and rechecked for candidate, input
digest, identity and the tool call. Nothing is skipped; what changed is which
proof object the payload comparison is made about.

**Both proofs stay in evidence.** `direct-preclosure-equivalence.json` is written
beside the measurement naming the measured proof, the submitted finalize proof,
the shared declaration digest, the identity, and `proof_payload_compared: false`
so the deviation is on the record rather than implied. The closure result binds
it as `direct_preclosure_equivalence`.

Tests: byte-identical declaration passes; a reworded declaration is refused with
"not the declaration this measurement measured … the finalize inspection goes in
`--dispositions`"; a changed goal id and a changed session id are each refused
with "one unchanged native Goal"; and the recorded proof is asserted to hash to
exactly what the measurement recorded.

## 4. G-9 — custody for the dispositions. **Done.**

`finalize_scoped_governance` calls `_candidate_decision` on the dispositions too,
and the direct variant requires a host-written `{route, declaration,
native_event}` proof — so no dispositions object any model could write was
acceptable, whatever it contained. The host now wraps the received dispositions
at receipt exactly as it wraps the declaration, from the bytes it was sent, bound
to `inspection_input_digest(measurement.sha256, census)` and to this run's native
identity and the bash tool call that is running. The proof folder is
`closure-finalize-dispositions-<revision>-<sandbox digest>-NNN` and the closure's
`inspection_proof` names it.

A finalize with no `--dispositions` is refused up front with a message naming
what the object must carry and where to write it, rather than failing deep in the
gate.

Tests: `direct_decision` on the exact bytes G-2 sent (`{"failure_dispositions": []}`)
still raises `direct-native declaration proof required`, and the same bytes
wrapped by `declaration_proof` are accepted and return that answer with the run's
identity; a non-empty disposition set goes through a whole finalize and comes
back as `global_failure_dispositions` matching the measurement's failure census;
a missing row and an unreviewed operation are still refused.

## 5. G-4 — the commit and the amendment release. **Done, in the package.**

Direct mode implemented neither, while the task text promised the model both, so
the second seal was structurally unreachable. New **`pwflow/direct_release.py`**,
started from task G's `preflight/host_release.py` and changed in four ways: it
commits the **governed** tree rather than everything; it verifies the commit
against the live governed inventory and raises rather than flagging a mismatch;
it reads the released amendment subset from the **subject binding** and checks
each file against the descriptor's frozen hash; and it writes the seal records
and `amendment-release.json` itself with a `verify_release` that re-reads them
against the Git objects.

It runs **inside an accepted finalize**, through a new `on_finalized` hook on
`host_seal.sandbox_runner`, not from a watcher. That is the difference that
matters: the model is still blocked on its own seal command, so there is no
window in which it can write into the tree being committed, and the answer it
receives carries a `host_release` block naming the commit, the revision label and
the release. The transport additionally types a host continuation prompt naming
the release into the composer, recorded in `evidence/release-prompt.json`.

Launch settings: `direct_release` (default `true`), `release_git_dir` (default
`<evidence>/artifact-git/run.git`, refused inside the workspace), `release_prompt`.

Record shapes are the ones `comparison_evaluation.load_direct` verifies: per
revision a seal record with `route: direct-native`, the native identity and
`{revision, commit, tree, inventory}`, a `final/native-event.json` beside it, and
a release naming the first commit. `load_direct` itself lives in the evaluation
packages and additionally requires an `app-server.raw.jsonl` capture that direct
OMP mode does not produce, so `verify_release` implements the checks of it that
constrain these shapes — route, identity, revision labels, 40-hex commit, tree
matches seal, inventory census, every blob digest, distinct commits, release
bound to the first — and the test runs it over real Git objects.

## 6. G-2 — the root shard-index row. **Done, and the decision is recorded.**

`shards_check` requires a `Plans/00-plans-index.md` row for every source in
`Plans/sharding_config.json`, and **no frozen generator writes it.** I checked
both: `pm-shard-plans.py --generate` writes `Plans/_shards/` and never opens the
root index, and `pm-governance-seal.py register-canonical-docs` writes only
`sharding_config.json`, `Spec_Lock.json` and `plan_graph.json`.

So neither option the brief offers is implementable as written:

* making `shards_generate` write it means editing a script under the frozen
  tooling profile's hash custody — exactly what `capability_report` exists to
  refuse, and what turned G's first census into a `script_custody` gap; and
* inserting a twentieth operation right after `register_owners` changes the arity
  of `full19` and `plan_layer`, and with it the archived-arm equivalence task C
  established and every `profile_operations` list.

**The decision, which keeps every validator unchanged: the row is derived content
the host writes at preparation.** `pwflow/root_shard_index.py` runs before the
runtime starts, deriving each expected row from the sharding config's current
sources plus the launch's `docpaths` — exactly the set `register_owners` will
produce — and appending any missing row immediately after the last row of the
existing shard-index table. Deterministic, idempotent, and the bytes are the ones
the check names. Launch setting `derive_root_shard_index`, default `true`.

The spelling is not copied by hand: `tests/test_root_shard_index.py` extracts
`slugify` from the frozen `pm-shard-plans.py` source and compares it against ours
case by case, and asserts the frozen `expected_row` f-string is still the one we
reproduce. A future script that changes the row format fails there rather than
900 seconds into a measure.

When the step does write, the path is declared to `source_map.write_source_map`
as a `host_derived_path`: the entry keeps the frozen `sha256` the census binds
and gains `derived: true` and the working copy's own digest, so the
frozen-bytes drift check records the host's own repair instead of being silenced.

**Fixture note.** `gitlab-repaired-v1` carries the row in its own snapshot, added
by task G — `| `GitLab_Integration.md` | [`Plans/_shards/gitlab_integration/00-index.md`](Plans/_shards/gitlab_integration/00-index.md) |`,
appended to the end of the shard-index table of its
`snapshot/Plans/00-plans-index.md`. On that subject the preparation step
therefore finds nothing missing and writes nothing (`rows_written: []`,
`index_changed: false`), which is what every B7 run's
`evidence/root-shard-index.json` records. A test asserts the snapshot still
carries it.

## 7. G-3, taken in passing

Not one of the six, but a one-string defect in a file this work rewrites around:
`read_file`'s spill `reason` said the host wrote the bytes "into the workspace"
while `spilled_to` was an absolute host path, because a direct run always passes
`spill_dir`. The `reason` now quotes the path it actually wrote and says it is
one of the published `readable_roots`, and `docs/direct-omp-mode.md`'s case title
and example are corrected from "Spilled to the workspace".

## 8. Egress, measured

New `pwflow/egress.py`, two mechanisms answering two different questions, and
they disagree — which is the point of running both.

**The proxy** answers *where did the run go, and what was refused*. A minimal
`CONNECT` proxy on loopback with a host allowlist, handed to the child as
`HTTPS_PROXY`/`HTTP_PROXY`/`ALL_PROXY` in every spelling with `NO_PROXY` for
loopback so the seal socket is untouched. Every tunnel is logged with host, port,
verdict and byte counts and **nothing else**: no request headers, because a
`CONNECT` can carry `Proxy-Authorization`, and no tunnelled bytes. A plain HTTP
request through the proxy is refused and logged. The allowlist defaults to the
hosts the custom-provider `baseUrl`s name.

**The trace** answers *did anything bypass the proxy*. `strace -f --seccomp-bpf
-e trace=connect` wrapping the launcher. Measured on this host: it follows into
bwrap's `--unshare-pid` namespace and stops only on `connect`, and it records
every destination any process in the run opens whatever the child believes about
proxy variables.

### What a live probe measured

Run `b7-egress-001`: a 23.4-second throwaway run, no subject and no seal, one
objective ("answer READY and finish"), four tools, proxy and trace both on.
Status `completed`, native Goal created and completed, 3 assistant responses.

**The OMP child honours `HTTPS_PROXY`.** 23 `CONNECT` attempts went through the
proxy. One was allowed — `openrouter.ai:443`, 97,158 bytes up and 14,914 down,
the provider call — and **22 were refused**, to sixteen third-party hosts, in the
first 110 milliseconds of the run:

```
auth.kimi.com          oauth2.googleapis.com   cursor.com (x2)     opencode.ai (x3)
api.z.ai               api2.cursor.sh          api.meta.ai (x2)    chatgpt.com (x2)
catalog.stencil.so     coding-intl.dashscope.aliyuncs.com          hyper.charm.land
api.commandcode.ai     api.kilo.ai             api.venice.ai       zenmux.ai
token-plan.ap-southeast-1.maas.aliyuncs.com
```

That is a startup provider/auth sweep nobody had seen, because nobody had looked.
**The run completed normally with all sixteen blocked**, so the allowlist costs a
seal run nothing. `qa.omp.sh` did not appear, which is E-8 confirmed from a
second direction: the auto-QA endpoint is not merely unconsented, it was not
contacted.

**One destination bypassed the proxy, and the trace caught it.** 49 `connect(2)`
calls recorded. Discounting loopback (the proxy itself, the local resolver, and
probes of `127.0.0.1:1234`, `:8080`, `:11434` — LM Studio and Ollama ports, which
`NO_PROXY` exempted and nothing was listening on) and the eight `htons(0)` UDP
connects that are glibc's `getaddrinfo` address sorting, exactly one off-host TCP
connection was made directly:

```
2538501 connect(32, {sa_family=AF_INET, sin_port=htons(443),
                     sin_addr=inet_addr("44.210.33.227")}, 16) = -1 EINPROGRESS
```

44.210.33.227 is one of `api2.cursor.sh`'s eight A records — the same host the
proxy had refused 37 ms earlier, and the connect is by the main OMP process (the
one that receives `SIGWINCH`), after the refusal. So the proxy is **honoured but
not enforcement**: at least one code path falls back to, or never consulted, the
proxy environment.

### The honest position

Configuration is not containment. What is now measured, per run and in the
evidence (`egress-proxy.json`, `egress-connect.json`, `egress.json`):

* every destination the run routed through the proxy, with the verdict and the
  byte counts;
* every destination any process in the run opened, from the trace; and
* `reconcile()`, which names any off-host destination the proxy did not see.

What is **not** closed: a destination that ignores the proxy still reaches the
network. Closing it needs enforcement rather than configuration — a network
namespace with a veth pair and an allowlist ruleset, or a firewall rule, both of
which need root and a network path that has not been rehearsed on this host. I
did not put an unrehearsed network path under a one-shot multi-hour candidate run
that cannot be retried. `launch.json` now records
`network_egress_enforced` derived from the settings rather than hard-coded
`false`, together with the allowlist, the proxy URL and the trace path, and the
reconciliation says plainly when something went around it.

Tests: `tests/test_egress.py`, 13, against real loopback sockets and a local echo
server — allowed tunnel with measured byte counts, refusal logged, subdomain
matching and its lookalikes, plain HTTP refused, the log proven free of headers
and payload, every proxy-variable spelling, allowlist derivation from a provider
block, and the trace parser over real `strace` line shapes including IPv6, the
missing-trace case and both reconciliation verdicts.

## 9. The host-side rehearsal, before any live run

The pattern this effort keeps rediscovering is that the finalize path breaks in
ways tests with a fake runner cannot see. So before spending a live run on it, I
drove the **whole two-seal path host-side on the real subject**, through the real
`host_seal.sandbox_runner`, the real `direct_custody` variants and the real
command plan — `tools/b7_prep_probe.py`, run as `b7-prep-probe-001`, `plan_layer`
profile, throwaway workspace.

Custody there is satisfied by a synthetic session-records directory the probe
writes, which makes every artifact it produced **host-side rehearsal evidence and
nothing else**: it claims no seal and its workspace is disposable. It is the same
kind of thing as task G's `prep-check-002`, and it is the only place in this work
where custody is not a real model turn. The live runs below stub nothing.

| stage | seconds |
|---|---:|
| materialize | 4.1 |
| measure 1 (`bprobe-001`, 15 operations, all pass, `classification_pending`) | **147.2** |
| finalize 1 → `artifact_scope_closed`, commit `revision-1`, amendment released | **59.5** (51.6 of it the commit) |
| measure 2 (`bprobe-002`, 15 operations, all pass) | **151.3** |
| finalize 2 → `artifact_scope_closed`, commit `revision-2` | **59.8** (52.2 the commit) |

```
revision-1  b6ae71a839d7699e0d090a5f15936e1814817e2e   7030 governed files, 12-file amendment release
revision-2  4a04c48465c21d292276e0ef67f5f0f842df2a01   7042 governed files
verify_release: verified, route direct-native, two distinct commits, first_commit bound,
                route / native_identity / revision_labels / commit_immutability /
                tree_matches_seal / inventory_census / blob_digests / distinct_commits /
                release_first_commit all checked against the Git objects
```

That is the first time in this effort that a direct-mode finalize, an artifact
commit and an amendment release have happened at all. It also priced the commit:
**about 52 seconds for a 7,000-file governed tree**, which is most of the
finalize and is worth knowing before reading the live table.

Three things it settled before the live runs:

* the root shard-index row is already in `gitlab-repaired-v1`'s snapshot, so the
  preparation step wrote nothing and all fifteen operations passed including
  `shards_check` in 8.4 s (G-2 confirmed on the real subject);
* all three proof folder kinds are written and distinct —
  `closure-measure-…`, `closure-finalize-…`, `closure-finalize-dispositions-…`
  (G-7 and G-9 in the same directory listing); and
* the revision handoff after a sealed measurement still costs exactly one refused
  call, which is the documented C-2b behaviour and not a defect.

## 10. The live runs

Both arms use task G's package, subject `gitlab-repaired-v1`, model
`openrouter-union/stealth/union-alpha` at `xhigh`, runtime pin 18.2.2, a fresh
workspace per run, and **the six documented tools** — `read, bash, write, edit,
grep, glob`. The six-tool contract is restored because G-5 is fixed: G-1b and
G-2 had to drop `edit`, which turned a three-line hashline edit into a whole-file
write, and that deviation is now unnecessary.

Launch settings that are new here: `direct_release: true`,
`derive_root_shard_index: true`, `egress_proxy: true`, `egress_trace: true`,
`plan_layer_finalize: true`, `hard_limit_seconds: 14400`.

Task text: task G's, with exactly three passages changed, by
`tools/b7_stage_run.py`, which asserts each original passage is present before
replacing it —

* seal argument files go in `.pwflow/scratch/` and nowhere else, with the reason
  stated (the measured tree, and why a finalize refuses otherwise);
* two rules about `finalize`: the `--declaration` is the same file that was
  measured, and the inspection goes in `--dispositions`, never in the
  declaration;
* the first accepted finalization makes the commit **inside the seal call** and
  the answer carries a `host_release` block naming it and the release.

Nothing else moved: `GOVERNANCE.md` (7,813 B, `94262dff…`),
`FOLLOWUP_CONTRACT.md` (4,035 B, `e6773dfd…`) and `TOPIC_INPUTS.md`
(45,058 B, `7e3b9d2f…`) are byte-identical to G's.

### `b7-full19-001` — the run that found B7-1

Launched 04:03:12 UTC, stopped with the host cancel marker at 04:49:24, 2,779.0 s,
status `incomplete`, 88 assistant responses, 138 tool calls
(`read 70, bash 37, write 13, grep 9, edit 5, glob 2, goal 2`), 1,153,092 bytes
of tool output, **1 compaction**, settings drift `[]`, model and effort read back
`openrouter-union/stealth/union-alpha` / `xhigh`, no identity conflict. Tokens:
1,773,020 input, 10,050,332 cached input, 25,562 output.

| stage | issued (min from launch) | seal seconds | answer bytes | result |
|---|---:|---:|---:|---|
| `read_file` | 3.9 | 0.012 | 1,718 | `read` |
| `validate_json` | 7.9 | 0.000 | 1,172 | `checked` |
| **first `measure`** (`bsev-001`) | **9.6** | **963.119** | 18,733 | **`classification_pending`, `artifact_checks: pass`, all nineteen operations, 18 failure rows** |
| **first `finalize`** | **29.0** | **88.550** | 2,402 | **`artifact_scope_closed` — accepted** |
| ↳ commit `revision-1` | inside the finalize | 51.6 of the 88.6 | | `c52d8c7f3cf8ea72911aa4adec9ce24dec3c057e`, tree `648ca12a…`, **7,046 governed files**, matches the governed inventory |
| ↳ amendment release | inside the finalize | | | 12 files, `READY.json` 111,927 B, 413 source bindings, `first_commit` bound |
| `measure` (stale revision) | 34.7 | 0.001 | 450 | refused — the C-2b handoff assigning `bsev-002` |
| `measure` | 35.6 | 8.018 | 241 | **refused — `ValueError: normalized relative path required`** |
| `measure` | ~40 | 8.675 | 320 | **refused — `ValueError: missing or escaped file: fixtures/.../amendment.json#affected_surface_hints`** |

**Everything G reported as impossible happened here.** G-5, G-6, G-7 and G-9 all
cleared on the first attempt at each: the model used the hashline `edit` tool
five times with no dispatch violation, wrote fifteen helper files into
`.pwflow/scratch/` and none into the measured tree, sent the measured
declaration back at finalize, and its dispositions were accepted. The commit and
the amendment release fired inside the finalize call, and the host continuation
prompt naming `revision-1` went into the composer.

**And then my own release stopped the second seal.** `release_amendment` wrote
`READY.json`'s `source_bindings` as **absolute host paths**, and the host-built
affected-surface hints as `<amendment.json>#affected_surface_hints`, which is not
a file at all. `_census` binds every entry with `_bound(experiment, ref)` and
`_relative` requires a normalized relative path. The model diagnosed it exactly
right in its own scratch notes —

```
"host_error": "ValueError: normalized relative path required",
"inference": "The absolute released amendment binding paths are the likely cause of
              host normalization refusal; the host supplies no traceback identifying the field."
```

— normalized the eleven paths itself, and hit the pseudo-path behind them. Task
G's `host_release.py` had both right and I regressed both when moving it into the
package. **This is the same class of defect as everything else in this effort: a
shape that only a live run exercises, behind a test suite that was green.** My
`test_direct_seal_path` built its release with two synthetic files and never
tried to bind the result.

Fixed as B7-1 (`_experiment_relative`, `check_bindings` over the **whole**
released map including the 402 inherited entries, and a real host-written hints
file), with four tests, one of which binds every released entry through
`scoped_governance._bound` itself. Rerun as `b7-full19-002` — a new labelled run
on changed code, not a retry: `b7-full19-001`'s record stands as written above.

### `b7-full19-002` — **the full19 two-seal path, completed live**

Launched 04:57:31 UTC, **status `completed`**, 3,758.7 s (62.6 min), process exit 0,
native Goal created **and completed**, 81 assistant responses, model and effort
read back `openrouter-union/stealth/union-alpha` / `xhigh`, settings drift `[]`,
no identity conflict. Tool calls: `read 58, bash 24, write 15, grep 10, edit 7,
goal 2`. Native identity
`01a0adba-2f70-759a-b110-f9c6c50c6990` / `1582bbe5b3a56bc0`.

| stage | issued (min from launch) | seal seconds | answer bytes | result |
|---|---:|---:|---:|---|
| `read_file` | 5.0 | 0.016 | 1,718 | `read` |
| `validate_json` | 6.2 | 0.004 | 1,174 | `checked` |
| **first `measure`** (`bnine-001`) | 7.6 | **1,079.867** | 18,791 | `classification_pending`, `artifact_checks: pass`, nineteen operations, 18 failure rows |
| **first `finalize`** | 28.4 | **82.730** | 2,468 | **`artifact_scope_closed`** |
| ↳ **commit `revision-1`** | inside the finalize | | | `425306a6e55da5a7eb1e5fa64844b6d3342c47f8`, tree `bb008c09edf799ee31dd8880781076642f212e60`, **7,046 governed files**, matches the governed inventory, 33 bookkeeping paths excluded |
| ↳ **amendment release** | inside the finalize | | | 12 files, `READY.json` 110,959 B / `89960692…`, **413 source bindings, all bindable**, `first_commit` bound |
| `measure` (stale revision) | 40.6 | 0.001 | 452 | refused — the C-2b handoff assigning `bnine-002` |
| **second `measure`** (`bnine-002`) | 41.1 | **1,073.914** | 18,794 | `classification_pending`, `artifact_checks: pass`, nineteen operations |
| **second `finalize`** | 61.0 | **77.601** | 2,277 | **`artifact_scope_closed`** |
| ↳ **commit `revision-2`** | inside the finalize | | | `7444f335a3d5ec33998ba7a3a297aa3a23322e33`, tree `d12a86970fd52e135e58c03eec1d41d6f4490f06`, **7,068 governed files**, matches the governed inventory, 63 bookkeeping paths excluded |

The amendment is released once, at `revision-1`; the `revision-2` receipt repeats
the same release record because the run's release state is cumulative.

**Seal records, with their labels.** Both closures:

```
status                    artifact_scope_closed
seal_profile              full19
omitted_operations        []
repository_gates_status   ran_in_this_seal
seal_scope                full_profile
full_repository_qualified false
global_failure_dispositions  18 rows each
```

`verify_release` over the written records and the Git objects:

```
verified: true, route direct-native,
native_identity [01a0adba-2f70-759a-b110-f9c6c50c6990, 1582bbe5b3a56bc0]
commits  425306a6e55da5a7eb1e5fa64844b6d3342c47f8
         7444f335a3d5ec33998ba7a3a297aa3a23322e33   (distinct)
first_commit 425306a6…  = the amendment release's first_commit
checked: route, native_identity, revision_labels, commit_immutability,
         tree_matches_seal, inventory_census, blob_digests, distinct_commits,
         release_first_commit
```

**Each B7 item, confirmed on this run's own records:**

| item | live result |
|---|---|
| **G-5** | **7 `edit` executions, `dispatch_violations` empty**, `xd://` zero in the session records and zero in `tui.raw`. One `dispatch_target_unresolved` — the `edit` execution record with no `args` key, recorded and not fatal, exactly as designed. The six-tool contract is usable again |
| **G-6** | **56 files in `.pwflow/scratch/`, none in the measured tree.** 7,131 workspace files, **7,068 governed**, 63 excluded as `.pwflow*`. Both finalizes passed the governed-tree check on the first attempt |
| **G-7** | two `direct-preclosure-equivalence.json` receipts, one per seal: `declaration_digest_equal: true`, `same_goal: true`, `proof_payload_compared: false`, with **distinct** measure and finalize proof paths (`closure-measure-bnine-00N-…` vs `closure-finalize-bnine-00N-…`) — the fact that made the frozen payload comparison impossible, now recorded rather than fatal |
| **G-9** | `closure-finalize-dispositions-bnine-001-…` and `-bnine-002-…`, both `written_by: host_seal_service_from_received_request`, both bound to the run's native identity. 18 disposition rows accepted per seal |
| **G-4** | two commits, one release, the record shapes verified above; the `host_release` block reached the model in both finalize answers and the host continuation prompt naming `revision-1` went into the composer (`evidence/release-prompt.json`) |
| **G-2** | `root-shard-index.json`: 99 sources, `rows_written: []`, `index_changed: false` — the subject carries the row, the step was a no-op, and `shards_check` passed in both measures |
| **E-8** | `dev.autoqa` asserted and observed `false`, `dev.autoqaConsent` observed `denied`, drift `[]`, **zero** `BLOCKING_DIALOGS` strings in 63 minutes of `tui.raw`, zero `report_issue` calls, run ended on a clean Goal completion |
| **E-9** | zero answers claiming completeness for bytes not delivered |
| **E-10** | `tools.xdev` observed `false`, `dispatch_violations` empty at every poll, `xd://` zero everywhere |
| **E-11** | both measure answers cite `full_report_path` and per-failure `evidence_paths` under the read-only governance root; the model read them (its scratch area holds `audit_governance-expanded.json`, `run_gates-expanded.json` and the closure stdout/stderr it pulled from there) |

**Egress on this run:** 160 proxy attempts, **126 refused** across the same
sixteen third-party hosts, one host allowed — `openrouter.ai:443`, 34 tunnels,
71,998,460 bytes up and 729,188 down. One off-host TCP destination again went
direct (`18.208.233.66:443`, an `api2.cursor.sh` address), which the connect
trace caught; the rest of the off-host entries in the reconciliation are
`htons(0)` UDP connects, which are glibc's `getaddrinfo` address sorting and send
nothing.

### `b7-planlayer-001` — **the plan_layer two-seal path, completed live**

Launched 11:06:46 UTC, both seals closed by 11:44:16, stopped with the host
cancel marker at 11:47 to release the machine for task N3 — so the run's own
status is `incomplete` by the transport's rule (the Goal was not observed
completed), and **both seals are accepted and both commits are made**, which is
what the arm was for. 2,448.9 s, 83 assistant responses, tool calls
`read 63, bash 33, edit 8, grep 7, glob 5, goal 2`, drift `[]`, model and effort
read back `openrouter-union/stealth/union-alpha` / `xhigh`. Native identity
`01a0af0c-4329-772a-997b-99e661a62fba` / `1583106aa6348476`.

| stage | issued (min from launch) | seal seconds | answer bytes | result |
|---|---:|---:|---:|---|
| `read_file` | 1.1 | 0.002 | 12,902 | `read` |
| **first `measure`** (`beight-001`) | 16.3 | **208.877** | 3,100 | `classification_pending`, `artifact_checks: pass`, fifteen operations, **zero failing checks** |
| **first `finalize`** | 21.2 | **88.311** | 2,686 | **`artifact_scope_closed`** |
| ↳ **commit `revision-1`** | inside the finalize | | | `eae941e7fe1aad10861fc59d44915a8210e5db9a`, tree `d7edead73a90d568d328bf2ef973b9d2156a278a`, **7,035 governed files**, matches the governed inventory |
| ↳ **amendment release** | inside the finalize | | | 12 files, `READY.json` 110,962 B, 413 bindings all bindable, `first_commit` bound |
| `measure` (stale revision) | 29.5 | 0.001 | 458 | refused — the C-2b handoff assigning `beight-002` |
| `read_file` | 30.0 | 0.001 | 2,614 | `read` |
| **second `measure`** (`beight-002`) | 31.0 | **201.264** | 3,100 | `classification_pending`, `artifact_checks: pass`, fifteen operations |
| **second `finalize`** | 36.0 | **83.606** | 2,497 | **`artifact_scope_closed`** |
| ↳ **commit `revision-2`** | inside the finalize | | | `1e1ec9ede4161a863594ead1a2a38df6e47c5bef`, tree `18b4ddacb96aa5d742c1c22e31288c9a9d537a07`, **7,047 governed files**, matches the governed inventory |

**The partial seal is labelled, in the artifact, for the first time.** G-8's
complaint was that the labels existed only on a finalize outcome no run could
reach. Both `closure.json` files now carry them:

```
status                    artifact_scope_closed
seal_profile              plan_layer
omitted_operations        [audit_governance, run_gates]
repository_gates_status   not_run_in_this_seal
seal_scope                partial_profile_named_omissions
full_repository_qualified false
global_failure_dispositions  0 rows (this profile produced no failing checks)
```

`verify_release`: **verified**, route `direct-native`, two distinct commits,
`first_commit eae941e7…` bound to the release, all nine checks against the Git
objects.

Every B7 item confirmed again on this arm: `dispatch_violations` empty across
**8 `edit` executions** with one recorded `dispatch_target_unresolved` and zero
`xd://` anywhere (G-5); 33 scratch files, none in the measured tree, 7,083
workspace files of which **7,047 governed** and 36 excluded (G-6); two
equivalence receipts with `declaration_digest_equal: true`, `same_goal: true`,
`proof_payload_compared: false` (G-7); two host-written dispositions proofs
(G-9); two commits and the release (G-4); `rows_written: []` (G-2). E-8 through
E-11 all hold: `dev.autoqa false`, `dev.autoqaConsent denied`, `tools.xdev
false`, drift `[]`, zero dialog strings, zero `report_issue` calls, zero false
completeness claims. Egress: 124 proxy attempts, **92 refused**, one host
allowed (`openrouter.ai`, 32 tunnels).

### The plan-layer saving, measured on a subject that seals

| | `full19` (`b7-full19-002`) | `plan_layer` (`b7-planlayer-001`) |
|---|---:|---:|
| operations per measure | 19 | 15 |
| first / second `measure` | **1,079.9 s / 1,073.9 s** | **208.9 s / 201.3 s** |
| first / second `finalize` | 82.7 s / 77.6 s | 88.3 s / 83.6 s |
| failing checks to disposition | 18 each seal | **0** |
| measure answer | 18,791 B | 3,100 B |
| launch → second seal closed | **61.0 min** | **36.0 min** |

**871 s per measure**, plus the whole disposition workload, is what `plan_layer`
removes — and correspondingly what it does not claim, which is now written into
the closure rather than asserted in a document.

## 11. What is not done

1. **Egress is measured, not enforced.** One off-host TCP destination went
   direct in every run with the proxy on (`api2.cursor.sh`, after the same host
   was refused through the proxy). The trace catches it; nothing stops it.
   Closing it needs a network namespace with an allowlist ruleset, which needs
   root and a rehearsed network path — not something I was willing to put under
   a one-shot multi-hour run that cannot be retried.
2. **`b7-full19-001` was stopped, not completed**, by a defect of mine (B7-1).
   Its record stands above as the run that found it.
3. **`b7-planlayer-001` ended on the host marker**, after both seals, to release
   the machine. Its transport status is therefore `incomplete`; the seals are
   not.
4. **G-8 is closed for a finalize and still open for a measure.** The labels are
   in both `closure.json` files now, but a `measure` answer still carries only
   `profile` and `profile_operations`. Labelling the measurement outcome as well
   is a small change I did not make.
5. **The commit costs about 52 s** on a 7,000-file governed tree, which is most
   of a plan-layer finalize. Nothing is wrong with it; it is simply the price,
   and a reader comparing finalize times across profiles should know it.

## 12. Item dispositions

| item | disposition |
|---|---|
| **G-5** dispatch guard kills every healthy run at its first hashline edit | **Done and proved live.** Target resolved from every OMP argument shape plus the `[path#hash]` header; refusal only for a pseudo-path, an absolute path or a traversal; an unresolvable target recorded as `dispatch_target_unresolved` and never fatal. 21 tests from task G's verbatim records. Live: 15 `edit` executions across two arms, zero violations, zero `xd://` |
| **G-6** the dispositions file the contract demands invalidates the measurement | **Done and proved live.** Governed tree defined as the workspace minus `.pwflow*`, enforced by rebinding `inventory` in the direct variants only; `.pwflow/scratch/` given to the model and resolved by the client; the "sandbox changed" refusal kept and made specific. Live: 89 scratch files across two arms, none in the measured tree, four finalizes passed the check first time |
| **G-7** a direct finalize can never match its measure's preclosure proof | **Done and proved live.** The direct finalize compares the declaration digest and the goal identity against the measurement and hands the frozen body the measurement's own recorded proof, which it re-authenticates in full; both proofs kept, `proof_payload_compared: false` recorded. Live: four equivalence receipts, all `declaration_digest_equal` and `same_goal` |
| **G-9** dispositions are passed raw to a gate that requires a host-written proof | **Done and proved live.** Wrapped at receipt exactly as the declaration is, bound to `inspection_input_digest` and this run's identity and tool call. Tested with the exact bytes G-2 sent and with a non-empty set. Live: four `closure-finalize-dispositions-…` proofs accepted, 36 disposition rows in the full19 arm |
| **G-4** no Git commit and no amendment release exist in direct mode | **Done and proved live.** `pwflow/direct_release.py`, fired inside an accepted finalize. Live: **four commits in two external bare repositories**, two amendment releases, `verify_release` green on both arms |
| **G-2** a newly registered pilot needs its root shard-index row as derived content | **Done, with the decision recorded.** Neither option in the brief is implementable without editing a frozen script or changing profile arity, both checked by reading the scripts; the row is derived by the host at preparation instead, from the sharding config's sources plus the launch `docpaths`, with the spelling checked against the frozen script's own source. Fixture note: `gitlab-repaired-v1` carries the row, so the step is a no-op there and `shards_check` passed in all four live measures |
| **G-3** (taken in passing) the spill answer named the wrong place | Done: the `reason` quotes the path it wrote |
| **B7-1** (found live) the released source map was not bindable | Done: every released binding is an experiment-root-relative path to a real file, the host-built hints get a real file, and the whole map is checked before `READY.json` is written |
| **Egress** | **Measured, not enforced.** See §8 and §11.1 |

## 13. Evidence

| what | where |
|---|---|
| successor-11 changes | `pwflow/{host_seal,direct_custody,seal_client,source_map}.py`, `pwflow/transports/omp_direct.py`; new `pwflow/{direct_release,root_shard_index,egress}.py` |
| tests | new `tests/{test_dispatch_guard,test_direct_seal_path,test_root_shard_index,test_egress}.py` |
| docs | `docs/direct-omp-mode.md` §1 (new sections), `CHANGES.md` "B7" |
| live runs | `gitlab-g-live-confirmation-20260917-v1/candidate/baseline/b7-{full19-001,full19-002,planlayer-001}/`, each with `B7_README.md`, `request.json`, `result.json`, `summary.json`, `evidence/` (session records, `tui.raw`, `seal-calls.jsonl`, `host-release-*.json`, `release/`, `egress-*.json`, `b7-confirm.json`) |
| host-side rehearsal | `…/baseline/b7-prep-probe-001/` (claims no seal) |
| egress probe | `…/baseline/b7-egress-001/` |
| governance receipts and proofs | `…/candidate/.pwflow-governance-runs/b7-*/` |
| tools | `harness-latency-20260916/tools/b7_{stage_run,live_run,prep_probe,egress_probe,stage_table,confirm}.py` |

Task G's package is otherwise untouched: `candidate/pwflow/transports/omp_direct.py`
still hashes to `91ffc461a45fe4de8bd4d13b061572048202eb1e724c83b52dc17e519c6d5278`,
the value G recorded. No credential was printed or copied; the only credential
field anywhere in this work is the `!cat …/openrouter.key` reference OMP resolves
itself.

**The lesson, once more and from my own hand.** Six of the seven defects this
work closed were found by a live run. The seventh, B7-1, was mine: I moved task
G's working `host_release.py` into the package, regressed both of its
path-shapes, shipped it behind 34 green tests that built a release out of two
synthetic files and never bound the result — and a live run found it in the one
place it could, between a perfect first seal and an impossible second. The test
that would have caught it is four lines long and now exists.

---

**full19 two-seal path completed live: yes** — `b7-full19-002`, seal 1
`artifact_scope_closed` at 1,079.9 s measure + 82.7 s finalize (commit
`425306a6…`), seal 2 `artifact_scope_closed` at 1,073.9 s measure + 77.6 s
finalize (commit `7444f335…`); 61.0 min launch to second seal, run status
`completed`.
**plan_layer two-seal path completed live: yes** — `b7-planlayer-001`, seal 1
`artifact_scope_closed` at 208.9 s measure + 88.3 s finalize (commit
`eae941e7…`), seal 2 `artifact_scope_closed` at 201.3 s measure + 83.6 s
finalize (commit `1e1ec9ed…`); 36.0 min launch to second seal.
**Tests: 339 passed, 0 failed (5 skipped)** across the thirteen direct-mode
modules, 83 of them new. The wider suite's pre-existing 5 failures and 68 errors
are unchanged and in modules this work does not touch (verified against task G's
untouched copy of successor-11, which shows 5 and 69).

---

# B8 — turn economy

Agent: Claude Opus 5, 2026-09-17, from task N5's measurement of `b7-full19-002`
and task N6's replay suite. Same rules as B7: successor-11 only, task G's package
written only under `b8-*` run directories, no credential printed, one run at a
time.

N5's basis, which decides what is worth changing: of 3,757 s of run, **876.7 s
was model time across 81 responses** and 553.7 s was scripts the model ran
itself; 776 s of the model time was time-to-first-token, about **7.7 s per turn**
plus 0.13 s per thousand uncached tokens. **A turn costs; a byte does not.** So
every item below removes turns, and the packet item removes bytes only because
they buy back a compaction.

## 1. Complete failure rows on disk. **Done, verified on real data.**

`measure` said `detail_completeness: not_asserted_aggregate_may_truncate` while
`GOVERNANCE.md` demanded a disposition grounded in the complete check. The model
therefore re-executed three validators the seal had just run — **twelve
responses, 122.8 s of model time and 32.2 s of script, 27 percent of the first
seal's model time** — and did it again for the second seal.

The caps are real, from that run's own reports:

```
lint_path_refs                     retained  50 of  51
validate_implementation_readiness  retained  50 of 116
validate_audit_closure             retained  50 of 201
audit_governance/audit_closure     retained 100, reported unknown
```

so the host cannot copy arrays it already has. New `pwflow/failure_rows.py` asks
the validator again, **host-side, before the answer is sent**, in three tiers: a
check whose retained count already equals its reported count is copied out; a
capped check is re-run through its own standalone subcommand, resolved from the
frozen `pm-plans-verify.py`'s own `COMMANDS` table rather than a list copied
here; and three checks whose standalone subcommand is itself an aggregate go one
level deeper, to the argv `scoped_governance.measure_complete_failure_check`
already uses, with the deeper result taken only when it is strictly richer. The
governed inventory is captured around every re-run and a check that changed the
tree is refused. A check with no resolvable command keeps its retained rows and
says `complete_rows_on_disk: false` — a file claiming completeness it does not
have would be worse than the cap.

**Verified against `b7-full19-002`'s own retained evidence, no new run:** all
eighteen checks resolved, recovering **51, 116, 54, 201 and 1,772** — the exact
denominators the model spent two minutes of its own time deriving, including the
1,772 closure errors N5 records it discovering at response 44. Host cost 85.3 s,
which nobody waits on.

The answer gains `rows_path`, `complete_rows_on_disk`, `complete_row_count` and
`rows_sha256` per check. `direct_custody.merged_failure_census` additionally
emits **one `failure_id` per check** rather than one per reporting operation —
the eighteen ids were nine checks reported twice, and the model authored nine
reasons and bound them to eighteen identities. `reported_by` names both
aggregates; the row keeps the largest denominator and the union of the error
codes, so it can never understate what must be dispositioned; the job-stream lane
is untouched because the name is rebound only in the direct variants.

## 2. The model never runs the profile's own operations. **Done, with a caveat stated.**

480 s of the run — 12.8 percent — went into `pm-plans-verify.py run-gates`
(365.0 s) and `pm-new-contracts-verify.py` (114.5 s) that the seal re-ran minutes
later, and which `plan_layer` omits by definition. The task text now says so in
one place and names the narrow subcommand to use instead
(`lint-contractrefs` answers the question the 365 s was spent on).
`repository_wide_invocations` records any it sees as
`repository_wide_operation_refused` and **never ends the run**.

**The caveat, plainly:** a bash command is dispatched before the harness sees its
record, so the guard cannot abort one. The task text is the prevention; the guard
is the evidence, so a repeat is attributable rather than buried in elapsed time.
Calling it a refusal would overstate what the transport can do.

## 3. `census_revision_id` republished by the finalize. **Done.**

The file promised republication after each measurement and still read the sealed
revision after the first finalize; the client filled the stale id exactly as
documented and the next measure was refused. 31 s lost here, and a whole
1,074-second measurement lost by any run that trusted the contract without
re-reading. A sealed revision can never be measured again, so the next one is
assigned at the finalize. The C-2b refusal survives for every other case; it
simply no longer fires on the normal path.

## 4. The packet references what the model reads anyway. **Done.**

27 KB of `TOPIC_INPUTS.md`'s 45 KB duplicated owner documents the model then read
in full, and 13 of 58 reads (246 KB, 33 percent of all bytes) were avoidable.
`reference_named_units=True` lists every graph-named unit by identity, owner
document and one line of substance, with the one command that fetches its owner
whole; the subject's own units stay complete and the identities are still
exhaustive. The lookup section no longer claims whole files come back unpaged —
they do not, and `TASK.md` was right where the packet was wrong — and it names
the `Plans/.audits` listing and the index preamble as the two reads that cost
most and returned nothing usable.

**Measured on this subject: 45,058 → 21,536 bytes, 52.2 percent smaller.**
`TASK.md` grows 11,723 → 14,703 bytes for the three new paragraphs, so the packet
change is a net 20.5 KB off the prompt, against the 22 KB of headroom that
separated `b7-full19-002` from its compaction.

## 5. Write attribution from the commit diff. **Done.**

All seven `edit` calls carry an empty `args` object in their
`tool_execution_start` record, so `dispatch_target_unresolved` is blind and its
count of 1 was not meaningful. `commit_governed_tree` records `changed_paths`
from the diff against the parent commit with a note saying where the attribution
came from, and the transport collects `edit_attribution` per revision.

## 6. A pre-edit baseline, and the closure rows retained. **Done.**

New `pwflow/baseline_measurement.py`, launch setting `baseline_measurement`. It
runs the profile's command plan host-side on a **throwaway copy** of the
materialized workspace before the runtime starts — the run's own workspace is
untouched, so the model still starts from the frozen subject byte for byte, and
no model time is spent. `compare()` turns the two censuses into
`pre_existing_checks` / `introduced_checks` / `resolved_checks`, so "this failure
is pre-existing" is a diff a reviewer can read rather than a claim they must
re-derive. The complete `audit_closure` rows — the 1,772 the model reasoned over
as 168 normalised classes — are retained per revision by item 1, each with its
own `rows_sha256`.

It claims no seal: no custody, no census, no declaration, no closure. It is the
same shape as task G's preparation probe.

## N6's replay suite, and its three findings

The patch applied clean and additive: **58 files, 146 tests**, replaying 46
recorded OMP tool-call and seal-call shapes through `dispatch_violations`,
lifecycle readback, `host_seal`, `direct_custody` and the finalize
preconditions, with a regression per historical defect (E-1, E-5, E-7, E-9,
E-10, E-11, G-5, G-6, G-7, G-9). All 146 pass against the B7 and B8 changes.

| finding | disposition |
|---|---|
| **G-8 still open for measure answers** | **Done.** The profile labels were attached to a finalize outcome only, so a `plan_layer` measurement — the artifact a reviewer reads first — carried no `seal_profile`, no `omitted_operations` and no claim boundary. `profile_labels()` now applies to both branches, and `seal-profile-labels.json` is written beside the measurement, which the frozen body cannot do |
| **20 KB bound, 1.2 KB headroom, truncation never fired** | **Done.** It shrinks before it drops: `evidence_paths` are three derivable paths per check and `rows_path` is the one that matters, so the whole `failure_id` list — which the finalize contract needs a row for — survives an answer that would otherwise lose entries off the tail. Measured thresholds: 24 checks fit once `evidence_paths` go; at 25 an entry is dropped and the answer says so. Tested at three sizes including a 400-check answer |
| **Refusal answers elided before reaching the model** | **Done.** A refusal is the one answer that must arrive intact and is never large enough to need a budget: bounded at 6,000 bytes, far below the delivery budget, with `reason_truncated` and a sentence saying the part kept is the beginning, which names the rule |

One defect of my own, found by the suite rather than by a run:
`release_state` was read in the transport's `finally` block but created inside
the `try`, so a launch that failed before the seal was constructed raised
`UnboundLocalError` over the real reason. Moved to the top with `egress_proxy`.

## The comparison baselines

Measured from each run's own `response-measurements.json`, attributed to a seal
by where each response's `record_index` sits relative to the accepted finalize
calls (`tools/b8_turns.py`). The method reproduces task N5's independent figures
for `b7-full19-002` exactly — 81 responses, 876.7 s of model time, 776.0 s of
time-to-first-token, seal 1 at 460.5 s, peak prompt 240,245 tokens — which is why
I trust it for the other runs.

| | `b7-full19-002` | `b7-planlayer-001` |
|---|---:|---:|
| responses, seal 1 / seal 2 | **47 / 32** | **50 / 22** |
| model minutes, seal 1 / seal 2 | **7.68 / 6.74** | **9.87 / 8.97** |
| model seconds, whole run | 876.7 | 1,327.4 |
| time-to-first-token, whole run | 776.0 | 1,241.3 |
| compactions | 1 | 1 |
| peak prompt tokens (window 262,144) | 240,245 | 250,402 |
| failing checks to disposition | 18 per seal | 0 |

**The plan-layer arm spent more model time than the full19 arm** — 1,327 s against
877 s, on a run 20 minutes shorter — and came closer to the window, 250,402
against 240,245. That is not a contradiction: `plan_layer` removes the two
aggregate gates and with them the entire failure census, so the model has less
seal-provided material and does more of its own reading and reasoning to reach the
same declaration. It is the arm with the most to gain from a packet that stops
duplicating what it reads, and the least to gain from item 1, which has no failing
checks to put on disk.

**So `b7-planlayer-001` is the arm B8's run is compared against**, and the honest
expectation before running is: items 2 to 6 and the packet act on it; item 1 does
not, because a `plan_layer` measure produces no failing checks at all. Item 1 is
verified on `b7-full19-002`'s retained evidence instead (§1 above), where it
recovers all eighteen checks.

## The live proof: `b8-planlayer-001`

Launched 13:32:48 UTC, **status `completed`**, 2,392.2 s, native Goal created and
completed, model and effort read back `openrouter-union/stealth/union-alpha` /
`xhigh`, drift `[]`. Machine: **15 samples at 60-second intervals, zero other
candidates in every one** (`evidence/machine-samples.jsonl`, load 2.08–5.24) —
the naive `pgrep -f omp-linux-x64` count is three to five processes per arm
because it matches the `strace` and `bwrap` wrappers, and an earlier count of
"eight" in this work was one arm counted over. Task N3 caught that; the sampler
excludes its own run by name.

| stage | issued (min from launch) | seal seconds | answer bytes | result |
|---|---:|---:|---:|---|
| baseline measurement (host, no model) | before launch | **175.005** | | 15 operations pass, 0 failing checks |
| `validate_json` | 9.1 | 0.000 | 1,316 | `checked` |
| **first `measure`** (`beenine-001`) | 13.6 | **216.652** | 3,750 | `classification_pending`, `artifact_checks: pass`, fifteen operations |
| **first `finalize`** | 24.4 | **87.528** | 2,919 | **`artifact_scope_closed`** |
| ↳ **commit `revision-1`** | inside the finalize | | | `57cf67bd04bb058b69425f45a4da2b3e4dab4b68`, tree `1fdae91b…`, 7,035 governed files |
| ↳ amendment release | inside the finalize | | | 12 files, 413 bindings all bindable, `first_commit` bound |
| **second `measure`** (`beenine-002`) | 30.9 | **208.773** | 3,753 | `classification_pending`, `artifact_checks: pass` |
| **second `finalize`** | 34.7 | **83.876** | 2,729 | **`artifact_scope_closed`** |
| ↳ **commit `revision-2`** | inside the finalize | | | `63779d9275b04d233b5cc994c973dbedeb57c145`, tree `c560dfbd…`, 7,047 governed files |

**No refused seal call anywhere in the run.** `b7-planlayer-001` needed seven
seal calls including one refusal; this needed five and none.

### Before and after

| | `b7-planlayer-001` | `b8-planlayer-001` | |
|---|---:|---:|---|
| responses, seal 1 / seal 2 | 50 / 22 | **48 / 21** | −2 / −1 |
| responses, whole run | 83 | **73** | **−12%** |
| model minutes, seal 1 / seal 2 | 9.87 / 8.97 | **20.10 / 5.31** | see below |
| seal calls / refused | 7 / 1 | **5 / 0** | the revision handoff is gone |
| tool calls | 124 | **115** | |
| tool output bytes | 1,322,374 | **1,196,026** | −9.5% |
| packet bytes | 45,058 | **21,536** | −52.2% |
| reads of the client docstring | 1 | **0** | |
| reads/listings of `Plans/.audits` | 1 | **0** | |
| repository-wide operations run by the model | — | **0** (`repository_wide_operations: []`) | |
| compactions | 1 | 1 | |
| peak prompt tokens (window 262,144) | 250,402 | 247,814 | |
| whole run | 2,448.9 s | **2,392.2 s** | |

**The turn counts moved the way the changes predict and the model minutes did
not, and I am not going to dress that up.** Seal 2 fell from 8.97 to 5.31 model
minutes. Seal 1 rose from 9.87 to 20.10 — on a machine with no other candidate,
with two fewer responses. The per-response distribution says where it went:
**median response 11.3 s → 12.1 s and median time-to-first-token 10.4 s →
11.3 s**, essentially unchanged, while the *mean* went 16.2 s → 21.4 s. So the
extra eleven minutes are a handful of very long responses in seal 1, not a
systematic latency shift and not something the harness controls. Model minutes on
a single pair of runs are too noisy to carry a claim; **the response count is the
contention-independent half and it fell**.

**Item 1 was not exercised by this arm, by construction.** A `plan_layer` measure
produces no failing checks at all — `failing_check_count: 0` in both measures, and
the pre-edit baseline likewise found zero — so there is nothing to put on disk and
nothing to disposition. The item is verified instead on `b7-full19-002`'s retained
evidence (§1), where it resolves all eighteen checks and recovers 51, 116, 54, 201
and 1,772 rows. **A full19 arm is what would price item 1 live, and it was not
run.**

### Each item, on this run's own records

| item | live result |
|---|---|
| **1** complete rows | **not exercised** — `plan_layer` has no failing checks. Verified on `b7-full19-002`'s evidence instead |
| **2** no repository-wide operations | **`repository_wide_operations: []`** — the model ran none, against 480 s of them on the measured full19 run |
| **3** revision republished | **zero refused seal calls**; five calls instead of seven. The handoff that cost `b7-planlayer-001` a refusal did not happen |
| **4** packet by reference | packet **45,058 → 21,536 B**; the client docstring and `Plans/.audits` were not read at all; tool output down 9.5%; still one compaction, peak 247,814 of 262,144 |
| **5** edit attribution | `edit_attribution` recorded per revision from the commit diff, with `source` naming where it came from |
| **6** pre-edit baseline | ran host-side in **175.0 s** before launch, 15 operations pass, and `baseline-comparison.json` reports `pre_existing_checks` / `introduced_checks` / `resolved_checks` per revision — all empty here because neither side has a failing check |
| **N6 / G-8** | `seal-profile-labels.json` beside both measurements: `seal_profile: plan_layer`, the four omitted operations, `repository_gates_status: not_run_in_this_seal`, `seal_scope: partial_profile_named_omissions`, `full_repository_qualified: false` |
| **egress** | 109 proxy attempts, **83 refused**, one host allowed (`openrouter.ai`, 26 tunnels, 45.8 MB up / 2.1 MB down); nine off-host `connect(2)` destinations in the trace, the same unenforced-proxy exposure B7 documented |

### A measured floor for the seal, worth recording

The baseline runs the identical fifteen operations with **no model in the loop**:
**175.0 s**. Task N3's four models reached measures of 175.1, 186.0, 193.2 and
194.2 s on the same subject and profile; this run's were 216.7 and 208.8 s, and
G's was 210.8 s. So the model contributes between about 0 and 42 s to a
plan-layer measure on a subject that passes, against a spread of several hundred
seconds in the time taken to reach the call. **The seal is close to a constant;
the turns before it are the variable.** That is the whole case for spending
harness effort on turn economy rather than on the seal.

This band is `plan_layer` on `gitlab-repaired-v1` with zero failing checks — the
narrowest case — and must not be extended to `full19` or to a failing subject.
The four N3 figures are theirs, cited with their caveat.

---

**Responses per seal, before and after: 50 / 22 → 48 / 21** (whole run 83 → 73,
−12%), with seal calls 7 → 5 and refusals 1 → 0.
**Model minutes per seal, before and after: 9.87 / 8.97 → 20.10 / 5.31** — seal 2
down 41%, seal 1 up on a quiet machine with fewer turns, from a handful of long
responses rather than a latency shift (median response 11.3 → 12.1 s, median
TTFT 10.4 → 11.3 s). One pair of runs cannot carry a model-minute claim; the
response count can, and it fell.
**Tests: 511 passed, 0 failed (5 skipped)** — 26 new in `test_turn_economy.py`
plus task N6's 146-test replay suite applied whole, all passing against these
changes.

---

# B9 — task R7's three harness findings

Agent: Claude Opus 5, 2026-09-17, from `reports/R7_KNOWN_DEFECT_RUNS_REPORT.md`.
No candidate was launched: the review coordinator has the machine, and all three
fixes are testable from the shapes R7 recorded. successor-11 only.

## R7-1 — `merged_failure_census` never merged anything. **Fixed.**

B8's docstring and report both claimed that eighteen `failure_id`s become nine.
They do not, and R7 is right about why: the merge keyed on `row['check']`, and
**`run_gates` and `audit_governance` spell the same subcheck differently**. From
`b7-full19-002`'s own retained census, not one string is shared between the two
aggregates, so on that subject the merge would have produced eighteen rows out of
eighteen — and R7-A confirms it live with **11 ids for 6 distinct checks**, every
`reported_by` a single-element list.

Seven of the eight pairs are a `validate_`/`lint_` prefix and nothing else, so
the fix is a rule rather than a list. The eighth is a genuine rename:

```
lint_path_refs                    <-> path_refs                   prefix
validate_server_command_gap       <-> server_command_gap          prefix
validate_implementation_readiness <-> implementation_readiness    prefix
validate_pm7_gui_fixtures         <-> pm7_gui_fixtures            prefix
validate_wiring_matrix            <-> wiring_matrix               prefix
validate_touch_closure            <-> touch_closure               prefix
validate_audit_closure            <-> audit_closure               prefix
lint_contractrefs                 <-> support_refs                alias
```

`normalised_check` strips the prefix and consults a one-entry alias table.
**Two rows merge only when they come from different operations and their
denominators agree**: a merge that joined two genuinely different checks would
hide one of them from the disposition set, which is worse than leaving a
duplicate, so an alias whose counts disagree is not applied and the rows stay
separate under distinct keys. Each merged row records `merged_from` with both
original spellings and `normalised_check`, so a reviewer can see exactly what was
joined rather than trusting that something was.

On the recorded shapes: **18 ids → 10** (eight pairs plus `validate_new_contracts`
and `json_syntax`, which have no counterpart), and R7-A's **11 → 6**.

R7's second observation about this defect — the host re-ran the audit-closure
validator **twice** for the same rows, 15.8 s and 16.4 s, writing the same 396 KB
row file and the same 801 KB report under two ids — is fixed at both ends. The
merge removes the duplicate id, and `write_complete_rows` now caches by resolved
command so a duplicate that survives for any other reason is free rather than a
second 16-second run.

## R7-2 — a refusal that did not name what it was about. **Fixed.**

The frozen gate raises `explicit reasoned closure assertion over the bound census
required` for three different shapes and names none of them. R7-A shows the cost:
the model read it, concluded the assertion belonged somewhere other than the
preclosure declaration, **edited `declaration.json`**, and was refused again by
the preclosure digest check. Two refused finalizes, about eight minutes.

Two changes, neither touching the frozen validator:

* The client now sends `argument_paths` — which file each argument came from —
  because the host cannot name a file the model never told it about.
* `closure_assertion_gaps()` pre-checks the dispositions object and refuses with
  the field and the file: *"your --dispositions file `.pwflow/scratch/dispositions.json`
  is missing `repair_required_count` (an integer, 0 when nothing is left to
  repair). This is about the DISPOSITIONS file, not the declaration: the
  declaration must stay byte-identical to the one this measurement measured, and
  editing it will be refused."* It covers a missing or nonzero
  `repair_required_count`, a `checks_closed` without a `reason`, and the absence
  of either closure form.

The second half of the finding — a declaration repair tripping the preclosure
digest refusal — is answered in that refusal rather than by relaxing it. The
digest check is correct and must stay; what it lacked was the next step, so it
now ends: *"If you mean to change the declaration, that is a new measurement, not
a repair: measure again with the new declaration and finalize that measurement."*

This does not bite `plan_layer`, whose census is empty and whose finalize R7-B
had accepted first try; it is a `full19` cost.

## R7-3 — an empty-response stall reported only as `idle_limit`. **Fixed, and one thing proposed rather than done.**

R7-B's last four records were an empty assistant response, the runtime's single
`goal-continuation`, a second empty assistant response, and then **1,800 seconds
of nothing** until the harness SIGTERMed it. Those were the only two empty
responses in the run; R7-A had zero in 235. The model was mid-amendment with its
first seal already closed. Nothing in the harness was wrong — no refusal, no
dialog, drift `[]` — and the harness's only answer was a thirty-minute timeout
that cost the run its second seal and told a reviewer nothing.

`empty_assistant_responses()` finds assistant records carrying no content at all
and records each one's neighbour, so the `goal-continuation` between them is
visible. `empty_response_stall()` recognises the condition when **two or more
empty responses are the trailing assistant records and the session file has been
silent for 300 s** — a run that emitted one and carried on is untouched, and a
short silence is still a slow model. The run then ends immediately as
`EmptyResponseStall`, with:

* run status **`empty_response_stall`**, distinct from `incomplete`, so a
  reviewer does not have to open the records to learn the model stopped rather
  than ran out of clock;
* `evidence/empty-response-stall.json` with the trailing records, their ids and
  timestamps, what followed each one, and the measured silence; and
* `result['empty_responses']` on every run, so the healthy case is evidence too
  — R7-A's zero-in-235 is a recorded fact rather than an absence.

On R7-B's numbers that turns 47.5 minutes into about 20, and turns `idle_limit`
into a statement of what happened. The cause remains the runtime's or the
provider's; what changed is that the harness says so.

### Proposed, not implemented: one bounded continuation after an empty response

R7 suggests re-issuing the continuation as an alternative to ending the run. **I
have not implemented it, and my reading is that it is a retry, not a
measurement-preserving recovery.** The case each way:

*It is a retry.* The thing being measured is whether this model, on this packet,
reaches two seals inside its allowance without intervention. E-8 settled the
principle for a different cause — task E declined to type into a stuck pty on the
grounds that "a run that only completed because the operator typed into it is not
a run", and B5 kept that line. A host prompt after an empty response is the same
act with a nicer name: the run continues only because the harness pushed it, and
the resulting two-seal completion is not comparable with `b7-full19-002`'s, which
nobody pushed. The runtime already issues exactly one `goal-continuation` of its
own; a host one is a second, from outside the measured system.

*The argument the other way, stated fairly.* The continuation prompt is already
part of this transport for the amendment release (G-4), so the run is not
push-free today, and one bounded, recorded prompt is cheaper than losing a seal
to a provider hiccup. If the empty response is a provider artefact rather than a
model decision, ending the run measures the provider, not the candidate.

*What would make it acceptable, if the coordinator wants it.* A launch setting,
default off; **at most one** continuation per run; the prompt recorded in the
evidence exactly as `release-prompt.json` is; the run's status carrying
`continued_after_empty_response: true` permanently; and its figures excluded from
any comparison against runs that did not need it. Without all five it is a retry
wearing a policy. My recommendation is to leave it off and let the stall end the
run, because the evidence it now produces is enough to diagnose the cause, and a
run that needed a push is a different measurement from one that did not.

## Tests

`tests/test_known_defect_findings.py`, **21 new**: every recorded pair
normalising, the unpaired checks staying distinct, the 18→10 and 11→6 collapses
on the two recorded censuses, an alias whose denominators disagree refusing to
merge, two rows from one operation never merging, the duplicate validator run
reusing the first, five shapes of the closure-assertion refusal, the digest
refusal naming a new measurement, and R7-B's five-record tail recognised as a
stall while a healthy 235-response run is not.

**Tests: 532 passed, 0 failed (5 skipped)** across the direct-mode modules and
task N6's replay suite.

---

# B10 — the repair round

Agent: Claude Opus 5 (1M), 2026-09-17/18, from task F's adjudication of R7-A.
Full report: `reports/B10_REPAIR_ROUND_REPORT.md`. successor-11 only; R7-A's own
run directory untouched (the round works in a byte-for-byte copy of its sealed
workspace and a copy of its `run.git`); no credential printed; one candidate at a
time; nothing typed into a candidate at all.

## What was missing

R7-A's review adjudicated **UNACCEPTED** on one candidate-introduced blocking
finding and one unresolved acceptance obligation, and direct mode had nowhere to
put that. The canon's loop — `Bootstrap_Planning_Workflow.md`, PWIZ-006 and
PWIZ-011 — is audit, then a **separate** bounded repair over keyed findings with
`finding_level` and `repair_required`, then a re-audit covering the original
scope plus every impact row. Direct mode had the audit half only.

## The round — done

New `pwflow/repair_round.py`, one parameter on `host_seal.sandbox_runner`, one
launch block on the transport. The seal path itself is unchanged.

* **Selection and keys.** In scope: a finding whose `blocks_candidate_verdict`
  **or** `precludes_PASS` is true, and no other. `finding_key` is `sfk-` plus a
  digest over the finding family, subject, owner documents, detail keys, exact
  tokens and affected files — nothing positional, because the canon rules out
  keys derived from `audit_id`, row number or prose order. Four launch-time
  refusals: no blocking finding at all, and a finding with no citation, no
  affected file or no impact row.
* **The task.** `repair_task_text` carries the review's own statements and
  evidence, its citations with their quotes and the workspace path each package
  path maps to, the affected files, the impact rows, the bound — and the rule,
  verbatim: *Repair only what the finding names. Do not touch anything else. Then
  request the seal.* It lands at **`.pwflow/REPAIR_TASK.md`**, outside the
  measured tree, so the repaired revision differs from the reviewed one by the
  repair and by nothing the host wrote. A governed task path is refused.
* **The third seal.** `sandbox_runner(prior_sealed_revisions=N)` starts at
  `<prefix>-N+1`; the first accepted finalize is the (N+1)th, so the existing
  `commit_governed_tree` writes `revision-N+1` with the previous revision as its
  parent in the same bare repository. The transport seeds `release_state` from
  the reviewed run's own `host-release-NNN.json` records, and **inherits** the
  source map rather than rewriting it (`build_source_map` raises on a workspace
  that has drifted from its snapshot, which two seals of edits guarantee).
* **The re-review scope.** `reverse_support` (a file supports a changed path in
  reverse when its bytes name it) plus `affected_rows`, composing three origins:
  the findings' impact rows, the repair's own changed files — flagged when no
  finding named them — and the reverse support of those files. `review_packet`
  carries the record schema and the host tool byte-for-byte and separates the
  four attempt-bound host files as *carried for re-pointing* rather than claiming
  them unchanged.

**Tests: `tests/test_repair_round.py`, 61**, built from the R7-A shapes — the
adjudication's F1–F5 rows, the reviewer's sealed journal 00000032 and 00000063
citations, and R7-A's real commits. **215 direct-mode tests plus N6's 146 replay
tests, all green.**

## Four defects the live work found

* **B10-1** — the staging step wrote the new goal's objective into the
  **governed** `OBJECTIVE.txt`, which would have put a host-written change in the
  repair's own diff. `deliver` now snapshots the governed inventory around its
  writes, refuses if anything moved, and records the digest. Same class as B7-1.
* **B10-2** — rehearsed on R7-A's `revision-1` → `revision-2` pair, a **246-path**
  diff produced **73,554** reverse-support rows and would have packaged **3,586**
  files. `affected_rows` now records `scope_degenerate` with its threshold and
  reason.
* **B10-3** — a packet that does not say which model wrote which revision invites
  a reviewer to read a model difference as a finding. `review_packet` takes a
  `provenance` mapping and writes `public/review/PROVENANCE.json` with
  `same_model_across_revisions`.
* **B10-4** — the live repair edited **two** files and its commit diff listed
  **233**, because a seal regenerates shards, the plan index, `Spec_Lock` and the
  migration record on every run. `affected_rows` now takes `authored_paths`,
  resolved from the model's own `write`/`edit` tool calls with the dispatch
  guard's own `write_targets`; reverse support runs over the authored set, and a
  hit inside a generated tree is named rather than carried. **363 MB → 27 MB,
  3,586 → 93 public files.**

## The live runs — three launches, the third sealed

The first two, on `openrouter-union/stealth/union-alpha` at `xhigh` (the
configuration the brief named), produced **2 empty responses, 0 tool calls and 0
tokens** each and ended in ~5 minutes. The cause is the provider, verbatim from
each run's `runtime.000.raw.log`:

```
r7a-repair-001  2026-09-17 21:17Z   429  Rate limit exceeded: free-models-per-day-stealth.
                                         retry-after-ms=9777248
r7a-repair-002  2026-09-18 00:20Z   404  Thank you for participating in the Stealth Union Alpha
                                         testing period. This model was Unbiased's Pareto.
                                         Use it now: https://openrouter.ai/unbiased/pareto
```

**The model this effort measures on was withdrawn between the two launches**; a
route probe outside any candidate confirms it, and the published successor
`unbiased/pareto` answers **402 insufficient credits**. The coordinator then ruled
the repair onto the first documented fallback.

**`r7a-repair-003` — the round, exercised end to end.**
`opencode-go/deepseek-v4.1-flash` at `max`, no `custom_providers`, six tools,
`full19`, 7200 s, byte-identical task text (`7660ebbf…`), on a copy of R7-A's
sealed workspace and `run.git`.

| stage | |
|---|---|
| `measure` (`rrep-003`) issued / answered | t+5.0 min / **1,023.089 s**, `classification_pending`, `artifact_checks: pass`, nineteen operations, **6 failure rows** |
| `finalize` | **75.821 s**, `artifact_scope_closed`, **accepted first try, no refusal anywhere in the run** |
| commit **`revision-3`** | `a0739481f55cec6ce828aaeb029348b6180ebeee`, tree `a662c1f2…`, 6,846 governed files, parent `revision-2` |
| run | **`completed`**, **1,560.9 s (26.0 min)**, exit 0, Goal completed, 67 responses, 117 tool calls, **0 compactions**, `dispatch_violations []`, `repository_wide_operations []`, `empty_responses 0` |

`verify_release(expected_revisions=3)`: **verified**, three distinct commits, all
nine checks — the first three-revision chain in this effort and the first seal to
continue a chain another run started.

**The repair is exactly what the findings named.** F2: the fourteen-line orphan
`adapter_profile_audit_fidelity` block removed, **zero lines added** to the 152 KB
schema, fixtures untouched. F4: **two lines** added to `Plans/GitLab_Integration.md`
recording the obligation by error code with the root-owned remedy named, no
closure claimed. Two authored edits, both named by a finding,
`changed_paths_named_by_no_finding` empty, 32 scratch files and none in the
measured tree.

**Two earlier fixes confirmed live.** B9's R7-1: R7-A produced **11** failure ids
over 6 distinct checks, this run **6**, one per check — the normalisation
collapsing the duplicate spellings exactly as B9 predicted. B8's item 1: every
disposition names its complete on-disk rows — 1, 9, 32, 49, 1 and **1,469**, the
check whose aggregate reports 201.

**The measure took 1,023.1 s against R7-A's 1,040.0 s** on the same profile and
subject, 1.6 percent apart on different models — B8's "the seal is close to a
constant" holding across a model change. Nothing else in the two runs is
comparable: R7-A's 113 minutes covered a whole planning task and an amendment,
this run's 26 a two-finding repair.

## The review package

`…/candidate/baseline/r7a-repair-003/review-packet-001/` — 354 scope rows (4
finding impact rows, 2 repair-diff, 231 seal-derived named but not traversed, 117
reverse-support), **93 public files, 27 MB**, record schema and host tool carried
byte-for-byte with digests asserted, four attempt-bound host files carried for
re-pointing, and `public/review/PROVENANCE.json` recording
`same_model_across_revisions: false`. The release command is in the B10 report
§3. **The review was not run here.**

---

**Repair round implemented: yes**, `pwflow/repair_round.py` + `prior_sealed_revisions`
+ the transport's `repair_round` block, 68 tests, docs and `CHANGES.md`.
**revision-3 reached: yes** — `r7a-repair-003`, 26.0 min, commit `a0739481…`,
`verify_release` green over three revisions, produced by the ruled fallback model
rather than the one that wrote revisions 1 and 2, which the packet states in its
own bytes.
