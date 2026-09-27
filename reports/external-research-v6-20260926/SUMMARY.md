# External research v6 — R0/R1 handback (TEST_ONLY_NEVER_PROMOTE)

Lab: `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/` (VM disk; no shared Git writes, no canon edits, no landings).
Window: R0 2026-09-26 21:04:59Z → R1 dispatch 21:24:17Z → all four slots frozen 23:37:53Z → evaluation done 2026-09-27 00:19Z.

## 1. Pins, change and commands

- Packet: `Puppet_Master_External_Research_Execution_v6.zip` sha256 `0c51871b…abca`; `verify_packet.py` PASS, 24/24 provider-free tests.
- Evidence pin: shapes checkpoint 007 at `21ec74bbca315bfb178eb4e463e63dd16f76ac65` (branch head unchanged). Its `unknown_usage_hold` is scoped to the Codex/Astra phase1 campaign; it is preserved, not cleared, and does not cover the Meta or Z.ai accounts.
- Input pin: shapes baseline `ome-zarr-thin` (case.json `cde07a94…`, catalog `32950592…`; 133 required files + 152 blobs re-verified). Candidate bundle `case_bundle/` (manifest in `frozen-policy.json`): 125 unique sources as S001..S125 with all 152 aliases; 61 single-line JSON captures given pretty-printed views (both arms).
- Implementation pin: `dev/frozen-code-prompts.sha256`, `frozen-policy.json` sha256 `5ec5df0b…`.
- Runtimes: Muse Code 1.4.0-R4161.1 (`muse serve`, MSP `goal/set`), `muse-spark-1.3-contributor`, effort `max` acknowledged. zcode official CLI 0.16.5 app-server (desktop 3.11.2 bundle; 0.16.9 lacks the provider-registry method), `builtin:zai-coding-plan/GLM-5.3-Flash`, thought level `max` verified, tools Read/Write/Edit/Grep/Glob. Reviewers: `claude -p --model claude-opus-5-5 --effort xhigh --restricted`, Claude Code 2.1.283; native `/goal` accepted ("Goal set").
- Existing carriers reused: the Sep-25 `muse_goal_driver.py` and `zcode_goal_driver.py` (copied verbatim, sha pinned), shapes role semantics (common/investigator/verifier) as file carriers, the shapes fixed reference and SCORING.md for evaluation.
- Observed bottleneck: in the four shapes traces, 425 source reads covered 123 unique contents; the fullest run made 272 reads of 64 contents (1.86 MB presented vs 0.72 MB unique), with 51 contents re-read across stages.
- Single variable: host-built, source-centred evidence bundle (every stage-1 cited line window ±8 lines, grouped by source, with a mechanical quote-match status) handed to the stage-2 verifier as its first view, instead of whole-source re-reads. Stage-1 prompt identical; stage-2 prompts differ only in one paragraph.
- Commands: `python3 tools/run_r1.py` (serial M-control, M-candidate, Z-candidate, Z-control) → `tools/run_arm.py` → `tools/run_goal.py --app muse|zcode`; post-hoc `tools/meter.py`, `tools/economics_table.py`, `tools/build_review_workspaces.py`, `tools/run_reviewer.py eval/REV-M eval/EVALUATOR_PROMPT.txt`.

## 2. Slot dispositions (all four delivered; none a quality pass)

| Slot | Stage 1 | Stage 2 | Designated final | Disposition |
|---|---|---|---|---|
| M-control | goal complete 440 s, 33 resp | goal complete 500 s, 38 resp | `runs/M-control/frozen/stage2/delivered.md` | FAILED_SEMANTICS (1 retained, 7 narrowed) |
| M-candidate | goal complete 307 s, 33 resp | goal complete 789 s, 29 resp (dispatched after a 1,786 s host fault wait) | `runs/M-candidate/frozen/stage2/delivered.md` | FAILED_SEMANTICS (3 retained, 5 narrowed) |
| Z-candidate | goal complete 1,784 s, 56 resp | goal complete 1,338 s, 39 resp (after a 790 s host fault wait) | `runs/Z-candidate/frozen/stage2/delivered.md` | FAILED_SEMANTICS (6 narrowed, 2 lost) |
| Z-control | goal complete 1,456 s, 50 resp | goal complete 1,397 s, 53 resp | `runs/Z-control/frozen/stage2/delivered.md` | FAILED_SEMANTICS (7 narrowed, 1 lost) |

