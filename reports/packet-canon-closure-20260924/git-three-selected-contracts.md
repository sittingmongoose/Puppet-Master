# Git selected-input contracts: three existing actions

2026-09-25, based on repair commit `9734e86ca00a22ce345aff632c599eff07d256f9`.

Adopts closed original/result/selected-effect contracts for `cmd.git.commit`,
`cmd.source_control.stash.create`, and `cmd.source_control.branch.create` only.
SCS-003 prose was applied before companion enrollment. Existing native
RepositoryContext, writer lease and operation receipt shapes are reused, not
widened. The neutral nineteen-command enum is unchanged. Pull and stash-apply
typed preview contents remain unresolved; branch deletion is not admitted.

The new effect observation is explicitly new adapter output, not a preexisting
receipt or authorization grant. Request/result transport and durable observation
have separate storage dispositions. All prior disposition rows, 294 physical
families and retention policies are unchanged. Physical observation/original
custody remains pending; this does not establish restart, replay or backup
closure. No native Git effect, Permissions authentication, event, new physical
store or GUI implementation is claimed.

The central gate now contains 47 exact pairs / 43 distinct schemas. Fixture
composition invokes actual original/result/receipt/effect joins. Bare runtime
result dispatch is structural only; the generic UI response original/outcome/
caller adapter remains a separate open integration at this checkpoint. This
limitation is explicit in SCS-003, not hidden by fixture success.

Verification: 21 focused Git tests and 9 manifest tests pass. Reviewed companion
bytes match their frozen hashes. Shard generation/check passes: 99 documents,
2,746 shards; changed roots are only storage_value_registry and ui_command_catalog.
Index generation passes: 6,733 PlanUnits, 26,432 acceptance units. Index validation
does NOT pass against the concurrently advanced origin/main
`cd46487bf03ab5723d9dc19d5e8c0dc956bbcb75`: it reports ten newer Decision_Log units
DL-084 through DL-093 absent from this older branch, plus twenty legacy decision
record-format findings reached by that retention check. A direct HEAD/current/
origin comparison proves zero PlanUnit additions/removals in this step and the
same ten-unit difference before it. No Decision_Log or ledger was edited. Rebase
and complete validation remain required before landing; this is not an exception
or a claim that current-main additions may be removed.

Full contract gate PASS: 47 pairs, 1,308 positive cases accepted, all 4,417
negative cases rejected, 12 self-tests passed, zero findings. Complete output:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/git-three-integrated-gate-001/stdout`,
SHA-256 `cf331afc02ab15549a17c219561783f2c8bb1f04ef1238048d3deefb436d0eed`.
This is the contract fixture gate, not the three repository-wide landing checks.

Evidence (external paths plus SHA-256):

- `/mnt/Cursor/PM-Experiments/git-selected-three-20260925-BauBJ1/independent-final-cycle2.md`: `bfdb2c631dee1e5efba55126710a68872a07a50d850295a2815e3c5fcc328e25`.
- `/mnt/Cursor/PM-Experiments/git-selected-three-20260925-BauBJ1/integration.apply_patch`: `575da5785ba4e0063ed82e41685b7738129f705a0e290fe0b72e24a244001ca9`.
- `/mnt/Cursor/PM-Experiments/git-selected-three-20260925-BauBJ1/integration-scope-proof.json`: `c67609dd9d04da229ba787c26dbff81470957986be85bac1cdf10ecb6a4d2c4d`.

No main fetch, lock, checkout mutation or push was performed. No governance
binding was refreshed. The earlier full-delta landing hold remains separate.
