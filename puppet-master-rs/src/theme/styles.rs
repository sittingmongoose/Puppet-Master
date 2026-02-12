use crate::theme::{AppTheme, colors, tokens};
use iced::{Border, Color, Shadow, Vector};
use iced::widget::{button, text_input, container, progress_bar, scrollable};

// ── Legacy Spacing Constants (kept for backward compatibility) ──────
pub const SPACING_XS: f32 = 4.0;
pub const SPACING_SM: f32 = 8.0;
pub const SPACING_MD: f32 = 16.0;
pub const SPACING_LG: f32 = 24.0;
pub const SPACING_XL: f32 = 32.0;

// ── Legacy Border Constants (kept for backward compatibility) ───────
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

// ════════════════════════════════════════════════════════════════════
// ══ NEW COMPREHENSIVE STYLE BUILDERS ════════════════════════════════
// ════════════════════════════════════════════════════════════════════

/// Comprehensive button style with ALL status variants
/// 
/// This function handles Active, Hovered, Pressed, and Disabled states
/// using the variant to determine colors.
pub fn button_styled(variant: ButtonVariant, theme: &AppTheme) -> impl Fn(&iced::Theme, button::Status) -> button::Style {
    let theme = *theme;
    move |_, status| button_style_for_status(variant, &theme, status)
}

