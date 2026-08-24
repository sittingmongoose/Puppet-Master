# R10 bounded one-prompt Goal architecture

Status: experimental one-row diagnostic after two permanently failed zero-credit canaries. This document has no canonical Plan, production-runtime, safety, release, or certification authority.

## Falsifiable hypothesis

A relative higher-quality controller can select one bite-size semantic work unit, compile one bounded provenance-bearing input envelope, and make one initial native-Goal submission to a fresh weaker worker. The worker can return the correct typed semantic result while native Goal Runtime—not subject choreography—owns activation, any automatic continuation, and terminal state. Authority, admission, route binding, tool/file/write limits, schema validation, lineage validation, scoring, retry policy, and evidence accounting stay outside worker prose.

The hypothesis fails for a row if any of these occurs:

- the initial Codex prompt does not begin exactly `Create a goal that ` or an OMP prompt does not begin exactly `/goal `;
- a second user submission, resume message, ACK, slice delivery, or manual completion instruction is needed;
- Goal activation is absent or occurs after the scored semantic result;
- terminal Goal state is absent, non-complete, or confused with an intermediate `TaskComplete` event;
- a subject uses non-lifecycle tools, reads unadmitted context, or writes;
- final output is malformed, semantically wrong, cites an unadmitted source, or violates a preserved negative constraint;
- requested/effective route identity, exact prompt bytes, first-attempt identity, or complete raw result is not durably bound;
- an admitted byte or binding changes after admission;
- a retry, replacement, best-of selection, answer leak, scorer weakening, or direct Assistant Chat fallback occurs.

“One prompt” means one initial user submission. It does not mean one provider turn: native Goal may continue automatically. The controller observes continuation and terminal state but sends no lifecycle follow-up.

## Three separable layers

### 1. Semantic PromptCapsule

The only task-specific model input is one closed capsule containing:

- one `unit_id` and `workflow_family`;
- one concrete objective;
- at most four admitted context blocks, each with a short source ID, bounded text, byte count, and SHA-256;
- zero or more short semantic constraints with stable IDs, `positive|negative` kind, and admitted-source linkage;
- one selected output-schema identity and an inline bounded output contract;
- lineage IDs needed by the worker to cite admitted evidence.

The capsule grants no dispatch, tool, read, file, write, network, retry, completion, or certification authority. It is one input envelope to native Goal Runtime, not a staged prompt chain, D2 handoff, atom-release protocol, or prompt loop.

Experimental profile `r10-simple-4k-v1`:

- final initial prompt: at most 4,096 UTF-8 bytes;
- capsule JSON before rendering: at most 3,584 UTF-8 bytes;
- admitted blocks: at most 4;
- each admitted text block: at most 1,024 UTF-8 bytes;
- combined admitted text: at most 2,048 UTF-8 bytes;
- constraints: at most 8, each at most 256 UTF-8 bytes;
- selected response schema: exactly 1 and at most 2,048 UTF-8 bytes;
- no task-time source discovery or unbounded context read.

These are test-profile bounds, not proposed canonical production defaults. Canonical delegated-agent defaults remain separate plan facts and are not runtime proof.

### 2. Host-side deterministic envelope

The controller/runtime, not the weak worker, binds:

- execution-unit, run, row, attempt, route, model, effort, account, permission, FileSafe, and context-epoch identities;
- final rendered prompt bytes and SHA-256 after the platform prefix;
- admitted and omitted block identities, source hashes, byte counts, and truncation states;
- selected tool/schema set and tool ceiling;
- fresh task/thread/session identity and once-only nonce;
- sandbox/write policy, timeout, and no-retry disposition;
- hidden expected result and deterministic scorer identity;
- raw output, Goal activation, terminal Goal receipt, process status, and validation results.

The experiment may mirror these bindings for evidence but does not invent a production receipt family. `submitted_user_prompt_bytes` means only the exact initial user message produced by the R10 renderer. It is not `final_provider_visible_bytes`, because platform system instructions, tool schemas, and adapter transforms are outside this experiment's byte-capture authority. Canonically, Prompt Pipeline performs Context Admission and bounded `PromptCapsule` compilation, while Packet Admission, Permissions/FileSafe decisions, and `ProviderDispatchAdmissionReceipt` bind exact final provider-visible bytes and dependencies (`Plans/Prompt_Pipeline.md:5121-5156`). Executor consumes the schema-closed `execution_unit_context` and forbids secrets or reconstruction from loose prose (`Plans/Executor_Protocol.md:146-196`).

For the active Codex diagnostic, one detached manifest commitment binds the exact one-row roster and acceptance policy. That adjacent commitment is a self-consistency check until the exact manifest, commitment, runner, verifier, schemas, capsule, and scorer inputs are present in the pushed Git `HEAD`; the launch runner refuses to create evidence or call a subject unless `HEAD == origin/main` and every launch input exactly equals its committed blob. The once-only run and verifier are additionally bound to the single exact evidence path `canary_003/r10-codex-canary-003-evidence`; an alternate descendant cannot create a second attempt with the frozen identities. The runner compiles the prompt, closed schema, oracle join, route, binary, controller dependency, timeout, sanitized child environment, and fresh temporary-root policy before any subject process exists. It then copies all frozen launch/scorer inputs into a read-only evidence snapshot and uses only that snapshot for dispatch and verification. This is disposable experimental custody, not a new production receipt family.

