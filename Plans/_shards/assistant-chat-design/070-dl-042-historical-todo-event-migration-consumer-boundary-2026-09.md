# Shard 070: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/assistant-chat-design.md`

Source lines: L25343-L25347

Source SHA256: `808661ba4fb0cfd809da2493c9dfb4a85006967cdda7c0ab8198c5f8cc62e3e4`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Chat consumes the committed current `ToDoController` projection at the applicable revisions. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved migration mapping; historical `chat.plan_todo_updated` stays readable without granting direct writer authority to Chat or changing current GUI behavior.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md
