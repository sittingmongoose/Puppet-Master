# R10 progress and alignment ledger

## Governing reminder

Original goal: prove that automated PuppetMaster work can be decomposed into bounded, weak-model-safe prompts, each launched through the platform's native one-prompt Goal interface, without giant context or custom Goal choreography.

The reminder above is reread and quoted at least every 30 minutes of active work and before every architecture, canary, or matrix launch.

## Check 000 — 2026-08-24T17:04:00Z — start and custody

- Reminder reread: yes, verbatim above.
- Current hypothesis: one host-side controller can select one bounded work unit, compile a small provenance-bearing PromptCapsule, enforce non-semantic obligations outside the model, and send exactly one native Goal prompt; no subject-side lifecycle protocol is necessary.
- Smallest changed invariant: Codex subject prompts begin `Create a goal that ...`; OMP subject prompts begin `/goal ...`. Prior slash-command and multi-turn Codex transports are excluded from the target architecture.
- New evidence: predecessor task `01a00b52-4879-7c41-a826-7b4609ad3c3b` is idle and its terminal handoff reports no live owned writers or subagents. Preserved `r9g48-matrix011` has one dead pane with exit status 1. Qualification remains `0/2`.
- Deepest valid product-relevant point: no new empirical product evidence yet. The valid starting boundary is that each scored subject needs its own native Goal activation, in-Goal execution, terminal evidence, complete raw output, deterministic scoring, and no retry or replacement.
- Files or surface added: this exclusive R10 root, `README.md`, `PROGRESS.md`, and `CUSTODY.json`.
- Files or surface removed: none. Predecessor machinery remains read-only.
- Next disconfirming test: independently derive the minimum route set and try one first-attempt bounded task per route with the corrected single-prompt contract; reject the architecture if any route needs subject-side Goal choreography.
- Classification: PROGRESS. This establishes the corrected falsifiable transport invariant and exclusive custody boundary; it earns zero empirical qualification credit.

## Check 001 — 2026-08-24T17:08:44Z — before R10 architecture

- Reminder reread: Original goal: prove that automated PuppetMaster work can be decomposed into bounded, weak-model-safe prompts, each launched through the platform's native one-prompt Goal interface, without giant context or custom Goal choreography.
- Current hypothesis: exactly one *initial user submission* can carry one complete bounded work unit into a fresh native Goal; native automatic continuation is allowed and must be observed through genuine terminal state rather than mistaken for a second subject prompt.
- Smallest changed invariant: remove all subject instructions to activate, acknowledge, resume, or complete Goal lifecycle. Retain only the platform-specific first bytes (`Create a goal that ` for Codex; `/goal ` for OMP) plus semantic work content.
- New evidence: the historical comparable roster is three Codex routes (`gpt-5.4-mini/xhigh`, `gpt-5.4-mini/medium`, `gpt-5.6-luna/medium`) and the historical denominator is 97 semantic cells x 3 routes = 291. Matrix011 remains a permanent lifecycle-misclassification failure. Canonical owners place context selection in Prompt Pipeline and dispatch, permissions, FileSafe, lifecycle, schemas, and evidence outside prompt prose.
- Deepest valid product-relevant point: the target is not a new staged prompt-packet system. It is one bounded input envelope to native Goal Runtime; controller selection and runtime enforcement remain distinct from model semantics.
- Files or surface added: no runtime or Plan surface; only the R10 custody and progress records from Check 000.
- Files or surface removed: proposed subject-side completion instructions, activation choreography, PTY streaming, atom release, and prompt-contained enforcement are removed from the target architecture.
- Next disconfirming test: freeze one small capsule and submit it once to each historical Codex route. Any route that needs a second user prompt, lifecycle prose, external context read, or scorer weakening falsifies the canary.
- Classification: PROGRESS. The prior Goal-transport family is replaced by a smaller falsifiable boundary, and the historical 291-row meaning is resolved; the distinct R10 denominator remains intentionally pending until frozen workflow-unit mapping, without granting qualification credit.

## Check 002 — 2026-08-24T17:42:40Z — adversarial prelaunch hold and narrow repair

- Reminder reread: Original goal: prove that automated PuppetMaster work can be decomposed into bounded, weak-model-safe prompts, each launched through the platform's native one-prompt Goal interface, without giant context or custom Goal choreography.
- Current hypothesis: the same 2,202-byte one-prompt subject contract remains sufficient; the host must atomically freeze the exact three-route denominator and reject any tool or lifecycle trace it cannot prove from a closed grammar and paired receipts.
- Smallest changed invariant: before any `Popen`, compile all three rows and scorers against a detached manifest commitment, snapshot all frozen inputs, and accept only one direct Goal call per closed wrapper. Require causal `create call -> active receipt -> complete call -> complete receipt -> typed final` order inside paired task intervals.
- New evidence: the mechanical audit passed all frozen hashes, bounds, route identities, schemas, and 12 original self-tests with zero subject calls. Independent xhigh and trace audits then found genuine false-pass paths: computed/aliased tool calls escaped regex projection, weakened or empty manifests could pass, live inputs were reopened per row, timeout/CODEX_HOME were caller-variable, and lifecycle ordering was underconstrained. All subject first attempts remain unconsumed.
- Deepest valid product-relevant point: moving obligations out of weak-model prose is only useful if the host-side boundary is fail-closed. A small prompt cannot compensate for a mutable denominator or a verifier that can hide unadmitted reads; those are deterministic controller defects, not worker failures.
- Files or surface added: detached manifest-commitment and immutable-snapshot contract in the canary runner; closed Goal-wrapper parsing, receipt causality, and paired task intervals in the verifier; adversarial zero-subject regressions. Subject capsule, objective, admitted context, typed output, and platform prefix are unchanged.
- Files or surface removed: caller-selected binary/home/timeout configuration, live-tree scorer reads after launch, permissive regex tool discovery, and the terminal/result ordering exception.
- Next disconfirming test: independently mutate the frozen denominator, acceptance, tool-wrapper syntax, snapshot inputs, lifecycle identities, and causal ordering; then dry-run the full atomic preflight. Any accepted mutation or any current Codex 0.148.0 trace incompatibility keeps the launch frozen.
- Classification: PROGRESS. Two independent audits advanced product-relevant evidence and forced a narrower deterministic boundary without adding subject choreography or changing the semantic capsule. Static repair earns zero empirical credit.
