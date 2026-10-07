# ER10 normalized working snapshot

**WORKING / IN_PROGRESS — no final-campaign counts or general winner.**

The immutable population is **40 ordered logical slots / 80 logical arms**. There are **53 bound version records**, including unstarted authorized successors; versions and review/helper stages do not enlarge the population.

Owner capture cutoff: `2026-10-07T21:56:51.848034+00:00`. Final frozen-reference capture cutoff: `2026-10-07T22:08:00.910972+00:00`. The captures are not simultaneous, and the report never watches live files.

Validation: **23/23 passed**. The separate CLI replay with the explicit field map matched all four JSON byte identities. Unknown fields remain NULL.

## Mathematically grounded working partitions

- both_required_final_deliveries_and_explicit_task_trees_quiet: 16
- explicitly_unstarted_or_held_authorized_successor: 5
- in_progress_or_unresolved_delivery_mapping: 19

These categories describe explicitly mapped candidate artifact delivery and candidate tree quiet. They are not full-science/source-pass/whole-campaign closure counts. FAST03 candidate pair freeze is separate from its two IN_PROGRESS reviews. Every slot still has `campaign_terminal: null` in this working helper artifact.

## Separate final-authorized arm axes

| Axis | Explicit true | Explicit false | Unknown |
|---|---:|---:|---:|
| all_required_source_claims_verified | 0 | 1 | 79 |
| full_declared_scientific_scope_assessed | 40 | 3 | 37 |
| full_declared_source_scope_assessed | 6 | 4 | 70 |
| native_active_observed | 13 | 5 | 62 |
| native_complete_observed | 41 | 5 | 34 |
| required_final_artifact_delivery_observed | 38 | 10 | 32 |
| required_process_history_verified | 0 | 0 | 80 |
| review_within_original_allowance | 21 | 2 | 57 |
| scientific_six_axis_assessment_complete | 11 | 0 | 69 |
| t3_task_tree_quiet | 62 | 0 | 18 |

Every row has denominator 80. These axes overlap and must not be added to each other. Source claims verified and required process/history do not follow from six scientific axes or declared scope. NULL means absent/ambiguous/unassessed, never zero defects, zero time or PASS.

## Original confirmations

Four exact comparisons remain frozen: **3 delivered pair assessments / 1 both-full declared-source pair / 0 qualified wins; all 28 original tasks quiet**.

- C01: control grade NULL, review artifact MISSING with interrupted reviewer T3 status; original defect count 0 preserved, normalized defect count NULL. Treatment original FAIL with full declared scientific scope.
- C02: original control FAIL/full, treatment HOLD with 2 material defects and O1 chronology unassessed. The absent top both-full field is disclosed and derived solely as AND of explicit arm booleans `[true, false]`.
- C03: diagnostic delivered pair. Original control HOLD/2 material defects with required chronology unassessed; treatment FAIL/2 material defects with full science and actual native BLOCKED. Native/comparative HOLD is retained; no scientific grade is rewritten.
- C04: both-full original pair. Control FAIL/1 material defect, treatment PASS_WITH_LIMITATIONS/0 material defects. Empirical and provenance limits persist.

## Prospective authority and operational remainder

The prospectively final targeted versions are M02A/B-v3, M03B-v2, M06A/B-v3, M07A/B-v3, M08A/B-v3, M09A/M10A-v3, M12A-v3, M13A-v2, M14A/M15A/M16A-v3; the other targeted cases use v1. METHOD02/04 use v2, other METHOD cases v1; GLM anchor retains its bound v2 repair and earlier v1 diagnosis, other anchors use their own frozen v1. All FAST and confirmations use v1.

M06A/B, M07A/B and M09A are explicitly unstarted/held at the captured status. M16 is running in the owner snapshot. Cohort2's earlier published six terminal dispositions are kept, but its v3 M06 slots remain unstarted. Cohort1's seven pair-version dispositions are six logical slots.

The observed immutable references show completed frozen METHOD04-v2 reviews and FAST02's treatment review beyond the launch brief. Those are retained at their actual captured identities and timestamps. FAST03's two reviewer states remain IN_PROGRESS; no final campaign closure is inferred.

## Unresolved source/schema mapping

There are **945 unresolved field/lineage records** in `unresolved-schema-mapping.json`. Their exact paths, hashes, pointers and original observations are available. Most are deliberate unknown axes, not parsing errors.

- all_required_source_claims_verified: 79
- comparable_required_final_elapsed_seconds: 60
- full_declared_scientific_scope_assessed: 37
- full_declared_source_scope_assessed: 70
- material_defect_count: 44
- method_eligibility: 68
- native_active_observed: 62
- native_complete_observed: 34
- native_terminal_status: 47
- original_source_grade: 23
- prior_version_lineage_binding: 13
- provenance_eligibility: 74
- required_final_artifact_delivery_observed: 32
- required_process_history_verified: 80
- review_delivery_status: 14
- review_within_original_allowance: 57
- scientific_six_axis_assessment_complete: 69
- t3_task_tree_quiet: 18
- time_eligibility: 64

Thirteen prior-version lineage bindings lack a separately bound v1 outcome row in these owner snapshots. Earlier failures/costs and all exact original owner records are retained; no missing v1 outcome, grade or cost is fabricated. Root may provide additional explicit immutable lineage evidence. Full declared-source scope remains unknown in 70 arms because a generic scientific-scope flag/count cannot establish that stronger source coverage claim.

## Telemetry and claims

The independent root validation hash-joins the old SDK observation: 208 unique native-session inventory entries, 72 groups and 147 distinct summed sessions. Groups retain their mixed roles and are not assigned wholesale to candidate arms. The observation is a separate old supplement, not complete current campaign/arm usage. Original grade/economic NULL fields stay original. Native cumulative proxies are unsummed; billing, remaining quota, pricing and affordability are unknown.

Original per-arm/version clocks, seed/setup/queue/handoff/overlap and failed costs are preserved separately. Newly computed ratios are DESCRIPTIVE_ONLY and require explicit matched final deliveries/clocks. No missing final/native proof or reduced scope creates speed-win credit. Shared seed cost is fully charged to each cold arm and once in an aggregate; occupied sum is distinct from parallel critical path; no enclosing-stage double count is introduced.

## Principal identities

- `normalizer.py` SHA-256 `09affee74e9131867995f0e03f8cb7d62d565708fa795918808af5faf9877f5a`
- `field-map.json` SHA-256 `233f6b2e8a3fd4c31f8aa203889c7dcead3ebc4b09f235e5132f1f1b35ee010a`
- `WORKING-normalized.json` SHA-256 `1918c04b7f0dfa984572c1c852e611675a35c4a0a5b7b24e9a1295f5c7ccf3e6`
- `validation.json` SHA-256 `b357cd8f19aa21429741041a895caafefe04c6b0eb19beb30869f5cc9a5444c3`
- `unresolved-schema-mapping.json` SHA-256 `bc6be331e0a436a99d10cf4f5f7ae28ba600ae6182e89053cc4252d54fb0cbb6`

See `README.md` for the offline commands, field definitions, exact public evidence resolver and later explicit immutable snapshot workflow. Root independently verifies and writes the final report after all campaign jobs quiet.
