//! Page transition animation widget
//!
//! Provides smooth crossfade transitions when navigating between pages.

use iced::{Color, Element};

/// Animation duration in seconds
const TRANSITION_DURATION: f32 = 0.25;

/// Transition state for page animations
#[derive(Debug, Clone)]
pub struct TransitionState {
    /// Progress from 0.0 to 1.0
    pub progress: f32,
    /// Whether a transition is currently in progress
    pub active: bool,
}

impl Default for TransitionState {
    fn default() -> Self {
        Self {
            progress: 1.0,
            active: false,
        }
    }
}

impl TransitionState {
    /// Start a new transition
    pub fn start() -> Self {
        Self {
            progress: 0.0,
            active: true,
        }
    }

    /// Update transition progress
    /// 
    /// # Arguments
    /// * `delta_seconds` - Time elapsed since last update
    /// 
    /// # Returns
    /// `true` if transition is complete, `false` otherwise
    pub fn update(&mut self, delta_seconds: f32) -> bool {
        if !self.active {
            return true;
        }

        self.progress += delta_seconds / TRANSITION_DURATION;
        
        if self.progress >= 1.0 {
            self.progress = 1.0;
            self.active = false;
            true
        } else {
            false
        }
    }

    /// Get the current opacity for fade-in effect
    /// Uses ease-out cubic easing for smooth animation
    pub fn opacity(&self) -> f32 {
        if !self.active {
            return 1.0;
        }
        
        // Ease-out cubic: 1 - (1-x)^3
        let t = self.progress.clamp(0.0, 1.0);
        1.0 - (1.0 - t).powi(3)
    }

    /// Get the inverse opacity for fade-out effect
    pub fn inverse_opacity(&self) -> f32 {
        if !self.active {
            return 0.0;
        }
        
        1.0 - self.opacity()
    }
}

/// Wrap content with fade-in transition effect
///
/// Note: Since Iced doesn't natively support opacity on containers,
/// this function modifies text colors to simulate fade effects.
/// For a more complete solution, consider using a custom widget with canvas rendering.
///
/// # Arguments
/// * `content` - The element to animate
/// * `transition` - Current transition state
///
/// # Returns
/// Element wrapped with fade animation
pub fn fade_in<'a, Message: 'a>(
    content: Element<'a, Message>,
    _transition: &TransitionState,
) -> Element<'a, Message> {
    // For now, return content as-is since Iced doesn't natively support
    // container opacity. The fade effect is primarily achieved through
    // adjusting text colors in the view functions.
    content
}

/// Apply fade color to text based on transition state
///
/// # Arguments
/// * `base_color` - The base text color
/// * `transition` - Current transition state
///
/// # Returns
/// Color with adjusted alpha for fade effect
pub fn fade_color(base_color: Color, transition: &TransitionState) -> Color {
    Color {
        a: base_color.a * transition.opacity(),
        ..base_color
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transition_start() {
        let state = TransitionState::start();
        assert_eq!(state.progress, 0.0);
        assert!(state.active);
    }

    #[test]
    fn test_transition_complete() {
        let mut state = TransitionState::start();
        let complete = state.update(1.0); // More than duration
        assert!(complete);
        assert_eq!(state.progress, 1.0);
        assert!(!state.active);
    }

    #[test]
    fn test_transition_partial() {
        let mut state = TransitionState::start();
        let complete = state.update(0.1); // Less than duration
        assert!(!complete);
        assert!(state.progress < 1.0);
        assert!(state.active);
    }

    #[test]
    fn test_opacity_easing() {
        let mut state = TransitionState::start();
        state.progress = 0.5;
        let opacity = state.opacity();
        assert!(opacity > 0.0 && opacity < 1.0);
        
        state.progress = 1.0;
        assert_eq!(state.opacity(), 1.0);
    }
}
