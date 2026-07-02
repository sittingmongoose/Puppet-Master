# Shard 036: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/FileSafe.md`

Source lines: L13417-L13504

Source SHA256: `464f6f0bc065388f96005298308f00cfe57510d8190a62d4a6bec53d3222d1db`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host FileSafe mount, exec, filesystem, secret, and side-effect boundaries. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### F2-194 - Containerized Host FileSafe Mount Exec And Side-Effect Guards

```yaml
plan_unit_id: F2-194
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe gates containerized-host mounts, env files, secret refs, docker.sock exposure, bind mounts, runtime file
  access, command/custom secret extractors, terminal-like actions, bounded exec, remote sync, SSH tunnel behavior, and
  external side effects. Host profiles carry FileSafe-visible mount_policy, filesafe_scope_ref, secret_ref_policy,
  redaction_profile, and cleanup policy before use. Container exec, Kubernetes exec, remote shell, file controls,
  service controls, local API endpoints, and Coasts-style terminal/file/service controls cannot bypass PM's command,
  permission, FileSafe, Executor/Tools, transcript, receipt, and cleanup contracts.
gui_related: false
gui_classification_reason: File, mount, secret, exec, and side-effect guards are backend safety behavior, not GUI presentation.
depends_on: [CV-303, CV-304]
unblocks: [CRAU-091, EP-109, T-166, ATS-019]
acceptance_criteria:
  - Host profiles and host operations expose FileSafe scope before mounts, env refs, secrets, docker.sock, bind mounts, remote sync, or exec are allowed.
  - Container-local endpoints, terminal sessions, file controls, and service controls cannot bypass PM permission/FileSafe/receipt paths.
  - Secret-bearing stdin, stdout, env files, registry credentials, command extractor output, and diagnostics are redacted or blocked according to policy.
  - Remote or uncertain cleanup outcomes retain evidence and blocked/indeterminate state instead of assuming success.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized host FileSafe scope fixtures
  - future docker.sock and bind-mount denial fixtures
risk_class: containerized_host_filesafe_bypass
reasoning_tier: high
context_scope: containerized_host_filesafe_guards
implementation_surfaces:
  - Plans/FileSafe.md
  - future host FileSafe policy
node_compile_hint:
  mode: containerized_host_filesafe_mount_exec_guards
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0018
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0019
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0024
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0050
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
source_atom_ids: [atom-0018, atom-0019, atom-0023, atom-0024, atom-0034, atom-0038, atom-0044, atom-0050, atom-0053, atom-0064, atom-0067, atom-0069, atom-0073, atom-0074, atom-0081]
decision_refs: [dec-0008, dec-0017, dec-0020]
preserved_exact_tokens:
  - "FileSafe scope"
  - "filesafe_scope_ref"
  - "scoped worktree/file mounts"
  - "docker.sock"
  - "bind mounts"
  - "command/custom secret extractors"
  - "Keychain"
  - "ssh -L"
  - "ssh -R"
  - "rsync"
  - "mutagen"
  - "terminal sessions"
  - "file controls"
  - "service controls"
  - "container exec"
negative_constraints:
  - Do not let container exec bypass Executor/Permissions/FileSafe when PM execution is in scope.
  - Do not expose terminal/file/service controls outside PM's command, permission, receipt, and FileSafe model.
  - Do not copy Coasts local API, terminal, or file controls blindly.
  - Do not expose raw Docker/Kubernetes secrets in records, prompts, GUI, receipts, exports, or diagnostics.
  - Do not allow unscoped mounts, docker.sock access, secret extractors, or remote side effects through hidden defaults.
owner_hints:
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Tools.md
```
