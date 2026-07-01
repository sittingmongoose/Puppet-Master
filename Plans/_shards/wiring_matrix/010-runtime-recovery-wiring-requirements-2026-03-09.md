# Shard 010: Runtime recovery wiring requirements (2026-03-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L243-L254

Source SHA256: `d0e6748a3fa3a920fc557eabe4c198ee2512b7948ff45642932f209e2ee2d566`

---

## Runtime recovery wiring requirements (2026-03-09)

Compatibility/source-lineage disposition: this historical recovery-wiring section preserves minimum-row and UI-handler tokens. It remains source-lineage for WM-036 and must not be read as a separate peer wiring precedence layer.

The wiring matrix MUST contain explicit producers, handlers, and projection consumers for the runtime packet.

### Runtime recovery wiring minimum rows
- runtime event producers for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.created`, `safe_point.restored`, `remediation.spawned`, and `remediation.resolved`
- projection consumers feeding run graph, orchestrator summaries, chat banners, and history/evidence tabs
- UI command handlers for queue-analysis open, attempt details open, blocked resume, retry, safe-point restore-and-retry, and remediation lineage open

The matrix must make it possible to trace every new packet field from producer to UI consumer.
