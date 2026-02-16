//! Toast notification system
//!
//! Redesigned toast overlay with bottom-right positioning, colored backgrounds,
//! and cross-hatch shadows matching the GUI styling.

use crate::theme::colors;
use iced::widget::{button, column, container, mouse_area, row, stack, text};
use iced::{Alignment, Border, Color, Element, Length, Padding, Shadow, Vector};
use std::time::{Duration, Instant};

// DRY:WIDGET:ToastType
/// Toast notification type with associated colors
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToastType {
    Success, // Acid lime
    Error,   // Hot magenta
    Warning, // Safety orange
    Info,    // Electric blue
}

impl ToastType {
    // DRY:WIDGET:bg_color
    /// Get the background color for this toast type
    pub fn bg_color(&self) -> Color {
        match self {
            ToastType::Success => colors::ACID_LIME,
            ToastType::Error => colors::HOT_MAGENTA,
            ToastType::Warning => colors::SAFETY_ORANGE,
            ToastType::Info => colors::ELECTRIC_BLUE,
        }
    }
    // DRY:WIDGET:text_color

    /// Get the text color for this toast type
    pub fn text_color(&self) -> Color {
        match self {
            ToastType::Success => colors::INK_BLACK,
            ToastType::Error => colors::PAPER_CREAM,
            ToastType::Warning => colors::INK_BLACK,
            ToastType::Info => colors::PAPER_CREAM,
        }
    }
    // DRY:WIDGET:label

    /// Get the label text for this toast type
    pub fn label(&self) -> &'static str {
        match self {
            ToastType::Success => "OK",
            ToastType::Error => "ERR",
            ToastType::Warning => "WARN",
            ToastType::Info => "INFO",
        }
    }
}

// DRY:WIDGET:Toast
/// A single toast notification
#[derive(Debug, Clone)]
pub struct Toast {
    pub id: usize,
    pub toast_type: ToastType,
    pub message: String,
    pub created_at: Instant,
    pub duration: Duration,
}

impl Toast {
    // DRY:WIDGET:new
    /// Create a new toast
    pub fn new(id: usize, toast_type: ToastType, message: impl Into<String>) -> Self {
        Self {
            id,
            toast_type,
            message: message.into(),
            created_at: Instant::now(),
            duration: Duration::from_secs(5),
        }
    }
    // DRY:WIDGET:is_expired

    /// Check if this toast has expired
    pub fn is_expired(&self) -> bool {
        self.created_at.elapsed() >= self.duration
    }
    // DRY:WIDGET:remaining_fraction

    /// Get remaining time as fraction (0.0 to 1.0)
    pub fn remaining_fraction(&self) -> f32 {
        let elapsed = self.created_at.elapsed().as_secs_f32();
        let total = self.duration.as_secs_f32();
        ((total - elapsed) / total).max(0.0).min(1.0)
    }
}

// DRY:WIDGET:ToastManager
/// Toast manager to handle multiple toasts
#[derive(Debug, Clone)]
pub struct ToastManager {
    toasts: Vec<Toast>,
    next_id: usize,
}

impl Default for ToastManager {
    fn default() -> Self {
        Self::new()
    }
}

impl ToastManager {
    // DRY:WIDGET:new
    /// Create a new toast manager
    pub fn new() -> Self {
        Self {
            toasts: Vec::new(),
            next_id: 0,
        }
    }
    // DRY:WIDGET:add

    /// Add a new toast
    pub fn add(&mut self, toast_type: ToastType, message: impl Into<String>) {
        let toast = Toast::new(self.next_id, toast_type, message);
        self.next_id += 1;
        self.toasts.push(toast);
    }
    // DRY:WIDGET:success

    /// Add a success toast
    pub fn success(&mut self, message: impl Into<String>) {
        self.add(ToastType::Success, message);
    }
    // DRY:WIDGET:error

    /// Add an error toast
    pub fn error(&mut self, message: impl Into<String>) {
        self.add(ToastType::Error, message);
    }
    // DRY:WIDGET:warning

    /// Add a warning toast
    pub fn warning(&mut self, message: impl Into<String>) {
        self.add(ToastType::Warning, message);
    }
    // DRY:WIDGET:info

    /// Add an info toast
    pub fn info(&mut self, message: impl Into<String>) {
        self.add(ToastType::Info, message);
    }
    // DRY:WIDGET:remove

    /// Remove a toast by ID
    pub fn remove(&mut self, id: usize) {
        self.toasts.retain(|t| t.id != id);
    }
    // DRY:WIDGET:remove_expired

    /// Remove expired toasts
    pub fn remove_expired(&mut self) {
        self.toasts.retain(|t| !t.is_expired());
    }
    // DRY:WIDGET:toasts

    /// Get all active toasts
    pub fn toasts(&self) -> &[Toast] {
        &self.toasts
    }
    // DRY:WIDGET:clear

    /// Clear all toasts
    pub fn clear(&mut self) {
        self.toasts.clear();
    }
}

