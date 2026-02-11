pub mod colors;
pub mod styles;

use iced::Color;

/// Application theme - Light or Dark mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum AppTheme {
    #[default]
    Light,
    Dark,
}

impl AppTheme {
    pub fn toggle(&self) -> Self {
        match self {
            AppTheme::Light => AppTheme::Dark,
            AppTheme::Dark => AppTheme::Light,
        }
    }

    pub fn paper(&self) -> Color {
        match self {
            AppTheme::Light => colors::PAPER_CREAM,
            AppTheme::Dark => colors::PAPER_DARK,
        }
    }

    pub fn ink(&self) -> Color {
        match self {
            AppTheme::Light => colors::INK_BLACK,
            AppTheme::Dark => colors::INK_LIGHT,
        }
    }

    pub fn ink_faded(&self) -> Color {
        match self {
            AppTheme::Light => colors::INK_FADED,
            AppTheme::Dark => colors::INK_FADED_DARK,
        }
    }

    pub fn shadow(&self) -> Color {
        match self {
            AppTheme::Light => colors::INK_BLACK,
            AppTheme::Dark => colors::INK_LIGHT,
        }
    }

    pub fn is_dark(&self) -> bool {
        matches!(self, AppTheme::Dark)
    }
}
