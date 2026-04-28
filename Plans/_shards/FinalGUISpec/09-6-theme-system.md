## 6. Theme System

### 6.1 Three Theme Families (Three User-Facing Choices)

| Theme Family | Variants | Retro Effects | Target Audience |
|-------|--------|--------------|----------------|
| **Retro Dark** | 1 | Full: pixel grid, paper texture, scanlines, hard shadows, sharp corners, Orbitron + Rajdhani | Users who love the current aesthetic |
| **Retro Light** | 1 | Full (reduced opacity): pixel grid, paper texture, hard shadows, sharp corners, Orbitron + Rajdhani | Light-mode users who want the aesthetic |
| **Basic Modern** | 2 internal palette variants | None: flat colors, subtle borders, rounded corners, system fonts | Accessibility, readability, reduced visual noise |

User-facing selector contract:
- The GUI MUST expose exactly three built-in theme choices: `Retro Dark`, `Retro Light`, and `Basic`.
- `Basic` may internally resolve to light or dark palette tokens based on explicit sub-setting or system scheme, but that internal palette choice does not create a fourth user-facing built-in theme promise.

### 6.2 Theme Token Table

| Token | Retro Dark | Retro Light | Basic Light | Basic Dark |
|-------|-----------|-------------|-------------|------------|
| **background** | #0a0a1a | #FAF6F1 | #FAFAFA | #121212 |
| **surface** | #1a1a2e | #f0ece5 | #FFFFFF | #1E1E1E |
| **surface-elevated** | #252540 | #e8e4dc | #FFFFFF | #2D2D2D |
| **text-primary** | #e8e0d0 | #1A1A1A | #1A1A1A | #E8E8E8 |
| **text-secondary** | #a0a0a0 | #666666 | #616161 | #A0A0A0 |
| **text-muted** | #666666 | #999999 | #9CA3AF | #6B7280 |
| **border** | #e8e0d0 (low opacity) | #1A1A1A | #E0E0E0 | #424242 |
| **border-light** | #333333 | #E5E7EB | #F0F0F0 | #333333 |
| **accent-blue** | #00d4ff | #0047AB | #1565C0 | #64B5F6 |
| **accent-magenta** | #ff2d9b | #FF1493 | #C41170 | #FF69B4 |
| **accent-lime** | #b4ff39 | #00FF41 | #0D7A3C | #3DD68C |
| **accent-orange** | #ff8c00 | #FF7F27 | #C45D00 | #FFA347 |
| **shadow-type** | Hard offset (2,2) | Hard offset (2,2) | None | None |
| **border-width** | 2px | 2px | 1px | 1px |
| **border-radius** | 0px | 0px | 4px | 4px |
| **display-font** | Orbitron Bold | Orbitron Bold | Inter / system-ui | Inter / system-ui |
| **body-font** | Rajdhani | Rajdhani | Inter / system-ui | Inter / system-ui |
| **mono-font** | System monospace | System monospace | System monospace | System monospace |
| **base-font-size** | 14px | 14px | 15px | 15px |
| **line-height** | 1.4 | 1.4 | 1.6 | 1.6 |
| **letter-spacing** | default | default | 0.02em | 0.02em |
| **pixel-grid-enabled** | true | true | false | false |
| **pixel-grid-opacity** | 0.09 | 0.045 | 0.0 | 0.0 |
| **paper-texture-enabled** | true | true | false | false |
| **scanline-enabled** | true | optional | false | false |
| **scanline-opacity** | 0.06 | 0.03 | 0.0 | 0.0 |
| **padding-scale** | 1.0 | 1.0 | 1.25 | 1.25 |
| **scrollbar-width** | 12px (styled) | 12px (styled) | 8px (system-like) | 8px (system-like) |

### 6.3 Retro Effects Implementation

**Pixel grid and paper texture:** Generated as tiled images from Rust at startup using `SharedPixelBuffer`. Applied via `Image` elements with appropriate tiling. Do NOT use `RenderingNotifier` -- use `SharedPixelBuffer` as it is backend-agnostic and simpler.

**Important:** `ImageFit.repeat` may not exist in Slint 1.15.1. If unavailable, tile the image manually using a `GridLayout` or `Flickable` with repeated `Image` elements, or generate a single large tile that covers the viewport.

**Conditional overlays:** Paper texture and pixel grid are optional overlay components at the root, bound to `Theme.retro-effects-enabled`. Implementations must not branch component logic on theme; only the presence/absence of these overlay nodes changes.

```slint
if Theme.retro-effects-enabled: PixelGridOverlay {
    opacity: Theme.pixel-grid-opacity;
}
if Theme.retro-effects-enabled && Theme.paper-texture-enabled: PaperTextureOverlay { }
```

### 6.4 Theme Switching

- **Live switch** for colors, spacing, borders, overlays: Slint's reactive property system propagates changes instantly
- **Restart required** for font family change: Switching between Retro (Orbitron/Rajdhani) and Basic (system fonts) requires app restart because Slint loads fonts at initialization
- **Within same family is live:** Switching between Retro Dark and Retro Light is instant (same fonts)
- **Basic palette note:** Switching Basic between its internal light/dark palette variants MAY be live when fonts do not change, but it remains one built-in theme family in the UI model.

### 6.5 Slint Implementation

