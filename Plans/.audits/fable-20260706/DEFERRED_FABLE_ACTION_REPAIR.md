# Deferred FABLE Action Repair
Generated: 2026-07-08T12:00:00Z
## Scope
Processed all non-runtime FABLE rows from `remaining_action_plan_after_repair.jsonl` whose `remaining_action_plan_repair.final_disposition` was `explicitly_deferred`, excluding PNC-019/out-of-scope runtime certification. This pass is product/spec hygiene only and creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts. `buildability_gate_passed` remains false.
## Result
- repaired: 154
- explicitly_deferred: 13
- source_lineage_only: 3

## Deferred Rows
- `sfk-6e2bf4e4dd077d9ae2743668` / `fable-20260706-report-l0551-high-l952-1004-terminal-v1-record-families-listed-as-required-but-regist-fa7f642d`
  Owner: Plans/storage-plan.md
  Reopen hash: `d1998e2c152765ce48aed48e3cecb1bc195e7c10739a7446af1424a4a213b2ba`
  Reason: Explicitly deferred after inspection. Owner: Plans/storage-plan.md. Reason: closing this row requires the broader Terminal storage materialization lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Promote terminal_* families from required product contracts to materialized storage-value registry schemas with retention and positive/negative validators.
  Next lane prompt: Promote terminal_* families from required product contracts to materialized storage-value registry schemas with retention and positive/negative validators.
- `sfk-ddc264cdea296caf349adecd` / `fable-20260706-report-l0739-critical-l3891-7880-whole-second-half-every-command-row-ucc-049-through-2966bd7a`
  Owner: Plans/UI_Command_Catalog.md
  Reopen hash: `3aee0a11b9719218ace21fcc61d87a31e53a3e2982bb52f782d736ee1ac4f075`
  Reason: Explicitly deferred after inspection. Owner: Plans/UI_Command_Catalog.md. Reason: closing this row requires the broader UI command schema completion lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Expand UCC-049 through UCC-106 into full payload/result/error/disabled reason schemas; the current owner rule is a guard, not full row closure.
  Next lane prompt: Expand UCC-049 through UCC-106 into full payload/result/error/disabled reason schemas; the current owner rule is a guard, not full row closure.
- `sfk-4da31b138448d57593acde8d` / `fable-20260706-report-l0913-high-l4102-4150-ode-065-plugin-runtime-language-choice-js-ts-wasm-subpro-d13a0ed9`
  Owner: Plans/OpenCode_Deep_Extraction.md
  Reopen hash: `25c23e652f47bfd6ecafdd96c36a984cf9dfb4f26123225e1cc60b24eb611b4a`
  Reason: Explicitly deferred after inspection. Owner: Plans/OpenCode_Deep_Extraction.md. Reason: closing this row requires the broader Plugin runtime owner decision lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Choose JS/TS, WASM, subprocess, or dylib plugin runtime strategy in the plugin owner docs; do not infer it from OpenCode source lineage.
  Next lane prompt: Choose JS/TS, WASM, subprocess, or dylib plugin runtime strategy in the plugin owner docs; do not infer it from OpenCode source lineage.
- `sfk-ddd4dece078c664fd31f6de5` / `fable-20260706-report-l0929-critical-l44-54-57-invariants-describe-their-own-unresolved-gaps-correla-5fcc328d`
  Owner: Plans/Architecture_Invariants.md
  Reopen hash: `5d63a44f6df6242b4d9dae98ff47de749ba7e7ebd28a5b2c43fa55e2362a2a1b`
  Reason: Explicitly deferred after inspection. Owner: Plans/Architecture_Invariants.md. Reason: closing this row requires the broader Architecture invariant owner slice and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Resolve correlation_id trace-through and usage_event_ref special-case rules in owner fields, then remove unresolved gap prose.
  Next lane prompt: Resolve correlation_id trace-through and usage_event_ref special-case rules in owner fields, then remove unresolved gap prose.
