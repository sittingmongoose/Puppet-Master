//! Pixel grid and scanline overlay effects using canvas
//!
//! Recreates the retro-futuristic pixel grid overlay from the original Tauri GUI's
//! Pixel_Transparency shader, implemented using Iced's canvas widget for subtle
//! texture and CRT-style scanline effects.

use iced::mouse;
use iced::widget::canvas::{self, Cache, Canvas, Frame, Geometry, Path, Stroke};
use iced::{Color, Element, Length, Point, Rectangle, Renderer, Size, Theme};

// ============================================================================
// Pixel Grid Overlay
// ============================================================================

// DRY:WIDGET:PixelGrid
/// Pixel grid overlay canvas widget
///
/// Draws a subtle grid pattern with configurable spacing and opacity,
/// creating a retro pixel-art aesthetic over the main content.
pub struct PixelGrid {
    cache: Cache,
    line_color: Color,
    grid_spacing: f32,
    opacity: f32,
}

impl PixelGrid {
    // DRY:WIDGET:new
    /// Create a new pixel grid overlay
    ///
    /// # Arguments
    /// * `line_color` - Base color for grid lines (typically ink color from theme)
    /// * `opacity` - Opacity of grid lines (0.03-0.08 recommended)
    /// * `grid_spacing` - Distance between grid lines in pixels (2-3 recommended)
    pub fn new(line_color: Color, opacity: f32, grid_spacing: f32) -> Self {
        Self {
            cache: Cache::new(),
            line_color,
            grid_spacing,
            opacity,
        }
    }
    // DRY:WIDGET:update

    /// Update the grid parameters (useful for theme changes)
    pub fn update(&mut self, line_color: Color, opacity: f32, grid_spacing: f32) {
        let changed = self.line_color != line_color
            || (self.opacity - opacity).abs() > 0.001
            || (self.grid_spacing - grid_spacing).abs() > 0.001;

        if changed {
            self.line_color = line_color;
            self.opacity = opacity;
            self.grid_spacing = grid_spacing;
            self.cache.clear();
        }
    }
    // DRY:WIDGET:clear_cache

    /// Clear the cache (call when window resizes)
    pub fn clear_cache(&mut self) {
        self.cache.clear();
    }
}

impl<Message> canvas::Program<Message> for PixelGrid {
    type State = ();