/// Helper function that generates style based on status
fn button_style_for_status(variant: ButtonVariant, theme: &AppTheme, status: button::Status) -> button::Style {
    let palette = theme.palette();
    
    match status {
        button::Status::Active => {
            let (bg, text_color, border_color) = match variant {
                ButtonVariant::Primary => (colors::ACID_LIME, colors::INK_BLACK, colors::INK_BLACK),
                ButtonVariant::Secondary => (palette.surface, palette.text_primary, palette.border),
                ButtonVariant::Danger => (colors::HOT_MAGENTA, colors::PAPER_CREAM, colors::INK_BLACK),
                ButtonVariant::Warning => (colors::SAFETY_ORANGE, colors::INK_BLACK, colors::INK_BLACK),
                ButtonVariant::Info => (colors::ELECTRIC_BLUE, colors::PAPER_CREAM, colors::INK_BLACK),
                ButtonVariant::Ghost => (colors::TRANSPARENT, palette.text_primary, palette.border),
            };
            
            button::Style {
                background: Some(iced::Background::Color(bg)),
                text_color,
                border: Border {
                    color: border_color,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::button_shadow(palette.shadow),
                snap: button::Style::default().snap,
            }
        }
        button::Status::Hovered => {
            let (bg, text_color, border_color) = match variant {
                ButtonVariant::Primary => {
                    // Slightly dimmed lime
                    (Color::from_rgb(0.0, 0.9, 0.23), colors::INK_BLACK, colors::INK_BLACK)
                }
                ButtonVariant::Secondary => {
                    (palette.surface_elevated, palette.text_primary, palette.border)
                }
                ButtonVariant::Danger => {
                    // Slightly dimmed magenta
                    (Color::from_rgb(0.9, 0.07, 0.52), colors::PAPER_CREAM, colors::INK_BLACK)
                }
                ButtonVariant::Warning => {
                    // Slightly dimmed orange
                    (Color::from_rgb(0.9, 0.45, 0.14), colors::INK_BLACK, colors::INK_BLACK)
                }
                ButtonVariant::Info => {
                    // Slightly dimmed blue
                    (Color::from_rgb(0.0, 0.25, 0.6), colors::PAPER_CREAM, colors::INK_BLACK)
                }
                ButtonVariant::Ghost => {
                    (palette.surface, palette.text_primary, palette.border)
                }
            };
            
            button::Style {
                background: Some(iced::Background::Color(bg)),
                text_color,
                border: Border {
                    color: border_color,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::button_shadow(palette.shadow),
                snap: button::Style::default().snap,
            }
        }
        button::Status::Pressed => {
            let (bg, text_color, border_color) = match variant {
                ButtonVariant::Primary => (colors::ACID_LIME, colors::INK_BLACK, colors::INK_BLACK),
                ButtonVariant::Secondary => (palette.surface, palette.text_primary, palette.border),
                ButtonVariant::Danger => (colors::HOT_MAGENTA, colors::PAPER_CREAM, colors::INK_BLACK),
                ButtonVariant::Warning => (colors::SAFETY_ORANGE, colors::INK_BLACK, colors::INK_BLACK),
                ButtonVariant::Info => (colors::ELECTRIC_BLUE, colors::PAPER_CREAM, colors::INK_BLACK),
                ButtonVariant::Ghost => (palette.surface, palette.text_primary, palette.border),
            };
            
            button::Style {
                background: Some(iced::Background::Color(bg)),
                text_color,
                border: Border {
                    color: border_color,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::button_shadow_pressed(palette.shadow),
                snap: button::Style::default().snap,
            }
        }
        button::Status::Disabled => {
            button::Style {
                background: Some(iced::Background::Color(palette.surface)),
                text_color: palette.text_muted,
                border: Border {
                    color: palette.border_light,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::none(),
                snap: button::Style::default().snap,
            }
        }
    }
}

/// Navigation button style with active state detection
/// 
/// Use this for sidebar navigation buttons that need to show active state.
pub fn nav_button_styled(is_active: bool, theme: &AppTheme) -> impl Fn(&iced::Theme, button::Status) -> button::Style {
    let theme = *theme;
    move |_, status| nav_button_style_for_status(is_active, &theme, status)
}

fn nav_button_style_for_status(is_active: bool, theme: &AppTheme, status: button::Status) -> button::Style {
    let palette = theme.palette();
    
    if is_active {
        // Active navigation item
        button::Style {
            background: Some(iced::Background::Color(palette.text_primary)),
            text_color: palette.background,
            border: Border {
                color: palette.border,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            shadow: tokens::shadows::none(),
            snap: button::Style::default().snap,
        }
    } else {
        match status {
            button::Status::Active => button::Style {
                background: Some(iced::Background::Color(palette.background)),
                text_color: palette.text_primary,
                border: Border {
                    color: palette.border,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::none(),
                snap: button::Style::default().snap,
            },
            button::Status::Hovered => button::Style {
                background: Some(iced::Background::Color(palette.surface_elevated)),
                text_color: palette.text_primary,
                border: Border {
                    color: palette.border,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::none(),
                snap: button::Style::default().snap,
            },
            button::Status::Pressed => button::Style {
                background: Some(iced::Background::Color(palette.text_primary)),
                text_color: palette.background,
                border: Border {
                    color: palette.border,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::none(),
                snap: button::Style::default().snap,
            },
            button::Status::Disabled => button::Style {
                background: Some(iced::Background::Color(palette.surface)),
                text_color: palette.text_muted,
                border: Border {
                    color: palette.border_light,
                    width: tokens::borders::THIN,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::none(),
                snap: button::Style::default().snap,
            },
        }
    }
}

/// Container panel with shadow and border
/// 
/// Updated version of panel_style using tokens
pub fn container_panel_styled(theme: &AppTheme) -> impl Fn(&iced::Theme) -> container::Style {
    let theme = *theme;
    move |_| {
        let palette = theme.palette();
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
    }
}

/// Container for elevated surfaces (modals, cards)
pub fn container_elevated_styled(theme: &AppTheme) -> impl Fn(&iced::Theme) -> container::Style {
    let theme = *theme;
    move |_| {
        let palette = theme.palette();
        container::Style {
            background: Some(iced::Background::Color(palette.surface_elevated)),
            border: Border {
                color: palette.border,
                width: tokens::borders::THICK,
                radius: tokens::radii::NONE.into(),
            },
            shadow: tokens::shadows::panel_shadow(palette.shadow),
            text_color: Some(palette.text_primary),
            snap: container::Style::default().snap,
        }
    }
}

/// Text input with focus and error states
pub fn text_input_styled(has_error: bool, theme: &AppTheme) -> impl Fn(&iced::Theme, text_input::Status) -> text_input::Style {
    let theme = *theme;
    move |_, status| text_input_style_for_status(has_error, &theme, status)
}

fn text_input_style_for_status(has_error: bool, theme: &AppTheme, status: text_input::Status) -> text_input::Style {
    let palette = theme.palette();
    
    match status {
        text_input::Status::Active => text_input::Style {
            background: iced::Background::Color(palette.background),
            border: Border {
                color: if has_error { palette.error } else { palette.border },
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            icon: palette.text_muted,
            placeholder: palette.text_muted,
            value: palette.text_primary,
            selection: palette.info,
        },
        text_input::Status::Focused { .. } => text_input::Style {
            background: iced::Background::Color(palette.background),
            border: Border {
                color: if has_error { palette.error } else { palette.info },
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            icon: palette.text_primary,
            placeholder: palette.text_muted,
            value: palette.text_primary,
            selection: palette.info,
        },
        text_input::Status::Hovered => text_input::Style {
            background: iced::Background::Color(palette.background),
            border: Border {
                color: if has_error { palette.error } else { palette.border },
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            icon: palette.text_secondary,
            placeholder: palette.text_muted,
            value: palette.text_primary,
            selection: palette.info,
        },
        text_input::Status::Disabled => text_input::Style {
            background: iced::Background::Color(palette.surface),
            border: Border {
                color: palette.border_light,
                width: tokens::borders::THIN,
                radius: tokens::radii::NONE.into(),
            },
            icon: palette.text_muted,
            placeholder: palette.text_muted,
            value: palette.text_muted,
            selection: palette.text_muted,
        },
    }
}

/// Scrollable style with themed scrollbar
pub fn scrollable_styled(theme: &AppTheme) -> impl Fn(&iced::Theme, scrollable::Status) -> scrollable::Style {
    let theme = *theme;
    move |_, status| {
        let palette = theme.palette();
        
        match status {
            scrollable::Status::Active { .. } => scrollable::Style {
                container: container::Style::default(),
                vertical_rail: scrollable::Rail {
                    background: Some(iced::Background::Color(palette.surface)),
                    border: Border {
                        color: palette.border_light,
                        width: tokens::borders::THIN,
                        radius: tokens::radii::NONE.into(),
                    },
                    scroller: scrollable::Scroller {
                        background: iced::Background::Color(palette.text_muted),
                        border: Border {
                            color: palette.border,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                    },
                },
                horizontal_rail: scrollable::Rail {
                    background: Some(iced::Background::Color(palette.surface)),
                    border: Border {
                        color: palette.border_light,
                        width: tokens::borders::THIN,
                        radius: tokens::radii::NONE.into(),
                    },
                    scroller: scrollable::Scroller {
                        background: iced::Background::Color(palette.text_muted),
                        border: Border {
                            color: palette.border,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                    },
                },
                gap: None,
                auto_scroll: scrollable::AutoScroll {
                    background: iced::Background::Color(palette.text_muted),
                    border: Border {
                        color: palette.border,
                        width: tokens::borders::THIN,
                        radius: tokens::radii::NONE.into(),
                    },
                    shadow: tokens::shadows::none(),
                    icon: palette.text_primary,
                },
            },
            scrollable::Status::Hovered { is_horizontal_scrollbar_hovered, is_vertical_scrollbar_hovered, .. } => {
                scrollable::Style {
                    container: container::Style::default(),
                    vertical_rail: scrollable::Rail {
                        background: Some(iced::Background::Color(palette.surface)),
                        border: Border {
                            color: palette.border_light,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                        scroller: scrollable::Scroller {
                            background: iced::Background::Color(if is_vertical_scrollbar_hovered {
                                palette.text_primary
                            } else {
                                palette.text_muted
                            }),
                            border: Border {
                                color: palette.border,
                                width: tokens::borders::THIN,
                                radius: tokens::radii::NONE.into(),
                            },
                        },
                    },
                    horizontal_rail: scrollable::Rail {
                        background: Some(iced::Background::Color(palette.surface)),
                        border: Border {
                            color: palette.border_light,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                        scroller: scrollable::Scroller {
                            background: iced::Background::Color(if is_horizontal_scrollbar_hovered {
                                palette.text_primary
                            } else {
                                palette.text_muted
                            }),
                            border: Border {
                                color: palette.border,
                                width: tokens::borders::THIN,
                                radius: tokens::radii::NONE.into(),
                            },
                        },
                    },
                    gap: None,
                    auto_scroll: scrollable::AutoScroll {
                        background: iced::Background::Color(palette.text_muted),
                        border: Border {
                            color: palette.border,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                        shadow: tokens::shadows::none(),
                        icon: palette.text_primary,
                    },
                }
            }
            scrollable::Status::Dragged { is_horizontal_scrollbar_dragged, is_vertical_scrollbar_dragged, .. } => {
                scrollable::Style {
                    container: container::Style::default(),
                    vertical_rail: scrollable::Rail {
                        background: Some(iced::Background::Color(palette.surface)),
                        border: Border {
                            color: palette.border_light,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                        scroller: scrollable::Scroller {
                            background: iced::Background::Color(if is_vertical_scrollbar_dragged {
                                palette.info
                            } else {
                                palette.text_muted
                            }),
                            border: Border {
                                color: palette.border,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::NONE.into(),
                            },
                        },
                    },
                    horizontal_rail: scrollable::Rail {
                        background: Some(iced::Background::Color(palette.surface)),
                        border: Border {
                            color: palette.border_light,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::NONE.into(),
                        },
                        scroller: scrollable::Scroller {
                            background: iced::Background::Color(if is_horizontal_scrollbar_dragged {
                                palette.info
                            } else {
                                palette.text_muted
                            }),
                            border: Border {
                                color: palette.border,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::NONE.into(),
                            },
                        },
                    },
                    gap: None,
                    auto_scroll: scrollable::AutoScroll {
                        background: iced::Background::Color(palette.info),
                        border: Border {
                            color: palette.border,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        shadow: tokens::shadows::none(),
                        icon: palette.text_primary,
                    },
                }
            }
        }
    }
}

/// Progress bar with custom fill color
pub fn progress_bar_styled(fill_color: Color, theme: &AppTheme) -> impl Fn(&iced::Theme) -> progress_bar::Style {
    let theme = *theme;
    move |_| {
        let palette = theme.palette();
        progress_bar::Style {
            background: iced::Background::Color(if theme.is_dark() {
                Color::from_rgb(0.2, 0.2, 0.2)
            } else {
                Color::from_rgb(0.9, 0.9, 0.9)
            }),
            bar: iced::Background::Color(fill_color),
            border: Border {
                color: palette.border,
                width: tokens::borders::THICK,
                radius: tokens::radii::NONE.into(),
            },
        }
    }
}

/// Toast notification style
pub fn container_toast_styled(variant: ToastVariant, theme: &AppTheme) -> impl Fn(&iced::Theme) -> container::Style {
    let theme = *theme;
    move |_| {
        let palette = theme.palette();
        let accent_color = match variant {
            ToastVariant::Info => palette.info,
            ToastVariant::Success => palette.success,
            ToastVariant::Warning => palette.warning,
            ToastVariant::Error => palette.error,
        };
        
        container::Style {
            background: Some(iced::Background::Color(palette.surface_elevated)),
            border: Border {
                color: accent_color,
                width: tokens::borders::THICK,
                radius: tokens::radii::NONE.into(),
            },
            shadow: tokens::shadows::panel_shadow(palette.shadow),
            text_color: Some(palette.text_primary),
            snap: container::Style::default().snap,
        }
    }
}

/// Toast variant for styled notifications
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToastVariant {
    Info,
    Success,
    Warning,
    Error,
}
