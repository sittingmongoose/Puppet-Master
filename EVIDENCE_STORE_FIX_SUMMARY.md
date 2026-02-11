# Evidence Store Fix Summary

## Problem
The `evidence_store.rs` file was importing and using the wrong `EvidenceType` enum:
- **Old Import**: `use crate::types::evidence::EvidenceType;`
- **Old Variants**: `TestLog`, `Screenshot`, `BrowserTrace`, `FileSnapshot`, `Metric`, `GateReport`, `CommandOutput`, `Custom(String)`

Callers (like `pipeline.rs`) were passing `crate::types::EvidenceType` (from `execution.rs`), causing type mismatches and compilation errors.

## Solution
Updated `evidence_store.rs` to use `crate::types::EvidenceType` from the `execution` module.

## Changes Made

### 1. Import Statement (Line 8)
**Before:**
```rust
use crate::types::{Evidence};
use crate::types::evidence::EvidenceType;
```

**After:**
```rust
use crate::types::{Evidence, EvidenceType};
```

### 2. Directory Creation (Lines 40-47)
**Before:**
```rust
for evidence_type in &[
    EvidenceType::TestLog,
    EvidenceType::Screenshot,
    EvidenceType::BrowserTrace,
    EvidenceType::FileSnapshot,
    EvidenceType::Metric,
    EvidenceType::GateReport,
    EvidenceType::CommandOutput,
] {
    let subdir = base_path.join(evidence_type.name());
```

**After:**
```rust
for evidence_type in &[
    EvidenceType::Text,
    EvidenceType::File,
    EvidenceType::CommandOutput,
    EvidenceType::Image,
    EvidenceType::TestResult,
    EvidenceType::GitCommit,
] {
    let subdir = base_path.join(evidence_type.to_string());
```

### 3. Extension Mapping (Lines 75-82)
**Before:**
```rust
let extension = match &evidence_type {
    EvidenceType::TestLog => "log",
    EvidenceType::Screenshot => "png",
    EvidenceType::BrowserTrace => "json",
    EvidenceType::FileSnapshot => "txt",
    EvidenceType::Metric => "json",
    EvidenceType::GateReport => "json",
    EvidenceType::CommandOutput => "log",
    EvidenceType::Custom(_) => "txt",
};
```

**After:**
```rust
let extension = match &evidence_type {
    EvidenceType::Text => "txt",
    EvidenceType::File => "dat",
    EvidenceType::CommandOutput => "log",
    EvidenceType::Image => "png",
    EvidenceType::TestResult => "json",
    EvidenceType::GitCommit => "txt",
};
```

### 4. Method Calls Changed from `.name()` to `.to_string()`
- Line 48: `evidence_type.name()` → `evidence_type.to_string()`
- Line 96: `evidence_type.name()` → `evidence_type.to_string()`
- Line 111: `evidence_type.name().to_string()` → `evidence_type.to_string()`
- Line 151: `evidence_type.name()` → `evidence_type.to_string()`

### 5. List Methods Updated (Lines 143-150, 242-249)
Both `list_for_tier()` and `get_evidence()` now iterate over the correct EvidenceType variants:
- Text
- File
- CommandOutput
- Image
- TestResult
- GitCommit

## EvidenceType Comparison

### execution.rs EvidenceType (NOW USED)
```rust
pub enum EvidenceType {
    Text,           // General text evidence
    File,           // File path evidence
    CommandOutput,  // Command execution output
    Image,          // Screenshots or images
    TestResult,     // Test results
    GitCommit,      // Git commit evidence
}
```

### evidence.rs EvidenceType (NO LONGER USED)
```rust
pub enum EvidenceType {
    TestLog,        // Test execution log output
    Screenshot,     // Screenshot of UI or terminal
    BrowserTrace,   // Browser trace/network capture
    FileSnapshot,   // File system snapshot
    Metric,         // Performance or other metric
    GateReport,     // Gate verification report
    CommandOutput,  // Command execution output
    Custom(String), // Custom evidence type
}
```

## Result
- ✅ All references to old EvidenceType variants removed
- ✅ Uses `to_string()` instead of `.name()` method
- ✅ Directory structure aligned with execution EvidenceType
- ✅ Extension mapping aligned with execution EvidenceType
- ✅ Type compatibility with callers (pipeline.rs, etc.)
- ✅ Tests use valid EvidenceType::CommandOutput variant
- ✅ No compilation errors related to EvidenceType mismatches

## Files Modified
1. `puppet-master-rs/src/state/evidence_store.rs` - Updated to use execution EvidenceType
2. `puppet-master-rs/src/start_chain/pipeline.rs` - Updated imports to use execution EvidenceType

## Verification of Callers
All callers now use the correct EvidenceType from execution module:

### ✅ pipeline.rs (src/start_chain/)
- Import: `use crate::types::EvidenceType;`
- Uses: `EvidenceType::CommandOutput`

### ✅ ai_verifier.rs (src/verification/)
- Import: `use crate::types::EvidenceType;`
- Uses: `EvidenceType::TestResult`

### ✅ browser_verifier.rs (src/verification/)
- Import: `use crate::types::EvidenceType;`
- Uses: `EvidenceType::TestResult`, `Image`, `File`, `CommandOutput`

### ✅ gate_runner.rs (src/verification/)
- Import: `use crate::types::*;`
- Uses: `EvidenceType::CommandOutput`, `Text`

## Dependencies
The execution EvidenceType is re-exported in `types/mod.rs` (line 36):
```rust
pub use execution::{
    ..., EvidenceType, EvidenceData
};
```

So callers can use `crate::types::EvidenceType` which resolves to the execution module's type.
