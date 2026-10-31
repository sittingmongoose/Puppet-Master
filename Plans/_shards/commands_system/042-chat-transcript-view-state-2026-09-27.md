# Shard 042: Chat transcript view state — 2026-09-27

Source: `Plans/Commands_System.md`

Source lines: L7124-L7128

Source SHA256: `801b99b34f303270e5a9b068bd83a2c81a146ef82c28f8680c79a5e734debda2`

---

## Chat transcript view state — 2026-09-27

### CDRY-013 — Chat transcript view-state actions

The rebuilt chat transcript (ACD-469 through ACD-475) adds visual actions that follow CDRY-006: they use local view-state primitives, emit no domain event and register no command. They are `local.chat.jump_to_latest` (scroll to the newest message and re-engage follow-along), `local.working_card.collapse` and `local.working_card.expand` (fold the working card into its strip and reopen it), `local.working_card.pin_subject` (pin the panel to one subject or cluster), `local.working_card.follow_live` (return the panel to the live subject), and `local.message.peek` (the brief reveal of a finished reply's hover row). Reply word pacing, send flights, the turn spine, the fold height hold and motion voices are presentation, not actions. The chat's command-bearing controls reuse existing identities (UCC-168): `cmd.chat.send`, `cmd.chat.stop`, `cmd.chat.queue.send_now`, `cmd.chat.queue.remove`, `cmd.settings.transaction.apply` for the header sound mute, and `cmd.runtime.approve` / `cmd.runtime.decline` for approvals.
