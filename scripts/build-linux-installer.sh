#!/bin/bash
# Build Linux installers for RWM Puppet Master
set -euo pipefail

BASE_VERSION="${1:-}"
ARCH="amd64"
# Avoid Debian/RPM namespace collisions with Puppet's "puppet-master" packages (common on dev machines).
PKG_NAME="rwm-puppet-master"

if [ -z "${BASE_VERSION}" ]; then
    BASE_VERSION="$(grep '^version = ' "$(dirname "$0")/../puppet-master-rs/Cargo.toml" | head -n1 | cut -d'\"' -f2)"
fi
if [ -z "${BASE_VERSION}" ]; then
    BASE_VERSION="0.1.1"
fi

BUILD_ID="${PM_BUILD_ID:-$(date -u +%Y%m%d%H%M%S)}"
BUILD_UTC="${PM_BUILD_UTC:-${BUILD_ID}}"
VERSION="${BASE_VERSION}+b${BUILD_ID}"
export PM_BUILD_ID="${BUILD_ID}"
export PM_BUILD_UTC="${BUILD_UTC}"

echo "=== Building RWM Puppet Master v${VERSION} for Linux ==="
echo "Build metadata: PM_BUILD_ID=${PM_BUILD_ID} PM_BUILD_UTC=${PM_BUILD_UTC}"

cd "$(dirname "$0")/../puppet-master-rs" || {
    echo "Error: Cannot find puppet-master-rs directory"
    exit 1
}

# Respect Cargo's configured target directory (from .cargo/config.toml or env override).
TARGET_DIR="${PM_TARGET_DIR:-}"
if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$(cargo metadata --no-deps --format-version 1 \
        | python3 -c 'import json,sys; print(json.load(sys.stdin)["target_directory"])')"
fi
echo "Using Cargo target directory: $TARGET_DIR"

# Build release binary (glibc - required for GTK/tray-icon support)
echo "Building release binary..."
cargo build --release || {
    echo "Error: Cargo build failed"
    exit 1
}

BINARY="${TARGET_DIR}/release/puppet-master"

if [ ! -f "$BINARY" ]; then
    echo "Error: Binary not found at $BINARY"
    exit 1
fi

echo "Binary info:"
file "$BINARY"
ldd "$BINARY" | head -10 || echo "Note: Binary may be statically linked"

# === DEB Package ===
echo "Building .deb package..."
DEB_DIR="/tmp/puppet-master-deb"
rm -rf "$DEB_DIR"
mkdir -p "$DEB_DIR/DEBIAN"
mkdir -p "$DEB_DIR/usr/bin"
mkdir -p "$DEB_DIR/usr/share/applications"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$DEB_DIR/usr/share/doc/puppet-master"

cp "$BINARY" "$DEB_DIR/usr/bin/puppet-master"
chmod 755 "$DEB_DIR/usr/bin/puppet-master"

# Verify binary is executable
if [ ! -x "$DEB_DIR/usr/bin/puppet-master" ]; then
    echo "Error: Binary is not executable"
    exit 1
fi

# Test binary can run
"$DEB_DIR/usr/bin/puppet-master" --version || {
    echo "Error: Binary cannot execute --version"
    exit 1
}

# DEBIAN/control
cat > "$DEB_DIR/DEBIAN/control" << EOF
Package: ${PKG_NAME}
Version: ${VERSION}
Section: devel
Priority: optional
Architecture: ${ARCH}
Maintainer: RWM <rwm@example.com>
Description: RWM Puppet Master - AI-assisted development orchestrator
 A GUI orchestrator implementing the Ralph Wiggum Method for
 AI-assisted development. Coordinates multiple AI CLI platforms
 (Cursor, Codex, Claude Code, Gemini, GitHub Copilot).
EOF

# Note: Removed preinst script - dpkg handles dependency checking automatically
# If deps are missing, dpkg will fail with a clear error message

# Desktop entry
cat > "$DEB_DIR/usr/share/applications/puppet-master.desktop" << EOF
[Desktop Entry]
Type=Application
Name=RWM Puppet Master
Comment=AI-assisted development orchestrator
Exec=puppet-master
Icon=puppet-master
Terminal=false
Categories=Development;IDE;
Keywords=ai;development;orchestrator;
EOF

# Copy icon if exists (resize to 256x256 when ImageMagick available and source is larger)
if [ -f "icons/icon.png" ]; then
    DEST_ICON="$DEB_DIR/usr/share/icons/hicolor/256x256/apps/puppet-master.png"
    if command -v magick >/dev/null 2>&1; then
        magick icons/icon.png -resize 256x256 "$DEST_ICON"
    elif command -v convert >/dev/null 2>&1; then
        convert icons/icon.png -resize 256x256 "$DEST_ICON"
    else
        cp icons/icon.png "$DEST_ICON"
    fi
