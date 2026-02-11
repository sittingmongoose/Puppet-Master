# Quick Reference: GitHub Actions CI/CD Workflow

## 🚀 One-Page Guide for Developers

### Workflow Triggers

| Event | Trigger | Jobs Run | Artifacts |
|-------|---------|----------|-----------|
| **Push to main/master** | Every commit | Test → Build → Package | Installers (90-day retention) |
| **Pull Request** | PR creation/update | Test → Build | Binaries only (30-day retention) |
| **Tag v*** | `git tag v0.1.1` | Test → Build → Package → Release | GitHub Release with all assets |
| **Manual** | GitHub UI "Run workflow" | Follows branch logic | Based on branch |

---

## 📦 Build Targets

```
Linux:   x86_64-unknown-linux-musl (static binary, no glibc)
macOS:   universal (aarch64 + x86_64, runs on all Macs)
Windows: x86_64-pc-windows-msvc (MSVC runtime)
```

---

## 🎯 Common Workflows

### Test Your Changes
```bash
# Push to PR branch - runs test + build only
git checkout -b feature/my-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
# Create PR in GitHub → CI runs automatically
```

### Create a Release
```bash
# 1. Update version in Cargo.toml
vim puppet-master-rs/Cargo.toml
# Change: version = "0.2.0"

# 2. Commit and tag
git add puppet-master-rs/Cargo.toml
git commit -m "chore: bump version to 0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0

# 3. Wait for CI (~15-20 minutes)
# 4. Check releases: https://github.com/YOUR_ORG/RWM-Puppet-Master/releases
```

### Download Artifacts
```bash
# Using GitHub CLI
gh run list --workflow=build-installers.yml
gh run view <RUN_ID>
gh run download <RUN_ID>

# Or visit: Actions → Build Installers → Latest run → Artifacts
```

---

## 🔍 Monitoring CI

### View Logs
```
GitHub → Actions → Build Installers (Rust) → Click run → Select job
```

### Check Build Status
```bash
# Using GitHub CLI
gh run list --workflow=build-installers.yml --limit 5

# Check specific run
gh run view <RUN_ID> --log
```

### Workflow Badges
Add to README.md:
```markdown
[![Build Installers](https://github.com/YOUR_ORG/RWM-Puppet-Master/actions/workflows/build-installers.yml/badge.svg)](https://github.com/YOUR_ORG/RWM-Puppet-Master/actions/workflows/build-installers.yml)
```

---

## 🛠️ Debugging Failed Builds

### Test Job Failed
```bash
# Run locally (if not in WSL with noexec):
cd puppet-master-rs
cargo fmt -- --check
cargo clippy --all-features
cargo test --all-features
```

### Build Job Failed
```bash
# Check Cargo.lock is committed
git add puppet-master-rs/Cargo.lock
git commit -m "chore: update Cargo.lock"

# Verify dependencies
cd puppet-master-rs
cargo update
cargo check --release
```

### Package Job Failed
- Check version format in `Cargo.toml`
- Verify icons exist: `puppet-master-rs/icons/icon.png`
- Review packaging logs in GitHub Actions

---

## 📊 Artifact Contents

### Binaries (30-day retention)
```
puppet-master-linux-x86_64        → Static Linux binary
puppet-master-macos-arm64         → macOS ARM64 binary
puppet-master-macos-x86_64        → macOS Intel binary
puppet-master-macos-universal     → Universal macOS binary
puppet-master-windows-x86_64      → Windows .exe
```

### Installers (90-day retention)
```
installer-ubuntu-latest/
  ├── puppet-master_0.1.1_amd64.deb
  └── puppet-master-0.1.1.x86_64.rpm

installer-macos-14/
  └── puppet-master-0.1.1-universal.dmg

installer-windows-latest/
  └── puppet-master-setup-0.1.1-x86_64.exe
```

---

## 🔧 Workflow Configuration

### Rust Version
Defined in: `puppet-master-rs/rust-toolchain.toml`
```toml
[toolchain]
channel = "1.93.0"
```

### Build Optimization
Defined in: `puppet-master-rs/Cargo.toml`
```toml
[profile.release]
lto = true           # Link-time optimization
strip = true         # Remove debug symbols
opt-level = "z"      # Optimize for size
panic = "abort"      # Smaller panic handler
codegen-units = 1    # Better optimization
```

### Cache Configuration
- **Provider**: `swatinem/rust-cache@v2`
- **Scope**: Per-target (Linux, macOS, Windows)
- **Location**: `puppet-master-rs/target`

---

## 🚨 Known Issues

### WSL Local Build Failure
**Symptom**: `Invalid argument (os error 22)` on `cargo build`  
**Cause**: WSL `noexec` mount  
**Solution**: Use CI for builds, or fix WSL mount  
**Impact**: CI builds work fine ✅

### clippy Warnings
**Status**: Soft-fail (doesn't block CI)  
**Action**: Fix warnings over time  
```bash
cargo clippy --all-features --fix
```

---

## 📝 Maintenance Tasks

### Update Rust Version
```bash
# Edit rust-toolchain.toml
vim puppet-master-rs/rust-toolchain.toml
# Change: channel = "1.94.0"

# Test locally (or in CI)
cd puppet-master-rs
rustup override set 1.94.0
cargo build --release
```

### Update Dependencies
```bash
cd puppet-master-rs
cargo update
cargo test --all-features
git add Cargo.lock
git commit -m "chore: update dependencies"
```

### Add New Target
Edit `.github/workflows/build-installers.yml`:
```yaml
matrix:
  include:
    # ... existing targets ...
    - os: ubuntu-latest
      target: aarch64-unknown-linux-musl  # ARM64 Linux
      artifact: puppet-master-linux-arm64
      binary_ext: ""
```

---

## 🎯 Performance Tips

### Speed Up CI
1. **Minimize dependencies**: Only add what you need
2. **Use cache**: Already enabled with `rust-cache`
3. **Parallel jobs**: Already using matrix builds
4. **Conditional jobs**: Use `if:` for optional steps

### Reduce Binary Size
```toml
# Already optimized in Cargo.toml
[profile.release]
opt-level = "z"      # Size optimization
lto = true           # Remove unused code
strip = true         # Remove debug info
```

### Faster Local Testing
```bash
# Skip tests for quick check
cargo check

# Only run specific tests
cargo test test_name

# Use release mode for benchmarks
cargo build --release
```

---

## 🔗 Useful Links

- **Workflow file**: `.github/workflows/build-installers.yml`
- **Actions tab**: `github.com/YOUR_ORG/RWM-Puppet-Master/actions`
- **Releases**: `github.com/YOUR_ORG/RWM-Puppet-Master/releases`
- **Artifacts**: Available in completed workflow runs

---

## 📞 Support

### CI Issues
1. Check workflow logs in GitHub Actions
2. Verify local build passes: `cargo build --release`
3. Review recent commits for breaking changes
4. Open issue with workflow run link

### Release Issues
1. Verify tag format: `v*` (e.g., `v0.1.1`)
2. Check version in `Cargo.toml` matches tag
3. Ensure all jobs passed before release job

---

**Last Updated**: 2025-01-24  
**Workflow Version**: Rust-native CI/CD  
**Maintainer**: DevOps Team
