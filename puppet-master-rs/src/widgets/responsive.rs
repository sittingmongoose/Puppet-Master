//! Responsive layout helpers for adaptive UI design
//!
//! Provides utilities for creating responsive layouts that adapt to window size,
//! following common breakpoints for mobile, tablet, and desktop layouts.

use iced::widget::{row, Column, Row};
use iced::{Element, Length};

/// Responsive breakpoints (in pixels)
pub mod breakpoints {
    /// Mobile devices (< 768px)
    pub const MOBILE: f32 = 768.0;
    
    /// Tablet devices (768px - 1023px)
    pub const TABLET: f32 = 1024.0;
    
    /// Desktop devices (>= 1024px)
    pub const DESKTOP: f32 = 1024.0;
    
    /// Large desktop (>= 1440px)
    pub const DESKTOP_LG: f32 = 1440.0;
}

/// Device category based on window width
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Device {
    Mobile,
    Tablet,
    Desktop,
    DesktopLarge,
}

impl Device {
    /// Determine device category from window width
    pub fn from_width(width: f32) -> Self {
        if width < breakpoints::MOBILE {
            Device::Mobile
        } else if width < breakpoints::TABLET {
            Device::Tablet
        } else if width < breakpoints::DESKTOP_LG {
            Device::Desktop
        } else {
            Device::DesktopLarge
        }
    }
    
    /// Check if device is mobile-sized
    pub fn is_mobile(&self) -> bool {
        matches!(self, Device::Mobile)
    }
    
    /// Check if device is tablet or smaller
    pub fn is_tablet_or_smaller(&self) -> bool {
        matches!(self, Device::Mobile | Device::Tablet)
    }
    
    /// Check if device is desktop or larger
    pub fn is_desktop_or_larger(&self) -> bool {
        matches!(self, Device::Desktop | Device::DesktopLarge)
    }
}

/// Create a responsive column layout that adapts to window width
///
/// # Arguments
/// * `window_width` - Current window width in pixels
/// * `items` - Vector of elements to arrange
/// * `spacing` - Spacing between items
///
/// # Layout Rules
/// - Desktop (>= 1024px): 2 columns
/// - Tablet/Mobile (< 1024px): 1 column
///
/// # Example
/// ```
/// use puppet_master::widgets::responsive::responsive_columns;
/// use iced::widget::text;
/// 
/// let items = vec![
///     text("Item 1").into(),
///     text("Item 2").into(),
///     text("Item 3").into(),
///     text("Item 4").into(),
/// ];
/// 
/// let layout = responsive_columns(1200.0, items, 16.0);
/// ```
pub fn responsive_columns<'a, Message: 'a>(
    window_width: f32,
    items: Vec<Element<'a, Message>>,
    spacing: f32,
) -> Element<'a, Message> {
    let device = Device::from_width(window_width);
    
    if device.is_desktop_or_larger() {
        // 2-column layout for desktop
        two_column_layout(items, spacing)
    } else {
        // Single column for tablet and mobile
        single_column_layout(items, spacing)
    }
}

/// Create a single column layout
fn single_column_layout<'a, Message: 'a>(
    items: Vec<Element<'a, Message>>,
    spacing: f32,
) -> Element<'a, Message> {
    let mut col = Column::new().spacing(spacing).width(Length::Fill);
    
    for item in items {
        col = col.push(item);
    }
    
    col.into()
}

/// Create a two column layout by distributing items evenly
fn two_column_layout<'a, Message: 'a>(
    items: Vec<Element<'a, Message>>,
    spacing: f32,
) -> Element<'a, Message> {
    let mut left_col = Column::new().spacing(spacing).width(Length::FillPortion(1));
    let mut right_col = Column::new().spacing(spacing).width(Length::FillPortion(1));
    
    // Distribute items evenly between columns
    for (i, item) in items.into_iter().enumerate() {
        if i % 2 == 0 {
            left_col = left_col.push(item);
        } else {
            right_col = right_col.push(item);
        }
    }
    
    row![left_col, right_col]
        .spacing(spacing)
        .width(Length::Fill)
        .into()
}

/// Create a responsive grid layout with variable column count
///
/// # Arguments
/// * `window_width` - Current window width in pixels
/// * `items` - Vector of elements to arrange
/// * `spacing` - Spacing between items
///
/// # Layout Rules
/// - Desktop Large (>= 1440px): 3 columns
/// - Desktop (>= 1024px): 2 columns
/// - Tablet (>= 768px): 2 columns
/// - Mobile (< 768px): 1 column
pub fn responsive_grid<'a, Message: 'a>(
    window_width: f32,
    items: Vec<Element<'a, Message>>,
    spacing: f32,
) -> Element<'a, Message> {
    let device = Device::from_width(window_width);
    
    let columns = match device {
        Device::DesktopLarge => 3,
        Device::Desktop | Device::Tablet => 2,
        Device::Mobile => 1,
    };
    
    grid_layout(items, columns, spacing)
}

/// Create a grid layout with specified number of columns
fn grid_layout<'a, Message: 'a>(
    items: Vec<Element<'a, Message>>,
    columns: usize,
    spacing: f32,
) -> Element<'a, Message> {
    if columns <= 1 {
        return single_column_layout(items, spacing);
    }
    
    // Distribute items into separate vectors for each column
    let mut column_items: Vec<Vec<Element<'a, Message>>> = (0..columns)
        .map(|_| Vec::new())
        .collect();
    
    // Distribute items across columns
    for (i, item) in items.into_iter().enumerate() {
        let col_idx = i % columns;
        column_items[col_idx].push(item);
    }
    
    // Create columns from the item vectors
    let mut grid_row = Row::new().spacing(spacing).width(Length::Fill);
    
    for items_vec in column_items {
        let mut col = Column::new().spacing(spacing).width(Length::FillPortion(1));
        for item in items_vec {
            col = col.push(item);
        }
        grid_row = grid_row.push(col);
    }
    
    grid_row.into()
}

/// Get recommended column count based on window width
pub fn column_count_for_width(window_width: f32) -> usize {
    let device = Device::from_width(window_width);
    
    match device {
        Device::DesktopLarge => 3,
        Device::Desktop | Device::Tablet => 2,
        Device::Mobile => 1,
    }
}

/// Check if layout should be compact (single column) for given width
pub fn is_compact_layout(window_width: f32) -> bool {
    window_width < breakpoints::TABLET
}

/// Check if layout should be expanded (multi-column) for given width
pub fn is_expanded_layout(window_width: f32) -> bool {
    window_width >= breakpoints::DESKTOP
}
