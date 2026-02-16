//! Custom Iced widgets for RWM Puppet Master
//!
//! This module provides themed, reusable UI components following the
//! "Vibrant Technical / Retro-Futuristic Paper Texture" design language.
//!
//! # DRY Tags (for agent discoverability — see also docs/gui-widget-catalog.md)
//! - DRY:WIDGET:auth_status_chip — Authenticated/not-authenticated badge chip
//! - DRY:WIDGET:styled_button — Primary/secondary/danger/warning/info/ghost buttons
//! - DRY:WIDGET:styled_text_input — Themed text inputs with variants and sizes
//! - DRY:WIDGET:selectable_text_field — Read-only selectable text (canonical for display values)
//! - DRY:WIDGET:context_menu_actions — Copy/paste/select-all/close context menu row
//! - DRY:WIDGET:page_header — Page title + right-side actions (incl. refresh_button)
//! - DRY:WIDGET:refresh_button — Standardized refresh action button
//! - DRY:WIDGET:status_badge — Status dots and badges (green/yellow/red/blue)
//! - DRY:WIDGET:modal_overlay — Modal dialog with confirm/error variants
//! - DRY:WIDGET:toast_overlay — Toast notifications (success/error/warning/info)
//! - DRY:WIDGET:panel — Paper-texture panel with border and header variants
//! - DRY:WIDGET:progress_bar — Animated progress bars with variants and labels
//! - DRY:WIDGET:terminal_output — Styled terminal/command output display
//! - DRY:WIDGET:help_tooltip — "?" icon with contextual help text
//! - DRY:WIDGET:budget_donut — Donut chart for budget/usage visualization
//! - DRY:WIDGET:usage_chart — Bar chart for usage data
//! - DRY:WIDGET:interview_panel — Interview progress side panel
//! - DRY:WIDGET:responsive_columns — Responsive grid/column layout helpers

pub mod auth_status;
pub mod budget_donut;
pub mod context_menu;
pub mod header;
pub mod help_text;
pub mod help_tooltip; // NEW: Help tooltip system with ? icons
pub mod icon; // NEW: SVG icon system
pub mod icons; // OLD: Unicode symbol icons (to be deprecated)
pub mod interview_panel; // NEW: Interview progress side panel
pub mod layout_helpers; // NEW: Consolidated responsive layout helpers
pub mod modal;
pub mod page_header;
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
pub use auth_status::{AuthState, auth_status_chip};
pub use budget_donut::{BudgetSize, budget_donut};
pub use context_menu::{ContextMenuOptions, context_menu_actions};
pub use header::{Page, header};
pub use help_text::help_text;
pub use help_tooltip::{help_tooltip, interaction_mode_to_variant}; // NEW: Help tooltip system
pub use icons::{icon, icon_with_size}; // OLD Unicode icons
pub use interview_panel::{
    InterviewPanelData, interview_panel, interview_panel_compact, interview_panel_data_from_state,
}; // NEW: Interview progress side panel
pub use layout_helpers::{responsive_container_width, responsive_form_row, responsive_label_value};
pub use modal::{ModalData, ModalSize, confirm_modal, error_modal, modal_overlay};
pub use page_header::{RefreshStyle, page_header, refresh_button};
pub use panel::{
    panel, panel_with_header, panel_with_inner_border, panel_with_title, themed_panel,
};
pub use paper_texture::paper_texture;
pub use pixel_grid::{
    PixelGrid, RetroOverlay, ScanlineOverlay, pixel_grid_overlay, retro_overlay, scanline_overlay,
};
pub use progress_bar::{
    ProgressSize,
    ProgressVariant,
    animated_progress_bar,
    animated_progress_bar_with_label,
    // New theme-aware API: styled_progress_bar(theme, progress_0_to_1, variant, size)
    styled_progress_bar,
    // Legacy helpers that take value/max
    styled_progress_bar_legacy,
};
pub use responsive::{Device, LayoutSize, breakpoints, responsive_columns, responsive_grid};
pub use status_badge::{
    Status,
    pulsing_status_dot_legacy as pulsing_status_dot,
    status_badge_legacy as status_badge,
    status_badge_typed,
    // Legacy API (backward compatibility - uses default light theme)
    status_dot_legacy as status_dot,
    // New theme-aware API
    status_dot_typed,
};
pub use toast::{Toast, ToastManager, ToastType, toast_overlay};
pub use tooltips::{TooltipVariant, get_tooltip}; // NEW: Tooltip store
pub use usage_chart::usage_chart;

// Re-export new SVG icon system (use qualified names to avoid conflicts)
pub use icon::{
    IconName, IconSize, icon as svg_icon, icon_custom as svg_icon_custom,
    icon_sized as svg_icon_sized,
};

// Re-export new styled widgets
pub use page_transition::{TransitionState, fade_color, fade_in};
pub use selectable_text::{
    selectable_text_field, selectable_text_input, selectable_text_input_with_on_change,
};
pub use styled_button::{
    ButtonSize, ButtonVariant, danger_button, ghost_button, header_nav_button, info_button,
    primary_button, secondary_button, styled_button, styled_button_sized, warning_button,
};
pub use styled_input::{
    InputSize, InputVariant, code_input, labeled_input, labeled_input_with_error, large_input,
    small_input, styled_text_input, styled_text_input_with_variant,
};

// Re-export terminal widget
pub use terminal::{LineType, TerminalLine, terminal_compact, terminal_large, terminal_output};
