// DRY:DATA:theme
pub mod colors;
pub mod fonts;
pub mod palette;
pub mod styles;
pub mod tokens;

use iced::Color;
use palette::Palette;

/// Application theme - Light or Dark mode
// DRY:DATA:AppTheme
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum AppTheme {
    #[default]
    Light,
    Dark,
}

impl AppTheme {
    /// Get the semantic color palette for this theme
    // DRY:FN:palette
    pub fn palette(&self) -> Palette {
        match self {
            AppTheme::Light => Palette::light(),
            AppTheme::Dark => Palette::dark(),
        }
    }

    // DRY:FN:toggle
    pub fn toggle(&self) -> Self {
        match self {
            AppTheme::Light => AppTheme::Dark,
            AppTheme::Dark => AppTheme::Light,
        }
    }

    // ── Legacy accessors (kept for backward compatibility) ──────────

    // DRY:FN:paper
    pub fn paper(&self) -> Color {
        self.palette().background
    }

    // DRY:FN:ink
    pub fn ink(&self) -> Color {
        self.palette().text_primary
    }

    // DRY:FN:ink_faded
    pub fn ink_faded(&self) -> Color {
        self.palette().text_secondary
    }

    // DRY:FN:shadow
    pub fn shadow(&self) -> Color {
        self.palette().shadow
    }

    // DRY:FN:surface
    pub fn surface(&self) -> Color {
        self.palette().surface
    }

    // DRY:FN:accent
    pub fn accent(&self) -> Color {
        self.palette().accent_blue
    }

    // DRY:FN:success
    pub fn success(&self) -> Color {
        self.palette().success
    }

    // DRY:FN:paper_light
    pub fn paper_light(&self) -> Color {
        self.palette().surface_elevated
    }

    // DRY:FN:is_dark
    pub fn is_dark(&self) -> bool {
        matches!(self, AppTheme::Dark)
    }
}
