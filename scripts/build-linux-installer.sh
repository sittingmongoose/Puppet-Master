#!/bin/bash
# Build Linux installers for RWM Puppet Master
set -euo pipefail

VERSION="${1:-0.1.1}"
ARCH="amd64"
PKG_NAME="puppet-master"

cd "$(dirname "$0")/../puppet-master-rs"

# Build release binary (glibc — required for GTK/tray-icon support)
echo "Building release binary..."
cargo build --release

BINARY="target/release/puppet-master"

echo "Binary info:"
file "$BINARY"

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

# DEBIAN/control
cat > "$DEB_DIR/DEBIAN/control" << EOF
Package: puppet-master
Version: ${VERSION}
Section: devel
Priority: optional
Architecture: ${ARCH}
Depends: libgtk-3-0, libglib2.0-0, libcairo2, libpango-1.0-0
Maintainer: RWM <rwm@example.com>
Description: RWM Puppet Master - AI-assisted development orchestrator
 A GUI orchestrator implementing the Ralph Wiggum Method for
 AI-assisted development. Coordinates multiple AI CLI platforms
 (Cursor, Codex, Claude Code, Gemini, GitHub Copilot).
EOF

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

# Copy icon if exists
if [ -f "../puppet-master-rs/icons/icon.png" ]; then
    cp ../puppet-master-rs/icons/icon.png "$DEB_DIR/usr/share/icons/hicolor/256x256/apps/puppet-master.png"
fi

dpkg-deb --build "$DEB_DIR" "../installer/linux/puppet-master_${VERSION}_${ARCH}.deb"
echo "✅ Created puppet-master_${VERSION}_${ARCH}.deb"

# === RPM Package ===
echo "Building .rpm package..."
RPM_DIR="/tmp/puppet-master-rpm"
rm -rf "$RPM_DIR"
mkdir -p "$RPM_DIR"/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

# Use absolute path for RPM spec
ABS_BINARY="$(pwd)/$BINARY"
ABS_DESKTOP="$DEB_DIR/usr/share/applications/puppet-master.desktop"

cat > "$RPM_DIR/SPECS/puppet-master.spec" << EOF
Name: puppet-master
Version: ${VERSION}
Release: 1
Summary: RWM Puppet Master - AI-assisted development orchestrator
License: MIT
Group: Development/Tools
Requires: gtk3, glib2, cairo, pango

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
    echo "✅ Created RPM package" || \
    echo "⚠️ RPM build skipped (rpmbuild not available)"

echo "Done! Installers are in installer/linux/"
