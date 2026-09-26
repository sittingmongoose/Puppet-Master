# LSP selected restart companion — bounded integration

Status: integrated on repair branch; full aggregate check running; not landed.

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
- Full `run-gates` started with complete report destination
  `ROOT-RUN-GATES-F8CB-LSP.json` in the external evidence directory; its result
  remains pending and is not represented as passing.

The native author turn timed out; no native Goal-completion receipt is claimed.
Static trusted-original fixtures do not authenticate issuer custody or recompute
digest content. Actual LSP restart, runtime permissions/effects, physical custody
and GUI behavior remain unproved implementation obligations. This is not whole
LSP, packet, governance, or landing completion.
