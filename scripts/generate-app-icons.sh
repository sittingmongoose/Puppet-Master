#!/usr/bin/env bash
# Generate platform application icons from puppet-master-rs/icons/icon.png
#
# Produces:
#   - puppet-master-rs/icons/icon.ico  (Windows: multi-size 16,32,48,256)
#   - puppet-master-rs/icons/icon.icns (macOS: app bundle icon)
#
# Prerequisites:
#   - icon.png at puppet-master-rs/icons/icon.png (256x256 or 512x512 recommended)
#   - ICO: ImageMagick (magick) or convert
#   - ICNS on macOS: iconutil + sips (built-in) or ImageMagick
#   - ICNS on Linux/Windows: optional make-icns (npm i -g make-icns) or run on macOS/CI
#
# Run from repo root:  ./scripts/generate-app-icons.sh
# Or from scripts/:    ./generate-app-icons.sh  (uses dirname to find repo root)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ICONS_DIR="${REPO_ROOT}/puppet-master-rs/icons"
SRC_PNG="${ICONS_DIR}/icon.png"

if [ ! -f "$SRC_PNG" ]; then
    echo "Error: Source icon not found at ${SRC_PNG}" >&2
    echo "Add a 256x256 or 512x512 PNG (same design as tray icon) and re-run." >&2
    exit 1
fi

# --- ICO (Windows) ---
# ImageMagick: magick icon.png -define icon:auto-resize=256,48,32,16 icon.ico
if command -v magick >/dev/null 2>&1; then
    echo "Generating icon.ico (ImageMagick magick)..."
    magick "$SRC_PNG" -define icon:auto-resize=256,48,32,16 "${ICONS_DIR}/icon.ico"
    echo "  -> ${ICONS_DIR}/icon.ico"
elif command -v convert >/dev/null 2>&1; then
    echo "Generating icon.ico (ImageMagick convert)..."
    convert "$SRC_PNG" -define icon:auto-resize=256,48,32,16 "${ICONS_DIR}/icon.ico"
    echo "  -> ${ICONS_DIR}/icon.ico"
else
    echo "Warning: ImageMagick (magick or convert) not found. Skip icon.ico. Install ImageMagick or run on a host that has it." >&2
fi

# --- ICNS (macOS) ---
# iconutil requires a directory whose name ends with .iconset (e.g. icon.iconset)
build_icns_with_iconutil() {
    local tmpdir iconset
    tmpdir="$(mktemp -d)"
    trap "rm -rf ${tmpdir}" EXIT
    iconset="${tmpdir}/icon.iconset"
    mkdir -p "$iconset"
    # iconutil expects icon_<size>x<size>.png (1x) and icon_<size>x<size>@2x.png (2x = double pixels)
    # 1x: 16, 32, 128, 256, 512  ->  @2x: 32, 64, 256, 512, 1024
    for size in 16 32 128 256 512; do
        sips -z "$size" "$size" "$SRC_PNG" --out "${iconset}/icon_${size}x${size}.png" 2>/dev/null || true
    done
    for size in 16 32 128 256 512; do
        double=$(( size * 2 ))
        sips -z "$double" "$double" "$SRC_PNG" --out "${iconset}/icon_${size}x${size}@2x.png" 2>/dev/null || true
    done
    iconutil -c icns "$iconset" -o "${ICONS_DIR}/icon.icns"
}

if [ "$(uname -s)" = "Darwin" ]; then
    if command -v iconutil >/dev/null 2>&1 && command -v sips >/dev/null 2>&1; then
        echo "Generating icon.icns (macOS iconutil + sips)..."
        build_icns_with_iconutil
        echo "  -> ${ICONS_DIR}/icon.icns"
    else
        echo "Warning: iconutil/sips not found on macOS. Skip icon.icns." >&2
    fi
elif command -v mkicns >/dev/null 2>&1; then
    # make-icns (npm): mkicns <png> <output>
    echo "Generating icon.icns (make-icns)..."
    mkicns "$SRC_PNG" "${ICONS_DIR}/icon.icns" && echo "  -> ${ICONS_DIR}/icon.icns" || echo "Warning: mkicns failed." >&2
else
    echo "Warning: On non-macOS, install make-icns (npm i -g make-icns) to generate icon.icns, or run this script on macOS." >&2
fi

echo "Done. Use icon.ico for Windows builds and icon.icns for macOS build-dmg.sh."
