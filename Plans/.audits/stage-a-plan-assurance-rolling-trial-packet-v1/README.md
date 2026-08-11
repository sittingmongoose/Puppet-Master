# Plan Assurance Rolling Trial Packet v1

Status: **PACKET DESIGN ONLY — TRIAL NOT AUTHORIZED**  
Scope: a read-only, capability-sliced pilot over the whole canonical Puppet Master Plans corpus  
Packet owner: bounded controller lane  
Canonical Plans changed by this packet: **no**

## Purpose

This packet defines the smallest usable trial of the revised Plan Assurance method. It preserves the useful part of F3—creative external discovery with strict authority separation—while adding the denominators F3 lacked: a whole-corpus structural map, a named `SurfaceInstanceLedger`, a `CapabilityObligationGraph`, named scenarios, adequacy-triggered failure research, and separate measurements for semantic quality and evidence retrieval.

F3 remains immutable as `FINAL_VALID_NEGATIVE_STOP`. This packet neither repairs nor relabels F3.

## Boundary

This packet does **not** launch the trial. A separate explicit authorization is required before any semantic worker, external research, model call, or trial run may begin.

The eventual trial is read-only. It may create artifacts only beneath its separately authorized trial run root. It may not:

- edit canonical `Plans/**` content;
- edit generated shards, evidence, governance locks, readiness state, or indexes;
- stage, commit, push, or publish Git changes;
- certify implementation readiness or buildability;
- implement or modify Planning Wizard;
- use the F3 hidden oracle or hidden-source portfolio as pilot planning input;
- treat exact hidden-URL retrieval as semantic credit.

## How the future trial runs

1. **Freeze and authorize in the correct order.** Capture `PROTECTED_BEFORE` and freeze the exact `LAUNCH_REQUEST`. The controller must then receive one fresh, nonce-bound structured authorization message through Codex platform-controlled collaboration sender metadata from the exact expected parent task and consume it in that same controller turn before creating the single-use marker or performing any external action. The exact authorization payload, message ID, turn ID, platform-created time, observed sender and target, and consumption time are all hash-bound. `TRUSTED_LAUNCH_CAPABILITY` is the read-only capture of that live attestation; it is not an offline credential. A path, thread ID, pasted delegation, quoted approval, self-hash, or controller-authored boolean is not authority. If live sender metadata is unavailable, the honest terminal is `TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE`.
2. **Freeze and classify once.** Inventory every path beneath `Plans/`. Classify every path as canonical, generated, governance/support, source-lineage, audit, retired, or unknown. Any unknown path blocks the structural gate.
3. **Build one structural map.** Map every canonical document, substantive section, PlanUnit, acceptance unit, and relevant cross-reference. Hash every mapped segment. Later workers receive hash-bound capability slices, never arbitrary repeated whole-corpus windows.
4. **Build the named surface denominator.** Extract actors, journeys, entry points, pages/panels, controls, commands, events, services, stores, artifacts, providers, and stateful instances. Abstract templates are recorded separately and cannot close named instances.
5. **Run four capability pilots.** Usage/accounting truth, web/research behavior, accessibility/control contracts, and migrations/durable state run concurrently subject to a twelve-unit global ceiling. Each family normally uses two semantic workers: a local expectation modeler and a creative external discoverer.
6. **Recover evidence only when needed.** One conditional failure-evidence worker per family may be activated when the open research pass lacks concrete failure evidence, credible alternatives, current authority, or applicability evidence. Every source claim must resolve to the exact byte slice of a typed request/response capture. After recovery, the controller recomputes every adequacy trigger over the combined open and recovery portfolios; unsupported closure claims fail closed. There is no URL quota.
7. **Build and realize obligations.** The controller merges only supported claims into the obligation graph, binds consequential obligations to named instances and scenarios, and leaves disputed or unsupported claims unresolved. Every required control is carried as its exact frozen assertion into structured scenario semantics, with typed environment tuples, states, allowed/forbidden transitions, failure terminals, recovery steps, acceptance oracles, and control/instance backlinks.
8. **Close the frontier incrementally.** Target only uncovered critical/major obligations and changed slices. A family stops after two successive targeted passes add no critical/major obligation or material semantic change and all research-adequacy gaps are resolved or explicitly limited.
9. **Measure without collapsing.** Semantic coverage, evidence sufficiency, exact-source overlap, precision, authority safety, named realization, controls, novelty, misses, cost, and latency remain separate. Results may recommend scaling or method revision, but cannot approve a build.

