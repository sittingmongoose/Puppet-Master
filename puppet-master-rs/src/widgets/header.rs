//! Navigation header widget

use crate::theme::AppTheme;
use crate::theme::fonts::{FONT_DISPLAY_BOLD, FONT_UI, FONT_UI_BOLD};
use crate::theme::tokens::{borders, shadows, spacing};
use iced::widget::{Space, button, column, container, row, rule, text};
use iced::{Background, Border, Color, Element, Length, Padding, Shadow, Vector};

// DRY:WIDGET:Page
/// Application page enum
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Page {
    Dashboard,
    Projects,
    Wizard,
    Config,
    Doctor,
    Tiers,
    Evidence,
    Metrics,
    History,
    Coverage,
    Memory,
    Ledger,
    Login,
    Settings,
    Setup,
    Interview,
}

impl Page {
    // DRY:WIDGET:label
    pub fn label(&self) -> &'static str {
        match self {
            Page::Dashboard => "DASHBOARD",
            Page::Projects => "PROJECTS",
            Page::Wizard => "WIZARD",
            Page::Config => "CONFIG",
            Page::Doctor => "DOCTOR",
            Page::Tiers => "TIERS",
            Page::Evidence => "EVIDENCE",
            Page::Metrics => "METRICS",
            Page::History => "HISTORY",
            Page::Coverage => "COVERAGE",
            Page::Memory => "MEMORY",
            Page::Ledger => "LEDGER",
            Page::Login => "LOGIN",
            Page::Settings => "SETTINGS",
            Page::Setup => "SETUP",
            Page::Interview => "INTERVIEW",
        }
    }
    // DRY:WIDGET:all

    pub fn all() -> Vec<Page> {
        vec![
            Page::Dashboard,
            Page::Projects,
            Page::Wizard,
            Page::Config,
            Page::Doctor,
            Page::Tiers,
            Page::Evidence,
            Page::Metrics,
            Page::History,
            Page::Coverage,
            Page::Memory,
            Page::Ledger,
            Page::Login,
            Page::Settings,
            Page::Setup,
            Page::Interview,
        ]
    }
}

impl std::fmt::Display for Page {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.label())
    }
}

