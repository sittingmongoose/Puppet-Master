## 3. Permissions: YOLO vs Regular

- **YOLO mode:** Chat runs with maximum permissions; no permission prompts. Agent can execute, edit, and run tools without asking. User accepts full automation for that session.
- **Regular mode:** Agent asks for permission before executing or editing. User can:
  - **Approve once** (single action), or  
  - **Approve for entire chat session** (all subsequent actions in that session auto-approved).
- **Persistence:** Mode is a per-session or per-chat setting (configurable in chat UI or settings). Do not persist "approve for session" across app restarts; it applies only to the current session.

---

