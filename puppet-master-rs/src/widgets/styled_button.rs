//! Styled button widget with retro-futuristic design
//!
//! Provides button variants matching the Tauri React GUI design:
//! - Primary: Acid Lime - for START/SAVE actions
//! - Secondary: Paper Cream - for default actions
//! - Danger: Hot Magenta - for STOP/DELETE actions
//! - Warning: Safety Orange - for PAUSE actions
//! - Info: Electric Blue - for RESUME/RETRY actions
//! - Ghost: Transparent - inverts on hover

use crate::theme::{AppTheme, colors, fonts, tokens};
use iced::widget::{Button, button, text};
use iced::{Background, Border, Color, Shadow, Vector};

// DRY:WIDGET:ButtonVariant
/// Button color variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ButtonVariant {
    /// Acid Lime background, black text — for START/SAVE actions
    Primary,
    /// Paper background, ink text — default actions
    Secondary,
    /// Hot Magenta background, cream text — STOP/DELETE actions
    Danger,
    /// Safety Orange background, black text — PAUSE actions
    Warning,
    /// Electric Blue background, cream text — RESUME/RETRY actions
    Info,
    /// Transparent background, ink text — inverts on hover
    Ghost,
}

// DRY:WIDGET:ButtonSize
/// Button size variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ButtonSize {
    /// Small: 8px horizontal, 4px vertical padding, 13px text
    Small,
    /// Medium: 24px horizontal, 16px vertical padding, 15px text
    Medium,
    /// Large: 32px horizontal, 16px vertical padding, 20px text
    Large,
}

impl ButtonSize {
    // DRY:WIDGET:padding_x
    /// Get horizontal padding for this size
    pub fn padding_x(&self) -> u16 {
        match self {
            ButtonSize::Small => 8,
            ButtonSize::Medium => 24,
            ButtonSize::Large => 32,
        }
    }
    // DRY:WIDGET:padding_y

    /// Get vertical padding for this size
    pub fn padding_y(&self) -> u16 {
        match self {
            ButtonSize::Small => 4,
            ButtonSize::Medium => 16,
            ButtonSize::Large => 16,
        }
    }
    // DRY:WIDGET:font_size

    /// Get font size for this button size
    pub fn font_size(&self) -> f32 {
        match self {
            ButtonSize::Small => tokens::font_size::SM,
            ButtonSize::Medium => tokens::font_size::BASE,
            ButtonSize::Large => tokens::font_size::LG,
        }
    }
}

impl ButtonVariant {
    /// Get background color for this variant in the given state
    fn background_color(&self, theme: &AppTheme, status: &button::Status) -> Color {
        let base = match self {
            ButtonVariant::Primary => colors::ACID_LIME,
            ButtonVariant::Secondary => theme.paper(),
            ButtonVariant::Danger => colors::HOT_MAGENTA,
            ButtonVariant::Warning => colors::SAFETY_ORANGE,
            ButtonVariant::Info => colors::ELECTRIC_BLUE,
            ButtonVariant::Ghost => colors::TRANSPARENT,
        };

        match status {
            button::Status::Active | button::Status::Pressed => base,
            button::Status::Hovered => {
                // Ghost inverts to ink on hover
                if matches!(self, ButtonVariant::Ghost) {
                    theme.ink()
                } else {
                    // Slight lightening on hover
                    lighten_color(base, 0.1)
                }
            }
            button::Status::Disabled => {
                // 50% opacity
                Color { a: 0.5, ..base }
            }
        }
    }

    /// Get text color for this variant in the given state
    fn text_color(&self, theme: &AppTheme, status: &button::Status) -> Color {
        let base = match self {
            ButtonVariant::Primary | ButtonVariant::Warning => colors::INK_BLACK,
            ButtonVariant::Secondary | ButtonVariant::Ghost => theme.ink(),
            ButtonVariant::Danger | ButtonVariant::Info => colors::PAPER_CREAM,
        };

        match status {
            button::Status::Hovered if matches!(self, ButtonVariant::Ghost) => {
                // Ghost text inverts on hover
                colors::PAPER_CREAM
            }
            button::Status::Disabled => Color { a: 0.5, ..base },
            _ => base,
        }
    }

