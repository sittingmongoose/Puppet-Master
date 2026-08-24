# R10 Codex Canary 001 permanent failure

Status: `FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY`. This is preserved diagnostic evidence, not a model, Goal, prompt, or product qualification result.

## Disposition

- Run `r10-codex-canary-001` is permanently consumed at 0/3 and zero qualification credit.
- Alpha, bravo, and charlie remain failed first attempts. They are not retried, replaced, repaired in place, or reclassified.
- All later empirical launches were frozen after terminal verification.
- The simplified one-prompt/native-Goal architecture was neither validated nor falsified because no model-generated turn occurred.

## Primary cause

Every route returned provider HTTP 400 before inference:

```text
invalid_request_error / invalid_json_schema
In context=('properties', 'source_ids'), 'uniqueItems' is not permitted.
```

The frozen output schema is a valid Draft 2020-12 schema, but provider Structured Outputs accepts only a subset. The initial preflight checked generic schema validity and oracle conformance, not provider-subset admission. OpenAI's Structured Outputs guide documents the supported subset and states that unsupported strict schemas produce an error: <https://developers.openai.com/api/docs/guides/structured-outputs>.

The provider rejection occurred in all three preserved stdout streams. Each process receipt has return code 1, `timed_out=false`, one closed stdin submission, `last_message=null`, intact frozen-snapshot custody, and a captured rollout. Raw rollouts contain the submitted prompt and one authoritative `event_msg.item_completed` whose `item.type` is `UserMessage`, followed by `task_complete` with the schema error. They contain zero assistant messages, zero Goal calls or outputs, and no Goal activation or terminal receipt.

## Secondary harness findings

- The verifier reported `last-message capture` before testing the nonzero return code, masking the causal provider error with a derivative symptom. No final assistant message existed for `-o` to write; the `-o` contract was not disproved.
- The verifier's response-role/prefix heuristic would count platform-injected `<recommended_plugins>` and environment context as an external user prompt. Exact external submission must instead join the runner's one stdin submission, exact prompt bytes, and the authoritative completed `UserMessage` event.
- The runner continued from alpha to bravo and charlie after the first route-independent provider rejection. Future canaries must stop before another `Popen` after any row-level admission, transport, lifecycle, output, or scoring failure, and record remaining rows as unlaunched.

## Frozen custody

- Manifest SHA-256: `6149219f0339a7dbf4f7948837857401c4d76445c31275cb148bde08be232924`.
- Verification SHA-256: `24377c14c0309cca8f137c0e2ab253b20973ac5830bb6bb34af81b287b816c07`.
- Alpha stdout SHA-256: `284656d9861ce295e06d46813d425140c4eca064fac09d9d376920561fe090ae`; rollout SHA-256: `83529cb012f67a6e8dfba09194bf7b41eefea2417b557c435b19678977f40e81`.
- Bravo stdout SHA-256: `1478e2612135e1b2906879a3634d560fde6f21632e5f301ca10d4f6dec0032d7`; rollout SHA-256: `284264699b0f5aecfa6b0e554440f13989dd62124eca08ef79d08411bc938bba`.
- Charlie stdout SHA-256: `7d7a4ad06bcff29e7f3d838fb27aa6cf0a6f5b559bea4cdecc118d607dddd328`; rollout SHA-256: `0f362de1bb1eace648332ad22d33fcb4e9ddec4eacc0794869c50bf800d781f7`.

## Smallest successor

Canary 002 is a new experiment, not a rerun. It keeps the bounded one-prompt subject architecture, uses a fresh semantic fixture and fresh identities, removes only the unsupported provider-facing keyword, preserves uniqueness deterministically after capture, admits a closed provider schema subset before launch, reports causal process/provider errors first, counts external input from authoritative trace semantics, and verifies each row before permitting the next route.

Static repair and a passing preflight still earn zero empirical credit.
