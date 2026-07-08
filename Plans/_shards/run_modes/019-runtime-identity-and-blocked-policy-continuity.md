# Shard 019: Runtime identity and blocked-policy continuity

Source: `Plans/Run_Modes.md`

Source lines: L710-L719

Source SHA256: `5a1167cc903337c1c4dfcff9772374935b540b13f2af8f0e5fafff58fc784e74`

---

## Runtime identity and blocked-policy continuity

#### Acceptance carry-through
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- In `## Runtime identity and blocked-policy continuity`, require `execution_role`, `requested_account_id`, and `operational_identity` as runtime continuity fields.
- Require blocked-policy continuity to include `blocked_sequence` minting/persistence, startup recovery rehydration, and unchanged DAE jail/approval policy ownership.
- Carry usage switch-history and usage execution-role follow-through across mode changes and blocked recovery.
- cov-159 exact item present: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- cov-159 exact item present: Carry usage switch-history and usage execution-role follow-through
