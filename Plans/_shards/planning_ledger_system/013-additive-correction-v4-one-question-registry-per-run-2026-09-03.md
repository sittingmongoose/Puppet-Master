# Shard 013: Additive Correction v4 — One Question Registry Per Run (2026-09-03)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1356-L1373

Source SHA256: `516b9ec4748fe0aaafe6af831dcc84ca522b7829bfcda607a48d7cf1ccf6b866`

---

## Additive Correction v4 — One Question Registry Per Run (2026-09-03)

`QMAX-005..008`, `QMAX-016`. This owner keeps the durable question record shape and its
single-registry guarantee; the arithmetic and the admission decision are owned by
`Plans/Assistant_Plan_Runtime.md` (`QMAX-001..016`).

- The registry is keyed by the **planning run**, not by participant, agent, pass, or card. Every
  BrainStorm question requester and the participant running Grill Me (a switch, not a participant
  of its own) share the same registry through its host. The Wonderer never asks the user or
  reads or writes its counter (DL-218), and the ceiling is never multiplied by participant count.
- A `QuestionItem` is charged once, when its stable identity is first durably presented to the
  user. Re-render, reconnect, restart, retry, and panel reopen resolve the existing record rather
  than writing a new one.
- Plan revisions continue the same registry; only a genuinely new Plan identity starts a new one.
  Plan version is never the registry key.
- The registry records duplicate merges, imported prior-thread answers, and
  researched-instead-of-asked dispositions, which is what makes `reused_answer_count` and
  `research_resolved_count` reconstructible after a restart.
