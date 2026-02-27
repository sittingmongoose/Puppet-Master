## 2. ELI5 Mode

There are **two separate ELI5 toggles**; they are independent and must not be conflated. The authoritative dual-copy checklist for in-scope strings is `Plans/FinalGUISpec.md` §7.4.0.

### 2.1 Chat-level ELI5 (in chat only)

- **What:** A toggle **in the chat UI** that, when **on**, instructs the Assistant to explain technical terms and steps in simpler terms and with more detail (ELI5 = "Explain Like I'm 5") in **that chat**.
- **Default:** **OFF** (Expert/default LLM behavior). By default, no extra "explain simply" instruction is added.
- **Scope:** Affects **Assistant chat behavior only** (explanations, follow-ups, teaching in the conversation).
- **Does NOT affect:** Interviewer **documentation writing style**. When the interview generates PRD, AGENTS.md, requirements, or other docs, chat ELI5 is **ignored**; generated docs remain technical and precise for agent consumption.
- **Implementation:** Chat ELI5 is a per-chat or per-session flag. When building the system prompt or instruction block for the Assistant, append an ELI5 instruction only for that session; do not pass it into interview document-generation prompts.

### 2.2 Application-level ELI5 (app-wide)

- **What:** A **separate** toggle at **application/settings level** labeled **Interaction Mode (Expert/ELI5)**. When ELI5 is active, **tooltips** and **interviewer responses** (in the Interview flow) are longer and simpler.
- **Default:** **ON** (ELI5). New users see simpler copy by default.
- **Scope:** Affects **tooltips** across the app (e.g. Config, Dashboard, Chat) and **interviewer Q&A responses** (the text the interview agent shows when asking questions or giving feedback). Does **not** change generated documentation (PRD, AGENTS.md, etc.).
- **Independent of chat ELI5:** A user can have app ELI5 on (simpler tooltips and interviewer text) and chat ELI5 off (technical Assistant answers in chat), or the reverse. The two toggles are stored and applied separately.
- **Dual-copy rule:** Every in-scope authored copy item in this plan (tooltips/help, interviewer Q&A copy, and chat style instruction copy) must define both **Expert** and **ELI5** variants. Track and audit against `Plans/FinalGUISpec.md` §7.4.0.

---

