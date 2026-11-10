# Shard 003: Summary

Source: `Plans/storage-plan.md`

Source lines: L171-L175

Source SHA256: `591a796db349c776e464d3429ea59f855e68d3f3983f60739766db4a7371304f`

---

## Summary

Storage for the rewrite follows a multi-store design: **seglog** as the canonical append-only event stream, **redb** for durable KV state (settings, sessions, runs, checkpoints, editor state, analytics rollups), and **Tantivy** for full-text search. Projectors consume seglog and maintain Tantivy indices, redb state and the chat render pages. No always-on JSONL mirror exists (SP-339); JSONL or JSON is written only on request by `pm export`. Analytics scan jobs compute rollups from seglog (sealed history through the Parquet archive, SP-341) and store them in redb for fast dashboard and Usage queries. Amended 2026-10-31 (DL-270): SP-335 to SP-345 at the end of this document own the compression, durability, payload, render-page, mirror, redb, analytics, engine, media, gate and placement rules. This plan specifies **how** we implement it: file locations, event format, redb schema, projector behavior, and how we address gaps, failure modes, and optional enhancements.

---
