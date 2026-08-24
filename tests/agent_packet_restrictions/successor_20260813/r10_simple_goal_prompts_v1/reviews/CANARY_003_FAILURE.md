# Canary 003 terminal failure

Status: `FAIL_PARTIAL_CAPTURE_ZERO_CREDIT_NO_RETRY`. This is a consumed diagnostic failure, not a semantic pass, Goal pass, retry candidate, or replacement candidate.

## Frozen first attempt

- Input commit: `94c6ca6f18ffa69b4f94d37c11a700e96824c585`.
- Evidence checkpoint commit: `3501652742070d5e853f6c9ec423b75cc738f47d`.
- Run/row/route: `r10-codex-canary-003` / `row-alpha-003` / alpha `gpt-5.4-mini/xhigh`.
- One process launched with one 2,179-byte stdin prompt, SHA-256 `b572fe895f4263ba884ea80a772dcc47e4675de1f5f1eba1fc036788e1ad8a99`.
- Process return code was 0 after 12,109 ms.
- Complete raw rollout: 51,660 bytes, SHA-256 `a7bea28c5012562c7acc8b9996e8979c5c34cc8d77203e04daf7c20d77f1fad8`.
- Raw gzip: 17,388 bytes, SHA-256 `746a78f3cc57cd635f7636433d14e429cb9ecb5801addbe86782c9e545254f27`.

## Observed result

The sole assistant result exactly matched the hidden oracle:

```json
{"unit_id":"canary_evidence_03","selected_source_id":"S3","execution_proven":false,"source_ids":["S3"]}
```

That semantic correctness earns no credit. The rollout contained one task interval and zero function calls, zero `create_goal` receipts, zero `update_goal` receipts, zero Goal terminal receipts, and no native continuation. The immutable prefix verifier failed with:

```text
PrefixRowFailure: row row-alpha-003: VerifyError: create_goal count
```

The final verifier disposition is `FAIL_PARTIAL_CAPTURE_ZERO_CREDIT_NO_RETRY`. No suffix existed. The row, run, unit, nonce, prompt, task, session, and Goal identities are permanently consumed.

## Controlled comparison and correction

After normalizing fresh identities, Canary 002 and Canary 003 had byte-identical subject content, identical one-turn event shape, identical exact semantic behavior, and zero Goal calls. The intended difference was only removal of the `--output-schema` argv pair. Therefore Canary 003 falsifies the provider-output-enforcement interaction hypothesis.

The smallest successor changes the subject surface rather than another prompt or provider flag: one fresh top-level Codex Desktop app task receives one ordinary bounded prompt beginning `Create a goal that ...`. It preserves alpha `gpt-5.4-mini/xhigh`, host-only typed validation, exact hidden-oracle scoring, lifecycle acceptance, zero non-Goal tools, one attempt, and zero qualification credit. Any missing native Goal activation remains a permanent failure.

This finding does not repair Canary 001, Canary 002, or Canary 003 and does not establish bounded-context qualification, production readiness, safety, or canonical Plan completion.
