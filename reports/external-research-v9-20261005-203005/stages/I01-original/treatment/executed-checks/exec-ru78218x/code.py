
import json, struct

def f32(x):
    return struct.unpack('<f', struct.pack('<f', x))[0]

results = {}

# 1) Float64 physical coordinate JSON round-trip
origin_um = data['origin_um']          # stage origin, micrometers
scale_um  = data['scale_um_per_px']    # anisotropic pixel size
idx       = data['index_px']
phys = [origin_um[a] + scale_um[a] * idx[a] for a in ('z', 'y', 'x')]
rt = json.loads(json.dumps(phys))
results['float64_json_roundtrip_exact'] = (rt == phys)
results['phys_um'] = phys

# 2) Float32 storage of a large pixel index loses integer precision
big = data['big_index']  # 2**24 + 1
results['big_index'] = big
results['big_index_as_float32'] = f32(big)
results['float32_lossy_for_big_index'] = (f32(big) != big)

# 3) Axis-order consistency: canonical TCZYX storage -> zyx view
axes = data['axes']                    # ['t','c','z','y','x']
sc = dict(zip(axes, data['scale']))    # per-axis scale, physical units
di = dict(zip(axes, data['data_idx'])) # sample index of an annotation vertex
correct = (di['z'] * sc['z'], di['y'] * sc['y'], di['x'] * sc['x'])
# classic transpose bug: y/x scales swapped when rendering the zyx view
buggy   = (di['z'] * sc['z'], di['y'] * sc['x'], di['x'] * sc['y'])
err_um  = ((buggy[1]-correct[1])**2 + (buggy[2]-correct[2])**2) ** 0.5
results['correct_world_um'] = correct
results['swapped_yx_world_um'] = buggy
results['swap_error_um'] = err_um
results['swap_detectable'] = err_um > 0

# 4) Unit normalization table; unknown/unitless flagged for explicit choice
unit_table = {}
for u in data['units_in']:
    key = u.strip()
    canon = {'µm': 'micrometer', 'um': 'micrometer', 'micrometer': 'micrometer',
             'micron': 'micrometer', 'microns': 'micrometer',
             'nm': 'nanometer', 'millimeter': 'millimeter', 'mm': 'millimeter'}.get(key)
    unit_table[u] = canon
results['unit_normalization'] = unit_table
results['unitless_flagged'] = unit_table.get('px') is None

print(json.dumps(results, indent=1))
print("EXIT_OK")
