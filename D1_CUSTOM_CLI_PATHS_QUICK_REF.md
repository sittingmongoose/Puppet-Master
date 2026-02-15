# D1: Custom CLI Paths - Quick Reference

## 🎯 What Was Done

Added custom CLI path support to platform detector with priority-based search.

## 📊 Detection Flow

```
┌─────────────────────────────────────────────────────────┐
│  detect_platform_with_custom_paths(platform, custom)   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  1. Custom Path (if provided)       │ ← PRIORITY 1
        │     /custom/path/to/cli             │
        └─────────────────────────────────────┘
                          │
                     Not Found?
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  2. System PATH                     │ ← PRIORITY 2
        │     which cursor                    │
        └─────────────────────────────────────┘
                          │
                     Not Found?
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  3. Platform Specs Defaults         │ ← PRIORITY 3
        │     ~/.cursor/bin/cursor            │
        │     /opt/cursor/bin/cursor          │
        └─────────────────────────────────────┘
                          │
                     Not Found?
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  4. Common System Locations         │ ← PRIORITY 4
        │     /usr/local/bin/cursor           │
        │     /usr/bin/cursor                 │
        │     /opt/homebrew/bin/cursor        │
        └─────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  DetectedPlatform     │
              │  + searched_paths[]   │
              └───────────────────────┘
```

## 🔧 API Changes

### New Struct Field
```rust
pub struct DetectedPlatform {
    pub platform: Platform,
    pub cli_path: PathBuf,
    pub cli_name: String,
    pub version: Option<String>,
    pub available: bool,
    pub searched_paths: Vec<String>,  // ← NEW
}
```

### New Methods
```rust
// DRY:FN:detect_platform_with_custom_paths
PlatformDetector::detect_platform_with_custom_paths(
    platform: Platform, 
    custom_path: Option<&str>
) -> Option<DetectedPlatform>

PlatformDetector::detect_installed_with_config(
    cli_paths: &CliPaths
) -> Vec<DetectedPlatform>
```

## 💻 Usage

### Without Custom Path
```rust
// Standard detection (unchanged behavior)
let detected = PlatformDetector::detect_platform(Platform::Cursor).await;
```

### With Custom Path
```rust
// Custom path takes priority
let detected = PlatformDetector::detect_platform_with_custom_paths(
    Platform::Cursor,
    Some("/home/user/.local/bin/cursor")
).await;
```

### With Config
```rust
// Use paths from config
let cli_paths = CliPaths {
    cursor: Some("/custom/cursor"),
    claude: Some("/custom/claude"),
    ..Default::default()
};

let detected = PlatformDetector::detect_installed_with_config(&cli_paths).await;
```

## 📝 Integration with CliPaths

```rust
// From puppet-master-rs/src/types/platform.rs
pub struct CliPaths {
    pub cursor: Option<String>,
    pub codex: Option<String>,
    pub claude: Option<String>,
    pub gemini: Option<String>,
    pub copilot: Option<String>,
}

impl CliPaths {
    pub fn get(&self, platform: Platform) -> Option<&str>
    pub fn set(&mut self, platform: Platform, path: String)
}
```

## ✅ Tests

```
test_detect_installed ............................. ok
test_create_detection_map ......................... ok
test_extract_version .............................. ok
test_detected_platform_version .................... ok (updated)
test_installation_status .......................... ok (updated)
test_detect_with_custom_paths ..................... ok (NEW)
test_detect_platform_with_custom_path ............. ok (NEW)

Result: 7 passed, 0 failed
```

## 📂 Files Modified

```
puppet-master-rs/src/
├── platforms/
│   └── platform_detector.rs ........... MODIFIED (+187 lines)
│       - Added searched_paths field
│       - Added detect_platform_with_custom_paths()
│       - Added detect_installed_with_config()
│       - Updated detect_platform()
│       - Updated check_common_locations()
│       - Updated test cases
│       - Added new tests
└── views/
    └── config.rs ....................... FIXED (1 line)
        - Fixed closure borrow issue
```

## 🔍 Debugging with searched_paths

```rust
let detected = PlatformDetector::detect_platform_with_custom_paths(
    Platform::Cursor,
    Some("/nonexistent/path")
).await;

if let Some(platform) = detected {
    println!("CLI found at: {}", platform.cli_path.display());
    println!("Searched paths:");
    for path in &platform.searched_paths {
        println!("  - {}", path);
    }
}
// Output:
// CLI found at: /usr/bin/cursor
// Searched paths:
//   - /nonexistent/path
//   - PATH
```

## 🎯 Next Integration Points

1. **Config UI** - Add text inputs for custom CLI paths
2. **Doctor Checks** - Show searched_paths in diagnostics
3. **Platform Runners** - Use detect_installed_with_config()
4. **Settings Persistence** - Save/load custom paths

## 📊 Status

| Aspect | Status |
|--------|--------|
| Implementation | ✅ Complete |
| Compilation | ✅ Success |
| Tests | ✅ 7/7 Passing |
| Documentation | ✅ Complete |
| Memory Safety | ✅ Zero Unsafe Code |
| Backward Compat | ✅ Preserved |

## 🔖 Quick Commands

```bash
# Verify compilation
cd puppet-master-rs && cargo check

# Run tests
cargo test --lib platforms::platform_detector

# Update SQL todo (when app stopped)
python3 -c "import sqlite3; c=sqlite3.connect('.puppet-master/puppet-master.db'); \
c.execute(\"UPDATE todos SET status='done' WHERE id='d1-custom-cli-paths'\"); c.commit()"
```

---

**Status:** ✅ COMPLETE  
**Tag:** `DRY:FN:detect_platform_with_custom_paths`  
**Location:** `puppet-master-rs/src/platforms/platform_detector.rs`
