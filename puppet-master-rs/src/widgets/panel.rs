//! Paper-texture panel widget with cross-hatch shadow and border styling

use iced::widget::{container, text, column, Container, Column};
use iced::{Element, Length, Padding, Border, Shadow, Vector};
use crate::theme::{AppTheme, colors, styles};

/// Create a styled panel container with cross-hatch shadow
///
/// # Example
/// ```
/// let content = text("Panel content");
/// let styled = panel(content);
/// ```
pub fn panel<'a, Message>(
    content: impl Into<Element<'a, Message>>,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    container(content)
        .padding(styles::SPACING_MD)
        .width(Length::Fill)
        .style(|_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(colors::PAPER_CREAM)),
            border: Border {
                color: colors::INK_BLACK,
                width: styles::BORDER_THICK,
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
pub fn themed_panel<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;
    container(content)
        .padding(styles::SPACING_MD)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme_copy.paper())),
            border: Border {
                color: theme_copy.ink(),
                width: styles::BORDER_THICK,
                radius: 0.0.into(),
            },
            shadow: Shadow {
                color: theme_copy.shadow(),
                offset: Vector::new(4.0, 4.0),
                blur_radius: 0.0,
            },
            text_color: Some(theme_copy.ink()),
            snap: container::Style::default().snap,
        })
}

/// Create a panel with header section
///
/// The header has a bold title with an underline separator
///
/// # Example
/// ```
/// let content = text("Body content");
/// let panel = panel_with_header("Settings", content);
/// ```
pub fn panel_with_header<'a, Message>(
    title: impl Into<String>,
    content: impl Into<Element<'a, Message>>,
) -> Column<'a, Message>
where
    Message: Clone + 'a,
{
    let title_str = title.into();
    
    column![
        // Header with title
        container(
            text(title_str)
                .size(20)
                .font(iced::Font {
                    weight: iced::font::Weight::Bold,
                    ..iced::Font::DEFAULT
                })
        )
        .padding(Padding::ZERO.bottom(styles::SPACING_SM))
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
        iced::widget::Space::new().width(Length::Fill).height(Length::Fixed(styles::SPACING_MD)),
        
        // Content
        content.into(),
    ]
    .spacing(0)
}

/// Create a themed panel with header
pub fn themed_panel_with_header<'a, Message>(
    title: impl Into<String>,
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let title_str = title.into();
    let theme_copy = *theme;
    
    let header_content = column![
        // Header with title
        container(
            text(title_str)
                .size(20)
                .font(iced::Font {
                    weight: iced::font::Weight::Bold,
                    ..iced::Font::DEFAULT
                })
        )
        .padding(Padding::ZERO.bottom(styles::SPACING_SM))
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            border: Border {
                color: theme_copy.ink(),
                width: 2.0,
                radius: 0.0.into(),
            },
            ..container::Style::default()
        }),
        
        // Spacer
        iced::widget::Space::new().width(Length::Fill).height(Length::Fixed(styles::SPACING_MD)),
        
        // Content
        content.into(),
    ]
    .spacing(0);
    
    themed_panel(header_content, theme).into()
}

/// Panel with dashed inner border (6px inset visual)
pub fn panel_with_inner_border<'a, Message>(
    content: impl Into<Element<'a, Message>>,
    theme: &AppTheme,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme_copy = *theme;
    
    // Outer panel
    let inner = container(content)
        .padding(6)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            border: Border {
                color: theme_copy.ink_faded(),
                width: 1.0,
                radius: 0.0.into(),
            },
            ..container::Style::default()
        });
    
    // Wrap in themed panel
    themed_panel(inner, theme)
}
