# RWM Puppet Master Icons

This directory contains icon assets for the system tray.

## Required Icons

- `icon.png` - Main tray icon (32x32 or 64x64 PNG)
  - Recommended: 32x32 for standard DPI, provide 64x64 for high-DPI displays
  - Should be a simple, recognizable icon that works well at small sizes
  - Transparent background recommended
  - Format: PNG with alpha channel

## Platform Requirements

- **macOS**: PNG format required, typically 22x22 pt (44x44 px @2x)
- **Windows**: PNG or ICO format, 16x16 or 32x32 pixels
- **Linux**: PNG format, 22x22 or 24x24 pixels (depends on DE)

## Fallback

If `icon.png` is missing, the tray module will generate a simple fallback icon.

## Creating Icons

For best results across all platforms:
1. Design at 64x64 pixels
2. Export as PNG with transparency
3. Keep design simple and high-contrast
4. Test on all target platforms

## Example

A simple robot/puppet icon would work well for this application.
