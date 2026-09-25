# Reconciliation: blind findings against the author's report

I wrote `findings.jsonl` before reading anything the author wrote about the work. It holds 18 findings: 0 blocking,
1 should_fix and 17 notes, with verdict `fix_then_land` (sha256 `a34fd5b436f2d5ebf7df20ef392b5f030d24b70a16e34d2df6050618d5d96723`).
I have not edited it since. The author's report was read afterwards. It consists of:

- `~/PM-Experiments/landing-check-exports-20260924/PROGRESS.md`, steps 0 to 11;
- the messages of the four commits;
- the landing-record draft `landing-record-draft.md`, a template with placeholders.

The report the brief asks for is written only after the landing. I also checked the author's recorded evidence under
`/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-check-exports-20260924/`.

## Where the report and the blind findings agree

| Finding | What the report says | Reconciled |
|---|---|---|
| X-01 enumeration | Steps 1 and 2: every command's `--report` is the complete list the aggregate counts, except `validate-audit-closure` (`errors[:200]`). "No called validator slices its failure list (grep of all 18 scripts)". The nested caps inside one row do not change counts. 36 run-gates subchecks, 33 audit-governance subchecks, 36 commands. | Agree. My sweep covered all 67 `scripts/*.py` and found the same. |
| X-06 interpretation (coordinator's item 6) | Step 1: "export only a subcheck truncated now whose baseline copy is complete". Step 8 raises "the baseline-completeness interpretation" with the coordinator. | Agree that it is sound. The probes add that it is necessary in both directions: without it, I6a is a false pass and I6b a false block. |
| X-14 tests | 153 OK, 15 new. All 15 fail on the script at bc1d99c11e, and the 138 existing tests pass on both. | Agree. I reproduced each count. |
| X-04 replays | The six kind-1 runs are identical. The exact b3169c48d9 replay exits 0 before and after, equal to the recorded run. The exact rules landing replay gives 2/4, with evidence and plan-graph as `baseline_sample`. | Agree. The author's recorded `replay-94ea73cfee/replay.txt` (SHA256SUMS OK) is byte-identical to my rerun's. The report's "baseline_sample" shows it knows these replays never reach the keyed path. X-04 says so explicitly. |
| X-05 fixture | Before exit 2, after exit 1 (132 staleness, 1 pre-existing), negative exit 2 with 4 blocking, mismatch exit 2 with the reason. | Agree. My independent end-to-end harness (real CLI, real `run_export`, the real fixture file) gives the same results. |
| X-18 real runs | Steps 10 and 11. run1 against the committed baseline: exit 1, nothing keyed, the PRD contracts a baseline sample. run2 record: the PRD contracts keyed (1240), 14 export buckets. run3: exit 0, "1240 pre-existing", unkeyed failures 2582 -> 252. | Agree. My own run on a full checkout of the tip in my clone reproduced run2 and run3 exactly (14 export buckets, 1240 pre-existing, 252 unkeyed). |
| README timings | plan-graph 13 s, evidence 12 s, PRD contracts 0.6 s (step 2) or 0.5 s (step 7). | Agree: 12.4/15.8 s, 12.3/12.1 s and 0.7 s. |
| X-15 rule text, X-16 scope | Steps 5 and 6: byte-identical bullet; the commits as listed. The draft says "none of its five paths has a Spec Lock entry". | Agree. I checked the draft's claim: `Plans/Spec_Lock.json` at the tip has 94 entries and none of the five paths (`logs/spec_lock_paths.txt`). |

The report's first line, "Rule text section: NOT authorized", is superseded by its step at about 22:35Z, which says
the change was authorized on Jared's request as relayed by the coordinator. The message of 2614ef579f says the same.
This conflicts with nothing in the bytes.

## Where they differ

- **X-07.** The README gives a reason for the baseline-sample fallback: complete rows compared with a sample "would
  read every pre-existing failure outside the sample as grown". The probe shows that, as the code stands, the
  baseline side would keep such a subcheck partial, so nothing would read as grown. Instead, pre-existing rows on a
  touched file past the cap would block, and a rise elsewhere would go unjudged. The conclusion, to fall back, is the
  same; the explanation is not.
- **X-13.** The README says audit-closure keeps the truncated rule "as a baseline sample" until the refresh. The code
  prints it as "no complete export", and so does the author's own live run1, and it keeps that fallback after the
  refresh.
- **X-08.** The report treats the baseline condition as an interpretation to flag to the coordinator. The rule
  sentence, verbatim from the brief, does not carry it. I agree that it could not change on this branch, and I record
  it as an open question.

## Not in the report

- **X-09 (should_fix).** A keyed subcheck can pass falsely when the export's rows differ from the printed rows at an
  equal total. The README's "What this leaves open" states the limit ("the rows are not compared one by one"). The
  report does not assess what that limit lets through.
  - E3 shows it: the tip exits 1 where the base exits 2 on a printed failure, not staleness, on a touched file.
  - The real validators are deterministic: six commands under two hash seeds gave identical rows. In the real record
    and compare runs, the printed rows were exactly the export's first rows. So a containment guard costs nothing in
    a normal run.
  - I applied that guard in `patched/`. There, 154 tests pass, and the new E3 test fails on the tip. Every scenario
    is unchanged except E3, which now exits 2. The author's replay gives identical results for patched and tip.
  - The guard adds a fallback case the brief does not list, so the coordinator decides.
- **X-10.** The L-07 pairing still reads a keyed audit-governance twin's printed count. E1a and E1b exit 2 with a false
  reason. It is latent: nothing in baseline 792d2fb8b1 can trigger it.
- **X-11.** A keyed readiness rise is labelled as the growth counter. This affects the display only.
- **X-12.** Keying exposes 260 staleness rows on regenerated shards of the edited documents. The advice then says to
  report them to Jared. The advice logic is unchanged since b3169c48d9.
