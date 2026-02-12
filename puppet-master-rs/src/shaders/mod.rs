//! GPU-accelerated visual effects using WGSL shaders
//! 
//! This module provides shader-based visual effects for the Iced GUI,
//! adapted from RetroArch shader concepts (Pixel_Transparency) to WGSL.
//! 
//! # Shaders
//! 
//! - **Paper Grain** - Subtle paper texture effect for backgrounds
//! - **Scanline** - CRT/LCD scanline overlay for terminal widgets
//! - **Theme Fizzle** - Dissolve transition effect for theme changes
//! 
//! # Note
//! 
//! These shaders require the Iced wgpu backend (enabled by default).
//! The shader implementations use custom WGSL code for GPU-accelerated effects.
//! 
//! # Performance
//! 
//! All shaders are GPU-accelerated and optimized for real-time rendering.
//! They use minimal uniform data and efficient WGSL code for zero-copy operations.

pub mod paper_grain;
pub mod scanline;
pub mod theme_fizzle;

// Re-export WGSL shader sources
pub use paper_grain::{PAPER_GRAIN_SHADER, PaperGrainUniforms};
pub use scanline::{SCANLINE_SHADER, ScanlineUniforms};
pub use theme_fizzle::{THEME_FIZZLE_SHADER, ThemeFizzleUniforms};
