# Shard 005: Executive Summary

Source: `Plans/assistant-chat-design.md`

Source lines: L48-L52

Source SHA256: `a3fea5b5d0104d239eb54477da4e9c42ad6a1f4719a7e78d29a2e6f9ada9c52f`

---

## Executive Summary

The **Assistant** is the third major surface alongside **Interview** and **Orchestrator**: a flexible chat for ask/plan/execute, teaching, **addressing dashboard warnings and Calls to Action (CtAs)** -- including HITL approval prompts -- and continuing work after the orchestrator completes. Chat UI is shared between Assistant and Interview with mode-specific presentation (Interview: phase-centric with thought stream and message strip; Assistant: message history, plan panel, thought stream). This plan defines modes, permissions, attachments, File Manager integration, Plan/Crew/BrainStorm behavior, and interview-phase UX. All design follows DRY: live provider/model capability data comes from `Plans/Models_System.md` capability snapshots and the shared resolver, subagent names come from `subagent_registry`, and reusable widgets come from the GUI/widget owner docs. Legacy `platform_specs` / `platform_specs.rs` references are source-lineage only and are never active Assistant data sources.

---
