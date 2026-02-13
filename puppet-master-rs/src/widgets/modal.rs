//! Modal overlay widget
//!
//! Redesigned modal system with dark backdrop, panel styling, and proper layering.

use crate::theme::{AppTheme, colors};
use iced::widget::{button, column, container, row, scrollable, stack, text};
use iced::{Alignment, Border, Color, Element, Length, Padding, Shadow, Vector};

/// Modal size variant
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModalSize {
    Small,  // 400px
    Medium, // 600px
    Large,  // 800px
}

impl ModalSize {
    /// Get the width for this modal size
    pub fn width(&self) -> f32 {
        match self {
            ModalSize::Small => 400.0,
            ModalSize::Medium => 600.0,
            ModalSize::Large => 800.0,
        }
    }

    /// Get the maximum height for this modal size
    pub fn max_height(&self) -> f32 {
        match self {
            ModalSize::Small => 500.0,
            ModalSize::Medium => 700.0,
            ModalSize::Large => 900.0,
        }
    }
}

/// Modal data structure
#[derive(Debug, Clone)]
pub struct ModalData {
    pub title: String,
    pub body: String,
    pub size: ModalSize,
    pub confirm_label: Option<String>,
    pub cancel_label: Option<String>,
}

/// Create a modal overlay
///
/// Displays a centered modal panel with dark backdrop, header with close button,
/// scrollable content area, and optional footer with action buttons.
///
/// # Arguments
/// * `content` - The base content element to layer the modal over
/// * `modal` - Optional modal data (None = no modal shown)
/// * `theme` - App theme for styling
/// * `on_close` - Message to send when closing the modal
/// * `on_confirm` - Optional message to send when confirming (if modal has confirm button)
///
/// # Example
/// ```
/// let with_modal = modal_overlay(
///     base_content,
///     Some(&modal_data),
///     &theme,
///     Message::CloseModal,
///     Some(Message::ConfirmAction)
/// );
/// ```
pub fn modal_overlay<'a, Message>(
    content: Element<'a, Message>,
    modal: Option<ModalData>,
    theme: &AppTheme,
    on_close: Message,
    on_confirm: Option<Message>,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let Some(modal_data) = modal else {
        return content;
    };

    let theme_copy = *theme;
    let modal_size = modal_data.size;

    // Header with title and close button
    let header = container(
        row![
            text(modal_data.title.clone())
                .size(20)
                .font(iced::Font {
                    weight: iced::font::Weight::Bold,
                    ..iced::Font::DEFAULT
                })
                .color(theme_copy.ink()),
            iced::widget::Space::new().width(Length::Fill),
            button(text("X").size(16).color(theme_copy.ink()))
                .on_press(on_close.clone())
                .padding(Padding::from([4, 12]))
                .style(move |_theme: &iced::Theme, status| {
                    let (bg, border_width) = match status {
                        iced::widget::button::Status::Hovered => {
                            let ink = theme_copy.ink();
                            (
                                Some(iced::Background::Color(Color::from_rgba(
                                    ink.r, ink.g, ink.b, 0.1,
                                ))),
                                2.0,
                            )
                        }
                        iced::widget::button::Status::Pressed => {
                            let ink = theme_copy.ink();
                            (
                                Some(iced::Background::Color(Color::from_rgba(
                                    ink.r, ink.g, ink.b, 0.2,
                                ))),
                                2.0,
                            )
                        }
                        _ => (None, 2.0),
                    };

                    button::Style {
                        background: bg,
                        text_color: theme_copy.ink(),
                        border: Border {
                            color: theme_copy.ink(),
                            width: border_width,
                            radius: 0.0.into(),
                        },
                        ..button::Style::default()
                    }
                })
        ]
        .spacing(16)
        .padding(16)
        .align_y(Alignment::Center),
    )
    .width(Length::Fill)
    .style(move |_theme: &iced::Theme| container::Style {
        background: Some(iced::Background::Color(theme_copy.paper())),
        border: Border {
            color: theme_copy.ink(),
            width: 0.0, // No top border
            radius: 0.0.into(),
        },
        ..container::Style::default()
    });

    // Separator line
    let separator = container(iced::widget::Space::new())
        .width(Length::Fill)
        .height(Length::Fixed(2.0))
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme_copy.ink())),
            ..container::Style::default()
        });

    // Scrollable content area
    let body_content = scrollable(
        container(
            text(modal_data.body.clone())
                .size(14)
                .color(theme_copy.ink()),
        )
        .padding(16)
        .width(Length::Fill),
    )
    .height(Length::Fill);

    // Build modal content
    let mut modal_content = column![header, separator, body_content].spacing(0);

    // Add footer if confirm/cancel buttons are present
    if modal_data.confirm_label.is_some() || modal_data.cancel_label.is_some() {
        let footer_separator = container(iced::widget::Space::new())
            .width(Length::Fill)
            .height(Length::Fixed(2.0))
            .style(move |_theme: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme_copy.ink())),
                ..container::Style::default()
            });

        let mut footer_buttons = row![].spacing(12).padding(16);

        // Cancel button
        if let Some(cancel_label) = modal_data.cancel_label.clone() {
            let cancel_btn = button(text(cancel_label).size(14))
                .on_press(on_close.clone())
                .padding(Padding::from([8, 16]))
                .style(move |_theme: &iced::Theme, status| {
                    let (bg, shadow_offset) = match status {
                        iced::widget::button::Status::Hovered => {
                            let paper = theme_copy.paper();
                            (
                                Color::from_rgba(paper.r, paper.g, paper.b, 0.95),
                                Vector::new(2.0, 2.0),
                            )
                        }
                        iced::widget::button::Status::Pressed => {
                            (theme_copy.paper(), Vector::new(1.0, 1.0))
                        }
                        _ => (theme_copy.paper(), Vector::new(3.0, 3.0)),
                    };

                    button::Style {
                        background: Some(iced::Background::Color(bg)),
                        text_color: theme_copy.ink(),
                        border: Border {
                            color: theme_copy.ink(),
                            width: 2.0,
                            radius: 0.0.into(),
                        },
                        shadow: Shadow {
                            color: theme_copy.shadow(),
                            offset: shadow_offset,
                            blur_radius: 0.0,
                        },
                        snap: button::Style::default().snap,
                    }
                });

            footer_buttons = footer_buttons.push(cancel_btn);
        }

        // Spacer
        footer_buttons = footer_buttons.push(iced::widget::Space::new().width(Length::Fill));

        // Confirm button
        if let Some(confirm_label) = modal_data.confirm_label.clone() {
            if let Some(confirm_msg) = on_confirm {
                let confirm_btn = button(text(confirm_label).size(14))
                    .on_press(confirm_msg)
                    .padding(Padding::from([8, 16]))
                    .style(move |_theme: &iced::Theme, status| {
                        let (bg, shadow_offset) = match status {
                            iced::widget::button::Status::Hovered => {
                                (Color::from_rgb(0.0, 0.9, 0.23), Vector::new(2.0, 2.0))
                            }
                            iced::widget::button::Status::Pressed => {
                                (colors::ACID_LIME, Vector::new(1.0, 1.0))
                            }
                            _ => (colors::ACID_LIME, Vector::new(3.0, 3.0)),
                        };

                        button::Style {
                            background: Some(iced::Background::Color(bg)),
                            text_color: colors::INK_BLACK,
                            border: Border {
                                color: colors::INK_BLACK,
                                width: 2.0,
                                radius: 0.0.into(),
                            },
                            shadow: Shadow {
                                color: theme_copy.shadow(),
                                offset: shadow_offset,
                                blur_radius: 0.0,
                            },
                            snap: button::Style::default().snap,
                        }
                    });

                footer_buttons = footer_buttons.push(confirm_btn);
            }
        }

        let footer =
            container(footer_buttons)
                .width(Length::Fill)
                .style(move |_theme: &iced::Theme| container::Style {
                    background: Some(iced::Background::Color(theme_copy.paper())),
                    ..container::Style::default()
                });

        modal_content = modal_content.push(footer_separator).push(footer);
    }

    // Wrap in styled panel with shadow
    let modal_panel = container(modal_content)
        .width(Length::Fixed(modal_size.width()))
        .max_height(modal_size.max_height())
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme_copy.paper())),
            border: Border {
                color: theme_copy.ink(),
                width: 3.0, // Thick border
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

    // Center the modal panel
    let centered_modal = container(modal_panel)
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill);

    // Dark backdrop with 70% opacity
    let backdrop = container(centered_modal)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(Color::from_rgba(
                0.0, 0.0, 0.0, 0.7,
            ))),
            ..container::Style::default()
        });

    // Layer modal on top of content
    stack![content, backdrop].into()
}

