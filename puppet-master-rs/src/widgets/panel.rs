//! Paper-texture panel widget with cross-hatch shadow and border styling
//!
//! Provides styled panel containers that follow the retro-futuristic design language
//! with sharp borders, hard shadows, and paper textures.

use crate::theme::{AppTheme, colors, styles, tokens};
use iced::font::{Font, Weight};
use iced::widget::{Column, Container, Space, column, container, row, text};
use iced::{Alignment, Border, Element, Length, Padding, Shadow, Vector};

/// Create a styled panel container with cross-hatch shadow and themed background
///
/// This is the basic panel - uses the current theme's colors and provides
/// backward compatibility with existing code.
///
/// # Example
/// ```
/// let content = text("Panel content");
/// let styled = panel(content);
/// ```
pub fn panel<'a, Message>(content: impl Into<Element<'a, Message>>) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    container(content)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(|_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(colors::PAPER_CREAM)),
            border: Border {
                color: colors::INK_BLACK,
                width: tokens::borders::THICK,
                radius: 0.0.into(),
            },
            shadow: Shadow {
                color: colors::INK_BLACK,
                offset: Vector::new(4.0, 4.0),
                blur_radius: 0.0,
            },
            text_color: Some(colors::INK_BLACK),
            snap: container::Style::default().snap,
        })
}

/// Create a styled panel with themed background (light/dark)
///
/// Uses the theme parameter to determine colors, shadows, and styling.
/// Supports both light and dark modes with appropriate contrasts.
///
/// # Example
/// ```
/// let theme = AppTheme::Dark;
/// let content = text("Dark mode panel");
/// let styled = themed_panel(content, &theme);
/// ```
pub fn themed_panel<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;
    container(content)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            let palette = theme_copy.palette();
            container::Style {
                background: Some(iced::Background::Color(palette.surface)),
                border: Border {
                    color: palette.border,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::panel_shadow(palette.shadow),
                text_color: Some(palette.text_primary),
                snap: container::Style::default().snap,
            }
        })
}

/// Create a panel with a title header
///
/// The title is displayed in a bold font (Orbitron if available) with
/// an underline separator from the content.
///
/// # Example
/// ```
/// let content = text("Body content");
/// let panel = panel_with_title(&theme, "Settings", content);
/// ```
pub fn panel_with_title<'a, Message>(
    theme: &AppTheme,
    title: impl Into<String>,
    content: impl Into<Element<'a, Message>>,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let title_str = title.into();
    let theme_copy = *theme;

    let header_content = column![
        // Header with title
        container(text(title_str).size(tokens::font_size::LG).font(Font {
            weight: Weight::Bold,
            ..Font::DEFAULT
        }))
        .padding(Padding::ZERO.bottom(tokens::spacing::SM))
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            let palette = theme_copy.palette();
            container::Style {
                border: Border {
                    color: palette.border,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                ..container::Style::default()
            }
        }),
        // Spacer
        Space::new()
            .width(Length::Fill)
            .height(Length::Fixed(tokens::spacing::MD)),
        // Content
        content.into(),
    ]
    .spacing(0);

    themed_panel(header_content, theme).into()
}

/// Create a panel with title and header actions
///
/// Displays a title on the left and header actions (buttons, icons) on the right.
/// Perfect for panels with controls in the header.
///
/// # Example
/// ```
/// let actions = row![
///     button("Edit"),
///     button("Delete"),
/// ];
/// let content = text("Panel body");
/// let panel = panel_with_header(&theme, "Settings", actions, content);
/// ```
pub fn panel_with_header<'a, Message>(
    theme: &AppTheme,
    title: impl Into<String>,
    header_actions: impl Into<Element<'a, Message>>,
    content: impl Into<Element<'a, Message>>,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let title_str = title.into();
    let theme_copy = *theme;

    let header = container(
        row![
            // Title
            text(title_str).size(tokens::font_size::LG).font(Font {
                weight: Weight::Bold,
                ..Font::DEFAULT
            }),
            // Spacer
            Space::new().width(Length::Fill),
            // Actions
            header_actions.into(),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center),
    )
    .padding(Padding::ZERO.bottom(tokens::spacing::SM))
    .width(Length::Fill)
    .style(move |_theme: &iced::Theme| {
        let palette = theme_copy.palette();
        container::Style {
            border: Border {
                color: palette.border,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..container::Style::default()
        }
    });

    let panel_content = column![
        header,
        Space::new()
            .width(Length::Fill)
            .height(Length::Fixed(tokens::spacing::MD)),
        content.into(),
    ]
    .spacing(0);

    themed_panel(panel_content, theme).into()
}