Raw native logs are under `runs/<slot>/s1|s2/`: `muse-msp.jsonl` or `zcode-stdout.jsonl`, `muse-session.jsonl` or `zcode-model-io.jsonl`, `receipt.json` and `usage-events.jsonl`. Neutral upstream files are in `frozen/stage1/`, and the treatment input in `host-bundle/`. The tool audit found no web, shell or out-of-workspace calls in any stage.

## 3. Independent Opus 5.5 xhigh grades (blinded per pair; `eval/REV-*/out/grades.json`, `review.md`)

| Ref | M-control | M-candidate | Z-control | Z-candidate |
|---|---|---|---|---|
| C01 versioned admission | retained | retained | narrowed | narrowed |
| C02 axis identity | narrowed | narrowed | **lost** | narrowed |
| C03 declared pyramid | narrowed | narrowed | narrowed | narrowed |
| C04 composed calibration | narrowed | **retained** | narrowed | narrowed |
| C05 label association | narrowed | **retained** | narrowed | **lost** |
| C06 categorical labels | narrowed | narrowed | narrowed | **lost** |
| C07 chunk decoding | narrowed | narrowed | narrowed | narrowed |
| C08 absent vs failed | narrowed | narrowed | narrowed | narrowed |

Unassessable facets (not in the admitted corpus, charged to no one): C07.b reverse decode order and C08.a `fill_value` semantics (no Zarr v3 normative text); C06 64-bit precision only partly eligible. No contradicted reference; no reference adjudication needed.

- **Unsupported claims and false dismissals:**
  - M-control: 2 low, no false dismissal.
  - M-candidate: 3 low, including a false "unsupported" dismissal of AGAVE's TensorStore use; it read S072 but not S096.
  - Z-control: 5, including a moderate-low false "21.6 GB exists nowhere" (S034 L69–70).
  - Z-candidate: 4, including a **moderate** false "no terabyte size exists anywhere" (S034 L77–83, eight lines past its citation).
- **Novel supported findings:**
  - Muse control 12, candidate 15; they are complementary, not nested.
  - zcode: neither result dominates.
- **Handoff loss (largest quality lever):**
  - Both Z deliveries refer to draft obligations by ID ("P1–P13 verified", "§1 obligation list") instead of restating them, so near-complete upstream C02/C04/C05 material never reached the scored file.
  - In Muse, C04 order and C05 facets were acquired and then dropped at the plan-fit step (control).
  - The failed-read zero-fill facet was acquired upstream and dropped in delivery in three of four arms.
- **Missed by all four:** absent vs length-one axes, a missing declared level, label resampling and precision, per-array endianness, and failed-read zero-fill.
- **Decision burden:**
  - M-control: 3 blocking and 9 nonblocking, with several decisions silently settled.
  - M-candidate: 7 blocking and 4 nonblocking, none hidden.
  - Z-control: 3 blocking and 9 nonblocking.
  - Z-candidate: 2 blocking and 4 nonblocking, but it omits a real dtype decision, so the lower count is not a win.

## 4. Economics and timing (`ledger/r1-economics.md`, `ledger/r1-meter.json`)

- **Candidate lane:**
  - Parent responses: M 71 / 62 (control / candidate), Z 103 / 95.
  - Muse reminder-child calls (same model, tokens unexposed): 51 / 52.
  - Active arm spans: M 943 / 1,097 s, Z 2,853 / 3,122 s. Sum of active arm spans 8,015 s against the 14,400 s cap; 331 parent responses against 1,920.
  - Smokes: Muse 6 responses; zcode 5 plus 1 interrupted request.
- **Candidate/control ratios:**

| Metric | Muse | zcode |
|---|---:|---:|
| Stage-2 source reads | 0.54 | 0.13 |
| Stage-2 responses | 0.76 | 0.74 |
| Stage-2 span | 1.58 | 0.96 |
| Arm span | 1.16 | 1.09 |
| Arm uncached input | 0.87 | 0.90 |
| Arm output | 1.03 | 0.83 |

  No twofold saving: stage-1 variance under identical prompts (Muse 68 vs 40 observations) swamps the stage-2 effect.
