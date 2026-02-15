//! Custom styled progress bar widget with retro-futuristic design
//!
//! Provides progress bars with:
//! - Solid color fill based on variant
//! - Cross-hatch pattern in unfilled area
//! - Thick ink border
//! - Optional percentage label

use crate::theme::{AppTheme, colors, tokens};
use iced::mouse;
use iced::widget::{Canvas, canvas, container, row, text};
use iced::{Border, Color, Element, Length, Point, Rectangle, Size, Theme as IcedTheme};

// DRY:WIDGET:ProgressVariant
/// Progress bar color variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgressVariant {
    /// Neon Blue fill
    Default,
    /// Acid Lime fill
    Success,
    /// Safety Orange fill
    Warning,
    /// Hot Magenta fill
    Error,
}

impl ProgressVariant {
    // DRY:WIDGET:color
    /// Get the fill color for this variant
    pub fn color(&self) -> Color {
        match self {
            ProgressVariant::Default => colors::NEON_BLUE,
            ProgressVariant::Success => colors::ACID_LIME,
            ProgressVariant::Warning => colors::SAFETY_ORANGE,
            ProgressVariant::Error => colors::HOT_MAGENTA,
        }
    }
}

// DRY:WIDGET:ProgressSize
/// Progress bar size variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgressSize {
    /// 16px height
    Small,
    /// 32px height
    Medium,
    /// 40px height
    Large,
}

impl ProgressSize {
    // DRY:WIDGET:height
    /// Get the height for this size
    pub fn height(&self) -> f32 {
        match self {
            ProgressSize::Small => 16.0,
            ProgressSize::Medium => 32.0,
            ProgressSize::Large => 40.0,
        }
    }
}

/// Progress bar state for canvas rendering
#[derive(Debug, Clone, Copy)]
struct ProgressBarState {
    progress: f32,
    variant: ProgressVariant,
    #[allow(dead_code)]
    size: ProgressSize,
    ink_color: Color,
    time: f32,
}

impl<Message> canvas::Program<Message> for ProgressBarState {
    type State = ();

