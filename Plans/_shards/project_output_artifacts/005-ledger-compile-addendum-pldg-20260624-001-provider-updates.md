# Shard 005: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L142-L250

Source SHA256: `cfb34cb80de7add6d66d68e4bbe80ecb8b243a9038d4a4f696eb1298c4324241`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into project output packaging requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### POA-050 - Generated Media Output Packaging And Provenance

```yaml
plan_unit_id: POA-050
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Generated media outputs become project artifacts by durable local artifact reference, content hash, provider route/account/model metadata, generation parameter summary, provider receipt refs, provenance caveats, expiry warnings, and source lineage. Project Output Artifacts consumes Runtime Artifacts and Media route truth; it owns packaging/export identity, not provider execution behavior. Expiring provider URLs such as MiniMax Image-01 URL outputs require explicit capture status and 24-hour expiry warning before being treated as durable project outputs. Antigravity OAuth/internal `gemini-3.1-flash-image` outputs may package generated-image artifacts only through durable local refs, content hash, non-secret route/proof refs, and private/unofficial endpoint caveats.
gui_related: true
gui_classification_reason: Generated media artifact packaging, export identity, and expiry/provenance presentation are user-visible output behavior.
depends_on: [RAP-032, RAP-033, MGAC-095, MGAC-096]
unblocks: []
acceptance_criteria:
  - Generated media project outputs reference durable local artifacts and hashes.
  - Provider receipt refs and route/account/model metadata are preserved without secrets.
  - Expiring provider URLs are disclosed and not treated as durable storage.
  - Output packaging consumes, rather than redefines, Media and Runtime Artifact route truth.
  - Antigravity internal generated-image outputs preserve support-state/provenance caveats and exclude OAuth/session material.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: generated_media_output_packaging_drift
reasoning_tier: high
context_scope: generated_media_output_artifacts
implementation_surfaces: [Plans/Project_Output_Artifacts.md, future artifact export/package system]
node_compile_hint: {mode: generated_media_output_packaging, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0121
  - pldg-20260624-001-provider-updates:atom-0133
  - pldg-20260624-001-provider-updates:atom-0137
  - pldg-20260624-001-provider-updates:atom-0142
source_atom_ids: [atom-0031, atom-0033, atom-0034, atom-0121, atom-0130, atom-0133, atom-0134, atom-0136, atom-0137, atom-0142]
preserved_exact_tokens: ["generated media", "project outputs", "provider receipt", "content hash", "24-hour expiry", "MiniMax Image-01", "OpenAI/Codex subscription", "C2PA", "SynthID", "gemini-3.1-flash-image", "image/jpeg", "a60c8987f42ebb678426affb79d55f49f3efe8feebc8c09ba86772bfa91d9f5d"]
negative_constraints:
  - Do not treat provider URL outputs as durable project artifacts without capture status and expiry disclosure.
  - Do not store provider secrets in project output artifacts.
  - Do not make Project Output Artifacts the owner of provider execution behavior.
  - Do not store OAuth tokens, refresh tokens, account identifiers, local credential paths, full HTTP payload logs, or secrets in project output artifacts.
owner_hints: [Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/Media_Generation_and_Capabilities.md]
```

### 2.2 Non-canonical execution workspace (sidecar) — `.puppet-master/workspace/**`

The **Project Plan Package** (this document) is staged under `.puppet-master/project/**`.

Separately, Puppet Master maintains an execution **workspace sidecar** (ephemeral, non-canonical) under:

`.puppet-master/workspace/<project>/<phase>/<task>/<subtask>/`

This sidecar exists to support deterministic, low-bloat context management without polluting user repos.

Rule: Puppet Master MUST store Attempt Journal and Parent Summary artifacts in the workspace sidecar by default, and MUST treat them as execution-time artifacts (not part of the canonical Project Plan Package).

ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

Reserved runtime subtree note:
- `.puppet-master/state/**` is reserved for project-local runtime state such as optional local seglog/mirror/backups when enabled by `Plans/storage-plan.md`.
- `.puppet-master/project/**` remains the canonical staged Project Plan Package tree.
- `.puppet-master/workspace/**` remains the non-canonical execution sidecar and MUST NOT be repurposed as canonical storage.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md

Recommended contents (non-exhaustive):
- `AGENTS.md` (scoped instruction file for this subtree; managed or user-owned depending on mode)
- `parent_summary.md`
- `attempt_journal.md`
- Iteration run artifacts (logs, snapshots, per-iteration output)

Rule: Promotion of stable learnings into scoped `AGENTS.md` MUST follow Promotion rules and MUST preserve `AGENTS.md` lightness budgets.

ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 2.3 Document Set packaging for large Markdown/text artifacts

When Markdown/text artifacts under `.puppet-master/**` reach configured size triggers, Puppet Master MUST package them as Document Sets per `Plans/Document_Packaging_Policy.md` and MUST run the required packaging audits before run completion.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014, SchemaID:pm.project-plan-graph-index.v1

**On-disk path convention:** When packaging triggers are reached for a Markdown/text artifact, the canonical packaged form is a `.docset/` directory adjacent to the original file path (e.g. `.puppet-master/project/requirements.md.docset/`). The original file path MUST remain present as a deterministic pointer stub (derived artifact) pointing to the Document Set entrypoint. Full convention defined in `Plans/Document_Packaging_Policy.md §7`.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014

**Canonical truth:** For any large Markdown/text artifact, the artifact inventory recognizes either:
- the file path as canonical (when no `.docset/` exists), or
- the `.docset/` directory as canonical with the file path as a derived pointer stub (when packaging has occurred).

ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014

### Canonical persistence for packaged Document Sets

When packaging occurs for a logical Markdown/text artifact:
- `<logical_artifact_path>.docset/00-index.md` is canonical.
- `<logical_artifact_path>.docset/manifest.json` is canonical.
- shard files under `<logical_artifact_path>.docset/` are canonical.
- audit outputs under `<logical_artifact_path>.docset/evidence/` are canonical verification artifacts.
- `<logical_artifact_path>` remains present only as a derived pointer stub.

Generated `.docset/**` contents are packaging outputs, not new packaging inputs; verifiers and generators MUST NOT recurse and package Document Set members again.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014

The plan graph contract remains unchanged: canonical user-project plan graph is still sharded JSON at `.puppet-master/project/plan_graph/index.json` with node shards under `nodes/<node_id>.json`.

ContractRef: SchemaID:pm.project-plan-graph-index.v1
