// Theme Fizzle Shader - Dissolve transition effect for theme changes
// Creates a blocky pixel dissolve between two colors

struct Uniforms {
    resolution: vec2<f32>,
    progress: f32,  // 0.0 to 1.0 transition progress
    _padding1: f32,
    old_color: vec4<f32>,
    new_color: vec4<f32>,
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

// Vertex shader - generates full-screen triangle
@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4<f32> {
    // Full-screen triangle covering NDC space
    let x = f32((vertex_index << 1u) & 2u) * 2.0 - 1.0;
    let y = f32(vertex_index & 2u) * 2.0 - 1.0;
    return vec4<f32>(x, -y, 0.0, 1.0);
}

// 2D hash function for consistent random pattern
fn hash2d(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, vec3<f32>(p3.y + 33.33, p3.z + 33.33, p3.x + 33.33));
    return fract((p3.x + p3.y) * p3.z);
}

@fragment
fn fs_main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    // Blocksize for dissolve pixels
    let pixel_size = 4.0;
    
    // Quantize position to blocks
    let block = floor(position.xy / pixel_size);
    let noise = hash2d(block);
    
    // Each block dissolves at different threshold based on its noise value
    // As progress increases, more blocks switch from old to new color
    if noise < uniforms.progress {
        return uniforms.new_color;
    } else {
        return uniforms.old_color;
    }
}