/// Simple confirmation modal
///
/// A convenience function to create a standard confirmation dialog.
///
/// # Arguments
/// * `content` - The base content to layer the modal over
/// * `title` - Modal title text
/// * `message` - Body message text
/// * `theme` - App theme
/// * `on_confirm` - Message to send when user confirms
/// * `on_cancel` - Message to send when user cancels
///
/// # Example
/// ```
/// let modal = confirm_modal(
///     base_content,
///     "Delete Item",
///     "Are you sure you want to delete this item?",
///     &theme,
///     Message::ConfirmDelete,
///     Message::CloseModal,
/// );
/// ```
pub fn confirm_modal<'a, Message>(
    content: Element<'a, Message>,
    title: impl Into<String>,
    message: impl Into<String>,
    theme: &AppTheme,
    on_confirm: Message,
    on_cancel: Message,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let modal_data = ModalData {
        title: title.into(),
        body: message.into(),
        size: ModalSize::Small,
        confirm_label: Some("Confirm".to_string()),
        cancel_label: Some("Cancel".to_string()),
    };

    modal_overlay(
        content,
        Some(modal_data),
        theme,
        on_cancel,
        Some(on_confirm),
    )
}

/// Error modal
///
/// A convenience function to display an error message.
///
/// # Arguments
/// * `content` - The base content to layer the modal over
/// * `title` - Modal title text
/// * `details` - Error details text
/// * `theme` - App theme
/// * `on_close` - Message to send when user closes
///
/// # Example
/// ```
/// let modal = error_modal(
///     base_content,
///     "Error",
///     "An unexpected error occurred.",
///     &theme,
///     Message::CloseModal,
/// );
/// ```
pub fn error_modal<'a, Message>(
    content: Element<'a, Message>,
    title: impl Into<String>,
    details: impl Into<String>,
    theme: &AppTheme,
    on_close: Message,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let modal_data = ModalData {
        title: title.into(),
        body: details.into(),
        size: ModalSize::Small,
        confirm_label: None,
        cancel_label: Some("Close".to_string()),
    };

    modal_overlay(content, Some(modal_data), theme, on_close, None)
}
