# Storage-plan full pre-WorkNode sandbox

This experiment tests the simplified bounded-context architecture on one already-standardized large canonical plan. It reads `Plans/storage-plan.md` but writes only under this sandbox. It does not edit Plans, ledgers, Spec Lock, shards, evidence governance, or the planning index, and it never creates a NodeSeed, WorkNode, executable queue, final node manifest, implementation file, runtime launch, or production build task.

## Pipeline boundary

The deterministic host performs the complete document-scoped path:

1. bind the exact source, canonical parser, current indexed comparison rows, global PlanUnit ID registry, and completed migration coverage;
2. extract every PlanUnit fence from the full 974,842-byte document with the canonical `pm-plan-index.py` parser;
3. generate every acceptance unit and the document card;
4. classify every dependency edge as internal, external-known, or missing against the frozen existing registry;
5. compare all extracted PlanUnit and acceptance rows to the already-generated canonical subset;
6. carry forward the honest global validation and PNC-019 runtime-certification blockers; and
7. emit a node-readiness disposition that explicitly stops before WorkNode creation.

The subject model does not receive the plan body, global index, history, migration files, hidden oracle, or host implementation. It receives only one bounded PromptCapsule containing the small phase receipts required to report the final pre-WorkNode gate.

The v1 diagnostic required subjects to infer canonical output spellings from differently named raw failure strings. Ox Alpha/free and Cursor independently copied those raw strings and failed the hidden renaming. Their rows remain permanent failures. In this successor, every scored value and type is either a same-named typed admitted fact or the explicitly supplied result schema ID. The full oracle/result line is still absent. This qualifies bounded typed-receipt assembly, not an independent semantic audit.

## Native Goal surfaces

- OMP receives one interactive TUI prompt beginning `/goal `. Both `advisor.enabled` and `task.agentAdvisor` must be off immediately before launch. A row-bound receipt captures the exact OMP binary/profile/version and raw outputs of every frozen effective-config query; its hash is joined through the launch receipt and ordinal launch journal. No ordinary tools, skills, or rules are needed.
- Codex receives one app task prompt beginning naturally `Create a goal that `. Native Goal activation and completion are qualified from the raw rollout, not from `read_thread` summaries.
- No subject receives lifecycle choreography, a second prompt, a retry, answer repair, or a replacement.

The two passes use unchanged source, parser, registry, migration inputs, capsule bytes, output contract, oracle, route configuration, and scorer. Each row has a fresh task/session/cwd identity. OMP Ox Alpha/free runs first, Cursor second, and Qwen last. A model-specific failure is preserved but does not erase independently requested rows for the other prescribed models.

## Expected honest disposition

Storage extraction and comparison are expected to pass. Pre-WorkNode readiness is expected to remain blocked because:

1. the pre-existing canonical global validation reports a stale `node_readiness_report.json`; and
2. PNC-019 executable runtime certification is incomplete.

The typed result must therefore report structural success, `canonical_node_readiness_artifact_stale`, `pnc019_runtime_certification_incomplete`, and `no_worknodes_created=true`. This is architecture qualification evidence only, not product readiness, safety certification, canonical Plan completion, or authority to create work nodes.