Generic JSON Schema validity is not provider admission. The experimental contract uses a deliberately closed positive subset for its frozen typed result schema; unknown keywords, non-finite numeric values, depth above 10, more than 5,000 aggregate object properties, more than 1,000 aggregate enum values, more than 120,000 counted property/enum string characters, and a string enum over 250 values with more than 15,000 value characters fail before any evidence root or `Popen`. Canary 001 established the provider-admission boundary by failing all three routes before inference when `uniqueItems` was accepted by Draft 2020-12 validation but rejected by Structured Outputs. Canary 002 removed that keyword, reached inference, returned the exact oracle, and then failed because it made zero Goal calls. Canary 003 isolates whether provider-side `--output-schema` encouraged immediate terminal output: it omits only that argv pair, while the same-shape inline and external schema remain frozen for post-capture validation, exact hidden-oracle equality, and explicit `source_ids` uniqueness. This diagnostic does not claim provider Structured Outputs conformance.

The route sequence is fail-stopped by semantic evidence, not merely process status. Immediately after each row capture, the runner invokes the verifier from the immutable snapshot in incomplete-prefix mode. That verifier replays the full launch, trace, effective runtime, one-submission, Goal lifecycle, bounded tool, typed-output, uniqueness, last-message, and exact-oracle checks for every captured row in the prefix. Only an immutable canonical prefix-PASS receipt, chained to the predecessor gate and exact row-evidence hashes, can authorize a later row in a multirow run. Any provider, process, transport, lifecycle, tool, output, scoring, verifier, or receipt failure leaves any later suffix explicitly unlaunched. Every successful `Popen` remains a launch lower bound even if receipt writing, capture, or cleanup fails. Final verification reconstructs attempted, launched, captured, post-`Popen`, and prefix-passed rosters from canonical evidence instead of trusting the runner summary. Canary 003 has one prefix gate, remains zero-credit even if it passes, and cannot satisfy the historical route canary or a matrix gate.

### 3. Native Goal worker

The fresh worker receives one ordinary user prompt:

```text
Create a goal that <bounded objective and typed capsule content>
```

For OMP only, the same bounded content is prefixed:

```text
/goal <bounded objective and typed capsule content>
```

The subject is never told to enter Goal Mode, wait, resume, ACK, receive a later slice, call `update_goal`, or stop Goal Mode. Native Goal lifecycle is verified afterward. Runtime-generated Goal continuation context is not another user submission. The worker does not decompose broader work, discover sources, choose its route, authorize actions, validate its own lineage, repair malformed output, retry, score, or certify completion.

`r10_contract.py` is the executable renderer/validator. It uses recursively key-sorted compact JSON with no insignificant whitespace or trailing newline inside the capsule, UTF-8 without ASCII escaping, a fixed platform prefix, and no ContextReceipt, host evidence, expected answer, lifecycle instructions, or runtime bindings in the submitted user prompt. It recomputes all UTF-8 counts and hashes, authenticates source and output-schema declarations, enforces aggregate ceilings and lineage joins, rejects forbidden choreography and unsupported provider-schema vocabulary, and fails closed before dispatch. The structural JSON Schema alone is not byte, hash, or provider-admission authority.

The verifier accepts direct Goal calls or an anchored one-call JavaScript wrapper grammar with one safely joined local result identifier. Computed properties, aliases, extra statements, multiple calls, nonliteral arguments, duplicate call IDs, missing outputs, and every non-Goal tool surface fail the row. Per row it admits exactly one `create_goal`, exactly one terminal `update_goal`, at most four `get_goal` calls, and at most six Goal calls total. It requires non-null task identities, non-overlapping paired task intervals, and causal `create_goal call -> active receipt -> update_goal complete call -> complete receipt -> typed final -> paired task_complete` ordering; terminal receipt and typed final share the same task turn. Automatic Goal turns may emit non-JSON assistant continuation messages, but exactly one assistant final may be a JSON object and it must be the schema-valid exact-oracle result joined to the CLI last-message capture. Every paired turn must expose the requested model/effort, the fresh temporary cwd as its only workspace root, `read-only` sandbox, `never` approvals, and the frozen managed read/network-restricted permission profile. The verifier itself must execute from the captured read-only snapshot and import the captured contract module, then self-join both hashes to the pushed manifest before interpreting evidence. Post-hoc rejection is acceptance enforcement rather than proof that unavailable tools were never materialized; raw tool inventories and the read-only sandbox remain evidence, and production tool materialization/FileSafe claims remain excluded.

## Deterministic flow

