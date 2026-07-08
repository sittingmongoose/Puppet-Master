# Shard 009: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/GitHub_Integration.md`

Source lines: L1807-L1853

Source SHA256: `e357a371e977ceb9d69036408fe9f06fc917e7326d501a1981f3da9f8c50140a`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### GI-031 - Optional GitHub Promotion For Plans-To-Code Execution

```yaml
plan_unit_id: GI-031
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  GitHub integration is an optional promotion/output layer for plans-to-code execution. When configured, it handles auth, remote state, push, pull request creation, PR status, and GitHub Actions checks after local Executor/source-control receipts establish local truth. Local source-control/worktree state remains execution truth and local-only project completion must not require GitHub. GitHub receipts consume repo_id, branch/head state, baseline/head commits, changed files, PR refs, Action/check refs, conflicts, merge/promotion result, and rollback context from Executor and WorktreeGitImprovement.
  GitHub optional promotion records PR and GitHub Actions evidence only when configured.
gui_related: true
gui_classification_reason: PR, status, checks, and promotion results are user-visible GitHub/source-control surfaces.
depends_on: [GI-030, W-072, EP-100]
unblocks: [EP-103, RAP-029, POA-048]
acceptance_criteria:
  - Local source-control truth is established before GitHub promotion output.
  - GitHub is not required for local-only completion.
  - PR and GitHub Actions status are recorded only when configured and authenticated.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future GitHub promotion receipt validation
risk_class: github_required_for_local_completion
reasoning_tier: standard
context_scope: plans_to_code_github_promotion
implementation_surfaces: [Plans/GitHub_Integration.md, Plans/GitHub_API_Auth_and_Flows.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: github_optional_promotion, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0038
  - pldg-20260617-001-plans-to-code-handoff:atom-0039
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "GitHub optional"
  - "PR"
  - "GitHub Actions"
  - "local source-control truth"
  - "merge_or_promotion_receipt"
negative_constraints:
  - Do not require GitHub for local-only project completion.
owner_hints:
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Executor_Protocol.md
```

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md
