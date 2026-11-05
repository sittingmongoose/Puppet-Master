# CA-DL: E-CARDS-1 approved answers

Branch: `plans/ea-cards1-answers-20261104`. Base: `8724fcea67936ca08d55de237f55c2745eed459e` (`origin/plans/ea-s09-decisions-hb-scope-20261104`). Implementation worker: CA-DL. This report describes the commit containing it; the pushed head is delivered in the worker’s final response.

## Recorded entries

| ID | Title |
|---|---|
| DL-401 | Retention assignments for the surviving candidate names |
| DL-402 | Monthly summary and prune archive memories only |
| DL-403 | Memory maintenance waits for approved cutoffs |
| DL-404 | Collaborative run records live as long as their chat |
| DL-405 | Manual Browser sessions name their workspace without duplicate history |
| DL-406 | Stop uses one request event and a saved run or turn outcome |
| DL-407 | Memory changes use one complete state-change contract |
| DL-408 | Every Settings change uses settings.layer.changed |
| DL-409 | DL-079 stands in both scopes for three historical Goal events |
| DL-410 | Recount today’s event names without changing the frozen seal check |
| DL-411 | Technical-binding permission covers exactly the 35 listed names |
| DL-412 | Third recorded seal-check change accepts truthful multi-family steps |
| DL-413 | Batch 1 may add exactly two test-file gitignore lines |
| DL-414 | All event rows must be finalized under DL-039 |

DL-401 through DL-413 preserve Jared’s verbatim answer, "approve all except 4c B", the source thread `1338d738-7bb4-47b2-852e-38a876cb8521` at `2026-11-04T19:14:49Z`, the presented-cards SHA-256, and each approved option’s exact text. DL-401 includes every G01–G29 table row, the retention legend and existing-answer boundary. DL-411 includes the exact 35-name list and permission terms. DL-412 records B as pm7-build’s suggestion to Jared, with the relayed reading attributed to that coordinator: only the third recorded check change is approved, each family still needs its own record, and the same before and after reviews apply. No other check change is approved.

DL-414 records the later same-day answer, "all of them, we are getting close to building soon so it all needs to be finalized." Its source is the same thread, relayed by pm7-build; no precise timestamp was supplied. The coordinator’s reading closes the first-build-only option and applies DL-039’s one-outcome requirement to every row. The earlier as-presented wording remains historical.

Every new entry has a `### DL-NNN:` prose heading readable by the frozen validator’s `decision_section_bytes`, and a corresponding accepted PlanUnit. Coordinator readings are explicitly distinguished from Jared’s words. Supersession boundaries include SP-351’s app-scope collaborative one-year rule (DL-404), DL-041’s Settings naming answer (DL-408), confirmation of DL-079 in both scopes (DL-409), and the new recount’s unresolved frozen-check consequence (DL-410).

DL-300’s existing heading changes from `### DL-300 -` to `### DL-300:` only. Its complete recorded answer and PlanUnit bytes after that heading are unchanged. No new answer is assigned to it.

## ID allocation and scope

Fetched origin before editing. All 508 origin refs were inspected by their `Plans/Decision_Log.md` blobs (63 unique versions): no occurrence of DL-401 through DL-413. Fetched again after the lead’s addition and inspected all 508 refs / 63 versions for DL-414: no occurrence. IDs used: DL-401–DL-414 only.

Memory: 21 GiB available; disk: 114 GB available before worktree creation. Used the requested sparse worktree `/home/sittingmongoose/pm-worktrees/ca-dl`, with Plans, scripts, reports and tests. Copied all 15 ignored currentness-edition files from the shared checkout and compared each SHA-256 before index generation.

Only `Plans/Decision_Log.md`, its generated `Plans/_shards/decision_log/**` files, the six generated `Plans/.plan_index/**` files and this report change. The generated index’s changed existing PlanUnits all belong to Decision_Log.md; no other owner document’s shards changed. No owner contract, registry, frozen validator, Spec Lock, `.evidence`, `.gitignore`, or `auto_decisions.jsonl` edits; no pm-mail, subagents, admissions, seal or landing. No family depth grade applies to this decision-record-only lane.

## Verification

| Check | Exit | Result |
|---|---:|---|
| Shard generation | 0 | Decision Log derivatives only |
| Plan index generation, final run | 0 | Top-level `status=pass`, coverage pass |
| Shard check | 0 | Pass |
| Plan index validation | 0 | Top-level `status=pass` |
| Frozen extraction, exact approved options, pins and DL-300 preservation | 0 | All 15 prose entries readable; all 29 retention rows and each selected option match |
| `git diff --check` | 0 | Pass |

The initial index-generation run exited 1 because DL-408 listed DL-041 as a PlanUnit dependency, but DL-041 exists only as prose. Removed that indexed dependency while preserving the explicit DL-041 supersession in prose and canonical text; final generation passes. Runtime certification remains incomplete (`blocked_runtime_certification_incomplete`); this lane grants no readiness or seal.

Pins confirmed unchanged:

- DL-077: `b93a7d768eb301b81ce0eaa38345f0f49ff9b3d74b76e721418d6d2dce2d67d4`.
- DL-094: `e8e2404f028e426c6e69572ab848eae668ea095baf7389b3ae21ba85f151587f`.

## Evidence

Raw sources and check outputs stay outside the repository. Evidence path and SHA-256:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/BRIEF-DRAFT.md` — `cdff32b5bae2fd75cd6439e695c25b9ef9517f618f21b7a8ae2d4a3353857660`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CARDS1-APPLY.md` — `f3f553370a89a6fc0467dedde8a5ed71169cc7e4b36f2c0be32ee2475b924104`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-1_20261104.md` — `00bb608e8126b1c39fab29c347737404cf4b6352d3d75b0b3b7b3d1820600386`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md` — `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL/shard-generate.log` — `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL/index-generate.json` — `dcd3ead61dedb3b84184e6118fe7b6d0bcaf30993055cb78915cb6e845a01712`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL/shard-check.log` — `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL/entry-verification.log` — `cc274347332c3dea7bf53dcf7e580ce8608d192aa8a4251e76c5fcc2581059e7`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL/index-validate.json` — `7abea309085e76408d08e96b77a7e4f088a3656edd3906e4225ca5dd50cc3413`.

## Remaining work

None in this lane after push and worktree removal. The approved owner changes, registry checkpoints, third seal-check change, test allowlist commit, and reviews belong to their assigned workers and batch integration. Governance is not refreshed by this branch.