- `sfk-937c36d705a22bf16645cca2` / `fable-20260706-report-l0930-high-l271-275-283-gate-003-001-010-cited-repeatedly-as-enforcement-autho-ac468e74`
  Owner: Plans/Architecture_Invariants.md
  Reopen hash: `785e4b740d2fd10b1106ec5c5e714aacd31662f6c8525fa83e4ee79573b1162f`
  Reason: Explicitly deferred after inspection. Owner: Plans/Architecture_Invariants.md. Reason: closing this row requires the broader Gate registry owner slice and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Publish or route GATE-001/GATE-003/GATE-010 enforcement authorities before using them as closure evidence.
  Next lane prompt: Publish or route GATE-001/GATE-003/GATE-010 enforcement authorities before using them as closure evidence.
- `sfk-bbe24dbaee588f11b4a55c4d` / `fable-20260706-report-l1074-critical-l370-doc-explicitly-admits-none-of-the-reserved-diagnostic-cate-9c605459`
  Owner: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
  Reopen hash: `91550ee748592d25c2a89ee07a79b2c30cde792b72011ec3de81e8574d74bc11`
  Reason: Explicitly deferred after inspection. Owner: Plans/Provider_Stream_Mapping_External_Reference_A2A.md. Reason: closing this row requires the broader Provider stream schema-versioning lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Add attempt_id-bearing diagnostic category schemas and validate provider-stream continuity fields.
  Next lane prompt: Add attempt_id-bearing diagnostic category schemas and validate provider-stream continuity fields.
- `sfk-e98bc6a59c457b5cf85d8d99` / `fable-20260706-report-l1075-high-l362-379-p5-provider-stream-continuity-recovery-requirements-sectio-c5d625b3`
  Owner: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
  Reopen hash: `040d70edf7f7dc444e554470c14b527ef3e5b808bf0c62a0ea331f8d298803bf`
  Reason: Explicitly deferred after inspection. Owner: Plans/Provider_Stream_Mapping_External_Reference_A2A.md. Reason: closing this row requires the broader Provider stream schema-versioning lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Convert raw P5 continuity/recovery audit prose into integrated versioned provider-stream requirements.
  Next lane prompt: Convert raw P5 continuity/recovery audit prose into integrated versioned provider-stream requirements.
- `sfk-382a8aaadd071809899261b5` / `fable-20260706-report-l1179-high-n-006-names-required-feature-families-corroboration-promotion-graph-6236a911`
  Owner: Plans/newfeatures.md
  Reopen hash: `2a00c87b9c5a67e3b1b4c2595d05874884134d57adb3bc04963837d0dc3a947e`
  Reason: Explicitly deferred after inspection. Owner: Plans/newfeatures.md. Reason: closing this row requires the broader Feature-family owner schema lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Land corroboration, promotion, graph-patch, and trust-state schemas/state machines in owner docs before closing the summary row.
  Next lane prompt: Land corroboration, promotion, graph-patch, and trust-state schemas/state machines in owner docs before closing the summary row.
- `sfk-d180028c03fc70fb93e6bfb8` / `fable-20260706-report-l1184-high-3-2-5-2-five-ssot-docs-listed-as-missing-stable-anchors-with-the-ga-2cb5a57f`
  Owner: Plans/OpenCode_Coverage_Matrix.md
  Reopen hash: `be9fbc1f0d391e173c2ca6485ab6c43a01533f930275de12c61f14cb9f579c7d`
  Reason: Explicitly deferred after inspection. Owner: Plans/OpenCode_Coverage_Matrix.md. Reason: closing this row requires the broader Stable-anchor owner lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Add stable anchors in the five owner docs named by OCM before treating the matrix as repaired.
  Next lane prompt: Add stable anchors in the five owner docs named by OCM before treating the matrix as repaired.
- `sfk-1c95c03aec7949b6ad8641a7` / `fable-20260706-report-l1286-critical-requirements-quality-report-schema-json-declares-schema-draft-0-1b80ab46`
  Owner: Plans/Release_Supply_Chain.md
  Reopen hash: `b45ff46dc9fd666c4547526dd56036142a91dc747d13572b9eb7ab66b254a1d8`
  Reason: Explicitly deferred after inspection. Owner: Plans/Release_Supply_Chain.md. Reason: closing this row requires the broader Schema artifact correction lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Migrate requirements_quality_report.schema.json to Draft 2020-12 and validate the schema set.
  Next lane prompt: Migrate requirements_quality_report.schema.json to Draft 2020-12 and validate the schema set.
