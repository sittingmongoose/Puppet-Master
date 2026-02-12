// Paper Grain Shader - Subtle paper texture effect
// Adapted from Pixel_Transparency RetroArch shader concepts

struct Uniforms {
    resolution: vec2<f32>,
    time: f32,
    is_dark: f32,  // 0.0 = light mode, 1.0 = dark mode
    base_color: vec4<f32>,
    grain_intensity: f32,
    _padding: vec3<f32>,
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

// Hash function for pseudo-random noise generation
fn hash(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 = p3 + vec3<f32>(dot(p3, vec3<f32>(p3.y + 33.33, p3.z + 33.33, p3.x + 33.33)));
    return fract((p3.x + p3.y) * p3.z);
}

// Multi-octave paper noise function
// Generates realistic paper grain texture using multiple noise frequencies
fn paper_noise(uv: vec2<f32>, scale: f32) -> f32 {
    let p = uv * scale * 512.0;
    var n = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    
    // Three octaves of noise for detailed grain
    n += hash(p * frequency) * amplitude;
    amplitude *= 0.5; frequency *= 2.0;
    n += hash(p * frequency) * amplitude;
    amplitude *= 0.5; frequency *= 2.0;
    n += hash(p * frequency) * amplitude;
    
    return n;
}

@fragment
fn fs_main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = position.xy / uniforms.resolution;
    
    // Generate paper grain noise
    let grain = paper_noise(uv, 0.25);
    
    // Apply grain offset to base color
    // Centered around 0 with configurable intensity
    let grain_offset = (grain - 0.4375) * uniforms.grain_intensity;
    let color = uniforms.base_color.rgb + vec3<f32>(grain_offset);
    
    // Clamp to valid color range
    return vec4<f32>(clamp(color, vec3<f32>(0.0), vec3<f32>(1.0)), uniforms.base_color.a);
}
