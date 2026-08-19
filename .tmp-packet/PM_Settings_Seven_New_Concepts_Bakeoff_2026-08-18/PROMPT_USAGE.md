# How to Use This Packet

Give the same packet to each Settings bakeoff agent together with the current repository. Assign exactly one model folder per agent, then paste `GOAL_PROMPT.md`.

The agent should first return its normal implementation plan and wait for approval. After approval, it should continue in the same Goal and add concepts 05–11 only in its assigned folder.

Do not tell an agent to merge or repair the original four concepts. Their frozen state is part of the assignment.

After the seven new concepts are complete, run `AUDIT_PROMPT.md` with a separate high-end auditor for that model folder. The auditor does not choose a winner.

Recommended assignment paths:

```text
Concepts/settings-redesign-concepts/5.6 Sol/
Concepts/settings-redesign-concepts/CursorAuto/
Concepts/settings-redesign-concepts/fable/
Concepts/settings-redesign-concepts/glm-5-2/
Concepts/settings-redesign-concepts/kimi/
Concepts/settings-redesign-concepts/kimi-k3/
Concepts/settings-redesign-concepts/Opus 5/
Concepts/settings-redesign-concepts/Qwen 5.8/
```
