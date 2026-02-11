use crate::theme::{AppTheme, colors};
use iced::{Border, Color, Shadow, Vector};
use iced::widget::{button, text_input, container, progress_bar, scrollable, checkbox, pick_list};

// ── Spacing Constants ────────────────────────────────────────────────
pub const SPACING_XS: f32 = 4.0;
pub const SPACING_SM: f32 = 8.0;
pub const SPACING_MD: f32 = 16.0;
pub const SPACING_LG: f32 = 24.0;
pub const SPACING_XL: f32 = 32.0;

// ── Border Constants ─────────────────────────────────────────────────
pub const BORDER_THIN: f32 = 1.0;
pub const BORDER_MEDIUM: f32 = 2.0;
pub const BORDER_THICK: f32 = 3.0;

/// Button variant for styling
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ButtonVariant {
    Primary,    // Acid lime
    Secondary,  // Paper cream
    Danger,     // Hot magenta
    Warning,    // Safety orange
    Info,       // Electric blue
    Ghost,      // Transparent
}

impl ButtonVariant {
    pub fn style(&self, theme: &AppTheme) -> button::Style {
        let (bg, text_color, border_color) = match self {
            ButtonVariant::Primary => (colors::ACID_LIME, colors::INK_BLACK, colors::INK_BLACK),
            ButtonVariant::Secondary => (theme.paper(), theme.ink(), theme.ink()),
            ButtonVariant::Danger => (colors::HOT_MAGENTA, colors::PAPER_CREAM, colors::INK_BLACK),
            ButtonVariant::Warning => (colors::SAFETY_ORANGE, colors::INK_BLACK, colors::INK_BLACK),
            ButtonVariant::Info => (colors::ELECTRIC_BLUE, colors::PAPER_CREAM, colors::INK_BLACK),
            ButtonVariant::Ghost => (colors::TRANSPARENT, theme.ink(), theme.ink()),
        };

        button::Style {
            background: Some(iced::Background::Color(bg)),
            text_color,
            border: Border {
                color: border_color,
                width: BORDER_THICK,
                radius: 0.0.into(),
            },
            shadow: Shadow {
                color: theme.shadow(),
                offset: Vector::new(3.0, 3.0),
                blur_radius: 0.0,
            },
            snap: button::Style::default().snap,
        }
    }
}

/// Panel style (container with cross-hatch shadow)
pub fn panel_style(theme: &AppTheme) -> container::Style {
    container::Style {
        background: Some(iced::Background::Color(theme.paper())),
        border: Border {
            color: theme.ink(),
            width: BORDER_THICK,
            radius: 0.0.into(),
        },
        shadow: Shadow {
            color: theme.shadow(),
            offset: Vector::new(4.0, 4.0),
            blur_radius: 0.0,
        },
        text_color: Some(theme.ink()),
        snap: container::Style::default().snap,
    }
}

/// Header style
pub fn header_style(theme: &AppTheme) -> container::Style {
    container::Style {
        background: Some(iced::Background::Color(theme.paper())),
        border: Border {
            color: theme.ink(),
            width: BORDER_THICK,
            radius: 0.0.into(),
        },
        shadow: Shadow {
            color: theme.shadow(),
            offset: Vector::new(0.0, 2.0),
            blur_radius: 0.0,
        },
        text_color: Some(theme.ink()),
        snap: container::Style::default().snap,
    }
}

/// Text input style
pub fn text_input_style(theme: &AppTheme) -> text_input::Style {
    text_input::Style {
        background: iced::Background::Color(theme.paper()),
        border: Border {
            color: theme.ink(),
            width: BORDER_MEDIUM,
            radius: 0.0.into(),
        },
        icon: theme.ink_faded(),
        placeholder: theme.ink_faded(),
        value: theme.ink(),
        selection: colors::ELECTRIC_BLUE,
    }
}

/// Text input focused style
pub fn text_input_focused_style(theme: &AppTheme) -> text_input::Style {
    text_input::Style {
        background: iced::Background::Color(theme.paper()),
        border: Border {
            color: colors::ELECTRIC_BLUE,
            width: BORDER_MEDIUM,
            radius: 0.0.into(),
        },
        icon: theme.ink(),
        placeholder: theme.ink_faded(),
        value: theme.ink(),
        selection: colors::ELECTRIC_BLUE,
    }
}

/// Progress bar style
pub fn progress_bar_style(theme: &AppTheme, fill_color: Color) -> progress_bar::Style {
    progress_bar::Style {
        background: iced::Background::Color(if theme.is_dark() {
            Color::from_rgb(0.2, 0.2, 0.2)
        } else {
            Color::from_rgb(0.9, 0.9, 0.9)
        }),
        bar: iced::Background::Color(fill_color),
        border: Border {
            color: theme.ink(),
            width: BORDER_THICK,
            radius: 0.0.into(),
        },
    }
}

/// Nav button style (active state)
pub fn nav_active_style(theme: &AppTheme) -> button::Style {
    button::Style {
        background: Some(iced::Background::Color(theme.ink())),
        text_color: theme.paper(),
        border: Border {
            color: theme.ink(),
            width: BORDER_MEDIUM,
            radius: 0.0.into(),
        },
        shadow: Shadow::default(),
        snap: button::Style::default().snap,
    }
}

/// Nav button style (inactive state)
pub fn nav_inactive_style(theme: &AppTheme) -> button::Style {
    button::Style {
        background: Some(iced::Background::Color(theme.paper())),
        text_color: theme.ink(),
        border: Border {
            color: theme.ink(),
            width: BORDER_MEDIUM,
            radius: 0.0.into(),
        },
        shadow: Shadow::default(),
        snap: button::Style::default().snap,
    }
}

/// Modal backdrop style
pub fn modal_backdrop_style(theme: &AppTheme) -> container::Style {
    container::Style {
        background: Some(iced::Background::Color(if theme.is_dark() {
            colors::BACKDROP_DARK
        } else {
            colors::BACKDROP_LIGHT
        })),
        ..container::Style::default()
    }
}