```slint
export enum ThemeMode { retro-dark, retro-light, basic-light, basic-dark }

export global Theme {
    in property <ThemeMode> mode: retro-dark;
    in property <color> background: #0a0a1a;
    in property <color> surface: #1a1a2e;
    in property <color> surface-elevated: #252540;
    in property <color> text-primary: #e8e0d0;
    in property <color> text-secondary: #a0a0a0;
    in property <color> text-muted: #666666;
    in property <color> border: #e8e0d050;
    in property <color> border-light: #333333;
    in property <color> accent-blue: #00d4ff;
    in property <color> accent-magenta: #ff2d9b;
    in property <color> accent-lime: #b4ff39;
    in property <color> accent-orange: #ff8c00;
    in property <bool> retro-effects-enabled: true;
    in property <float> pixel-grid-opacity: 0.09;
    in property <float> scanline-opacity: 0.06;
    in property <bool> paper-texture-enabled: true;
    in property <length> border-width: 2px;
    in property <length> border-radius: 0px;
    in property <float> padding-scale: 1.0;
    in property <length> scrollbar-width: 12px;
    in property <float> line-height-scale: 1.4;
    in property <length> base-font-size: 14px;
}
```

A Rust-side `ThemeVariant` enum applies all tokens to the global at runtime:

```rust
pub enum ThemeVariant { RetroDark, RetroLight, BasicLight, BasicDark }

impl ThemeVariant {
    pub fn apply_to(&self, ui: &AppWindow) {
        match self {
            ThemeVariant::RetroDark => { /* set all dark retro tokens */ }
            ThemeVariant::RetroLight => { /* set all light retro tokens */ }
            ThemeVariant::BasicLight => { /* set all basic light tokens, disable effects */ }
            ThemeVariant::BasicDark => { /* set all basic dark tokens, disable effects */ }
        }
    }
}
```

### 6.6 Theme Extensibility Architecture (MVP)

The architecture supports unlimited user-created themes beyond the four built-in variants.

**Built-in themes (ship with app):**
- Retro Dark, Retro Light, Basic Light, Basic Dark (the four variants in §6.1-6.2)

**Custom theme file format:** Custom themes are defined as TOML files in `~/.puppet-master/themes/<name>.toml`. Each file specifies token overrides; any token not specified inherits from the base theme (Basic Dark or Basic Light, chosen by a `base` field).

```toml
[meta]
name = "Solarized Dark"
author = "User"
base = "basic-dark"          # inherit unset tokens from this variant
version = "1.0"

[colors]
background = "#002b36"
surface = "#073642"
surface-elevated = "#0a4050"
text-primary = "#839496"
text-secondary = "#657b83"
accent-blue = "#268bd2"
accent-magenta = "#d33682"
accent-lime = "#859900"
accent-orange = "#cb4b16"

[effects]
retro-effects-enabled = false
pixel-grid-opacity = 0.0
border-width = 1
border-radius = 4

[fonts]
# omitted = inherit from base
# display-font = "CustomFont"  # requires font file in ~/.puppet-master/fonts/
```

**Theme loading and validation:**
- On startup, scan `~/.puppet-master/themes/` for `.toml` files
- Parse and validate each file against the token schema (§6.2). Invalid files log a warning and are skipped (not loaded); user sees a toast on Settings open: "Theme '{name}' has errors -- see log for details"
- Valid custom themes appear in the theme selector (Settings > General and title bar toggle) alongside built-in themes
- **Hot reload:** Editing a theme TOML file while the app is running triggers a re-scan (via file watcher on the themes directory). If the currently active theme is modified, changes apply immediately (same as live theme switch within a family). If font changes are detected, prompt for restart.

**Theme selector UI:**
- Title bar theme toggle becomes a dropdown when >4 themes are available (built-in + custom)
- Each entry shows: theme name, color swatch preview (4 circles: background, surface, accent-blue, accent-lime), author (for custom), "[built-in]" or "[custom]" badge
- "Manage themes" link at bottom opens Settings > General > Themes section
- Settings > General includes: theme dropdown, "Open themes folder" button (opens `~/.puppet-master/themes/` in system file manager), "Create new theme" button (copies a template TOML to the themes folder and opens it in File Editor), "Import theme" button (file picker for .toml), "Export theme" button (saves current token values as .toml)

**Custom font support:** Custom themes can reference font files placed in `~/.puppet-master/fonts/`. Font files (.ttf, .otf, .woff2) are loaded at startup. A theme TOML referencing a missing font falls back to the base theme's font and shows a warning toast.

**Theme preview:** When hovering over a theme in the selector dropdown, show a live preview of the theme applied to a small widget card (button, text, border sample). On click, apply the theme. This allows users to preview without committing.

### 6.7 WCAG Compliance

- **Retro themes:** Prioritize aesthetic over strict WCAG AA compliance for accent colors (e.g., ACID_LIME on dark backgrounds may not meet 4.5:1)
- **Basic theme:** MUST meet WCAG 2.1 AA for all text and interactive elements (4.5:1 minimum contrast for normal text, 3:1 for large text). Basic accent colors are muted specifically to meet this requirement
ContractRef: ContractName:Plans/FinalGUISpec.md#13, ContractName:Plans/DRY_Rules.md#7

---

