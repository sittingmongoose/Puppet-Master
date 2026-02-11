//! Modal overlay widget

use iced::widget::{container, button, text, column, row, scrollable};
use iced::{Element, Length, Padding, Border, Shadow, Vector};
use crate::theme::{AppTheme, colors, styles};

/// Modal size variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModalSize {
    Small,   // 400px
    Medium,  // 600px
    Large,   // 800px
    Full,    // 90% of screen
}

impl ModalSize {
    pub fn width(&self) -> Length {
        match self {
            ModalSize::Small => Length::Fixed(400.0),
            ModalSize::Medium => Length::Fixed(600.0),
            ModalSize::Large => Length::Fixed(800.0),
            ModalSize::Full => Length::FillPortion(9), // 90% of width
        }
    }
    
    pub fn max_height(&self) -> f32 {
        match self {
            ModalSize::Small => 500.0,
            ModalSize::Medium => 700.0,
            ModalSize::Large => 900.0,
            ModalSize::Full => 10000.0, // Effectively unlimited
        }
    }
}

/// Create a modal overlay
///
/// # Arguments
/// * `show` - Whether to show the modal
/// * `title` - Modal title
/// * `content` - Modal body content
/// * `footer` - Optional footer content (buttons, etc.)
/// * `size` - Modal size variant
/// * `theme` - App theme
/// * `on_close` - Message to send when closing
///
/// # Example
/// ```
/// let modal_content = modal(
///     true,
///     "Confirm Action",
///     text("Are you sure?"),
///     Some(row![
///         button("Cancel").on_press(Message::CloseModal),
///         button("Confirm").on_press(Message::Confirm),
///     ]),
///     ModalSize::Small,
///     &theme,
///     Message::CloseModal,
/// );
/// ```
pub fn modal<'a, Message>(
    show: bool,
    title: impl Into<String>,
    content: impl Into<Element<'a, Message>>,
    footer: Option<Element<'a, Message>>,
    size: ModalSize,
    theme: &AppTheme,
    on_close: Message,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    if !show {
        return container(iced::widget::Space::new())
            .width(0)
            .height(0)
            .into();
    }
    
    let theme_copy = *theme;
    let title_str = title.into();
    
    // Modal panel
    let mut modal_content = column![
        // Header with close button
        container(
            row![
                text(title_str)
                    .size(20)
                    .font(iced::Font {
                        weight: iced::font::Weight::Bold,
                        ..iced::Font::DEFAULT
                    }),
                iced::widget::Space::new().width(Length::Fill),
                button(text("✕").size(18))
                    .on_press(on_close.clone())
                    .padding(Padding::new(styles::SPACING_XS).right(styles::SPACING_SM).left(styles::SPACING_SM))
                    .style(move |_theme: &iced::Theme, _status| button::Style {
                        background: None,
                        text_color: theme_copy.ink(),
                        border: Border {
                            color: theme_copy.ink(),
                            width: 2.0,
                            radius: 0.0.into(),
                        },
                        ..button::Style::default()
                    })
            ]
            .spacing(styles::SPACING_MD)
            .align_y(iced::Alignment::Center)
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
        
        // Scrollable content
        scrollable(
            container(content.into())
                .padding(styles::SPACING_MD)
                .width(Length::Fill)
        )
        .height(Length::Fill),
    ]
    .spacing(styles::SPACING_MD);
    
    // Add footer if provided
    if let Some(footer_content) = footer {
        modal_content = modal_content.push(
            container(footer_content)
                .padding(Padding::ZERO.top(styles::SPACING_SM))
                .width(Length::Fill)
                .style(move |_theme: &iced::Theme| container::Style {
                    border: Border {
                        color: theme_copy.ink(),
                        width: 2.0,
                        radius: 0.0.into(),
                    },
                    ..container::Style::default()
                })
        );
    }
    
    // Wrap in styled panel
    let modal_panel = container(modal_content)
        .padding(styles::SPACING_MD)
        .width(size.width())
        .max_height(size.max_height())
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme_copy.paper())),
            border: Border {
                color: theme_copy.ink(),
                width: styles::BORDER_THICK,
                radius: 0.0.into(),
            },
            shadow: Shadow {
                color: theme_copy.shadow(),
                offset: Vector::new(6.0, 6.0),
                blur_radius: 0.0,
            },
            text_color: Some(theme_copy.ink()),
            snap: container::Style::default().snap,
        });
    
    // Wrap in backdrop
    container(
        container(modal_panel)
            .center_x(Length::Fill)
            .center_y(Length::Fill)
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .style(move |_theme: &iced::Theme| container::Style {
        background: Some(iced::Background::Color(if theme_copy.is_dark() {
            colors::BACKDROP_DARK
        } else {
            colors::BACKDROP_LIGHT
        })),
        ..container::Style::default()
    })
    .into()
}

/// Simple confirmation modal
pub fn confirm_modal<'a, Message>(
    show: bool,
    title: impl Into<String>,
    message: impl Into<String>,
    theme: &AppTheme,
    on_confirm: Message,
    on_cancel: Message,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let message_text = message.into();
    
    modal(
        show,
        title,
        text(message_text),
        Some(
            row![
                button(text("Cancel"))
                    .on_press(on_cancel.clone())
                    .padding(styles::SPACING_SM)
                    .style(|_theme: &iced::Theme, _status| button::Style {
                        background: Some(iced::Background::Color(colors::PAPER_CREAM)),
                        text_color: colors::INK_BLACK,
                        border: Border {
                            color: colors::INK_BLACK,
                            width: 2.0,
                            radius: 0.0.into(),
                        },
                        ..button::Style::default()
                    }),
                iced::widget::Space::new().width(Length::Fill),
                button(text("Confirm"))
                    .on_press(on_confirm)
                    .padding(styles::SPACING_SM)
                    .style(|_theme: &iced::Theme, _status| button::Style {
                        background: Some(iced::Background::Color(colors::ACID_LIME)),
                        text_color: colors::INK_BLACK,
                        border: Border {
                            color: colors::INK_BLACK,
                            width: 2.0,
                            radius: 0.0.into(),
                        },
                        ..button::Style::default()
                    }),
            ]
            .spacing(styles::SPACING_MD)
            .into()
        ),
        ModalSize::Small,
        theme,
        on_cancel,
    )
}
