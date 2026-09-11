# Shard 032: External Packet Custody and Completion Integrity — 2026-09-10

Source: `Plans/Automated_Testing_System.md`

Source lines: L4358-L4388

Source SHA256: `c5d52e380cd004edfe694b995adfcb2f54e8ae00c21248ac288c6679b0673afb`

---

## External Packet Custody and Completion Integrity — 2026-09-10

<a id="external-packet-custody-and-completion-integrity-20260910"></a>

Raw packet slices and event-audit cohorts follow AGENTS.md's external evidence placement. The
logical source identities in the existing extraction specification do not change when evidence is
moved. `scripts/pm_evidence_paths.py` resolves only explicitly mapped evidence namespaces;
canonical Plans, schemas, settings, and command/wiring registries cannot be redirected through
that map. A physical path is a location, never a substitute for frozen source identity.

Packet custody verification reconstructs the source hash from the exact non-overlapping source
bytes, verifies overlap bytes, unique document and slice identities, bounded slice lengths,
contiguous ranges, exact EOF, and every slice hash. Absolute/traversal paths and symlink escapes
are refused. A missing mapped source never falls back to a stale repository copy. Full-body source
hashing is mechanical verification, not permission for an agent to replace bounded semantic review
with one broad source read.

The existing v2 packet census remains the exact extracted packet-case set plus every current
Touch Closure row crossed with its thirteen specified review dimensions. Neither the historical
8,252 count nor a newly selected subset is an admissible replacement denominator. Manifest
self-validation and fresh source-freeze comparison precede completion. A claimed valid flag,
matching summary hashes without matching case content, duplicate documents, missing groups,
or missing evidence cannot manufacture `audit_report.completed.json`.

Formal completion requires every case's actual disposition and source-bound evidence, every
required suite verdict, unresolved risks, and the real reviewer identity under the existing audit
contract. A complete audit may legitimately conclude fail or blocked; a missing source census is
not a complete audit. Local schema tests, a concept demonstration, and a review by the implementing
agent do not supply unperformed independent, runtime, visual, or provider proof.

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-045, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Wiring_Rules.md
