//! SVG icon system for consistent iconography across the application
//!
//! This module provides a type-safe icon system using embedded SVG files.
//! All icons are 24x24 viewBox, stroke-based, and use `currentColor` for theming.

use iced::widget::{svg, Svg};
use iced::Length;

/// Icon names matching our SVG files in assets/icons/
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum IconName {
    // Navigation icons
    Dashboard,
    Projects,
    Wizard,
    Config,
    Doctor,
    Tiers,
    Evidence,
    Metrics,
    History,
    Ledger,
    Login,
    Settings,
    
    // Action icons
    Play,
    Pause,
    Stop,
    Refresh,
    Close,
    Upload,
    Download,
    Expand,
    Collapse,
    Add,
    Search,
    
    // Status icons
    Check,
    Cross,
    Warning,
    Info,
    Error,
    
    // Misc icons
    Monitor,
    Brain,
    Terminal,
    Moon,
    Sun,
}

/// Icon sizes for consistent scaling
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum IconSize {
    /// 16px - Small icons for dense UI
    Small,
    /// 20px - Medium icons for buttons and labels
    Medium,
    /// 24px - Large icons for primary actions
    Large,
    /// 32px - Extra large icons for headers
    XLarge,
}

impl IconSize {
    /// Get the size in pixels
    pub fn pixels(&self) -> f32 {
        match self {
            IconSize::Small => 16.0,
            IconSize::Medium => 20.0,
            IconSize::Large => 24.0,
            IconSize::XLarge => 32.0,
        }
    }
}

impl Default for IconSize {
    fn default() -> Self {
        IconSize::Medium
    }
}

/// Get the embedded SVG bytes for an icon
fn icon_bytes(name: IconName) -> &'static [u8] {
    match name {
        // Navigation
        IconName::Dashboard => include_bytes!("../../assets/icons/dashboard.svg"),
        IconName::Projects => include_bytes!("../../assets/icons/projects.svg"),
        IconName::Wizard => include_bytes!("../../assets/icons/wizard.svg"),
        IconName::Config => include_bytes!("../../assets/icons/config.svg"),
        IconName::Doctor => include_bytes!("../../assets/icons/doctor.svg"),
        IconName::Tiers => include_bytes!("../../assets/icons/tiers.svg"),
        IconName::Evidence => include_bytes!("../../assets/icons/evidence.svg"),
        IconName::Metrics => include_bytes!("../../assets/icons/metrics.svg"),
        IconName::History => include_bytes!("../../assets/icons/history.svg"),
        IconName::Ledger => include_bytes!("../../assets/icons/ledger.svg"),
        IconName::Login => include_bytes!("../../assets/icons/login.svg"),
        IconName::Settings => include_bytes!("../../assets/icons/settings.svg"),
        
        // Actions
        IconName::Play => include_bytes!("../../assets/icons/play.svg"),
        IconName::Pause => include_bytes!("../../assets/icons/pause.svg"),
        IconName::Stop => include_bytes!("../../assets/icons/stop.svg"),
        IconName::Refresh => include_bytes!("../../assets/icons/refresh.svg"),
        IconName::Close => include_bytes!("../../assets/icons/close.svg"),
        IconName::Upload => include_bytes!("../../assets/icons/upload.svg"),
        IconName::Download => include_bytes!("../../assets/icons/download.svg"),
        IconName::Expand => include_bytes!("../../assets/icons/expand.svg"),
        IconName::Collapse => include_bytes!("../../assets/icons/collapse.svg"),
        IconName::Add => include_bytes!("../../assets/icons/add.svg"),
        IconName::Search => include_bytes!("../../assets/icons/search.svg"),
        
        // Status
        IconName::Check => include_bytes!("../../assets/icons/check.svg"),
        IconName::Cross => include_bytes!("../../assets/icons/cross.svg"),
        IconName::Warning => include_bytes!("../../assets/icons/warning.svg"),
        IconName::Info => include_bytes!("../../assets/icons/info.svg"),
        IconName::Error => include_bytes!("../../assets/icons/error.svg"),
        
        // Misc
        IconName::Monitor => include_bytes!("../../assets/icons/monitor.svg"),
        IconName::Brain => include_bytes!("../../assets/icons/brain.svg"),
        IconName::Terminal => include_bytes!("../../assets/icons/terminal.svg"),
        IconName::Moon => include_bytes!("../../assets/icons/moon.svg"),
        IconName::Sun => include_bytes!("../../assets/icons/sun.svg"),
    }
}

/// Create an icon widget with default medium size
///
/// # Example
/// ```ignore
/// use crate::widgets::icon::{icon, IconName};
///
/// let my_icon = icon(IconName::Dashboard);
/// ```
pub fn icon<'a>(name: IconName) -> Svg<'a> {
    icon_sized(name, IconSize::default())
}

/// Create an icon widget with a specific size
///
/// # Example
/// ```ignore
/// use crate::widgets::icon::{icon_sized, IconName, IconSize};
///
/// let small_icon = icon_sized(IconName::Check, IconSize::Small);
/// let large_icon = icon_sized(IconName::Warning, IconSize::Large);
/// ```
pub fn icon_sized<'a>(name: IconName, size: IconSize) -> Svg<'a> {
    let handle = svg::Handle::from_memory(icon_bytes(name));
    let size_px = size.pixels();
    
    svg(handle)
        .width(Length::Fixed(size_px))
        .height(Length::Fixed(size_px))
}

/// Create an icon with custom width and height
///
/// This is useful when you need precise control over icon dimensions.
pub fn icon_custom<'a>(name: IconName, width: f32, height: f32) -> Svg<'a> {
    let handle = svg::Handle::from_memory(icon_bytes(name));
    
    svg(handle)
        .width(Length::Fixed(width))
        .height(Length::Fixed(height))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_icon_sizes() {
        assert_eq!(IconSize::Small.pixels(), 16.0);
        assert_eq!(IconSize::Medium.pixels(), 20.0);
        assert_eq!(IconSize::Large.pixels(), 24.0);
        assert_eq!(IconSize::XLarge.pixels(), 32.0);
    }

    #[test]
    fn test_default_size() {
        assert_eq!(IconSize::default(), IconSize::Medium);
    }

    #[test]
    fn test_icon_bytes_exist() {
        // Verify all icons have valid bytes
        let icons = [
            IconName::Dashboard, IconName::Projects, IconName::Wizard,
            IconName::Config, IconName::Doctor, IconName::Tiers,
            IconName::Evidence, IconName::Metrics, IconName::History,
            IconName::Ledger, IconName::Login, IconName::Settings,
            IconName::Play, IconName::Pause, IconName::Stop,
            IconName::Refresh, IconName::Close, IconName::Upload,
            IconName::Download, IconName::Expand, IconName::Collapse,
            IconName::Add, IconName::Search, IconName::Check,
            IconName::Cross, IconName::Warning, IconName::Info,
            IconName::Error, IconName::Monitor, IconName::Brain,
            IconName::Terminal, IconName::Moon, IconName::Sun,
        ];

        for icon_name in icons.iter() {
            let bytes = icon_bytes(*icon_name);
            assert!(!bytes.is_empty(), "Icon {:?} has no bytes", icon_name);
            assert!(bytes.len() > 100, "Icon {:?} bytes seem too small", icon_name);
        }
    }
}