    /// Get border color for this variant (theme-aware for dark mode visibility)
    fn border_color(&self, theme: &AppTheme) -> Color {
        theme.ink()
    }

    /// Get shadow for this variant in the given state
    fn shadow(&self, theme: &AppTheme, status: &button::Status) -> Shadow {
        match status {
            button::Status::Active => tokens::shadows::button_shadow(theme.ink()),
            button::Status::Hovered => Shadow {
                color: theme.ink(),
                offset: Vector::new(2.0, 2.0),
                blur_radius: 0.0,
            },
            button::Status::Pressed => tokens::shadows::button_shadow_pressed(theme.ink()),
            button::Status::Disabled => tokens::shadows::none(),
        }
    }
}

// DRY:WIDGET:styled_button
/// Create a styled button with custom variant
///
/// # Arguments
/// * `theme` - Application theme
/// * `label` - Button text label
/// * `variant` - Button color variant
///
/// # Example
/// ```ignore
/// let btn = styled_button(&theme, "Start", ButtonVariant::Primary)
///     .on_press(Message::StartTask);
/// ```
pub fn styled_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    variant: ButtonVariant,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button_sized(theme, label, variant, ButtonSize::Medium, scaled)
}

// DRY:WIDGET:styled_button_sized
/// Create a styled button with custom variant and size
///
/// # Arguments
/// * `theme` - Application theme
/// * `label` - Button text label
/// * `variant` - Button color variant
/// * `size` - Button size variant
///
/// # Example
/// ```ignore
/// let btn = styled_button_sized(&theme, "Delete", ButtonVariant::Danger, ButtonSize::Large)
///     .on_press(Message::Delete);
/// ```
pub fn styled_button_sized<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    variant: ButtonVariant,
    size: ButtonSize,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    let theme_copy = *theme;
    let label_string = label.to_uppercase(); // Uppercase for retro aesthetic
    let font_size = scaled.font_size(size.font_size());
    let padding_x = scaled.spacing(size.padding_x() as f32);
    let padding_y = scaled.spacing(size.padding_y() as f32);

    button(text(label_string).size(font_size).font(fonts::FONT_UI_BOLD))
        .padding([padding_y, padding_x])
        .style(move |_iced_theme: &iced::Theme, status: button::Status| {
            let bg_color = variant.background_color(&theme_copy, &status);
            let text_color = variant.text_color(&theme_copy, &status);
            let border_color = variant.border_color(&theme_copy);
            let shadow = variant.shadow(&theme_copy, &status);

            button::Style {
                background: Some(Background::Color(bg_color)),
                text_color,
                border: Border {
                    color: border_color,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow,
                snap: true, // Snap to pixel boundaries for crisp rendering
            }
        })
}

/// Helper function to lighten a color
fn lighten_color(color: Color, amount: f32) -> Color {
    Color {
        r: (color.r + amount).min(1.0),
        g: (color.g + amount).min(1.0),
        b: (color.b + amount).min(1.0),
        a: color.a,
    }
}

// ── Convenience functions for common button types ────────────────────────

// DRY:WIDGET:primary_button
/// Create a primary button (Acid Lime)
pub fn primary_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button(theme, label, ButtonVariant::Primary, scaled)
}

// DRY:WIDGET:secondary_button
/// Create a secondary button (Paper)
pub fn secondary_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button(theme, label, ButtonVariant::Secondary, scaled)
}

// DRY:WIDGET:danger_button
/// Create a danger button (Hot Magenta)
pub fn danger_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button(theme, label, ButtonVariant::Danger, scaled)
}

// DRY:WIDGET:warning_button
/// Create a warning button (Safety Orange)
pub fn warning_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button(theme, label, ButtonVariant::Warning, scaled)
}

// DRY:WIDGET:info_button
/// Create an info button (Electric Blue)
pub fn info_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button(theme, label, ButtonVariant::Info, scaled)
}

