# Shard 022: PlanUnits

Source: `Plans/Permissions_System.md`

Source lines: L1246-L1454

Source SHA256: `b2d14327c3315b32d81cbe50a93be4e5db83b75173f12463d216d7266bbc9926`

---

## PlanUnits

### PS-001 - Permissions System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: PS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Plans/Permissions_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- Permissions System (Canonical SSOT)
- Canonical owner-section requirements
- Requested/effective account identity contract
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- Canonical data-shape reconciliation
- Required data shape
- Acceptance carry-through
- P5 permission authority recovery
- 1. Definitions and scope
- 1.1 Path normalization invariants
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'
- 1.2 Tool registry/policy vs Permission rules
- 'ContractRef: ContractName:Plans/Tools.md, Primitive:DRYRules'
- 1.3 HTE vs DAE applicability
- 'ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE, ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 1.4 Permission-state mutation and hook safety
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md'
- 1.5 Executable capability surfaces and trust posture
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileSafe.md'
negative_constraints:
- 'Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries: the explicit `/actor/lane` scope key includes actor, run, lane, account, and package/seam context before approval reuse. The permission layer '
- Blocked-state approval actions map from canonical allowed_action_ids[] and allowed_action_ids, while graph approval actions target request_id; consumer surfaces must not split blocked-state authority away from request identity.
- 'Provider-gap disclosure is separate from overrides: provider-gap states honored, skipped, and clamped describe requested/effective provider behavior and must not be collapsed into generic override wording.'
- '- PM MUST NOT compare against an unresolved path as fallback.'
- Hooks that modify tool arguments or effective invocation context MUST trigger a fresh permission evaluation on the modified arguments before dispatch. Hook execution can narrow permissions, but MUST NOT widen them after the original check has already passed. This is the post-hook permission re-check
- 'Enterprise `/air-gapped` behavior distinguishes four canonical outcomes instead of collapsing them into generic network failure: `offline_cached`, `network_blocked_by_policy`, `host_unreachable`, and `host_untrusted`. Hosted and `/runtime` surfaces may show read-only cached state with freshness mark'
- Kubernetes policy is resolved through `k8s_host_policy`. It defines allowed contexts, clusters, namespaces, and `/verb` entries, including `apply`, `exec`, `port_forward`, and `logs`. Policy-denied but otherwise valid `/registry` or Kubernetes actions map to canonical blocked/`/denied` outcomes such
- '- Inheritance is additive-downward and merge-not-replace: a child may narrow authority, but MUST NOT widen or replace away inherited restrictions.'
- Terminal-owned shell execution and reveal flows use the same `/requested-vs-effective` permission-model disclosure as every other privileged runtime action. `Plans/Permissions_System.md` owns the permission wording, while Section15 owns the terminal session, reveal, and PTY behavior; permission UI m
- '- Query/task-granular and host-bound allow rules may become advanced-editor refinements later, but they must not block the base approval flow.'
- '**Behavior:** This guard is **non-bypassable**. `yolo` mode, scope-bound approval reuse, and generic prior allows MUST NOT suppress it. A direct user click approves only the exact remote side effect named by that clicked control. If one UI flow chains multiple remote side effects, Puppet Master MUST'
- '- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.'
- 'Permission prompts, denials, approvals, and blocked outcomes MUST write the same operational evidence to the audit stream and expose it in two complementary user-facing places: concise, collapsible in-thread transparency and a dedicated log/audit inspector for richer search, filtering, drill-down, a'
- '- Approval scope must not silently become same-session if lanes are parallel.'
- Plan mode and the Read-only preset are distinct permission concepts. Plan mode must not be treated as `deny-all-except-read`; it may allow information-gathering tools such as read/search/question/web operations and external-read web work while still denying project mutation. Read-only remains the na
- Read-only may explicitly set `websearch`, `webresearch`, `webfetch`, `webextract`, `webcrawl`, and `webmap` to `deny` for a strict offline/no-network preset. Entering `plan` mode must not auto-deny those web operations as a family, and `read_only` and `plan` must not be treated as synonyms. Permissi
- Automation-first is the baseline permission posture for non-interactive execution. Compatibility defaults such as HTE-by-default, visible-first local runs, `regular`, `/HTE`, and `visual_mode = auto` must not silently prefer visible runs or mandatory approvals when the effective policy supports auto
- Resolution happens before dispatch and again after any arg-touching hook mutation. The dispatch layer MUST NOT call the underlying tool implementation until both checks pass on the final argument set.
- Cleanup-sensitive approval and retention checks are permission-visible. If active-run ownership, unresolved blocked recovery, required safe-point restore, unresolved conflict inspection, or newer lineage dependency still exists, the target remains `retained`, `suspect`, or `restoring`, not cleanup_e
- The Debug Automation Profile is run-scoped. It is not a new global `/static` permission profile family and must not be appended to the existing global, project, Persona, or default profile layers as durable static policy. Permission disclosure records whether the active run received the profile thro
- 'Debug Investigation Context headers include `stop_reason_code`, `attention_required_reason_code`, `blocked_reason_code`, and `budget_kind` whenever the relevant state exists. Target binding is deterministic: PM auto-selects exactly one highest-precedence target when a single winner exists, reuses th'
- The Settings GUI, command-palette, API/CLI, and automation surfaces all mutate permission rules through the same canonical permission commands and storage records. GUI-only affordances must not become the sole management path for durable approval creation, revocation, or inspection.
- '**AC-PM06:** The `always` response (§6.2) MUST bind approval to the canonical blocked episode and MAY reuse it only through an exact `approval_scope_key` match or explicit durable project/global rule creation. It MUST NOT create a blind session-wide allow.'
- '- `yolo` mode MUST NOT auto-allow this guard'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- 'Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries: the explicit `/actor/lane` scope key includes actor, run, lane, account, and package/seam context before approval reuse. The permission layer '
- Automation-first is the baseline permission posture for non-interactive execution. Compatibility defaults such as HTE-by-default, visible-first local runs, `regular`, `/HTE`, and `visual_mode = auto` must not silently prefer visible runs or mandatory approvals when the effective policy supports auto
- Owner-level gate wording must stay deterministic. Phrases such as `Execution contract (recommended)`, `targeted for future enforcement`, or other non-deterministic gate language are compatibility notes only and do not weaken required owner-doc enforcement once a permission gate owns the rule.
- 'The resolved permission set for the active session (merged from all layers) is also persisted to redb as part of `config:v1` under the key `tool_permissions` for compatibility with the existing config schema defined in `Plans/Tools.md` §10.1. The TOML files are the durable source of truth; the redb '
- '- blocked/recovery action visibility must use `allowed_action_ids[]` and blocked-episode identity rather than legacy request-era fields'
- '- Runtime payload field names are closed: legacy `recovery_options[]` and `allowed_actions[]` are compatibility aliases only and MUST NOT replace `allowed_action_ids[]` in new blocked or recovery payloads.'
stale_retired_dispositions:
- 'Permission prompts are no longer session-centric or under-bound: `ask -> deny unless HITL at current tier boundary` is a deprecated tier-era behavior, and the active blocked-overlay flow requires HITL, `/account`, `/lane/run/account`, shared-runtime, actor, lane, run, account, and operational identi'
- Degraded-trust and projection-health are permission-visible trust inputs. Permission cards, approval surfaces, Orchestrator, Usage, widgets, and provider surfaces consume one degraded-trust / projection-health / concern bridge so stale, degraded, or restricted-trust render states cannot masquerade a
- '- Browser-session permission tiers use canonical storage values `always_allowed`, `session_granted`, and `explicit_confirmation`; UI/source aliases `always-allowed`, `session-granted`, and `explicit-confirmation` are lineage labels only and do not revive the retired preview/browser `trust-tier` matr'
- '- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.'
- '- stale or degraded projections do not become authoritative just because they are visible in the UI'
- '- mutating actions must revalidate or gate when permission-relevant projections are stale, degraded, or unavailable'
- '- `blocked_preflight` is used for stale target, undeclared host, drift, or capability/preflight failures discovered before dispatch; these outcomes do not masquerade as `failure_class`'
- '- Every mutating action revalidates stable target identity immediately before execution, including stale table rows, stale cards, and stale `/selections`. If the selected target has materially changed, the action aborts with `state_changed_refresh_required` and requires refresh or reselection.'
- 'Domain approval and preflight decisions close the historical blind-spot where an action name was approved without the exact mutable target. SCM approvals carry `project_id`, `repo_id`, optional `worktree_id`, `/worktree/context`, `branch`, and `commit`; GitHub Actions approvals carry `repo_remote`, '
owner_boundary_notes:
- '# Permissions System (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master permission system — the rules that govern when a tool invocation is allowed, requires user approval, or is denied. All other plan documents MUST reference this document by anchor (e.g., `Plans/Permissions_System.md#PERM-
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '## Canonical data-shape reconciliation'
- '- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id'
- '- Under `## Canonical data-shape reconciliation` -> `### Required data shape`, explicitly place `requested_account_id` alongside `requested_account_policy`.'
- '- Define `requested_account_binding` and keep `provider_account_id` governed only as subordinate provider-native metadata rather than canonical account identity.'
- '- State that OpenCode session IDs move into provider-native correlation fields instead of canonical `thread_id`.'
- 'Permission prompts are no longer session-centric or under-bound: `ask -> deny unless HITL at current tier boundary` is a deprecated tier-era behavior, and the active blocked-overlay flow requires HITL, `/account`, `/lane/run/account`, shared-runtime, actor, lane, run, account, and operational identi'
- 'Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries: the explicit `/actor/lane` scope key includes actor, run, lane, account, and package/seam context before approval reuse. The permission layer '
- Blocked-state approval actions map from canonical allowed_action_ids[] and allowed_action_ids, while graph approval actions target request_id; consumer surfaces must not split blocked-state authority away from request identity.
- GATE-003, GATE, owner-doc, and ContractRef syntax defects are hard owner-doc integrity failures, not style preferences, when permission or gate cards expose contract links.
- Small permission surfaces keep canonical terms and compact labels. Source Control remains worktree-first, graph badges and inspector chips stay dense, and `/contextual` help links expand to deeper explanations instead of renaming local jargon.
- 4. Match only against the normalized canonical path.
- 'Enterprise `/air-gapped` behavior distinguishes four canonical outcomes instead of collapsing them into generic network failure: `offline_cached`, `network_blocked_by_policy`, `host_unreachable`, and `host_untrusted`. Hosted and `/runtime` surfaces may show read-only cached state with freshness mark'
- Kubernetes policy is resolved through `k8s_host_policy`. It defines allowed contexts, clusters, namespaces, and `/verb` entries, including `apply`, `exec`, `port_forward`, and `logs`. Policy-denied but otherwise valid `/registry` or Kubernetes actions map to canonical blocked/`/denied` outcomes such
- 'The tool invocation is paused pending user approval. The user is presented with the invocation details and MUST choose one of the canonical resolution options: `deny`, `once`, `for session`, or `always` (see §6). If no user is available (headless/Orchestrator run), `ask` maps to `deny` unless a HITL'
owner_hints:
- Plans/Permissions_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

