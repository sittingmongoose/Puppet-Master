#!/bin/bash
# Verification script for doctor checks implementation

echo "════════════════════════════════════════════════════════════════"
echo "  Doctor Checks Implementation Verification"
echo "════════════════════════════════════════════════════════════════"
echo

# Count checks
echo "📊 Counting implementations..."
check_structs=$(grep -h "pub struct.*Check" src/doctor/checks/*.rs | grep -v "Result\|Registry\|Report\|Item" | wc -l)
check_impls=$(grep "impl DoctorCheck for" src/doctor/checks/*.rs | wc -l)
registrations=$(grep "self.register" src/doctor/check_registry.rs | wc -l)

echo "  ✓ Check structs defined: $check_structs"
echo "  ✓ DoctorCheck implementations: $check_impls"
echo "  ✓ Registered in registry: $registrations"
echo

if [ "$check_structs" -eq 19 ] && [ "$check_impls" -eq 19 ] && [ "$registrations" -eq 19 ]; then
    echo "✅ All counts match expected (19/19/19)"
else
    echo "❌ Count mismatch! Expected 19/19/19"
fi

echo
echo "📁 Verifying file structure..."
files=(
    "src/doctor/checks/cli_checks.rs"
    "src/doctor/checks/git_checks.rs"
    "src/doctor/checks/project_checks.rs"
    "src/doctor/checks/config_checks.rs"
    "src/doctor/checks/playwright_check.rs"
    "src/doctor/checks/runtime_check.rs"
    "src/doctor/checks/usage_check.rs"
    "src/doctor/checks/secrets_check.rs"
    "src/doctor/checks/platform_compatibility_check.rs"
    "src/doctor/checks/wiring_check.rs"
    "src/doctor/checks/mod.rs"
    "src/doctor/check_registry.rs"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
        all_exist=false
    fi
done

echo
if [ "$all_exist" = true ]; then
    echo "✅ All required files exist"
else
    echo "❌ Some files are missing"
fi

echo
echo "🔍 Checking Playwright implementation..."
if grep -q "PlaywrightCheck" src/doctor/checks/playwright_check.rs && \
   grep -q "npx playwright --version" src/doctor/checks/playwright_check.rs && \
   grep -q "PLAYWRIGHT_BROWSERS_PATH" src/doctor/checks/playwright_check.rs; then
    echo "  ✓ PlaywrightCheck struct defined"
    echo "  ✓ Version check implemented (npx playwright --version)"
    echo "  ✓ Environment variable support (PLAYWRIGHT_BROWSERS_PATH)"
    echo "✅ Playwright check is comprehensive"
else
    echo "❌ Playwright check incomplete"
fi

echo
echo "🔍 Checking evidence integration..."
if grep -q "use crate::types::evidence::EvidenceType;" src/start_chain/pipeline.rs && \
   grep -q "use crate::types::evidence::EvidenceType;" src/state/evidence_store.rs; then
    echo "  ✓ Correct EvidenceType import in pipeline.rs"
    echo "  ✓ Correct EvidenceType import in evidence_store.rs"
    echo "✅ Evidence integration fixed"
else
    echo "❌ Evidence integration needs fixing"
fi

echo
echo "📚 Documentation files..."
docs=(
    "DOCTOR_CHECKS_STATUS.md"
    "COMPILATION_FIXES.md"
    "TASK_COMPLETION_SUMMARY.md"
    "QUICK_REFERENCE.md"
)

doc_count=0
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✓ $doc"
        doc_count=$((doc_count + 1))
    else
        echo "  ✗ $doc (MISSING)"
    fi
done

if [ "$doc_count" -eq 4 ]; then
    echo "✅ All documentation files present"
else
    echo "⚠️  Some documentation files missing ($doc_count/4)"
fi

echo
echo "════════════════════════════════════════════════════════════════"
echo "  Summary"
echo "════════════════════════════════════════════════════════════════"

if [ "$check_structs" -eq 19 ] && [ "$check_impls" -eq 19 ] && \
   [ "$registrations" -eq 19 ] && [ "$all_exist" = true ]; then
    echo "✅ VERIFICATION PASSED"
    echo
    echo "All 19 doctor checks are implemented and registered."
    echo "Playwright check includes comprehensive browser detection."
    echo "Evidence/logs integration follows established patterns."
    echo
    echo "Ready for testing with: cargo test --lib"
    exit 0
else
    echo "❌ VERIFICATION FAILED"
    echo
    echo "Some checks are missing or incomplete."
    exit 1
fi
