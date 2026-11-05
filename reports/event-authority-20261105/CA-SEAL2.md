# CA-SEAL2 — stopped design and decision-return record

**STOPPED BEFORE IMPLEMENTATION under lane Do item 2.** Worker CA-SEAL2 (Codex), stream E, VM, 2026-11-05. Branch `plans/ea-seal-check-recount-20261105` is based on CA-SEAL `17c842445a2623bb0334ba8d6932e7a6bf088967`. This result adds only this report, `CA-SEAL2-DESIGN.md`, and compact `CA-SEAL2-inspection.json` under `reports/event-authority-20261105/`.

## Exact stopped question

> Must the final Event Authority approval require the existing August checks and complete per-name outcomes for the separately frozen 249-name recount to pass together, or may runs certify one explicitly selected snapshot separately? If separate snapshot certifications are allowed, which certification or combination is required for final approval, and how must each result identify its scope?

The lane's exact instruction is: "If the design needs a choice the 9.b text does not give (for example which list a given seal run certifies, or whether both must pass), stop and write the exact question." The approved item 9.b permits consuming the new input and preserves existing conditions. Its words do not explicitly settle the selection/aggregation rule. This worker does not choose that rule, turn a source-integrity check into approval, or supply an owner answer. The design records the approved option A and its Sources line verbatim, the current one-result validator predicates, and the alternative claims that would result from different selections.

## Design in five lines

1. **Selection:** return the exact scope question before choosing a default, selector or combined final-pass condition.
2. **Custody:** bind the frozen recount receipt/list and recompute every named fingerprint against the correct frozen source.
3. **Separation:** retain August's list and source pins independently; reject mixed membership/fingerprint snapshots.
4. **Receipt:** a completed change must pin validator before/after, DL-451, recount receipt/list and author/actual lander, stating the exact delta and preserved conditions.
5. **Conditions:** preserve per-name decisions, complete records, all twelve depth criteria and every other approval condition; no new authority is created.

## What changed and what did not

**Changed:** a stopped design, this report and static inspection evidence. **Validator before and after SHA-256:** `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91` on both sides.

No validator/spec change, fourth-change implementation receipt, authority section pin or executable recount path was produced. The record here describes a stopped design only. No earlier receipt, August list/fingerprint/freeze digest, existing record, registry, `.gitignore`, `Plans/Spec_Lock.json`, `Plans/.evidence/**` or `Plans/auto_decisions.jsonl` was edited. No definition-writing, admission, registration, app recording, governance seal, landing, main push, mailbox operation or subagent was performed.

## Inputs inspected and verified limits

The lane and shared brief, Jared's answer and as-presented item 9.b, CA-COUNT's `REPORT.md`, structured `NEW-LIST.json` and `RECEIPT.json` at `c53e4199ae94ca853a197354f3f9e7f296cf1efc`, the CA-COUNT review set, the current CA-SEAL FIX8/B′ contract and review set, the validator/spec at the prescribed base, repository instructions and both named memory files supplied the design context. Current final-review conclusions were read directly; historical review findings were inspected for their scope and preservation requirements. `CA-SEAL2-inspection.json` inventories the exact external reference hashes. No inherited review result is represented as this worker's fresh execution.

| Input | Verified fact |
|---|---|
| As-presented E-CARDS-2 | SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`; option A and Sources line match the design verbatim. |
| Frozen recount list | SHA-256 `2515ae5af31178a7d7a93581e982977bfb803d4494d779c72bebad9e7700376c`; 249,684 bytes; 249 sorted unique names; buckets b=51, c=18, d=32, e=148; all outside August and the then-live registry. |
| Frozen recount receipt | SHA-256 `1d0ef48f472f2a6c521c6879e4c0b6ab0da98467dfe5b1a7546b3dbcef09a709`; 350,509 bytes; list pins agree; `closure_claim=false`; 597 declared input fingerprints. |
| Recount source revision | `16acf7594a3fe8559af89491b895f440b314b99e`, distinct from any later live tree. |
| CA-SEAL base and live validator | Base commit and unchanged executable byte hash match the lane exactly. |
| Protected/source paths | `git diff --exit-code 17c842445a2623bb0334ba8d6932e7a6bf088967 -- Plans scripts tests .gitignore`: exit 0. |

The inspection parses the complete list and receipt strictly, verifies the exact frozen byte pins, list structure and cross-references, and checks this branch's source-path diff. It does **not** reverify all 597 source fingerprints, reproduce the recount, exercise a new validator path, or prove any approval result. Source custody remains future implementation/test work after the scope answer.

## Tests and checks

| Check | Result |
|---|---|
| External `drafts/CA-SEAL2/inspect.py` | Exit 0; all static assertions above pass. This is an input inspection, not an implemented validator test. |
| `git diff --check` | Exit 0; repeated on the staged three-file result before commit. |
| Positive: frozen recount verifies in the changed validator | **NOT RUN** — stopped before implementation. |
| Positive: August verifies its own snapshot in the changed validator | **NOT RUN** — stopped before implementation. |
| Negatives: changed list byte; changed source; missing fingerprint; mismatched fingerprint; mixed snapshot; wrong validator in receipt; stale DL-451 pin | **NOT RUN, each** — no changed validator or new receipt exists. No all-pass claim. |
| FIX8 parsing regressions: duplicate keys, non-finite numbers, BOM, trailing data, wrong types | **NOT RUN against new code** — no new code exists; preserve them on resumption. |
| Shard/index regeneration and validation | Not run; no Plans/source/spec edit or generated artifact change. |
| Full gates, governance, migration, landing checks | Not run; no landing or governance work is authorized. |

The recurring Astra defect classes and check-11 guard isolation are future implementation/review obligations, not passes earned by a reports-only stopped design. No test file was added or edited.

## Receipt anchor, landing order and exclusions

**New Spec Lock entry template: none.** No fourth-change receipt exists to anchor, so inventing its final path/hash or filling a DL-451 section pin now would overstate implementation. The lane permits a template once needed for a completed change. The unchanged third amendment's exact DL-412 template remains in CA-SEAL's report and must be supplied by `claude-projects-refresh` after its actual lander fills that receipt.

After the scope answer and successful implementation/review, assemble CA-SEAL before CA-SEAL2 in the same final E landing, after their decision dependencies. Preserve the third receipt bytes while linking its after-hash to the fourth change's before-hash. The actual lander fills each authorized new receipt; `claude-projects-refresh` computes any required final byte anchors for the same landing. Sol/Astra review before and after remains required. This result grants no go to merge the unfilled preparation stack.

The seal-applier exclusion includes author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through CA-SEAL-FIX8, CA-SEAL2 (Codex), and every other fix worker. Existing receipts' checked lists stay untouched.

## Delivery and resources

The branch is pushed only to `refs/heads/plans/ea-seal-check-recount-20261105`. The design, report, compact inspection and read-only inspection source are retained in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/`, with `DELIVERY.json` recording the pushed head and cleanup. The prescribed sparse worktree is removed by literal path after the push; the remote branch remains for review/resumption.

Before worktree creation, `df -BG /` reported **79 GB available** and `free -g` reported **17 GB available**. Later samples showed **16 GB available**. Checkers ran sequentially. No under-6-GB sample occurred; no pause/resume was needed. No browser, server or temporary runtime worktree was started.

**Families / grades / new bindings / new IDs:** none / not applicable / none / none. **Open item:** the exact certification-scope question, then all implementation, receipt, validator tests and independent reviews. This is a stopped design, not completion of the fourth amendment.
