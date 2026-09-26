# Checkpoint command/permission-class join

Status: bounded static repair; native authorization and execution remain unproved.

The existing Source Control permission decision now binds checkpoint create
and restore to the existing mutate class, and checkpoint inspect to the existing
inspect class. The existing enum, three command identities, ordinary request
permission/FileSafe references and handler bindings remain unchanged. This
implements the current SCS-008/SCS-009 read-versus-mutation distinction, not a
new permission policy or handler admission.

Three single-cause negative fixtures swap only the permission class. Six focused
tests prove the valid pairs pass, swapped classes fail, restoring only the class
recovers the original valid fixture, and the surrounding bindings are retained.

## Frozen source

Directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/scm-checkpoint-permission-join-01/`.

- `COORDINATOR-INCOMPLETE.patch`: SHA-256 `8e490de2c3e7e4537a9f0464d212369a98537d0aba475b3a3fb713a9b21bc73e`.
- `COORDINATOR-INCOMPLETE-FREEZE.md`: SHA-256 `2012ecb1fd656e31ab5237f938f3b4523681eba617478815376e60daff0ca424`.
- Schema SHA-256: `2bcfb90aff74a8e1faeb5aa72a2ab0d2c5a5d13472ba6e45d4ccb8ab80e0ac9e`.
- Fixture SHA-256: `35d70d8a62034fff3838c356abe603d73f368f1599b0d51506ac58db12493d44`.
- Focused test SHA-256: `9c788e9f92b9165cf5a54df172e08a5ad9fbaa91002dfc975b2e2f5c3a6ef7ea`.
- `REVIEW-DIFFERENT-SOL.md`, independent static acceptance: SHA-256 `b0b1911c4ee1f32084c494706f93239c54f2db6b9a03930d668c479d4ec67c23`.

These are coordinator-packaged candidate files from the requested native Muse
Goal, not an author completion receipt. The author had not delivered its own
patch/report at freeze. No native Goal completion is inferred.

## Root verification

The first local application matched a repeated JSON context at the wrong
location. Six class-swap assertions exposed the error and the schema hash did
not match the frozen candidate. Root cancelled that wrong-tree aggregate with
exit 143; it is not a verification result. A full-context application then
produced all three exact frozen file hashes, and all six focused tests passed.
The frozen candidate was not changed to accommodate the application mistake.

The corrected full `python3 scripts/pm-new-contracts-verify.py` run passed:
81 contract pairs, 1,561/1,561 positive cases, 4,747/4,747 negatives rejected,
12/12 self-tests, no failures or findings. Independent review also confirmed
all 123 old negative fixtures are preserved alongside the three new negatives.

No Touch disposition, native availability, owner Markdown, generated index,
governance seal or main state changes follow from this static join.
