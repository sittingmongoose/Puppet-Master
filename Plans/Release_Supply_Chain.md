# Release Supply Chain

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns release, install/update, migration/rollback, binary provenance, AI-CI taint, and supply-chain currentness contracts compiled from `pldg-20260703-001-feature-intake`.
> **PlanProfile:** New Plan Authoring Profile

## 0. Scope

`Plans/Release_Supply_Chain.md` owns Puppet Master release/install/update provenance, release migration and rollback gates, binary/hash/signing/SBOM expectations, AI-assisted CI taint protections, release tag/currentness policy, and release-facing supply-chain receipts. It does not own provider behavior, credential storage, file safety, GitHub transport, or GUI presentation; those remain with their named owner docs and consume this release/supply-chain contract.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Automated_Testing_System.md

## 1. Ownership And Consumers

Primary owner: `Plans/Release_Supply_Chain.md`.

Consumers and adjacent owners:
- `Plans/Progression_Gates.md` consumes release gates and rollout blocking criteria.
- `Plans/Project_Output_Artifacts.md` consumes package/provenance artifact expectations.
- `Plans/GitHub_Integration.md` consumes release-tag/currentness and GitHub workflow constraints.
- `Plans/Permissions_System.md` and `Plans/FileSafe.md` own user approval, secret custody, filesystem boundaries, and sensitive material handling.
- `Plans/Automated_Testing_System.md` owns release, migration, platform, and link-validation test execution surfaces.
- `Plans/BinaryLocator_Spec.md` consumes binary discovery and platform diagnostics without owning install/update policy.

## 2. Canonical PlanUnits

### RSC-001 - P0-RELEASE-MIGRATION-GATE

```yaml
plan_unit_id: RSC-001
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P0-RELEASE-MIGRATION-GATE (P0) is compiled as canonical Puppet Master intent for Release, installer, migration, and rollback hardening: Add Release_Compatibility_and_Migration.md or PlanUnits under Progression_Gates. All major updates must run state-migration and rollback fixtures before users get them. The preserved PM gap/delta is: Need a release compatibility plan: canary/stable rings, artifact provenance, generated-link checks, state migration tests, downgrade/backup restore, extension/CLI/server protocol handshake, terminal session preservation across updates. The observed external-repo signal remains source-lineage evidence: Cline v4 issues report task corruption and release stability concerns; Agent Zero issue list includes missing upgrade tag, v2 regression, Launcher/self-update bugs; Pi has binary/provenance and packaging/link issues; Ghostty 1.3.1 quickly patched 1.3.0 regressions; Warp changelog shows frequent migration/restore fixes; Codex changelog shows frequent CLI/app releases.
  Case L propagation makes the migration portion executable as a release gate by consuming the storage-owned compatibility, migration-journal, mandatory-backup, offline-restore, recovery-disposition, and receipt contracts plus the Automated Testing System fixture receipts. Release does not define a peer migration or restore algorithm.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- One-version-ahead redb, seglog, and EventRecord fixtures block before writer/projector/migration start and prove the target root is unchanged.
- Migration crash cuts after backup, between steps, before/after the version stamp, and before receipt publication converge to the storage-owned committed, verified rollback, or blocked state with no ordinary-open mixed store.
- Major-version release evidence includes a verified shared-boundary backup, restore preflight, kill-mid-restore convergence, previous-major alias migration, and unsupported-old/newer-backup refusal.
- Every materialized canonical non-rebuildable family has release evidence for its registry-owned mandatory-backup/restore disposition; projection rebuild is not accepted as recovery proof for canonical redb state.
- Disk-space preflight and progress-interruption fixtures prove no backup or mutation begins below the exact required space and that restart resumes from the durable journal.
- Startup recovery action inventory proves metadata diagnostics and retry gates expose no generic live verify/repair/salvage command, Doctor mutation mode, store editor, bypass token, force-cancel, or try-anyway path.
- Generated release links validate.
- Protocol version mismatch blocks with actionable message.
- App update does not orphan terminal/process sessions silently.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Plans/Automated_Testing_System.md#ATS-024
- FX-L001-*, FX-L002-*, FX-L003-*, FX-L016-*, FX-L025-*, and FX-L032-* fixture receipts
- Generated release links validate.
- Protocol version mismatch blocks with actionable message.
- App update does not orphan terminal/process sessions silently.
risk_class: p0_security_release_supply_chain_hardening
reasoning_tier: high
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Release_Supply_Chain.md
- Plans/Progression_Gates.md
- Plans/Project_Output_Artifacts.md
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/Contracts_V0.md
- Plans/Automated_Testing_System.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p0_release_migration_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Case-L:L-001
- Case-L:L-002
- Case-L:L-003
- Case-L:L-016
- Case-L:L-025
- Case-L:L-031
- Case-L:L-032
- Case-L:PD-L-01..PD-L-06
- PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
- pldg-20260703-001-feature-intake:atom-0012
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0012
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0008/P0-RELEASE-MIGRATION-GATE@line=8
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0008/P0-RELEASE-MIGRATION-GATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:8
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0012
external_atom_id: extrepo-20260703-0008
source_row_id: P0-RELEASE-MIGRATION-GATE
priority: P0
finding_family: Release, installer, migration, and rollback hardening
source_repos:
- cline/cline
- agent0ai/agent-zero
- earendil-works/pi
- ghostty-org/ghostty
- warpdotdev/warp
- openai/codex
target_docs:
- Plans/Progression_Gates.md
- Plans/Project_Output_Artifacts.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
owner_hints:
- Plans/Progression_Gates.md
- Plans/Project_Output_Artifacts.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
preserved_exact_tokens:
- blocked_newer_store
- StorageMigrationCoordinator
- backup-before-any-migration-step
- data_loss_risk
- pm.storage_value.migration_receipt.v1
- extrepo-20260703-0008
- P0-RELEASE-MIGRATION-GATE
- P0
- Release, installer, migration, and rollback hardening
- cline/cline
- agent0ai/agent-zero
- earendil-works/pi
- ghostty-org/ghostty
- warpdotdev/warp
- openai/codex
negative_constraints:
- Do not in-place downgrade, ordinary-open a half-migrated or mixed-restored store, or expose try_anyway/live viewer access to unsupported newer state.
- Do not accept projection rebuild as recovery proof for canonical non-rebuildable redb state.
- Do not treat plan validation, fixture registration, or a terminal receipt alone as evidence that runtime migration, backup, restore, or crash convergence executed.
observed_signal: Cline v4 issues report task corruption and release stability concerns; Agent Zero issue list includes missing upgrade tag, v2 regression, Launcher/self-update bugs; Pi has binary/provenance and packaging/link issues; Ghostty 1.3.1 quickly patched 1.3.0 regressions; Warp changelog shows frequent migration/restore fixes; Codex changelog shows frequent CLI/app releases.
pm_current_coverage: PM has governance gates and protected namespace, but release/migration strategy is not as explicit as runtime specs.
pm_gap_or_delta: 'Need a release compatibility plan: canary/stable rings, artifact provenance, generated-link checks, state migration tests, downgrade/backup restore, extension/CLI/server protocol handshake, terminal session preservation across updates.'
proposal_or_recommendation: Add Release_Compatibility_and_Migration.md or PlanUnits under Progression_Gates. All major updates must run state-migration and rollback fixtures before users get them.
compile_disposition: create_new_planunit
```

