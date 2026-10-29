# Shard 031: Additive Correction v4 — Provisioning Only After Start (2026-09-03)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1954-L1963

Source SHA256: `6a648892da43ca0c5dfc0febd40273b930e5cc2cf1b4c6c56a3a2acc31d0e65d`

---

## Additive Correction v4 — Provisioning Only After Start (2026-09-03)

`MODAL-016`. Temporary MCP, tool, or package provisioning requested by a collaborative workflow —
BrainStorm in particular — is admitted only **after** the workflow's Start is committed and after
normal permission and provisioning approval. The configuration modal may display which
capabilities are available; displaying availability is not installing, and preflight never mutates
the host or the project.

Provisioning admitted this way stays scoped to the run and is torn down when the run ends, exactly
as the v2 contract already requires. Cancelling the modal installs nothing and leaves no residue.
