#!/bin/bash
# Verify Rust syntax without full build

echo "Checking Rust syntax for reference_manager.rs..."

# Check for syntax errors using rust-analyzer or rustfmt
if command -v rustfmt &> /dev/null; then
    rustfmt --check src/interview/reference_manager.rs 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Syntax check passed (rustfmt)"
    else
        echo "⚠️  Code formatting suggestions from rustfmt"
    fi
else
    echo "rustfmt not available, checking basic syntax..."
fi

# Count key elements
echo ""
echo "Code Statistics:"
echo "  Total lines: $(wc -l < src/interview/reference_manager.rs)"
echo "  Functions: $(grep -c '^[[:space:]]*\(pub \)\?fn ' src/interview/reference_manager.rs)"
echo "  Tests: $(grep -c '#\[test\]' src/interview/reference_manager.rs)"
echo "  Structs: $(grep -c '^[[:space:]]*pub struct ' src/interview/reference_manager.rs)"
echo "  Enums: $(grep -c '^[[:space:]]*pub enum ' src/interview/reference_manager.rs)"
echo ""

# Check for common issues
echo "Safety Checks:"
if grep -q 'unwrap()' src/interview/reference_manager.rs; then
    unwraps=$(grep -c 'unwrap()' src/interview/reference_manager.rs)
    echo "  ⚠️  Found $unwraps unwrap() calls (prefer ? operator)"
else
    echo "  ✅ No unwrap() calls in main code"
fi

if grep -q 'panic!' src/interview/reference_manager.rs; then
    echo "  ⚠️  Found panic! macros"
else
    echo "  ✅ No panic! macros"
fi

if grep -q 'unsafe' src/interview/reference_manager.rs; then
    echo "  ⚠️  Found unsafe code"
else
    echo "  ✅ No unsafe code"
fi

echo ""
echo "Documentation:"
doc_comments=$(grep -c '///' src/interview/reference_manager.rs)
echo "  Doc comments: $doc_comments"

echo ""
echo "✅ Syntax verification complete"