### RSC-002 - P2-DOCS-GENERATED-LINK-VALIDATION

```yaml
plan_unit_id: RSC-002
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P2-DOCS-GENERATED-LINK-VALIDATION (P2) is compiled as canonical Puppet Master intent for Generated docs/release notes link validation: Add GeneratedMarkdownLinkCheck to governance seal. The preserved PM gap/delta is: Need link-mode validators for generated Markdown across GitHub, local GUI, terminal/plaintext, and app viewer. The observed external-repo signal remains source-lineage evidence: Pi issue reports generated release-note relative links broken on GitHub/terminal and suggests improving prompt/tests.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Release notes/bootstrap docs validate relative links under repo, GitHub rendered, and app routes.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Release notes/bootstrap docs validate relative links under repo, GitHub rendered, and app routes.
risk_class: p2_security_release_supply_chain_coverage
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Release_Supply_Chain.md
- Plans/Progression_Gates.md
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: p2_docs_generated_link_validation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0022
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0022
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0018/P2-DOCS-GENERATED-LINK-VALIDATION@line=18
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0018/P2-DOCS-GENERATED-LINK-VALIDATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:18
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0022
external_atom_id: extrepo-20260703-0018
source_row_id: P2-DOCS-GENERATED-LINK-VALIDATION
priority: P2
finding_family: Generated docs/release notes link validation
source_repos:
- earendil-works/pi
target_docs:
- Plans/Progression_Gates.md
- Plans/Project_Output_Artifacts.md
owner_hints:
- Plans/Progression_Gates.md
- Plans/Project_Output_Artifacts.md
preserved_exact_tokens:
- extrepo-20260703-0018
- P2-DOCS-GENERATED-LINK-VALIDATION
- P2
- Generated docs/release notes link validation
- earendil-works/pi
negative_constraints: []
observed_signal: Pi issue reports generated release-note relative links broken on GitHub/terminal and suggests improving prompt/tests.
pm_current_coverage: PM has governance shards/evidence and plan validators.
pm_gap_or_delta: Need link-mode validators for generated Markdown across GitHub, local GUI, terminal/plaintext, and app viewer.
proposal_or_recommendation: Add GeneratedMarkdownLinkCheck to governance seal.
compile_disposition: create_new_planunit
```

### RSC-003 - P2-BINARY-PROVENANCE-ASSETS

```yaml
plan_unit_id: RSC-003
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P2-BINARY-PROVENANCE-ASSETS (P2) is compiled as canonical Puppet Master intent for Binary/provenance/codesigning: Add ReleaseArtifactProvenance PlanUnit. The preserved PM gap/delta is: Need release asset signature/hash/SBOM policy for any PM distributed binary/plugin/bridge. The observed external-repo signal remains source-lineage evidence: Pi issue requests SHA256SUMS/provenance for binaries; Cline has AMFI/codesign killed CLI and Darwin sign PRs; Codex ships npm CLI releases.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every downloadable binary/plugin has SHA256, signing/provenance, build source ref, and install verification.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every downloadable binary/plugin has SHA256, signing/provenance, build source ref, and install verification.
risk_class: p2_transport_websocket_streaming_coverage
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Release_Supply_Chain.md
- Plans/Project_Output_Artifacts.md
- Plans/Progression_Gates.md
node_compile_hint:
  mode: p2_binary_provenance_assets
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0023
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0023
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0019/P2-BINARY-PROVENANCE-ASSETS@line=19
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0019/P2-BINARY-PROVENANCE-ASSETS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:19
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0023
external_atom_id: extrepo-20260703-0019
source_row_id: P2-BINARY-PROVENANCE-ASSETS
priority: P2
finding_family: Binary/provenance/codesigning
source_repos:
- earendil-works/pi
- cline/cline
- openai/codex
target_docs:
- Plans/Project_Output_Artifacts.md
- Plans/Progression_Gates.md
owner_hints:
- Plans/Project_Output_Artifacts.md
- Plans/Progression_Gates.md
preserved_exact_tokens:
- extrepo-20260703-0019
- P2-BINARY-PROVENANCE-ASSETS
- P2
- Binary/provenance/codesigning
- earendil-works/pi
- cline/cline
- openai/codex
negative_constraints: []
observed_signal: Pi issue requests SHA256SUMS/provenance for binaries; Cline has AMFI/codesign killed CLI and Darwin sign PRs; Codex ships npm CLI releases.
pm_current_coverage: PM has Spec Lock/governance hashes but product release asset provenance is not detailed.
pm_gap_or_delta: Need release asset signature/hash/SBOM policy for any PM distributed binary/plugin/bridge.
proposal_or_recommendation: Add ReleaseArtifactProvenance PlanUnit.
compile_disposition: create_new_planunit
```

### RSC-004 - P2-CONFIG-SCHEMA-MIGRATION-FIXTURES

