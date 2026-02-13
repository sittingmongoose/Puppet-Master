//! Styled text input widgets with retro-futuristic design
//!
//! Provides text input fields with proper styling:
//! - Paper cream background
//! - Ink border (medium weight)
//! - Focus ring effect (blue border)
//! - Optional labels and error states
//! - Monospace font option for code inputs

use crate::theme::{colors, fonts, tokens, AppTheme};
use iced::widget::{column, text, text_input, TextInput};
use iced::{Border, Color, Element};

/// Input field variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InputVariant {
    /// Default text input
    Default,
    /// Monospace font for code/technical input
    Code,
    /// Error state (magenta border)
    Error,
}

/// Input field size
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InputSize {
    /// Small: 32px height
    Small,
    /// Medium: 40px height
    Medium,
    /// Large: 48px height
    Large,
}

impl InputSize {
    /// Get padding for this size
    pub fn padding(&self) -> u16 {
        match self {
            InputSize::Small => 6,
            InputSize::Medium => 10,
            InputSize::Large => 12,
        }
    }

    /// Get font size for this input size
    pub fn font_size(&self) -> f32 {
        match self {
            InputSize::Small => tokens::font_size::SM,
            InputSize::Medium => tokens::font_size::BASE,
            InputSize::Large => tokens::font_size::MD,
        }
    }
}

impl InputVariant {
    /// Get border color for this variant in the given state
    fn border_color(&self, theme: &AppTheme, is_focused: bool) -> Color {
        match (self, is_focused) {
            (InputVariant::Error, _) => colors::HOT_MAGENTA,
            (_, true) => colors::ELECTRIC_BLUE, // Focus ring
            _ => theme.ink(),
        }
    }

    /// Get the font for this variant
    fn font(&self) -> iced::Font {
        match self {
            InputVariant::Code => fonts::FONT_MONO,
            _ => fonts::FONT_UI,
        }
    }
}

/// Create a styled text input field
///
/// # Arguments
/// * `theme` - Application theme
/// * `placeholder` - Placeholder text
/// * `value` - Current input value
///
/// # Example
/// ```ignore
/// let input = styled_text_input(&theme, "Enter name...", &self.name)
///     .on_input(Message::NameChanged);
/// ```
pub fn styled_text_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    placeholder: &str,
    value: &str,
) -> TextInput<'a, Message> {
    styled_text_input_with_variant(
        theme,
        placeholder,
        value,
        InputVariant::Default,
        InputSize::Medium,
    )
}

/// Create a styled text input with custom variant and size
///
/// # Arguments
/// * `theme` - Application theme
/// * `placeholder` - Placeholder text
/// * `value` - Current input value
/// * `variant` - Input variant
/// * `size` - Input size
///
/// # Example
/// ```ignore
/// let input = styled_text_input_with_variant(
///     &theme,
///     "Enter code...",
///     &self.code,
///     InputVariant::Code,
///     InputSize::Large
/// )
/// .on_input(Message::CodeChanged);
/// ```
pub fn styled_text_input_with_variant<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    placeholder: &str,
    value: &str,
    variant: InputVariant,
    size: InputSize,
) -> TextInput<'a, Message> {
    let theme_copy = *theme;
    let font = variant.font();
    let font_size = size.font_size();
    let padding = size.padding();

    text_input(placeholder, value)
        .padding(padding)
        .size(font_size)
        .font(font)
        .style(
            move |_iced_theme: &iced::Theme, status: text_input::Status| {
                let is_focused = matches!(status, text_input::Status::Focused { .. });
                let border_color = variant.border_color(&theme_copy, is_focused);
                let border_width = if is_focused {
                    tokens::borders::THICK // Thicker border on focus
                } else {
                    tokens::borders::MEDIUM
                };

                text_input::Style {
                    background: iced::Background::Color(theme_copy.paper()),
                    border: Border {
                        color: border_color,
                        width: border_width,
                        radius: tokens::radii::SM.into(),
                    },
                    icon: theme_copy.ink(),
                    placeholder: theme_copy.ink_faded(),
                    value: theme_copy.ink(),
                    selection: colors::ELECTRIC_BLUE,
                }
            },
        )
}

