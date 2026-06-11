# Shard 019: Runtime identity and blocked-policy continuity

Source: `Plans/Run_Modes.md`

Source lines: L710-L720

Source SHA256: `278c36fc1015a5ee27bf870d55c3f1147530f3880a98ebc4071ecc5e19ef74b0`

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