// DRY:WIDGET:ghost_button
/// Create a ghost button (Transparent)
pub fn ghost_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    styled_button(theme, label, ButtonVariant::Ghost, scaled)
}

// DRY:WIDGET:header_nav_button
/// Create a header navigation button with active/inactive styling
///
/// Uses THIN borders and no shadow for the header's compact aesthetic.
/// Active buttons show inverted colors (ink bg, paper text, bold font).
/// Inactive buttons show paper bg with ink text, inverting on hover.
///
/// # Example
/// ```ignore
/// let btn = header_nav_button(&theme, "DASHBOARD", true)
///     .on_press(Message::NavigateTo(Page::Dashboard));
/// ```
pub fn header_nav_button<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    is_active: bool,
    scaled: crate::theme::ScaledTokens,
) -> Button<'a, Message> {
    let theme_copy = *theme;
    let label_string = label.to_uppercase();
    let size = ButtonSize::Small;
    let font = if is_active {
        fonts::FONT_UI_BOLD
    } else {
        fonts::FONT_UI
    };

    button(text(label_string).size(scaled.font_size(size.font_size())).font(font))
        .padding([scaled.spacing(size.padding_y() as f32), scaled.spacing(size.padding_x() as f32)])
        .style(move |_iced_theme: &iced::Theme, status: button::Status| {
            let paper = theme_copy.paper();
            let ink = theme_copy.ink();

            if is_active {
                // Active: always inverted (ink bg, paper text)
                let (bg, txt, border_alpha) = match status {
                    button::Status::Disabled => {
                        (Color { a: 0.5, ..ink }, Color { a: 0.5, ..paper }, 0.5_f32)
                    }
                    _ => (ink, paper, 1.0_f32),
                };
                button::Style {
                    background: Some(Background::Color(bg)),
                    text_color: txt,
                    border: Border {
                        width: tokens::borders::THIN,
                        color: Color {
                            a: border_alpha,
                            ..ink
                        },
                        radius: tokens::radii::NONE.into(),
                    },
                    shadow: tokens::shadows::none(),
                    snap: true,
                }
            } else {
                // Inactive: paper bg normally, inverts on hover/press
                let (bg, txt) = match status {
                    button::Status::Hovered | button::Status::Pressed => (ink, paper),
                    button::Status::Disabled => (paper, Color { a: 0.5, ..ink }),
                    _ => (paper, ink),
                };
                let border_color = match status {
                    button::Status::Disabled => Color { a: 0.5, ..ink },
                    _ => ink,
                };
                button::Style {
                    background: Some(Background::Color(bg)),
                    text_color: txt,
                    border: Border {
                        width: tokens::borders::THIN,
                        color: border_color,
                        radius: tokens::radii::NONE.into(),
                    },
                    shadow: tokens::shadows::none(),
                    snap: true,
                }
            }
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_button_sizes() {
        assert_eq!(ButtonSize::Small.padding_x(), 8);
        assert_eq!(ButtonSize::Medium.padding_x(), 24);
        assert_eq!(ButtonSize::Large.padding_x(), 32);

        assert_eq!(ButtonSize::Small.font_size(), tokens::font_size::SM);
        assert_eq!(ButtonSize::Medium.font_size(), tokens::font_size::BASE);
        assert_eq!(ButtonSize::Large.font_size(), tokens::font_size::LG);
    }

    #[test]
    fn test_lighten_color() {
        let black = Color::from_rgb(0.0, 0.0, 0.0);
        let lightened = lighten_color(black, 0.5);
        assert_eq!(lightened.r, 0.5);
        assert_eq!(lightened.g, 0.5);
        assert_eq!(lightened.b, 0.5);

        // Should not exceed 1.0
        let white = Color::from_rgb(1.0, 1.0, 1.0);
        let over_lightened = lighten_color(white, 0.5);
        assert_eq!(over_lightened.r, 1.0);
        assert_eq!(over_lightened.g, 1.0);
        assert_eq!(over_lightened.b, 1.0);
    }
}
