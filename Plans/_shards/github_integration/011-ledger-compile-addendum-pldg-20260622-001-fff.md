# Shard 011: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/GitHub_Integration.md`

Source lines: L1947-L1989

Source SHA256: `e357a371e977ceb9d69036408fe9f06fc917e7326d501a1981f3da9f8c50140a`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### GI-033 - Remote Git Cache Discovery Transport And Disclosure

```yaml
plan_unit_id: GI-033
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  GitHub Integration is a supporting consumer for remote Git/non-Git cache transport, disclosure, reconnect, staging/re-anchor, verification path, and no-silent-local-fallback alignment used by DiscoveryService. It consumes storage, worktree, FileSafe, and permission contracts for remote cache/admin disclosure and must not define an alternate discovery/search layout, alternate ranking policy, or product behavior owner for native discovery.
gui_related: true
gui_classification_reason: Remote/cache disclosure, reconnect, and admin states are user-visible integration surfaces.
depends_on: [GI-027, GI-028, GI-029, GI-032, SP-218, W-074, F2-191, PS-118]
unblocks: [ATS-011]
acceptance_criteria:
  - Remote Git/cache discovery disclosures align with storage/worktree/FileSafe/permission owner contracts.
  - GitHub Integration does not become the discovery behavior, search, or ranking owner.
  - No local substitution is presented as remote truth.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future remote cache disclosure tests.
  - Future no-local-substitution integration checks.
risk_class: remote_cache_consumer_drift
reasoning_tier: standard
context_scope: github_remote_discovery_consumer
implementation_surfaces: [Plans/GitHub_Integration.md, future remote Git cache adapter]
node_compile_hint: {mode: supporting_remote_cache_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0054
  - pldg-20260622-001-fff:atom-0061
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Copernicus
source_atom_ids: [atom-0054, atom-0061, atom-0069, atom-0079, atom-0085, atom-0091]
preserved_exact_tokens: ["remote Git", "remote_cache", "SSH/reconnect", "verification paths", "staging/re-anchor", "no-silent-local-fallback", "alternate discovery/search layout"]
negative_constraints:
  - Do not define alternate discovery/search layout or ranking behavior in GitHub Integration.
  - Do not block local-only planning or build completion solely because GitHub is unavailable.
owner_hints: [Plans/GitHub_Integration.md, Plans/storage-plan.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```
