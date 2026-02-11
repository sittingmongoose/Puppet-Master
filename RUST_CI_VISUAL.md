# GitHub Actions CI/CD Workflow - Visual Reference

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRIGGER EVENTS                                      │
├─────────────────┬────────────────┬──────────────────┬──────────────────────┤
│ Push main/master│  Pull Request  │   Tag v*         │  workflow_dispatch   │
└────────┬────────┴────────┬───────┴─────────┬────────┴───────────┬──────────┘
         │                 │                 │                    │
         └─────────────────┴─────────────────┴────────────────────┘
                                    ▼
         ┌────────────────────────────────────────────────────────┐
         │              JOB: test (ubuntu-latest)                 │
         │  ┌──────────────────────────────────────────────────┐ │
         │  │ 1. cargo fmt -- --check                          │ │
         │  │ 2. cargo clippy --all-features                   │ │
         │  │ 3. cargo test --all-features                     │ │
         │  └──────────────────────────────────────────────────┘ │
         └────────────────────┬───────────────────────────────────┘
                              ▼
         ┌────────────────────────────────────────────────────────┐
         │              JOB: build (matrix)                       │
         │                                                        │
         │  ┌──────────────────┐  ┌──────────────────┐          │
         │  │  Linux x86_64    │  │ macOS arm64      │          │
         │  │  (musl static)   │  │ (aarch64)        │          │
         │  │                  │  │                  │          │
         │  │ cargo build      │  │ cargo build      │          │
         │  │ --release        │  │ --release        │          │
         │  │ --target musl    │  │ --target aarch64 │          │
         │  └────────┬─────────┘  └─────────┬────────┘          │
         │           │                      │                    │
         │  ┌────────┴─────────┐  ┌─────────┴────────┐          │
         │  │ macOS x86_64     │  │ Windows x86_64   │          │
         │  │ (Intel)          │  │ (MSVC)           │          │
         │  │                  │  │                  │          │
         │  │ cargo build      │  │ cargo build      │          │
         │  │ --release        │  │ --release        │          │
         │  │ --target x86_64  │  │ --target windows │          │
         │  └────────┬─────────┘  └─────────┬────────┘          │
         └───────────┼────────────┬─────────┼────────────────────┘
                     │            │         │
                     ▼            ▼         │
         ┌────────────────────────────┐    │
         │  JOB: macos-universal      │    │
         │  ┌──────────────────────┐  │    │
         │  │ Download arm64       │  │    │
         │  │ Download x86_64      │  │    │
         │  │ lipo -create         │  │    │
         │  │ → universal binary   │  │    │
         │  └──────────────────────┘  │    │
         └──────────┬─────────────────┘    │
                    │                      │
                    ▼                      ▼
         ┌────────────────────────────────────────────┐
         │  JOB: package (matrix)                     │
         │  [Only on push/tag, not PR]                │
         │                                            │
         │  ┌──────────────┐  ┌──────────────┐       │
         │  │   Linux      │  │   macOS      │       │
         │  │   nfpm       │  │   hdiutil    │       │
         │  │   ↓          │  │   ↓          │       │
         │  │  .deb + .rpm │  │   .dmg       │       │
         │  └──────────────┘  └──────────────┘       │
         │                                            │
         │  ┌──────────────┐                         │
         │  │  Windows     │                         │
         │  │  NSIS        │                         │
         │  │  ↓           │                         │
         │  │  .exe        │                         │
         │  └──────────────┘                         │
         └──────────┬─────────────────────────────────┘
                    │
                    ▼ [Only on tag v*]
         ┌────────────────────────────────────────────┐
         │  JOB: release                              │
         │  ┌──────────────────────────────────────┐  │
         │  │ Create GitHub Release                │  │
         │  │ Attach all binaries + installers     │  │
         │  │ Auto-generate release notes          │  │
         │  └──────────────────────────────────────┘  │
         └────────────────────────────────────────────┘
```

---

## 📊 Job Dependencies

```
test
  │
  └──► build (4 parallel jobs)
         ├──► Linux x86_64
         ├──► macOS arm64
         ├──► macOS x86_64
         └──► Windows x86_64
              │
              └──► macos-universal (merges arm64 + x86_64)
                     │
                     └──► package (3 parallel jobs)
                            ├──► Linux: .deb + .rpm
                            ├──► macOS: .dmg
                            └──► Windows: .exe
                                   │
                                   └──► release (only on tag)
```

---

## 🔄 Workflow Decision Tree

```
                   ┌─────────────┐
                   │  Git Event  │
                   └──────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────┐      ┌────────────┐   ┌────────────┐
   │   PR   │      │ Push main  │   │  Tag v*    │
   └───┬────┘      └──────┬─────┘   └──────┬─────┘
       │                  │                 │
       │                  │                 │
   ┌───▼────────┐    ┌────▼─────────┐  ┌───▼──────────┐
   │ test       │    │ test         │  │ test         │
   │ build      │    │ build        │  │ build        │
   │ ✗ package  │    │ package      │  │ package      │
   │ ✗ release  │    │ ✗ release    │  │ release      │
   └────────────┘    └──────────────┘  └──────────────┘
   Artifacts: 30d   Artifacts: 90d    GitHub Release
