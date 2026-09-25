# Process diagnosis bundle, 2026-09-25

`DIAGNOSIS.md` is the document. Everything under `evidence/` was copied from machines a GitHub-only reader cannot reach, so the document can be checked without them:

- `evidence/agent-usage-20260924.csv`: per-agent turns, output tokens, cache tokens and wall hours, computed from the coordinator session's agent transcripts on the VM. The first row is the Event Authority author agent; rows named review-* are the blind reviewers; unnamed rows are earlier agents of the same wave (reseal, baseline, storage repairs, other reviews).
- `evidence/reviews/<name>/`: the compact outputs of nine blind reviews (REVIEW.md, RECONCILIATION.md, RECHECK.md, findings.jsonl, rechecks.jsonl), copied from ~/PM-Experiments/<name>-20260924/ on the VM. Their logs, patches and repository exports were left behind.
- `evidence/REVIEWS_SUMMARY.md`: findings per review by severity, generated from those files.
- `evidence/TIMELINE.md`: the landings on main since 2026-09-23 with commit hashes, generated from git.
- `evidence/briefs/`: the two landing-check briefs and the open-items list written by the tool-owning thread (from /mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/), the blind-review form INSTRUCTIONS_REVIEWER.md, and the 2026-09-09 plain-language decision sheet that DL-036 came from.
- `evidence/low-cost-thread/`: the reports of the low-cost planning-process experiments (seal-path re-review F2, blind-review comparison N7, harness B11 and B12, landing GL, review calibration N2, seal reports D2 and D3, harness B), copied from ~/PM-Experiments/harness-latency-20260916/reports/.

Not copied, because it is large or lives only on the NAS: the raw evidence directories under /mnt/Cursor/PuppetMaster-Evidence/ (cited by path and SHA-256 in the landing records), the reviewers' repository exports, the Replan package sources (in the private repository sittingmongoose/PuppetMaster-Packages), and the git-ignored `Plans/.audits/` step list, whose ten steps are quoted in `reports/event-authority-20260911/step-09-procedure-20260924.md`.
