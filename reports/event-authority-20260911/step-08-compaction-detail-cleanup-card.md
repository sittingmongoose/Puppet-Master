# Compaction detail cleanup — owner decision

Status: presented; no answer recorded. This is a proposed new detail-disposal contract, not current cleanup authority.

After a compaction finishes, should Puppet Master delete obsolete detailed compaction records once nothing still depends on them, while preserving original receipts and the compact final result?

## Recommended: delete released detail

Permit removal of completed survivor/removal/translation maps; obsolete historical carrier, candidate and publication snapshots; and resolved detailed compaction journal, attempt and phase records. Removal requires independently durable original final-result custody, every physical attempt and actual event/receipt/result obligation resolved, and all current-source, hold, live, backup, rollback, recovery and maintenance dependencies clear. A journal containing any needed member cannot be deleted as a whole. Missing policy, incomplete enumeration or uncertain authority refuses removal.

Current source segments and controls, original event/dedupe receipts, the compact original final-result mapping, and records still required by another owner stay under their existing contracts. This adds no grace period, count cap or archive promise. The existing janitor schedule applies only after eligibility is proven. Historical detail inspection may become unavailable; any later translation/rebuild uses actual current source and its existing owner checks.

Registered backup copies remain under their existing backup retention and hold rules. Active detail removal does not claim a backup copy was deleted; a backup dependency protecting active detail still blocks its removal. Restoration must reconcile original result/receipt and current selection authority before use, and cannot reopen a completed operation from restored detail. No new backup deadline or extension is proposed.

## Alternative: leave detail cleanup disabled

Do not add a removal path for those detailed records. Retain them under the existing unknown-policy fail-closed default until an explicit policy is approved. Storage pressure cannot silently remove them. This leaves detail cleanup unresolved and makes no new permanent-archive guarantee.

## Evidence and decision boundary

Existing owner rules directly require original terminal replay and indefinite compact receipt/audit/source-lineage custody. They also govern obsolete source, never-selected candidate, index-generation and history cleanup. They do not specify the removal targets/lifetime for the three completed-detail groups above. Reference release alone is insufficient. This choice does not change quarantine policy.

Source proposal: `/home/sittingmongoose/PM-Experiments/compaction-lifecycle-source-proposal-20260912/v2/manifest.json`, SHA-256 `72094d6227e0240ae6d73f44a6f3380747fba6d8e60a03f41276c32f9d8a6cf1`. Its `cleanup-inventory.md` identifies C10–C12. Independent source review: `/home/sittingmongoose/PM-Experiments/compaction-lifecycle-source-independent-review-20260912/manifest.json`, SHA-256 `f4eea1de91d8b797f070fda3074e22b7f27a11127a0972a048fc62b10a86096c`. Canonical owner: `Plans/storage-plan.md`, Case L-3 and SP-278.

Cost: Astra medium source/review work plus root adjudication; billing data unavailable.
