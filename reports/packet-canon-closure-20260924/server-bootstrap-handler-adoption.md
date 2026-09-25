# Server bootstrap handler adoption

Status: bounded static owner/consumer repair; native bootstrap remains unproved. Base `32078dcb2`.

Server §4.2 and SRV-005 now adopt the already-registered sole future target `handlers::server::bootstrap_start` for `cmd.server.bootstrap.start`. One production Wiring row and TOUCH-SRV-027 drop only the settled target-name question. Pairing remains separate, the command stays `handler_unavailable`, expected events remain empty, and the Touch disposition remains partial. Post-claim durable roots/mounts, execution baseline, consent, restart/rollback, receipt, return and accessibility evidence are still required.

Evidence directory: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/server-bootstrap-handler-owner-01/`.

| Evidence | SHA-256 |
| --- | --- |
| `changes.patch` | `aa0deb845aa58eff9a94de133e2881ffcda4748133a113e6f9cfded9c788b3e6` |
| `REPORT.md` | `8e9a418ec88d618be001fca6dbbe0e2a3873bb490d6f8e91fe36645486f79dd1` |
| Different-Sol `REVIEW-SOL.md` | `a070248ba79e2bb6fa295ea234b6892f88c6333ea44899fe9c81c0e9f658147b` |

The Zcode wrapper timed out while its native Goal remained active; no Goal completion is claimed. Root re-read the owner passage, verified all three source hashes against the frozen inputs, applied the independently accepted patch and ran the new structured regression: PASS. The 76 Touch-source and pairing tests also PASS. Shard generation passes (99 documents/2,766 shards); index generation passes (6,747 units/26,572 acceptance units), with unchanged IDs and changed unit records confined to Server. Runtime certification remains blocked.

The preceding unchanged-root static-contract baseline passed 80 pairs, 1,541 positive cases, 4,684 rejected negative cases and 12 self-tests. This repair changes no schema or gate logic. No governance binding or TCR fixture hash is refreshed, and no main landing or whole-Server closure is claimed.
