//! Custom Iced widgets for RWM Puppet Master
//!
//! This module provides themed, reusable UI components following the
//! "Vibrant Technical / Retro-Futuristic Paper Texture" design language.

pub mod panel;
pub mod status_badge;
pub mod progress_bar;
pub mod budget_donut;
pub mod usage_chart;
pub mod modal;
pub mod toast;
pub mod header;
pub mod icons;  // OLD: Unicode symbol icons (to be deprecated)
pub mod icon;   // NEW: SVG icon system
pub mod help_text;
pub mod paper_texture;  // NEW: Canvas-based paper grain texture
pub mod pixel_grid;     // NEW: Pixel grid and scanline overlay effects
pub mod responsive;     // NEW: Responsive layout helpers
pub mod styled_button;  // NEW: Redesigned button widget
pub mod styled_input;   // NEW: Redesigned input widget
pub mod page_transition; // NEW: Page transition animations
pub mod terminal;       // NEW: Terminal output widget

// Re-export commonly used items
pub use panel::{panel, themed_panel, panel_with_title, panel_with_header, panel_with_inner_border};
pub use status_badge::{
    Status, 
    // Legacy API (backward compatibility - uses default light theme)
    status_dot_legacy as status_dot, 
    status_badge_legacy as status_badge,
    pulsing_status_dot_legacy as pulsing_status_dot,
    // New theme-aware API
    status_dot_typed, status_badge_typed,
};
pub use progress_bar::{
    // New theme-aware API: styled_progress_bar(theme, progress_0_to_1, variant, size)
    styled_progress_bar,
    animated_progress_bar,
    animated_progress_bar_with_label,
    // Legacy helpers that take value/max
    styled_progress_bar_legacy,
    ProgressVariant, 
    ProgressSize,
};
pub use budget_donut::{budget_donut, BudgetSize};
pub use usage_chart::usage_chart;
pub use modal::{modal_overlay, confirm_modal, error_modal, ModalSize, ModalData};
pub use toast::{toast_overlay, ToastManager, Toast, ToastType};
pub use header::{header, Page};
pub use icons::{icon, icon_with_size};  // OLD Unicode icons
pub use help_text::help_text;
pub use paper_texture::paper_texture;
pub use pixel_grid::{
    PixelGrid, ScanlineOverlay, RetroOverlay,
    pixel_grid_overlay, scanline_overlay, retro_overlay,
};
pub use responsive::{responsive_columns, responsive_grid, Device, breakpoints};

// Re-export new SVG icon system (use qualified names to avoid conflicts)
pub use icon::{icon as svg_icon, icon_sized as svg_icon_sized, icon_custom as svg_icon_custom, IconName, IconSize};

// Re-export new styled widgets
pub use styled_button::{
    styled_button, styled_button_sized, ButtonVariant, ButtonSize,
    primary_button, secondary_button, danger_button, warning_button, info_button, ghost_button,
};
pub use styled_input::{
    styled_text_input, styled_text_input_with_variant, InputVariant, InputSize,
    labeled_input, labeled_input_with_error, code_input, small_input, large_input,
};
pub use page_transition::{TransitionState, fade_in, fade_color};

// Re-export terminal widget
pub use terminal::{
    terminal_output, terminal_compact, terminal_large,
    TerminalLine, LineType,
};
