# Owner decision: what remains after eligible quarantine cleanup?

Status: **PROPOSED; awaiting Jared’s answer through root.** This card grants no purge authority. It closes one product question before a dependent technical model is built.

**Recommended: A — keep the existing audit trail only.** Once an item is resolved, its existing Q policy permits cleanup, and every actual hold/dependency allows it, remove its quarantined raw content. Keep the original manifest, operation journal and quarantine index long enough to finish and verify the actual purge event and its original first AppendReceipt. Then retire those remaining quarantine records. The existing indefinite audit event, original shared receipt and their existing identity/dedupe custody survive under their own unchanged policies.

A later audit can show the original recorded lifecycle/purge event and its authentic first append receipt. It explicitly reports **“Source evidence unavailable.”** It cannot open the old bytes, re-resolve the old quarantine source receipt, prove the complete original source history, or recreate the quarantine entry. Missing evidence alone never proves a lawful purge; that claim requires the authentic retained purge event/receipt. If those are unavailable too, the audit reports that limitation rather than assuming cleanup occurred.

**Alternative: B — also retain a new minimal quarantine audit record indefinitely.** Raw content still becomes eligible on exactly the same existing schedule and under the same holds. After the actual purge event/first receipt settles, retire the full manifest, journal and operational index, retaining a newly specified content-free audit residue under the existing indefinite audit class. This preserves a directly readable quarantine-specific record of the original disposition after source removal. It still cannot recover raw bytes or prove source facts that the residue does not actually preserve.

B requires a separate exact closed record shape, immutable original-authority joins, reader/access rules, policy mapping and backup/restore/cleanup registration before implementation. This card does not invent that shape or promise complete historical source proof. The residue must contain no raw/decoded content, raw-bearing manifest or journal, secrets, local paths, or live dependency that holds raw bytes forever. An indefinite hash/ref is not an authority to fetch or reconstruct the deleted source.

A is recommended because the existing event and shared receipt already provide lasting audit evidence of the recorded operation. A avoids creating another permanent authoritative record and its required reader/backup obligations. Choose B only if a separate lasting quarantine-specific disposition record is a required product capability.

## What the current owner does—and does not—authorize

The current quarantine family explicitly says the row “retains the custody manifest and append-ordered recovery receipts” (storage registry line 16628). It is also a mandatory-backup, required recovery anchor (16639–16656). Storage requires exact raw custody and append-only recovery receipts before live mutation (storage-plan 17280–17288). Deleting a live, unresolved or still-needed index would violate these requirements.

The same family selects its exact Q risk policy (registry 16648–16649). All four policies use `expiry_action=delete_sidecar` (377–453), but neither the Storage owner nor that enum’s schema definition closes whether this includes the redb index, manifest and journal. The terminal `purged` state prohibits further lifecycle transitions; it does not explicitly require the index to remain forever, and retirement is not a new outgoing lifecycle edge. K37 requires resolved custody and hold authority before purge; it does not specify an indefinite purged-row reader (testing 2313–2321).

**Therefore A cannot be implemented as an already-authorized interpretation of `delete_sidecar`.** No explicit perpetual-index rule was found in these cited owner requirements, but their current retention language is not sufficient permission to delete it. Selecting A must explicitly clarify that the index’s custody/recovery requirement ends only after actual authorized purge, its event/first receipt settlement, and release of every real dependency. Storage’s general indefinite receipt/audit/source-lineage class (17171–17178) remains unchanged: the existing durable event/shared receipt/identity evidence continues in that class; this decision explicitly defines the operational quarantine record’s narrower Q-scoped disposal boundary. If the owner instead classifies the full embedded quarantine source-receipt lineage as independently permanent authority, A is incompatible with that classification and must not be applied without resolving it. B also requires explicit owner adoption; it is not already-defined residue custody.

This is an owner clarification to be compiled after the answer, not a unilateral reclassification, exception inferred from a filename, change to policy values, or deletion of independent audit records.

## Existing eligibility stays exactly the same

All anchors are `resolution`; all policy versions are `1.0.0`. Eligibility is inclusive at anchor + TTL and remains subject to existing unioned references and maintenance authority. These are policy parameters, not a promise that every item is deleted on that date.

| Policy | TTL | Existing caps | Overflow / hold eligibility |
|---|---:|---|---|
| Q-CRITICAL | 31,536,000 seconds (365 days) after resolution; unresolved indefinite | 3/logical key; 10,000/instance; 10 GiB | fail_closed; hold eligible |
| Q-RESETTABLE | 2,592,000 seconds (30 days) | 3/logical key; 1,000/project; 1 GiB | quarantine_oldest_resolved; hold eligible |
| Q-DERIVED | 604,800 seconds (7 days) | 2/logical key; 100/project; 512 MiB | quarantine_oldest_resolved; not hold eligible |
| Q-MIRROR | 2,592,000 seconds (30 days) | 100/project; 5 GiB | quarantine_oldest_resolved; not hold eligible |

Policy-level `hold_eligible=false` does not waive an independently applicable backup, recovery, live-reference or maintenance dependency. The general owner rule gives those dependencies priority over age/count eligibility (storage-plan 17182). Neither option changes TTLs, anchors, caps, overflow behavior, hold kinds, eligibility or release. Pending real obligations preserve exactly the evidence they still require. A passive audit read creates no raw hold. Ordinary cleanup does not silently erase retained backup generations; their existing owner policies and dependencies still govern them. Restore must not silently resurrect retired live source custody from an older backup.

Both options preserve the exact lifecycle graph: detected → secured; secured → a class-valid resolution or recovery_blocked; only migrated/rebuilt/reset_to_default/restored → purged. No unresolved critical eviction, recovery_blocked purge, critical reset/rebuild, direct detected resolution or transition out of purged is permitted. Unknown/missing destructive-policy authority remains fail-closed. No new event family, duplicate first receipt, repair/salvage command, replay mutation, raw export, governance change or executed-test claim is authorized.

## Root-only presentation and recording

Concise async wording for root to present after review: “After quarantine data is eligible for cleanup, should Puppet Master keep only the existing permanent audit event and receipt, with source evidence shown as unavailable (A, recommended), or also keep a new minimal content-free quarantine audit record permanently (B)? Both preserve the existing cleanup timing and holds.”

The blank `answer.json` is a template only; null values mean no answer. Record the actual user choice and exact message in a separate answered copy. Do not infer an answer from elapsed time, model review, this recommendation or an unchanged template. If B is chosen, close its exact shape/reader/backup contract before modeling purge; if A is chosen, first close the explicit operational-index disposal clarification above.

Source evidence: full immutable source copies and SHA-256 pins are in `source-pins.json`; line references above address those copies, pinned at `c881c8c62e9894b183866f5b1400d7b1ef81eb17`. The event family is `event-family-storage-value-quarantine-changed` at registry 2086–2317, with `RP-AUTHORITY-INDEFINITE@1.0.0` at 2312–2316. Shared first-receipt independent app-root lifetime is required by SP-286 at storage-plan 21686–21717. The technical proposal’s manifest pin is included for lineage only; its proposed custody paths/bindings are not current canon.
