# One owner card: minimum platform evaluation decision-custody lifetime

Status: APPROVED by Jared; recorded in DL-048. Concrete owner contracts remain pending. Original frozen proposal bytes remain at the cited external source.

Decision owner: Jared, routed jointly to PlatformCapabilityManager/newtools and Storage. Models supplies source semantics; Doctor remains a router. This is the sole product prerequisite identified by this bounded review.

Question: May Storage retain the minimal non-secret immutable platform evaluation decision package while the original evaluation is unresolved, and after publication for as long as any still-retained referencing platform.capability_evaluated event, frozen run snapshot or applicable owner hold requires it, then remove it through authorized reference/hold-aware cleanup without an additional independent grace period?

The package would contain only the original occurrence/context/retry identity, exact catalog revision/entry, bounded source-owner decision facts and provenance used for selection, frozen payload/producer input and original receipt join. It would not retain raw probe logs, provider responses, credentials, account content, old transaction controls or old runtime services. Each original raw source keeps its existing owner policy. Receipt bytes remain subject to their independent Storage receipt policy.

Why this needs a decision: historical evaluation must resolve its original immutable catalog and evidence. Current canon supplies semantic owners and an operational EventRecord policy, but no located owner rule assigns lifetime to this new decision package. Models caches and Doctor projections are insufficient. The explicit reference-coupling rule for requested_effective_runtime protects that record itself and does not cover its capability referent or application-scoped evaluations. Extending it would be a new retention assignment outside DL-045.

If approved, technical work may define exact canonical package storage, pending-resolution/reference holds, final retirement/cleanup checks, recovery/backup/migration, closed schemas and fixtures under that policy. Native implementation and actual capability/source route admission would still be separate work. The current empty catalog would remain empty.

If not approved, retain the current fail-closed prerequisite: do not invent retention, admit an unsupported writer, substitute current discovery or weaken historical validation. The answer is not permission to shorten the existing event policy.

Unchanged: application/project event scope; RP-OPERATIONAL-2555D policy, anchor, cap and holds; live-capability invalidation; existing run-snapshot/receipt policies; source-owner raw-data deletion and permission rules. No account-derived scope or independent app-root evaluation-result duty is proposed.
