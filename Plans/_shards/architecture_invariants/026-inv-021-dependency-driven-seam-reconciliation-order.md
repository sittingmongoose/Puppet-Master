# Shard 026: INV-021 -- Dependency-driven seam reconciliation order

Source: `Plans/Architecture_Invariants.md`

Source lines: L339-L349

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-021 -- Dependency-driven seam reconciliation order

**Rule:** When research or reconciliation work is converted into implementation-ready Puppet Master decisions, the work proceeds seam-by-seam in dependency-driven order rather than by cosmetic sequencing or more broad benchmark collection.

- A seam walkthrough may resume from a reconciliation-ready state only to work through all seams explicitly and turn existing research into seam-by-seam implementation-ready PM decisions and reconciliation guidance.
- The canonical seam queue labels are `seam-shell-identity-routing`, `seam-editor-core`, `seam-diff-review-source-control`, `seam-file-manager`, `seam-search`, `seam-preview-browser`, `seam-lsp-indexing-autodetect`, `seam-ssh-remote`, `seam-terminal-runtime-environment`, `seam-cross-cutting`, and `seam-reconciliation-synthesis`. When session SQL or another queue store tracks these seams, it must preserve those labels and their owner mapping.
- The working order starts with shell/identity/routing because open/reveal/reuse/ownership rules constrain nearly every later seam. After that, Puppet Master locks editor mutation truth, diff/review ownership, file-manager operations, search, preview, LSP/indexing, remote behavior, terminal/runtime behavior, and finally cross-cutting system rules.
- Seam reconciliation must leave each seam with explicit owner docs, consumer docs, unresolved risk if any, and implementation-ready acceptance guidance before moving the seam out of reconciliation.
- Addressing cannot assume rigid `<phase>/<task>/<subtask>` paths when package/seam architecture is active. `Plans/Contracts_V0.md` and `Plans/Executor_Protocol.md` consumers must route by canonical package, seam, node, lane, and attempt identity rather than forcing every artifact or runtime address into the legacy path shape.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md
