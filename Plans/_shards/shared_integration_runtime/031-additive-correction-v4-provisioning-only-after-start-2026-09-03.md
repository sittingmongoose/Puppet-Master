# Shard 031: Additive Correction v4 — Provisioning Only After Start (2026-09-03)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1942-L1951

Source SHA256: `7b16fe09139ef1928cfe6295c8ae00e016d754ee52c2d9ff2a8a50f99ff0a070`

---

## Additive Correction v4 — Provisioning Only After Start (2026-09-03)

`MODAL-016`. Temporary MCP, tool, or package provisioning requested by a collaborative workflow —
BrainStorm in particular — is admitted only **after** the workflow's Start is committed and after
normal permission and provisioning approval. The configuration modal may display which
capabilities are available; displaying availability is not installing, and preflight never mutates
the host or the project.

Provisioning admitted this way stays scoped to the run and is torn down when the run ends, exactly
as the v2 contract already requires. Cancelling the modal installs nothing and leaves no residue.