```yaml
plan_unit_id: RSC-004
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P2-CONFIG-SCHEMA-MIGRATION-FIXTURES (P2) is compiled as canonical Puppet Master intent for Accepted/retired config schema migration tests: Imported external-repo finding extrepo-20260703-0036 / P2-CONFIG-SCHEMA-MIGRATION-FIXTURES (P2). The preserved PM gap/delta is: Add fixtures for accepted current names, retired names with explicit help, JSON/JSONC, generated bridge config cwd/profile root, PM-managed vs attached server config, migration dry-run/rollback. The observed external-repo signal remains source-lineage evidence: OpenCode v2 reworks config discovery and issue #8868 shows json/jsonc confusion; Agent Zero/Cline releases expose upgrade/migration risks.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Legacy config name gives deterministic migration message
- Generated bridge config writes only to run cwd/profile root
- Attached server profile cannot be silently mutated
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Legacy config name gives deterministic migration message
- Generated bridge config writes only to run cwd/profile root
- Attached server profile cannot be silently mutated
risk_class: p2_security_release_supply_chain_coverage
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Release_Supply_Chain.md
- Plans/MCP_Integration.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: p2_config_schema_migration_fixtures
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0040
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0040
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0036/P2-CONFIG-SCHEMA-MIGRATION-FIXTURES@line=36
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0036/P2-CONFIG-SCHEMA-MIGRATION-FIXTURES
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:16
source_atom_ids:
- atom-0040
external_atom_id: extrepo-20260703-0036
source_row_id: P2-CONFIG-SCHEMA-MIGRATION-FIXTURES
priority: P2
finding_family: Accepted/retired config schema migration tests
source_repos:
- anomalyco/opencode
- cline/cline
- agent0ai/agent-zero
target_docs:
- Plans/MCP_Integration.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Release_Supply_Chain.md
owner_hints:
- Plans/MCP_Integration.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Release_Supply_Chain.md
preserved_exact_tokens:
- extrepo-20260703-0036
- P2-CONFIG-SCHEMA-MIGRATION-FIXTURES
- P2
- Accepted/retired config schema migration tests
- anomalyco/opencode
- cline/cline
- agent0ai/agent-zero
negative_constraints: []
observed_signal: 'OpenCode v2 reworks config discovery and issue #8868 shows json/jsonc confusion; Agent Zero/Cline releases expose upgrade/migration risks.'
pm_current_coverage: Prior backlog included release/migration gates; MCP Integration has config fields and provider projection.
pm_gap_or_delta: Add fixtures for accepted current names, retired names with explicit help, JSON/JSONC, generated bridge config cwd/profile root, PM-managed vs attached server config, migration dry-run/rollback.
compile_disposition: create_new_planunit
```

### RSC-005 - P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN

```yaml
plan_unit_id: RSC-005
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN (P0) is compiled as canonical Puppet Master intent for AI-assisted CI/release supply-chain attack surface: Imported external-repo finding extrepo-20260703-0074 / P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN (P0). The preserved PM gap/delta is: Prior PM passes covered permissions and release provenance, but underweighted agentic CI workflows where untrusted issue/PR text becomes model instructions and tool calls inside release-adjacent automation. The observed external-repo signal remains source-lineage evidence: Clinejection: untrusted GitHub issue title reached a Claude issue-triage bot with Bash/Read/Write/Edit access, pivoted through GitHub Actions cache poisoning, and led to unauthorized npm package cline@2.3.0. | OpenCode github@latest tag drift shows release automation/currentness can silently lag active releases. | Codex changelog hardens command safety, browser-origin websocket handshakes, and repo-provided Git helper execution.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- AI issue/PR triage workflows must default to read-only/no-shell/no-write permissions and require explicit escalation receipts for any tool with filesystem, shell, cache, credential, or release access.
- All untrusted external text entering an agentic CI prompt carries a taint envelope and cannot be interpreted as tool/policy instructions.
- Release workflows that hold publish credentials must not consume untrusted caches; cache provenance and OIDC provenance are validated before publish.
- Package/update artifacts require signed provenance/SBOM/hash/attestation checks and latest-tag drift detection.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- AI issue/PR triage workflows must default to read-only/no-shell/no-write permissions and require explicit escalation receipts for any tool with filesystem, shell, cache, credential, or release access.
- All untrusted external text entering an agentic CI prompt carries a taint envelope and cannot be interpreted as tool/policy instructions.
- Release workflows that hold publish credentials must not consume untrusted caches; cache provenance and OIDC provenance are validated before publish.
- Package/update artifacts require signed provenance/SBOM/hash/attestation checks and latest-tag drift detection.
risk_class: p0_security_release_supply_chain_hardening
reasoning_tier: high
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: p0_ai_ci_untrusted_content_supply_chain
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0078
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0078
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0074/P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN@line=74
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0074/P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0078
external_atom_id: extrepo-20260703-0074
source_row_id: P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN
priority: P0
finding_family: AI-assisted CI/release supply-chain attack surface
target_docs:
- GitHub_Integration.md
- Permissions_System.md
- Decision_Policy.md
- Contracts_V0.md
- Automated_Testing_System.md
- Spec_Lock / governance seal docs
- new Supply_Chain_Security.md if owner doc is missing
owner_hints:
- GitHub_Integration.md
- Permissions_System.md
- Decision_Policy.md
- Contracts_V0.md
- Automated_Testing_System.md
- Spec_Lock / governance seal docs
- new Supply_Chain_Security.md if owner doc is missing
preserved_exact_tokens:
- extrepo-20260703-0074
- P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN
- P0
- AI-assisted CI/release supply-chain attack surface
negative_constraints: []
observed_signal: 'Clinejection: untrusted GitHub issue title reached a Claude issue-triage bot with Bash/Read/Write/Edit access, pivoted through GitHub Actions cache poisoning, and led to unauthorized npm package cline@2.3.0. | OpenCode github@latest tag drift shows release automation/currentness can silently lag active releases. | Codex changelog hardens command safety, browser-origin websocket handshakes, and repo-provided Git helper execution.'
pm_gap_or_delta: Prior PM passes covered permissions and release provenance, but underweighted agentic CI workflows where untrusted issue/PR text becomes model instructions and tool calls inside release-adjacent automation.
relationship_to_prior_reports: New P0. Prior binary provenance was too narrow; this adds natural-language-to-CI toxic-flow defense.
compile_disposition: create_new_planunit
```

