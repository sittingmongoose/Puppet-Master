# Narrow frozen-plan correction draft

Only one evaluator-derived correction is established; it grants no direct research credit. The other findings are optional capability, product choice, or explicitly rejected/already-covered dispositions in the union. No canonical file was edited.

## F001 — Require a receipt on every terminal JJ attempt

The explicit promise is `Plans/Source_Control_System.md:127–131`: “every terminal attempt emits a typed operation receipt even when the effect is unknown or recovery is required.” Jujutsu consumes that common receipt owner (`Plans/Jujutsu_Integration.md:32`, `:297–303`).

The frozen `Plans/jujutsu_integration_contracts.schema.json:1861–1869` admits `receipt_ref: null`. Its only non-null receipt constraint is inside the `succeeded` mutation branch (`:1998–2000`, `:2040–2042`). Failed, cancelled, recovery-required and effect-unknown terminal results can therefore validate without the promised receipt.

Scope boundary: This applies only to established attempts represented by the command-result record, which already requires the command instance, owner operation, and before revision (schema lines 1775–1824). Availability rejection and pre-attempt command-error records can lack a command instance (lines 2063–2083) and do not acquire this result obligation. Do not invent native before identities or require a native operation to exist.

Proposed amendment: add a closed result conditional requiring `receipt_ref` to satisfy the existing `non_secret_ref` definition whenever `outcome` is `succeeded`, `blocked`, `failed`, `cancelled`, `recovery_required`, or `effect_unknown`. Keep the existing accepted-work rule and do not require a native oplog entry or known after revision when the native effect is unknown. Use the independent owner receipt to preserve the attempt and its evidence. Add a negative fixture for each terminal outcome with a null receipt, and retain a valid unknown-effect receipt with a null after revision.

Evidence: the supplied research describes successful native effects whose oplog preparation or publication is dropped on failure. This supports independent attempt evidence rather than treating the native log as the only receipt. Every supporting document and extracted proposition is retained under F001 in `union.json`.

Verification: `terminal-receipt-counterexample.json` records that changing the frozen valid cancelled-clone fixture to `receipt_ref: null` still passes the unmodified frozen JSON Schema. This is a schema counterexample only, not native runtime or cancellation proof.

No version upgrade, extra command, new credential architecture, governance regeneration, event registration or native implementation is proposed by this correction.
