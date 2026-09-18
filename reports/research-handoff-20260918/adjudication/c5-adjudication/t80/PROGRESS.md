# T80 adjudication — progress

Opus 5 agent (`claude-opus-5[1m]`), adjudicator. Ran no arm. Continuation 5, third arm scored.

1. **Brief and method re-read.** `BRIEF_ADJUDICATE_NEW_ARMS_20260916.md`; continuation-3 union
   (`comparison.json`, sha256 `c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b`,
   110 findings) and `symmetric-adjudication.json`'s four rejected expansions. Standing addition
   carried from continuation 5: every code-fact assertion verified against the pinned source in the
   arm's cache before credit, with the verification recorded with source lines.
2. **Manifest verified three ways** — recomputed from sorted rows, matched the runner's quoted
   `b5498edb9f39ef4e444a109362c6233d1e1e7af0b5021436c9679facc33c448b`, and an independent tree
   re-hash. 13,222 files, zero differing. No monitor-heartbeat race (the fix I recommended after
   glm53 held).
3. **Designed stop confirmed before scoring.** `campaign-terminal.json`: `Stop:
   admitted_attempt_cap`. Attempt boundary recorded precisely — the coordinator's `472b5e5eaa…` is
   the archive *directory's* manifest; the archived run tree's own output manifest is `7b8c1ad075…`.
4. **Job table rebuilt from durable state.** All runner figures confirmed: 12 jobs, 8 finished, 3 at
   exactly 80 receipts, 1 timeout; responses 41–80; 11 of 12 wrote `notes.md`; 25 deliveries; 11 of
   88 leads compared; $76.4527 captured; `J0028` the only accounting-incomplete job.
5. **Input equivalence checked job by job.** J0017–J0025 carry identical lead sets to claude-hicap;
   the three compare groups are the same, paired to different job numbers. This is what makes the
   comparison one-variable.
6. **Code facts verified** against pinned jj-lib 0.44.0 in the arm's cache: V-T1 (`resolve_op_heads`
   no-merge branch still writes markers at 146–151, before the resolver at 155), V-T2
   (`update_op_heads` doc), V-T3 (`save_in` Blake2b512 content-addressed segment names). V-P1 and
   V-P5 re-checked from the Arm P adjudication.
7. **Every delivered assertion read** — `workspace/notes.md` and `workspace/leads/*.md` from the 11
   jobs that wrote them. Inherited frozen premium jobs excluded as arm output; locator inventories
   excluded as assertion sources.
8. **Scored 26/110 (23.64%)** — 1 correction, 1 optional capability, 0 product choice, 24 unsupported
   or already-covered; 5 partials recorded separately. Seven credits earned in turn-capped jobs.
9. **Decomposition built** by attributing each of the 20 findings lost against claude-hicap to the
   job that should have produced it: 2 ceiling, 8 job-time-limit, 2 capped-but-confounded, 8 from
   jobs that hit no limit at all. The last is the **variance floor**.
10. **Four out-of-union candidates** recorded with assertion, passages cited, my classification and
    an explicit continuation-3 rejection check. None added to the union; C5T-03's apply-route half
    flagged as adjacent to the declined conflict-editor cluster.
11. **Written** to this directory with `../t80-manifest.json`; bundle extended on
    `research/jj-c5-adjudication-20260917` with the four-arm table. Pushed. **Not landed.**
