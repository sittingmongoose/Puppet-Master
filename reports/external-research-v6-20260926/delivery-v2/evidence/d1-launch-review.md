# D1 bounded launch integration review

Status: no unresolved defect found in the reviewed launch paths after the three narrow parent fixes below. This is offline host integration evidence, not native protocol proof, a semantic grade, or qualification of a real evaluator launch.

Requested reviewer role: GPT-6 Sol / high. Independently observable effective reviewer model/effort: unavailable. No native Goal, app/model/account call, external research, source/key grading, repair/retry, or frozen-file change was made during this review. Ownership was limited to the new test and this note; parent owns the runner.

Final command: `python3 -m unittest discover -s delivery-v2/tools -p test_run_delivery_check.py -v`. Result: **16/16 passed**, 0.251 seconds. Parent separately reports the aggregate 52-test suite passing; that aggregate is not claimed as this reviewer’s independent test run.

The tests use the real delivery Store and existing `run_r1b.classify`, while replacing `subprocess.Popen` with a synthetic process. Four synthetic submissions exercise the actual byte-snapshot/current/history/feedback path. Authorization/refusal tests cover absent/false/truthy authority, wrong first app, expired phase, an outstanding dispatch, consumed slots, freeze rejection, and two slots maximum. Both captured argv vectors point to the actual pinned `tools/r1b/run_goal_r1b.py`, with `--max-seconds 300 --max-responses 48`; its actual bytes match the runner’s DRIVER_SHA. Z receives the supported `--zcode-tools Read Write Edit`. The existing `copy_native_logs(app, receipt, destination)` three-argument interface is exercised, without session-log inputs or native accounts.

Failure tests preserve precedence: nonzero native exit and driver error dominate a success-shaped receipt; quota stops the schedule; a capped first slot can only be followed by the original second slot. Native completion without submissions cannot pass structurally. Launch failure, malformed receipt, structural-check exception, native-log-copy exception, and process-group disappearance during cleanup produce terminal harness-failure accounting without retry.

Parent fixes reviewed before the final passing run:

- The Z argv originally inherited Grep/Glob from the existing driver default despite the narrower D1 task; the explicit supported tools argument now matches the task (`run_delivery_check.py:102`).
- Native receipt parsing/copy/structural checks originally escaped terminal accounting on errors; the postprocessing block now records harness failure and closes the schedule (`run_delivery_check.py:144`).
- A process-group disappearance during cleanup originally escaped before result/state writes; kill/wait exceptions now remain visible and reach terminal accounting (`run_delivery_check.py:125`). The regression reproduced the earlier escape and passes against the final fix.

Limits: tests replace `verify_freeze` with a trusted synthetic acceptance/rejection stub. They do not independently validate the final D1 FREEZE manifest or its publication; the actual operator must verify that pin before dispatch. Tests validate argv, host state and failure behavior, not actual native tool routing, live time enforcement, quota/headroom, or model settings. Muse exposes a broader existing native built-in catalogue; shell is disabled by the reused wrapper, and the narrower task remains a prompt restriction. Actual native reads/writes, successful payload-before-marker order, receipt reads, workspace boundaries, and Goal control/progress must be audited from the original two D1 traces after dispatch. No real process-group operation occurs in the tests.

The finite-state guard assumes the trusted operator retains the same declared run root/state for this D1 schedule. It is not a general persistent authorization service, proof of user authority inferred from files, or protection against a host supplying a different root. The real user’s small synthetic-per-app approval does not authorize formal evaluation. The prospective evaluator composer remains uninvoked for real runs. I1 and R1b remain frozen.

Reviewed file identities (absolute root: `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926`):

| File | SHA-256 |
| --- | --- |
| delivery-v2/tools/run_delivery_check.py | 9684d41027ebb32f67473531e652c783fae377256f8f44b9eb2ebb651d96da23 |
| delivery-v2/tools/test_run_delivery_check.py | 45f0b90c1f1127b4cddf83636edb902836b74b51a8a7893aac9d2decfbcabf6e |
| delivery-v2/tools/delivery_store.py | 81364fd1a4040ba457dd04779d096709c3524bee8704a2c8f453fb18264c85c7 |
| delivery-v2/prompts/delivery-check.txt | dfad7d3275a4d2cd68f578ea241cae55e8303ca140927851b14c9b18b2b1e56a |
| tools/r1b/run_goal_r1b.py | 4cfd7aee946cd8db9ef70a0adf2cfe8279a5cdc13cb3c8b7cd299775dee97ae7 |
| tools/run_goal.py | 7325ed95a89767b377de49dbe27bf2f1af989ee04521ff8f7e92a560fb367d5b |
| tools/r1b/run_r1b.py | a0694ff3d865497e3c7c511d752a5ad4c7e1b3136783fcfffec4e4ab8daf9a9d |
| tools/run_arm.py | 330ae90097254192bf95fd52ebee4cdda0a9d19325bc3c4c88bde6ad4b4d4520 |

Recorded UTC: 2026-09-28T01:51:19.015555+00:00
