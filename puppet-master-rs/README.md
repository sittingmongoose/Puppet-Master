# Puppet Master (Rust)

Rust implementation of the RWM Puppet Master orchestrator with an Iced GUI.

## Building

```bash
cd puppet-master-rs
cargo build
```

## WSL Users: Cargo Check Failure

If `cargo check` or `cargo build` fails with **"Invalid argument (os error 22)"** when building wayland-sys or other crates, this is caused by a **WSL noexec mount**. Cargo compiles build scripts into executables and runs them; when the project or build dirs are on a path mounted with `noexec` (e.g. `/mnt/c/...`), the OS refuses to execute those binaries.

**Fix:** Ensure the project and build dirs are on the WSL filesystem, or set:

```bash
export TMPDIR=/tmp
export CARGO_TARGET_DIR=~/.cargo-target   # or /home/$USER/.cargo-target
cargo check
```

- Move the project to `/home/...` (WSL filesystem) instead of `/mnt/c/...` when possible.
- CI (GitHub Actions) is not affected—runners use standard filesystems.