/// Panel with dashed inner border decoration (6px inset visual)
///
/// Creates a double-border effect with a faded inner border for emphasis.
/// Useful for highlighting important content or creating visual depth.
///
/// # Example
/// ```
/// let content = text("Important content");
/// let styled = panel_with_inner_border(content, &theme);
/// ```
pub fn panel_with_inner_border<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;

    // Inner container with dashed border
    let inner = container(content)
        .padding(tokens::spacing::SM)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            let palette = theme_copy.palette();
            container::Style {
                border: Border {
                    color: palette.border_light,
                    width: tokens::borders::THIN,
                    radius: tokens::radii::NONE.into(),
                },
                ..container::Style::default()
            }
        });

    // Wrap in themed panel
    themed_panel(inner, theme)
}

/// Panel with cross-hatch shadow effect (layered shadows at different offsets)
///
/// Creates a more pronounced 3D effect with multiple shadow layers.
/// NOTE: Iced 0.14 only supports single shadows per element. This function
/// uses the standard shadow, but the API is here for future enhancement.
///
/// # Example
/// ```
/// let content = text("Elevated content");
/// let styled = panel_with_crosshatch(content, &theme);
/// ```
pub fn panel_with_crosshatch<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;
    container(content)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            let palette = theme_copy.palette();
            container::Style {
                background: Some(iced::Background::Color(palette.surface)),
                border: Border {
                    color: palette.border,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                // Iced 0.14 only supports one shadow - this would be the primary layer
                // Future: Add support for multiple shadow layers
                shadow: Shadow {
                    color: palette.shadow,
                    offset: Vector::new(4.0, 4.0),
                    blur_radius: 0.0,
                },
                text_color: Some(palette.text_primary),
                snap: container::Style::default().snap,
            }
        })
}

/// Create a compact panel with reduced padding
///
/// Useful for dense layouts or nested panels.
///
/// # Example
/// ```
/// let content = text("Compact content");
/// let styled = compact_panel(content, &theme);
/// ```
pub fn compact_panel<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;
    container(content)
        .padding(tokens::spacing::SM)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            let palette = theme_copy.palette();
            container::Style {
                background: Some(iced::Background::Color(palette.surface)),
                border: Border {
                    color: palette.border,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::button_shadow(palette.shadow),
                text_color: Some(palette.text_primary),
                snap: container::Style::default().snap,
            }
        })
}

/// Create a panel without shadow (flat appearance)
///
/// Useful for nested content or when you want a subtle container.
///
/// # Example
/// ```
/// let content = text("Flat content");
/// let styled = flat_panel(content, &theme);
/// ```
pub fn flat_panel<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;
    container(content)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            let palette = theme_copy.palette();
            container::Style {
                background: Some(iced::Background::Color(palette.surface)),
                border: Border {
                    color: palette.border,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::none(),
                text_color: Some(palette.text_primary),
                snap: container::Style::default().snap,
            }
        })
}

// ══ Legacy function kept for backward compatibility ═════════════════════

/// Create a panel with header section (legacy API)
///
/// The header has a bold title with an underline separator.
/// This function is kept for backward compatibility. New code should use
/// `panel_with_title` instead.
///
/// # Example
/// ```
/// let content = text("Body content");
/// let panel = panel_with_header("Settings", content);
/// ```
#[deprecated(
    since = "0.1.1",
    note = "Use panel_with_title or panel_with_header instead"
)]
pub fn panel_with_header_legacy<'a, Message>(
    title: impl Into<String>,
    content: impl Into<Element<'a, Message>>,
) -> Column<'a, Message>
where
    Message: Clone + 'a,
{
    let title_str = title.into();

    column![
        // Header with title
        container(text(title_str).size(20).font(Font {
            weight: Weight::Bold,
            ..Font::DEFAULT
        }))
        .padding(Padding::ZERO.bottom(tokens::spacing::SM))
        .width(Length::Fill)
        .style(|_theme: &iced::Theme| container::Style {
            border: Border {
                color: colors::INK_BLACK,
                width: 2.0,
                radius: 0.0.into(),
            },
            ..container::Style::default()
        }),
        // Spacer
        Space::new()
            .width(Length::Fill)
            .height(Length::Fixed(tokens::spacing::MD)),
        // Content
        content.into(),
    ]
    .spacing(0)
}

// ══ Legacy themed functions (updated to use tokens) ═════════════════════

/// Create a themed panel with header (legacy API)
///
/// This function is kept for backward compatibility. New code should use
/// `panel_with_title` or `panel_with_header` instead.
#[deprecated(
    since = "0.1.1",
    note = "Use panel_with_title or panel_with_header instead"
)]
pub fn themed_panel_with_header<'a, Message>(
    title: impl Into<String>,
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    panel_with_title(theme, title, content)
}