### RSC-006 - P1-PLATFORM-BINARY-COMPATIBILITY-GATE

```yaml
plan_unit_id: RSC-006
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P1-PLATFORM-BINARY-COMPATIBILITY-GATE (P1) is compiled as canonical Puppet Master intent for Code signing, static binaries, platform packaging, sandbox setup, and OS-specific runtime gates: Imported external-repo finding extrepo-20260703-0084 / P1-PLATFORM-BINARY-COMPATIBILITY-GATE (P1). The preserved PM gap/delta is: Release provenance was covered; platform binary compatibility and OS gate diagnostics need their own receipts. The observed external-repo signal remains source-lineage evidence: Cline recent issue reports macOS AMFI code-signing kill of the CLI binary. | Warp statically compiled Linux CLI/warpctl for compatibility and fixed Windows GPU/UI lag. | Codex changelog includes Windows sandbox provisioning and platform-specific sandbox/network behavior.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every packaged helper/CLI/runtime declares signing/notarization/static-linking/sandbox entitlement state per OS.
- Startup diagnostics distinguish code-signing/AMFI/quarantine/GPU/sandbox/network-deny failures from generic launch failures.
- Platform matrix CI includes macOS quarantine/signature, Windows sandbox/network, Linux static/dynamic library checks.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every packaged helper/CLI/runtime declares signing/notarization/static-linking/sandbox entitlement state per OS.
- Startup diagnostics distinguish code-signing/AMFI/quarantine/GPU/sandbox/network-deny failures from generic launch failures.
- Platform matrix CI includes macOS quarantine/signature, Windows sandbox/network, Linux static/dynamic library checks.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: p1_platform_binary_compatibility_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0088
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0088
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0084/P1-PLATFORM-BINARY-COMPATIBILITY-GATE@line=84
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0084/P1-PLATFORM-BINARY-COMPATIBILITY-GATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:11
source_atom_ids:
- atom-0088
external_atom_id: extrepo-20260703-0084
source_row_id: P1-PLATFORM-BINARY-COMPATIBILITY-GATE
priority: P1
finding_family: Code signing, static binaries, platform packaging, sandbox setup, and OS-specific runtime gates
target_docs:
- Automated_Testing_System.md
- FinalGUISpec.md
- GitHub_Integration.md
- Installer/Packaging docs if present
- Contracts_V0.md
owner_hints:
- Automated_Testing_System.md
- FinalGUISpec.md
- GitHub_Integration.md
- Installer/Packaging docs if present
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0084
- P1-PLATFORM-BINARY-COMPATIBILITY-GATE
- P1
- Code signing, static binaries, platform packaging, sandbox setup, and OS-specific runtime gates
negative_constraints: []
observed_signal: Cline recent issue reports macOS AMFI code-signing kill of the CLI binary. | Warp statically compiled Linux CLI/warpctl for compatibility and fixed Windows GPU/UI lag. | Codex changelog includes Windows sandbox provisioning and platform-specific sandbox/network behavior.
pm_gap_or_delta: Release provenance was covered; platform binary compatibility and OS gate diagnostics need their own receipts.
relationship_to_prior_reports: Narrower than binary provenance; covers runtime compatibility failure classes.
compile_disposition: create_new_planunit
```

### RSC-007 - P1-INSTALL-UPDATE-PROVENANCE

```yaml
plan_unit_id: RSC-007
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  P1-INSTALL-UPDATE-PROVENANCE (P1) is compiled as canonical Puppet Master intent for Install/update/package provenance receipts: Imported external-repo finding extrepo-20260703-0098 / P1-INSTALL-UPDATE-PROVENANCE (P1). The preserved PM gap/delta is: Installer/update flows need artifact signatures, owner/mode inventory, channel, rollback, migration, and validator receipts. The observed external-repo signal remains source-lineage evidence: Package owner/signing/self-update issues recur across GUI/CLI tools.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Package ownership/mode mismatches fail install validation
- Self-update records source/hash/channel/rollback
- Signing/notarization/entitlement checks are surfaced before rollout
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Package ownership/mode mismatches fail install validation
- Self-update records source/hash/channel/rollback
- Signing/notarization/entitlement checks are surfaced before rollout
risk_class: p1_security_release_supply_chain_hardening
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: p1_install_update_provenance
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0102
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0102
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0098/P1-INSTALL-UPDATE-PROVENANCE@line=98
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0098/P1-INSTALL-UPDATE-PROVENANCE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:11
source_atom_ids:
- atom-0102
external_atom_id: extrepo-20260703-0098
source_row_id: P1-INSTALL-UPDATE-PROVENANCE
priority: P1
finding_family: Install/update/package provenance receipts
source_repos:
- Warp
- OpenAI Codex
- Agent Zero
preserved_exact_tokens:
- extrepo-20260703-0098
- P1-INSTALL-UPDATE-PROVENANCE
- P1
- Install/update/package provenance receipts
- Warp
- OpenAI Codex
- Agent Zero
negative_constraints: []
observed_signal: Package owner/signing/self-update issues recur across GUI/CLI tools.
pm_gap_or_delta: Installer/update flows need artifact signatures, owner/mode inventory, channel, rollback, migration, and validator receipts.
compile_disposition: create_new_planunit
```

## 3. Contracts, Schemas, Events, Or Data Shapes

Release and supply-chain receipts are contract-level requirements until product schemas are introduced by the owning implementation phase. Required receipt concepts include release source refs, package hashes, signing/notarization evidence, channel identity, rollback provenance, AI-CI taint labels, and migration-gate outcomes. Concrete schema materialization is not_applicable during this ledger-to-Plans compile.

## 4. Integration Surfaces

Release supply-chain contracts integrate with GitHub release flows, binary locator diagnostics, project output artifacts, progression gates, automated release/migration tests, FileSafe restore and secret handling, and permission-scoped CI/tool execution. This doc does not introduce runtime dispatch, queues, or implementation files.