    fn draw(
        &self,
        _state: &Self::State,
        renderer: &iced::Renderer,
        _theme: &IcedTheme,
        bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> Vec<canvas::Geometry> {
        let mut frame = canvas::Frame::new(renderer, bounds.size());

        let progress_clamped = self.progress.clamp(0.0, 1.0);
        let fill_width = bounds.width * progress_clamped;

        // Draw filled portion with gradient effect (3D look)
        if fill_width > 0.0 {
            let base_color = self.variant.color();

            // Draw main fill
            frame.fill_rectangle(
                Point::ORIGIN,
                Size::new(fill_width, bounds.height),
                base_color,
            );

            // Add subtle gradient effect (lighter at top, darker at bottom)
            let gradient_height = bounds.height * 0.3;
            let top_highlight = Color {
                a: 0.15,
                ..Color::WHITE
            };
            frame.fill_rectangle(
                Point::ORIGIN,
                Size::new(fill_width, gradient_height),
                top_highlight,
            );

            // Animated shimmer effect - bright highlight that moves across
            let shimmer_cycle = 2.0; // seconds for full cycle
            let shimmer_pos = (self.time / shimmer_cycle).fract();
            let shimmer_x = shimmer_pos * (bounds.width + 80.0) - 40.0;
            let shimmer_width = 40.0;

            // Only draw shimmer if it overlaps with filled area
            if shimmer_x < fill_width && shimmer_x + shimmer_width > 0.0 {
                let shimmer_start = shimmer_x.max(0.0);
                let shimmer_end = (shimmer_x + shimmer_width).min(fill_width);
                let shimmer_draw_width = shimmer_end - shimmer_start;

                if shimmer_draw_width > 0.0 {
                    // Create bright shimmer with gradient falloff
                    let shimmer_color = Color {
                        a: 0.3,
                        ..Color::WHITE
                    };
                    frame.fill_rectangle(
                        Point::new(shimmer_start, 0.0),
                        Size::new(shimmer_draw_width, bounds.height),
                        shimmer_color,
                    );
                }
            }

            // Animated pulsing glow at the edge
            let pulse_cycle = 1.5; // seconds for full pulse
            let pulse_alpha =
                ((self.time * std::f32::consts::TAU / pulse_cycle).sin() * 0.5 + 0.5) * 0.2;
            let glow_color = Color {
                a: pulse_alpha,
                ..base_color
            };

            // Draw glow as a subtle border
            if fill_width > 2.0 {
                let glow_width = 2.0;
                frame.fill_rectangle(
                    Point::new(fill_width - glow_width, 0.0),
                    Size::new(glow_width, bounds.height),
                    glow_color,
                );
            }
        }

        // Draw cross-hatch pattern in unfilled area with slow animation
        if progress_clamped < 1.0 {
            let unfilled_start = fill_width;

            // Animated cross-hatch - slowly drifts
            let drift_cycle = 4.0; // seconds for full drift
            let drift_offset = (self.time / drift_cycle).fract() * 16.0;
            let line_spacing = 8.0;
            let mut x = unfilled_start - drift_offset;

            while x < bounds.width {
                // Diagonal line from top-left to bottom-right
                let path = canvas::Path::line(
                    Point::new(x, 0.0),
                    Point::new((x + bounds.height).min(bounds.width), bounds.height),
                );
                frame.stroke(
                    &path,
                    canvas::Stroke {
                        style: canvas::Style::Solid(Color {
                            a: 0.15,
                            ..self.ink_color
                        }),
                        width: 1.0,
                        ..canvas::Stroke::default()
                    },
                );

                x += line_spacing;
            }

            // Cross-hatch: diagonal lines from bottom-left to top-right
            let mut x = unfilled_start - drift_offset;
            while x < bounds.width {
                let y_start = bounds.height;
                let path = canvas::Path::line(
                    Point::new(x, y_start),
                    Point::new((x + bounds.height).min(bounds.width), 0.0),
                );
                frame.stroke(
                    &path,
                    canvas::Stroke {
                        style: canvas::Style::Solid(Color {
                            a: 0.15,
                            ..self.ink_color
                        }),
                        width: 1.0,
                        ..canvas::Stroke::default()
                    },
                );

                x += line_spacing;
            }
        }

        // Draw vertical line at fill boundary
        if fill_width > 0.0 && progress_clamped < 1.0 {
            let path = canvas::Path::line(
                Point::new(fill_width, 0.0),
                Point::new(fill_width, bounds.height),
            );
            frame.stroke(
                &path,
                canvas::Stroke {
                    style: canvas::Style::Solid(self.ink_color),
                    width: 2.0,
                    ..canvas::Stroke::default()
                },
            );
        }

        vec![frame.into_geometry()]
    }
}

// DRY:WIDGET:animated_progress_bar
/// Create a styled progress bar with theme-aware styling and animations
///
/// # Arguments
/// * `theme` - Application theme
/// * `progress` - Progress value from 0.0 to 1.0
/// * `variant` - Color variant
/// * `size` - Size variant
/// * `time` - Elapsed time in seconds for animation (shimmer, glow, drift)
///
/// # Example
/// ```ignore
/// let progress = animated_progress_bar(
///     &theme,
///     0.75,
///     ProgressVariant::Success,
///     ProgressSize::Medium,
///     app_time,
/// );
/// ```
pub fn animated_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    progress: f32,
    variant: ProgressVariant,
    size: ProgressSize,
    time: f32,
) -> Element<'a, Message> {
    let height = size.height();
    let ink = theme.ink();

    let canvas_widget = Canvas::new(ProgressBarState {
        progress,
        variant,
        size,
        ink_color: ink,
        time,
    })
    .width(Length::Fill)
    .height(height);

    let themed_container = container(canvas_widget)
        .width(Length::Fill)
        .height(height)
        .style(move |_iced_theme: &IcedTheme| container::Style {
            border: Border {
                color: ink,
                width: tokens::borders::THICK,
                radius: tokens::radii::NONE.into(),
            },
            ..container::Style::default()
        });

    themed_container.into()
}

// DRY:WIDGET:styled_progress_bar
/// Create a styled progress bar without animations (time = 0.0)
///
/// # Arguments
/// * `theme` - Application theme
/// * `progress` - Progress value from 0.0 to 1.0
/// * `variant` - Color variant
/// * `size` - Size variant
///
/// # Example
/// ```ignore
/// let progress = styled_progress_bar(
///     &theme,
///     0.75,
///     ProgressVariant::Success,
///     ProgressSize::Medium,
/// );
/// ```
pub fn styled_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    progress: f32,
    variant: ProgressVariant,
    size: ProgressSize,
) -> Element<'a, Message> {
    animated_progress_bar(theme, progress, variant, size, 0.0)
}

// DRY:WIDGET:animated_progress_bar_with_label
/// Create a progress bar with percentage label and animations
///
/// # Arguments
/// * `theme` - Application theme
/// * `progress` - Progress value from 0.0 to 1.0
/// * `variant` - Color variant
/// * `size` - Size variant
/// * `time` - Elapsed time in seconds for animation
///
/// # Example
/// ```ignore
/// let progress = animated_progress_bar_with_label(
///     &theme,
///     0.75,
///     ProgressVariant::Success,
///     ProgressSize::Medium,
///     app_time,
/// );
/// ```
pub fn animated_progress_bar_with_label<'a, Message: 'a>(
    theme: &AppTheme,
    progress: f32,
    variant: ProgressVariant,
    size: ProgressSize,
    time: f32,
) -> Element<'a, Message> {
    let percentage = (progress.clamp(0.0, 1.0) * 100.0) as u32;
    let label_text = format!("{}%", percentage);

    row![
        animated_progress_bar(theme, progress, variant, size, time),
        text(label_text)
            .size(tokens::font_size::SM)
            .color(theme.ink())
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center)
    .into()
}

