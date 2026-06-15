# Shard 010: Runtime recovery wiring requirements (2026-03-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L241-L250

Source SHA256: `b08cf4c54b9292599261ec1ecb9dfe01c02080ca309a46af4066d141b0336783`

---

## Runtime recovery wiring requirements (2026-03-09)

The wiring matrix MUST contain explicit producers, handlers, and projection consumers for the runtime packet.

### Runtime recovery wiring minimum rows
- runtime event producers for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.created`, `safe_point.restored`, `remediation.spawned`, and `remediation.resolved`
- projection consumers feeding run graph, orchestrator summaries, chat banners, and history/evidence tabs
- UI command handlers for queue-analysis open, attempt details open, blocked resume, retry, safe-point restore-and-retry, and remediation lineage open

The matrix must make it possible to trace every new packet field from producer to UI consumer.
