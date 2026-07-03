# Shard 008: Deterministic discovery algorithm

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L211-L236

Source SHA256: `e9456832f2a15e65e0158775c6650904e162afa6161f7b115793467ad3ccb3b7`

---

## Deterministic discovery algorithm

### Remote indexer binary locator

For non-Git remote projects, PM ships a standalone sparse n-gram indexer binary per target architecture. The binary is a PM-managed build helper, not a provider CLI, and is used only to build the remote-side snapshot that will later be queried locally.

Remote indexer `/deployment` and `/reconciliation` stay bounded here: BinaryLocator deterministically selects, transfers, verifies, and cleans up the PM-built helper binary, while `Plans/GitHub_Integration.md` owns remote project flow and `Plans/storage-plan.md` owns regex-index storage/cache semantics.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

**Shipped architectures:** x86_64 and aarch64.

**Remote architecture detection:** Run `uname -m` over SSH before transfer to determine the correct binary.

**Deployment rules:**
- On first use for a remote project, PM scp's the matching indexer binary to the remote host.
- After transfer, PM integrity-checks the binary via xxh3 hash comparison.
- PM MUST NOT execute binaries received from the remote host; it only transfers and runs PM-built helper binaries.
- If no matching binary is available for the detected architecture, PM falls back to unindexed ripgrep over SSH and surfaces degraded acceleration rather than attempting cross-architecture execution.

ContractRef: Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/GitHub_Integration.md

**Cleanup:**
- The helper binary (roughly 5 MB) is left on the remote host for reuse across sessions.
- On project close or disconnect, PM may offer optional cleanup.
- On uninstall, PM performs best-effort cleanup over SSH.
