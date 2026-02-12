pub mod colors;
pub mod styles;
pub mod fonts;
pub mod tokens;
pub mod palette;

use iced::Color;
use palette::Palette;

/// Application theme - Light or Dark mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum AppTheme {
    #[default]
    Light,
    Dark,
}

impl AppTheme {
    /// Get the semantic color palette for this theme
    pub fn palette(&self) -> Palette {
        match self {
            AppTheme::Light => Palette::light(),
            AppTheme::Dark => Palette::dark(),
        }
    }

    pub fn toggle(&self) -> Self {
        match self {
            AppTheme::Light => AppTheme::Dark,
            AppTheme::Dark => AppTheme::Light,
        }
    }

    // ── Legacy accessors (kept for backward compatibility) ──────────
    
    pub fn paper(&self) -> Color {
        self.palette().background
    }

    pub fn ink(&self) -> Color {
        self.palette().text_primary
    }

    pub fn ink_faded(&self) -> Color {
        self.palette().text_secondary
    }

    pub fn shadow(&self) -> Color {
        self.palette().shadow
    }

    pub fn surface(&self) -> Color {
        self.palette().surface
    }

    pub fn accent(&self) -> Color {
        self.palette().accent_blue
    }

    pub fn is_dark(&self) -> bool {
        matches!(self, AppTheme::Dark)
    }
}
