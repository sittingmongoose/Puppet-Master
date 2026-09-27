# External research v6 — R0/R1 results bundle (TEST_ONLY_NEVER_PROMOTE)

This is the compact result of the v6 packet's R0/R1 slice: Muse Code (Muse 1.3 Contributor, Max) and zcode (GLM 5.3 Flash, Max), run through each app's native `/goal`, with independent Opus 5.5 xhigh evaluation. Nothing here is canon, a Plan edit or an approval. It is a reports-only branch and is not landed on `main`.

**Start with [SUMMARY.md](SUMMARY.md).** It holds the pins, the one variable, the slot dispositions, grades by reference, economics, failures, the verdict and the next bounded step.

## Layout

| Path | Contents |
|---|---|
| `SUMMARY.md` | The handback. |
| `frozen-policy.json` | Limits, runtimes, case, variable, schedule, acceptance, cache and account scope. Frozen before dispatch. |
| `prompts/` | Stage-1 investigator prompt (identical in both arms), stage-2 verifier prompts (control and candidate differ in one paragraph), and the evaluator prompt. |
| `tools/` | The harness: goal runner (`run_goal.py`), arm runner (`run_arm.py`, with the v2 resume path), schedulers, case-bundle builder, evidence-bundle builder (the treatment), audit, meter, economics, reviewer runner, and the copied Sep-25 Muse and zcode drivers (sha pinned in `dev/adapter-pins.sha256`). |
| `runs/<slot>/stage1/` | Frozen investigator outputs (`observations.md`, `draft.md`). These are neutral upstream evidence and earn no delivered credit. |
| `runs/<slot>/stage2/` | Frozen verifier outputs. `delivered.md` is the designated final, the only scored artifact; `checks.md` is the check log. |
| `runs/<slot>/host-bundle/` | Candidate arms only: the host-built evidence bundle the verifier received, and its mechanical quote check. The v1 quote matcher had false "not found" results; see SUMMARY section 4. |
| `runs/<slot>/receipts/` | Arm and stage receipts: model/effort receipts, native response counts, token usage, stop reasons, timings. |
| `eval/REV-M`, `eval/REV-Z` | Independent reviews (`review.md`, `grades.json`), reviewer receipts and input manifests. `eval/blind-map.json` reveals X1/X2 after grading: REV-M X1 = M-control, X2 = M-candidate; REV-Z X1 = Z-control, X2 = Z-candidate. |
| `ledger/` | Economics tables, per-stage meter with tool audit, timeline, account snapshots, quote-fidelity diagnostics, schedule logs (including the v1 host-fault traceback), and final hashes. |
| `dev/` | Packet verification log, adapter and code pins, and smoke-Goal receipts (including the failed zcode smoke 1). |

## Not in this bundle (on the VM, cited by path)

The lab root is `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/`.

- **Raw native logs:** per stage, `runs/<slot>/s1|s2/`: `muse-msp.jsonl`, `muse-session.jsonl`, `zcode-stdout.jsonl`, `zcode-model-io.jsonl`, `usage-events.jsonl`. Up to about 100 MB per stage.
- **Reviewer stream transcripts:** `eval/REV-M-stream.jsonl` and `eval/REV-Z-stream.jsonl`, about 3 MB each.
- **The candidate-visible case bundle:** `case_bundle/`, 6.7 MB of source views. Its manifest sha256 is in `frozen-policy.json`. The origin is the shapes baseline `ome-zarr-thin` (case.json sha256 `cde07a949a49232ceab84f9fa78c955345433369874097640a4dabf3b8f4d502`).
- **The evaluator-only key:** the OME subset of `/mnt/Cursor/PuppetMaster-Evidence/tests/research-shapes-20260920/phase1-20260921/evaluation/reference/fixed-reference.json`, sha256 `54fdca6a4aa9a6356da545a0c195c835557c2a8b1fe16feb9356d0d09a83fbde`. It is deliberately kept out of GitHub so it cannot drift into candidate inputs.

## Redaction

The Muse subscription tier identifier in the Muse stage receipts, `ledger/r1-meter.json` and the Muse smoke receipt is replaced with `<redacted-subscription-tier-id>`. Those files therefore differ byte-wise from the lab originals. Every other file is a byte copy. `SHA256SUMS` covers this bundle as committed.
