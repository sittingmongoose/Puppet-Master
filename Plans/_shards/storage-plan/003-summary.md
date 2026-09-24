# Shard 003: Summary

Source: `Plans/storage-plan.md`

Source lines: L171-L175

Source SHA256: `bd6e93bb28c734306e9f8e7991db3d2ffd715c50c8362beacc7c3ae27a0cc384`

---

## Summary

Storage for the rewrite follows a multi-store design: **seglog** as the canonical append-only event stream, **redb** for durable KV state (settings, sessions, runs, checkpoints, editor state, analytics rollups), and **Tantivy** for full-text search. Projectors consume seglog and maintain a JSONL mirror, Tantivy indices, and redb state. Analytics scan jobs compute rollups from seglog and store them in redb for fast dashboard and Usage queries. This plan specifies **how** we implement it: file locations, event format, redb schema, projector behavior, and how we address gaps, failure modes, and optional enhancements.

---
