# Repo Hygiene Cleanup Report

Date: 2026-06-11

## Removed

- `.github/workflows/build-installers.yml` because it targeted the removed `puppet-master-rs/**` app, legacy installer paths, and the old Rust/Iced installer flow.
- `.cursor/commands/**` and `.cursor/plans/**` because they were stale Cursor-era command/status artifacts tied to removed Tauri/installer/source code workflows.

## Kept

- `AGENTS.md` and `.cursorrules` remain the current root project instructions.
- `.codex/config.toml` and `.codex/agents/*.toml` remain the project-local Codex GPT-5.5 xhigh read-only model lock.
- `.github/agents/**`, `.claude/agents/**`, and `.agents/skills/**` were intentionally kept per user direction. They are provider-native compatibility/import material only; they are not the canonical Puppet Master runtime source of truth, and they do not supersede `Plans/**` or the project-local Codex model lock.

## Governance

No `Plans/**` product prose was edited for this cleanup. If the verifier suite passes, no Spec Lock, shard, evidence, or plan graph reseal is required.