else
    echo "Warning: icon.png not found at icons/icon.png"
fi

# Create postinstall script
cat > "$DEB_DIR/DEBIAN/postinst" << 'EOF'
#!/bin/bash
# Postinstall script for RWM Puppet Master
# This script must never fail, so all commands have || true

# Update desktop database (allows launcher to find the .desktop file)
if command -v update-desktop-database >/dev/null 2>&1; then
  (update-desktop-database /usr/share/applications 2>/dev/null) || true
fi

# Update icon cache (makes icon appear in launcher)
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  (gtk-update-icon-cache -f /usr/share/icons/hicolor 2>/dev/null) || true
fi

# Success message
cat << 'ENDMSG'

RWM Puppet Master installed successfully!

To launch:
  - From application menu: Search for "RWM Puppet Master"
  - From terminal: puppet-master

Data will be stored in: ~/.local/share/RWM Puppet Master

ENDMSG

exit 0
EOF

chmod 755 "$DEB_DIR/DEBIAN/postinst"

# Verify package structure
echo "Verifying package structure..."
if [ ! -f "$DEB_DIR/usr/bin/puppet-master" ]; then
    echo "Error: Binary not found in package"
    exit 1
fi

if [ ! -f "$DEB_DIR/usr/share/applications/puppet-master.desktop" ]; then
    echo "Error: Desktop file not found in package"
    exit 1
fi

if [ ! -f "$DEB_DIR/DEBIAN/control" ]; then
    echo "Error: Control file not found"
    exit 1
fi

# Build DEB package
echo "Building DEB package..."
mkdir -p "../installer/linux"
dpkg-deb --build "$DEB_DIR" "../installer/linux/puppet-master_${VERSION}_${ARCH}.deb" || {
    echo "Error: dpkg-deb build failed"
    exit 1
}

DEB_FILE="../installer/linux/puppet-master_${VERSION}_${ARCH}.deb"

# Verify the DEB package
echo "Verifying DEB package..."
if [ ! -f "$DEB_FILE" ]; then
    echo "Error: DEB file was not created"
    exit 1
fi

# CI/workflow compatibility: also emit a stable filename without build metadata.
COMPAT_DEB="../installer/linux/puppet-master_${BASE_VERSION}_${ARCH}.deb"
if [ "$DEB_FILE" != "$COMPAT_DEB" ]; then
    cp "$DEB_FILE" "$COMPAT_DEB"
fi

echo "=== Package Info ==="
dpkg-deb --info "$DEB_FILE"
echo ""

echo "=== Package Contents ==="
dpkg-deb --contents "$DEB_FILE"
echo ""

     echo "[OK] Created puppet-master_${VERSION}_${ARCH}.deb (package: ${PKG_NAME})"
echo "Package size: $(du -h "$DEB_FILE" | cut -f1)"
echo ""
echo "To install:"
echo "  sudo dpkg -i $(realpath "$DEB_FILE")"
echo "  sudo apt-get install -f  # if dependencies are missing"
echo ""
echo "To test and diagnose issues:"
echo "  ./scripts/test-linux-deb.sh $VERSION"

# === RPM Package ===
echo "Building .rpm package..."
RPM_DIR="/tmp/puppet-master-rpm"
rm -rf "$RPM_DIR"
mkdir -p "$RPM_DIR"/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

# Use absolute path for RPM spec
ABS_BINARY="$BINARY"
ABS_DESKTOP="$DEB_DIR/usr/share/applications/puppet-master.desktop"

cat > "$RPM_DIR/SPECS/puppet-master.spec" << EOF
Name: ${PKG_NAME}
Version: ${BASE_VERSION}
Release: 1.${BUILD_ID}
Summary: RWM Puppet Master - AI-assisted development orchestrator
License: MIT
Group: Development/Tools
# Binary uses Iced (pure Rust GUI) - no GTK/WebKit runtime deps needed
Requires:

%description
A GUI orchestrator implementing the Ralph Wiggum Method for
AI-assisted development.

%install
mkdir -p %{buildroot}/usr/bin
cp ${ABS_BINARY} %{buildroot}/usr/bin/puppet-master
chmod 755 %{buildroot}/usr/bin/puppet-master
mkdir -p %{buildroot}/usr/share/applications
cp ${ABS_DESKTOP} %{buildroot}/usr/share/applications/

%files
/usr/bin/puppet-master
/usr/share/applications/puppet-master.desktop
EOF

rpmbuild --define "_topdir $RPM_DIR" -bb "$RPM_DIR/SPECS/puppet-master.spec" 2>/dev/null && \
    cp "$RPM_DIR/RPMS/x86_64/"*.rpm "../installer/linux/" && \
    echo "[OK] Created RPM package" || \
    echo "[WARN] RPM build skipped (rpmbuild not available)"

echo "Done! Installers are in installer/linux/"
