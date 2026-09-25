# Five packet card answers — 2026-09-25

Status: answers recorded; owner reconciliation and implementation pending.

Jared explicitly submitted all five responses through the card page. A subsequent widget-state notification described only a draft; it did not retract the explicit submission. Jared then directly amended Card 4 in conversation. Both original submission and subsequent amendment are retained verbatim in separate files; the amendment is not rewritten as a synthetic form answer.

## Immutable sources

- Frozen Markdown: `reports/packet-canon-closure-20260924/product-choice-cards-20260925.md`, SHA-256 `82a728706e6224c115e068fdf389ef6fb8285f7a109b136b264b66402d5cee1f`.
- Matching presentation: `reports/packet-canon-closure-20260924/product-choice-cards-20260925.html`, SHA-256 `c24c583126e4c53b79f25b04b4767fcda211171f4d913bcefc63f63e3be93533`.
- Verbatim submission: `/mnt/Cursor/PuppetMaster-Evidence/packet-canon-closure-20260924/decision-card-answers-20260925/ANSWERS.md`, SHA-256 `306c011b5fd8a810839e98751147e3ed543b206e04a38bf4e893a79132c345a6`.
- Verbatim subsequent instruction: `/mnt/Cursor/PuppetMaster-Evidence/packet-canon-closure-20260924/decision-card-answers-20260925/ANSWERS-CARD4-AMENDMENT.md`, SHA-256 `6a44a2fe542bbeab8b9d78d51ac7dd09d905c80ae35bc69e7e5d10d45e3e1ba2`.

The answers files preserve the submitted text, each with a final newline. No frozen card content or status is edited after presentation. The original queued status belongs to that immutable presentation, not to the current response state.

## Recorded choices

| Card | Decision | Selected policy |
| --- | --- | --- |
| Personal dictionary | DL-094 | Share between installations belonging to the same user; define the sharing boundary before enabling. |
| Settings Replace | DL-095 | Reset missing eligible ordinary settings only within the chosen scope, showing every reset in preview. |
| Stash apply | DL-096 | Explicit choice: files only or files plus saved staged selections; retain the stash. |
| Review checkout | DL-097 | Also permit explicitly chosen current workspace after existing safety preview; preserve local work. |
| Usage Ledger | DL-098 | Approve the frozen bounded filter/search/sort/export proposal. |

Card 4's later instruction is exactly: “for card 4 Also allow an explicitly chosen current-workspace checkout after the existing safety preview.” It replaces the original Approve selection of separate-workspace-only behavior. The record keeps both the original response and the subsequent explicit instruction; it does not falsely attribute the words “Deny with changes” to Jared for this amendment.

DL-094 through DL-098 were the next free IDs after the current shared checkout and locally available origin/main both ended at DL-093. The repair branch previously ended at DL-083; entries DL-084–093 belong to newer main and were not copied or overwritten. Recheck collisions and preserve those entries on the eventual current-main rebase.

Each decision appears in both prose and PlanUnit sections, with frozen-card and answer SourceRefs. Every response row pins the frozen card hash; Card 4 additionally pins the amendment. Dictionary identity/access/synchronization policy is not invented, and sharing stays disabled pending its boundary. No owner implementation, native behavior, full packet closure, WorkNode, governance seal or main landing is claimed.

## Verification

Frozen card hashes and all five response mappings pass checks against the exact source files. Assertions verify both sections, YAML parsing, exact answers and amendment, selected options, SourceRef hashes, no WorkNodes, and unchanged frozen cards. Independent fidelity review found only missing zero padding in the JSONL authority references; all five now point to the exact DL-094–098 IDs and the mapping assertions pass.

Shard generation and check PASS: 99 documents, 2,760 shards. Only `Plans/_shards/decision_log/` changed. Index generation PASS: 6,739 PlanUnits and 26,493 acceptance units. The exact ID delta from pre-edit HEAD adds only DL-094–098 and removes none. All 80 changed existing PlanUnit index rows belong to Decision Log, with source hash/location changes rather than changes to other owners.

The final post-generation index validation is NOT green: it reports 20 `plan_unit_removal_ledger_invalid` findings on unchanged existing ledger files and 14 `plan_unit_removed_without_ledger_decision` findings against newer origin/main units absent from this unreconciled repair branch. Those 14 (ATS-058, CV-353, DL-084–093, OSI-438, SP-320) were also absent in the pre-edit HEAD index; this step removed none. The completed index has no stale-generated-artifact or live-ID mismatch finding. An initial validation overlapped generation and read the old index; that transient output is superseded by the completed post-generation validation above. Preserve newer main entries during eventual locked rebase; do not fabricate ledger decisions to waive these findings.

Only Decision Log is a canonical owner edit in this step; other owned changes are compact reports and frozen presentation files. No governance binding or baseline is refreshed. Full aggregate gates and main landing were not rerun or claimed successful for this answer-recording step.

Final independent recording review PASS after the reference correction: `/mnt/Cursor/PM-Experiments/packet-card-answers-review-20260925.md`, SHA-256 `2f0597d9eebf7c28ee522c18b67f1729e02cd3e887d174d55b8b72350c1b87ec`. This is a fidelity review of decision recording, not owner/runtime integration certification.
