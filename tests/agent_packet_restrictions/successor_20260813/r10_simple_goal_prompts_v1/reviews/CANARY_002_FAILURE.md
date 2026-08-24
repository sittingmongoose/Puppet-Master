# Canary 002 terminal failure

Status: `FAIL_PARTIAL_CAPTURE_ZERO_CREDIT_NO_RETRY`. This is preserved diagnostic evidence, not a passing semantic row or a retry candidate.

## Observed result

- Only `row-alpha-001` launched. `row-bravo-001` and `row-charlie-001` are durably `NOT_LAUNCHED_AFTER_CANARY_FAILURE`.
- Alpha ran `gpt-5.4-mini/xhigh` once through Codex CLI 0.148.0, returned code 0, and produced the exact schema-valid hidden-oracle result.
- The 52,220-byte raw rollout, SHA-256 `d93bad1c5e0385d91af8c30f4f8b996945b8e42a30237f9c228af52ca4fc8931`, contains one paired task turn, one authoritative user submission, one assistant semantic final, and zero tool calls or outputs.
- Native Goal evidence is absent: `create_goal=0`, `get_goal=0`, `update_goal=0`, active receipts `0`, and terminal receipts `0`.
- The immutable prefix gate therefore failed at `VerifyError: create_goal count`; its SHA-256 is `6479f8fee2225925379b576b9edf99315a32b813754be90cf579a51c424435c4`.

This is a genuine Goal-nonactivation result, not a provider rejection, process failure, missing final capture, verifier projection error, or semantic-scoring error. Exact semantic correctness earns no credit without the required native Goal lifecycle.

## Reset boundary

Canary 002 is consumed and cannot be retried, replaced, resumed, repaired, or used to launch its untouched suffix. Canary 003 uses fresh identities and tests one narrow hypothesis: provider-side `--output-schema` may have encouraged immediate terminal output. It removes only that argv pair while retaining the inline/external schema, exact host validation, hidden-oracle equality, lifecycle requirements, and zero-credit/no-retry policy.

A Canary 003 pass would support only that interaction hypothesis. It would not convert Canary 002 to a pass, qualify any route, establish OMP parity, authorize a full matrix, or support production/safety/canonical-Plan claims.
