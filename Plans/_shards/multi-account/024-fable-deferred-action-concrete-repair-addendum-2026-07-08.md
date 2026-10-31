# Shard 024: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Multi-Account.md`

Source lines: L5198-L5202

Source SHA256: `af80742ba96d896919aa9dad0fefda9efa559b22011348b733f33c3dbac401fa`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime multi-account rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d6c43e2aa2b0e8de032cbe43`: account/profile rows support click and keyboard activation through `cmd.account.select_profile`. Empty state copy id is `accounts.empty.no_profiles`. Per-action disabled reasons are `auth_missing`, `auth_expired`, `profile_locked`, `provider_unavailable`, and `policy_denied`.
