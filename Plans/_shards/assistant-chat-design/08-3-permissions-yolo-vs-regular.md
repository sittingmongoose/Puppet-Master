## 3. Permissions: YOLO vs Regular

- **YOLO mode:** Chat runs with maximum permissions; no permission prompts. Agent can execute, edit, and run tools without asking. User accepts full automation for that session.
- **Regular mode:** Agent asks for permission before executing or editing. User-facing approval follows the canonical ladder: `deny`, `once`, `for session`, `always`.
- **Persistence:** Mode is a per-session or per-chat setting (configurable in chat UI or settings). `for session` does not persist across app restarts; durable approval/default behavior is owned by `Plans/Permissions_System.md`.

---

