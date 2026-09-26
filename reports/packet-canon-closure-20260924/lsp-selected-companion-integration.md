# LSP selected restart companion — bounded integration

Status: integrated on repair branch; aggregate failures recorded; not landed.

All seven integrated files match the reviewed carry byte-for-byte. External
evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/lsp-restart-companion-01/`.

- Carry manifest `ROOT-CARRY-48089-MANIFEST.md`, SHA-256
  `ffa879eda6cce17d9dfbfa39eec0cc399c2311ded8671c770397a3edeaec3fdc`.
- Different-Sol review `REVIEW-SOL-V4B.md`, SHA-256
  `93e791c791d9ef726bc0b5fe5554184a965483799b10fa48f79bc4a9d9f00c64`.
- Frozen candidate receipt `coordinator-freeze-v4b/COORDINATOR-FREEZE.md`, SHA-256
  `242964ec86f664652fe80c5044a0fd879edb657bea3b47b4614a02ec478b7acb`.

The companion binds the selected server and full original request, including
reason and recovery operation, to the independently retained static original.
Replay can change only the submitted command-instance identity. Central response
and outcome shape validation uses the real owner schemas, not reduced mirrors.
Wiring and TCP-LSP now reference the selected request/result/receipt contracts;
the standard aggregate checks enroll the dedicated validator. Handler availability
and expected event policy are unchanged. No Markdown owner or governance binding
was changed, and no shard regeneration was required.

Current-root verification on 2026-09-26:

- Eight focused tests pass.
- Root replay of the independent fixed-original probe rejects all eight
  request-reason/recovery and outcome-payload/frame mutations as expected.
- `validate-lsp-restart-selected` passes with no failures.
- `validate-wiring-matrix` passes.
- Shard check passes: 99 documents, 2,766 shards.
- Touch closure reports only the previously recorded Settings disposition-registry
  hash drift (expected `10e1ffd1062a9a3aebd5c418acc7289fb5bb3d0261ef08edc65a461a47685632`,
  actual `43e215863fc05d2d2bc1bd863cbaca64042e167af6331e99eac3122a6b68e866`).
- Full `run-gates` finished with failure at 2026-09-26 05:50:51 UTC. Complete
  report `ROOT-RUN-GATES-F8CB-LSP.json` in the external evidence directory has
  SHA-256 `e718a2cdcf18f4c6dd85c51c65c70ead40cad52e416b138bf9ef21550a491f84`.
  LSP, Wiring and shards pass within that run. Failing checks include unresolved
  raw capture paths, governance/evidence/readiness/migration staleness, planning
  runtime local references, four sound-validator Touch census mismatches,
  the known Settings drift, and audit-index resolution outside this worktree.
  These are not claimed to be all pre-existing or all authorized exceptions:
  the later full main/branch failure-key comparison remains required.
- The aggregate's new-contract check timed out after 180 seconds. Its standalone
  rerun with a 900-second limit passed: 85 contract pairs, 1,652 positive cases,
  4,903 rejected negative cases and 12 internal self-tests; no failures/findings.
  `ROOT-NEW-CONTRACTS-2321.json` has SHA-256
  `557f3b984ea06c6b85439c841b2904af5a89a6b3cdc51d6c176d81f7954f1356`.
  This resolves that timeout only, not the aggregate's other failures; LSP is
  checked by its separate enrolled validator, not added to these 85 pairs.

The native author turn timed out; no native Goal-completion receipt is claimed.
Static trusted-original fixtures do not authenticate issuer custody or recompute
digest content. Actual LSP restart, runtime permissions/effects, physical custody
and GUI behavior remain unproved implementation obligations. This is not whole
LSP, packet, governance, or landing completion.
