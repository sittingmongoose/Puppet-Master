# Shard 024: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Multi-Account.md`

Source lines: L5287-L5291

Source SHA256: `20bc6cdaf237934560a847048ee0b4cd0bec2fca90152d0fb6a88a474bceb2af`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime multi-account rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-d6c43e2aa2b0e8de032cbe43`: account/profile rows support click and keyboard activation through `cmd.account.select_profile`. Empty state copy id is `accounts.empty.no_profiles`. Per-action disabled reasons are `auth_missing`, `auth_expired`, `profile_locked`, `provider_unavailable`, and `policy_denied`.