## 5. Validation And Acceptance

Validation uses the PlanUnit acceptance criteria above plus `python3 scripts/pm-plan-index.py validate`, `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake`, and later governance seal gates when explicitly requested. Release tests must cover generated links, binary hashes/signing/provenance, migration rollback, config schema migration, AI-CI taint/default read-only behavior, and install/update provenance receipts.

## 6. Plan-To-Node Readiness

PlanUnit indexing may analyze these release/supply-chain PlanUnits for future readiness. It must not create WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, production build tasks, or runtime dispatch.

## 7. Deferred, Retired, Compatibility, And Non-Goals

not_applicable for retired compatibility terms. Non-goals: this doc does not replace `BinaryLocator_Spec.md`, does not own GitHub authentication, does not define provider credentials, does not authorize shell execution, and does not seal governance artifacts.

## 8. Source Lineage And Governance

This doc is compiled from bootstrap ledger `pldg-20260703-001-feature-intake`. Governance artifacts, shards, evidence, Spec Lock, plan graph, and auto decisions remain pending an explicit governance seal phase.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

## FABLE Residual Release Supply Chain Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High release supply-chain rows for signing, SBOM, updates, and migration minima. It does not create package builds, production release jobs, implementation files, or runtime certification evidence.

### RSC-008 - Signing, SBOM, Update, And Migration Minimum Contract

```yaml
plan_unit_id: RSC-008
unit_type: schema_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  A release candidate is not supply-chain complete until it carries signed artifact provenance, SBOM identity,
  update-channel metadata, rollback metadata, and migration receipts. Signing records algorithm, key_id,
  trust_root_ref, signature_ref, notarization_ref?, artifact_sha256, and verifier_result. SBOM records SPDX or
  CycloneDX format, component count, dependency hashes, license summary, generator, and generation time. Updates
  record channel, version, minimum_supported_version, migration_plan_ref, rollback_ref, and user-visible failure state.
  Migration receipt authority is the storage-registry pm.storage_value.migration_receipt.v1 row produced by
  StorageMigrationCoordinator; Release consumes that row and its journal/backup evidence rather than defining a peer receipt.
gui_related: false
gui_classification_reason: Release signing, SBOM, update, and migration contracts are supply-chain governance, not GUI implementation.
depends_on: [RSC-001, RSC-002, RSC-003, RSC-004, RSC-005, RSC-006, RSC-007]
unblocks: []
acceptance_criteria:
  - ReleaseArtifactReceipt includes artifact_name, platform, artifact_sha256, size_bytes, signature_ref, key_id, trust_root_ref, notarization_ref?, sbom_ref, and provenance_ref.
  - SBOM receipt uses SPDX JSON or CycloneDX JSON, records generator identity, component_count, dependency_hashes_present, license_summary_ref, and reproducibility_notes_ref.
  - UpdateMetadata records channel, version, previous_version, minimum_supported_version, rollout_percentage, migration_plan_ref, rollback_ref, release_notes_ref, and failure_state_copy_ref.
  - MigrationReceipt round-trips schema_id, schema_version, receipt_id, migration_id, from_version, to_version, schema_ids[], store_transitions[], family_transitions[], preflight_result, backup_ref, applied_steps[], verification_result, rollback_available, rollback_result, data_loss_risk, terminal_status, started_at_utc, completed_at_utc, app_version, journal_ref, and redaction_profile from pm.storage_value.migration_receipt.v1; rollback_result is required-present on every receipt and its value may be null only as allowed by that registered schema.
  - terminal_status is storage-owned and closed to committed, rolled_back, or blocked; each release fixture must match its expected terminal state, and committed is not accepted without verification_result plus receipt read-back.
  - preflight_result carries exact required and available space evidence; insufficient space fails before backup or mutation and preserves before/after target equality.
  - backup_ref resolves to one verified shared-boundary manifest with relative file hashes/sizes, store/app versions, root identity, backup kind, and durable seglog boundary; JSON/JSONL export is not accepted as an MVP backup.
  - rollback_available, required-present but nullable rollback_result, and data_loss_risk bind to the storage-owned whole-boundary restore-only downgrade policy and disclose post-backup writes or unknown corruption risk before confirmation.
  - Install/update validation fails closed when signature, SBOM, artifact hash, migration, or rollback receipt is missing or stale.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - Plans/Automated_Testing_System.md#ATS-024
  - FX-L002-RECEIPT-ROUNDTRIP
  - FX-L016-ACTIVE-WRITE
  - FX-L016-NEWER-BACKUP
  - FX-L016-KILL-RESTORE
  - FX-L032-NOSPACE
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_release_supply_chain_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: release_supply_chain_residual_minimum_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001
  - Case-L:L-002
  - Case-L:L-003
  - Case-L:L-016
  - Case-L:L-032
  - Case-L:PD-L-01..PD-L-06
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - fablereport.md:1264
  - fablereport.md:1265
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "pm.storage_value.migration_receipt.v1"
  - "StorageMigrationCoordinator"
  - "verification_result"
  - "terminal_status"
  - "data_loss_risk"
  - "signing"
  - "SBOM"
  - "update"
  - "migration"
  - "rollback"
  - "notarization"
negative_constraints:
  - Do not create package artifacts, installer jobs, production build tasks, implementation files, WorkNodes, NodeSeeds, executable queues, or runtime certification evidence.
  - Do not treat release notes or checksums alone as signing, SBOM, update, or migration proof.
  - Do not redefine the storage migration state machine, receipt, backup manifest, restore algorithm, or compatibility enum in Release.
  - Do not count fixture registration or a schema-valid receipt as executed migration, backup, restore, rollback, or crash-convergence proof.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/BinaryLocator_Spec.md
  - Plans/Project_Output_Artifacts.md
```

## Case L Release Migration And Recovery Gate Propagation - 2026-07-17

