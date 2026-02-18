// DRY:DATA:tokens
//! Design tokens matching the Tauri CSS design system
//!
//! This module provides constants for spacing, borders, radii, typography,
//! shadows, and layout that maintain visual consistency across the application.

use iced::{Color, Shadow, Vector};

/// Spacing scale (in pixels)
///
/// Use these for consistent padding, margins, and gaps throughout the UI.
// DRY:DATA:spacing
pub mod spacing {
    pub const XXXS: f32 = 2.0;
    pub const XXS: f32 = 4.0;
    pub const XS: f32 = 4.0;
    pub const SM: f32 = 8.0;
    pub const MD: f32 = 16.0;
    pub const LG: f32 = 24.0;
    pub const XL: f32 = 32.0;
    pub const XXL: f32 = 48.0;
}

/// Border widths
///
/// The retro design emphasizes strong, visible borders.
// DRY:DATA:borders
pub mod borders {
    pub const THIN: f32 = 1.0;
    pub const MEDIUM: f32 = 2.0;
    pub const THICK: f32 = 3.0;
}

/// Border radii
///
/// The retro design typically uses 0 (sharp corners), but subtle rounding
/// is available for special cases.
// DRY:DATA:radii
pub mod radii {
    pub const NONE: f32 = 0.0;
    pub const SM: f32 = 2.0;
    pub const MD: f32 = 4.0;
    pub const LG: f32 = 8.0;
    pub const PILL: f32 = 999.0;
}

/// Font sizes
///
/// Typography scale for consistent text sizing.
// DRY:DATA:font_size
pub mod font_size {
    pub const XS: f32 = 11.0;
    pub const SM: f32 = 13.0;
    pub const BASE: f32 = 15.0;
    pub const MD: f32 = 16.0;
    pub const LG: f32 = 20.0;
    pub const XL: f32 = 24.0;
    pub const XXL: f32 = 32.0;
    pub const DISPLAY: f32 = 40.0;
}

/// Shadow definitions
///
/// The retro design uses hard, offset shadows (no blur) for a bold, flat look.
// DRY:DATA:shadows
pub mod shadows {
    use super::*;

    /// Panel shadow - used for major UI panels and cards
    // DRY:HELPER:panel_shadow
    pub fn panel_shadow(ink: Color) -> Shadow {
        Shadow {
            color: ink,
            offset: Vector::new(4.0, 4.0),
            blur_radius: 0.0,
        }
    }

    /// Button shadow - standard button depth
    // DRY:HELPER:button_shadow
    pub fn button_shadow(ink: Color) -> Shadow {
        Shadow {
            color: ink,
            offset: Vector::new(3.0, 3.0),
            blur_radius: 0.0,
        }
    }

    /// Button shadow when pressed - reduced depth for pressed state
    // DRY:HELPER:button_shadow_pressed
    pub fn button_shadow_pressed(ink: Color) -> Shadow {
        Shadow {
            color: ink,
            offset: Vector::new(1.0, 1.0),
            blur_radius: 0.0,
        }
    }

    /// No shadow
    // DRY:HELPER:none
    pub fn none() -> Shadow {
        Shadow {
            color: Color::TRANSPARENT,
            offset: Vector::ZERO,
            blur_radius: 0.0,
        }
    }
}

/// Layout constants
///
/// Standard dimensions for major UI components.
// DRY:DATA:layout
pub mod layout {
    /// Height of the main header bar
    pub const HEADER_HEIGHT: f32 = 72.0;

    /// Gap between logo and nav buttons in the header (keeps nav clearly right of logo)
    pub const HEADER_LOGO_NAV_GAP: f32 = 80.0;

    /// Padding above the header bar (gap between window top and header box)
    pub const HEADER_TOP_PADDING: f32 = 8.0;

    /// Width of the sidebar navigation
    pub const SIDEBAR_WIDTH: f32 = 220.0;

    /// Maximum content width for centered layouts
    pub const MAX_CONTENT_WIDTH: f32 = 1200.0;

    /// Fixed width for form row labels (e.g. config forms)
    pub const FORM_LABEL_WIDTH: f32 = 150.0;

    /// Wider label width for Advanced tab rows with long labels (Experimental, Sub-Agent)
    pub const FORM_LABEL_WIDTH_WIDE: f32 = 280.0;

    /// Fixed width for label-value pair labels (e.g. details/read-only rows)
    pub const DETAIL_LABEL_WIDTH: f32 = 120.0;

    /// Width of toast notifications
    pub const TOAST_WIDTH: f32 = 380.0;

    /// Width below which header nav and wizard steps use horizontal scroll / narrow layout
    pub const NAV_COLLAPSE_BELOW_WIDTH: f32 = 800.0;

    /// Modal dialog sizes
    pub const MODAL_SM: f32 = 400.0;
    pub const MODAL_MD: f32 = 600.0;
    pub const MODAL_LG: f32 = 800.0;

    /// Common button heights
    pub const BUTTON_HEIGHT_SM: f32 = 32.0;
    pub const BUTTON_HEIGHT_MD: f32 = 40.0;
    pub const BUTTON_HEIGHT_LG: f32 = 48.0;

    /// Input field heights
    pub const INPUT_HEIGHT_SM: f32 = 32.0;
    pub const INPUT_HEIGHT_MD: f32 = 40.0;
    pub const INPUT_HEIGHT_LG: f32 = 48.0;
}
