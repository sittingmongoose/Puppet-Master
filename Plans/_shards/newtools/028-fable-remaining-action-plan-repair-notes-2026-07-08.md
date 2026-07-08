# Shard 028: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/newtools.md`

Source lines: L8607-L8622

Source SHA256: `ffbd051250477260c68d5b762039fa9642fad62b6b3303c875094edf86260873`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 186` (repaired; source line 715; `sfk-88d1096d2627a98e841dc23e`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L173-186: `FrameworkEntry`/`ToolEntry` catalog struct has no full field-type schema, only prose bullets.
- `registry_line 187` (repaired; source line 716; `sfk-4d4d2855408c239af5a00ef3`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L340,1116: "action catalog" schema/action-ID/scenario-file format referenced repeatedly, never defined only points to `src/automation/` as a reference location.
- `registry_line 188` (repaired; source line 717; `sfk-daa3fd5eb054bd8c6be82b8d`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] doctor.mcp.context7, doctor.registry.auth, doctor.dockerhub.auth.capability, doctor.docker.buildx, doctor.debug.* (6+ check families) asserted "canonical" throughout newtools.md but zero hits when grepped against the docs that should also define/register them.
- `registry_line 189` (repaired; source line 718; `sfk-8d03b002e270c0c2db010037`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L5610 (N2-095): preflight failure fields (code, severity, dependency, expected, observed, remediation) given with no enum of `code` values or `severity` levels.
- `registry_line 190` (repaired; source line 719; `sfk-181db601e331e0d9b1cd52c7`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4923-4926: manifest.json field list is a token list only, not a schema; "render hints" undefined.
- `registry_line 191` (repaired; source line 720; `sfk-c5e20efd85f389d003c5cf07`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L7423 (N2-132): "deny-code families" for a shared trust/proxy/governance preflight are named but never enumerated, with no link to the exact Permissions_System.md mechanism.
- `registry_line 192` (repaired; source line 721; `sfk-d832771f93a3e3541cd1b774`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L7473 (N2-133): instrumentation-scope records (temporary/durable status, cleanup path) have no schema or storage location.
- `registry_line 193` (repaired; source line 722; `sfk-18048251633869d004e48189`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L7267 (N2-129): debug target registry (launch config, URL, attach PID, browser session) has no stated storage location redb? in-memory? file?
- `registry_line 194` (repaired; source line 723; `sfk-69876bef3b441cb17b89d231`): Owner-doc note resolves split_recommended residue as a tracked owner-doc cleanup item, not implementation readiness proof. Source summary: - [HIGH] ~8 instances of `split_recommended: true` across N2-096 through N2-140 with no visible resulting split systemic pattern, not one-off.
- `registry_line 195` (repaired; source line 724; `sfk-db7708202eb32b69931bb737`): Owner-doc note repairs duplicate or ambiguous section authority by requiring title/PlanUnit anchors and retiring numeric-only references. Source summary: - [HIGH] L8814 vs L8873: two units (N2-120, N2-141) encode the same "doctor.registry.auth is deprecated" constraint with different scope language, unreconciled duplicate source of truth.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
