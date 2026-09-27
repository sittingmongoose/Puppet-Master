# R1b Block 1 results (TEST_ONLY_NEVER_PROMOTE)

- **Launch:** from rev3 `e0ba81ef0d`, frozen policy `b5a2e48a…`. `r1b/APPROVAL.json` recorded the user's go ("All now, usage will be fine") and the technical sign-off (APPROVED_FOR_BLOCK_1). Preflight passed: policy, approval, 27 pinned hashes and exact corpus membership.
- **Schedule:** serial, 06:05:47Z to 07:35:41Z, then two reviews 07:36:06Z to 08:19:29Z. Block 2 was not run. No investigator reruns and no retries.

## Slot dispositions (all four terminal `goal_complete`)

| Slot | Package | App / model / effort | Goal span s | Responses | Decisions (129 or 107 blocks) |
|---|---|---|---:|---:|---|
| R1b-M-P1-control | M-control stage 1 | Muse Code 1.4.0 / muse-spark-1.3-contributor / max | 912 | 40 parent + 31 reminder-child | confirm 72, qualify 10, not_a_claim 47 |
| R1b-M-P1-candidate | M-control stage 1 | same | 1,144 | 37 + 31 | confirm 78, qualify 10, unresolved 6, not_a_claim 35 |
| R1b-Z-P1-candidate | Z-candidate stage 1 | zcode CLI 0.16.5 / GLM-5.3-Flash / max | 1,606 | 54 | confirm 78, qualify 6, not_a_claim 23 |
| R1b-Z-P1-control | Z-candidate stage 1 | same | 1,727 | 60 | confirm 68, qualify 5, not_a_claim 34 |

- **Decision coverage:** every block has an authoritative decision; no conflict or incomplete record occurred.
- **`complete: false`:** set in all four only because each `decisions.md` has a title line outside any entry (`carrier_defects: 1`). No block is affected.
- **Tool audit:** no web or shell use. One zcode Read (Z candidate) opened zcode's own spilled tool-output file under `~/.zcode/cli/artifacts/<session>/`. That is the app's native large-output mechanism, recorded here but not treated as case or evaluator access.

## Independent Opus 5.5 reviews (blinded per pair, then unblinded)

- **Runs:** REV-M took 1,327 s and REV-Z 1,275 s, with 67 responses each. Both `COMPLETED`, with host-validated JSON.
- **Effort:** xhigh was requested via `--effort`; the stream-reported effort is `null`, so effective effort is unconfirmed.
- **Blinding:** the leak scan found the Muse candidate's verifier text naming `stage1/evidence-bundle.md` (kept as is; partial unblinding of REV-M).

| Ref | M-control | M-candidate | Z-control | Z-candidate |
|---|---|---|---|---|
| C01 | retained | retained | retained | retained |
| C02 | narrowed | narrowed | narrowed | narrowed |
| C03 | narrowed | narrowed | narrowed | **retained** |
| C04 | narrowed | narrowed | narrowed | narrowed |
| C05 | narrowed | narrowed | narrowed | **retained** |
| C06 | narrowed | narrowed | narrowed | narrowed |
| C07 | narrowed | narrowed | narrowed | narrowed |
| C08 | narrowed | narrowed | narrowed | narrowed |

No reference was lost or contradicted.

**Unsupported and false dismissals.**
- **M-control:** 8 unsupported claims, all low or low-moderate. One false dismissal (low-moderate): it said the corpus never states napari's transform combination, but S048 L260-291 does.
- **M-candidate:** 11 unsupported claims, including a moderate-low string-typed `"3"` MUST and a silently approved first-well plate-label constraint. No false dismissal.
- **Z-control:** 4 unsupported claims, including a wrong November 2024 provenance date (low-moderate).
- **Z-candidate:** 6 unsupported claims, including a **moderate false "no 1 TB dataset anywhere in the corpus"** (S034 L77-79). This is the same fact that R1's zcode verifiers dismissed. It also voided the dtype whitelist in S096 L25-28 (low-moderate).

