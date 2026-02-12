//! Navigation header widget

use iced::widget::{container, button, text, row, Space};
use iced::{Element, Length, Padding, Border, Shadow, Vector, Background, Color};
use crate::theme::{AppTheme, colors};
use crate::theme::fonts::{FONT_DISPLAY_BOLD, FONT_UI, FONT_UI_BOLD};
use crate::theme::tokens::{spacing, borders, shadows};

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
}

impl Page {
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
        }
    }
    
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
        ]
    }
}

impl std::fmt::Display for Page {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.label())
    }
}

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
/// ```
/// let header = header(
///     Page::Dashboard,
///     &theme,
///     Some("My Project"),
///     Message::NavigateTo,
///     Message::ToggleTheme,
///     Some(Message::SelectProject),
/// );
/// ```
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
    
    // Logo - "RWM" with Orbitron font, 40px (2.5em), bold, with text shadow effect
    let logo = text("RWM")
        .size(40)
        .font(FONT_DISPLAY_BOLD);
    
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
            // Active page: inverted colors (ink background, cream text, bold)
            button(text(page_label).font(FONT_UI_BOLD).size(13))
                .on_press(on_navigate(page))
                .padding(Padding::from([6, 12]))
                .style(move |_theme: &iced::Theme, status| {
                    match status {
                        button::Status::Active | button::Status::Hovered | button::Status::Pressed => {
                            button::Style {
                                background: Some(Background::Color(ink_color)),
                                text_color: paper_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: ink_color, 
                                    radius: 0.0.into() 
                                },
                                shadow: Shadow { 
                                    color: ink_color, 
                                    offset: Vector::new(2.0, 2.0), 
                                    blur_radius: 0.0 
                                },
                                snap: button::Style::default().snap,
                            }
                        }
                        button::Status::Disabled => {
                            button::Style {
                                background: Some(Background::Color(Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5))),
                                text_color: Color::from_rgba(paper_color.r, paper_color.g, paper_color.b, 0.5),
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5), 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                    }
                })
        } else {
            // Inactive page: transparent bg, ink text, ink border on hover
            button(text(page_label).font(FONT_UI).size(13))
                .on_press(on_navigate(page))
                .padding(Padding::from([6, 12]))
                .style(move |_theme: &iced::Theme, status| {
                    match status {
                        button::Status::Active => {
                            button::Style {
                                background: Some(Background::Color(Color::TRANSPARENT)),
                                text_color: ink_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: Color::TRANSPARENT, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                        button::Status::Hovered => {
                            button::Style {
                                background: Some(Background::Color(Color::TRANSPARENT)),
                                text_color: ink_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: ink_color, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                        button::Status::Pressed => {
                            button::Style {
                                background: Some(Background::Color(Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.1))),
                                text_color: ink_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: ink_color, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                        button::Status::Disabled => {
                            button::Style {
                                background: Some(Background::Color(Color::TRANSPARENT)),
                                text_color: Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.5),
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: Color::TRANSPARENT, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                    }
                })
        };
        
        nav_buttons = nav_buttons.push(btn);
    }
    
    // Build the full header row
    let mut header_row = row![]
        .spacing(spacing::MD)
        .align_y(iced::Alignment::Center);
    
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
                .style(move |_theme: &iced::Theme, status| {
                    match status {
                        button::Status::Active => {
                            button::Style {
                                background: Some(Background::Color(paper_color)),
                                text_color: ink_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: ink_color, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                        button::Status::Hovered => {
                            button::Style {
                                background: Some(Background::Color(Color::from_rgba(ink_color.r, ink_color.g, ink_color.b, 0.1))),
                                text_color: ink_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: ink_color, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                        button::Status::Pressed | button::Status::Disabled => {
                            button::Style {
                                background: Some(Background::Color(paper_color)),
                                text_color: ink_color,
                                border: Border { 
                                    width: borders::MEDIUM, 
                                    color: ink_color, 
                                    radius: 0.0.into() 
                                },
                                shadow: shadows::none(),
                                snap: button::Style::default().snap,
                            }
                        }
                    }
                });
            
            header_row = header_row.push(project_btn);
        }
    }
    
    // Theme toggle button - plain text "Light" or "Dark" (NO emoji)
    let theme_label = if theme.is_dark() { "Light" } else { "Dark" };
    let theme_btn = button(text(theme_label).font(FONT_UI_BOLD).size(13))
        .on_press(on_theme_toggle)
        .padding(Padding::from([6, 12]))
        .style(move |_theme: &iced::Theme, status| {
            match status {
                button::Status::Active => {
                    button::Style {
                        background: Some(Background::Color(colors::SAFETY_ORANGE)),
                        text_color: colors::PAPER_CREAM,
                        border: Border { 
                            width: borders::MEDIUM, 
                            color: colors::INK_BLACK, 
                            radius: 0.0.into() 
                        },
                        shadow: Shadow { 
                            color: colors::INK_BLACK, 
                            offset: Vector::new(2.0, 2.0), 
                            blur_radius: 0.0 
                        },
                        snap: button::Style::default().snap,
                    }
                }
                button::Status::Hovered => {
                    button::Style {
                        background: Some(Background::Color(Color::from_rgb(0.9, 0.45, 0.14))),
                        text_color: colors::PAPER_CREAM,
                        border: Border { 
                            width: borders::MEDIUM, 
                            color: colors::INK_BLACK, 
                            radius: 0.0.into() 
                        },
                        shadow: Shadow { 
                            color: colors::INK_BLACK, 
                            offset: Vector::new(3.0, 3.0), 
                            blur_radius: 0.0 
                        },
                        snap: button::Style::default().snap,
                    }
                }
                button::Status::Pressed => {
                    button::Style {
                        background: Some(Background::Color(colors::SAFETY_ORANGE)),
                        text_color: colors::PAPER_CREAM,
                        border: Border { 
                            width: borders::MEDIUM, 
                            color: colors::INK_BLACK, 
                            radius: 0.0.into() 
                        },
                        shadow: Shadow { 
                            color: colors::INK_BLACK, 
                            offset: Vector::new(1.0, 1.0), 
                            blur_radius: 0.0 
                        },
                        snap: button::Style::default().snap,
                    }
                }
                button::Status::Disabled => {
                    button::Style {
                        background: Some(Background::Color(Color::from_rgba(1.0, 0.498, 0.153, 0.5))),
                        text_color: Color::from_rgba(0.98, 0.965, 0.945, 0.5),
                        border: Border { 
                            width: borders::MEDIUM, 
                            color: Color::from_rgba(0.102, 0.102, 0.102, 0.5), 
                            radius: 0.0.into() 
                        },
                        shadow: shadows::none(),
                        snap: button::Style::default().snap,
                    }
                }
            }
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