# Document Packaging Policy (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. Deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and alignment

This policy defines deterministic packaging for long Markdown/text artifacts under `.puppet-master/**` into **Document Sets**.
It governs runtime/project artifacts only and does not redefine repository plan-shard generator outputs under `Plans/_shards/**`.

Plan graph stays unchanged: user-project plan graph remains canonical sharded JSON at `.puppet-master/project/plan_graph/index.json` with node shards under `nodes/<node_id>.json` as defined in `Plans/Project_Output_Artifacts.md`. Document Sets are a parallel mechanism for large text artifacts and follow the same sharded set + index + manifest concept.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/DRY_Rules.md#7

---

## 1. Document Set contract

A Document Set MUST be a directory artifact containing:

1. `00-index.md` (reading order, provenance, and explicit generated-file warning)
2. `manifest.json` (source sha256, split rule metadata, ordered shard list, line ranges, shard sha256 values)
3. ordered shard files named `NN-*.md` or `NN-*.txt` containing exact source segments
4. `evidence/` directory containing verification outputs for audits A/B/C

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### 1.1 `00-index.md` requirements

`00-index.md` MUST include:
- source logical path
- deterministic generation marker derived from `source_sha256`
- source sha256
- split rule summary
- ordered shard listing with filenames and line ranges
- exact warning line: `Generated artifact. Do not edit shards directly; regenerate from canonical source.`

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### 1.2 `manifest.json` requirements

`manifest.json` MUST include, at minimum:
ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014
- `source_path`
- `source_sha256`
- `source_line_count`
- `split_rule` object (`kind`, parameters, fence handling mode)
- `shards[]` in canonical order where each item has:
  - `order`
  - `filename`
  - `start_line`
  - `end_line`
  - `segment_sha256`
  - `byte_count`

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### 1.3 Naming rules

Shard filenames MUST be deterministic:
- numbering starts at `01`
- zero padding width is `max(2, digits(total_shards))`
- filename format is `<zero_padded_index>-<slug>.<ext>`
- `<ext>` MUST match source text type (`md` for Markdown sources, `txt` for plain text sources)
- `<slug>` is lowercase kebab-case from split heading text; fallback slug is `chunk-<start_line>-<end_line>`

ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-014

---

## 2. Deterministic split rules

### 2.1 Primary split rule

Primary split MUST occur at Markdown headings that begin with `## ` and are outside fenced code blocks.

Fence handling MUST ignore heading-like lines while inside fenced blocks opened by lines starting with triple backticks or `~~~`; only matching fence delimiters close the active fence context.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### 2.2 Fallback split rule

If primary split does not produce valid bounded shards, splitter MUST use deterministic fixed line chunks.

Fallback parameters MUST be recorded in `manifest.json.split_rule` and applied uniformly.

ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-014

---

## 3. Trigger budgets and deterministic defaults

Packaging MUST trigger when any threshold is reached:
- `max_bytes = 262144`
- `max_estimated_tokens = 65536` with estimate `char_count / 4`
- `fallback_chunk_lines = 400` (used by fallback rule in §2.2)

These defaults MUST be recorded in `Plans/auto_decisions.jsonl` and reused consistently unless superseded by a higher-precedence SSOT source.

ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-014

---

## 4. Losslessness proof (hard requirement)

A packaged Document Set MUST satisfy all losslessness proofs:

1. **Reconstruction hash equality:** concatenating shard bytes in manifest order yields `sha256 == source_sha256`.
2. **Line accounting completeness:** every source line index is covered exactly once (no gaps, no overlaps).
3. **Idempotency:** regeneration in place with identical inputs yields no diffs.
4. **Clean-room determinism:** regeneration in an empty temp directory yields byte-identical `00-index.md`, `manifest.json`, shard files, and audit evidence hashes.

ContractRef: Gate:GATE-014, PolicyRule:Decision_Policy.md§2

---

## 5. Three independent audits (full coverage, no sampling)

Every packaging run MUST execute all three audits:

- **Audit A — Full verification PASS:** reconstruction hash equality + line accounting + idempotency all pass for the full shard set.
- **Audit B — Index/manifest exact match:** index ordering, manifest ordering, shard existence, and no extra files all pass.
- **Audit C — Clean-room regeneration proof:** clean-room outputs are byte-identical to primary outputs and hash reports match.

Audit outputs MUST be written under `evidence/` and linked from `00-index.md`.

ContractRef: Gate:GATE-014, ContractName:Plans/Progression_Gates.md

---

## 6. Enforcement coverage and run failure rule

The following artifact families MUST comply with this policy when size triggers are reached:
ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

1. Requirements builder staging outputs under `.puppet-master/requirements/**`
2. Canonical project Markdown/text artifacts under `.puppet-master/project/**`, including:
   - `.puppet-master/project/requirements.md`
   - `.puppet-master/project/plan.md`
   - `.puppet-master/project/traceability/requirements_coverage.md`
   - `.puppet-master/project/quickstart.md`
3. Any other subsystem writing Markdown/text artifacts under `.puppet-master/**` through the same writer abstraction and gate contract referenced by SSOT docs updated in this change.

Non-bypassable rule: if a tracked artifact exceeds budget and no valid Document Set exists with passing audits A/B/C, the run MUST fail.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, Gate:GATE-014

---

## References
- `Plans/Project_Output_Artifacts.md`
- `Plans/Progression_Gates.md`
- `Plans/Decision_Policy.md`
- `Plans/DRY_Rules.md`