```text
durable breadth and owner registries
  -> higher-quality controller selects one work unit
  -> deterministic Context Admission
  -> one bounded PromptCapsule + host-only explanatory context record
  -> platform-specific one-prompt rendering
  -> exact-byte admission + Permissions/FileSafe/tool/schema checks
  -> fresh native Goal submission exactly once
  -> native activation / work / automatic continuation / terminal state
  -> raw capture
  -> independent schema, lineage, semantic, lifecycle, freshness, and accounting checks
```

Canonical support for this separation:

- Context Admission precedes protection and provider visibility; final bytes require separate dispatch admission (`Plans/Prompt_Pipeline.md:103-109`).
- Only request-selected Tool/Skill/MCP schemas are materialized; large catalogs stay external and on demand (`Plans/Prompt_Pipeline.md:5199-5224`).
- Goal Runtime consumes compact typed operational projections and never injects full registries, transcripts, process tables, secrets, or all Goal internals (`Plans/Goal_Runtime_System.md:124-136`).
- Child work defaults to read-only/proposal-only with finite ref, byte, token, result, tool-round, and retry ceilings (`Plans/orchestrator-subagent-integration.md:735-750`).
- FileSafe/Permissions own safety and mutation decisions; prompt prose cannot authorize them.

## Controller and specialist boundary

The relative higher-quality controller owns decomposition, unit selection, cross-unit synthesis, owner conflicts, trust-boundary decisions, launch authority, scoring policy, evidence adjudication, and acceptance. Weak workers receive only independently solvable units. Specialist roles are represented by separate bounded workflow-family units; no weak worker receives the full Plan corpus or a broad multi-owner synthesis task.

Independent reviewers must challenge the architecture, matrix coverage, and evidence after controller preparation. A reviewer finding is not itself failure or progress; the controller records disposition and reruns affected deterministic gates before launch.

## Route interpretation

For historical comparability, `route` in the first three-route canary means the preserved Codex roster:

- alpha: `gpt-5.4-mini`, `xhigh`;
- bravo: `gpt-5.4-mini`, `medium`;
- charlie: `gpt-5.6-luna`, `medium`.

OMP is a separate required transport-conformance lane because its native prefix differs and it is Windows-hosted. Canary 003 is only an alpha Codex diagnostic. After a Codex minimal vertical slice passes, a Windows OMP first-attempt conformance canary is a hard pre-matrix gate. The frozen full-matrix route set must include an OMP route or qualification remains blocked. Linux absence cannot establish OMP absence, and no duplicate OMP may be launched without Windows-native custody. Direct Assistant Chat is excluded from the blanket automated-process architecture and is not counted as a positive route or silently used as fallback.

## Coverage model and matrix denominator decision

The historical 291-row denominator is 97 semantic fixtures times the three-route roster. It remains comparable diagnostic evidence, but it is not automatically the R10 denominator. It overweights repeated selector/edge/tension variants and tests older transport forms, while it does not directly stratify every named automated workflow family or the corrected natural Codex Goal prompt.

R10 will freeze a smaller risk-stratified matrix only after both transport canaries. Every named workflow family must map to at least one independently scored semantic unit, and the matrix must include task-shape diversity for authority precedence, negative constraints, lineage, owner routing, ordered dependencies, schema conformance, safety denial, and honest evidence classification. The denominator will be derived from a frozen unit-to-family/scorer mapping rather than chosen to reproduce 291 mechanically. The current `workflow_coverage.json` is a static zero-credit inventory only. Any unrepresented family remains a blocker, not a residual silently waived.

## Acceptance and nonclaims

Canary 003 diagnostic acceptance is one fresh alpha first attempt with exactly one initial submission, valid activation-before-result evidence, correct host-validated typed output, genuine terminal Goal completion, no disallowed tool/read/write, and independently reopened evidence. Its row and fixed acceptance constants must survive one atomic preflight before launch and the frozen prefix verifier afterward. Credit is always zero. Canary 001 remains a permanent provider-admission failure; Canary 002 remains a permanent Goal-nonactivation failure even though its semantic answer was exact. A Canary 003 pass would support only the output-schema-interaction hypothesis and authorize a newly frozen minimal route canary; it would not repair or replace either failure.

Qualification requires an independently verified three-route Codex canary, an independently verified Windows-native OMP conformance canary, and then two consecutive clean full frozen matrices. Matrix runs use new task/thread/session/Goal identities and nonces but byte-identical architecture, compiler, capsule set, schemas, prompts except preregistered identity fields, route configuration including OMP, scorer, verifier, and acceptance rules. Any subject failure, controller-invalid row, missing row, lifecycle gap, unauthorized action, retry, replacement, best-of, or frozen-byte drift resets the streak to zero.

Passing this disposable experiment can support only the claim that the bounded one-prompt method was empirically qualified for the frozen routes, task families, and enforcement harness. It cannot prove current PuppetMaster implementation, production FileSafe or dispatch enforcement, provider-wide behavior, total provider-input smallness, safety, buildability, external-audit completion, or canonical Plan completion.

Named residual risks include platform-owned system/tool prompt size, any route where effective model/account identity is not exposed, controller/scorer correlated error, current runtime implementation gaps, host compromise, and untested provider/model families. OMP parity is a blocker until executed, not a residual accepted for qualification.
