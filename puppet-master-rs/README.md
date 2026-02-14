# Puppet Master (Rust)

Rust implementation of the RWM Puppet Master orchestrator with an Iced GUI.

## Building

```bash
cd puppet-master-rs
cargo build
```

## GUI Widget Reuse

Shared Rust/Iced widgets are documented in `docs/gui-widget-catalog.md`.
When implementing GUI changes, prefer existing widgets in `src/widgets/` first and only add bespoke UI when needed.

## Network Mount / WSL Build Issues (OS Error 22)

If `cargo check` or `cargo build` fails with **"Invalid argument (os error 22)"**, this is caused by network filesystems (SMB/CIFS/NFS) or WSL noexec mounts that prevent Cargo build scripts from executing.

**Solution Implemented:** This project includes a `.cargo/config.toml` that automatically redirects build artifacts to `/tmp/puppet-master-build` (local filesystem), avoiding the issue entirely.

```bash
cd puppet-master-rs
cargo check  # Should work without errors
```

**Verification:**
```bash
./verify-cargo-build.sh  # Run verification script
```

**Details:** See [CARGO_OS_ERROR_22_FIX.md](CARGO_OS_ERROR_22_FIX.md) and [NETWORK_MOUNT_WORKAROUND.md](NETWORK_MOUNT_WORKAROUND.md) for complete documentation.

**Note:** CI (GitHub Actions) is unaffected—runners use standard local filesystems.
