//! Scaled design tokens — single source for UI scale multiplication.
//!
//! All scale multiplication for layout/typography must go through this module
//! so the codebase stays DRY. Base values come from [crate::theme::tokens];
//! this layer only multiplies by the user's `ui_scale` factor.

// DRY:DATA:ScaledTokens
/// Scale factor applied to spacing, font size, and layout token values.
/// Use `.spacing(base)`, `.font_size(base)`, and `.layout(base)` instead of
/// multiplying by scale manually anywhere else.
#[derive(Debug, Clone, Copy)]
pub struct ScaledTokens {
    pub scale: f32,
}

impl ScaledTokens {
    // DRY:FN:ScaledTokens::new
    pub fn new(scale: f32) -> Self {
        Self {
            scale: scale.clamp(0.5, 1.5),
        }
    }

    // DRY:FN:ScaledTokens::spacing
    /// Scaled spacing (padding, gaps). Pass base from `tokens::spacing::*`.
    #[inline]
    pub fn spacing(&self, base: f32) -> f32 {
        base * self.scale
    }

    // DRY:FN:ScaledTokens::font_size
    /// Scaled font size. Pass base from `tokens::font_size::*`.
    #[inline]
    pub fn font_size(&self, base: f32) -> f32 {
        base * self.scale
    }

    // DRY:FN:ScaledTokens::layout
    /// Scaled layout dimension. Pass base from `tokens::layout::*`.
    #[inline]
    pub fn layout(&self, base: f32) -> f32 {
        base * self.scale
    }
}

impl Default for ScaledTokens {
    fn default() -> Self {
        Self { scale: 1.0 }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::theme::tokens;

    #[test]
    fn scaled_tokens_multiply_base() {
        let s = ScaledTokens::new(0.9);
        assert_eq!(s.spacing(tokens::spacing::MD), 16.0 * 0.9);
        assert_eq!(s.font_size(tokens::font_size::BASE), 15.0 * 0.9);
        assert_eq!(s.layout(tokens::layout::FORM_LABEL_WIDTH), 150.0 * 0.9);
    }

    #[test]
    fn scale_clamped() {
        let s = ScaledTokens::new(2.0);
        assert_eq!(s.scale, 1.5);
        let s = ScaledTokens::new(0.1);
        assert_eq!(s.scale, 0.5);
    }
}
