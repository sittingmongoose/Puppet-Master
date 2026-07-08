# Shard 028: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/usage-feature.md`

Source lines: L5767-L5777

Source SHA256: `72bdae3668eee969c2de469ca4d8ce227c67636de732ddbee56c90f385d2122e`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 242` (repaired; source line 868; `sfk-243d9819162bc839409ce15b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L788-864: cites `Widget_System.md` 2/3/4/7 but that file's real headings are 1-4 only renumber cross-refs.
- `registry_line 243` (repaired; source line 869; `sfk-f5e4f21174c14fb661692c70`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L515: references a `Unified UsageRecord schema` heading that doesn't exist anywhere in the file write it or drop the claim.
- `registry_line 244` (repaired; source line 870; `sfk-08907092c21fff88a8b7c871`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L5601-5686: UsageAnomalyGuard has no spike ratio/window/confidence formula defined.
- `registry_line 245` (repaired; source line 871; `sfk-829f3e79121c4f7c6355204a`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L563,629,614: refresh interval and 90-day retention lack concrete config keys/enforcement mechanism.
- `registry_line 371` (repaired; source line 1242; `sfk-7d2d295617efe72e4e966b52`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L100-116: internal section numbering (1/2/3/4) doesn't match external "7" cross-references from other docs (e.g. usage-feature.md) this file has no 7 at all.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