    fn draw(
        &self,
        _state: &Self::State,
        renderer: &Renderer,
        _theme: &Theme,
        bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> Vec<Geometry> {
        let geometry = self.cache.draw(renderer, bounds.size(), |frame| {
            draw_pixel_grid(
                frame,
                bounds.size(),
                self.line_color,
                self.opacity,
                self.grid_spacing,
            );
        });

        vec![geometry]
    }

    fn mouse_interaction(
        &self,
        _state: &Self::State,
        _bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> mouse::Interaction {
        // This is a purely visual overlay; never block interactions below it.
        mouse::Interaction::None
    }
}

/// Draw the pixel grid pattern on a frame
fn draw_pixel_grid(frame: &mut Frame, size: Size, base_color: Color, opacity: f32, spacing: f32) {
    let color = Color {
        a: opacity,
        ..base_color
    };
    let stroke = Stroke::default().with_width(0.5).with_color(color);

    // Vertical grid lines
    let mut x = 0.0;
    while x < size.width {
        let line = Path::line(Point::new(x, 0.0), Point::new(x, size.height));
        frame.stroke(&line, stroke);
        x += spacing;
    }

    // Horizontal grid lines
    let mut y = 0.0;
    while y < size.height {
        let line = Path::line(Point::new(0.0, y), Point::new(size.width, y));
        frame.stroke(&line, stroke);
        y += spacing;
    }
}

// ============================================================================
// Scanline Overlay
// ============================================================================

// DRY:WIDGET:ScanlineOverlay
/// Scanline overlay canvas widget
///
/// Draws alternating horizontal lines to simulate CRT monitor scanlines,
/// adding to the retro-futuristic aesthetic.
pub struct ScanlineOverlay {
    cache: Cache,
    line_color: Color,
    spacing: f32,
    opacity: f32,
}

impl ScanlineOverlay {
    // DRY:WIDGET:new
    /// Create a new scanline overlay
    ///
    /// # Arguments
    /// * `line_color` - Base color for scanlines (typically ink color from theme)
    /// * `opacity` - Opacity of scanlines (0.02-0.05 recommended)
    /// * `spacing` - Distance between scanlines in pixels (2-3 recommended)
    pub fn new(line_color: Color, opacity: f32, spacing: f32) -> Self {
        Self {
            cache: Cache::new(),
            line_color,
            spacing,
            opacity,
        }
    }
    // DRY:WIDGET:update

    /// Update the scanline parameters (useful for theme changes)
    pub fn update(&mut self, line_color: Color, opacity: f32, spacing: f32) {
        let changed = self.line_color != line_color
            || (self.opacity - opacity).abs() > 0.001
            || (self.spacing - spacing).abs() > 0.001;

        if changed {
            self.line_color = line_color;
            self.opacity = opacity;
            self.spacing = spacing;
            self.cache.clear();
        }
    }
    // DRY:WIDGET:clear_cache

    /// Clear the cache (call when window resizes)
    pub fn clear_cache(&mut self) {
        self.cache.clear();
    }
}

impl<Message> canvas::Program<Message> for ScanlineOverlay {
    type State = ();

    fn draw(
        &self,
        _state: &Self::State,
        renderer: &Renderer,
        _theme: &Theme,
        bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> Vec<Geometry> {
        let geometry = self.cache.draw(renderer, bounds.size(), |frame| {
            draw_scanlines(
                frame,
                bounds.size(),
                self.line_color,
                self.opacity,
                self.spacing,
            );
        });

        vec![geometry]
    }

    fn mouse_interaction(
        &self,
        _state: &Self::State,
        _bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> mouse::Interaction {
        // This is a purely visual overlay; never block interactions below it.
        mouse::Interaction::None
    }
}

/// Draw scanlines on a frame
fn draw_scanlines(frame: &mut Frame, size: Size, base_color: Color, opacity: f32, spacing: f32) {
    let color = Color {
        a: opacity,
        ..base_color
    };
    let stroke = Stroke::default().with_width(1.0).with_color(color);

    // Draw alternating horizontal lines
    let mut y = 0.0;
    while y < size.height {
        let line = Path::line(Point::new(0.0, y), Point::new(size.width, y));
        frame.stroke(&line, stroke);
        y += spacing;
    }
}

// ============================================================================
// Combined Overlay
// ============================================================================

// DRY:WIDGET:RetroOverlay
/// Combined pixel grid and scanline overlay
///
/// Provides both effects in a single widget for convenience.
pub struct RetroOverlay {
    pixel_grid: PixelGrid,
    scanlines: ScanlineOverlay,
}

impl RetroOverlay {
    // DRY:WIDGET:new
    /// Create a new combined retro overlay with theme-aware defaults
    ///
    /// # Arguments
    /// * `is_dark` - Whether to use dark mode colors
    /// * `ink_color` - The ink color from the current theme
    pub fn new(is_dark: bool, ink_color: Color) -> Self {
        // Theme-aware opacity values.
        // Slightly stronger than before for a more visible retro effect.
        let grid_opacity = if is_dark { 0.09 } else { 0.045 };
        let scanline_opacity = if is_dark { 0.06 } else { 0.03 };

        Self {
            pixel_grid: PixelGrid::new(ink_color, grid_opacity, 3.0),
            scanlines: ScanlineOverlay::new(ink_color, scanline_opacity, 2.0),
        }
    }
    // DRY:WIDGET:update

    /// Update for theme changes
    pub fn update(&mut self, is_dark: bool, ink_color: Color) {
        let grid_opacity = if is_dark { 0.09 } else { 0.045 };
        let scanline_opacity = if is_dark { 0.06 } else { 0.03 };

        self.pixel_grid.update(ink_color, grid_opacity, 3.0);
        self.scanlines.update(ink_color, scanline_opacity, 2.0);
    }
    // DRY:WIDGET:clear_cache

    /// Clear caches (call when window resizes)
    pub fn clear_cache(&mut self) {
        self.pixel_grid.clear_cache();
        self.scanlines.clear_cache();
    }
    // DRY:WIDGET:pixel_grid

    /// Get the pixel grid reference
    pub fn pixel_grid(&self) -> &PixelGrid {
        &self.pixel_grid
    }
    // DRY:WIDGET:scanlines

    /// Get the scanlines reference
    pub fn scanlines(&self) -> &ScanlineOverlay {
        &self.scanlines
    }
}

// ============================================================================
// Convenience Functions
// ============================================================================

// DRY:WIDGET:pixel_grid_overlay
/// Create a pixel grid overlay canvas widget
pub fn pixel_grid_overlay<'a, Message: 'a>(grid: &'a PixelGrid) -> Element<'a, Message> {
    Canvas::new(grid)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// DRY:WIDGET:scanline_overlay
/// Create a scanline overlay canvas widget
pub fn scanline_overlay<'a, Message: 'a>(scanlines: &'a ScanlineOverlay) -> Element<'a, Message> {
    Canvas::new(scanlines)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// DRY:WIDGET:retro_overlay
/// Create a combined retro overlay with both pixel grid and scanlines
///
/// Returns a stack of the two overlays for use with `iced::widget::stack`
pub fn retro_overlay<'a, Message: 'a>(overlay: &'a RetroOverlay) -> Vec<Element<'a, Message>> {
    vec![
        pixel_grid_overlay(overlay.pixel_grid()),
        scanline_overlay(overlay.scanlines()),
    ]
}