- `sfk-aebb6fb13c915a60c1a5be40` / `fable-20260706-report-l1287-high-plan-graph-schema-json-s-change-budget-property-is-a-bare-unconstra-3696cb9e`
  Owner: Plans/Release_Supply_Chain.md
  Reopen hash: `e0be98d7a5e2167e8681a13ff28655c7bb3387b4f8cb49d632d9f59282a51892`
  Reason: Explicitly deferred after inspection. Owner: Plans/Release_Supply_Chain.md. Reason: closing this row requires the broader Schema artifact correction lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Wire plan_graph.change_budget to the typed change_budget schema instead of a bare object.
  Next lane prompt: Wire plan_graph.change_budget to the typed change_budget schema instead of a bare object.
- `sfk-c347a44e26b08efce550bdfd` / `fable-20260706-report-l1288-high-non-executable-closure-evidence-schema-json-7-fields-are-required-a-2fadeee0`
  Owner: Plans/Release_Supply_Chain.md
  Reopen hash: `e8f77598ed39c72dbaa6431b04c6e59fbaf40da1e72dd44ef2243d70b09da5e4`
  Reason: Explicitly deferred after inspection. Owner: Plans/Release_Supply_Chain.md. Reason: closing this row requires the broader Schema artifact correction lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Define nested shapes for non_executable_closure_evidence required object fields.
  Next lane prompt: Define nested shapes for non_executable_closure_evidence required object fields.
- `sfk-d62d739e27a728d8ad210435` / `fable-20260706-report-l1295-high-auto-decisions-jsonl-19-distinct-decision-id-values-are-reused-acro-67e0ebf4`
  Owner: Plans/Release_Supply_Chain.md
  Reopen hash: `e4a23111913602ab66cbf31b18e5afa639dffa8a9c26aa85c638710c3e63b1a2`
  Reason: Explicitly deferred after inspection. Owner: Plans/Release_Supply_Chain.md. Reason: closing this row requires the broader Auto-decisions identity lane and would be unsafe to fake in this product/spec hygiene slice. Reopen condition: Enforce unique future decision_id values or migrate historical duplicates to composite-key semantics with validator coverage.
  Next lane prompt: Enforce unique future decision_id values or migrate historical duplicates to composite-key semantics with validator coverage.

## Source-Lineage Only Rows
- `sfk-e04efb06a95454f9dd8c233d`
- `sfk-dfcc395f84654bcabdfbe6aa`
- `sfk-a842ba71d3915b955e7ddd63`

## Files Updated
- `Plans/.audits/fable-20260706/DEFERRED_FABLE_ACTION_REPAIR.md`
- `Plans/.audits/fable-20260706/deferred_fable_action_repair_report.json`
- `Plans/.audits/fable-20260706/deferred_fable_action_after.jsonl`
- `Plans/.audits/fable-20260706/remaining_action_plan_after_repair.jsonl`
- `Plans/.audits/fable-20260706/buildability_repair_registry.jsonl`
- `Plans/.audits/_semantic_closure_registry.jsonl`

## Runtime Boundary
PNC-019, IRB-005, and IRB-011 remain open. Static owner-doc evidence, semantic closure, schema validation, and green validators are not executable lifecycle certification.

## Validation
The clean validator capture at 2026-07-08T13:25:42Z passed all required commands:

- `pm-audit-closure validate`
- `pm-audit-closure validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status`
- `pm-plans-verify verify-spec-lock`
- `pm-plan-index validate`
- `pm-plan-migration validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`
- `pm-plans-verify validate-implementation-readiness`
- `pm-plans-verify validate-wiring-matrix`
- `pm-plans-verify lint-contractrefs`
- `pm-plans-verify validate-auto-decisions`
- `pm-plans-verify validate-evidence`
- `pm-shard-plans.py --check`
- `pm-plans-verify run-gates --subcheck-timeout-seconds 60`
- `git diff --check`

Generated governance artifacts were refreshed after owner-doc and wiring-matrix changes. `Plans/.plan_index/node_readiness_report.json` remains `blocked_runtime_certification_incomplete`; this is the required PNC-019 boundary, not a repair claim.
