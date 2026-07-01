# Shard 033: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/FileSafe.md`

Source lines: L13201-L13244

Source SHA256: `9a245704a35dc4162bed38d7d309cee2719981dc81997bc3392e285c29f6f5e5`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### F2-191 - Discovery FileSafe No-Leak Indexing And Result Guards

```yaml
plan_unit_id: F2-191
unit_type: constraint
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe rules apply before and during DiscoveryService indexing and querying. FileSafe, ignore rules, secret exclusions, symlink policy, root/home scan guardrails, project/worktree boundaries, and remote/SSH authorized-root boundaries filter candidates before scoring or produce an equivalent no-leak guarantee. Denied or hidden_by_policy candidates are not success-shaped ranked results and must not leak blocked filenames, blocked counts, rank gaps, matched ranges, display paths, fallback diagnostics, health messages, or rank explanations. candidate_count is visible post-policy only, and selected_result_ids are opaque/redaction-profiled identifiers rather than raw unauthorized paths.
gui_related: false
gui_classification_reason: This is FileSafe policy and no-leak filtering, not direct GUI presentation.
depends_on: [F2-188, F2-190, SP-217, SP-218]
unblocks: [PS-118, ATS-011, RAP-031]
acceptance_criteria:
  - Policy-hidden paths cannot influence visible rank gaps, counts, summaries, or diagnostics.
  - Root/home and symlink guardrails apply before discovery indexing and query ranking.
  - Remote/SSH manifest entries are FileSafe-gated before dispatch and before local indexing.
validation_surfaces:
  - Future denied/hidden-by-policy no-leak tests.
  - Future root/home refusal, ignore, symlink, and remote authorized-root tests.
risk_class: filesafe_no_leak
reasoning_tier: high
context_scope: discovery_policy_filtering
implementation_surfaces: [Plans/FileSafe.md, future DiscoveryService policy filter]
node_compile_hint: {mode: filesafe_no_leak_guard, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0039
  - pldg-20260622-001-fff:atom-0057
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0082
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/precision_contract.json#visibility_and_redaction_policy
source_atom_ids: [atom-0039, atom-0057, atom-0069, atom-0082, atom-0083, atom-0090, atom-0091]
preserved_exact_tokens: ["filter before scoring", "candidate_count", "visible post-policy count only", "selected_result_ids", "opaque", "redaction_profile", "hidden_by_policy", "rank gaps", "matched_ranges", "display_path", "diagnostics"]
negative_constraints:
  - Do not leak blocked filenames through GUI rows, summaries, receipts, rank gaps, or diagnostics.
  - Do not expose raw selected paths to unauthorized consumers through selected_result_ids.
  - Do not run remote manifest discovery outside authorized remote project roots.
owner_hints: [Plans/FileSafe.md, Plans/Permissions_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md]
```
