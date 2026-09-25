# Shard 031: Additive Correction v4 — Provisioning Only After Start (2026-09-03)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2078-L2087

Source SHA256: `5701200857832110de22ba792ba9339f93af42bd3dbbf8ea40d9eeed495e7d58`

---

## Additive Correction v4 — Provisioning Only After Start (2026-09-03)

`MODAL-016`. Temporary MCP, tool, or package provisioning requested by a collaborative workflow —
BrainStorm in particular — is admitted only **after** the workflow's Start is committed and after
normal permission and provisioning approval. The configuration modal may display which
capabilities are available; displaying availability is not installing, and preflight never mutates
the host or the project.

Provisioning admitted this way stays scoped to the run and is torn down when the run ends, exactly
as the v2 contract already requires. Cancelling the modal installs nothing and leaves no residue.
