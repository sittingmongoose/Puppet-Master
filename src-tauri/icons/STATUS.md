# Icon Setup Status

The icon files in this directory are currently using the base icon at different nominal sizes.
For optimal quality, these should be properly resized:

- ✅ icon.png (256x256) - Source icon
- ✅ icon.icns - macOS bundle (copied from installer/assets)
- ✅ icon.ico - Windows icon (copied from installer/assets)
- ⚠️ 32x32.png - Should be resized to 32×32 (currently 256×256)
- ⚠️ 128x128.png - Should be resized to 128×128 (currently 256×256)
- ⚠️ 128x128@2x.png - Should be resized to 256×256 (currently correct size)

## To Properly Resize Icons

### Using ImageMagick (recommended):
```bash
cd src-tauri/icons
convert icon.png -resize 32x32 32x32.png
convert icon.png -resize 128x128 128x128.png
# 128x128@2x.png is already correct (256×256)
```

### Using Python + Pillow:
```bash
pip install Pillow
python3 << 'EOF'
from PIL import Image
img = Image.open('icon.png')
img.resize((32, 32), Image.Resampling.LANCZOS).save('32x32.png')
img.resize((128, 128), Image.Resampling.LANCZOS).save('128x128.png')
EOF
```

### Online Tools:
- https://www.iloveimg.com/resize-image
- https://imageresizer.com/

**Note**: The current setup will work for Tauri builds, but properly sized icons
will look better, especially at smaller sizes in taskbars and notification areas.
