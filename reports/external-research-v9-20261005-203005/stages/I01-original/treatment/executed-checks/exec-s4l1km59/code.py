
import json, struct

def f32(x):
    return struct.unpack('<f', struct.pack('<f', x))[0]

results = {}

# 1) Float64 physical coordinate JSON round-trip (stage origin + anisotropic pixel size)
origin_um = {'x': 74000.5, 'y': -12345.25, 'z': 0.0}
scale_um  = {'x': 0.645,  'y': 0.325,    'z': 2.5}
idx       = {'x': 1023,   'y': 2047,    'z': 365}
phys = [origin_um[a] + scale_um[a] * idx[a] for a in ('z', 'y', 'x')]
rt = json.loads(json.dumps(phys))
results['phys_um'] = phys
results['float64_json_roundtrip_exact'] = (rt == phys)

# 2) Float32 storage of a large pixel index loses integer precision (2**24 + 1)
big = 16777217
results['big_index'] = big
results['big_index_as_float32'] = f32(big)
results['float32_lossy_for_big_index'] = (f32(big) != big)

# 3) Axis-order consistency: canonical TCZYX storage -> zyx view
sc = {'t': 1.0, 'c': 1.0, 'z': 0.5, 'y': 0.325, 'x': 0.645}  # per-axis scale
di = {'t': 3,   'c': 1,   'z': 7,   'y': 512,   'x': 900}    # annotation vertex index
correct = (di['z'] * sc['z'], di['y'] * sc['y'], di['x'] * sc['x'])
buggy   = (di['z'] * sc['z'], di['y'] * sc['x'], di['x'] * sc['y'])  # classic y/x scale swap
err_um  = ((buggy[1]-correct[1])**2 + (buggy[2]-correct[2])**2) ** 0.5
results['correct_world_um'] = correct
results['swapped_yx_world_um'] = buggy
results['swap_error_um'] = err_um
results['swap_detectable_with_anisotropic_pixels'] = err_um > 0

# 4) Unit normalization; unitless 'px' must be flagged for an explicit user choice
canon = {'µm': 'micrometer', 'um': 'micrometer', 'micrometer': 'micrometer',
         'micron': 'micrometer', 'microns': 'micrometer',
         'nm': 'nanometer', 'mm': 'millimeter', 'millimeter': 'millimeter'}
units_in = ['µm', 'um', 'micrometer', 'micron', 'nm', 'mm', 'px']
results['unit_normalization'] = {u: canon.get(u) for u in units_in}
results['unitless_flagged'] = canon.get('px') is None

print(json.dumps(results, indent=1))
print("EXIT_OK")
