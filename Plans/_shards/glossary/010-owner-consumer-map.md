# Shard 010: Owner / Consumer Map

Source: `Plans/Glossary.md`

Source lines: L361-L365

Source SHA256: `8c61b60acbf4956c1044fe272bd679c94d8c27237a59e7054ecc4f076aa7d74d`

---

## Owner / Consumer Map

`Plans/Glossary.md` remains the owner doc for short canonical terminology, runtime/routing vocabulary, help-entry vocabulary, projection trust vocabulary, recovery/copy boundaries, evidence vocabulary, secret terminology, and primitive glossary definitions. It does not own EventRecord fields, storage mechanics, FileSafe restore algorithms, Worktree baseline effects, or Executor admission. Those remain owned respectively by `Plans/Contracts_V0.md` plus `Plans/event_record.schema.json`, `Plans/storage-plan.md`, `Plans/FileSafe.md`, `Plans/WorktreeGitImprovement.md`, and `Plans/Executor_Protocol.md`. Richer examples or workflow-specific copy may live in consumer docs, but consumers must preserve the canonical terms and negative constraints defined here.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md
