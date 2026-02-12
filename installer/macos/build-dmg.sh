#!/bin/bash
# Build macOS DMG installer for RWM Puppet Master
#
# NOTE: This script creates an UNSIGNED DMG that will be blocked by Gatekeeper.
# Users must bypass with: xattr -cr "RWM Puppet Master.app"
# For production, add code signing:
#   codesign --deep --force --sign "Developer ID Application: Your Name" "${BUNDLE_DIR}"
#   xcrun notarytool submit "${DMG_NAME}" --wait --apple-id "you@example.com" --team-id "TEAMID"
#
set -euo pipefail

VERSION="${1:-0.1.1}"
APP_NAME="RWM Puppet Master"
BUNDLE_NAME="RWM Puppet Master.app"
DMG_NAME="RWM-Puppet-Master-${VERSION}.dmg"
UNIVERSAL="${PM_MAC_UNIVERSAL:-1}"

# Build the release binary (universal or arm64-only)
cd ../../puppet-master-rs

if [ "${UNIVERSAL}" = "1" ]; then
    # Build for both architectures (universal)
    cargo build --release --target aarch64-apple-darwin
    cargo build --release --target x86_64-apple-darwin

    # Create universal binary
    mkdir -p target/universal-release
    lipo -create \
        target/aarch64-apple-darwin/release/puppet-master \
        target/x86_64-apple-darwin/release/puppet-master \
        -output target/universal-release/puppet-master

    BIN_PATH="target/universal-release/puppet-master"
else
    # Arm64-only build (CI default on macos-14)
    cargo build --release --target aarch64-apple-darwin
    BIN_PATH="target/aarch64-apple-darwin/release/puppet-master"
fi

cd ../installer/macos

# Create .app bundle structure
BUNDLE_DIR="build/${BUNDLE_NAME}"
rm -rf build
mkdir -p "${BUNDLE_DIR}/Contents/MacOS"
mkdir -p "${BUNDLE_DIR}/Contents/Resources"

# Copy binary
cp "../../puppet-master-rs/${BIN_PATH}" "${BUNDLE_DIR}/Contents/MacOS/"

# Copy Info.plist
cp Info.plist "${BUNDLE_DIR}/Contents/"

# Copy icon
if [ -f "../../puppet-master-rs/icons/icon.icns" ]; then
    cp ../../puppet-master-rs/icons/icon.icns "${BUNDLE_DIR}/Contents/Resources/"
fi

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

echo "✅ Created ${DMG_NAME}"
echo "Note: Ad-hoc signed. Users will see 'unidentified developer' dialog."
echo "For full Gatekeeper approval, need Apple Developer account + notarization."
