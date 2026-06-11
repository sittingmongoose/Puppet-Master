# Shard 010: Runtime recovery wiring requirements (2026-03-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L241-L250

Source SHA256: `e1c5df49364c535832aae1f2e12e624e9dfdac1ca7a5118e1845daa4621fc750`

---

## Runtime recovery wiring requirements (2026-03-09)

The wiring matrix MUST contain explicit producers, handlers, and projection consumers for the runtime packet.

### Runtime recovery wiring minimum rows
- runtime event producers for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.created`, `safe_point.restored`, `remediation.spawned`, and `remediation.resolved`
- projection consumers feeding run graph, orchestrator summaries, chat banners, and history/evidence tabs
- UI command handlers for queue-analysis open, attempt details open, blocked resume, retry, safe-point restore-and-retry, and remediation lineage open

The matrix must make it possible to trace every new packet field from producer to UI consumer.
