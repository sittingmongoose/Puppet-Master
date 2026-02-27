## 21. Dashboard Warnings and Calls to Action

The **Dashboard** displays **warnings** and **Calls to Action (CtAs)** that require or benefit from user attention. These are not only informational: the user is expected to **answer or address** them.

- **Warnings:** e.g. approaching usage limits, config wiring gaps, Doctor findings, or run state that needs review. Shown on the Dashboard so the user sees them without opening another view.
- **Calls to Action (CtAs):** Items that need an explicit user action -- e.g. approve, acknowledge, run a suggested action, or fix a configuration issue. CtAs prompt the user to interact.

**Addressable via the chat Assistant:** Warnings and CtAs can be **answered or addressed by the chat Assistant**. The user can:
- Open the Assistant and respond in natural language (e.g. "approve and continue," "what's blocking?", "run the suggested fix").
- Use the Assistant to discuss or clarify before taking action (e.g. "summarize what was done in this phase" before approving a HITL gate).

**HITL prompts:** When Human-in-the-Loop (HITL) is enabled and the orchestrator pauses at a tier boundary (phase, task, or subtask):
  - The **Dashboard** shows a **CtA** that prompts the user to interact (e.g. "Phase X complete -- approval required to continue").
  - A **new thread** is **spawned** with an **appropriate name** (e.g. tied to the phase/task or "Approval: Phase X") so the user has a dedicated place to respond. That thread shows the CtA; the user can address it there via the Assistant (e.g. "approve and continue" or ask for a summary and then approve). So the user is notified on the Dashboard and in a dedicated HITL thread.
  The user can also address the CtA via the Assistant in that thread (e.g. "approve and continue" or ask for a summary and then approve) or via a direct "Approve & continue" control on the Dashboard if provided. See **Plans/human-in-the-loop.md** for HITL settings (GUI) and behavior.

**Orchestrator to Assistant handoff:** When the orchestrator **completes** a run or **pauses** (e.g. at a tier for HITL or at end of phase), the Dashboard/completion UI must offer the canonical CtA **Continue in Assistant**. That action opens the Assistant chat with **relevant context** injected: e.g. run summary, current phase/task/subtask id, and a short summary of what was done. The user can then continue in natural language ("approve and continue", "what should we do next?") without re-pasting. Implementation: Dashboard CtA or completion panel includes a control that switches to Assistant view, creates or selects a thread, and injects a context block (run summary, phase/task, optional suggested prompt).

---

