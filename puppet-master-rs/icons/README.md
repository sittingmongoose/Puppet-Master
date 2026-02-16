# RWM Puppet Master Icons

This directory contains the application logo used for the system tray and for installed app icons on Linux, Windows, and macOS.

## Source asset

- **`icon.png`** – Application logo (single source for tray + all platforms)
  - **Recommended:** 256×256 or 512×512 PNG with transparency
  - Used by: tray icon (scaled down by the OS), Linux .desktop, Windows .exe, macOS .app
  - Same design everywhere; keep it simple and recognizable at small and large sizes

## Generated assets (do not edit by hand)

Generate these from `icon.png` by running from the repo root:

```bash
./scripts/generate-app-icons.sh
```

- **`icon.ico`** – Windows: multi-size (16, 32, 48, 256) for .exe and taskbar  
  - Requires ImageMagick (`magick` or `convert`)
- **`icon.icns`** – macOS: app bundle icon for Finder and Dock  
  - On macOS: uses built-in `iconutil` + `sips`  
  - On Linux/Windows: optional `make-icns` (npm: `npm i -g make-icns`, then `mkicns icon.png icon.icns`) or run the script on macOS/CI

## Platform usage

| Platform | Asset        | Where it appears                          |
|----------|--------------|-------------------------------------------|
| All      | `icon.png`   | Tray (embedded in binary via `include_bytes!`) |
| Linux    | `icon.png`   | `.deb` / launcher (copied to hicolor/256x256/apps) |
| Windows  | `icon.ico`   | Embedded in .exe at build time (`build.rs` + winres) |
| macOS    | `icon.icns`  | `.app` bundle (Contents/Resources; see `installer/macos/build-dmg.sh`) |

## Fallback

If `icon.png` is missing, the tray module builds a simple generated fallback icon at runtime. Installers and Windows build expect the assets to exist (run `scripts/generate-app-icons.sh` before building installers or on Windows).

## Release checklist

Before building platform installers or a Windows .exe:

1. Ensure `icon.png` is 256×256 or 512×512 (same design as desired tray icon).
2. Run `./scripts/generate-app-icons.sh` so `icon.ico` and `icon.icns` are present.
3. Then run the usual installer scripts (e.g. `scripts/build-linux-installer.sh`, `installer/macos/build-dmg.sh`).
