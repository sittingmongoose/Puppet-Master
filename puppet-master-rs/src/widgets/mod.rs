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
pub mod icons;
pub mod help_text;

// Re-export commonly used items
pub use panel::{panel, panel_with_header};
pub use status_badge::{status_dot, status_badge, Status};
pub use progress_bar::{styled_progress_bar, ProgressVariant, ProgressSize};
pub use budget_donut::{budget_donut, BudgetSize};
pub use usage_chart::usage_chart;
pub use modal::{modal, ModalSize};
pub use toast::{toast_overlay, ToastManager, Toast, ToastType};
pub use header::{header, Page};
pub use icons::{icon, icon_with_size};
pub use help_text::help_text;
