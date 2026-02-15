// DRY:DATA:fonts
//! Custom font loading and constants
//!
//! This module provides compile-time embedded fonts for the application:
//! - Orbitron: Geometric, sci-fi aesthetic for headings and display text
//! - Rajdhani: Clean, modern font for UI text
//!
//! Both fonts are licensed under the SIL Open Font License (OFL).

use iced::Font;

// ============================================================================
// Embedded Font Bytes (compile-time inclusion)
// ============================================================================

/// Orbitron Bold - Display font for headings (geometric, sci-fi aesthetic)
pub const ORBITRON_BOLD_BYTES: &[u8] = include_bytes!("../../assets/fonts/Orbitron-Bold.ttf");

/// Orbitron Regular - Display font for headings
pub const ORBITRON_REGULAR_BYTES: &[u8] = include_bytes!("../../assets/fonts/Orbitron-Regular.ttf");

/// Rajdhani Regular - UI text font (clean, modern, readable)
pub const RAJDHANI_REGULAR_BYTES: &[u8] = include_bytes!("../../assets/fonts/Rajdhani-Regular.ttf");

/// Rajdhani Medium - UI text font, medium weight
pub const RAJDHANI_MEDIUM_BYTES: &[u8] = include_bytes!("../../assets/fonts/Rajdhani-Medium.ttf");

/// Rajdhani Bold - UI text font, bold weight
pub const RAJDHANI_BOLD_BYTES: &[u8] = include_bytes!("../../assets/fonts/Rajdhani-Bold.ttf");

// ============================================================================
// Font Constants for Application Use
// ============================================================================

/// Display font (Orbitron) - Use for page titles and prominent headings
pub const FONT_DISPLAY: Font = Font::with_name("Orbitron");

/// Display font bold - Use for emphasized headings
pub const FONT_DISPLAY_BOLD: Font = Font {
    family: iced::font::Family::Name("Orbitron"),
    weight: iced::font::Weight::Bold,
    ..Font::DEFAULT
};

/// UI font (Rajdhani) - Use for all body text, labels, and general UI
pub const FONT_UI: Font = Font::with_name("Rajdhani");

/// Backward-compatible alias used by some view modules.
pub const FONT_BODY: Font = FONT_UI;

/// UI font medium weight - Use for slightly emphasized text
pub const FONT_UI_MEDIUM: Font = Font {
    family: iced::font::Family::Name("Rajdhani"),
    weight: iced::font::Weight::Medium,
    ..Font::DEFAULT
};

/// UI font bold - Use for strong emphasis in UI text
pub const FONT_UI_BOLD: Font = Font {
    family: iced::font::Family::Name("Rajdhani"),
    weight: iced::font::Weight::Bold,
    ..Font::DEFAULT
};

/// Monospace font - Use for code, logs, and technical output
pub const FONT_MONO: Font = Font::MONOSPACE;

// ============================================================================
// Font Loading
// ============================================================================

/// Load all custom fonts at application startup
///
/// Returns a vector of Tasks that load each font. These should be batched
/// together with other startup tasks in the application's `new()` function.
///
/// # Example
///
/// ```ignore
/// use iced::Task;
/// use crate::theme::fonts;
///
/// let font_tasks = fonts::load_fonts();
/// let all_tasks = Task::batch([
///     Task::batch(font_tasks),
///     // ... other startup tasks
/// ]);
/// ```
// DRY:HELPER:load_fonts
pub fn load_fonts() -> Vec<iced::Task<()>> {
    vec![
        // Load Orbitron fonts (display/headings)
        iced::font::load(ORBITRON_BOLD_BYTES).map(|_| ()),
        iced::font::load(ORBITRON_REGULAR_BYTES).map(|_| ()),
        // Load Rajdhani fonts (UI text)
        iced::font::load(RAJDHANI_REGULAR_BYTES).map(|_| ()),
        iced::font::load(RAJDHANI_MEDIUM_BYTES).map(|_| ()),
        iced::font::load(RAJDHANI_BOLD_BYTES).map(|_| ()),
    ]
}

// ============================================================================
// Font Utility Functions
// ============================================================================

/// Create a display font with optional bold weight
// DRY:HELPER:display_font
pub fn display_font(bold: bool) -> Font {
    if bold {
        FONT_DISPLAY_BOLD
    } else {
        FONT_DISPLAY
    }
}

/// Create a UI font with specified weight
// DRY:DATA:UIWeight
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UIWeight {
    Regular,
    Medium,
    Bold,
}

// DRY:HELPER:ui_font
pub fn ui_font(weight: UIWeight) -> Font {
    match weight {
        UIWeight::Regular => FONT_UI,
        UIWeight::Medium => FONT_UI_MEDIUM,
        UIWeight::Bold => FONT_UI_BOLD,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_font_bytes_embedded() {
        // Verify font bytes are non-empty
        assert!(
            !ORBITRON_BOLD_BYTES.is_empty(),
            "Orbitron Bold should be embedded"
        );
        assert!(
            !ORBITRON_REGULAR_BYTES.is_empty(),
            "Orbitron Regular should be embedded"
        );
        assert!(
            !RAJDHANI_REGULAR_BYTES.is_empty(),
            "Rajdhani Regular should be embedded"
        );
        assert!(
            !RAJDHANI_MEDIUM_BYTES.is_empty(),
            "Rajdhani Medium should be embedded"
        );
        assert!(
            !RAJDHANI_BOLD_BYTES.is_empty(),
            "Rajdhani Bold should be embedded"
        );
    }

    #[test]
    fn test_font_bytes_are_ttf() {
        // TTF files start with specific magic numbers
        // TrueType: 0x00 0x01 0x00 0x00 or "true" (0x74 0x72 0x75 0x65)
        // OpenType with TrueType: 0x00 0x01 0x00 0x00

        let is_ttf = |bytes: &[u8]| {
            bytes.len() >= 4
                && ((bytes[0] == 0x00 && bytes[1] == 0x01 && bytes[2] == 0x00 && bytes[3] == 0x00)
                    || (bytes[0] == 0x74
                        && bytes[1] == 0x72
                        && bytes[2] == 0x75
                        && bytes[3] == 0x65))
        };

        assert!(
            is_ttf(ORBITRON_BOLD_BYTES),
            "Orbitron Bold should be TTF format"
        );
        assert!(
            is_ttf(ORBITRON_REGULAR_BYTES),
            "Orbitron Regular should be TTF format"
        );
        assert!(
            is_ttf(RAJDHANI_REGULAR_BYTES),
            "Rajdhani Regular should be TTF format"
        );
        assert!(
            is_ttf(RAJDHANI_MEDIUM_BYTES),
            "Rajdhani Medium should be TTF format"
        );
        assert!(
            is_ttf(RAJDHANI_BOLD_BYTES),
            "Rajdhani Bold should be TTF format"
        );
    }

    #[test]
    fn test_font_utility_functions() {
        // Test display font utility
        assert_eq!(display_font(false), FONT_DISPLAY);
        assert_eq!(display_font(true), FONT_DISPLAY_BOLD);

        // Test UI font utility
        assert_eq!(ui_font(UIWeight::Regular), FONT_UI);
        assert_eq!(ui_font(UIWeight::Medium), FONT_UI_MEDIUM);
        assert_eq!(ui_font(UIWeight::Bold), FONT_UI_BOLD);
    }
}
