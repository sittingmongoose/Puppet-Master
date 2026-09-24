# Goal handoff static join repair

GRS-047 already requires exact Goal/GoalRun/Project/source/Host identities, currentness and caller return. The existing round-trip schema annotations did not execute those joins, and the family was absent from the closed aggregate contract manifest. This repair enrolls exactly one pair (32 total), adds narrowly routed joins and causal fixtures, and preserves unavailable native handlers.

The six command round trips now join command, operation, command instance, Goal, GoalRun, Project, source location and current Host, all three same-named expected-generation echoes, and the complete five-field return context. Resume also joins payload.current_host_id to request.current_host_id. No comparison is invented between output.resulting_generation and independent Goal/topology/source/caller generations.

Six matching round-trip positives and 86 negatives are added: all 84 original mismatches plus two Resume Host cases. The existing wrong-focus negative now uses a valid return generation and fails for the semantic mismatch. The pack has 27 positives and 95 negatives (87 semantic, eight structural). Existing positive records and other negative records are unchanged.

Enrolling the family exposed its noncanonical `$id` hostname. Only `puppet-master.local` becomes `puppetmaster.local`; the path, runtime schema IDs and all definitions remain unchanged. Exact-URI search found no inbound reference in Plans/scripts/tests. The existing hostname gate is not relaxed.

Verification: seven focused tests, nine Forge manifest tests and six adjacent Doctor join tests pass. The full contract gate passes 32 pairs, 1,095 positives, 3,600 negatives and 12 internal self-tests with zero findings. Shard verification passes 99 documents / 2,721 shards. This is not a full landing aggregate or readiness clearance.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `goal-handoff-join-probe.json`, SHA-256 `44c61a47f07578d0257d0f195386a7c0e50fd2080f7d961e7a0d96eda468e24a`: all 84 frozen mismatches admitted.
- `server_forge_backup/goal-handoff-join-authority-review.json`, SHA-256 `9d064740bc9fe994cd6361f39f841e5ea7612bdb50642ea1d0fc3aff8cfe6f79`: independent owner-authority review.
- `server_forge_backup/goal-handoff-join-postrepair-review.json`, SHA-256 `f9e82512e1ba95451a392311d20c4f74c630baf7d9194bf3e27814f1c5b89c11`: independent fresh 84-case probe and causal/positive checks before URI-only correction.
- `goal-handoff-new-contracts-report.json`, SHA-256 `65cbc076f3ded644c95fad1b4ca1097d47421c995a691ce0387718f2a4192311`: initial full run, only two hostname findings.
- `goal-handoff-new-contracts-final-report.json`, SHA-256 `079faefc1aa70c5d00f9604fd35a72d6f8c78c952329e5108f89dcc69119c0b6`: final full passing report.
- `touch_closure/goal-handoff-edges-014.json`, SHA-256 `b68c2d4e608029d52eaf87b2258a2fe18d3942dbcaec17776b093c7246de37f8`: frozen 91-dimension review; forward repairs do not rewrite it.

Remaining: adjudicated output-generation ordering, local details refusal/return joins, exact durable journal custody/recovery mapping, native dispatch/restart/race/security and five-consumer GUI evidence. No governance binding, baseline, readiness artifact, storage registration or owner prose is refreshed. No main landing or expansion of the earlier three-file landing exception is implied.