// DRY:WIDGET:header
/// Create navigation header with logo and styled navigation
///
/// # Arguments
/// * `current_page` - Currently active page
/// * `theme` - App theme
/// * `project_name` - Optional current project name
/// * `on_navigate` - Callback for page navigation
/// * `on_theme_toggle` - Callback for theme toggle
/// * `on_project_select` - Optional callback for project selection
///
/// # Example
/// ```ignore
/// let header = header(
///     Page::Dashboard,
///     &theme,
///     Some("My Project"),
///     Message::NavigateTo,
///     Message::ToggleTheme,
///     Some(Message::SelectProject),
/// );
/// ```ignore
pub fn header<'a, Message>(
    current_page: Page,
    theme: &AppTheme,
    project_name: Option<String>,
    on_navigate: impl Fn(Page) -> Message + 'a,
    on_theme_toggle: Message,
    on_project_select: Option<impl Fn(String) -> Message + 'a>,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let _theme_copy = *theme;
    let paper_color = theme.paper();
    let ink_color = theme.ink();

    // Title - "RWM PUPPET MASTER" with thin underline (screenshot reference)
    let title_text = text("RWM PUPPET MASTER")
        .size(26)
        .font(FONT_DISPLAY_BOLD)
        .style(move |_theme: &iced::Theme| text::Style {
            color: Some(ink_color),
        });
    let underline = rule::horizontal(2).style(move |_theme: &iced::Theme| rule::Style {
        color: ink_color,
        radius: 0.0.into(),
        fill_mode: rule::FillMode::Full,
        snap: true,
    });
    let logo = column![title_text, underline]
        .spacing(spacing::XXS)
        .align_x(iced::Alignment::Start);

    // Navigation pages to display in the header
    let nav_pages = vec![
        Page::Dashboard,
        Page::Projects,
        Page::Wizard,
        Page::Config,
        Page::Doctor,
        Page::Tiers,
        Page::Evidence,
        Page::Metrics,
        Page::History,
        Page::Ledger,
        Page::Login,
        Page::Settings,
    ];

    // Build navigation buttons row
    let mut nav_buttons = row![].spacing(4).align_y(iced::Alignment::Center);

    for page in nav_pages {
        let is_active = page == current_page;
        let page_label = page.label();

        let btn = if is_active {
            // Active page: inverted colors (ink background, paper text, bold) - thin border, no shadow
            button(text(page_label).font(FONT_UI_BOLD).size(13))
                .on_press(on_navigate(page))
                .padding(Padding::from([6, 12]))
                .style(move |_theme: &iced::Theme, status| match status {
                    button::Status::Active | button::Status::Hovered | button::Status::Pressed => {
                        button::Style {
                            background: Some(Background::Color(ink_color)),
                            text_color: paper_color,
                            border: Border {
                                width: borders::THIN,
                                color: ink_color,
                                radius: 0.0.into(),
                            },
                            shadow: shadows::none(),
                            snap: button::Style::default().snap,
                        }
                    }
                    button::Status::Disabled => button::Style {
                        background: Some(Background::Color(Color::from_rgba(
                            ink_color.r,
                            ink_color.g,
                            ink_color.b,
                            0.5,
                        ))),
                        text_color: Color::from_rgba(
                            paper_color.r,
                            paper_color.g,
                            paper_color.b,
                            0.5,
                        ),
                        border: Border {
                            width: borders::THIN,
                            color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5),
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                })
        } else {
            // Inactive page: paper bg, ink text, thin ink border (screenshot outline style)
            button(text(page_label).font(FONT_UI).size(13))
                .on_press(on_navigate(page))
                .padding(Padding::from([6, 12]))
                .style(move |_theme: &iced::Theme, status| match status {
                    button::Status::Active => button::Style {
                        background: Some(Background::Color(paper_color)),
                        text_color: ink_color,
                        border: Border {
                            width: borders::THIN,
                            color: ink_color,
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                    button::Status::Hovered => button::Style {
                        background: Some(Background::Color(ink_color)),
                        text_color: paper_color,
                        border: Border {
                            width: borders::THIN,
                            color: ink_color,
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                    button::Status::Pressed => button::Style {
                        background: Some(Background::Color(ink_color)),
                        text_color: paper_color,
                        border: Border {
                            width: borders::THIN,
                            color: ink_color,
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                    button::Status::Disabled => button::Style {
                        background: Some(Background::Color(paper_color)),
                        text_color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5),
                        border: Border {
                            width: borders::THIN,
                            color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5),
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                })
        };

        nav_buttons = nav_buttons.push(btn);
    }

    // Build the full header row (XL spacing between logo and nav for visual separation)
    let mut header_row = row![].spacing(spacing::XL).align_y(iced::Alignment::Center);

    // Left: Logo
    header_row = header_row.push(logo);

    // Center: Navigation buttons
    header_row = header_row.push(nav_buttons);

    // Flexible spacer to push right section to the end
    header_row = header_row.push(Space::new().width(Length::Fill));

    // Right section: Project name and theme toggle

    // Project selector (if callback provided)
    if let Some(_project_callback) = on_project_select {
        if let Some(proj_name) = project_name {
            let project_btn = button(text(proj_name).font(FONT_UI_BOLD).size(13))
                .padding(Padding::from([6, 12]))
                .style(move |_theme: &iced::Theme, status| match status {
                    button::Status::Active => button::Style {
                        background: Some(Background::Color(paper_color)),
                        text_color: ink_color,
                        border: Border {
                            width: borders::THIN,
                            color: ink_color,
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                    button::Status::Hovered => button::Style {
                        background: Some(Background::Color(ink_color)),
                        text_color: paper_color,
                        border: Border {
                            width: borders::THIN,
                            color: ink_color,
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                    button::Status::Pressed | button::Status::Disabled => button::Style {
                        background: Some(Background::Color(paper_color)),
                        text_color: ink_color,
                        border: Border {
                            width: borders::THIN,
                            color: ink_color,
                            radius: 0.0.into(),
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    },
                });

            header_row = header_row.push(project_btn);
        }
    }

    // Theme toggle - outline style like other header buttons, "LIGHT MODE" / "DARK MODE" label
    let theme_label = if theme.is_dark() {
        "LIGHT MODE"
    } else {
        "DARK MODE"
    };
    let theme_btn = button(text(theme_label).font(FONT_UI_BOLD).size(13))
        .on_press(on_theme_toggle)
        .padding(Padding::from([6, 12]))
        .style(move |_theme: &iced::Theme, status| match status {
            button::Status::Active => button::Style {
                background: Some(Background::Color(paper_color)),
                text_color: ink_color,
                border: Border {
                    width: borders::THIN,
                    color: ink_color,
                    radius: 0.0.into(),
                },
                shadow: shadows::none(),
                snap: button::Style::default().snap,
            },
            button::Status::Hovered => button::Style {
                background: Some(Background::Color(ink_color)),
                text_color: paper_color,
                border: Border {
                    width: borders::THIN,
                    color: ink_color,
                    radius: 0.0.into(),
                },
                shadow: shadows::none(),
                snap: button::Style::default().snap,
            },
            button::Status::Pressed => button::Style {
                background: Some(Background::Color(ink_color)),
                text_color: paper_color,
                border: Border {
                    width: borders::THIN,
                    color: ink_color,
                    radius: 0.0.into(),
                },
                shadow: shadows::none(),
                snap: button::Style::default().snap,
            },
            button::Status::Disabled => button::Style {
                background: Some(Background::Color(paper_color)),
                text_color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5),
                border: Border {
                    width: borders::THIN,
                    color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5),
                    radius: 0.0.into(),
                },
                shadow: shadows::none(),
                snap: button::Style::default().snap,
            },
        });

    header_row = header_row.push(theme_btn);

    // Wrap in container with header style: sticky top, paper cream bg, 3px bottom border, cross-hatch shadow
    container(header_row)
        .padding(Padding::from([12, 24])) // vertical, horizontal padding
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(Background::Color(paper_color)),
            border: Border {
                color: ink_color,
                width: borders::THICK,
                radius: 0.0.into(),
            },
            shadow: Shadow {
                color: ink_color,
                offset: Vector::new(0.0, 4.0),
                blur_radius: 0.0,
            },
            text_color: Some(ink_color),
            snap: container::Style::default().snap,
        })
        .into()
}

// DRY:WIDGET:simple_header
/// Simple header without project selector
pub fn simple_header<'a, Message>(
    current_page: Page,
    theme: &AppTheme,
    on_navigate: impl Fn(Page) -> Message + 'a,
    on_theme_toggle: Message,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    header(
        current_page,
        theme,
        None,
        on_navigate,
        on_theme_toggle,
        None::<fn(String) -> Message>,
    )
}
