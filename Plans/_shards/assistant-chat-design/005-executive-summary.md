# Shard 005: Executive Summary

Source: `Plans/assistant-chat-design.md`

Source lines: L47-L52

Source SHA256: `c4974fbcf8a2f9df1db3ecafe3847e56de05f47487c4079ab98c9969df254b01`

---

## Executive Summary

The **Assistant** is the third major surface alongside **Interview** and **Orchestrator**: a flexible chat for ask/plan/execute, teaching, **addressing dashboard warnings and Calls to Action (CtAs)** -- including HITL approval prompts -- and continuing work after the orchestrator completes. Chat UI is shared between Assistant and Interview with mode-specific presentation (Interview: phase-centric with thought stream and message strip; Assistant: message history, plan panel, thought stream). This plan defines modes, permissions, attachments, File Manager integration, Plan/Crew/BrainStorm behavior, and interview-phase UX. All design follows DRY: single source of truth for platform data (`platform_specs`), subagent names (`subagent_registry`), and reusable widgets per `docs/gui-widget-catalog.md`.

---

