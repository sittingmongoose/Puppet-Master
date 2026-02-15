// DRY:DATA:palette
//! Semantic color palette
//!
//! Provides semantic color accessors that adapt to light/dark mode.
//! This layer sits on top of the raw color constants and provides
//! meaningful names for UI elements.

use super::colors::*;
use iced::Color;

/// Semantic palette that adapts to light/dark mode
///
/// This struct provides semantic names for colors, making it easier
/// to reason about color usage in the UI. All colors are backed by
/// the constants defined in `colors.rs`.
// DRY:DATA:Palette
#[derive(Debug, Clone, Copy)]
pub struct Palette {
    // ── Backgrounds ──────────────────────────────────────────────────
    /// Primary background color (main app background)
    pub background: Color,

    /// Surface color (cards, panels)
    pub surface: Color,

    /// Elevated surface (modals, popovers)
    pub surface_elevated: Color,

    // ── Text ─────────────────────────────────────────────────────────
    /// Primary text color (body text, headings)
    pub text_primary: Color,

    /// Secondary text color (less emphasis)
    pub text_secondary: Color,

    /// Muted text color (hints, placeholders)
    pub text_muted: Color,

    /// Text on accent backgrounds (white or cream)
    pub text_on_accent: Color,

    // ── Borders ──────────────────────────────────────────────────────
    /// Primary border color (strong borders)
    pub border: Color,

    /// Light border color (subtle dividers)
    pub border_light: Color,

    // ── Shadows ──────────────────────────────────────────────────────
    /// Shadow color (hard shadows, no blur)
    pub shadow: Color,

    // ── Accents ──────────────────────────────────────────────────────
    /// Electric blue accent (same in both modes)
    pub accent_blue: Color,

    /// Hot magenta accent (same in both modes)
    pub accent_magenta: Color,

    /// Acid lime accent (same in both modes)
    pub accent_lime: Color,

    /// Safety orange accent (same in both modes)
    pub accent_orange: Color,

    // ── Semantic ─────────────────────────────────────────────────────
    /// Success state color
    pub success: Color,

    /// Error state color
    pub error: Color,

    /// Warning state color
    pub warning: Color,

    /// Info state color
    pub info: Color,

    // ── Status ───────────────────────────────────────────────────────
    /// Running/executing state
    pub status_running: Color,

    /// Paused state
    pub status_paused: Color,

    /// Error/failed state
    pub status_error: Color,

    /// Complete/passed state
    pub status_complete: Color,

    /// Idle/pending state
    pub status_idle: Color,
}

impl Palette {
    /// Light mode palette
    // DRY:FN:light
    pub fn light() -> Self {
        Self {
            background: PAPER_CREAM,
            surface: PAPER_CREAM,
            surface_elevated: Color::from_rgb(1.0, 1.0, 1.0), // Pure white
            text_primary: INK_BLACK,
            text_secondary: INK_FADED,
            text_muted: Color::from_rgb(0.6, 0.6, 0.6),
            text_on_accent: PAPER_CREAM,
            border: INK_BLACK,
            border_light: Color::from_rgb(0.85, 0.85, 0.85), // Lighter than PAPER_LINED
            shadow: INK_BLACK,
            accent_blue: ELECTRIC_BLUE,
            accent_magenta: HOT_MAGENTA,
            accent_lime: ACID_LIME,
            accent_orange: SAFETY_ORANGE,
            success: ACID_LIME,
            error: HOT_MAGENTA,
            warning: SAFETY_ORANGE,
            info: ELECTRIC_BLUE,
            status_running: STATUS_RUNNING,
            status_paused: STATUS_PAUSED,
            status_error: STATUS_ERROR,
            status_complete: STATUS_COMPLETE,
            status_idle: STATUS_IDLE,
        }
    }

    /// Dark mode palette
    // DRY:FN:dark
    pub fn dark() -> Self {
        Self {
            background: PAPER_DARK,
            surface: PAPER_DARK,
            surface_elevated: Color::from_rgb(0.15, 0.15, 0.15),
            text_primary: INK_LIGHT,
            text_secondary: INK_FADED_DARK,
            text_muted: Color::from_rgb(0.5, 0.5, 0.5),
            text_on_accent: PAPER_CREAM,
            border: INK_LIGHT,
            border_light: Color::from_rgb(0.3, 0.3, 0.3),
            shadow: INK_LIGHT,
            accent_blue: ELECTRIC_BLUE,
            accent_magenta: HOT_MAGENTA,
            accent_lime: ACID_LIME,
            accent_orange: SAFETY_ORANGE,
            success: ACID_LIME,
            error: HOT_MAGENTA,
            warning: SAFETY_ORANGE,
            info: ELECTRIC_BLUE,
            status_running: STATUS_RUNNING,
            status_paused: STATUS_PAUSED,
            status_error: STATUS_ERROR,
            status_complete: STATUS_COMPLETE,
            status_idle: STATUS_IDLE,
        }
    }

    /// Get status color for a given status string
    ///
    /// This provides the same functionality as `colors::status_color()`
    /// but through the palette API.
    // DRY:FN:status_color
    pub fn status_color(&self, status: &str) -> Color {
        match status {
            "running" | "executing" | "planning" => self.status_running,
            "paused" => self.status_paused,
            "error" | "failed" | "escalated" => self.status_error,
            "complete" | "passed" => self.status_complete,
            "idle" | "pending" => self.status_idle,
            "retrying" | "gating" => self.warning,
            _ => self.text_muted,
        }
    }
}

impl Default for Palette {
    fn default() -> Self {
        Self::light()
    }
}
