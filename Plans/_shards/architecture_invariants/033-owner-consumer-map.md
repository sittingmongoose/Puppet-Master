# Shard 033: Owner / Consumer Map

Source: `Plans/Architecture_Invariants.md`

Source lines: L439-L443

Source SHA256: `aabdd384375f6ff5f75eac1ad5085ed9af05a5cebcf0dcbf4b5b3462eef1935e`

---

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. `Plans/Architecture_Invariants.md` owns only the cross-cutting prohibitions and authority boundaries stated here. `Plans/storage-plan.md` retains durable-store mechanics, recovery dispositions, retention, and holds; `Plans/Contracts_V0.md` plus `Plans/event_record.schema.json` retain EventRecord and closed outcome ownership; `Plans/FileSafe.md` retains exact-replace mechanics and manifest equality; `Plans/WorktreeGitImprovement.md` retains baseline/worktree effects; and `Plans/Executor_Protocol.md` retains admission, attempt lineage, and dispatch gating. Consumer text MUST reference those owners rather than become peer canon.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md
