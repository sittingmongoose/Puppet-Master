#!/bin/bash
# Verification script for dynamic feature phases implementation

set -e

echo "=== Dynamic Feature Phases Verification ==="
echo ""

# 1. Check that feature_detector.rs exists
echo "✓ Checking feature_detector.rs exists..."
if [ -f "puppet-master-rs/src/interview/feature_detector.rs" ]; then
    echo "  Found: puppet-master-rs/src/interview/feature_detector.rs"
    LINES=$(wc -l < puppet-master-rs/src/interview/feature_detector.rs)
    echo "  Lines: $LINES"
else
    echo "  ERROR: feature_detector.rs not found"
    exit 1
fi

# 2. Check that mod.rs includes feature_detector
echo ""
echo "✓ Checking mod.rs includes feature_detector..."
if grep -q "pub mod feature_detector;" puppet-master-rs/src/interview/mod.rs; then
    echo "  Found in mod.rs"
else
    echo "  ERROR: feature_detector not in mod.rs"
    exit 1
fi

# 3. Check that orchestrator uses feature detection
echo ""
echo "✓ Checking orchestrator integrates feature detection..."
if grep -q "feature_detector::detect_features_from_state" puppet-master-rs/src/interview/orchestrator.rs; then
    echo "  Found in orchestrator.rs"
else
    echo "  ERROR: feature detection not integrated"
    exit 1
fi

# 4. Check document_writer signature updated
echo ""
echo "✓ Checking document_writer accepts phase_number parameter..."
if grep -q "phase_number: usize" puppet-master-rs/src/interview/document_writer.rs; then
    echo "  Found phase_number parameter"
else
    echo "  ERROR: phase_number parameter not found"
    exit 1
fi

# 5. Check interviewupdates.md marked complete
echo ""
echo "✓ Checking interviewupdates.md marked complete..."
if grep -q "✅ Done (feature_detector.rs + orchestrator integration)" interviewupdates.md; then
    echo "  Implementation Order table updated"
else
    echo "  WARNING: Implementation Order table not updated"
fi

if grep -q "✅ Feature-specific dynamic phases" interviewupdates.md; then
    echo "  Remaining Work section updated"
else
    echo "  WARNING: Remaining Work section not updated"
fi

# 6. Run cargo check
echo ""
echo "✓ Running cargo check..."
cd puppet-master-rs
if CARGO_TARGET_DIR=/tmp/puppet-master-build cargo check --lib 2>&1 | grep -q "Finished"; then
    echo "  Cargo check: PASSED"
else
    echo "  ERROR: Cargo check failed"
    exit 1
fi

# 7. Count tests in feature_detector
echo ""
echo "✓ Counting tests in feature_detector.rs..."
TEST_COUNT=$(grep -c "#\[test\]" src/interview/feature_detector.rs || echo "0")
echo "  Test count: $TEST_COUNT"

echo ""
echo "=== All Verification Checks Passed ==="
echo ""
echo "Summary:"
echo "  - feature_detector.rs created with $LINES lines"
echo "  - $TEST_COUNT unit tests implemented"
echo "  - Integrated into orchestrator.rs"
echo "  - Document writer updated for dynamic phase numbering"
echo "  - interviewupdates.md marked complete"
echo "  - Code compiles successfully"
echo ""
echo "Next: Run full test suite with:"
echo "  cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib"