```

---

## 🎯 Matrix Build Targets

### Build Matrix
```
┌────────────────┬──────────────────────────────┬──────────────┐
│   Platform     │          Target              │   Runner     │
├────────────────┼──────────────────────────────┼──────────────┤
│ Linux          │ x86_64-unknown-linux-musl    │ ubuntu-latest│
│ macOS (ARM)    │ aarch64-apple-darwin         │ macos-14     │
│ macOS (Intel)  │ x86_64-apple-darwin          │ macos-14     │
│ Windows        │ x86_64-pc-windows-msvc       │ windows-latest│
└────────────────┴──────────────────────────────┴──────────────┘
```

### Package Matrix
```
┌────────────────┬──────────────────┬──────────────┬────────────┐
│   Platform     │  Input Binary    │   Output     │  Tool      │
├────────────────┼──────────────────┼──────────────┼────────────┤
│ Linux          │ musl binary      │ .deb + .rpm  │ nfpm       │
│ macOS          │ universal binary │ .dmg         │ hdiutil    │
│ Windows        │ .exe             │ .exe setup   │ NSIS       │
└────────────────┴──────────────────┴──────────────┴────────────┘
```

---

## 📦 Artifact Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Build Artifacts                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  puppet-master-linux-x86_64    → [30d] → package → .deb/.rpm│
│                                                    ↓         │
│  puppet-master-macos-arm64  ┐                   [90d]       │
│                             ├→ universal-binary  ↓          │
│  puppet-master-macos-x86_64 ┘         ↓         .dmg       │
│                                                    ↓         │
│  puppet-master-windows-x86_64  → [30d] → package → .exe    │
│                                                    ↓         │
│                                              ┌─────────────┐ │
│                                              │   Release   │ │
│                                              │  (on tags)  │ │
│                                              └─────────────┘ │
└──────────────────────────────────────────────────────────────┘

Retention:
  - Binaries: 30 days
  - Installers: 90 days
  - Releases: Permanent
```

---

## ⏱️ Estimated Timing

```
┌─────────────────────────┬──────────────┬────────────────┐
│         Job             │   Duration   │   Parallel     │
├─────────────────────────┼──────────────┼────────────────┤
│ test                    │   5-7 min    │      -         │
│ build (all 4 targets)   │   8-12 min   │   ✅ Yes       │
│ macos-universal         │   1-2 min    │      -         │
│ package (all 3)         │   3-5 min    │   ✅ Yes       │
│ release                 │   1-2 min    │      -         │
├─────────────────────────┼──────────────┼────────────────┤
│ Total (worst case)      │  ~20 min     │   with cache   │
└─────────────────────────┴──────────────┴────────────────┘

Note: Times with cache enabled. First run may be 30-40 minutes.
```

---

## 🔐 Security Checkpoints

```
┌─────────────────────────────────────────────────────────┐
│                   Security Gates                        │
└─────────────────────────────────────────────────────────┘

1. Code Quality
   ├── cargo fmt (formatting)
   ├── cargo clippy (linting)
   └── cargo test (unit tests)

2. Build Verification
   ├── Static linking check (Linux)
   ├── Binary stripping (size + security)
   └── Smoke tests (--version)

3. Package Signing
   ├── macOS: Code signing (optional)
   ├── Windows: Authenticode (optional)
   └── Linux: GPG signing (optional)

4. Release Process
   ├── Tag-based releases only
   ├── Automated release notes
   └── Asset verification
```

---

## 📈 Cache Strategy

```
┌──────────────────────────────────────────────────────┐
│            Rust Cache (swatinem/rust-cache)          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Cache Key: puppet-master-rs → target               │
│             └── Per-target cache                     │
│                                                      │
│  Cached Items:                                       │
│    ✓ Compiled dependencies (target/release/deps)    │
│    ✓ Build artifacts                                 │
│    ✓ Incremental compilation data                   │
│                                                      │
│  Cache Hit: 30-60% faster builds                     │
│  Cache Miss: Full rebuild                            │
│                                                      │
│  Invalidation:                                       │
│    - Cargo.toml changes                              │
│    - Cargo.lock changes                              │
│    - rust-toolchain.toml changes                     │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Status Indicators

### Badge Codes for README
```markdown
<!-- Build Status -->
![Build Status](https://github.com/YOUR_ORG/RWM-Puppet-Master/actions/workflows/build-installers.yml/badge.svg)

<!-- Release Version -->
![Release](https://img.shields.io/github/v/release/YOUR_ORG/RWM-Puppet-Master)

<!-- Downloads -->
![Downloads](https://img.shields.io/github/downloads/YOUR_ORG/RWM-Puppet-Master/total)
```

---

## 🔧 Troubleshooting Flow

```
         Build Failed?
              │
              ▼
    ┌─────────────────┐
    │  Which job?     │
    └────────┬────────┘
             │
   ┌─────────┼──────────┐
   │         │          │
   ▼         ▼          ▼
 test      build     package
   │         │          │
   │         │          │
   ▼         ▼          ▼
Check:    Check:     Check:
- fmt     - deps     - version
- clippy  - target   - files
- tests   - cache    - tools
```

---

**Visual Reference** | GitHub Actions CI/CD  
*Created: 2025-01-24*