**Verifier defect under the new delivery protocol.** The draft's standalone "distinguishing validation idea" blocks were marked `not_a_claim` in three of four arms:
- M-control: 8 lost.
- M-candidate: 10 lost.
- Z-control: all 12 lost (rated high; this narrowed C03, C04 and C05).
- Z-candidate kept all 12.

The prompt already said `not_a_claim` is bookkeeping only; the verifiers misapplied it anyway.

**Shared misses** (acquisition gaps upstream, so not fixable at the verifier stage):
- absent vs length-one axes;
- missing pyramid level;
- label resampling and 64-bit precision;
- endianness and transpose;
- zero-filled failed reads;
- `source.image` linkage;
- reader-side writes.

## Economics (verifier stage only; candidate / control)

| Metric | Muse | zcode |
|---|---:|---:|
| Goal span | 1,144 / 912 s (1.25×) | 1,606 / 1,727 s (0.93×) |
| Parent responses | 37 / 40 | 54 / 60 |
| Muse reminder-child calls (tokens not exposed) | 31 / 31 | n/a |
| Source read calls | 24 / 55 (0.44×) | 14 / 118 (0.12×) |
| Tool-result bytes delivered to the model | not exposed | 525,233 / 472,055 (1.11×) |
| Host bundle (serialized) | 114,386 B | 482,826 B |
| Uncached input tokens | 209,346 / 189,326 (1.11×) | 252,617 / 222,140 (1.14×) |
| Output tokens (reasoning) | 47,336 (24,817) / 35,084 (13,949) | 70,446 / 72,793 |

**Lane totals.**
- **Evaluation:** REV-M $9.44 and REV-Z $9.29 list-equivalent (not cash); Opus 5.5 output 138 K and 134 K tokens, including 73 K and 72 K thinking.
- **Orchestration since the R1 handback** (this thread, including all three prep revisions): 99 responses, 58.6 M cache-read, 1.37 M cache-write and 204 K output tokens.
- **Claude account:** the weekly window read 99% at go and 9% after the reviews. That is a shared pool, so the reading cannot be attributed to this lane.

## Stop rule applied (predeclared)

Block 1 produced one consequential false dismissal (Z-candidate, S034 1 TB) and material loss of confirmed upstream content (validation ideas lost to `not_a_claim` in three arms). There were no harness faults. **Stop: Block 2 is not bought.**

## What this establishes

- **The evidence-bundle first view** cuts verifier source-read calls sharply (0.44× and 0.12×) but not time, tokens or the bytes delivered to the model. Muse was 25% slower; zcode was 7% faster with 11% more tool-result bytes and 14% more uncached input. Quality moved in opposite directions per app and neither result dominates. It does not merit expansion as an efficiency lever.
- **Shared delivery protocol (observational, not a matched test).** On the zcode package, R1's old-protocol verifier had lost C05 and C06 and retained nothing. Under R1b's block-decision assembly, neither arm lost a reference and the candidate retained three. The graders, projection and sessions differ across rounds, so this is a signal, not a causal result.
- **Remaining narrowing** is mostly upstream acquisition gaps shared by every arm. Verifier-stage changes cannot recover facts the investigator never acquired.

## Named repairs (offline, before any further paid run)

1. **Proposition-level segmentation.** Keep a finding heading and its field bullets (validation idea, disposition, consequence) as one block, so a verifier cannot orphan the validation idea with `not_a_claim`. Also reject `not_a_claim` for a block that carries a disposition or validation field.
2. **Absence guard covering replacements.** Any replacement or reason asserting corpus absence ("not stated anywhere", "no in-corpus source", "not in evidence") must use `basis: absence` with `searched`. Otherwise it is not authoritative.

Beyond these repairs, the next informative experiment is at the investigator stage, not the verifier stage.
