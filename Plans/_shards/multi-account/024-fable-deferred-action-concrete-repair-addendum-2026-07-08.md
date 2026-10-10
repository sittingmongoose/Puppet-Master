# Shard 024: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Multi-Account.md`

Source lines: L5090-L5094

Source SHA256: `474dbbcfa80086acff88f62eed476ea5d59059858f58dce18df44ea073b13628`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime multi-account rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d6c43e2aa2b0e8de032cbe43`: account/profile rows support click and keyboard activation through `cmd.account.select_profile`. Empty state copy id is `accounts.empty.no_profiles`. Per-action disabled reasons are `auth_missing`, `auth_expired`, `profile_locked`, `provider_unavailable`, and `policy_denied`.
