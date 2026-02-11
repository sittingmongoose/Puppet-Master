//! Custom styled progress bar widget

use iced::widget::{progress_bar, ProgressBar};
use iced::{Border, Color};
use crate::theme::{colors, styles};

/// Progress bar color variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgressVariant {
    Default,  // Electric blue
    Success,  // Acid lime
    Warning,  // Safety orange
    Error,    // Hot magenta
}

impl ProgressVariant {
    pub fn color(&self) -> Color {
        match self {
            ProgressVariant::Default => colors::ELECTRIC_BLUE,
            ProgressVariant::Success => colors::ACID_LIME,
            ProgressVariant::Warning => colors::SAFETY_ORANGE,
            ProgressVariant::Error => colors::HOT_MAGENTA,
        }
    }
}

/// Progress bar size variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgressSize {
    Small,   // 16px
    Medium,  // 32px
    Large,   // 40px
}

impl ProgressSize {
    pub fn height(&self) -> f32 {
        match self {
            ProgressSize::Small => 16.0,
            ProgressSize::Medium => 32.0,
            ProgressSize::Large => 40.0,
        }
    }
}

/// Create a styled progress bar with custom variant and size
///
/// # Arguments
/// * `value` - Current progress value
/// * `max` - Maximum progress value
/// * `variant` - Color variant
/// * `size` - Size variant
///
/// # Example
/// ```
/// let progress = styled_progress_bar(
///     75.0,
///     100.0,
///     ProgressVariant::Success,
///     ProgressSize::Medium,
/// );
/// ```
pub fn styled_progress_bar<'a>(
    value: f32,
    max: f32,
    variant: ProgressVariant,
    size: ProgressSize,
) -> ProgressBar<'a>
{
    let color = variant.color();
    let height = size.height();
    
    progress_bar(0.0..=max, value)
        .girth(height)
        .style(move |_theme: &iced::Theme| progress_bar::Style {
            background: iced::Background::Color(Color::from_rgb(0.2, 0.2, 0.2)),
            bar: iced::Background::Color(color),
            border: Border {
                color: colors::INK_BLACK,
                width: styles::BORDER_THICK,
                radius: 0.0.into(),
            },
        })
}

/// Create a default blue progress bar
pub fn default_progress_bar<'a>(value: f32, max: f32) -> ProgressBar<'a> {
    styled_progress_bar(value, max, ProgressVariant::Default, ProgressSize::Medium)
}

/// Create a success (lime) progress bar
pub fn success_progress_bar<'a>(value: f32, max: f32) -> ProgressBar<'a> {
    styled_progress_bar(value, max, ProgressVariant::Success, ProgressSize::Medium)
}

/// Create a warning (orange) progress bar
pub fn warning_progress_bar<'a>(value: f32, max: f32) -> ProgressBar<'a> {
    styled_progress_bar(value, max, ProgressVariant::Warning, ProgressSize::Medium)
}

/// Create an error (magenta) progress bar
pub fn error_progress_bar<'a>(value: f32, max: f32) -> ProgressBar<'a> {
    styled_progress_bar(value, max, ProgressVariant::Error, ProgressSize::Medium)
}

/// Create a progress bar that auto-selects color based on percentage
///
/// - Blue: < 80%
/// - Orange: 80-95%
/// - Magenta: > 95%
pub fn auto_color_progress_bar<'a>(value: f32, max: f32) -> ProgressBar<'a> {
    let percentage = (value / max) * 100.0;
    let variant = if percentage < 80.0 {
        ProgressVariant::Default
    } else if percentage < 95.0 {
        ProgressVariant::Warning
    } else {
        ProgressVariant::Error
    };
    
    styled_progress_bar(value, max, variant, ProgressSize::Medium)
}
