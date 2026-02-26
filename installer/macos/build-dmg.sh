#!/bin/bash
# Build macOS DMG installer for Puppet Master
#
# NOTE: This script creates an UNSIGNED DMG that will be blocked by Gatekeeper.
# Users must bypass with: xattr -cr "Puppet Master.app"
# For production, add code signing:
#   codesign --deep --force --sign "Developer ID Application: Your Name" "${BUNDLE_DIR}"
#   xcrun notarytool submit "${DMG_NAME}" --wait --apple-id "you@example.com" --team-id "TEAMID"
#
set -euo pipefail

BASE_VERSION="${1:-0.1.1}"
BUILD_ID="${PM_BUILD_ID:-$(date -u +%Y%m%d%H%M%S)}"
BUILD_UTC="${PM_BUILD_UTC:-${BUILD_ID}}"
VERSION="${BASE_VERSION}+b${BUILD_ID}"
APP_NAME="Puppet Master"
BUNDLE_NAME="Puppet Master.app"
DMG_NAME="Puppet-Master-${VERSION}.dmg"
UNIVERSAL="${PM_MAC_UNIVERSAL:-1}"

# Build the release binary (universal or arm64-only)
cd ../../puppet-master-rs
export PM_BUILD_ID="${BUILD_ID}"
export PM_BUILD_UTC="${BUILD_UTC}"

TARGET_DIR="${PM_TARGET_DIR:-}"
if [ -z "${TARGET_DIR}" ]; then
    TARGET_DIR="$(cargo metadata --no-deps --format-version 1 \
        | python3 -c 'import json,sys; print(json.load(sys.stdin)["target_directory"])')"
fi
echo "Using Cargo target directory: ${TARGET_DIR}"

if [ "${UNIVERSAL}" = "1" ]; then
    # Build for both architectures (universal)
    cargo build --release --target aarch64-apple-darwin
    cargo build --release --target x86_64-apple-darwin

    # Create universal binary
    mkdir -p "${TARGET_DIR}/universal-release"
    lipo -create \
        "${TARGET_DIR}/aarch64-apple-darwin/release/puppet-master" \
        "${TARGET_DIR}/x86_64-apple-darwin/release/puppet-master" \
        -output "${TARGET_DIR}/universal-release/puppet-master"

    BIN_PATH="${TARGET_DIR}/universal-release/puppet-master"
else
    # Arm64-only build (CI default on macos-14)
    cargo build --release --target aarch64-apple-darwin
    BIN_PATH="${TARGET_DIR}/aarch64-apple-darwin/release/puppet-master"
fi

cd ../installer/macos

# Create .app bundle structure
BUNDLE_DIR="build/${BUNDLE_NAME}"
rm -rf build
mkdir -p "${BUNDLE_DIR}/Contents/MacOS"
mkdir -p "${BUNDLE_DIR}/Contents/Resources"

# Copy binary
cp "${BIN_PATH}" "${BUNDLE_DIR}/Contents/MacOS/puppet-master"

# Copy Info.plist
cp Info.plist "${BUNDLE_DIR}/Contents/"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${BASE_VERSION}" "${BUNDLE_DIR}/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${BUILD_ID}" "${BUNDLE_DIR}/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Delete :PMBuildID" "${BUNDLE_DIR}/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Delete :PMBuildUTC" "${BUNDLE_DIR}/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :PMBuildID string ${BUILD_ID}" "${BUNDLE_DIR}/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Add :PMBuildUTC string ${BUILD_UTC}" "${BUNDLE_DIR}/Contents/Info.plist"

# Copy icon (required; fail if missing so app is never shipped without icon)
ICON_ICNS="../../puppet-master-rs/icons/icon.icns"
if [ ! -f "$ICON_ICNS" ]; then
    echo "Error: icon.icns not found at ${ICON_ICNS}" >&2
    echo "Run ./scripts/generate-app-icons.sh from repo root (with icon.png in puppet-master-rs/icons/), then rebuild." >&2
    exit 1
fi
cp "$ICON_ICNS" "${BUNDLE_DIR}/Contents/Resources/"

# Ad-hoc code signing (removes "damaged" error, changes to security dialog)
# This doesn't bypass Gatekeeper fully but makes it user-friendly
echo "Signing app bundle..."
codesign --force --deep --sign - "${BUNDLE_DIR}"

# Verify signing
codesign --verify --verbose "${BUNDLE_DIR}" || {
    echo "Warning: Code signing verification failed"
}

# Create DMG staging with Applications symlink for drag-to-install
echo "Creating DMG staging area..."
DMG_STAGING="build/dmg-staging"
rm -rf "${DMG_STAGING}"
mkdir -p "${DMG_STAGING}"

# Copy app bundle to staging
cp -R "${BUNDLE_DIR}" "${DMG_STAGING}/"

# Create Applications symlink (enables drag-to-install UX)
ln -s /Applications "${DMG_STAGING}/Applications"

# Create DMG from staging area
echo "Creating DMG..."
hdiutil create -volname "${APP_NAME}" -srcfolder "${DMG_STAGING}" -ov -format UDZO "${DMG_NAME}"

# Sign the DMG itself
echo "Signing DMG..."
codesign --force --sign - "${DMG_NAME}"

# CI/workflow compatibility: also emit a stable filename without build metadata.
COMPAT_DMG="Puppet-Master-${BASE_VERSION}.dmg"
if [ "${DMG_NAME}" != "${COMPAT_DMG}" ]; then
    cp "${DMG_NAME}" "${COMPAT_DMG}"
fi

echo "✅ Created ${DMG_NAME}"
echo "Note: Ad-hoc signed. Users will see 'unidentified developer' dialog."
echo "For full Gatekeeper approval, need Apple Developer account + notarization."
