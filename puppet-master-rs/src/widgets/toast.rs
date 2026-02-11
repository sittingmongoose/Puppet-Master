//! Toast notification system

use iced::widget::{container, button, text, column, row};
use iced::{Element, Length, Padding, Border, Color, Shadow, Vector};
use crate::theme::{colors, styles};
use std::time::{Duration, Instant};

/// Toast notification type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToastType {
    Success,  // Acid lime
    Error,    // Hot magenta
    Warning,  // Safety orange
    Info,     // Electric blue
}

impl ToastType {
    pub fn color(&self) -> Color {
        match self {
            ToastType::Success => colors::ACID_LIME,
            ToastType::Error => colors::HOT_MAGENTA,
            ToastType::Warning => colors::SAFETY_ORANGE,
            ToastType::Info => colors::ELECTRIC_BLUE,
        }
    }
    
    pub fn icon(&self) -> &'static str {
        match self {
            ToastType::Success => "✓",
            ToastType::Error => "✕",
            ToastType::Warning => "⚠",
            ToastType::Info => "ℹ",
        }
    }
}

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
    
    /// Check if this toast has expired
    pub fn is_expired(&self) -> bool {
        self.created_at.elapsed() >= self.duration
    }
    
    /// Get remaining time as fraction (0.0 to 1.0)
    pub fn remaining_fraction(&self) -> f32 {
        let elapsed = self.created_at.elapsed().as_secs_f32();
        let total = self.duration.as_secs_f32();
        ((total - elapsed) / total).max(0.0).min(1.0)
    }
}

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
    /// Create a new toast manager
    pub fn new() -> Self {
        Self {
            toasts: Vec::new(),
            next_id: 0,
        }
    }
    
    /// Add a new toast
    pub fn add(&mut self, toast_type: ToastType, message: impl Into<String>) {
        let toast = Toast::new(self.next_id, toast_type, message);
        self.next_id += 1;
        self.toasts.push(toast);
    }
    
    /// Add a success toast
    pub fn success(&mut self, message: impl Into<String>) {
        self.add(ToastType::Success, message);
    }
    
    /// Add an error toast
    pub fn error(&mut self, message: impl Into<String>) {
        self.add(ToastType::Error, message);
    }
    
    /// Add a warning toast
    pub fn warning(&mut self, message: impl Into<String>) {
        self.add(ToastType::Warning, message);
    }
    
    /// Add an info toast
    pub fn info(&mut self, message: impl Into<String>) {
        self.add(ToastType::Info, message);
    }
    
    /// Remove a toast by ID
    pub fn remove(&mut self, id: usize) {
        self.toasts.retain(|t| t.id != id);
    }
    
    /// Remove expired toasts
    pub fn remove_expired(&mut self) {
        self.toasts.retain(|t| !t.is_expired());
    }
    
    /// Get all active toasts
    pub fn toasts(&self) -> &[Toast] {
        &self.toasts
    }
    
    /// Clear all toasts
    pub fn clear(&mut self) {
        self.toasts.clear();
    }
}

/// Render a single toast notification
fn render_toast<'a, Message>(
    toast: &Toast,
    on_dismiss: impl Fn(usize) -> Message + 'a,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let color = toast.toast_type.color();
    let icon = toast.toast_type.icon();
    let message = toast.message.clone();
    let toast_id = toast.id;
    
    container(
        row![
            text(icon)
                .size(20)
                .color(colors::PAPER_CREAM),
            text(message)
                .size(14)
                .color(colors::PAPER_CREAM),
            iced::widget::Space::new().width(Length::Fill),
            button(text("✕").size(14).color(colors::PAPER_CREAM))
                .on_press(on_dismiss(toast_id))
                .padding(Padding::from([2u16, 6u16]))
                .style(move |_theme: &iced::Theme, _status| button::Style {
                    background: Some(iced::Background::Color(Color {
                        a: 0.3,
                        ..color
                    })),
                    text_color: colors::PAPER_CREAM,
                    border: Border {
                        color: colors::PAPER_CREAM,
                        width: 1.0,
                        radius: 0.0.into(),
                    },
                    ..button::Style::default()
                }),
        ]
        .spacing(styles::SPACING_SM)
        .align_y(iced::Alignment::Center)
    )
    .padding(styles::SPACING_SM)
    .width(320)
    .style(move |_theme: &iced::Theme| container::Style {
        background: Some(iced::Background::Color(color)),
        border: Border {
            color: colors::INK_BLACK,
            width: styles::BORDER_THICK,
            radius: 0.0.into(),
        },
        shadow: Shadow {
            color: colors::INK_BLACK,
            offset: Vector::new(3.0, 3.0),
            blur_radius: 0.0,
        },
        text_color: Some(colors::PAPER_CREAM),
        snap: container::Style::default().snap,
    })
    .into()
}

/// Create a toast overlay showing all active toasts
///
/// Toasts are stacked at the top-right corner
///
/// # Example
/// ```
/// let toasts = toast_overlay(&toast_manager, |id| Message::DismissToast(id));
/// ```
pub fn toast_overlay<'a, Message>(
    manager: &ToastManager,
    on_dismiss: impl Fn(usize) -> Message + 'a + Clone,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    if manager.toasts().is_empty() {
        return container(iced::widget::Space::new())
            .width(0)
            .height(0)
            .into();
    }
    
    let mut toast_stack = column![].spacing(styles::SPACING_SM);
    
    for toast in manager.toasts() {
        toast_stack = toast_stack.push(render_toast(toast, on_dismiss.clone()));
    }
    
    // Position at top-right
    container(
        container(toast_stack)
            .padding(styles::SPACING_MD)
            .width(Length::Shrink)
            .align_right(Length::Fill)
    )
    .width(Length::Fill)
    .align_top(Length::Fill)
    .into()
}

/// Helper to create a toast manager message handler
/// This should be called periodically (e.g., via subscription) to remove expired toasts
pub fn update_toast_manager(manager: &mut ToastManager) {
    manager.remove_expired();
}
