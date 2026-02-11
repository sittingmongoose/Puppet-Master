//! Navigation header widget

use iced::widget::{container, button, text, row, pick_list};
use iced::{Element, Length, Padding, Border, Shadow};
use crate::theme::{AppTheme, colors, styles};

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
            Page::Dashboard => "Dashboard",
            Page::Projects => "Projects",
            Page::Wizard => "Wizard",
            Page::Config => "Config",
            Page::Doctor => "Doctor",
            Page::Tiers => "Tiers",
            Page::Evidence => "Evidence",
            Page::Metrics => "Metrics",
            Page::History => "History",
            Page::Coverage => "Coverage",
            Page::Memory => "Memory",
            Page::Ledger => "Ledger",
            Page::Login => "Login",
            Page::Settings => "Settings",
            Page::Setup => "Setup",
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

/// Create navigation header
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
    let theme_copy = *theme;
    
    // Logo
    let logo = text("RWM")
        .size(28)
        .font(iced::Font {
            weight: iced::font::Weight::Bold,
            ..iced::Font::DEFAULT
        })
        .color(colors::ELECTRIC_BLUE);
    
    // Navigation buttons
    let nav_pages = vec![
        Page::Dashboard,
        Page::Projects,
        Page::Wizard,
        Page::Config,
        Page::Doctor,
        Page::Tiers,
        Page::Evidence,
        Page::History,
        Page::Ledger,
        Page::Login,
    ];
    
    let mut nav_row = row![logo]
        .spacing(styles::SPACING_SM)
        .align_y(iced::Alignment::Center);
    
    // Add navigation buttons
    for page in nav_pages {
        let is_active = page == current_page;
        let page_label = page.label();
        
        let btn = button(text(page_label).size(14))
            .on_press(on_navigate(page))
            .padding(Padding::from([styles::SPACING_XS as u16, styles::SPACING_SM as u16]))
            .style(move |_theme: &iced::Theme, _status| {
                if is_active {
                    button::Style {
                        background: Some(iced::Background::Color(theme_copy.ink())),
                        text_color: theme_copy.paper(),
                        border: Border {
                            color: theme_copy.ink(),
                            width: 2.0,
                            radius: 0.0.into(),
                        },
                        ..button::Style::default()
                    }
                } else {
                    button::Style {
                        background: Some(iced::Background::Color(theme_copy.paper())),
                        text_color: theme_copy.ink(),
                        border: Border {
                            color: theme_copy.ink(),
                            width: 2.0,
                            radius: 0.0.into(),
                        },
                        ..button::Style::default()
                    }
                }
            });
        
        nav_row = nav_row.push(btn);
    }
    
    // Spacer
    nav_row = nav_row.push(iced::widget::Space::new().width(Length::Fill));
    
    // Project selector (if callback provided)
    if let Some(project_callback) = on_project_select {
        let project_list = vec![
            "Project 1".to_string(),
            "Project 2".to_string(),
            "Project 3".to_string(),
        ];
        
        let selected = project_name.unwrap_or_else(|| "Select Project".to_string());
        
        let picker = pick_list(
            project_list,
            Some(selected.clone()),
            project_callback,
        )
        .padding(Padding::from([styles::SPACING_XS as u16, styles::SPACING_SM as u16]))
        .style(move |_theme: &iced::Theme, _status| pick_list::Style {
            text_color: theme_copy.ink(),
            placeholder_color: theme_copy.ink_faded(),
            handle_color: theme_copy.ink(),
            background: iced::Background::Color(theme_copy.paper()),
            border: Border {
                color: theme_copy.ink(),
                width: 2.0,
                radius: 0.0.into(),
            },
        });
        
        nav_row = nav_row.push(picker);
    }
    
    // Theme toggle button
    let theme_icon = if theme.is_dark() { "☀" } else { "☾" };
    let theme_btn = button(text(theme_icon).size(18))
        .on_press(on_theme_toggle)
        .padding(Padding::from([styles::SPACING_XS as u16, styles::SPACING_SM as u16]))
        .style(move |_theme: &iced::Theme, _status| button::Style {
            background: Some(iced::Background::Color(colors::SAFETY_ORANGE)),
            text_color: colors::PAPER_CREAM,
            border: Border {
                color: colors::INK_BLACK,
                width: 2.0,
                radius: 0.0.into(),
            },
            ..button::Style::default()
        });
    
    nav_row = nav_row.push(theme_btn);
    
    // Wrap in container with header style
    container(nav_row)
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
                offset: iced::Vector::new(0.0, 2.0),
                blur_radius: 0.0,
            },
            text_color: Some(theme_copy.ink()),
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
