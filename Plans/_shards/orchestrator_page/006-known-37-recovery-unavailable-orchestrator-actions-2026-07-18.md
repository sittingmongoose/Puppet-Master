# Shard 006: Known-37 recovery-unavailable orchestrator actions - 2026-07-18

Source: `Plans/Orchestrator_Page.md`

Source lines: L454-L460

Source SHA256: `a678065d5ec532bd6c495df5a4fb52d791586f438ae46d50ecc621c79fe6e49a`

---

## Known-37 recovery-unavailable orchestrator actions - 2026-07-18

The Orchestrator projects the current recovery anchor, exact five-value owner reason, snapshot refs, preserved-local-work disclosure, pre/post-attempt identity, and ordered `allowed_action_ids[]`. It registers no local recovery family. `locate_and_verify_recovery` routes only to `cmd.runtime.locate_and_verify_recovery`; `abandon_recovery` routes only to `cmd.runtime.abandon_recovery`; their catalog labels, typed request/result contracts, one-handler wiring, and receipt effect are authoritative.

The page keeps inspect first and explicit abandonment last. `start_fresh_attempt` appears only when the existing isolated historical-commit/worktree-head predicate is currently owner-admitted. Ordinary restore/retry, abort, skip, approve, timer, archive, and cleanup cannot replace the current list. Every click revalidates the exact blocked sequence, anchor, reason, snapshot set, attempt branch, membership, permission/storage state, and idempotency identity.

Projection changes to released only from durable owner authority: committed locate/verify receipt gives `resolved`; committed replan gives `resolved`; a fully durable isolated successor gives `superseded_with_verified_successor`; committed explicit abandonment gives `abandoned_by_user`. Any refusal, recoverable failure, owner disagreement, stale projection, or receipt failure keeps `recovery_unavailable`, all refs/holds/local work, and `cleanup_performed = false`. The page displays the typed outcome and receipt identity; generic command acknowledgement is not success.
