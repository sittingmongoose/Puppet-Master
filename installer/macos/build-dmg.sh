#!/bin/bash
# Build macOS DMG installer for RWM Puppet Master
set -euo pipefail

VERSION="${1:-0.1.1}"
APP_NAME="RWM Puppet Master"
BUNDLE_NAME="RWM Puppet Master.app"
DMG_NAME="RWM-Puppet-Master-${VERSION}.dmg"

# Build the release binary (universal binary for Intel + Apple Silicon)
cd ../../puppet-master-rs

# Build for both architectures
cargo build --release --target aarch64-apple-darwin
cargo build --release --target x86_64-apple-darwin

# Create universal binary
mkdir -p target/universal-release
lipo -create \
    target/aarch64-apple-darwin/release/puppet-master \
    target/x86_64-apple-darwin/release/puppet-master \
    -output target/universal-release/puppet-master

cd ../installer/macos

# Create .app bundle structure
BUNDLE_DIR="build/${BUNDLE_NAME}"
rm -rf build
mkdir -p "${BUNDLE_DIR}/Contents/MacOS"
mkdir -p "${BUNDLE_DIR}/Contents/Resources"

# Copy binary
cp ../../puppet-master-rs/target/universal-release/puppet-master "${BUNDLE_DIR}/Contents/MacOS/"

# Copy Info.plist
cp Info.plist "${BUNDLE_DIR}/Contents/"

# Copy icon
if [ -f "../../puppet-master-rs/icons/icon.icns" ]; then
    cp ../../puppet-master-rs/icons/icon.icns "${BUNDLE_DIR}/Contents/Resources/"
fi

# Create DMG
hdiutil create -volname "${APP_NAME}" -srcfolder build -ov -format UDZO "${DMG_NAME}"

echo "✅ Created ${DMG_NAME}"
