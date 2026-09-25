# Reviewed repository re-encryption ACT119 companion

The exact cmd.backup.recovery_key.reencrypt successor is integrated on the repair
branch. It composes the complete existing command authority with explicit
new_destination_refs and preview_ref, one selected source repository/revision and
full-tuple immutable history. The reviewed target map distinguishes intended new
repositories from actual created records. Authentic new-domain engine evidence
and content/dependency verification are required; different IDs, password rotation
or equal/unequal ciphertext hashes are not cryptographic proof.

Actual created RecoverySet membership and destination associations equal the
known-created reviewed target map, including multiple reviewed destinations sharing
a repository. Partial verified copies remain visible when another history member
or target is unavailable. Failed/cancelled results retain actual effects; unknown
effects require original-operation reconciliation. Historical protected admission
must be authenticated within the original session lifetime, while later closure
does not erase those effects or grant fresh admission. Native current disclosure
remains independently required. No old-copy deletion, key retirement, source-policy
rebinding or automatic saved/tested Recovery Kit claim is introduced.

Cycle 1 found unreviewed created-membership additions were accepted and later
session expiry incorrectly blocked retained effect disclosure. One correction
batch fixed both. Final cycle 2 independently passed all 44 tests:
`/mnt/Cursor/PM-Experiments/backup-reencrypt-owner-20260925/INDEPENDENT-REVIEW-FINAL.md`,
SHA-256 `b4317400c50344dfa614341e2b08ba356867414edebc6e02c734189699b8b7ad`.
Corrected handoff SHA-256
`d381d0fee3504470bcc3ad907d38ad1608183d6f16838856581d70396821955a`.
That independent harness used actual central source pinned to daf81ad31; root then
installed the byte-exact four semantic files and reran all 44 against the actual
current central code, preserving ACT118 and every prior hook. Owner prose was
installed first in BRS-018 and SIR-042. No third review or native proof is claimed.

Only catalog.backup_recovery_key_reencrypt changes among 1,142 wiring rows. The
two current Backup unions add this successor and preserve all eleven prior
successors, all 41 historical decoders and 29 legacy current commands. Existing
consumer assertions retain those exact memberships rather than dynamic counts.
Touch remains byte-identical at 644 rows / 143 profiles. Five dispositions cover
nine runtime kinds: transport and safe error projection are nonpersisted; original
dispatch, review and redacted native-effect metadata have explicit pending durable
custody. Totals: 116 dispositions, 53 physical-family pending, one external-store
pending, 58 nonpersisted and four existing-family. All prior 111 dispositions and
294 physical families/policies are unchanged; the real registry schema retains
exactly its prior Usage v2 versus v1-only disposition-ID finding.
Full metadata comparison and reviewed semantic hashes:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/backup-reencrypt-metadata-001/stdout`,
SHA-256 `62542755ea655a3d7c20443abe342ebc43774a467762927c1a68caba2da90c27`.

All 322 installed Backup tests pass, including 44 re-encryption semantic and four
new binding tests. Twelve common UI and nine manifest tests also pass. The complete
contract gate passes with 65 pairs / 61 unique schemas and zero findings:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/backup-reencrypt-integrated-gate-001/stdout`,
SHA-256 `e9966fc524bdf2de369b0ef0beb4bd7024d51f7ef729ffffa31d20213a2c35bf`.
Shards
generate/check pass: 99 documents / 2,755 shards. Index generation passes with
6,734 unchanged PlanUnit IDs / 26,470 acceptance units. Only configured Commands,
Shared Integration Runtime and storage-registry shard roots change. Full Touch
returns the same single pre-existing Settings registry hash drift:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/backup-reencrypt-touch-001/stdout`,
SHA-256 `5721cb81e833d08d81d8c57cbdfa3e753e1f018d15ace59894e50c09cbf1fa68`.

Native cryptography, protected-input/Permissions authentication, actual engine
execution, physical custody and GUI remain unbuilt. No availability/event change,
governance binding refresh, main aggregate delta, main landing, WorkNode/NodeSeed
or whole-packet closure is claimed. Restore preview and remaining finite queue
items are separate; newer protected assistant-related designs remain unchanged.
