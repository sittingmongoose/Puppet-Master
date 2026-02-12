#!/bin/bash
# Download real Orbitron fonts for the Puppet Master GUI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FONTS_DIR="$SCRIPT_DIR/assets/fonts"

echo "🔤 Downloading Orbitron fonts from Google Fonts..."
echo ""

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

cd "$TEMP_DIR"

echo "📦 Downloading Orbitron family..."
# Try multiple download methods

# Method 1: Direct download from GitHub (may not work due to API limits)
if curl -L -f -o orbitron.zip "https://github.com/google/fonts/archive/refs/heads/main.zip" 2>/dev/null; then
    echo "✅ Downloaded from GitHub"
    unzip -q orbitron.zip
    cp "fonts-main/ofl/orbitron/static/Orbitron-Bold.ttf" "$FONTS_DIR/" 2>/dev/null || true
    cp "fonts-main/ofl/orbitron/static/Orbitron-Regular.ttf" "$FONTS_DIR/" 2>/dev/null || true
fi

# Method 2: Direct file download (if Method 1 failed)
if [ ! -f "$FONTS_DIR/Orbitron-Bold.ttf" ] || [ $(stat -f%z "$FONTS_DIR/Orbitron-Bold.ttf" 2>/dev/null || stat -c%s "$FONTS_DIR/Orbitron-Bold.ttf" 2>/dev/null) -lt 1000 ]; then
    echo "📥 Trying direct download..."
    
    # Try direct GitHub raw URLs
    curl -L -f "https://github.com/google/fonts/raw/main/ofl/orbitron/static/Orbitron-Bold.ttf" \
         -o "$FONTS_DIR/Orbitron-Bold.ttf.download" 2>/dev/null || true
    
    curl -L -f "https://github.com/google/fonts/raw/main/ofl/orbitron/static/Orbitron-Regular.ttf" \
         -o "$FONTS_DIR/Orbitron-Regular.ttf.download" 2>/dev/null || true
    
    # Verify downloads are TTF files (not HTML)
    if [ -f "$FONTS_DIR/Orbitron-Bold.ttf.download" ]; then
        if file "$FONTS_DIR/Orbitron-Bold.ttf.download" | grep -q "TrueType"; then
            mv "$FONTS_DIR/Orbitron-Bold.ttf.download" "$FONTS_DIR/Orbitron-Bold.ttf"
            echo "✅ Orbitron-Bold.ttf downloaded"
        else
            rm "$FONTS_DIR/Orbitron-Bold.ttf.download"
        fi
    fi
    
    if [ -f "$FONTS_DIR/Orbitron-Regular.ttf.download" ]; then
        if file "$FONTS_DIR/Orbitron-Regular.ttf.download" | grep -q "TrueType"; then
            mv "$FONTS_DIR/Orbitron-Regular.ttf.download" "$FONTS_DIR/Orbitron-Regular.ttf"
            echo "✅ Orbitron-Regular.ttf downloaded"
        else
            rm "$FONTS_DIR/Orbitron-Regular.ttf.download"
        fi
    fi
fi

echo ""
echo "📊 Font Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for font in Orbitron-Bold.ttf Orbitron-Regular.ttf Rajdhani-Regular.ttf Rajdhani-Medium.ttf Rajdhani-Bold.ttf; do
    if [ -f "$FONTS_DIR/$font" ]; then
        size=$(ls -lh "$FONTS_DIR/$font" | awk '{print $5}')
        type=$(file "$FONTS_DIR/$font" | grep -o "TrueType Font data" || echo "Unknown")
        
        if [ "$type" = "TrueType Font data" ]; then
            if [ "$size" = "110" ] || [ "$size" = "110B" ]; then
                echo "⚠️  $font - $size (stub file)"
            else
                echo "✅ $font - $size (real font)"
            fi
        else
            echo "❌ $font - $size (invalid)"
        fi
    else
        echo "❌ $font - missing"
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if real Orbitron fonts are installed
if [ -f "$FONTS_DIR/Orbitron-Bold.ttf" ] && [ -f "$FONTS_DIR/Orbitron-Regular.ttf" ]; then
    bold_size=$(stat -f%z "$FONTS_DIR/Orbitron-Bold.ttf" 2>/dev/null || stat -c%s "$FONTS_DIR/Orbitron-Bold.ttf" 2>/dev/null)
    regular_size=$(stat -f%z "$FONTS_DIR/Orbitron-Regular.ttf" 2>/dev/null || stat -c%s "$FONTS_DIR/Orbitron-Regular.ttf" 2>/dev/null)
    
    if [ "$bold_size" -gt 1000 ] && [ "$regular_size" -gt 1000 ]; then
        echo "🎉 Success! All fonts are ready."
        echo ""
        echo "Next steps:"
        echo "  cd $SCRIPT_DIR"
        echo "  cargo build"
        exit 0
    fi
fi

echo "⚠️  Automatic download failed or incomplete."
echo ""
echo "Please download Orbitron fonts manually:"
echo ""
echo "1. Visit: https://fonts.google.com/specimen/Orbitron"
echo "2. Click 'Download family'"
echo "3. Extract the ZIP file"
echo "4. Copy these files to $FONTS_DIR/:"
echo "   - static/Orbitron-Bold.ttf"
echo "   - static/Orbitron-Regular.ttf"
echo ""
echo "Then rebuild: cd $SCRIPT_DIR && cargo build"
exit 1
