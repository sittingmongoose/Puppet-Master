# Backup bounded discovery and browse contracts

ACT092 and ACT099 now have exact selected-input, source/page/continuation,
read-receipt, original-dispatch and shared-response composition. This is static
specification and validation, not native Backup implementation.

The existing two commands bind actual destination/generation/prefix or immutable
snapshot/path selection. Continuation resolves the actual prior page; missing
source is not empty success. A completed page need not exhaust the listing.
Partial/unavailable/failed pages retain failure evidence; cancellation preserves
its reason. No async acceptance, no-op, verification or recovery is inferred.
Browse reuses actual immutable source checks without fabricating a verify action.

BackupReadProjectionReceipt is explicitly new and distinct from capture,
verification and restore receipts. The SIR original binding preserves the authentic
full identity, arguments, dispatch and caller. The actual shared response helper
invokes owner checks; independent source/receipt/authentication/current-disclosure
adapters are mandatory, and late input mutation is rejected. Static adapters do
not implement native authentication, cursor issuance or source custody.

Only catalog.backup_browse and catalog.backup_destination_discover change request,
result and read-receipt bindings. All 41 IDs, handlers and no-event dispositions
remain; the other 39 routes are unchanged. Current discriminated unions admit four
earlier action successors, two read successors and 35 legacy shapes. Historical
v1 decoding remains intact; Touch Closure's existing union pointers need no edit.

Four logical storage dispositions cover nonpersisted transport/page and two
pending original/receipt records. All previous rows and all 294 physical families
are unchanged. The 68 dispositions now contain 27 physical-pending, one external
store-pending, 36 nonpersisted and four existing-family rows. No physical writer,
retention interval, cursor store or governance binding is admitted.

Independent review PASS, cycle 1:
`/mnt/Cursor/PM-Experiments/backup-bounded-read-proposal-20260925-8uW2Et/INDEPENDENT-REVIEW.md`,
SHA-256 `6530c47a671ea979c842b33a3e7b0a1e8f7fc62ca162a25fdee51610b1f63e58`.
Reviewed handoff SHA-256
`b4998060012725acd2eb2e3821fad46170f2a516b8567833e73a2ce6a6bf64ab` in the same directory.
Installed source files initially matched the reviewed hashes exactly. The first
full gate passed every positive/negative case but found missing aggregate schema
identity metadata; root added the fixture's already-declared x-schema-id to the
schema and a metadata regression assertion. No runtime shape or behavior changed.
That first run is preserved as backup-bounded-read-integrated-gate-001 under the
packet-audit evidence root, stdout SHA-256
`a419efa2ee1260160f389bbe7e040e1edf55f6957e313707300cf2a39a53cea7`.
An extra blank line
after each patch marker was removed to apply the detached central diff; resulting
central and extracted snapshot helper hashes equal the reviewed candidate copies.

Installed checks PASS: 25 new read tests, 12 historical snapshot tests, 12 existing
UI-response tests, three consumer-binding tests, five prior action-input tests and
nine manifest tests. Consumer tests distinguish current read admission from v1
historical decoding and forbid substituted capture/restore receipt binding.
Full contract gate PASS: 51 pairs / 47 unique schemas, 1,328 positive cases,
4,435 negative cases rejected, 12 internal self-tests and zero findings. Complete
capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/backup-bounded-read-integrated-gate-002/stdout`,
SHA-256 `e8562a905ea8670efb87bad34dee10170aa4d6d54ffd4bd54b207d56bd714f0a`.
Shard generation/check PASS: 99 documents / 2,748 shards, limited to the four
changed configured roots commands_system/shared_integration_runtime/
storage_value_registry/ui_command_catalog. Index generation PASS: 6,734 PlanUnits
and 26,450 acceptance units, PlanUnit ID set unchanged. Whitespace checks PASS.
No fresh repository-wide aggregate/governance or newer-main retention-validation
pass is claimed; that separate landing hold remains.

Remaining Backup IDs: ACT090,091,105,111,118,119,120. ACT094/109/124 were already
credited to actual typed owners. Native producers, protected source access,
physical original/receipt custody, implementation proof, main landing and the
whole-packet review remain open. Newer protected assistant designs are untouched.
