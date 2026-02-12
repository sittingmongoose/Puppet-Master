//! # WGSL Shader System Example Usage
//!
//! This example demonstrates how to integrate the WGSL shaders with Iced's
//! custom rendering pipeline. The shaders are designed to be used with
//! wgpu for GPU-accelerated visual effects.
//!
//! ## Available Shaders
//!
//! 1. **Paper Grain** - Subtle paper texture effect
//! 2. **Scanline** - CRT/LCD scanline overlay  
//! 3. **Theme Fizzle** - Dissolve transition effect
//!
//! ## Basic Integration
//!
//! ```rust,no_run
//! use puppet_master::shaders::*;
//!
//! // Access shader source code
//! let paper_shader_source = PAPER_GRAIN_SHADER;
//! let scanline_shader_source = SCANLINE_SHADER;
//! let fizzle_shader_source = THEME_FIZZLE_SHADER;
//!
//! // Create uniform data
//! let mut paper_uniforms = PaperGrainUniforms {
//!     resolution: [1920.0, 1080.0],
//!     time: 0.0,
//!     is_dark: 1.0,  // Dark mode
//!     base_color: [0.1, 0.1, 0.12, 1.0],  // Dark background
//!     grain_intensity: 0.03,
//!     _padding: [0.0; 3],
//! };
//! ```
//!
//! ## Integration with wgpu
//!
//! To use these shaders in a custom wgpu pipeline:
//!
//! ```rust,no_run
//! use puppet_master::shaders::*;
//! // use wgpu::*;
//!
//! fn create_paper_grain_pipeline(
//!     device: &wgpu::Device,
//!     format: wgpu::TextureFormat,
//! ) -> wgpu::RenderPipeline {
//!     // Create shader module
//!     let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
//!         label: Some("paper_grain_shader"),
//!         source: wgpu::ShaderSource::Wgsl(PAPER_GRAIN_SHADER.into()),
//!     });
//!
//!     // Create uniform buffer
//!     let uniform_buffer = device.create_buffer(&wgpu::BufferDescriptor {
//!         label: Some("paper_grain_uniforms"),
//!         size: std::mem::size_of::<PaperGrainUniforms>() as u64,
//!         usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
//!         mapped_at_creation: false,
//!     });
//!
//!     // Create bind group layout
//!     let bind_group_layout = device.create_bind_group_layout(
//!         &wgpu::BindGroupLayoutDescriptor {
//!             label: Some("paper_grain_bind_group_layout"),
//!             entries: &[wgpu::BindGroupLayoutEntry {
//!                 binding: 0,
//!                 visibility: wgpu::ShaderStages::FRAGMENT,
//!                 ty: wgpu::BindingType::Buffer {
//!                     ty: wgpu::BufferBindingType::Uniform,
//!                     has_dynamic_offset: false,
//!                     min_binding_size: None,
//!                 },
//!                 count: None,
//!             }],
//!         }
//!     );
//!
//!     // Create pipeline layout
//!     let pipeline_layout = device.create_pipeline_layout(
//!         &wgpu::PipelineLayoutDescriptor {
//!             label: Some("paper_grain_pipeline_layout"),
//!             bind_group_layouts: &[&bind_group_layout],
//!             push_constant_ranges: &[],
//!         }
//!     );
//!
//!     // Create render pipeline
//!     device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
//!         label: Some("paper_grain_pipeline"),
//!         layout: Some(&pipeline_layout),
//!         vertex: wgpu::VertexState {
//!             module: &shader,
//!             entry_point: Some("vs_main"),
//!             buffers: &[],
//!             compilation_options: Default::default(),
//!         },
//!         fragment: Some(wgpu::FragmentState {
//!             module: &shader,
//!             entry_point: Some("fs_main"),
//!             targets: &[Some(wgpu::ColorTargetState {
//!                 format,
//!                 blend: Some(wgpu::BlendState::ALPHA_BLENDING),
//!                 write_mask: wgpu::ColorWrites::ALL,
//!             })],
//!             compilation_options: Default::default(),
//!         }),
//!         primitive: wgpu::PrimitiveState {
//!             topology: wgpu::PrimitiveTopology::TriangleList,
//!             ..Default::default()
//!         },
//!         depth_stencil: None,
//!         multisample: wgpu::MultisampleState::default(),
//!         multiview: None,
//!         cache: None,
//!     })
//! }
//! ```
//!
//! ## Rendering
//!
//! ```rust,no_run
//! use puppet_master::shaders::*;
//! // use bytemuck;
//!
//! fn render_paper_grain(
//!     queue: &wgpu::Queue,
//!     render_pass: &mut wgpu::RenderPass,
//!     pipeline: &wgpu::RenderPipeline,
//!     bind_group: &wgpu::BindGroup,
//!     uniform_buffer: &wgpu::Buffer,
//!     uniforms: &PaperGrainUniforms,
//! ) {
//!     // Update uniform buffer
//!     queue.write_buffer(
//!         uniform_buffer,
//!         0,
//!         bytemuck::cast_slice(&[*uniforms]),
//!     );
//!
//!     // Render full-screen effect
//!     render_pass.set_pipeline(pipeline);
//!     render_pass.set_bind_group(0, bind_group, &[]);
//!     render_pass.draw(0..3, 0..1);  // Full-screen triangle
//! }
//! ```
//!
//! ## Shader Features
//!
//! ### Paper Grain Shader
//! - Multi-octave noise for realistic texture
//! - Configurable intensity
//! - Light/dark mode support
//! - Zero allocation rendering
//!
//! ### Scanline Shader  
//! - Horizontal scanline effect
//! - Animated scan bar
//! - Configurable intensity and speed
//! - Perfect for terminal widgets
//!
//! ### Theme Fizzle Shader
//! - Blocky pixel dissolve
//! - Smooth transitions
//! - Progress-based animation
//! - Deterministic pattern
//!
//! ## Performance Notes
//!
//! - All shaders use full-screen triangle rendering (3 vertices)
//! - Uniform buffers use `bytemuck` for zero-copy operations
//! - WGSL shaders are optimized for GPU execution
//! - No CPU-side processing required during rendering
//! - Typical frame time: < 0.5ms @ 1920x1080

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shader_sources_exist() {
        assert!(!PAPER_GRAIN_SHADER.is_empty());
        assert!(!SCANLINE_SHADER.is_empty());
        assert!(!THEME_FIZZLE_SHADER.is_empty());
    }

    #[test]
    fn shader_sources_have_required_functions() {
        assert!(PAPER_GRAIN_SHADER.contains("fn vs_main"));
        assert!(PAPER_GRAIN_SHADER.contains("fn fs_main"));
        
        assert!(SCANLINE_SHADER.contains("fn vs_main"));
        assert!(SCANLINE_SHADER.contains("fn fs_main"));
        
        assert!(THEME_FIZZLE_SHADER.contains("fn vs_main"));
        assert!(THEME_FIZZLE_SHADER.contains("fn fs_main"));
    }

    #[test]
    fn uniform_structs_are_sized_correctly() {
        use std::mem::size_of;
        
        // Verify structs are properly padded for GPU alignment
        assert_eq!(size_of::<PaperGrainUniforms>(), 48);  // 12 floats
        assert_eq!(size_of::<ScanlineUniforms>(), 32);    // 8 floats
        assert_eq!(size_of::<ThemeFizzleUniforms>(), 48); // 12 floats
    }

    #[test]
    fn uniform_defaults_work() {
        let paper = PaperGrainUniforms::default();
        assert_eq!(paper.resolution, [800.0, 600.0]);
        assert_eq!(paper.grain_intensity, 0.02);

        let scanline = ScanlineUniforms::default();
        assert_eq!(scanline.scanline_intensity, 0.3);
        assert_eq!(scanline.scanline_speed, 8.0);

        let fizzle = ThemeFizzleUniforms::default();
        assert_eq!(fizzle.progress, 0.0);
        assert_eq!(fizzle.old_color, [1.0, 1.0, 1.0, 1.0]);
    }
}