/// Render a single toast notification
///
/// Layout: [TYPE_LABEL] message text [X close button]
/// Width: 380px
/// Border: 2px thick, same color as background
/// Shadow: panel-style cross-hatch (3px offset)
fn render_toast<'a, Message>(
    toast: &Toast,
    on_dismiss: impl Fn(usize) -> Message + 'a,
    on_copy: impl Fn(String) -> Message + 'a,
    on_right_click: impl Fn(usize) -> Message + 'a,
    context_actions: Option<Element<'a, Message>>,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let bg_color = toast.toast_type.bg_color();
    let text_color = toast.toast_type.text_color();
    let label = toast.toast_type.label();
    let message = toast.message.clone();
    let toast_id = toast.id;

    let content = row![
        // Type label
        text(label)
            .size(14)
            .font(iced::Font {
                weight: iced::font::Weight::Bold,
                ..iced::Font::DEFAULT
            })
            .color(text_color),
        // Message text
        text(message).size(14).color(text_color),
        // Spacer
        iced::widget::Space::new().width(Length::Fill),
        // Copy button
        button(text("Copy").size(14).color(text_color))
            .on_press(on_copy(toast.message.clone()))
            .padding(Padding::from([2u16, 8u16]))
            .style(move |_theme: &iced::Theme, status| {
                let (button_bg, button_border) = match status {
                    iced::widget::button::Status::Hovered => {
                        (Color { a: 0.2, ..bg_color }, text_color)
                    }
                    iced::widget::button::Status::Pressed => {
                        (Color { a: 0.3, ..bg_color }, text_color)
                    }
                    _ => (colors::TRANSPARENT, text_color),
                };

                button::Style {
                    background: Some(iced::Background::Color(button_bg)),
                    text_color,
                    border: Border {
                        color: button_border,
                        width: 1.0,
                        radius: 0.0.into(),
                    },
                    ..button::Style::default()
                }
            }),
        // Close button
        button(text("X").size(14).color(text_color))
            .on_press(on_dismiss(toast_id))
            .padding(Padding::from([2u16, 8u16]))
            .style(move |_theme: &iced::Theme, status| {
                let (button_bg, button_border) = match status {
                    iced::widget::button::Status::Hovered => {
                        // Slightly transparent on hover
                        (Color { a: 0.2, ..bg_color }, text_color)
                    }
                    iced::widget::button::Status::Pressed => {
                        (Color { a: 0.3, ..bg_color }, text_color)
                    }
                    _ => (colors::TRANSPARENT, text_color),
                };

                button::Style {
                    background: Some(iced::Background::Color(button_bg)),
                    text_color,
                    border: Border {
                        color: button_border,
                        width: 1.0,
                        radius: 0.0.into(),
                    },
                    ..button::Style::default()
                }
            }),
    ]
    .spacing(8)
    .padding(12)
    .align_y(Alignment::Center);

    let toast_card = mouse_area(
        container(content)
            .width(Length::Fixed(380.0))
            .style(move |_theme: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(bg_color)),
                border: Border {
                    color: bg_color, // Same color as background
                    width: 2.0,
                    radius: 0.0.into(),
                },
                shadow: Shadow {
                    color: colors::INK_BLACK,
                    offset: Vector::new(3.0, 3.0),
                    blur_radius: 0.0,
                },
                text_color: Some(text_color),
                snap: container::Style::default().snap,
            }),
    )
    .on_right_press(on_right_click(toast_id));

    let mut wrapped = column![toast_card].spacing(6);
    if let Some(actions) = context_actions {
        wrapped = wrapped.push(actions);
    }

    wrapped
        .width(Length::Fixed(380.0))
        .into()
}

// DRY:WIDGET:toast_overlay
/// Create a toast overlay showing all active toasts
///
/// Toasts are stacked at the bottom-right corner with 8px vertical spacing.
/// This function layers toasts on top of the base content using `stack`.
///
/// # Arguments
/// * `content` - The base content element to layer toasts over
/// * `toasts` - Slice of active toast notifications
/// * `on_dismiss` - Callback function to dismiss a toast by ID
///
/// # Example
/// ```ignore
/// let with_toasts = toast_overlay(
///     base_content,
///     manager.toasts(),
///     |id| Message::DismissToast(id)
/// );
/// ```ignore
pub fn toast_overlay<'a, Message>(
    content: Element<'a, Message>,
    toasts: &[Toast],
    on_dismiss: impl Fn(usize) -> Message + 'a + Clone,
    on_copy: impl Fn(String) -> Message + 'a + Clone,
    on_right_click: impl Fn(usize) -> Message + 'a + Clone,
    active_context_toast: Option<usize>,
    render_context_actions: impl Fn() -> Element<'a, Message> + 'a + Clone,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    if toasts.is_empty() {
        return content;
    }

    // Build vertical stack of toasts
    let mut toast_column = column![].spacing(8);

    for toast in toasts {
        let context_actions = if active_context_toast == Some(toast.id) {
            Some(render_context_actions())
        } else {
            None
        };
        toast_column = toast_column.push(render_toast(
            toast,
            on_dismiss.clone(),
            on_copy.clone(),
            on_right_click.clone(),
            context_actions,
        ));
    }

    // Position toasts in bottom-right corner
    let toast_container = container(toast_column)
        .width(Length::Shrink)
        .height(Length::Shrink)
        .padding(16); // Padding all around

    // Align to bottom-right
    let positioned_toasts = container(toast_container)
        .width(Length::Fill)
        .height(Length::Fill)
        .align_right(Length::Fill)
        .align_bottom(Length::Fill);

    // Layer toasts on top of content
    stack![content, positioned_toasts].into()
}

// DRY:WIDGET:update_toast_manager
/// Helper to create a toast manager message handler
/// This should be called periodically (e.g., via subscription) to remove expired toasts
pub fn update_toast_manager(manager: &mut ToastManager) {
    manager.remove_expired();
}
