# R10 simple Goal prompts

Disposable empirical qualification lane for the bounded-context architecture that supersedes Prompt Complexity R9.

## Authority and scope

- Canonical `Plans/**`, planning ledgers, production runtime, and unrelated dirty work are read-only.
- This lane may establish empirical findings; it cannot establish production readiness, safety certification, or canonical Plan completion.
- All new R10 bytes live under this directory unless a later shared-helper exception is separately justified and recorded.
- Predecessor `r9g*`, `iteration_*`, and `r9_control_plane_stabilization_v1/**` artifacts are immutable diagnostic evidence.
- Qualification starts at `0/2` and requires two consecutive clean full matrices on identical frozen bytes and configuration.

## Correct subject boundary

- A fresh Codex test taker receives exactly one ordinary user prompt beginning naturally with `Create a goal that ...`.
- A fresh OMP test taker receives exactly one prompt beginning `/goal ...`.
- The same prompt carries only the bounded objective, admitted context, constraints, and typed output contract.
- Goal activation, in-Goal work, and terminal state are observed afterward; lifecycle choreography is not sent to the subject.
- Canary 001 attempted the preserved three Codex routes but was rejected by provider schema admission before inference and remains permanently 0/3. Canary 002 reached inference on alpha and returned the exact semantic result but never activated Goal; it remains permanently failed, and fail-stop left its suffix unlaunched. Canary 003 removed provider-side output-schema attachment and repeated the same zero-Goal direct answer, permanently falsifying that interaction hypothesis. Canary 004 is the next zero-credit vertical slice: one fresh top-level Codex Desktop app task, one ordinary bounded prompt, and no follow-up. A Windows-native OMP TUI conformance canary remains a hard gate after the Codex vertical slice, and OMP must be present in the frozen full-matrix route set.

See `PROGRESS.md` for alignment/churn checkpoints and `CUSTODY.json` for the initial repository boundary.

## Active app-task execution boundary

Canary 004 replaces the consumed headless runner with a small app-surface adapter. Before launch it verifies the detached commitment, prompt compilation, oracle/schema join, exact pushed blobs, exact saved-project binding, unique title/nonce, and absence of the single designated evidence leaf. It atomically reserves that leaf, snapshots all launch/scorer inputs, preserves the current parent-rollout prefix, and writes the exact structured `create_thread` request. The reservation is the permanent one-shot consumption fence and is never removed or reused after a creation or capture error. The relative higher-quality controller makes the exact create call once, may use up to eight child-bound `wait_threads` calls only for scheduling, makes one exact terminal `read_thread` call, and sends no follow-up message. Wait results are ignored as evidence: they do not prove progress, cursor continuity, Goal lifecycle, or completion.

The preserved parent suffix must contain exactly one successful structured create event with the frozen request, zero or more waits for the returned child/host, and one final successful structured read event with the exact terminal request; every other app event fails. Wait status and result content are ignored, so a failed scheduling wait does not become lifecycle evidence or invalidate an otherwise valid terminal capture. The adapter preserves the full parent capture and exact create/read results before parsing, then preserves two independent child-rollout reads before comparing them. It joins the app's idle, complete, no-omission newest-first turns to raw task intervals. Frozen-snapshot verification checks ordinary-user provenance, one exact external prompt, effective model/effort, a closed child record/event denominator, a positive capsule-bound Goal objective, one Goal identity with monotone active-to-complete state, one turn-ending final per native task interval, the sole canonical JSON in the latest interval, source uniqueness, and exact hidden-oracle equality. Its first terminal PASS or FAIL receipt is sticky; a later verifier invocation cannot relabel it. Parent records are faithful-but-unsigned host evidence, and the relative higher-quality controller is trusted for honest use of the reserved request. The parent projection does not independently prove absence of controller-local non-app actions; hostile, accidental, or fabricated deviation is a named residual outside this disposable diagnostic. Static preflight earns no empirical credit.

Canaries 001–003 and their evidence remain historical diagnostic inputs only. Their identities and launch paths are never reused by Canary 004.
