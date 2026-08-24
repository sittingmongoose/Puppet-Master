# R10 Codex canary prelaunch audit

Status: repairs integrated; final pushed-byte reopen pending. Subject calls: 0. Qualification credit: 0.

## Independent checks

- Medium mechanical audit: initial frozen file identities, route bindings, prompt/capsule/schema metrics, JSON Schema checks, AST parsing, CLI option availability, and deterministic self-tests passed. No evidence directory or subject call existed.
- Medium historical-trace audit: preserved R9g49 direct and wrapped Goal call/output shapes, session metadata, turn contexts, user/internal-context messages, and task lifecycle events were reopened. Prior R9g49 failures remained failures.
- Xhigh adversarial audit: the initial candidate was held for a bypassable tool regex, vacuous denominator, live per-row inputs, weak lifecycle ordering, caller-variable runtime custody, and non-snapshot verifier execution.

## Integrated dispositions

- The subject PromptCapsule and its rendered Codex prompt remain byte-for-byte semantically unchanged; all repairs are controller/verifier obligations.
- Tool accounting now accepts direct Goal calls or one anchored wrapper with a safely joined local result identifier. Computed access, aliases, extra statements, multiple calls, nonliteral arguments, duplicate IDs/outputs, and non-Goal tools fail closed.
- The runner hard-codes the exact three-route canary denominator and acceptance constants, validates all rows and scorers before `Popen`, and snapshots all frozen inputs before dispatch.
- Binary, model, effort, timeout, sandbox, `CODEX_HOME`, sanitized environment, controller Python/jsonschema versions, temporary root, exact argv, nonce, and row identities are joined into evidence.
- Launch requires the exact current inputs to equal blobs in pushed `main` with `HEAD == origin/main`; an adjacent commitment alone is not treated as an external anchor.
- Verification must execute from `evidence/frozen_snapshot/r10_verify.py`, import the snapshotted contract, and join both executing hashes to the manifest and pushed commit.
- Lifecycle acceptance requires strictly increasing trace ordinals, sequential paired task intervals, one external prompt, call/output turn identity, same exposed Goal identity (`threadId`, objective, `createdAt`), and `create -> active -> complete -> typed final` causality with terminal/final in one task turn.

## Remaining launch gates

1. Regenerate all frozen identities and the detached manifest commitment after the last repair.
2. Re-run all zero-subject self-tests, current-trace compatibility checks, and atomic preflight.
3. Commit and push only the owned R10 root; verify pushed-HEAD custody.
4. Obtain one final independent stable-byte PASS before the first canary subject call.

Passing these static gates is not empirical success, readiness, safety, FileSafe enforcement, or qualification.
