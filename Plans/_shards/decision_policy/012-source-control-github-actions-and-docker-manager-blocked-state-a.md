# Shard 012: Source Control, GitHub Actions, and Docker Manager Blocked-State Addendum (2026-03-12)

Source: `Plans/Decision_Policy.md`

Source lines: L440-L456

Source SHA256: `72a2faae8bec90e7e64eb6d845451a37b9f491de47e4bcb8e00339ff5bf4861d`

---

## Source Control, GitHub Actions, and Docker Manager Blocked-State Addendum (2026-03-12)

Additional deterministic blocked defaults for this packet:

| blocked trigger | default posture | required user-visible effect |
|---|---|---|
| `worktree_conflict` | remain blocked until resolution | show Source Control recovery CTA |
| `dirty_worktree` | remain blocked until cleanup or restore action | show Source Control recovery CTA |
| `failure_class = auth_expired` for GitHub-hosted Actions admin/run actions when refresh cannot recover | remain blocked until auth refresh | show GitHub Actions recovery CTA |
| `external_side_effect_blocked` for Docker repo create/push/template push | remain blocked until approval or explicit decline | preserve local build/publish result |
| Kubernetes apply/exec/port-forward prerequisite block | remain blocked until context/prerequisite resolves | show Docker Manager Kubernetes CTA |

Approval/preflight blind-spot defaults are target-bound, not action-name-bound, including in multi-repo projects. SCM approvals carry `project_id`, `repo_id`, optional `worktree_id`, `/worktree/context`, `branch`, and `commit`; GitHub Actions approvals carry `repo_remote`, optional `workflow_id`, `run_id`, and `/environment`; Docker approvals carry `runtime`, `registry_host`, `namespace`, `/repository`, and optional `image_ref`; Kubernetes approvals carry `kube_context`, `namespace`, optional `workload_ref`, and optional `resource_ref`. The deterministic order is static policy check, cheap capability or `/precondition` preflight, approval request only while still actionable, then full execution-time `/revalidate` immediately before mutation. Each approval records a `preflight_revision`; stale-preflight evidence or any changed target identity invalidates the approval and returns the action to blocked state.

Domain-bound approvals also include the attempted operation or action class, not only resource identity. `/admin/domain-sensitive` operations bind SCM `/repositories` and `/worktrees/refs`, GitHub Actions workflow and `/environment` targets, Docker registries/repositories, and Kubernetes clusters/namespaces/verbs plus workload or resource refs to the approval scope; `policy-vs-approval-vs-preflight` outcomes remain distinct blocked families. `/research-safe` plan-mode tools such as `todoread`, `todowrite`, `webfetch`, `webcrawl`, `webmap`, and question-driven planning flows may be allowed for planning without granting mutation authority. Durable approval scope and reuse are governed by `approval_scope_key`, actor/lane/run/account context, requested/effective permission disclosure, and permission-snapshot drift rules in `Plans/Permissions_System.md` and `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md
