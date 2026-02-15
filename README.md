# RWM Puppet Master

RWM Puppet Master is a **Rust/Iced desktop orchestrator** for the Ralph Wiggum Method (Phase -> Task -> Subtask -> Iteration).
It coordinates external AI platform CLIs (Cursor, Codex, Claude Code, Gemini, GitHub Copilot) without direct LLM API calls.

## Current Architecture

- Active app: `puppet-master-rs/` (Rust 2024 + Iced)
- Installer pipelines: `installer/windows`, `installer/macos`, `installer/linux`
- Cross-platform build helpers: `scripts/build-installer-*.{sh,bat,ps1}`

Legacy TypeScript CLI/web/Tauri layers have been removed from the active codebase.

## Prerequisites

- Rust toolchain (stable)
- Platform packaging tools:
  - Windows: NSIS (`makensis`)
  - macOS: Xcode command line tools
  - Linux: `dpkg-deb` (`dpkg` package), optional `rpmbuild` (`rpm` package)

## Run the App (Development)

```bash
cd puppet-master-rs
cargo run
```

## Build Installers

### Convenience wrappers (repo root)

```bash
./build-installer-linux.sh
./build-installer-macos.command
build-installer-windows.bat
```

### Script entry points

```bash
./scripts/build-installer-linux.sh
./scripts/build-installer-macos.sh
# Windows PowerShell
./scripts/build-installer-windows.ps1
```

### NPM convenience scripts (optional)

```bash
npm run build:linux:iced
npm run build:mac:iced
npm run build:win:iced
```

## CI

Installer CI is defined in:

- `.github/workflows/build-installers.yml`

It builds and smoke-tests installers for Windows, macOS, and Linux from `puppet-master-rs`.
