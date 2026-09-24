# Shard 003: Summary

Source: `Plans/storage-plan.md`

Source lines: L171-L175

Source SHA256: `92878371b1960f0f3dc0ca9f6b53ff07b10ac0bf2d6468d20d5007b075ec92ed`

---

## Summary

Storage for the rewrite follows a multi-store design: **seglog** as the canonical append-only event stream, **redb** for durable KV state (settings, sessions, runs, checkpoints, editor state, analytics rollups), and **Tantivy** for full-text search. Projectors consume seglog and maintain a JSONL mirror, Tantivy indices, and redb state. Analytics scan jobs compute rollups from seglog and store them in redb for fast dashboard and Usage queries. This plan specifies **how** we implement it: file locations, event format, redb schema, projector behavior, and how we address gaps, failure modes, and optional enhancements.

---
