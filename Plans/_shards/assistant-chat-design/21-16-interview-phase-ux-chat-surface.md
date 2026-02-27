## 16. Interview Phase UX (Chat Surface)

When the chat is in **Interview** mode (interview flow):

- **Thought stream:** Show the **thought stream** (reasoning/chain-of-thought from the model) so the user sees how the interviewer is thinking.
- **Message strip:** Show the **message strip** (current Q&A or phase messages) in addition to phase progress.
- **Question UI:** When the interviewer asks a question, present:
  - **Several suggested options** (e.g. buttons or selectable chips).  
  - A **"Something else"** control that reveals a **text bar** where the user can type a freeform response.  
- This keeps navigation quick for common answers while allowing any custom answer.
- **Contract Layer outputs (completion surface):** When the interview completes (or when a phase boundary produces artifacts), the Interview surface must provide a read-only **Outputs** card/pane listing the canonical user-project artifact set under `.puppet-master/project/` (requirements, Project Contract Pack with `contracts/index.json`, `plan.md` (human-readable), **sharded plan graph** under `plan_graph/` (**index + node shards**), `acceptance_manifest.json`, and validator status). These outputs are **persisted canonically in seglog** and surfaced here via projection into `.puppet-master/project/...` (do not assume anything about the user project’s own folder layout). Each entry must be click-to-open via the File Manager/editor surface (Plans/FileManager.md). Authoritative artifact contract: `Plans/Project_Output_Artifacts.md` (do not duplicate schemas here).

---

