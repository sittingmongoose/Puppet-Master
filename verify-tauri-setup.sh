#!/bin/bash
# Tauri Integration Verification Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verifying Tauri Integration Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS=0
FAIL=0

check() {
  if [ $2 -eq 0 ]; then
    echo "✅ $1"
    ((PASS++))
  else
    echo "❌ $1"
    ((FAIL++))
  fi
}

# Check Tauri configuration files
[ -f "src-tauri/Cargo.toml" ]; check "Tauri Cargo.toml exists" $?
[ -f "src-tauri/tauri.conf.json" ]; check "Tauri config exists" $?
[ -f "src-tauri/build.rs" ]; check "Tauri build script exists" $?
[ -f "src-tauri/src/main.rs" ]; check "Tauri main.rs exists" $?
[ -f "src-tauri/.gitignore" ]; check "Tauri .gitignore exists" $?

# Check icons
[ -f "src-tauri/icons/icon.png" ]; check "Base icon exists" $?
[ -f "src-tauri/icons/icon.icns" ]; check "macOS icon exists" $?
[ -f "src-tauri/icons/icon.ico" ]; check "Windows icon exists" $?
[ -f "src-tauri/icons/32x32.png" ]; check "32x32 icon exists" $?
[ -f "src-tauri/icons/128x128.png" ]; check "128x128 icon exists" $?
[ -f "src-tauri/icons/128x128@2x.png" ]; check "128x128@2x icon exists" $?

# Check documentation
[ -f "docs/TAURI_INTEGRATION.md" ]; check "Integration guide exists" $?
[ -f "docs/TAURI_IMPLEMENTATION_STATUS.md" ]; check "Status doc exists" $?
[ -f "TAURI_SETUP.md" ]; check "Setup guide exists" $?
[ -f "TAURI_CHANGES_SUMMARY.md" ]; check "Changes summary exists" $?
[ -f "TAURI_EXECUTIVE_SUMMARY.md" ]; check "Executive summary exists" $?
[ -f "CHANGES_OVERVIEW.md" ]; check "Overview exists" $?
[ -f "TAURI_IMPLEMENTATION_CHECKLIST.md" ]; check "Checklist exists" $?

# Check build script modifications
grep -q "with-tauri" scripts/build-installer.ts; check "Build script has --with-tauri flag" $?
grep -q "detectTauriAvailable" scripts/build-installer.ts; check "Build script has Tauri detection" $?
grep -q "buildTauriApp" scripts/build-installer.ts; check "Build script has Tauri build function" $?
grep -q "stageTauriApp" scripts/build-installer.ts; check "Build script has Tauri staging function" $?

# Check package.json modifications
grep -q '"tauri:dev"' package.json; check "package.json has tauri:dev script" $?
grep -q '"tauri:build"' package.json; check "package.json has tauri:build script" $?
grep -q '"build:win:tauri"' package.json; check "package.json has build:win:tauri script" $?
grep -q '"build:mac:tauri"' package.json; check "package.json has build:mac:tauri script" $?
grep -q '"build:linux:tauri"' package.json; check "package.json has build:linux:tauri script" $?

# Check TypeScript compilation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Testing TypeScript Compilation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build > /dev/null 2>&1
check "TypeScript compiles successfully" $?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All checks passed! Tauri infrastructure is ready."
  echo ""
  echo "Next steps:"
  echo "  1. Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  echo "  2. Test dev mode: npm run gui:build && npm run tauri:dev"
  echo "  3. Read docs: TAURI_EXECUTIVE_SUMMARY.md"
  echo "  4. Follow checklist: TAURI_IMPLEMENTATION_CHECKLIST.md"
  exit 0
else
  echo "⚠️  Some checks failed. Please review the output above."
  exit 1
fi
