# Tauri Icons

This directory should contain icon assets for the Tauri desktop app.

## Required Icons

### PNG Icons (for Linux, Windows)
- `32x32.png` - Small icon (32×32 pixels)
- `128x128.png` - Medium icon (128×128 pixels)
- `128x128@2x.png` - High-DPI medium icon (256×256 pixels)
- `icon.png` - Full-size icon (512×512 pixels recommended)

### macOS Icon
- `icon.icns` - macOS app icon bundle (contains multiple sizes)

### Windows Icon
- `icon.ico` - Windows icon file (contains multiple sizes)

## Creating Icons

### From PNG Source

If you have a high-resolution PNG (512×512 or larger), you can generate all required icons:

#### On macOS:
```bash
# Create ICNS (requires iconutil, built into macOS)
mkdir puppet-master.iconset
sips -z 16 16     icon-512.png --out puppet-master.iconset/icon_16x16.png
sips -z 32 32     icon-512.png --out puppet-master.iconset/icon_16x16@2x.png
sips -z 32 32     icon-512.png --out puppet-master.iconset/icon_32x32.png
sips -z 64 64     icon-512.png --out puppet-master.iconset/icon_32x32@2x.png
sips -z 128 128   icon-512.png --out puppet-master.iconset/icon_128x128.png
sips -z 256 256   icon-512.png --out puppet-master.iconset/icon_128x128@2x.png
sips -z 256 256   icon-512.png --out puppet-master.iconset/icon_256x256.png
sips -z 512 512   icon-512.png --out puppet-master.iconset/icon_256x256@2x.png
sips -z 512 512   icon-512.png --out puppet-master.iconset/icon_512x512.png
iconutil -c icns puppet-master.iconset -o icon.icns
```

#### Using ImageMagick (cross-platform):
```bash
# Install ImageMagick
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick
# Windows: choco install imagemagick

# Create PNG variants
convert icon-512.png -resize 32x32 32x32.png
convert icon-512.png -resize 128x128 128x128.png
convert icon-512.png -resize 256x256 128x128@2x.png
convert icon-512.png -resize 512x512 icon.png

# Create ICO (Windows)
convert icon-512.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

#### Using Online Tools:
- **ICNS**: https://iconverticons.com/online/
- **ICO**: https://www.icoconverter.com/
- **Multi-format**: https://cloudconvert.com/

### Using Existing Assets

The installer already has these assets you can reuse:
- `installer/assets/puppet-master.png` - Main PNG icon
- `installer/assets/puppet-master.icns` - macOS ICNS
- `installer/assets/puppet-master.ico` - Windows ICO

Copy them to this directory:
```bash
# From repository root:
cp installer/assets/puppet-master.png src-tauri/icons/icon.png
cp installer/assets/puppet-master.icns src-tauri/icons/icon.icns
cp installer/assets/puppet-master.ico src-tauri/icons/icon.ico

# Generate additional PNG sizes:
convert src-tauri/icons/icon.png -resize 32x32 src-tauri/icons/32x32.png
convert src-tauri/icons/icon.png -resize 128x128 src-tauri/icons/128x128.png
convert src-tauri/icons/icon.png -resize 256x256 src-tauri/icons/128x128@2x.png
```

## Verifying Icons

Check that all required icons exist:
```bash
ls -lh src-tauri/icons/
# Should show: 32x32.png, 128x128.png, 128x128@2x.png, icon.icns, icon.ico, icon.png
```

## Icon Design Guidelines

- **Simple & Recognizable**: Icon should be clear even at 16×16
- **High Contrast**: Works on both light and dark backgrounds
- **No Text**: Text becomes illegible at small sizes
- **Square Aspect**: Design within a square canvas
- **Safe Area**: Keep important elements in center 80%
- **Transparency**: Use PNG with alpha channel
- **Colors**: Consistent with brand/app theme

## Troubleshooting

### "Icon file not found" during Tauri build
- Ensure all icon files exist in `src-tauri/icons/`
- Check file names match exactly (case-sensitive)
- Verify file permissions (readable)

### Icons look blurry
- Use higher resolution source (512×512 minimum)
- Ensure @2x variants are exactly 2× the base size
- Save PNGs with proper DPI metadata

### macOS icon doesn't show
- ICNS must contain all required sizes (16-512)
- Use `iconutil` on macOS for proper format
- Check file extension is `.icns` not `.icon`

## Resources

- [Tauri Icon Guide](https://tauri.app/v1/guides/features/icons)
- [macOS Icon Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows Icon Design](https://docs.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design)
- [Linux Icon Theme Spec](https://specifications.freedesktop.org/icon-theme-spec/icon-theme-spec-latest.html)