This section consumes the approved Case L owner contracts after owner-first repair. `Plans/storage-plan.md` owns version admission, `StorageMigrationCoordinator`, mandatory recovery snapshots, backup/restore, progress/preflight, retention/maintenance exclusion, and storage aftermath. `Plans/storage_value_registry.json` owns the machine recovery disposition and `pm.storage_value.migration_receipt.v1` row. `Plans/Contracts_V0.md` owns `StorageCompatibilityStatus` and `MigrationProgressSnapshot`. `Plans/Automated_Testing_System.md` owns fixture execution and receipts. Release owns only candidate admission and rollout refusal based on that evidence.

The release gate is fail-closed. A candidate cannot enter a user rollout ring when any required Case L fixture is missing, skipped, inconclusive, stale for the candidate's exact artifact/store-schema set, or produces an outcome other than the owner-defined oracle. A generic “downgrade/backup restore passed” label is not acceptable evidence.

Required release evidence is:

- compatibility/no-mutation: `FX-L001-REDB-AHEAD`, `FX-L001-SEGLOG-AHEAD`, `FX-L001-EVENT-AHEAD`, and `FX-L001-DOWNGRADE-WRITES`;
- migration crash/history/preflight: every `FX-L002-*`, `FX-L025-PREV-MAJOR-ALIAS`, `FX-L025-TOO-OLD`, `FX-L032-NOSPACE`, and `FX-L032-PROGRESS-INTERRUPT`;
- canonical redb recovery: every `FX-L003-*`, tied to the exact registry revision and affected canonical family IDs;
- shared-boundary backup/restore: `FX-L016-ACTIVE-WRITE`, `FX-L016-NEWER-BACKUP`, and `FX-L016-KILL-RESTORE`; and
- cross-contract envelope checks from `ATS-024`, including EventRecord 2.0/legacy compatibility and exact-replace restore/SCM/retention negative oracles when the candidate changes or consumes those surfaces.

The migration-progress fixture asserts the exact post-preflight interruption copy `Keep Puppet Master open. If interrupted, recovery will resume on the next launch.` and the absence of force-cancel/try-anyway after preflight. The startup action inventory asserts read-only metadata diagnostics and owner-routed recovery only; a generic live verify/repair/salvage command, Doctor mutation mode, in-place store editor, or bypass token fails the candidate.

The gate records candidate artifact hashes, app/store/EventRecord versions, registry revision, fixture IDs, linked `TestRunReceipt`/evidence refs, backup-manifest ref/hash, migration receipt ID, exact expected/observed terminal state, and freshness. It does not copy the storage journal or FileSafe restore algorithm into release metadata.

Negative release oracles are mandatory: no target mutation on incompatible/preflight refusal; no ordinary-open mixed migration/restore state; no “rebuildable projection” recovery claim for canonical redb; no compatible-backup downgrade without `data_loss_risk`; no success from `restore_failed`, `restore_recovery_required`, skipped/inconclusive tests, or missing receipt read-back; and no runtime/completeness claim from plan or schema validation.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Automated_Testing_System.md, DecisionID:PD-L-01, DecisionID:PD-L-02, DecisionID:PD-L-03, DecisionID:PD-L-04, DecisionID:PD-L-05, DecisionID:PD-L-06

### RSC-009 - Case L Release Migration Backup And Recovery Evidence Gate

```yaml
plan_unit_id: RSC-009
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Release admission consumes, without redefining, the storage-owned newer-store refusal, forward migration,
  mandatory canonical-redb backup, whole-boundary restore-only downgrade, disk preflight, progress, recovery
  disposition, and migration-receipt contracts. A candidate advances only when every applicable named Case L
  fixture produces its exact positive and negative oracle with current artifact/schema/registry evidence.
gui_related: true
gui_classification_reason: Release-blocked compatibility, rollback loss, and recovery results have user-visible update and recovery consequences.
depends_on: [RSC-001, RSC-008, ATS-024, SP-235]
unblocks: []
acceptance_criteria:
  - One-version-ahead and unsupported-old fixtures refuse before mutation; before/after hashes are identical and no live newer-store viewer or try-anyway path exists.
  - Every migration crash cut converges from the durable journal to the expected committed, verified rollback, or blocked state with exactly one receipt and no ordinary-open mixed state.
  - Every canonical non-rebuildable family has registry-bound verified-backup/restore evidence; projection rebuild cannot satisfy the gate.
  - Active-write backup and kill-mid-restore fixtures prove one verified shared boundary or the verified original, while newer backups are refused before live mutation.
  - Startup and progress command inventory exposes only owner-approved diagnostics/recovery actions and no generic repair/salvage/Doctor mutation, bypass, post-preflight force-cancel, or try-anyway path.
  - RSC-008 fields round-trip from pm.storage_value.migration_receipt.v1 and each fixture's terminal_status matches its expected oracle.
  - Missing, stale, skipped, inconclusive, or merely schema-valid evidence blocks rollout and is never reported as runtime completion.
validation_surfaces:
  - Plans/Automated_Testing_System.md#ATS-024
  - FX-L001-*, FX-L002-*, FX-L003-*, FX-L016-*, FX-L025-*, and FX-L032-*
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_release_migration_recovery_false_admission
reasoning_tier: high
context_scope: case_l_release_migration_backup_recovery
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: case_l_release_evidence_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001
  - Case-L:L-002
  - Case-L:L-003
  - Case-L:L-016
  - Case-L:L-025
  - Case-L:L-031
  - Case-L:L-032
  - Case-L:PD-L-01..PD-L-06
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
preserved_exact_tokens:
  - "blocked_newer_store"
  - "pm.storage_value.migration_receipt.v1"
  - "verification_result"
  - "terminal_status"
  - "data_loss_risk"
  - "FX-L016-KILL-RESTORE"
negative_constraints:
  - Do not define a peer migration receipt, state machine, backup manifest, restore algorithm, or compatibility enum.
  - Do not admit rollout from generic pass labels, schema validity, or missing/skipped/inconclusive fixture evidence.
  - Do not claim runtime execution, finding closure, buildability, certification, or Plans completeness from this contract.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/storage-plan.md
  - Plans/Automated_Testing_System.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime release/supply-chain rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-1c95c03aec7949b6ad8641a7`: project schemas must use JSON Schema Draft 2020-12 unless a migration fixture explicitly records a legacy dialect. `requirements_quality_report.schema.json` now declares Draft 2020-12.
