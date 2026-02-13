//! Custom Iced widgets for RWM Puppet Master
//!
//! This module provides themed, reusable UI components following the
//! "Vibrant Technical / Retro-Futuristic Paper Texture" design language.

pub mod budget_donut;
pub mod header;
pub mod help_text;
pub mod help_tooltip; // NEW: Help tooltip system with ? icons
pub mod icon; // NEW: SVG icon system
pub mod icons; // OLD: Unicode symbol icons (to be deprecated)
pub mod interview_panel; // NEW: Interview progress side panel
pub mod modal;
pub mod page_transition; // NEW: Page transition animations
pub mod panel;
pub mod paper_texture; // NEW: Canvas-based paper grain texture
pub mod pixel_grid; // NEW: Pixel grid and scanline overlay effects
pub mod progress_bar;
pub mod responsive; // NEW: Responsive layout helpers
pub mod selectable_text; // NEW: Read-only selectable text helper
pub mod status_badge;
pub mod styled_button; // NEW: Redesigned button widget
pub mod styled_input; // NEW: Redesigned input widget
pub mod terminal;
pub mod toast;
pub mod tooltips; // NEW: Central tooltip text store
pub mod usage_chart; // NEW: Terminal output widget

// Re-export commonly used items
pub use budget_donut::{budget_donut, BudgetSize};
pub use header::{header, Page};
pub use help_text::help_text;
pub use help_tooltip::{help_tooltip, interaction_mode_to_variant}; // NEW: Help tooltip system
pub use icons::{icon, icon_with_size}; // OLD Unicode icons
pub use interview_panel::{
    interview_panel, interview_panel_compact, interview_panel_data_from_state, InterviewPanelData,
}; // NEW: Interview progress side panel
pub use modal::{confirm_modal, error_modal, modal_overlay, ModalData, ModalSize};
pub use panel::{
    panel, panel_with_header, panel_with_inner_border, panel_with_title, themed_panel,
};
pub use paper_texture::paper_texture;
pub use pixel_grid::{
    pixel_grid_overlay, retro_overlay, scanline_overlay, PixelGrid, RetroOverlay, ScanlineOverlay,
};
pub use progress_bar::{
    animated_progress_bar,
    animated_progress_bar_with_label,
    // New theme-aware API: styled_progress_bar(theme, progress_0_to_1, variant, size)
    styled_progress_bar,
    // Legacy helpers that take value/max
    styled_progress_bar_legacy,
    ProgressSize,
    ProgressVariant,
};
pub use responsive::{breakpoints, responsive_columns, responsive_grid, Device, LayoutSize};
pub use status_badge::{
    pulsing_status_dot_legacy as pulsing_status_dot,
    status_badge_legacy as status_badge,
    status_badge_typed,
    // Legacy API (backward compatibility - uses default light theme)
    status_dot_legacy as status_dot,
    // New theme-aware API
    status_dot_typed,
    Status,
};
pub use toast::{toast_overlay, Toast, ToastManager, ToastType};
pub use tooltips::{get_tooltip, TooltipVariant}; // NEW: Tooltip store
pub use usage_chart::usage_chart;

// Re-export new SVG icon system (use qualified names to avoid conflicts)
pub use icon::{
    icon as svg_icon, icon_custom as svg_icon_custom, icon_sized as svg_icon_sized, IconName,
    IconSize,
};

// Re-export new styled widgets
pub use page_transition::{fade_color, fade_in, TransitionState};
pub use selectable_text::selectable_text_input;
pub use styled_button::{
    danger_button, ghost_button, info_button, primary_button, secondary_button, styled_button,
    styled_button_sized, warning_button, ButtonSize, ButtonVariant,
};
pub use styled_input::{
    code_input, labeled_input, labeled_input_with_error, large_input, small_input,
    styled_text_input, styled_text_input_with_variant, InputSize, InputVariant,
};

// Re-export terminal widget
pub use terminal::{terminal_compact, terminal_large, terminal_output, LineType, TerminalLine};