// DRY:WIDGET:progress_bar_with_label
/// Create a progress bar with percentage label
///
/// # Arguments
/// * `theme` - Application theme
/// * `progress` - Progress value from 0.0 to 1.0
/// * `variant` - Color variant
/// * `size` - Size variant
///
/// # Example
/// ```ignore
/// let progress = progress_bar_with_label(
///     &theme,
///     0.75,
///     ProgressVariant::Success,
///     ProgressSize::Medium,
/// );
/// ```
pub fn progress_bar_with_label<'a, Message: 'a>(
    theme: &AppTheme,
    progress: f32,
    variant: ProgressVariant,
    size: ProgressSize,
) -> Element<'a, Message> {
    animated_progress_bar_with_label(theme, progress, variant, size, 0.0)
}

// ── Convenience functions for common progress bar types ──────────────────

// DRY:WIDGET:default_progress_bar
/// Create a default blue progress bar
pub fn default_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    value: f32,
    max: f32,
) -> Element<'a, Message> {
    let progress = if max > 0.0 { value / max } else { 0.0 };
    styled_progress_bar(
        theme,
        progress,
        ProgressVariant::Default,
        ProgressSize::Medium,
    )
}

// DRY:WIDGET:success_progress_bar
/// Create a success (lime) progress bar
pub fn success_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    value: f32,
    max: f32,
) -> Element<'a, Message> {
    let progress = if max > 0.0 { value / max } else { 0.0 };
    styled_progress_bar(
        theme,
        progress,
        ProgressVariant::Success,
        ProgressSize::Medium,
    )
}

// DRY:WIDGET:warning_progress_bar
/// Create a warning (orange) progress bar
pub fn warning_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    value: f32,
    max: f32,
) -> Element<'a, Message> {
    let progress = if max > 0.0 { value / max } else { 0.0 };
    styled_progress_bar(
        theme,
        progress,
        ProgressVariant::Warning,
        ProgressSize::Medium,
    )
}

// DRY:WIDGET:error_progress_bar
/// Create an error (magenta) progress bar
pub fn error_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    value: f32,
    max: f32,
) -> Element<'a, Message> {
    let progress = if max > 0.0 { value / max } else { 0.0 };
    styled_progress_bar(
        theme,
        progress,
        ProgressVariant::Error,
        ProgressSize::Medium,
    )
}

// DRY:WIDGET:auto_color_progress_bar
/// Create a progress bar that auto-selects color based on percentage
///
/// - Blue: < 80%
/// - Orange: 80-95%
/// - Magenta: > 95%
pub fn auto_color_progress_bar<'a, Message: 'a>(
    theme: &AppTheme,
    value: f32,
    max: f32,
) -> Element<'a, Message> {
    let progress = if max > 0.0 { value / max } else { 0.0 };
    let percentage = progress * 100.0;

    let variant = if percentage < 80.0 {
        ProgressVariant::Default
    } else if percentage < 95.0 {
        ProgressVariant::Warning
    } else {
        ProgressVariant::Error
    };

    styled_progress_bar(theme, progress, variant, ProgressSize::Medium)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_variant_colors() {
        assert_eq!(ProgressVariant::Default.color(), colors::NEON_BLUE);
        assert_eq!(ProgressVariant::Success.color(), colors::ACID_LIME);
        assert_eq!(ProgressVariant::Warning.color(), colors::SAFETY_ORANGE);
        assert_eq!(ProgressVariant::Error.color(), colors::HOT_MAGENTA);
    }

    #[test]
    fn test_size_heights() {
        assert_eq!(ProgressSize::Small.height(), 16.0);
        assert_eq!(ProgressSize::Medium.height(), 32.0);
        assert_eq!(ProgressSize::Large.height(), 40.0);
    }
}

// ══════════════════════════════════════════════════════════════════════════
// Backward Compatibility Wrappers
// ══════════════════════════════════════════════════════════════════════════
//
// The old API used (value, max, variant, size) without theme parameter.
// These functions maintain that signature using the default light theme.

// DRY:WIDGET:styled_progress_bar_legacy (deprecated -- use styled_progress_bar)
/// Legacy API: Create a styled progress bar with value/max range
///
/// **Note**: This is kept for backward compatibility. New code should use
/// `styled_progress_bar()` with an explicit theme parameter.
///
/// # Example
/// ```ignore
/// let progress = styled_progress_bar_legacy(
///     75.0,
///     100.0,
///     ProgressVariant::Success,
///     ProgressSize::Medium,
/// );
/// ```
pub fn styled_progress_bar_legacy<'a, Message: 'a>(
    value: f32,
    max: f32,
    variant: ProgressVariant,
    size: ProgressSize,
) -> Element<'a, Message> {
    let theme = AppTheme::Light;
    let progress = if max > 0.0 { value / max } else { 0.0 };
    styled_progress_bar(&theme, progress, variant, size)
}