- Repairs `sfk-aebb6fb13c915a60c1a5be40`: `Plans/plan_graph.schema.json` now gives `nodes[].change_budget` the same closed `pm.change_budget.schema.v1` shape used by `Plans/change_budget.schema.json` and `Plans/project_plan_node.schema.json`; live `Plans/plan_graph.json` nodes already carry that schema id and required fields. This is schema/governance repair only and creates no WorkNodes, NodeSeeds, queues, runtime launches, implementation files, production build tasks, or PNC-019 evidence.
- Repairs `sfk-c347a44e26b08efce550bdfd`: non-executable closure evidence required object fields are typed with nested properties in `Plans/.implementation_readiness/non_executable_closure_evidence.schema.json`.
- Repairs `sfk-d62d739e27a728d8ad210435`: future auto-decision rows now have file-wide unique `decision_id` semantics documented in `auto_decisions.schema.json`, `validate-auto-decisions` grandfathering is restricted to exact historical `(decision_id, inputs_hash)` identities, and `scripts/pm-governance-seal.py` refuses ambiguous duplicate-id upserts instead of mutating grandfathered history. This is governance identity repair only and creates no WorkNodes, NodeSeeds, queues, runtime launches, implementation files, production build tasks, or PNC-019 evidence.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 385` (repaired; source line 1286; `sfk-1c95c03aec7949b6ad8641a7`): Repaired: `requirements_quality_report.schema.json` declares JSON Schema Draft 2020-12. No buildability or runtime proof is claimed here. Source summary: - **[CRITICAL]** `requirements_quality_report.schema.json` declares `$schema: draft-07` while all 43 other schema files declare 2020-12 a one-line fix.
- `registry_line 386` (repaired; source line 1287; `sfk-aebb6fb13c915a60c1a5be40`): Repaired: `Plans/plan_graph.schema.json` now validates `nodes[].change_budget` with the same typed `pm.change_budget.schema.v1` shape used by the standalone and project-node schemas. No buildability or runtime proof is claimed here. Source summary: - **[HIGH]** `plan_graph.schema.json`'s `change_budget` property is a bare unconstrained `{"type":"object"}` even though a fully-typed `change_budget.schema.json` exists standalone AND `project_plan_node.schema.json` (a likely-duplicate schema for the same node concept) correctly
- `registry_line 387` (repaired; source line 1288; `sfk-c347a44e26b08efce550bdfd`): Repaired: `non_executable_closure_evidence.schema.json` now gives required object fields nested properties and closed shapes matching the live evidence object. No buildability or runtime proof is claimed here. Source summary: - **[HIGH]** `non_executable_closure_evidence.schema.json`: 7 fields are `required` AND bare unconstrained objects with zero documented internal shape (`event_payload_contract_registry`, `gui_wiring_contract`, etc.).
- `registry_line 389` (repaired; source line 1295; `sfk-d62d739e27a728d8ad210435`): Repaired: future `decision_id` values are unique by validator policy, historical duplicates are grandfathered only by exact `(decision_id, inputs_hash)` identities, and the governance seal generator refuses ambiguous duplicate-id upserts. No buildability or runtime proof is claimed here. Source summary: - **[HIGH]** auto_decisions.jsonl: 19 distinct `decision_id` values are reused across 2-8 lines each (verified mechanically) the natural primary key is not unique, making ID-based lookup ambiguous; schema requires `minLength: 3` but never uniqueness.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

## Provider CLI Acquisition Supply-Chain Addendum - 2026-08-13

This addendum adopts the corrected provider-CLI adjudication at the release/supply-chain boundary. `Plans/Shared_Integration_Runtime.md` owns `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, `ObservableWork`, and generic installation/provisioning/update/repair/verification/rollback, continuation, retry/backoff/circuit, coalescing, and failure-loop state. Release Supply Chain retains source, publisher, signature/hash, license, architecture, version/channel, compatibility, SBOM/provenance, known-bad quarantine, and receipt-admission policy.

### Provider CLI distribution and acquisition policy

- Provider CLIs are not Puppet Master core artifacts, default native/Server/container/WSL/Kubernetes baseline artifacts, or pre-seeded PM-distributed Tool Store packages. Project/model/provider/Goal/Plan/WorkNode/agent demand and non-provider `Auto`/`On` provisioning cannot authorize first acquisition.
- Initial acquisition requires explicit user-triggered `Install`/`Setup`, an official provider installer, official release artifact, official package feed, or provider-documented package-manager route, and the exact selected Host/Environment. A download cache, catalog row, package-owner adapter, or lifecycle procedure is not an official source or user consent by itself.
- Normal supply-chain handling must not mirror, repackage, redistribute, or baseline a provider CLI. A future exception requires a named user-approved decision for one exact provider CLI/platform/source after redistribution, license, provenance, security, size, update, removal, and support review.
- After explicit acquisition and binding, Puppet Master may perform proven update, repair, verification, activation, and rollback for the exact installation under shared lifecycle policy. This permission does not retroactively authorize bundling or first acquisition.
- General `Auto | On | Off` acquisition classes remain valid for approved non-provider capabilities and PM-owned runtime artifacts. They do not weaken the provider-CLI exception.

### Typed supply-chain proof

Every provider-CLI acquisition, update, repair download, rollback artifact, or adoption into PM management carries `ProviderCliSupplyChainProof`:

```text
proof_id
operation_id
attempt_id
installation_id
installation_generation?
provider_id
provider_cli_product
host_environment_ref
execution_host_id
execution_environment_id
topology_generation
official_source_kind
official_source_ref
publisher_identity
package_or_artifact_identity
manager_or_installer_identity
version
channel
target_os
target_architecture
artifact_sha256
signature_or_attestation_ref?
trust_root_ref?
notarization_ref?
sbom_ref?
license_ref
redistribution_disposition
compatibility_manifest_ref
known_bad_check_ref
download_receipt_ref
verification_receipt_ref?
rollback_artifact_proof_ref?
observed_at
```

