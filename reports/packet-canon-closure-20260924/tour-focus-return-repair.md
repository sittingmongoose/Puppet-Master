# Guided Tour focus-return contract repair

Finding: TOUR-CANON-003. The current workspace chapter can open the Usage page;
that retained page identity does not restore the retired Usage-first chapter.
The request and current heading vocabulary require
`guided_tour.workspace.heading`, while the result and two fixtures still forced
`guided_tour.usage.heading`, which is not a current chapter heading.

The result now agrees with the request and current owner heading contract.
`ui.guided_tour.focus_route`, the Usage page target, the v1 result identity,
no domain mutation and no persistence remain unchanged. One negative fixture
rejects the retired heading. The new regression covers applied, disabled and
failed outcomes; it reproduced three failures before the schema repair.

Verification: all 20 Tour tests and 22 adjacent Onboarding-resume/Settings-transfer
tests pass. The shard check passes (99 documents, 2,721 shards). The complete
new-contract report passes 31 pairs, 1,067 positive and 3,493 negative cases with
zero findings. Independent source adjudication and post-repair review passed.

Evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`

| File under evidence root | SHA-256 |
| --- | --- |
| `server_forge_backup/guided-tour-focus-return-independent-review.json` | `808f7f2c27b226b8578ff02942e938ee43ba951217b84fc7fac946fdbcdc41d0` |
| `server_forge_backup/guided-tour-focus-return-postrepair-review.json` | `15a613830752c665e1018c78c9821ea058150c1af0f2302fa5df62568b3d1edd` |
| `tour-focus-repair-verification.json` | `4d4f1f1ef5a2851646c45e0769e4dd1d913157f6ff6392a6c249b57b2afa5651` |
| `tour-focus-new-contracts-report.json` | `fa1c9e66345bb0bfe9dcd55b827209b51f61eae624e9931ea99873fc16284aec` |

This is a static contract repair, not browser/native focus execution. The concept
emitter still uses the predecessor heading and remains a separate GUI residual.
Seven missing nonterminal Tour outcome contracts, stale shared outcome profile
bindings and pending physical checkpoint registration remain open. No owner
Markdown, command registration, storage shape or governance binding was changed.
Main landing and its locked aggregate checks remain separate.
