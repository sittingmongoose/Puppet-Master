//! Paper grain texture background widget using canvas
//!
//! Recreates the signature "paper grain" texture effect from the original Tauri GUI
//! with subtle repeating gradient stripes at very low opacity.

use iced::widget::canvas::{self, Canvas, Cache, Frame, Geometry, Path, Stroke};
use iced::{Color, Element, Length, Point, Rectangle, Renderer, Theme};
use iced::mouse;

/// Paper texture canvas widget state
pub struct PaperTexture {
    cache: Cache,
    is_dark: bool,
}

impl PaperTexture {
    /// Create a new paper texture with light/dark mode
    pub fn new(is_dark: bool) -> Self {
        Self {
            cache: Cache::new(),
            is_dark,
        }
    }
}

impl<Message> canvas::Program<Message> for PaperTexture {
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
            draw_paper_texture(frame, bounds, self.is_dark);
        });

        vec![geometry]
    }
}

/// Draw the paper texture pattern on a frame
fn draw_paper_texture(frame: &mut Frame, bounds: Rectangle, is_dark: bool) {
    // Draw subtle vertical stripes (every 4px, very low opacity)
    let stripe_color = if is_dark {
        Color::from_rgba(1.0, 1.0, 1.0, 0.015)
    } else {
        Color::from_rgba(0.0, 0.0, 0.0, 0.02)
    };
    
    let mut x = 0.0;
    while x < bounds.width {
        let line = Path::line(
            Point::new(x, 0.0),
            Point::new(x, bounds.height),
        );
        frame.stroke(
            &line,
            Stroke::default()
                .with_width(1.0)
                .with_color(stripe_color),
        );
        x += 4.0;
    }
    
    // Draw subtle horizontal stripes (every 2px, even lower opacity)
    let h_stripe_color = if is_dark {
        Color::from_rgba(1.0, 1.0, 1.0, 0.008)
    } else {
        Color::from_rgba(0.0, 0.0, 0.0, 0.01)
    };
    
    let mut y = 0.0;
    while y < bounds.height {
        let line = Path::line(
            Point::new(0.0, y),
            Point::new(bounds.width, y),
        );
        frame.stroke(
            &line,
            Stroke::default()
                .with_width(1.0)
                .with_color(h_stripe_color),
        );
        y += 2.0;
    }
}

/// Create a canvas widget with paper texture
/// 
/// # Arguments
/// * `is_dark` - Whether to use dark mode texture (lighter stripes) or light mode (darker stripes)
/// 
/// # Example
/// ```
/// use puppet_master::widgets::paper_texture::paper_texture;
/// 
/// let texture = paper_texture(false); // Light mode
/// ```
pub fn paper_texture<'a, Message: 'a>(is_dark: bool) -> Element<'a, Message> {
    Canvas::new(PaperTexture::new(is_dark))
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