`operation_id` and `attempt_id` are the canonical Shared Integration Runtime `OperationId` and `AttemptId`; `host_environment_ref`, when retained for compatibility, must resolve to canonical `ExecutionHostId`, `ExecutionEnvironmentId`, and `TopologyGeneration`. `redistribution_disposition` is `official_source_only | named_exception_approved | redistribution_forbidden | unknown_blocked`; `unknown_blocked` and `redistribution_forbidden` cannot enter a PM baseline, mirror, repackage, or cached redistribution path. Missing, stale, mismatched, or unverifiable mandatory evidence fails closed. Installer exit zero, version output, or an artifact checksum alone does not prove a healthy provider route; provider-specific executable/auth/account/product/model/adapter/capability verification remains with provider owners and is linked by `verification_receipt_ref`.

Immutable signed Server/container images remain unchanged during provider setup or maintenance. A consented mutable provider CLI is installed in a persistent Tool Store/managed environment/task runner and its CLI-owned profile in a persistent provider-profile volume. WSL state remains local to the selected distribution. Container proof binds Server/Execution Host, runtime, instance/service, image digest, and persistent-volume identity. Kubernetes proof binds cluster/context, namespace, workload/pod/container as applicable, image digest, and persistent-volume identity. Native Windows/macOS/Linux, WSL distributions, Apple Linux containers, standalone Server, Docker/TrueNAS/Unraid Server, Kubernetes Server, and SSH Execution Hosts never share supply-chain proof merely because an artifact hash or provider version matches.

Supply-chain failure classes include `official_source_unverified`, `publisher_unverified`, `signature_or_attestation_invalid`, `hash_mismatch`, `license_unknown`, `redistribution_not_authorized`, `architecture_mismatch`, `channel_mismatch`, `compatibility_rejected`, `known_bad_version`, `download_integrity_failed`, `rollback_artifact_missing`, and `host_environment_mismatch`. Each failure records the proof fields available, evidence refs, exact Host/Environment, and deterministic `failure_fingerprint`. Release Supply Chain owns failure meaning and quarantine evidence; `InstallationLifecycleManager` owns automatic retry budget, backoff, circuit state, cooldown/coalescing, and unchanged-failure suppression, while `ObservableWork` owns truthful wait and outcome projection. No supply-chain proof or receipt contains a raw credential, token, cookie, or secret path. Canonical storage remains seglog + redb + Tantivy; SQLite is forbidden.

### Conflict record and precedence

- `RSC-003` and `RSC-006` use broad “downloadable binary/plugin” and “packaged helper/CLI/runtime” wording that could be read as authority for Puppet Master to package provider CLIs. Resolution: those units govern PM-distributed artifacts and verification of externally acquired artifacts; they do not authorize provider-CLI bundling, baseline inclusion, mirroring, repackaging, redistribution, or pre-seeding.
- Historical provider packet clauses permitting provider-CLI baseline/pre-distribution or catalog/adapter-selected acquisition classes conflict with the direct provider decision. Packet-root `PROVIDER_CLI_FINAL_ADJUDICATION.md` supersedes those clauses; post-consent update/repair/rollback and proof-based lifecycle material remains adopted.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#3, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/Shared_Integration_Runtime.md#8.2, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, SchemaID:pm.shared_runtime.contracts.v1, SchemaID:spec_lock

### RSC-010 - Provider CLI Official-Source And Post-Consent Supply-Chain Gate

```yaml
plan_unit_id: RSC-010
unit_type: schema_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Provider CLIs are excluded from Puppet Master core/default baselines and pre-seeded distribution. Explicit first
  acquisition uses an official source for one exact Host/Environment and carries typed publisher, package, hash,
  signature/attestation, license, architecture, channel, compatibility, and known-bad proof. Proven post-consent update,
  repair, verification, activation, and rollback are allowed through Shared Integration Runtime.
gui_related: false
gui_classification_reason: This unit owns supply-chain admission evidence and distribution policy; GUI owners only project its outcomes.
depends_on: [SIR-002, SIR-003, SIR-006, SIR-011, RSC-003, RSC-006, RSC-007, RSC-008, BS-028, CBP-028]
unblocks: []
acceptance_criteria:
  - Provider CLIs are absent from PM core/default baseline and pre-seed manifests unless a named exact exception is approved.
  - Initial acquisition proves explicit consent, official source, and exact Host/Environment before download or mutation.
  - ProviderCliSupplyChainProof fails closed on missing/stale/mismatched mandatory source, publisher, hash, license, architecture, channel, compatibility, or known-bad evidence.
  - Post-consent operations link shared lifecycle and provider verification receipts without treating exit zero, version text, or checksum alone as route readiness.
  - Signed immutable container images are not mutated; mutable provider installations and profiles persist outside replaceable images.
  - Native, WSL distribution, container, Kubernetes, and remote proofs retain exact execution identity.
  - Typed failure fingerprints feed shared retry suppression and known-bad quarantine without exposing secrets or using SQLite.
validation_surfaces:
  - bounded markdown/YAML structure check for RSC-010
  - future official-source, signature/hash, license, architecture, compatibility, and known-bad fixtures
  - future negative baseline/pre-seed/mirror/repackage and immutable-image fixtures
  - future exact Host/Environment supply-chain proof fixtures
risk_class: provider_cli_supply_chain_distribution_drift
reasoning_tier: high
context_scope: provider_cli_supply_chain
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
  - future release/supply-chain receipt contracts
node_compile_hint:
  mode: provider_cli_official_source_post_consent_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/PROVIDER_IDENTIFICATION_INSTALLATION_AUTH_UPDATE_HANDOFF.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-008
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-009
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-010
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-023
preserved_exact_tokens:
  - "official provider/package source"
  - "not PM core/default baseline"
  - "not pre-seeded Tool Store"
  - "exact Host/Environment"
  - "ProviderCliSupplyChainProof"
  - "post-consent lifecycle management"
negative_constraints:
  - Do not bundle, baseline, pre-seed, mirror, repackage, or redistribute a provider CLI without a named exact exception.
  - Do not mutate a signed immutable container image for provider setup or maintenance.
  - Do not accept exit zero, version text, checksum alone, raw secrets, or SQLite as sufficient lifecycle evidence or storage.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```
