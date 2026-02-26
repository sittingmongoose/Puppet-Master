## 10a. FileSafe and Assistant YOLO mode

**Context:** In Assistant chat (see **Plans/assistant-chat-design.md** §3), **YOLO mode** means the agent runs with maximum permissions: no permission prompts. The user accepts full automation for that session; the agent can execute, edit, and run tools without asking.

**Implication for FileSafe:** When YOLO is on, there is **no human approval step** before tool execution. FileSafe is therefore the **primary protection layer** for Assistant chat in YOLO mode. If FileSafe is disabled or relaxed while YOLO is on, destructive commands and out-of-scope writes can run with no further gate.

**Requirements:**

1. **Same FileSafe config for Assistant:** Assistant chat (and thus YOLO runs) must use the same FileSafe settings as the rest of the app (Command blocklist, Write scope, Security filter). No separate "Assistant-only" bypass unless explicitly configured.
2. **Recommend FileSafe on when YOLO is on:** When the user enables YOLO for a chat, the GUI should recommend (or warn) that FileSafe remain enabled. Options: show a one-time hint ("FileSafe protects you when YOLO is on"), or a small indicator that FileSafe is active when YOLO is selected.
3. **Configurable and visible:** FileSafe toggles must be easy to find and turn on/off (see §13.4 and §15.5). A user who turns on YOLO should be able to confirm FileSafe state without digging through multiple screens.
4. **Optional: per-context override:** If product requirements later allow "relax FileSafe for this chat only" (e.g. power users), that must be an explicit, clearly labeled setting--not the default when YOLO is on.

**Summary:** YOLO mode and FileSafe are complementary: YOLO removes approval prompts; FileSafe enforces hard limits (destructive commands, write scope, sensitive files). FileSafe settings must be configurable in the GUI and easy to turn on or off, and when Assistant runs in YOLO mode, FileSafe should be the main line of defense.

---