- **Treatment defect (confounds the test):** the frozen quote matcher did not unescape `\"` or split on `...`. It marked 13 of 40 (Muse) and 72 of 79 (zcode) candidate quotes "not found". A corrected post-hoc diagnostic finds 36/40 and 31/79 at the cited lines, plus 21 elsewhere in the cited source (`ledger/quote-check-v2-diagnostic.json`).
- **Development lane:**
  - This Opus 5.5 xhigh thread: 183 responses, 50.4 M cache-read, 431 K cache-write, 159 K output.
  - No medium helpers used.
  - R0 took 19 m 10 s of its 45 min.
- **Evaluation lane:**
  - REV-M: 1,265 s, 60 responses / 104 turns, $9.50 list-equivalent.
  - REV-Z: 1,227 s, 73 responses / 120 turns, $9.88 list-equivalent.
  - Each reviewer used one native subagent for JSON validation.
  - Total 2,492 s against the 5,400 s cap.
- **Account windows (shared pools, not lane-attributable):**
  - Claude weekly 71% → 85%, 5-hour 2% → 55%, extra usage disabled.
  - Muse window 4% → 15%, weekly 11% → 14% (another thread was running two Muse sessions concurrently).
  - zcode exposes no quota readout.
  - List-equivalent values are not cash; subscription credit conversion is unknown.
- **Start to verified:** about 3 h 14 m, including 2 h 14 m of R1 wall time with two host-fault waits.

## 5. Failures, holds and unresolved evidence

1. **zcode 0.16.5** refuses `session/goal show` while a prompt runs (-32010). Smoke 1 was stopped by my wrapper (1 request, 0 completed); the fix polls `session/read`. The R0 smoke count was revised from 2 to 3 before dispatch.
2. **`run_arm` v1 host fault:** `copytree` kept the frozen stage-1 directory's read-only mode, so the bundle copy failed. Stage 2 of both candidate arms was dispatched later by v2 on the same frozen inputs; no model call was lost or retried, and the waits are recorded, not counted as active time.
3. **Treatment quote-matcher defect** (section 4).
4. **Muse skill-reminder child sessions:** about 45% extra model calls whose tokens are not exposed. Usage is therefore incomplete, with a count lower bound.
5. **Reviewer effort:** the `claude -p` stream init reports `effort: null`. xhigh was requested via the flag but is not confirmed by the stream. Also, `--restricted` still exposed WebSearch, Artifact, Docs and Task tools; only Read/Grep/Glob/Write/Edit and one validation subagent were used.
6. **Reviewer PENDING_HIGH_END_VERIFICATION** (listed in each review): sources left unopened, excerpt hashes not recomputed, no runtime evidence. The Z-candidate delivery's mention of `evidence-bundle.md` partly unblinded REV-Z.
7. **Case status:** familiar development case, fixed-source only (no discovery tested); one sample per cell.
8. **Incidental PM defects:** none (the case is a synthetic Slide Scout Plan).

## 6. Verdict

The bundle did what it mechanically targets: far fewer verifier source re-reads and about 25% fewer verifier responses. It produced no arm-level cost or latency saving and no consistent quality direction:

- Muse candidate: better on references (C04 and C05 retained).
- zcode candidate: worse (C05 and C06 lost).
- Both candidate verifiers issued a false negative-corpus dismissal. Z-control did too, so this is not unique to the treatment.

This needs a named repair before any expansion: fix the quote matcher, and remove stage-1 variance from the comparison. The dominant failing boundary is verifier delivery (handoff loss and unsearched absence claims), not source re-reading.

## 7. One next bounded step

R1b is a stage-2-only paired replay on the four frozen stage-1 packages: each package gets one control verifier and one corrected-bundle verifier, 8 fresh native assignments, same apps, models and Max effort. Protocol fixes apply to both arms:

- `delivered.md` must restate each carried proposition's text rather than point at draft IDs;
- any "absent from the corpus" or "unsupported" dismissal must cite a corpus search.

Only the corrected bundle varies. Then run two xhigh reviewers as in R1. This isolates the variable from stage-1 variance and tests the boundary that actually lost findings.
