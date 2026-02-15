# DRY Tagging Handoff Document

## What Was Done

A team of 4 agents was created to add `// DRY:<TAG>:<name>` comments above every public item (`pub fn`, `pub struct`, `pub enum`, `pub type`, `pub trait`) throughout the Rust/Iced codebase at `puppet-master-rs/src/`. These tags make code grep-discoverable for other AI agents.

## Tag Convention

Tags go on the line **immediately above** the declaration, above any `///` doc comments:

```rust
// DRY:WIDGET:styled_button
/// Create a styled button with the given variant.
pub fn styled_button<'a>(...) -> ... {
```

| Tag | Where | Applied To |
|-----|-------|------------|
| `// DRY:WIDGET:<name>` | `src/widgets/*.rs` | Every pub fn/struct/enum |
| `// DRY:DATA:<name>` | `src/theme/`, `src/types/`, data modules | Public types, constant groups |
| `// DRY:FN:<name>` | Everywhere | Reusable public functions |
| `// DRY:HELPER:<name>` | `src/utils/`, `src/logging/`, style helpers, and shared utility functions in any module | Shared utility functions |
| `// UI-DRY-EXCEPTION: <reason>` | `src/views/` | Bespoke inline UI with justification |

**Do NOT tag**: private fns, `impl` blocks themselves, trait implementations, test modules, `mod.rs` files (unless adding module-level tag).

## Final Status — COMPLETE (2026-02-15)

**Total DRY tags: 2193** across all `.rs` files in `puppet-master-rs/src/`.

`cargo check` passes. Zero files with missing tags (excluding `mod.rs`, `.wgsl`, `main.rs`, `lib.rs`, `bin/`).

### Per-Directory Tag Counts

| Directory | Tags | Tag Types |
|-----------|------|-----------|
| `src/widgets/` | 226 | `DRY:WIDGET:` |
| `src/theme/` | 57 | `DRY:DATA:`, `DRY:HELPER:` |
| `src/types/` | 315 | `DRY:DATA:`, `DRY:FN:` |
| `src/views/` | 65 | `DRY:FN:` |
| `src/projects/` | 24 | `DRY:DATA:`, `DRY:FN:` |
| `src/automation/` | 39 | `DRY:DATA:`, `DRY:FN:` |
| `src/core/` | 202 | `DRY:DATA:`, `DRY:FN:` |
| `src/state/` | 146 | `DRY:DATA:`, `DRY:FN:` |
| `src/platforms/` | 323 | `DRY:DATA:`, `DRY:FN:` |
| `src/utils/` | 52 | `DRY:DATA:`, `DRY:HELPER:` |
| `src/doctor/` | 88 | `DRY:DATA:`, `DRY:FN:` |
| `src/interview/` | 142 | `DRY:DATA:`, `DRY:FN:` |
| `src/start_chain/` | 185 | `DRY:DATA:`, `DRY:FN:` |
| `src/verification/` | 49 | `DRY:DATA:`, `DRY:FN:` |
| `src/git/` | 53 | `DRY:DATA:`, `DRY:FN:` |
| `src/config/` | 53 | `DRY:DATA:`, `DRY:FN:` |
| `src/logging/` | 149 | `DRY:HELPER:` |
| `src/shaders/` | 3 | `DRY:DATA:` |
| `src/app.rs` | 16 | `DRY:DATA:`, `DRY:FN:` |
| `src/tray.rs` | 6 | `DRY:DATA:`, `DRY:FN:` |

### Quality Verification
- ✅ Tags placed above doc comments (not below)
- ✅ No duplicate tags
- ✅ No tags on private items or test modules
- ✅ Correct tag categories (`WIDGET` for widgets, `HELPER` for utils/logging, `DATA`/`FN` elsewhere)
- ✅ Zero missing DRY tags for public declarations (`pub fn`, `pub struct`, `pub enum`, `pub type`, `pub trait`) outside test sections
- ✅ `cargo check` passes
- ✅ `cargo test` passes
- ✅ `scripts/generate-widget-catalog.sh` regenerated
- ✅ `scripts/check-widget-reuse.sh` ran (warn-only, exit 0)

## Reference Files
- Convention doc: `docs/gui-widget-catalog.md`
- Example of correct tagging: `puppet-master-rs/src/platforms/platform_specs.rs`
- Example of correct tagging: `puppet-master-rs/src/widgets/styled_button.rs`