Accessibility is a revealed known-answer realization calibration, not an independent rediscovery test. Its result must carry `discovery_efficacy_eligible=false` and `scale_inference_eligible=false`; only Usage, Web, and Migrations contribute evidence to any later scale inference. Accessibility remains separately useful for answerability, named realization, and cargo-cult rejection.

## Concurrency and cost shape

- Global maximum: twelve active units including the controller.
- Default per active capability: two semantic workers.
- Conditional expansion: at most one failure-evidence worker for that capability; a fourth recovery request queues rather than exceeding the global ceiling.
- One controller owns all writes to the future run root.
- Existing local expectation modelers rotate across other families as fresh read-only challengers after graph lock; this uses no extra context and prevents the controller from certifying its own merge.
- Structural extraction, hashing, reference resolution, graph diffs, and metric arithmetic are deterministic work, not model work.
- Research and graph artifacts are cached by capability and source freshness; wording-only changes do not invalidate unrelated slices.

Exact ceilings and gates are in `ROLLING_TRIAL_CONTRACT.json`.

## Packet contents

- `ROLLING_TRIAL_CONTRACT.json` — authority, scope, stages, roles, budgets, metrics, gates, stop rules, and terminal states.
- `LAUNCH_REQUEST.schema.json` — immutable pre-approval request and launch-binding preimage.
- `TRUSTED_LAUNCH_CAPABILITY.schema.json` — single-use capture of a fresh Codex collaboration-system sender attestation. Offline validation can verify its bindings and replay safety, but cannot prove authorship.
- `LAUNCH_AUTHORITY.schema.json` — required shape of the separate, exact, single-generation launch authorization this packet does not grant.
- `PROTECTED_STATE.schema.json` — exact Git and protected-file BEFORE/AFTER receipts; dirty state may be nonempty but must remain invariant after excluding only untracked run-root files.
- `SOURCE_SNAPSHOT.schema.json` — independently re-inventoried live `Plans/` population bound before structural mapping.
- `STRUCTURAL_COVERAGE_MAP.schema.json` — one-time whole-corpus structural inventory and capability routing.
- `SURFACE_INSTANCE_LEDGER.schema.json` — named product-instance denominator.
- `RESEARCH_OPERATION_CAPTURE.schema.json` — exact request/response bytes and operation identity for each external research action.
- `RESEARCH_PORTFOLIO.schema.json` — typed external operations, source cards, creative findings, failures, and unsearched areas for one research worker.
- `RESEARCH_ADEQUACY_RECEIPT.schema.json` — controller-derived adequacy triggers, recovery-worker activation, and research-limited terminal derivation.
- `REQUIRED_CONTROL_REGISTRY.schema.json` — the frozen common-visible 33-control population with exact named-instance or unresolved-identity bindings.
- `FRESH_CHALLENGE_RECEIPT.schema.json` — separately bound rotated challenge coverage and findings after graph/control lock.
- `CAPABILITY_OBLIGATION_GRAPH.schema.json` — claims, evidence, contribution edges, named realization, and loss lineage.
- `ASSURANCE_RESULT.schema.json` — separated outcome measures and per-stage loss attribution.
- `TRIAL_SUMMARY.schema.json` — exactly four family results, cross-family saturation, aggregate resource/artifact fuses, protected invariance, and campaign terminal derivation.
- `PILOT_FAMILY_BRIEFS.md` — live-repo-grounded seeds and controls for the four pilots.
- `validate_packet.py` — deterministic local coherence validator.
- `validate_trial_artifacts.py` — deterministic future-instance validator using Draft 2020-12 JSON Schema plus embedded false-ready mutation tests.
- `PACKET_VALIDATION.json` — recorded validation evidence and hashes.
- `CONTROLLER_DECISION.json` — packet terminal decision only; never launch authority.

## Interpreting a ready decision

`READY_FOR_TRIAL_AUTHORIZATION` means only that this packet is internally coherent enough for a human/controller to decide whether to authorize a new read-only trial. It is not that authorization, a Plan-quality verdict, a buildability verdict, or permission to modify the repository.

The future full-bundle validator must receive `--repo-root`, `--trusted-launch-capability`, repeated `--research-capture` inputs, four `--research` artifacts, four `--adequacy` receipts, one `--control-registry`, and four `--challenge` receipts in addition to the source, structural, surface, four graph/result, summary, contract, source-root, and run-root inputs. It recomputes final Git state, verifies every typed artifact and exact response-slice binding, and deliberately refuses to treat an offline capability file as proof of sender identity. The live controller must supply the exact structured authorization payload plus platform sender, target, message, turn, creation-time, and observation metadata at the authority boundary. An offline complete bundle therefore terminates `TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE`; packet validation alone never launches the trial.
