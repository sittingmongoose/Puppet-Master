# Puppet Master

A Rust/Iced desktop orchestrator that coordinates multiple AI coding CLI platforms using the Ralph Wiggum Method.

---

## What is this?

Puppet Master orchestrates 5 AI CLI platforms (Cursor, Codex, Claude Code, Gemini, GitHub Copilot) through a four-tier hierarchical workflow: **Phase → Task → Subtask → Iteration**. It spawns fresh CLI processes for each iteration, uses file-based memory (`progress.txt`, `AGENTS.md`, `prd.json`), and enforces verification gates between tiers. No API keys needed -- uses subscription-based CLI auth only.

## Key Features

- **5-platform CLI orchestration** -- Cursor, Codex, Claude Code, Gemini, GitHub Copilot
- **Four-tier hierarchical workflow** -- Phase → Task → Subtask → Iteration
- **Native Rust/Iced desktop GUI** -- fast, cross-platform UI
- **Fresh process isolation** per iteration -- deterministic and reproducible
- **Automated verification gates** between tiers
- **File-based memory layers** -- `progress.txt`, `AGENTS.md`, `prd.json`
- **DRY code tagging system** for agent discoverability (`DRY:WIDGET`, `DRY:FN`, etc.)
- **Platform capability auto-detection** -- models, auth, effort/reasoning support
- **Cross-platform installers** -- Windows (NSIS), macOS (.app), Linux (.deb)

## Quick Start

```bash
# Prerequisites: Rust toolchain (stable)
cd puppet-master-rs
cargo run
```

## Build Installers

Build scripts are in the repo root. Each builds for the target platform:

```bash
# Linux (.deb)
./build-installer-linux.sh

# macOS (.app bundle)
./build-installer-macos.command

# Windows (NSIS installer)
build-installer-windows.bat

# All platforms at once
./build-all-installers.sh
```

**Platform packaging prerequisites:**

| Platform | Requirement |
|----------|-------------|
| Windows  | NSIS (`makensis`) |
| macOS    | Xcode command-line tools |
| Linux    | `dpkg-deb` (from `dpkg`), optional `rpmbuild` |

## Architecture

The active codebase lives in **`puppet-master-rs/`** (Rust 2024 + Iced).

| Module | Purpose |
|--------|---------|
| `src/app.rs` | Main app state, Message enum, update/view logic |
| `src/views/` | Iced view functions (config, setup, doctor, wizard, interview) |
| `src/widgets/` | Reusable Iced UI components |
| `src/platforms/` | Platform runners, auth, detection, capability |
| `src/platforms/platform_specs.rs` | **Single source of truth** for all platform CLI data |
| `src/core/` | State machines, orchestrator, execution engine |
| `src/config/` | GUI config, app settings |
| `src/types/` | Type definitions (Platform enum, PlatformConfig) |

## Documentation

| Document | Description |
|----------|-------------|
| [`AGENTS.md`](AGENTS.md) | AI agent instructions, conventions, and project rules |
| [`REQUIREMENTS.md`](REQUIREMENTS.md) | Design specification |
| [`docs/gui-widget-catalog.md`](docs/gui-widget-catalog.md) | Reusable widget catalog |
| [`STATE_FILES.md`](STATE_FILES.md) | State file management spec |

## CI

Installer CI is defined in [`.github/workflows/build-installers.yml`](.github/workflows/build-installers.yml). It builds and smoke-tests installers for Windows, macOS, and Linux.

## For AI Agents

Start by reading **[`AGENTS.md`](AGENTS.md)** -- it contains all conventions, patterns, and rules for this project.
