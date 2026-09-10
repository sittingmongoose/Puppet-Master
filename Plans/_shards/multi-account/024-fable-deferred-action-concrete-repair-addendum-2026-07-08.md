# Shard 024: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Multi-Account.md`

Source lines: L5084-L5088

Source SHA256: `d2a7eb5beb660e11a81cd2336f1430121ced46fcd02ea15970a91be3e4b9391a`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime multi-account rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d6c43e2aa2b0e8de032cbe43`: account/profile rows support click and keyboard activation through `cmd.account.select_profile`. Empty state copy id is `accounts.empty.no_profiles`. Per-action disabled reasons are `auth_missing`, `auth_expired`, `profile_locked`, `provider_unavailable`, and `policy_denied`.
