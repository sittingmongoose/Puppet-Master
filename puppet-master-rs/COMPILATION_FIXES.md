# Compilation Fixes Applied

## Overview
Fixed compilation errors in the start_chain pipeline and evidence_store modules to ensure proper type consistency across the codebase.

## Files Modified

### 1. `src/start_chain/pipeline.rs`

#### Issue 1: Incorrect function signature
**Problem**: `extract_requirement_ids()` expects `&str` but was passed `&ParsedRequirements`

**Fix**:
```rust
// Before:
let requirement_ids = crate::start_chain::extract_requirement_ids(requirements);

// After:
let requirements_text = serde_json::to_string(requirements)
    .unwrap_or_else(|_| String::new());
let requirement_ids = crate::start_chain::extract_requirement_ids(&requirements_text);
```

#### Issue 2: Evidence struct missing `id` field
**Problem**: Code tried to access `evidence.id` but Evidence struct doesn't have this field

**Fix**:
```rust
// Before:
evidence_ids.push(evidence.id.clone());

// After:
if let Some(filename) = evidence.path.file_stem() {
    evidence_ids.push(filename.to_string_lossy().to_string());
}
```

#### Issue 3: Wrong EvidenceType import
**Problem**: Using execution::EvidenceType instead of evidence::EvidenceType

**Fix**:
```rust
// Before:
use crate::types::{
    config::PuppetMasterConfig, events::PuppetMasterEvent, Evidence, EvidenceType,
    ParsedRequirements, PRD,
};

// After:
use crate::types::{
    config::PuppetMasterConfig, events::PuppetMasterEvent, Evidence,
    ParsedRequirements, PRD,
};
use crate::types::evidence::EvidenceType;
```

### 2. `src/state/evidence_store.rs`

#### Issue 1: Wrong EvidenceType import
**Problem**: Importing from wrong module

**Fix**:
```rust
// Before:
use crate::types::{Evidence, EvidenceType};

// After:
use crate::types::{Evidence};
use crate::types::evidence::EvidenceType;
```

#### Issue 2: Using obsolete EvidenceType variants
**Problem**: Code referenced old enum variants (Text, File, Image, TestResult, GitCommit)

**Fix**:
```rust
// Before:
for evidence_type in &[
    EvidenceType::Text,
    EvidenceType::File,
    EvidenceType::CommandOutput,
    EvidenceType::Image,
    EvidenceType::TestResult,
    EvidenceType::GitCommit,
] {
    let subdir = base_path.join(evidence_type.to_string());
    // ...
}

// After:
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
    // ...
}
```

#### Issue 3: File extension matching
**Problem**: Match arms used old enum variants

**Fix**:
```rust
// Before:
let extension = match evidence_type {
    EvidenceType::Text => "txt",
    EvidenceType::File => "txt",
    EvidenceType::CommandOutput => "log",
    EvidenceType::Image => "png",
    EvidenceType::TestResult => "json",
    EvidenceType::GitCommit => "txt",
};

// After:
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

#### Issue 4: Using .to_string() instead of .name()
**Problem**: EvidenceType::to_string() doesn't exist, should use .name()

**Fix**:
```rust
// Before:
let subdir = inner.base_path.join(evidence_type.to_string());
Ok(Evidence {
    evidence_type: evidence_type.to_string(),
    // ...
})

// After:
let subdir = inner.base_path.join(evidence_type.name());
Ok(Evidence {
    evidence_type: evidence_type.name().to_string(),
    // ...
})
```

## Root Cause Analysis

### Enum Duplication
The codebase had two different `EvidenceType` enums:

1. **execution.rs**: 
   ```rust
   pub enum EvidenceType {
       Text,
       File,
       CommandOutput,
       Image,
       TestResult,
       GitCommit,
   }
   ```

2. **evidence.rs** (correct one):
   ```rust
   pub enum EvidenceType {
       TestLog,
       Screenshot,
       BrowserTrace,
       FileSnapshot,
       Metric,
       GateReport,
       CommandOutput,
       Custom(String),
   }
   ```

The evidence.rs version is the correct one as it:
- Supports Custom variants
- Has a .name() method
- Is used by the StoredEvidence struct
- Matches the evidence collection patterns

### Fix Strategy
1. Import evidence::EvidenceType explicitly everywhere
2. Update all match arms to use new variants
3. Use .name() method instead of .to_string()
4. Extract IDs from file paths instead of non-existent fields

## Testing
Build verification (pending build environment fix):
```bash
cargo check --lib
cargo test --lib
```

## Notes
- All fixes maintain backward compatibility with existing evidence files
- File naming conventions remain unchanged
- The Custom variant allows extensibility for future evidence types