/// Create a labeled text input with label above the field
///
/// # Arguments
/// * `theme` - Application theme
/// * `label` - Label text (will be uppercase and bold)
/// * `placeholder` - Placeholder text
/// * `value` - Current input value
/// * `on_change` - Message handler for value changes
///
/// # Example
/// ```ignore
/// let input = labeled_input(
///     &theme,
///     "Name",
///     "Enter your name...",
///     &self.name,
///     Message::NameChanged,
/// );
/// ```
pub fn labeled_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    placeholder: &str,
    value: &str,
    on_change: impl Fn(String) -> Message + 'a,
) -> Element<'a, Message> {
    column![
        text(label.to_uppercase())
            .size(tokens::font_size::SM)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        styled_text_input(theme, placeholder, value).on_input(on_change),
    ]
    .spacing(tokens::spacing::XS)
    .into()
}

/// Create a labeled text input with error state
///
/// # Arguments
/// * `theme` - Application theme
/// * `label` - Label text
/// * `placeholder` - Placeholder text
/// * `value` - Current input value
/// * `error` - Optional error message to display below
/// * `on_change` - Message handler for value changes
///
/// # Example
/// ```ignore
/// let input = labeled_input_with_error(
///     &theme,
///     "Email",
///     "Enter email...",
///     &self.email,
///     self.email_error.as_deref(),
///     Message::EmailChanged,
/// );
/// ```
pub fn labeled_input_with_error<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    label: &str,
    placeholder: &str,
    value: &str,
    error: Option<&'a str>,
    on_change: impl Fn(String) -> Message + 'a,
) -> Element<'a, Message> {
    let variant = if error.is_some() {
        InputVariant::Error
    } else {
        InputVariant::Default
    };

    let mut col = column![
        text(label.to_uppercase())
            .size(tokens::font_size::SM)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        styled_text_input_with_variant(theme, placeholder, value, variant, InputSize::Medium)
            .on_input(on_change),
    ]
    .spacing(tokens::spacing::XS);

    // Add error message if present
    if let Some(error_msg) = error {
        col = col.push(
            text(error_msg)
                .size(tokens::font_size::SM)
                .color(colors::HOT_MAGENTA),
        );
    }

    col.into()
}

/// Create a code input (monospace font)
///
/// # Arguments
/// * `theme` - Application theme
/// * `placeholder` - Placeholder text
/// * `value` - Current input value
///
/// # Example
/// ```ignore
/// let input = code_input(&theme, "Enter code...", &self.code)
///     .on_input(Message::CodeChanged);
/// ```
pub fn code_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    placeholder: &str,
    value: &str,
) -> TextInput<'a, Message> {
    styled_text_input_with_variant(
        theme,
        placeholder,
        value,
        InputVariant::Code,
        InputSize::Medium,
    )
}

/// Create a small text input
pub fn small_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    placeholder: &str,
    value: &str,
) -> TextInput<'a, Message> {
    styled_text_input_with_variant(
        theme,
        placeholder,
        value,
        InputVariant::Default,
        InputSize::Small,
    )
}

/// Create a large text input
pub fn large_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    placeholder: &str,
    value: &str,
) -> TextInput<'a, Message> {
    styled_text_input_with_variant(
        theme,
        placeholder,
        value,
        InputVariant::Default,
        InputSize::Large,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_input_sizes() {
        assert_eq!(InputSize::Small.padding(), 6);
        assert_eq!(InputSize::Medium.padding(), 10);
        assert_eq!(InputSize::Large.padding(), 12);

        assert_eq!(InputSize::Small.font_size(), tokens::font_size::SM);
        assert_eq!(InputSize::Medium.font_size(), tokens::font_size::BASE);
        assert_eq!(InputSize::Large.font_size(), tokens::font_size::MD);
    }

    #[test]
    fn test_variant_fonts() {
        assert_eq!(InputVariant::Default.font(), fonts::FONT_UI);
        assert_eq!(InputVariant::Code.font(), fonts::FONT_MONO);
        assert_eq!(InputVariant::Error.font(), fonts::FONT_UI);
    }

    #[test]
    fn test_error_border_color() {
        let theme = AppTheme::Light;
        let error_color = InputVariant::Error.border_color(&theme, false);
        assert_eq!(error_color, colors::HOT_MAGENTA);
    }
}
