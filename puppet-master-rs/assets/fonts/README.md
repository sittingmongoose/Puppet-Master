# Font Assets

This directory contains the custom fonts used in the Puppet Master GUI.

## Fonts

- **Orbitron**: Geometric, sci-fi aesthetic font for headings and display text
- **Rajdhani**: Clean, modern font for UI text

Both fonts are licensed under the SIL Open Font License (OFL).

## Installation

### Current Status

The Rajdhani fonts (Regular, Medium, Bold) are fully installed and working.

The Orbitron fonts currently contain minimal stub files. To use the real Orbitron fonts:

1. Download from Google Fonts:
   - Visit https://fonts.google.com/specimen/Orbitron
   - Click "Download family"
   - Extract the ZIP file
   - Copy `static/Orbitron-Regular.ttf` and `static/Orbitron-Bold.ttf` to this directory

2. Alternative: Download directly from the Google Fonts GitHub repository:
   ```bash
   cd puppet-master-rs/assets/fonts
   # Note: You may need to clone the repo or download manually from the browser
   # https://github.com/google/fonts/tree/main/ofl/orbitron/static
   ```

## Font Usage

The fonts are embedded at compile-time using `include_bytes!` in `src/theme/fonts.rs`:

- `FONT_DISPLAY` / `FONT_DISPLAY_BOLD` - Orbitron for headings
- `FONT_UI` / `FONT_UI_MEDIUM` / `FONT_UI_BOLD` - Rajdhani for body text
- `FONT_MONO` - System monospace font for code

## License

Both Orbitron and Rajdhani are licensed under the SIL Open Font License 1.1.
See https://scripts.sil.org/OFL for full license text.
